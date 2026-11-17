/**
 * F4d-1 — _onStateChange: régua de leitura (toggle + anúncio) e tema de cor (anúncio,
 * incluindo fallback para tema desconhecido). Chama _onStateChange(prev, next) direto.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import ModoSimples from '../../src/modo-simples.js';
import state from '../../src/core/state.js';
import { stopReadingRuler } from '../../src/features/readingRuler.js';
import { installHappy, SAMPLE_PAGE } from './helpers/happyEnv.js';

let env;
let inst;

const ruler = () => document.getElementById('ms-reading-ruler');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** textos anunciados (announce() preenche o texto após 50ms) */
async function anunciados() {
  await wait(80);
  return [...document.querySelectorAll('[data-ms-live]')].map(
    (n) => n.textContent,
  );
}

/** dispara _onStateChange com prev/next derivados do state atual + patches de options */
function mudar(prevOpts, nextOpts) {
  const base = state.get();
  const prev = { ...base, options: { ...base.options, ...prevOpts } };
  const next = { ...base, options: { ...base.options, ...nextOpts } };
  inst._onStateChange(prev, next);
}

beforeEach(() => {
  env = installHappy({ bodyHtml: SAMPLE_PAGE });
  inst = new ModoSimples();
  inst.init();
  // descarta anúncios do boot
  document.querySelectorAll('[data-ms-live]').forEach((n) => n.remove());
});

afterEach(() => {
  stopReadingRuler();
  inst?.destroy();
  env.restore();
});

describe('_onStateChange — régua de leitura', () => {
  it('ligar: cria a régua e anuncia "Régua de leitura ativada"', async () => {
    assert.equal(ruler(), null);
    mudar({ readingRuler: false }, { readingRuler: true });
    assert.ok(ruler());
    assert.deepEqual(await anunciados(), ['Régua de leitura ativada']);
  });

  it('desligar: remove a régua e anuncia "Régua de leitura desativada"', async () => {
    mudar({ readingRuler: false }, { readingRuler: true });
    assert.ok(ruler());
    document.querySelectorAll('[data-ms-live]').forEach((n) => n.remove());

    mudar({ readingRuler: true }, { readingRuler: false });
    assert.equal(ruler(), null);
    assert.deepEqual(await anunciados(), ['Régua de leitura desativada']);
  });

  it('sem mudança em readingRuler: não mexe na régua nem anuncia', async () => {
    mudar({ readingRuler: false }, { readingRuler: false });
    assert.equal(ruler(), null);
    assert.deepEqual(await anunciados(), []);
  });
});

describe('_onStateChange — tema de cor', () => {
  const casos = [
    ['senac', 'Tema Cores do site'],
    ['yellowBlack', 'Tema Amarelo e Preto'],
    ['darkHigh', 'Tema Modo Escuro Alto'],
    ['soft', 'Tema Descanso Suave'],
  ];

  for (const [tema, texto] of casos) {
    it(`"${tema}" anuncia "${texto}"`, async () => {
      mudar({ colorTheme: 'xx-anterior' }, { colorTheme: tema });
      assert.deepEqual(await anunciados(), [texto]);
    });
  }

  it('tema desconhecido cai no valor cru: "Tema <raw>"', async () => {
    mudar({ colorTheme: 'senac' }, { colorTheme: 'neon-custom' });
    assert.deepEqual(await anunciados(), ['Tema neon-custom']);
  });

  it('tema inalterado: não anuncia', async () => {
    mudar({ colorTheme: 'soft' }, { colorTheme: 'soft' });
    assert.deepEqual(await anunciados(), []);
  });
});
