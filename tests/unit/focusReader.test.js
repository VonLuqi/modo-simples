/**
 * F7b — focusReader: nome + papel em PT-BR, debounce, cancelamento, não interrompe "Ouvir",
 * ausência de speechSynthesis, persistência e "Desligar tudo".
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  describeFocus,
  startFocusReader,
  stopFocusReader,
  isFocusReaderSupported,
} from '../../src/features/focusReader.js';
import { speakMainContent, stopSpeaking } from '../../src/features/tts.js';
import ModoSimples from '../../src/modo-simples.js';
import state from '../../src/core/state.js';
import { hydratePersistedState } from '../../src/core/persistedState.js';
import { diffStateAnnouncements } from '../../src/core/announcements.js';
import { installHappy } from './helpers/happyEnv.js';

let env;
let falas;
let cancels;

const $ = (s) => document.querySelector(s);
const html = (h) => (document.body.innerHTML = h);

function stubVoz() {
  falas = [];
  cancels = 0;
  globalThis.speechSynthesis = {
    speaking: false,
    cancel() {
      cancels += 1;
    },
    speak(u) {
      falas.push(u.text);
    },
  };
  globalThis.SpeechSynthesisUtterance = function (text) {
    this.text = text;
  };
}

beforeEach(() => {
  env = installHappy({ bodyHtml: '' });
  stubVoz();
});

afterEach(() => {
  stopFocusReader();
  stopSpeaking();
  delete globalThis.speechSynthesis;
  delete globalThis.SpeechSynthesisUtterance;
  env.restore();
});

describe('describeFocus — nome e papel', () => {
  it('botão, link, título e campo com a palavra de papel em português', () => {
    html(`<button id="b">Salvar</button><a id="a" href="#x">Cursos</a>
      <h2 id="h" tabindex="0">Boas-vindas</h2>
      <label for="i">Seu nome</label><input id="i" type="text">`);
    assert.equal(describeFocus($('#b')), 'Salvar, botão');
    assert.equal(describeFocus($('#a')), 'Cursos, link');
    assert.equal(describeFocus($('#h')), 'Boas-vindas, título');
    assert.equal(describeFocus($('#i')), 'Seu nome, campo');
  });

  it('caixa de seleção e interruptor dizem o estado', () => {
    html(`<label><input id="c" type="checkbox" checked> Aceito</label>
      <button id="s" role="switch" aria-checked="false" aria-label="Voz"></button>`);
    assert.equal(describeFocus($('#c')), 'Aceito, caixa de seleção, marcado');
    assert.equal(describeFocus($('#s')), 'Voz, interruptor, desligado');
  });

  it('prioridade: aria-labelledby > aria-label > label/alt/title > texto', () => {
    html(`<span id="r">Rótulo externo</span>
      <button id="b1" aria-labelledby="r" aria-label="Outro">Texto</button>
      <button id="b2" aria-label="Rótulo aria">Texto</button>
      <button id="b3" title="Dica">Texto</button>
      <button id="b4">  Só   texto </button>
      <input id="i" type="image" alt="Buscar">`);
    assert.equal(describeFocus($('#b1')), 'Rótulo externo, botão');
    assert.equal(describeFocus($('#b2')), 'Rótulo aria, botão');
    assert.equal(describeFocus($('#b3')), 'Dica, botão');
    assert.equal(describeFocus($('#b4')), 'Só texto, botão');
    assert.equal(describeFocus($('#i')), 'Buscar, botão');
  });

  it('parágrafo focável: só o texto, limitado a ~200 caracteres', () => {
    html(`<p id="p" tabindex="0">${'palavra '.repeat(60)}</p>`);
    const t = describeFocus($('#p'));
    assert.ok(t.length <= 200 && t.length > 150);
    assert.ok(!t.includes('botão'));
  });

  it('body não é lido', () => {
    assert.equal(describeFocus(document.body), '');
  });
});

describe('leitor do foco — fala, debounce e cancelamento', () => {
  const focar = (el) =>
    el.dispatchEvent(new env.win.FocusEvent('focusin', { bubbles: true }));

  it('fala o elemento focado depois do debounce, em pt-BR', async () => {
    html('<a id="a" href="#x">Cursos</a>');
    startFocusReader();
    focar($('#a'));
    assert.deepEqual(falas, [], 'ainda no debounce');
    await env.wait(260);
    assert.deepEqual(falas, ['Cursos, link']);
  });

  it('foco em sequência rápida: só o último é falado e a fala anterior é cancelada', async () => {
    html('<a id="a" href="#x">Um</a><a id="b" href="#y">Dois</a>');
    startFocusReader();
    focar($('#a'));
    focar($('#b'));
    await env.wait(260);
    assert.deepEqual(falas, ['Dois, link']);
    assert.ok(cancels >= 1, 'cancela a fala anterior antes de falar');
  });

  it('não interrompe a leitura "Ouvir" do conteúdo principal', async () => {
    html(
      '<main><p>Texto principal da página.</p></main><a id="a" href="#x">Cursos</a>',
    );
    speakMainContent();
    const antes = falas.length;
    startFocusReader();
    focar($('#a'));
    await env.wait(260);
    assert.equal(falas.length, antes, 'nenhuma fala de foco durante a leitura');
  });

  it('parar remove o ouvinte', async () => {
    html('<a id="a" href="#x">Cursos</a>');
    startFocusReader();
    stopFocusReader();
    focar($('#a'));
    await env.wait(260);
    assert.deepEqual(falas, []);
  });

  it('sem speechSynthesis: não suportado e não liga', () => {
    delete globalThis.speechSynthesis;
    assert.equal(isFocusReaderSupported(), false);
    html('<a id="a" href="#x">Cursos</a>');
    startFocusReader();
    focar($('#a'));
    assert.deepEqual(falas, []);
  });
});

describe('opção readFocus', () => {
  it('padrão false, persistida como booleano e anunciada', () => {
    assert.equal(state.get().options.readFocus, false);
    const s = hydratePersistedState({ options: { readFocus: 1 } });
    assert.equal(s.options.readFocus, true);
    const msgs = diffStateAnnouncements(
      { options: { readFocus: false } },
      { options: { readFocus: true } },
    );
    assert.deepEqual(msgs, ['Leitura do foco ligada']);
  });

  it('o interruptor liga/desliga a leitura e "Desligar tudo" zera a opção', async () => {
    html('<a id="a" href="#x">Cursos</a>');
    const inst = new ModoSimples({ persistence: false });
    inst.init();
    state.set({ options: { ...state.get().options, readFocus: true } });
    $('#a').dispatchEvent(new env.win.FocusEvent('focusin', { bubbles: true }));
    await env.wait(260);
    assert.deepEqual(falas, ['Cursos, link']);

    inst._resetAll();
    assert.equal(state.get().options.readFocus, false);
    falas.length = 0;
    $('#a').dispatchEvent(new env.win.FocusEvent('focusin', { bubbles: true }));
    await env.wait(260);
    assert.deepEqual(falas, []);
    inst.destroy();
  });
});
