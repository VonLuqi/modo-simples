/**
 * IMP-50 — a leitura segue a ORDEM DO DOCUMENTO.
 * Antes, collectBlocks percorria BLOCK_TAGS uma tag por vez: lia todos os h1, depois todos os h2,
 * depois os p... (títulos primeiro, parágrafos depois).
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { speakMainContent, stopSpeaking } from '../../src/features/tts.js';
import { installHappy } from './helpers/happyEnv.js';

let env;
let spoken;
const keys = ['speechSynthesis', 'SpeechSynthesisUtterance', 'matchMedia'];
let prev;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function lerPagina(html) {
  document.body.innerHTML = html;
  speakMainContent();
  await wait(80); // cada fala termina no próximo tick (onend) e encadeia a seguinte
  stopSpeaking();
  return spoken.slice();
}

beforeEach(() => {
  env = installHappy();
  spoken = [];
  prev = Object.fromEntries(keys.map((k) => [k, globalThis[k]]));
  globalThis.speechSynthesis = {
    speaking: false,
    cancel() {
      this.speaking = false;
    },
    speak(u) {
      spoken.push(u.text);
      setTimeout(() => u.onend?.(), 0);
    },
  };
  globalThis.SpeechSynthesisUtterance = function (text) {
    this.text = text;
  };
  globalThis.matchMedia = () => ({ matches: true });
});

afterEach(() => {
  stopSpeaking();
  for (const k of keys) {
    if (prev[k] === undefined) delete globalThis[k];
    else globalThis[k] = prev[k];
  }
  env.restore();
});

describe('ordem de leitura (IMP-50)', () => {
  it('títulos e parágrafos intercalados saem na ordem do documento', async () => {
    const lido = await lerPagina(`<main>
      <h1>Um</h1><p>Dois</p><h2>Três</h2><p>Quatro</p><h1>Cinco</h1><li>Seis</li><h3>Sete</h3>
    </main>`);
    assert.deepEqual(lido, [
      'Um',
      'Dois',
      'Três',
      'Quatro',
      'Cinco',
      'Seis',
      'Sete',
    ]);
  });

  it('bloco dentro de outro bloco (p dentro de li) é lido uma vez só', async () => {
    const lido = await lerPagina(
      '<main><h2>Lista</h2><ul><li>Item <p>interno</p></li></ul><p>Fim</p></main>',
    );
    assert.deepEqual(
      lido.map((t) => t.replace(/\s+/g, ' ').trim()),
      ['Lista', 'Item interno', 'Fim'],
    );
  });

  it('o que está oculto pelo Modo Simples continua fora da leitura, sem quebrar a ordem', async () => {
    const lido = await lerPagina(`<main>
      <h1>A</h1><p data-ms-hidden="true">oculto</p><p>B</p><h2>C</h2>
    </main>`);
    assert.deepEqual(lido, ['A', 'B', 'C']);
  });

  it('dt/dd/figcaption/blockquote entram na ordem do documento', async () => {
    const lido = await lerPagina(`<main>
      <p>P1</p><blockquote>Q1</blockquote><dl><dt>T1</dt><dd>D1</dd></dl><figure><figcaption>F1</figcaption></figure><h4>H4</h4>
    </main>`);
    assert.deepEqual(lido, ['P1', 'Q1', 'T1', 'D1', 'F1', 'H4']);
  });
});
