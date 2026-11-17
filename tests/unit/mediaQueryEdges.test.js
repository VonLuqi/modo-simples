/**
 * A-04 (F4b) — mediaQuery: consultas exatas, evento 'change', MediaQueryList sem
 * nenhum método de escuta e ausência de window. Complementa mediaQuery.test.js e
 * mediaQueryFallback.test.js.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  prefersReducedMotion,
  prefersHighContrast,
  onReducedMotionChange,
} from '../../src/utils/mediaQuery.js';
import { installHappy } from './helpers/happyEnv.js';

let env;

beforeEach(() => {
  env = installHappy();
});
afterEach(() => env.restore());

describe('mediaQuery — consultas', () => {
  it('cada helper pergunta a media query certa', () => {
    const pedidas = [];
    env.win.matchMedia = (q) => {
      pedidas.push(q);
      return { matches: false };
    };
    prefersReducedMotion();
    prefersHighContrast();
    assert.deepEqual(pedidas, [
      '(prefers-reduced-motion: reduce)',
      '(prefers-contrast: more)',
    ]);
  });

  it('prefersHighContrast é false quando a consulta não casa', () => {
    env.win.matchMedia = () => ({ matches: false });
    assert.equal(prefersHighContrast(), false);
  });

  it('as duas consultas são independentes', () => {
    env.win.matchMedia = (q) => ({ matches: q.includes('contrast') });
    assert.equal(prefersHighContrast(), true);
    assert.equal(prefersReducedMotion(), false);
  });
});

describe('onReducedMotionChange', () => {
  it('registra o evento "change" e o unsubscribe remove o mesmo callback', () => {
    const registros = [];
    const remocoes = [];
    env.win.matchMedia = () => ({
      matches: false,
      addEventListener: (tipo, cb) => registros.push([tipo, cb]),
      removeEventListener: (tipo, cb) => remocoes.push([tipo, cb]),
    });
    const cb = () => {};
    const off = onReducedMotionChange(cb);
    assert.deepEqual(registros, [['change', cb]]);
    off();
    assert.deepEqual(remocoes, [['change', cb]]);
  });

  it('prefere addEventListener quando o MediaQueryList tem os dois formatos', () => {
    let viaListener = 0;
    let viaEvent = 0;
    env.win.matchMedia = () => ({
      matches: false,
      addEventListener: () => (viaEvent += 1),
      removeEventListener: () => {},
      addListener: () => (viaListener += 1),
      removeListener: () => {},
    });
    onReducedMotionChange(() => {});
    assert.equal(viaEvent, 1);
    assert.equal(viaListener, 0);
  });

  it('MediaQueryList sem addEventListener nem addListener: unsubscribe inofensivo', () => {
    env.win.matchMedia = () => ({ matches: false });
    let off;
    assert.doesNotThrow(() => {
      off = onReducedMotionChange(() => {});
    });
    assert.equal(typeof off, 'function');
    assert.doesNotThrow(() => off());
  });
});

describe('mediaQuery — sem window', () => {
  it('window indefinido: prefers* devolvem false e o unsubscribe é no-op', () => {
    const original = globalThis.window;
    globalThis.window = undefined;
    try {
      assert.equal(prefersReducedMotion(), false);
      assert.equal(prefersHighContrast(), false);
      const off = onReducedMotionChange(() => {});
      assert.doesNotThrow(() => off());
    } finally {
      globalThis.window = original;
    }
  });
});
