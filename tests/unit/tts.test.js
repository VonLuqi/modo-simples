/**
 * TTS — coleta de blocos e highlight (F6).
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { createElement, installDocument } from './helpers/miniDom.js';
import {
  speakMainContent,
  stopSpeaking,
  isSpeaking,
} from '../../src/features/tts.js';

let env;

beforeEach(() => {
  env = installDocument((_doc, html, body) => {
    html.classList.add('ms-ativo');
    html.classList.add('ms-simple-language');

    const main = createElement('main');
    main.setAttribute('data-ms-principal', '');

    const hide = createElement('p');
    hide.className = 'ms-simple-hide';
    hide.textContent = 'Texto marketing escondido';
    main.appendChild(hide);

    const plain = createElement('p');
    plain.setAttribute('data-ms-plain', '');
    plain.textContent = 'Versão institucional longa';
    main.appendChild(plain);

    const simple = createElement('p');
    simple.setAttribute('data-ms-simple', '');
    simple.textContent = 'Versão simples curta';
    main.appendChild(simple);

    const h = createElement('h2');
    h.textContent = 'Titulo da secao';
    main.appendChild(h);

    const ok = createElement('p');
    ok.textContent = 'Paragrafo visivel para leitura.';
    main.appendChild(ok);

    body.appendChild(main);

    // Minimal speechSynthesis stub
    globalThis.speechSynthesis = {
      speaking: false,
      cancel() {
        this.speaking = false;
      },
      speak(u) {
        this.speaking = true;
        this._u = u;
        // End asynchronously so highlight is applied first
        queueMicrotask(() => {
          this.speaking = false;
          if (u && typeof u.onend === 'function') u.onend();
        });
      },
    };
    globalThis.SpeechSynthesisUtterance = function SpeechSynthesisUtterance(
      text,
    ) {
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

describe('tts — highlight por blocos (F6)', () => {
  it('marca o bloco atual com data-ms-tts-active', () => {
    speakMainContent();
    const active = document.querySelector('[data-ms-tts-active]');
    assert.ok(active, 'deveria haver um bloco ativo');
    assert.ok(isSpeaking() || active.textContent.length > 0);
    // Com linguagem simples: não deve destacar data-ms-plain
    assert.equal(active.getAttribute('data-ms-plain'), null);
    stopSpeaking();
    assert.equal(document.querySelector('[data-ms-tts-active]'), null);
    assert.equal(isSpeaking(), false);
  });
});
