/**
 * F10c — pausar/retomar a leitura: cancel + lembrar o pedaço; retomar re-fala desse pedaço.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { createElement, installDocument } from './helpers/miniDom.js';
import {
  speakMainContent,
  stopSpeaking,
  pauseSpeaking,
  resumeSpeaking,
  isPaused,
  isReadingMain,
  onSpeakingChange,
  splitForSpeech,
} from '../../src/features/tts.js';

let env;
let spoken;
let pending;
let cancels;

const flush = () => new Promise((r) => setTimeout(r, 0));
const LONG =
  `${'Frase um com algumas palavras. '.repeat(8)}${'Outra frase mais. '.repeat(16)}`.trim();

beforeEach(() => {
  spoken = [];
  pending = [];
  cancels = 0;
  env = installDocument((_doc, _html, body) => {
    const main = createElement('main');
    for (const t of ['Primeiro bloco', LONG, 'Terceiro bloco']) {
      const p = createElement('p');
      p.textContent = t;
      main.appendChild(p);
    }
    body.appendChild(main);
    globalThis.speechSynthesis = {
      speaking: false,
      cancel() {
        cancels++;
        for (const u of pending.splice(0)) {
          setTimeout(() => u.onerror?.({ error: 'canceled' }), 0);
        }
      },
      speak(u) {
        spoken.push(u.text);
        pending.push(u);
      },
    };
    globalThis.SpeechSynthesisUtterance = function (text) {
      this.text = text;
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

const fim = () => pending[pending.length - 1].onend();

describe('tts — pausa e retomada (F10c)', () => {
  it('sem leitura: pausar/retomar não fazem nada', () => {
    assert.equal(pauseSpeaking(), false);
    assert.equal(resumeSpeaking(), false);
    assert.equal(isPaused(), false);
  });

  it('pausar cancela a fala e marca pausado; a leitura segue "ativa"', () => {
    speakMainContent();
    assert.equal(pauseSpeaking(), true);
    assert.equal(isPaused(), true);
    assert.equal(isReadingMain(), true);
    assert.equal(cancels, 2); // 1 do início (stopSpeaking) + 1 da pausa
    assert.equal(pauseSpeaking(), false); // já pausada
  });

  it('retomar re-fala do mesmo pedaço (bloco 0)', async () => {
    speakMainContent();
    pauseSpeaking();
    await flush(); // onerror da fala cancelada não avança a fila
    assert.deepEqual(spoken, ['Primeiro bloco']);
    assert.equal(resumeSpeaking(), true);
    assert.equal(isPaused(), false);
    assert.deepEqual(spoken, ['Primeiro bloco', 'Primeiro bloco']);
    fim();
    assert.equal(spoken[2], splitForSpeech(LONG)[0]); // segue para o bloco 1
  });

  it('retomar volta ao pedaço (chunk) onde pausou, não ao início do bloco', async () => {
    const chunks = splitForSpeech(LONG);
    assert.ok(chunks.length >= 3, 'fixture deve gerar vários pedaços');
    speakMainContent();
    fim(); // bloco 0 termina → bloco 1, pedaço 0
    fim(); // pedaço 1
    assert.equal(spoken[spoken.length - 1], chunks[1]);
    pauseSpeaking();
    await flush();
    resumeSpeaking();
    assert.equal(spoken[spoken.length - 1], chunks[1]);
    fim();
    assert.equal(spoken[spoken.length - 1], chunks[2]);
  });

  it('eventos da fala cancelada pela pausa não avançam a fila', async () => {
    speakMainContent();
    pauseSpeaking();
    const antes = spoken.length;
    await flush();
    assert.equal(spoken.length, antes);
  });

  it('stopSpeaking limpa a pausa; retomar depois não faz nada', () => {
    speakMainContent();
    pauseSpeaking();
    stopSpeaking();
    assert.equal(isPaused(), false);
    assert.equal(isReadingMain(), false);
    assert.equal(resumeSpeaking(), false);
  });

  it('onSpeakingChange avisa o estado pausado (2º argumento)', () => {
    const calls = [];
    const off = onSpeakingChange((s, p) => calls.push([s, p]));
    speakMainContent();
    pauseSpeaking();
    resumeSpeaking();
    stopSpeaking();
    off();
    assert.deepEqual(calls, [
      [true, false],
      [true, true],
      [true, false],
      [false, false],
    ]);
  });
});
