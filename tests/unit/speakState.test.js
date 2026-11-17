/**
 * IMP-25 (follow-up) — o estado "lendo / parado" da UI vem dos eventos do tts, sem polling.
 * Antes: _toggleSpeak criava setInterval(400ms) para perguntar isSpeaking(); o botão só voltava
 * a "Ouvir" no próximo tick e o timer era um recurso a mais para vazar.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import ModoSimples from '../../src/modo-simples.js';
import { stopSpeaking } from '../../src/features/tts.js';
import { installHappy, SAMPLE_PAGE } from './helpers/happyEnv.js';

let env;
let inst;
let intervals;
let realSetInterval;
let realClearInterval;
let pending;

const rotuloPainel = () =>
  document
    .querySelector('#ms-container')
    .shadowRoot.querySelector('[data-action="speak"]')
    .textContent.trim();

/** conclui, na ordem, todas as falas em fila (como o browser fazendo onend) */
function terminarFalas() {
  let guarda = 0;
  while (pending.length && guarda++ < 100) pending.shift().onend();
}

beforeEach(() => {
  env = installHappy({ bodyHtml: SAMPLE_PAGE });

  intervals = new Set();
  realSetInterval = globalThis.setInterval;
  realClearInterval = globalThis.clearInterval;
  globalThis.setInterval = (...args) => {
    const id = realSetInterval(...args);
    intervals.add(id);
    return id;
  };
  globalThis.clearInterval = (id) => {
    intervals.delete(id);
    realClearInterval(id);
  };

  pending = [];
  globalThis.speechSynthesis = {
    speaking: false,
    cancel() {
      pending.splice(0);
      this.speaking = false;
    },
    speak(u) {
      pending.push(u);
      this.speaking = true;
    },
  };
  globalThis.SpeechSynthesisUtterance = function (text) {
    this.text = text;
    this.onend = null;
    this.onerror = null;
  };

  inst = new ModoSimples();
  inst.init();
});

afterEach(() => {
  inst?.destroy();
  stopSpeaking();
  for (const id of intervals) realClearInterval(id);
  globalThis.setInterval = realSetInterval;
  globalThis.clearInterval = realClearInterval;
  delete globalThis.speechSynthesis;
  delete globalThis.SpeechSynthesisUtterance;
  env.restore();
});

describe('estado da leitura vem dos eventos do tts (IMP-25)', () => {
  it('ouvir não cria polling (nenhum setInterval)', () => {
    inst._toggleSpeak();
    assert.equal(intervals.size, 0);
  });

  it('o botão vira "Parar" ao começar e volta a "Ouvir" assim que a fala termina', () => {
    assert.equal(rotuloPainel(), 'Ouvir');
    inst._toggleSpeak();
    assert.equal(rotuloPainel(), 'Parar');

    terminarFalas(); // último onend: sem esperar nenhum tick de polling
    assert.equal(rotuloPainel(), 'Ouvir');
  });

  it('parar pelo botão atualiza a UI', () => {
    inst._toggleSpeak();
    assert.equal(rotuloPainel(), 'Parar');
    inst._toggleSpeak();
    assert.equal(rotuloPainel(), 'Ouvir');
  });

  it('parar pelo módulo tts (fora da UI) também atualiza a UI', () => {
    inst._toggleSpeak();
    stopSpeaking();
    assert.equal(rotuloPainel(), 'Ouvir');
  });

  it('depois do destroy() o fim da fala não mexe em mais nada', () => {
    inst._toggleSpeak();
    inst.destroy();
    assert.doesNotThrow(() => terminarFalas());
  });
});
