/**
 * A-04 + Q14 — painel de acessibilidade (a11yPanel), FAB e escaping dos caminhos com innerHTML.
 *
 * Regra do projeto: nenhum dado do host/config entra por innerHTML; textos de marca,
 * rótulos de pills etc. entram por textContent. Os testes abaixo travam essa regra.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { createA11yPanel } from '../../src/ui/a11yPanel.js';
import { createFab } from '../../src/ui/fab.js';
import { createSimpleNav } from '../../src/features/simpleNav.js';
import { installHappy } from './helpers/happyEnv.js';

let env;
let calls;

const XSS =
  '<img src=x onerror="window.__xss=1"><script>window.__xss=1</script>';

const estado = (over = {}) => ({
  modoSimples: false,
  panelOpen: false,
  options: {
    textScale: '100',
    colorTheme: 'senac',
    dyslexiaFont: false,
    readingRuler: false,
    highlightLinks: false,
    textSpacing: false,
    reducedMotion: false,
    hideImages: false,
    simpleLanguage: false,
    ...over,
  },
});

function montarPainel(extra = {}) {
  const panel = createA11yPanel({
    state: estado(),
    onClose: () => calls.push(['close']),
    onToggleModoSimples: (v) => calls.push(['modo', v]),
    onSetOption: (k, v) => calls.push(['opt', k, v]),
    onSpeak: () => calls.push(['speak']),
    ...extra,
  });
  document.body.appendChild(panel.element);
  return panel;
}

beforeEach(() => {
  env = installHappy();
  calls = [];
  delete globalThis.window.__xss;
});
afterEach(() => env.restore());

describe('createA11yPanel', () => {
  it('nasce oculto, com role=dialog e aria-modal', () => {
    const { element } = montarPainel();
    assert.equal(element.hidden, true);
    assert.equal(element.getAttribute('role'), 'dialog');
    assert.equal(element.getAttribute('aria-modal'), 'true');
    assert.equal(element.getAttribute('aria-labelledby'), 'ms-a11y-title');
  });

  it('open() mostra e leva o foco ao botão fechar; close() oculta', () => {
    const panel = montarPainel();
    panel.open();
    assert.equal(panel.element.hidden, false);
    assert.ok(document.activeElement.classList.contains('ms-a11y-close'));
    panel.close();
    assert.equal(panel.element.hidden, true);
  });

  it('botão fechar chama onClose', () => {
    const panel = montarPainel();
    panel.element.querySelector('.ms-a11y-close').click();
    assert.deepEqual(calls, [['close']]);
  });

  it('switch do Modo Simples chama onToggleModoSimples(true)', () => {
    const panel = montarPainel();
    panel.element.querySelector('[data-action="modo-simples"]').click();
    assert.deepEqual(calls, [['modo', true]]);
  });

  it('switches de opção e escalas chamam onSetOption', () => {
    const panel = montarPainel();
    panel.element
      .querySelector('.ms-switch[data-option="dyslexiaFont"]')
      .click();
    panel.element
      .querySelector('[data-option="textScale"] .ms-segment[data-value="125"]')
      .click();
    panel.element
      .querySelector(
        '[data-option="colorTheme"] .ms-theme-btn[data-value="soft"]',
      )
      .click();
    assert.deepEqual(calls, [
      ['opt', 'dyslexiaFont', true],
      ['opt', 'textScale', '125'],
      ['opt', 'colorTheme', 'soft'],
    ]);
  });

  it('sync() reflete estado nos controles (aria-checked)', () => {
    const panel = montarPainel();
    panel.sync(
      estado({ textScale: '150', colorTheme: 'darkHigh', dyslexiaFont: true }),
    );
    const q = (s) => panel.element.querySelector(s);
    assert.equal(
      q('[data-option="textScale"] [data-value="150"]').getAttribute(
        'aria-checked',
      ),
      'true',
    );
    assert.equal(
      q('[data-option="textScale"] [data-value="100"]').getAttribute(
        'aria-checked',
      ),
      'false',
    );
    assert.equal(
      q('[data-option="colorTheme"] [data-value="darkHigh"]').getAttribute(
        'aria-checked',
      ),
      'true',
    );
    assert.equal(
      q('.ms-switch[data-option="dyslexiaFont"]').getAttribute('aria-checked'),
      'true',
    );
  });
});

describe('FAB', () => {
  it('clique chama onClick; sync atualiza aria-expanded', () => {
    let cliques = 0;
    const fab = createFab({ onClick: () => (cliques += 1) });
    document.body.appendChild(fab.element);
    fab.button.click();
    assert.equal(cliques, 1);
    fab.sync({ panelOpen: true });
    assert.equal(fab.button.getAttribute('aria-expanded'), 'true');
    fab.sync({ panelOpen: false });
    assert.equal(fab.button.getAttribute('aria-expanded'), 'false');
  });
});

/**
 * Guarda estática dos templates do painel (renderSection/CONTROLS/switchTile/...): lista cada
 * `${expr}` (inclusive aninhados) fora da lista permitida. Expressões externas com templates
 * aninhados só passam no formato exato conhecido (o aninhado é checado por si).
 */
