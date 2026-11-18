/**
 * ADR-015 (L33): toda opção da Fase 8 precisa estar no conjunto padrão do "Desligar tudo"
 * (RESET_OPTIONS), no estado inicial, no optionKeys do orquestrador e na sanitização persistida.
 * Auditoria guarda-chuva: uma opção nova esquecida em qualquer lugar derruba este teste.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import ModoSimples from '../../src/modo-simples.js';
import state from '../../src/core/state.js';
import { hydratePersistedState } from '../../src/core/persistedState.js';
import { installHappy, SAMPLE_PAGE } from './helpers/happyEnv.js';

const src = (f) =>
  readFileSync(new URL(`../../src/${f}`, import.meta.url), 'utf8');

/** Chaves F8: valor não-padrão válido + classe esperada no <html> (null = só valor). */
const F8 = [
  ['colorTheme', 'mono', 'ms-theme-mono'],
  ['colorTheme', 'lightHigh', 'ms-theme-lightHigh'],
  ['colorSaturation', 'low', 'ms-sat-low'],
  ['colorSaturation', 'high', 'ms-sat-high'],
  ['customText', '#14532d', 'ms-custom-text'],
  ['customHeading', '#7f1d1d', 'ms-custom-heading'],
  ['customBg', '#fffbe6', 'ms-custom-bg'],
  ['lineHeight', 1.8, 'ms-lh'],
  ['wordSpacing', 0.2, 'ms-ws'],
  ['letterSpacing', 0.1, 'ms-ls'],
  ['cursorStyle', 'bigWhite', 'ms-cursor-white'],
  ['cursorStyle', 'bigBlack', 'ms-cursor-black'],
];
const F8_KEYS = [...new Set(F8.map(([k]) => k))];

let env;
let inst;
let DEFAULTS;
const html = () => document.documentElement;

beforeEach(() => {
  env = installHappy({ bodyHtml: SAMPLE_PAGE });
  inst = new ModoSimples();
  inst.init();
  DEFAULTS = { ...state.get().options };
});
afterEach(() => {
  inst?.destroy();
  env.restore();
});

/** Chaves de um literal `const NOME = { ... };` no código-fonte. */
const chavesDoObjeto = (texto, nome) => {
  const ini = texto.indexOf(`const ${nome} = {`);
  assert.ok(ini >= 0, `${nome} não encontrado`);
  const corpo = texto.slice(ini, texto.indexOf('\n};', ini));
  return [...corpo.matchAll(/^\s{2}(\w+):/gm)].map((m) => m[1]);
};

describe('F8 — conjunto padrão do Desligar tudo (ADR-015)', () => {
  it('RESET_OPTIONS tem exatamente as chaves do estado inicial', () => {
    assert.deepEqual(
      chavesDoObjeto(src('ui/binding.js'), 'RESET_OPTIONS').sort(),
      Object.keys(DEFAULTS).sort(),
    );
  });

  it('todas as chaves F8 existem no estado inicial', () => {
    for (const k of F8_KEYS) assert.ok(k in DEFAULTS, k);
  });

  it('optionKeys do orquestrador cobre toda opção do estado (exceto as de sessão)', () => {
    const t = src('modo-simples.js');
    const ini = t.indexOf('const optionKeys = [');
    const lista = [
      ...t.slice(ini, t.indexOf('];', ini)).matchAll(/'(\w+)'/g),
    ].map((m) => m[1]);
    for (const k of Object.keys(DEFAULTS))
      assert.ok(lista.includes(k), `optionKeys sem ${k}`);
  });

  it('sanitização persistida mantém cada valor F8 válido e descarta lixo', () => {
    for (const [k, v] of F8) {
      assert.equal(
        hydratePersistedState({ options: { [k]: v } }).options[k],
        v,
        `${k}=${v}`,
      );
      const lixo = hydratePersistedState({ options: { [k]: { x: 1 } } })
        .options[k];
      assert.equal(lixo, DEFAULTS[k], `${k}: lixo deve voltar ao padrão`);
    }
  });

  it('cada valor F8 chega ao <html> e o Desligar tudo devolve o padrão e limpa tudo', () => {
    for (const [k, v, cls] of F8) {
      state.set({ options: { [k]: v } });
      assert.ok(html().classList.contains(cls), `${k}=${v} → ${cls}`);
      inst._resetAll();
      assert.equal(state.get().options[k], DEFAULTS[k], `${k} volta ao padrão`);
      assert.equal(html().classList.contains(cls), false, `${cls} some`);
    }
    assert.deepEqual(state.get().options, DEFAULTS);
    for (const p of [
      '--ms-lh',
      '--ms-ws',
      '--ms-ls',
      '--ms-custom-text',
      '--ms-custom-bg',
      '--ms-custom-heading',
      '--ms-custom-link',
    ])
      assert.equal(html().style.getPropertyValue(p), '', p);
  });

  it('todas as chaves F8 de uma vez: reset único zera o conjunto inteiro', () => {
    const tudo = {};
    for (const [k, v] of F8) tudo[k] = v;
    state.set({ options: tudo });
    inst._resetAll();
    for (const k of F8_KEYS)
      assert.equal(state.get().options[k], DEFAULTS[k], k);
  });
});
