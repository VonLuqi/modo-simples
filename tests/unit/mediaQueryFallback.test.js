/**
 * IMP-28 — mediaQuery.js sem matchMedia e em browsers antigos (Safari < 14).
 * Antes: window.matchMedia sem guarda lançava TypeError no init, e mq.addEventListener('change')
 * não existe em MediaQueryList antigo (só addListener/removeListener).
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import ModoSimples from '../../src/modo-simples.js';
import {
  prefersReducedMotion,
  prefersHighContrast,
  onReducedMotionChange,
} from '../../src/utils/mediaQuery.js';
import { installHappy, SAMPLE_PAGE } from './helpers/happyEnv.js';

let env;
let inst;

beforeEach(() => {
  env = installHappy({ bodyHtml: SAMPLE_PAGE });
});

afterEach(() => {
  inst?.destroy();
  inst = null;
  env.restore();
});

function semMatchMedia() {
  env.win.matchMedia = undefined;
  globalThis.matchMedia = undefined;
}

/** MediaQueryList "antigo": só addListener/removeListener */
function matchMediaLegado() {
  const ouvintes = new Set();
  const mq = {
    matches: false,
    addListener: (cb) => ouvintes.add(cb),
    removeListener: (cb) => ouvintes.delete(cb),
    ouvintes,
  };
  env.win.matchMedia = () => mq;
  return mq;
}

describe('sem window.matchMedia (IMP-28)', () => {
  it('prefers* assumem "não pediu" em vez de lançar', () => {
    semMatchMedia();
    assert.equal(prefersReducedMotion(), false);
    assert.equal(prefersHighContrast(), false);
  });

  it('onReducedMotionChange devolve um cancelamento inofensivo', () => {
    semMatchMedia();
    const cancelar = onReducedMotionChange(() => {});
    assert.equal(typeof cancelar, 'function');
    assert.doesNotThrow(() => cancelar());
  });

  it('a lib sobe e desce sem lançar', () => {
    semMatchMedia();
    inst = new ModoSimples({ persistence: false });
    assert.doesNotThrow(() => inst.init());
    assert.doesNotThrow(() => inst.destroy());
  });
});

describe('MediaQueryList antigo, só addListener (IMP-28)', () => {
  it('registra, recebe a mudança e cancela com removeListener', () => {
    const mq = matchMediaLegado();
    const chamadas = [];
    const cancelar = onReducedMotionChange((e) => chamadas.push(e));

    assert.equal(mq.ouvintes.size, 1, 'registrou via addListener');
    for (const cb of mq.ouvintes) cb({ matches: true });
    assert.equal(chamadas.length, 1);

    cancelar();
    assert.equal(mq.ouvintes.size, 0, 'cancelou via removeListener');
  });

  it('a lib sobe com MediaQueryList antigo', () => {
    matchMediaLegado();
    inst = new ModoSimples({ persistence: false });
    assert.doesNotThrow(() => inst.init());
  });
});
