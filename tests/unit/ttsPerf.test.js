/**
 * IMP-38 — coleta de blocos barata e utterances curtas.
 *  - a coleta não pode ler innerText (força layout) de cada bloco e de cada ancestral;
 *  - cada utterance respeita o limite prático do Chrome (~200 caracteres).
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { createElement, installDocument } from './helpers/miniDom.js';
import {
  speakMainContent,
  stopSpeaking,
  splitForSpeech,
} from '../../src/features/tts.js';

let env;
let spoken;
let pending;
let innerTextReads;

/** Faz innerText contar leituras (no browser cada leitura pode forçar layout). */
function watchInnerText(el) {
  Object.defineProperty(el, 'innerText', {
    get() {
      innerTextReads += 1;
      return el.textContent;
    },
  });
  return el;
}

function installSpeech() {
  globalThis.speechSynthesis = {
    speaking: false,
    cancel() {
      pending.splice(0);
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
}

beforeEach(() => {
  spoken = [];
  pending = [];
  innerTextReads = 0;
});

afterEach(() => {
  stopSpeaking();
  env?.restore();
  env = null;
  delete globalThis.speechSynthesis;
  delete globalThis.SpeechSynthesisUtterance;
  delete globalThis.matchMedia;
});

describe('tts — coleta de blocos (IMP-38)', () => {
  it('não lê innerText de cada bloco/ancestral na coleta (só do bloco falado)', () => {
    env = installDocument((_doc, _html, body) => {
      const main = createElement('main');
      const ul = createElement('ul');
      for (let i = 0; i < 20; i++) {
        const li = watchInnerText(createElement('li'));
        const p = watchInnerText(createElement('p'));
        p.textContent = `Item ${i} da lista`;
        li.appendChild(p);
        ul.appendChild(li);
      }
      main.appendChild(ul);
      body.appendChild(main);
      installSpeech();
    });

    speakMainContent();

    // antes: ~2 leituras por <li> (próprio + como pai do <p>) + 1 por <p> ≈ 60; agora só a fala
    assert.ok(
      innerTextReads <= 2,
      `innerText lido ${innerTextReads}x durante a coleta`,
    );
    // continua escolhendo o bloco externo (li) e pulando o <p> aninhado
    assert.equal(spoken[0], 'Item 0 da lista');
  });
});

describe('tts — utterances curtas (IMP-38)', () => {
  const SENTENCA =
    'Esta é uma frase de teste com tamanho razoável para leitura.';
  const LONGO = Array.from({ length: 12 }, (_, i) => `${SENTENCA} (${i})`).join(
    ' ',
  );

  beforeEach(() => {
    env = installDocument((_doc, _html, body) => {
      const main = createElement('main');
      const p = createElement('p');
      p.textContent = LONGO;
      main.appendChild(p);
      body.appendChild(main);
      installSpeech();
    });
  });

  it('um parágrafo longo vira várias falas de no máximo 200 caracteres', () => {
    speakMainContent();
    let guarda = 0;
    while (pending.length && guarda++ < 100) pending.pop().onend();

    assert.ok(spoken.length > 1, 'deveria ter sido dividido em várias falas');
    for (const t of spoken) {
      assert.ok(t.length <= 200, `fala com ${t.length} caracteres`);
    }
  });

  it('nenhum texto se perde: as falas juntas reconstroem o parágrafo', () => {
    speakMainContent();
    let guarda = 0;
    while (pending.length && guarda++ < 100) pending.pop().onend();
    assert.equal(spoken.join(' '), LONGO);
  });

  it('uma palavra gigante sem espaços também respeita o limite', () => {
    document.querySelector('p').textContent = 'a'.repeat(450);
    speakMainContent();
    let guarda = 0;
    while (pending.length && guarda++ < 100) pending.pop().onend();
    assert.equal(spoken.join(''), 'a'.repeat(450));
    for (const t of spoken) assert.ok(t.length <= 200);
  });
});

describe('splitForSpeech (IMP-38)', () => {
  beforeEach(() => {
    env = installDocument(); // o afterEach do arquivo chama stopSpeaking()
  });

  it('não quebra número decimal colado à pontuação', () => {
    const frase = 'O valor é 3.14 reais e o desconto é de 2.5 por cento.';
    const texto = Array.from({ length: 8 }, () => frase).join(' ');
    const partes = splitForSpeech(texto, 120);
    assert.ok(partes.length > 1);
    for (const p of partes) {
      assert.ok(p.length <= 120);
      assert.ok(!/\d\.$/.test(p), `quebrou no meio de um decimal: "${p}"`);
    }
    assert.equal(partes.join(' '), texto);
  });

  it('texto curto volta inteiro, sem mexer', () => {
    assert.deepEqual(splitForSpeech('Olá, mundo.'), ['Olá, mundo.']);
  });
});