const ALLOWED_PANEL_EXPR = [
  /^S\.\w+$/, // textos estáticos de ui/strings.js
  /^(CHECK|CHEVRON|SLIDERS_ICON)$/, // ícones
  /^svgIcon\('[^'`$]*'\)$/,
  /^radioHead\('[\w-]+', S\.\w+, '\w+'\)$/, // id literal, título estático, chave da opção
  /^(option|id|title|label|desc|icon|inner|open|key)$/, // parâmetros dos helpers
  /^sec\.(id|title|icon)$/,
  /^[st]\.(value|label|title|sub)$/, // TEXT_SCALES / COLOR_THEMES
  /^CONTROLS\[k\]\.html$/,
  /^blocks\.join\(''\)$/,
  /^SECTIONS\.map\(renderSection\)\.join\(''\)$/,
  /^open \? '' : ' hidden'$/,
  /^desc \? `[^`$]*` : ''$/, // externo com aninhado: formato exato
  /^(TEXT_SCALES|COLOR_THEMES)\.map\(\s*\([st]\) => `[^`$]*`,?\s*\)\.join\(''\)$/,
];

/** Todas as expressões `${...}` do texto; nas externas, as aninhadas somem (são listadas à parte). */
function panelExprs(src) {
  const out = [];
  const scan = (s) => {
    let stripped = '';
    let i = 0;
    while (i < s.length) {
      if (s[i] === '$' && s[i + 1] === '{') {
        let depth = 1;
        let j = i + 2;
        while (j < s.length && depth) {
          if (s[j] === '{') depth++;
          else if (s[j] === '}') depth--;
          j++;
        }
        out.push(scan(s.slice(i + 2, j - 1)).trim());
        i = j;
      } else {
        stripped += s[i++];
      }
    }
    return stripped;
  };
  scan(src);
  return out;
}

const offendersOf = (src) =>
  panelExprs(src).filter((e) => !ALLOWED_PANEL_EXPR.some((re) => re.test(e)));

describe('escaping (Q14): templates do painel (F6 QA M1)', () => {
  it('renderSection/CONTROLS/switchTile só interpolam constantes internas', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const src = fs.readFileSync(
      path.resolve(import.meta.dirname, '../../src/ui/a11yPanel.js'),
      'utf8',
    );
    // do primeiro helper de template até o fim do innerHTML do painel (antes dos textContent)
    const ini = src.indexOf('const svgIcon');
    const fim = src.indexOf('// Textos de marca');
    assert.ok(ini > 0 && fim > ini);
    const trecho = src.slice(ini, fim);
    assert.ok(
      panelExprs(trecho).length > 20,
      'a guarda precisa enxergar os templates',
    );
    assert.deepEqual(offendersOf(trecho), []);
  });

  it('autoteste: a guarda pega interpolação de variável do host', () => {
    assert.deepEqual(offendersOf('x = `<b>${host.x}</b>`'), ['host.x']);
    assert.deepEqual(offendersOf("x = `${desc ? host.x : ''}`"), [
      "desc ? host.x : ''",
    ]);
    assert.deepEqual(
      offendersOf("x = `${desc ? `<i>${config.brand}</i>` : ''}`"),
      ['config.brand'],
    );
    assert.deepEqual(
      offendersOf('x = `<b>${S.panelSimpleTitle}</b>${CHECK}`'),
      [],
    );
  });
});

describe('escaping (Q14): strings de config/host nunca viram HTML', () => {
  it('config.brand entra como texto no painel', () => {
    const panel = montarPainel({
      brand: { title: XSS, subtitle: XSS, footer: XSS },
    });
    const el = panel.element;
    assert.equal(el.querySelector('#ms-a11y-title').textContent, XSS);
    assert.equal(el.querySelector('.ms-a11y-subtitle').textContent, XSS);
    assert.equal(el.querySelector('.ms-a11y-footer-note').textContent, XSS);
    assert.equal(el.querySelectorAll('img, script').length, 0);
    assert.equal(window.__xss, undefined);
  });

  it('rótulos de simpleNav entram como texto', () => {
    const nav = createSimpleNav();
    nav.sync([{ label: XSS, href: '/x', short: XSS }]);
    const pill = document.querySelector('nav[data-ms-pills] a.ms-pill');
    assert.equal(pill.querySelectorAll('img, script').length, 0);
    assert.equal(pill.textContent.includes('<img'), true);
    assert.equal(window.__xss, undefined);
    nav.destroy();
  });

  it('templates de innerHTML não interpolam variáveis do host', async () => {
    // Trava estática: ${...} dentro de innerHTML só pode ser constante interna conhecida.
    const fs = await import('node:fs');
    const path = await import('node:path');
    const root = path.resolve(import.meta.dirname, '../../src/ui');
    const permitidas = new Set([
      'SLIDERS_ICON',
      "SECTIONS.map(renderSection).join('')", // F6b: seções estáticas, sem dado do host
      'iconOpen',
      'iconClose',
      't.value',
      't.label',
      't.sub',
      's.value',
      's.label',
      's.title',
    ]);
    const offenders = [];
    for (const file of ['a11yPanel.js', 'fab.js', 'sessionChrome.js']) {
      const src = fs.readFileSync(path.join(root, file), 'utf8');
      const blocos = src.match(/innerHTML\s*=\s*`[\s\S]*?`/g) || [];
      for (const bloco of blocos) {
        for (const m of bloco.matchAll(/\$\{([^}]+)\}/g)) {
          // S.<chave>: constantes estáticas de ui/strings.js (F6a)
          const expr = m[1].trim();
          if (!permitidas.has(expr) && !/^S\.\w+$/.test(expr))
            offenders.push(`${file}: \${${m[1]}}`);
        }
      }
    }
    assert.deepEqual(offenders, []);
  });
});
