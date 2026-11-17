/**
 * IMP-13 — eventos onend/onerror de uma fala antiga não podem mexer na fala nova.
 *
 * speechSynthesis.cancel() dispara onerror("canceled"/"interrupted") do utterance antigo de forma
 * ASSÍNCRONA. Se a leitura já foi reiniciada (_speaking de novo true), o handler velho avançava a
 * fila nova com o índice antigo: pulava ou duplicava blocos.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { createElement, installDocument } from './helpers/miniDom.js';
import { speakMainContent, stopSpeaking } from '../../src/features/tts.js';

let env;
let spoken; // utterances na ordem em que foram enviados ao speechSynthesis
let pending; // utterances aguardando evento

const flush = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => {
  spoken = [];
  pending = [];
  env = installDocument((_doc, _html, body) => {
    const main = createElement('main');
    for (const t of ['Primeiro bloco', 'Segundo bloco', 'Terceiro bloco']) {
      const p = createElement('p');
      p.textContent = t;
      main.appendChild(p);
    }
    body.appendChild(main);

    globalThis.speechSynthesis = {
      speaking: false,
      cancel() {
        // como no browser: o utterance em curso recebe onerror depois, de forma assíncrona
        const old = pending.splice(0);
        for (const u of old) {
          setTimeout(() => u.onerror?.({ error: 'canceled' }), 0);
        }
        this.speaking = false;
      },
      speak(u) {
        spoken.push(u.text);
        pending.push(u);
        this.speaking = true;
      },
    };
    globalThis.SpeechSynthesisUtterance = function (text) {
      this.text = text;
      this.lang = '';
      this.rate = 1;
      this.onend = null;
      this.onerror = null;
    };
    globalThis.matchMedia = () => ({ matches: true });
  });
});

afterEach(() => {
  stopSpeaking();
  env?.restore();
  env = null;
  delete globalThis.speechSynthesis;
  delete globalThis.SpeechSynthesisUtterance;
  delete globalThis.matchMedia;
});

describe('tts — fala antiga não interfere na nova (IMP-13)', () => {
  it('reiniciar a leitura: o onerror do cancelamento não avança a fila nova', async () => {
    speakMainContent(); // fala 1: bloco 0
    speakMainContent(); // reinício: cancel() agenda onerror da fala 1; fala 2: bloco 0
    assert.deepEqual(spoken, ['Primeiro bloco', 'Primeiro bloco']);

    await flush(); // dispara o onerror assíncrono da fala 1

    // antes da correção o handler velho chamava speakBlockAt(1) → "Segundo bloco" fora de hora
    assert.deepEqual(
      spoken,
      ['Primeiro bloco', 'Primeiro bloco'],
      'o evento velho não pode falar mais nada',
    );
  });

  it('a fala nova continua normalmente quando termina de verdade', async () => {
    speakMainContent();
    speakMainContent();
    await flush();

    const atual = pending[pending.length - 1];
    atual.onend(); // fim legítimo do bloco 0 da fala nova
    assert.equal(spoken[spoken.length - 1], 'Segundo bloco');
  });

  it('parar e ouvir de novo: eventos da fala parada não reiniciam nada', async () => {
    speakMainContent();
    stopSpeaking(); // cancel agenda onerror
    speakMainContent();
    await flush();
    assert.deepEqual(spoken, ['Primeiro bloco', 'Primeiro bloco']);
  });
});
