/**
 * F0 (UX-18/UX-20) — a barra de sessão tem CTA "Ativar Modo Simples" (off)
 * e "Voltar ao site normal" (on), com o foco indo ao controle que desfaz a ação.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { installDocument } from './helpers/miniDom.js';
import { createSessionChrome } from '../../src/ui/sessionChrome.js';

let env;

const noop = () => {};

function novoChrome(onToggleModoSimples = noop) {
  return createSessionChrome({
    onToggleModoSimples,
    onOpenPanel: noop,
    onSpeak: noop,
    onToggleSimpleLanguage: noop,
  });
}

function clicar(el) {
  el._listeners.click.forEach((fn) => fn({ currentTarget: el }));
}

beforeEach(() => {
  env = installDocument();
});

afterEach(() => {
  env?.restore();
  env = null;
});

describe('barra de sessão — Ativar / Voltar (UX-18, UX-20)', () => {
  it('estado off: convite curto e botão "Ativar Modo Simples" que chama enable', () => {
    const chamadas = [];
    const chrome = novoChrome((v) => chamadas.push(v));
    chrome.sync({ modoSimples: false, options: {} });

    const off = document.querySelector('.ms-session-off');
    const btn = document.querySelector('[data-action="activate"]');
    assert.ok(btn);
    assert.equal(btn.textContent.trim(), 'Ativar Modo Simples');
    // convite com no máximo 12 palavras
    const palavras = off
      .querySelector('p')
      .textContent.replace('★', '')
      .trim()
      .split(/\s+/);
    assert.ok(palavras.length <= 12, `convite com ${palavras.length} palavras`);

    clicar(btn);
    assert.deepEqual(chamadas, [true]);
    chrome.destroy();
  });

  it('estado on: botão "Voltar ao site normal" chama disable', () => {
    const chamadas = [];
    const chrome = novoChrome((v) => chamadas.push(v));
    chrome.sync({ modoSimples: true, options: {} });

    const btn = document.querySelector('[data-action="exit"]');
    assert.ok(btn);
    assert.equal(btn.textContent.trim(), 'Voltar ao site normal');
    // é um <button> nativo: alcançável e acionável por teclado (Tab/Enter/Espaço)
    assert.equal(btn.tagName.toLowerCase(), 'button');

    clicar(btn);
    assert.deepEqual(chamadas, [false]);
    chrome.destroy();
  });

  it('foco: ativar vai ao título do estado on; voltar vai ao botão Ativar', () => {
    const chrome = novoChrome();
    const focados = [];
    const titulo = document.querySelector('.ms-session-on-title');
    const ativar = document.querySelector('[data-action="activate"]');
    titulo.focus = () => focados.push('titulo');
    ativar.focus = () => focados.push('ativar');

    clicar(ativar);
    clicar(document.querySelector('[data-action="exit"]'));
    assert.deepEqual(focados, ['titulo', 'ativar']);
    assert.equal(titulo.getAttribute('tabindex'), '-1');
    chrome.destroy();
  });
});
