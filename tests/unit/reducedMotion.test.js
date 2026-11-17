/**
 * IMP-14 — prefers-reduced-motion é valor derivado: só vira escolha salva se o usuário mexer.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import ModoSimples from '../../src/modo-simples.js';
import state from '../../src/core/state.js';
import { installHappy, SAMPLE_PAGE } from './helpers/happyEnv.js';

let env;
let inst;
let reduce;
let listeners;

const KEY = 'ms_state:exemplo.test';
const saved = () => JSON.parse(localStorage.getItem(KEY));

function stubOs(initial) {
  reduce = initial;
  listeners = new Set();
  env.win.matchMedia = (query) => ({
    media: query,
    get matches() {
      return query.includes('reduce') && reduce;
    },
    addEventListener: (_t, cb) => listeners.add(cb),
    removeEventListener: (_t, cb) => listeners.delete(cb),
  });
}
const osChange = (value) => {
  reduce = value;
  listeners.forEach((cb) => cb({ matches: value }));
};
const panelSwitch = () =>
  document
    .querySelector('#ms-container')
    .shadowRoot.querySelector('.ms-switch[data-option="reducedMotion"]');

beforeEach(() => {
  env = installHappy({ bodyHtml: SAMPLE_PAGE });
});
afterEach(() => {
  inst?.destroy();
  env.restore();
});

describe('reducedMotion derivado do SO (IMP-14)', () => {
  it('SO pede reduzir: liga na sessão, mas NÃO grava como escolha do usuário', () => {
    stubOs(true);
    inst = new ModoSimples();
    inst.init();
    assert.equal(state.get().options.reducedMotion, true);
    assert.ok(document.documentElement.classList.contains('ms-reduced-motion'));
    inst.enable(); // força um persist
    assert.equal(saved().options.reducedMotion, null);
  });

  it('o usuário consegue desligar mesmo com o SO pedindo reduzir, e a escolha persiste', () => {
    stubOs(true);
    inst = new ModoSimples();
    inst.init();
    panelSwitch().click(); // desliga
    assert.equal(state.get().options.reducedMotion, false);
    assert.equal(saved().options.reducedMotion, false);
    inst.destroy();

    inst = new ModoSimples();
    inst.init(); // próxima visita, SO ainda pede reduzir
    assert.equal(state.get().options.reducedMotion, false);
  });

  it('sem escolha do usuário, mudar a preferência do SO acompanha nos dois sentidos', () => {
    stubOs(false);
    inst = new ModoSimples();
    inst.init();
    assert.equal(state.get().options.reducedMotion, false);
    osChange(true);
    assert.equal(state.get().options.reducedMotion, true);
    osChange(false);
    assert.equal(state.get().options.reducedMotion, false);
  });

  it('com escolha do usuário, o SO não sobrescreve', () => {
    stubOs(false);
    inst = new ModoSimples();
    inst.init();
    panelSwitch().click(); // liga explicitamente
    assert.equal(saved().options.reducedMotion, true);
    osChange(false);
    assert.equal(state.get().options.reducedMotion, true);
  });

  it('escolha salva (true) volta mesmo com o SO sem preferência', () => {
    stubOs(false);
    localStorage.setItem(
      KEY,
      JSON.stringify({ modoSimples: false, options: { reducedMotion: true } }),
    );
    inst = new ModoSimples();
    inst.init();
    assert.equal(state.get().options.reducedMotion, true);
  });
});
