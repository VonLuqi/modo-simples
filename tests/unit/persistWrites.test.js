/**
 * IMP-39 — localStorage só é regravado quando o estado persistido muda.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import ModoSimples from '../../src/modo-simples.js';
import state from '../../src/core/state.js';
import persistence from '../../src/core/persistence.js';
import { installHappy, SAMPLE_PAGE } from './helpers/happyEnv.js';

let env;
let inst;
let writes;
let realSave;

beforeEach(() => {
  env = installHappy({ bodyHtml: SAMPLE_PAGE });
  inst = new ModoSimples();
  inst.init();
  writes = [];
  // espiona a camada de persistência (chaves SEM o prefixo ms_ da camada de storage)
  realSave = persistence.save;
  persistence.save = function (key, value) {
    writes.push(key);
    return realSave.call(this, key, value);
  };
});
afterEach(() => {
  persistence.save = realSave;
  inst?.destroy();
  env.restore();
});

const stateWrites = () => writes.filter((k) => k === 'state:exemplo.test');

describe('persistência sem regravar à toa (IMP-39)', () => {
  it('abrir e fechar o painel não grava (panelOpen não é persistido)', () => {
    state.set({ panelOpen: true });
    state.set({ panelOpen: false });
    assert.equal(stateWrites().length, 0);
  });

  it('mudar uma opção grava uma vez', () => {
    state.set({ options: { textScale: '150' } });
    assert.equal(stateWrites().length, 1);
    assert.equal(
      JSON.parse(localStorage.getItem('ms_state:exemplo.test')).options
        .textScale,
      '150',
    );
  });

  it('repetir o mesmo valor não regrava', () => {
    state.set({ options: { textScale: '150' } });
    state.set({ options: { textScale: '150' } });
    assert.equal(stateWrites().length, 1);
  });

  it('ligar/desligar o MS grava a cada transição real', () => {
    inst.enable();
    inst.disable();
    assert.ok(stateWrites().length >= 2);
  });

  it('depois de destroy() + init() a primeira mudança volta a gravar', () => {
    state.set({ options: { textScale: '125' } });
    inst.destroy();
    inst = new ModoSimples();
    inst.init();
    writes.length = 0;
    state.set({ options: { textScale: '175' } });
    assert.equal(stateWrites().length, 1);
  });
});
