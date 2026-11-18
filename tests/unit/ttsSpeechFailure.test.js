/**
 * Falha de fala é alta, não silenciosa: 'synthesis-failed' e afins param a leitura (sem encadear
 * o próximo bloco) e avisam; 'interrupted'/'canceled' continuam normais. Vale para "Ouvir" (tts)
 * e para "Ler o que eu seleciono" (focusReader).
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { createElement, installDocument } from './helpers/miniDom.js';
import {
  speakMainContent,
  stopSpeaking,
  isReadingMain,
  onSpeakingChange,
  onSpeechError,
  isSpeechFailure,
} from '../../src/features/tts.js';

let env;
let spoken;
let pending;

const flush = () => new Promise((r) => setTimeout(r, 0));
const last = () => pending[pending.length - 1];

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

describe('isSpeechFailure', () => {
  it('só erro real conta; interrupted, canceled e evento sem erro não', () => {
    assert.equal(isSpeechFailure({ error: 'synthesis-failed' }), true);
    assert.equal(isSpeechFailure({ error: 'not-allowed' }), true);
    assert.equal(isSpeechFailure({ error: 'audio-hardware' }), true);
    assert.equal(isSpeechFailure({ error: 'synthesis-unavailable' }), true);
    assert.equal(isSpeechFailure({ error: 'interrupted' }), false);
    assert.equal(isSpeechFailure({ error: 'canceled' }), false);
    assert.equal(isSpeechFailure({}), false);
    assert.equal(isSpeechFailure(undefined), false);
  });
});

describe('"Ouvir" (tts) — synthesis-failed', () => {
  it('para após o 1º bloco: não fala o próximo, limpa o estado e avisa', async () => {
    const changes = [];
    const errors = [];
    const off1 = onSpeakingChange((s, p, why) => changes.push([s, p, why]));
    const off2 = onSpeechError((r) => errors.push(r));
    speakMainContent();
    assert.deepEqual(spoken, ['Primeiro bloco']);
    last().onerror({ error: 'synthesis-failed' });
    await flush();
    assert.deepEqual(
      spoken,
      ['Primeiro bloco'],
      'não encadeia o próximo bloco',
    );
    assert.equal(isReadingMain(), false);
    assert.deepEqual(changes, [
      [true, false, undefined],
      [false, false, 'speech-failed'],
    ]);
    assert.deepEqual(errors, ['speech-failed']);
    off1();
    off2();
  });

  it('not-allowed, audio-hardware e synthesis-unavailable também param', async () => {
    for (const error of [
      'not-allowed',
      'audio-hardware',
      'synthesis-unavailable',
    ]) {
      speakMainContent();
      last().onerror({ error });
      await flush();
      assert.equal(isReadingMain(), false, error);
      assert.equal(spoken.length, 1, error);
      spoken.length = 0;
    }
  });

  it('interrupted e canceled seguem o fluxo normal (avançam, sem aviso de falha)', async () => {
    const errors = [];
    const off = onSpeechError((r) => errors.push(r));
    speakMainContent();
    last().onerror({ error: 'interrupted' });
    assert.deepEqual(spoken, ['Primeiro bloco', 'Segundo bloco']);
    last().onerror({ error: 'canceled' });
    assert.equal(spoken.at(-1), 'Terceiro bloco');
    assert.equal(isReadingMain(), true);
    assert.deepEqual(errors, []);
    off();
  });

  it('falha de uma fala antiga (outra geração) é ignorada', async () => {
    const errors = [];
    const off = onSpeechError((r) => errors.push(r));
    speakMainContent();
    const velha = last();
    speakMainContent(); // reinício
    velha.onerror({ error: 'synthesis-failed' });
    assert.equal(isReadingMain(), true);
    assert.deepEqual(errors, []);
    off();
  });

  it('parar normalmente não traz motivo de falha', () => {
    const changes = [];
    const off = onSpeakingChange((s, p, why) => changes.push([s, p, why]));
    speakMainContent();
    stopSpeaking();
    assert.deepEqual(changes.at(-1), [false, false, undefined]);
    off();
  });
});
