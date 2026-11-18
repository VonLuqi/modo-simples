/**
 * "Ler o que eu seleciono": falha de síntese avisa (onSpeechError); interrupted/canceled não.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  startFocusReader,
  stopFocusReader,
} from '../../src/features/focusReader.js';
import { stopSpeaking, onSpeechError } from '../../src/features/tts.js';
import { installHappy } from './helpers/happyEnv.js';

let env;
let utts;
let errors;
let off;

beforeEach(() => {
  env = installHappy({ bodyHtml: '<a id="a" href="#x">Cursos</a>' });
  utts = [];
  errors = [];
  off = onSpeechError((r) => errors.push(r));
  globalThis.speechSynthesis = {
    speaking: false,
    cancel() {},
    speak(u) {
      utts.push(u);
    },
  };
  globalThis.SpeechSynthesisUtterance = function (text) {
    this.text = text;
  };
});

afterEach(() => {
  off();
  stopFocusReader();
  stopSpeaking();
  delete globalThis.speechSynthesis;
  delete globalThis.SpeechSynthesisUtterance;
  env.restore();
});

describe('leitor do foco — falha de síntese', () => {
  const focar = () =>
    document
      .querySelector('#a')
      .dispatchEvent(new env.win.FocusEvent('focusin', { bubbles: true }));

  it('synthesis-failed no foco avisa speech-failed', async () => {
    startFocusReader();
    focar();
    await env.wait(260);
    assert.equal(utts.length, 1);
    utts[0].onerror({ error: 'synthesis-failed' });
    assert.deepEqual(errors, ['speech-failed']);
  });

  it('interrupted e canceled (novo foco cancelou a fala) não são falha', async () => {
    startFocusReader();
    focar();
    await env.wait(260);
    utts[0].onerror({ error: 'interrupted' });
    utts[0].onerror({ error: 'canceled' });
    assert.deepEqual(errors, []);
  });
});
