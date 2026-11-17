/**
 * A-04 (F4b) — contentDetector: ordem de prioridade, desempate, pesos customizados
 * e limites da confiança. Complementa contentDetector.test.js.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import defaults from '../../src/config/defaults.js';
import { detectMainContent } from '../../src/heuristics/contentDetector.js';
import { installHappy } from './helpers/happyEnv.js';

let env;

const page = (html) => {
  env.win.document.body.innerHTML = html;
};

/** Pesos iguais: só a prioridade do seletor e a ordem no documento desempatam. */
const flatScoring = {
  ...defaults.scoring,
  mainTagBonus: 50,
  articleBonus: 50,
  roleMainBonus: 50,
  h1Bonus: 0,
  h2Bonus: 0,
  textLengthBonus: 0,
};

beforeEach(() => {
  env = installHappy();
});
afterEach(() => env.restore());

describe('detectMainContent — prioridade e desempate', () => {
  it('empate de nota: vence o seletor que vem antes em mainSelectors', () => {
    page('<main id="m">a</main><article id="a">b</article>');
    const cfg = {
      ...defaults,
      scoring: flatScoring,
      mainSelectors: ['article', 'main'],
    };
    assert.equal(detectMainContent(cfg).element.id, 'a');

    const inverso = { ...cfg, mainSelectors: ['main', 'article'] };
    assert.equal(detectMainContent(inverso).element.id, 'm');
  });

  it('empate com o mesmo seletor: vence o primeiro na ordem do documento', () => {
    page('<article id="um">a</article><article id="dois">b</article>');
    const cfg = {
      ...defaults,
      scoring: flatScoring,
      mainSelectors: ['article'],
    };
    assert.equal(detectMainContent(cfg).element.id, 'um');
  });

  it('nota maior vence mesmo com seletor de menor prioridade', () => {
    page('<article id="a">curto</article><main id="m"><h1>T</h1></main>');
    const cfg = { ...defaults, mainSelectors: ['article', 'main'] };
    assert.equal(detectMainContent(cfg).element.id, 'm');
  });
});

describe('detectMainContent — config', () => {
  it('mainSelectors vazio: <body> com confiança 0', () => {
    page('<main><h1>T</h1></main>');
    const { element, confidence } = detectMainContent({
      ...defaults,
      mainSelectors: [],
    });
    assert.equal(element, document.body);
    assert.equal(confidence, 0);
  });

  it('<main> vazio pontua só mainTagBonus: confiança = 100/210', () => {
    page('<main></main>');
    const { confidence } = detectMainContent(defaults);
    assert.equal(confidence, 100 / 210);
    assert.ok(confidence >= defaults.confidenceThreshold);
  });

  it('o "ideal" da confiança acompanha os pesos da config', () => {
    page('<main></main>');
    const cfg = {
      ...defaults,
      scoring: {
        ...defaults.scoring,
        mainTagBonus: 50,
        h1Bonus: 0,
        textLengthBonus: 0,
      },
    };
    assert.equal(detectMainContent(cfg).confidence, 1);
  });

  it('article + h1 sem texto (nota 90) fica abaixo do limiar padrão', () => {
    page('<article><h1>T</h1></article>');
    const { confidence } = detectMainContent(defaults);
    assert.equal(confidence, 90 / 210);
    assert.ok(confidence < defaults.confidenceThreshold);
  });
});
