/**
 * F10 — features/voice.js: vozes instaladas, limites e aplicação na fala.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  VOICE_LIMITS,
  clampVoice,
  isVoiceSupported,
  listVoices,
  onVoicesChanged,
  applyVoice,
  previewVoice,
} from '../../src/features/voice.js';

const V = (name, lang) => ({ name, lang });
let voices;
let listeners;
let spoken;
let cancelled;

beforeEach(() => {
  voices = [
    V('Zed', 'en-US'),
    V('Maria', 'pt-PT'),
    V('Luciana', 'pt-BR'),
    V('Alex', 'en-GB'),
    V('Ana', 'pt-BR'),
  ];
  listeners = new Set();
  spoken = [];
  cancelled = 0;
  globalThis.SpeechSynthesisUtterance = class {
    constructor(text) {
      this.text = text;
    }
  };
  globalThis.speechSynthesis = {
    getVoices: () => voices,
    addEventListener: (_t, cb) => listeners.add(cb),
    removeEventListener: (_t, cb) => listeners.delete(cb),
    cancel: () => cancelled++,
    speak: (u) => spoken.push(u),
  };
});

afterEach(() => {
  delete globalThis.speechSynthesis;
  delete globalThis.SpeechSynthesisUtterance;
});

describe('voice.js', () => {
  it('limites do contrato', () => {
    assert.deepEqual(VOICE_LIMITS, {
      rate: { min: 0.5, max: 2, step: 0.1 },
      pitch: { min: 0, max: 2, step: 0.1 },
      volume: { min: 0.1, max: 1, step: 0.1 },
    });
  });

  it('isVoiceSupported segue a API do navegador', () => {
    assert.equal(isVoiceSupported(), true);
    delete globalThis.speechSynthesis;
    assert.equal(isVoiceSupported(), false);
    assert.deepEqual(listVoices(), []);
    assert.doesNotThrow(() => previewVoice({}));
    assert.equal(typeof onVoicesChanged(() => {}), 'function');
  });

  it('listVoices: pt-BR, depois pt, depois o resto, por nome', () => {
    assert.deepEqual(
      listVoices().map((v) => v.name),
      ['Ana', 'Luciana', 'Maria', 'Alex', 'Zed'],
    );
  });

  it('listVoices vazio até o navegador carregar; onVoicesChanged avisa e cancela', () => {
    voices = [];
    assert.deepEqual(listVoices(), []);
    let n = 0;
    const off = onVoicesChanged(() => n++);
    for (const cb of listeners) cb();
    assert.equal(n, 1);
    off();
    assert.equal(listeners.size, 0);
  });

  it('clampVoice limita e trata inválido como 1', () => {
    assert.equal(clampVoice('rate', 9), 2);
    assert.equal(clampVoice('rate', 0.1), 0.5);
    assert.equal(clampVoice('pitch', 0), 0);
    assert.equal(clampVoice('pitch', -3), 0);
    assert.equal(clampVoice('volume', 5), 1);
    assert.equal(clampVoice('volume', 0), 0.1); // leitura muda não existe (L3)
    assert.equal(clampVoice('volume', -1), 0.1);
    assert.equal(clampVoice('volume', 'abc'), 1);
    assert.equal(clampVoice('rate', undefined), 1);
    assert.equal(clampVoice('rate', null), 1);
  });

  it('applyVoice: idioma pt-BR fixo, voz pelo nome, valores limitados', () => {
    const u = {};
    applyVoice(u, {
      voiceName: 'Maria',
      voiceRate: 5,
      voicePitch: 0.5,
      voiceVolume: 0.3,
    });
    assert.equal(u.lang, 'pt-BR');
    assert.equal(u.voice.name, 'Maria');
    assert.equal(u.rate, 2);
    assert.equal(u.pitch, 0.5);
    assert.equal(u.volume, 0.3);
  });

  it('applyVoice: nome não instalado ou vazio cai na melhor pt-BR', () => {
    for (const voiceName of ['Fantasma', '']) {
      const u = {};
      applyVoice(u, { voiceName });
      assert.equal(u.voice.name, 'Ana');
      assert.equal(u.lang, 'pt-BR');
      assert.equal(u.rate, 1);
      assert.equal(u.pitch, 1);
      assert.equal(u.volume, 1);
    }
  });

  it('applyVoice: sem pt-BR usa pt; sem nenhuma pt deixa a voz padrão', () => {
    voices = [V('Zed', 'en-US'), V('Maria', 'pt-PT')];
    const a = {};
    applyVoice(a, {});
    assert.equal(a.voice.name, 'Maria');
    voices = [V('Zed', 'en-US')];
    const b = {};
    applyVoice(b, {});
    assert.equal(b.voice, undefined);
    assert.equal(b.lang, 'pt-BR');
  });

  it('previewVoice cancela a fala atual e fala a frase de exemplo', () => {
    previewVoice({ voiceName: 'Luciana', voiceRate: 1.5 });
    assert.equal(cancelled, 1);
    assert.equal(spoken.length, 1);
    assert.equal(spoken[0].text, 'Esta é a voz que vai ler para você.');
    assert.equal(spoken[0].voice.name, 'Luciana');
    assert.equal(spoken[0].rate, 1.5);
    previewVoice({}, 'Olá');
    assert.equal(spoken[1].text, 'Olá');
  });
});
