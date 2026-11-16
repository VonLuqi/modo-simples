/**
 * A-04 — heurística de conteúdo principal (contentDetector) em DOM real.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import defaults from '../../src/config/defaults.js';
import { detectMainContent } from '../../src/heuristics/contentDetector.js';
import { installHappy } from './helpers/happyEnv.js';

let env;

const longText = (n = 8) =>
  'Texto de conteúdo com densidade suficiente. '.repeat(n);
const page = (html) => {
  env.win.document.body.innerHTML = html;
};

beforeEach(() => {
  env = installHappy();
});
afterEach(() => env.restore());

describe('detectMainContent', () => {
  it('<main> com h1 e texto longo: confiança máxima', () => {
    page(`<header>x</header><main><h1>T</h1><p>${longText(20)}</p></main>`);
    const { element, confidence } = detectMainContent(defaults);
    assert.equal(element.tagName, 'MAIN');
    assert.equal(confidence, 1);
  });

  it('sem nenhum candidato: cai no <body> com confiança 0', () => {
    page('<div>curto</div>');
    const { element, confidence } = detectMainContent(defaults);
    assert.equal(element, document.body);
    assert.equal(confidence, 0);
  });

  it('[role=main] é reconhecido', () => {
    page(`<div role="main"><h1>T</h1><p>${longText()}</p></div>`);
    const { element, confidence } = detectMainContent(defaults);
    assert.equal(element.getAttribute('role'), 'main');
    assert.ok(confidence >= defaults.confidenceThreshold);
  });

  it('entre vários candidatos escolhe o de maior pontuação', () => {
    page(`
      <article id="curto">pouco texto</article>
      <main id="principal"><h1>T</h1><p>${longText()}</p></main>`);
    assert.equal(detectMainContent(defaults).element.id, 'principal');
  });

  it('o mesmo elemento casando vários seletores é pontuado uma vez só', () => {
    page(`<main class="content"><h1>T</h1><p>${longText()}</p></main>`);
    const cfg = { ...defaults, mainSelectors: ['main', '.content'] };
    assert.equal(detectMainContent(cfg).element.tagName, 'MAIN');
  });

  it('seletor inválido é ignorado sem lançar', () => {
    page(`<main><h1>T</h1><p>${longText()}</p></main>`);
    const cfg = { ...defaults, mainSelectors: ['::inválido:::', 'main'] };
    assert.equal(detectMainContent(cfg).element.tagName, 'MAIN');
  });

  it('candidato fraco (div .content curta, sem h1) fica abaixo do limiar', () => {
    page('<div class="content">texto curto</div>');
    const { confidence } = detectMainContent(defaults);
    assert.ok(confidence < defaults.confidenceThreshold);
  });

  it('confiança nunca passa de 1', () => {
    page(
      `<main role="main"><article><h1>a</h1><h2>b</h2><p>${longText(40)}</p></article></main>`,
    );
    assert.ok(detectMainContent(defaults).confidence <= 1);
  });
});
