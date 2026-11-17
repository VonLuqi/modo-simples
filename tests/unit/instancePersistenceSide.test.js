/**
 * W4d — lado do painel/FAB persistido: loadPanelSide / savePanelSide (instancePersistence.js).
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  loadPanelSide,
  savePanelSide,
} from '../../src/core/instancePersistence.js';
import { installHappy } from './helpers/happyEnv.js';

let env;

const ms = (over = {}) => ({
  _config: {
    position: 'bottom-right',
    persistence: true,
    hostnamePersistence: true,
    ...over,
  },
});
const HOST_KEY = 'ms_panelSide:exemplo.test';
const GLOBAL_KEY = 'ms_panelSide';

beforeEach(() => {
  env = installHappy();
});
afterEach(() => env.restore());

describe('loadPanelSide', () => {
  it('sem registro: usa o lado do config.position', () => {
    assert.equal(loadPanelSide(ms({ position: 'bottom-right' })), 'right');
    assert.equal(loadPanelSide(ms({ position: 'top-right' })), 'right');
    assert.equal(loadPanelSide(ms({ position: 'bottom-left' })), 'left');
    assert.equal(loadPanelSide(ms({ position: 'top-left' })), 'left');
  });

  it('registro válido por host vence o config.position', () => {
    localStorage.setItem(HOST_KEY, JSON.stringify('left'));
    assert.equal(loadPanelSide(ms({ position: 'bottom-right' })), 'left');
    localStorage.setItem(HOST_KEY, JSON.stringify('right'));
    assert.equal(loadPanelSide(ms({ position: 'bottom-left' })), 'right');
  });

  it('registro inválido (valor estranho, número, JSON quebrado) cai no padrão', () => {
    for (const raw of [JSON.stringify('cima'), '42', 'null', '{quebrado']) {
      localStorage.setItem(HOST_KEY, raw);
      assert.equal(loadPanelSide(ms({ position: 'bottom-left' })), 'left', raw);
    }
  });

  it('hostnamePersistence=false lê a chave global, não a do host', () => {
    localStorage.setItem(HOST_KEY, JSON.stringify('left'));
    assert.equal(loadPanelSide(ms({ hostnamePersistence: false })), 'right');
    localStorage.setItem(GLOBAL_KEY, JSON.stringify('left'));
    assert.equal(loadPanelSide(ms({ hostnamePersistence: false })), 'left');
  });

  it('persistence=false ignora o que estiver salvo', () => {
    localStorage.setItem(HOST_KEY, JSON.stringify('left'));
    assert.equal(loadPanelSide(ms({ persistence: false })), 'right');
  });

  it('storage que lança: cai no padrão sem erro', () => {
    globalThis.localStorage = {
      getItem() {
        throw new Error('bloqueado');
      },
    };
    assert.equal(loadPanelSide(ms({ position: 'top-left' })), 'left');
  });
});

describe('savePanelSide', () => {
  it('grava em ms_panelSide:<host> quando hostnamePersistence', () => {
    savePanelSide(ms(), 'left');
    assert.equal(JSON.parse(localStorage.getItem(HOST_KEY)), 'left');
    assert.equal(localStorage.getItem(GLOBAL_KEY), null);
  });

  it('hostnamePersistence=false grava na chave global', () => {
    savePanelSide(ms({ hostnamePersistence: false }), 'right');
    assert.equal(JSON.parse(localStorage.getItem(GLOBAL_KEY)), 'right');
    assert.equal(localStorage.getItem(HOST_KEY), null);
  });

  it('persistence=false não grava nada', () => {
    savePanelSide(ms({ persistence: false }), 'left');
    assert.equal(localStorage.length, 0);
  });

  it('ida e volta: o que foi salvo é o que load devolve', () => {
    savePanelSide(ms(), 'left');
    assert.equal(loadPanelSide(ms({ position: 'bottom-right' })), 'left');
  });

  it('storage que lança: não propaga o erro', () => {
    globalThis.localStorage = {
      setItem() {
        throw new Error('quota');
      },
    };
    assert.doesNotThrow(() => savePanelSide(ms(), 'left'));
  });
});
