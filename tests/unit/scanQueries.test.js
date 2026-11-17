/**
 * IMP-37 — o scan faz UMA varredura do DOM por lista de seletores e devolve o mesmo
 * resultado do algoritmo antigo (um querySelectorAll por seletor).
 *
 * As funções `referencia*` são o algoritmo ANTERIOR, copiado só para comparação.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import defaults from '../../src/config/defaults.js';
import { scoreElement } from '../../src/heuristics/scoring.js';
import { detectMainContent } from '../../src/heuristics/contentDetector.js';
import { detectDistractions } from '../../src/heuristics/distractionDetector.js';
import { queryAll } from '../../src/heuristics/queryAll.js';
import { installHappy } from './helpers/happyEnv.js';

let env;
beforeEach(() => {
  env = installHappy();
});
afterEach(() => env.restore());

const texto = (n) => 'Texto de conteúdo denso. '.repeat(n);

const PAGES = {
  'página rica': `
    <header class="topo"><nav>menu</nav></header>
    <div class="cookie-banner">cookies</div>
    <div class="popup-promo">promo</div>
    <main><h1>T</h1><p>${texto(30)}</p><aside>dentro do main</aside><iframe></iframe></main>
    <aside class="sidebar">lateral</aside>
    <div class="carousel-x">c</div>
    <footer>rodapé</footer>
    <iframe title="externo"></iframe>`,
  'sem main (div soup)': `
    <div class="content"><h1>T</h1><p>${texto(30)}</p></div>
    <div class="ad">anúncio</div><nav>n</nav>`,
  'article antes de main com mesma nota': `
    <article id="a"><h1>A</h1><p>${texto(30)}</p></article>
    <main id="m"><h1>M</h1><p>${texto(30)}</p></main>`,
  'main dentro de article': `
    <article><main><h1>T</h1><p>${texto(30)}</p></main></article>`,
  vazia: '<p>nada</p>',
};

function referenciaDistracoes(mainElement, config) {
  const out = [];
  for (const selector of config.distractionSelectors) {
    let matches;
    try {
      matches = document.querySelectorAll(selector);
    } catch (_) {
      continue;
    }
    matches.forEach((el) => {
      if (
        el.closest(
          '#ms-container, #ms-session-bar, #ms-simples-chrome, [data-ms-pills]',
        )
      )
        return;
      if (mainElement && el.contains(mainElement)) return;
      if (mainElement && mainElement.contains(el)) return;
      if (!out.includes(el)) out.push(el);
    });
  }
  return out;
}

function referenciaMain(config) {
  const scored = [];
  for (const selector of config.mainSelectors) {
    let matches;
    try {
      matches = document.querySelectorAll(selector);
    } catch (_) {
      continue;
    }
    matches.forEach((el) => {
      if (scored.some((s) => s.element === el)) return;
      scored.push({ element: el, score: scoreElement(el, config) });
    });
  }
  if (scored.length === 0) return { element: document.body, confidence: 0 };
  scored.sort((a, b) => b.score - a.score);
  const { scoring } = config;
  const ideal =
    scoring.mainTagBonus + scoring.h1Bonus + scoring.textLengthBonus * 2;
  return {
    element: scored[0].element,
    confidence: Math.min(scored[0].score / ideal, 1),
  };
}

/** Conta chamadas a document.querySelectorAll durante fn(). */
function contarConsultas(fn) {
  const original = document.querySelectorAll.bind(document);
  let n = 0;
  document.querySelectorAll = (...args) => {
    n += 1;
    return original(...args);
  };
  try {
    fn();
  } finally {
    document.querySelectorAll = original;
  }
  return n;
}

describe('resultado igual ao algoritmo antigo (IMP-37)', () => {
  for (const [nome, html] of Object.entries(PAGES)) {
    it(`main + distrações: ${nome}`, () => {
      document.body.innerHTML = html;
      const novo = detectMainContent(defaults);
      const antigo = referenciaMain(defaults);
      assert.equal(novo.element, antigo.element);
      assert.equal(novo.confidence, antigo.confidence);

      const dNovo = detectDistractions(novo.element, defaults);
      const dAntigo = referenciaDistracoes(antigo.element, defaults);
      assert.deepEqual(new Set(dNovo), new Set(dAntigo));
      assert.equal(dNovo.length, dAntigo.length); // sem duplicatas
    });
  }

  it('seletor inválido na lista: os válidos continuam valendo', () => {
    document.body.innerHTML = PAGES['página rica'];
    const cfg = {
      ...defaults,
      distractionSelectors: ['::inválido:::', 'footer', '.ad'],
    };
    const main = document.querySelector('main');
    const novo = detectDistractions(main, cfg);
    assert.deepEqual(new Set(novo), new Set(referenciaDistracoes(main, cfg)));
    assert.ok(novo.some((el) => el.tagName === 'FOOTER'));
  });

  it('chrome da lib continua protegido', () => {
    document.body.innerHTML =
      '<main><h1>T</h1></main><div id="ms-session-bar" class="ad">barra</div><nav data-ms-pills>p</nav>';
    const main = document.querySelector('main');
    const ids = detectDistractions(main, defaults).map(
      (el) => el.id || el.tagName,
    );
    assert.ok(!ids.includes('ms-session-bar'));
    assert.ok(!ids.includes('NAV'));
  });
});

describe('menos varreduras (IMP-37)', () => {
  it('detectDistractions faz 1 consulta (antes: uma por seletor)', () => {
    document.body.innerHTML = PAGES['página rica'];
    const main = document.querySelector('main');
    const n = contarConsultas(() => detectDistractions(main, defaults));
    assert.equal(n, 1);
    assert.ok(defaults.distractionSelectors.length > 10);
  });

  it('detectMainContent faz 1 consulta (antes: uma por seletor)', () => {
    document.body.innerHTML = PAGES['página rica'];
    const n = contarConsultas(() => detectMainContent(defaults));
    assert.equal(n, 1);
    assert.ok(defaults.mainSelectors.length > 5);
  });

  it('com seletor inválido o fallback por seletor ainda funciona (n+1 consultas, sem lançar)', () => {
    document.body.innerHTML = '<footer>f</footer>';
    const sels = ['::inválido:::', 'footer'];
    assert.deepEqual(
      queryAll(sels).map((e) => e.tagName),
      ['FOOTER'],
    );
  });

  it('queryAll de lista vazia/inválida não consulta nada', () => {
    const n = contarConsultas(() => {
      assert.deepEqual(queryAll([]), []);
      assert.deepEqual(queryAll(undefined), []);
    });
    assert.equal(n, 0);
  });
});
