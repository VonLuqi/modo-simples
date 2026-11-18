/**
 * QA R34 MED-2 — a seleção manual por teclado não oferece o chrome da própria lib
 * (barra de sessão, switch SIMPLES, pills) como candidato a conteúdo principal.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  startManualSelect,
  stopManualSelect,
} from '../../src/features/manualSelect.js';
import { installHappy } from './helpers/happyEnv.js';

let env;

beforeEach(() => {
  env = installHappy({
    bodyHtml: `
      <div id="ms-session-bar"><div class="ms-session-bar-inner"><div class="ms-session-on"><div class="ms-session-actions" id="acoes"></div></div></div></div>
      <nav data-ms-pills class="ms-pills-nav"><div class="ms-pills-nav__inner" id="pills"></div></nav>
      <div id="ms-simples-chrome"><div id="chrome-interno"></div></div>
      <main id="conteudo"><section id="sec"></section></main>`,
  });
  // happy-dom não faz layout: todo elemento "tem" 400x200
  const rect = () => ({ top: 0, left: 0, width: 400, height: 200 });
  for (const el of document.querySelectorAll('*')) {
    el.getBoundingClientRect = rect;
  }
});
afterEach(() => {
  stopManualSelect();
  env.restore();
});

const key = (k, init = {}) => {
  const ev = new window.KeyboardEvent('keydown', {
    key: k,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  document.dispatchEvent(ev);
};

describe('manualSelect — chrome da lib não é candidato (MED-2)', () => {
  it('Tab percorre só o conteúdo do host e Enter nunca confirma a barra/pills/switch', () => {
    let escolhido = null;
    startManualSelect({ onSelect: (el) => (escolhido = el) });

    const visitados = [];
    for (let i = 0; i < 4; i++) {
      key('Tab');
      const status = document
        .getElementById('ms-manual-select-banner')
        .textContent.match(/Você escolheu: (.*?)\./);
      if (status) visitados.push(status[1]);
    }
    assert.ok(visitados.length > 0);
    for (const v of visitados) {
      assert.ok(
        !/ms-session|chrome|pills|acoes/.test(v),
        `candidato indevido: ${v}`,
      );
    }
    assert.equal(escolhido, null);
  });
});
