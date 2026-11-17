/**
 * D4 — "Linguagem Simples" só é oferecida quando a página tem pares data-ms-plain/simple.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { createElement, installDocument } from './helpers/miniDom.js';
import { createSessionChrome } from '../../src/ui/sessionChrome.js';
import { hasSimpleLanguagePairs } from '../../src/utils/simpleLanguage.js';

let env;

const noop = () => {};
const novoChrome = (onToggleSimpleLanguage = noop) =>
  createSessionChrome({
    onToggleModoSimples: noop,
    onOpenPanel: noop,
    onSpeak: noop,
    onToggleSimpleLanguage,
  });

function addPair() {
  const plain = createElement('p');
  plain.setAttribute('data-ms-plain', '');
  const simple = createElement('p');
  simple.setAttribute('data-ms-simple', '');
  document.body.appendChild(plain);
  document.body.appendChild(simple);
}

beforeEach(() => {
  env = installDocument();
});

afterEach(() => {
  env?.restore();
  env = null;
});

describe('hasSimpleLanguagePairs (D4)', () => {
  it('false sem markup, false com só um lado, true com o par', () => {
    assert.equal(hasSimpleLanguagePairs(), false);
    const so = createElement('p');
    so.setAttribute('data-ms-plain', '');
    document.body.appendChild(so);
    assert.equal(hasSimpleLanguagePairs(), false);
    const outro = createElement('p');
    outro.setAttribute('data-ms-simple', '');
    document.body.appendChild(outro);
    assert.equal(hasSimpleLanguagePairs(), true);
  });
});

describe('botão Linguagem Simples na barra de sessão (D4)', () => {
  it('sem markup: indisponível, aria-disabled, sem "LIGADA" mesmo com simpleLanguage no estado', () => {
    const chrome = novoChrome();
    chrome.sync({ modoSimples: true, options: { simpleLanguage: true } });

    const btn = document.querySelector('[data-action="lang"]');
    const label = document.querySelector('[data-lang-label]');
    const desc = document.querySelector('[data-session-desc]');
    assert.equal(label.textContent, 'Indisponível nesta página');
    assert.equal(btn.getAttribute('aria-disabled'), 'true');
    assert.equal(btn.getAttribute('aria-pressed'), 'false');
    // UX-11: sem aria-label dinâmico; o aviso fica lido porque o rótulo não é aria-hidden
    assert.equal(label.getAttribute('aria-hidden'), 'false');
    assert.ok(!desc.textContent.includes('palavras fáceis'));
    chrome.destroy();
  });

  it('sem markup: clique não dispara onToggleSimpleLanguage', () => {
    let chamadas = 0;
    const chrome = novoChrome(() => {
      chamadas += 1;
    });
    chrome.sync({ modoSimples: true, options: { simpleLanguage: false } });
    const btn = document.querySelector('[data-action="lang"]');
    btn._listeners.click.forEach((fn) => fn({ currentTarget: btn }));
    assert.equal(chamadas, 0);
    chrome.destroy();
  });

  it('com pares: funciona como antes (LIGADA/DESLIGADA, clique alterna)', () => {
    addPair();
    const chamadas = [];
    const chrome = novoChrome((v) => chamadas.push(v));

    chrome.sync({ modoSimples: true, options: { simpleLanguage: false } });
    const btn = document.querySelector('[data-action="lang"]');
    const label = document.querySelector('[data-lang-label]');
    assert.equal(btn.getAttribute('aria-disabled'), 'false');
    assert.equal(label.textContent, 'DESLIGADA');

    chrome.sync({ modoSimples: true, options: { simpleLanguage: true } });
    assert.equal(label.textContent, 'LIGADA');
    assert.ok(
      document
        .querySelector('[data-session-desc]')
        .textContent.includes('palavras fáceis'),
    );

    btn._listeners.click.forEach((fn) => fn({ currentTarget: btn }));
    assert.deepEqual(chamadas, [false]);
    chrome.destroy();
  });
});
