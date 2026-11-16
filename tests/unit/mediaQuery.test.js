/**
 * A-04 — wrappers de media query (mediaQuery.js) com matchMedia stub.
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
let queries;

/** Instala um matchMedia que guarda os listeners por consulta. */
function stubMatchMedia(matches = {}) {
  queries = {};
  env.win.matchMedia = (query) => {
    const listeners = new Set();
    const mq = {
      media: query,
      matches: !!matches[query],
      addEventListener: (_t, cb) => listeners.add(cb),
      removeEventListener: (_t, cb) => listeners.delete(cb),
      listeners,
    };
    queries[query] = mq;
    return mq;
  };
}

beforeEach(() => {
  env = installHappy();
});
afterEach(() => env.restore());

describe('mediaQuery', () => {
  it('prefersReducedMotion reflete a consulta do SO', () => {
    stubMatchMedia({ '(prefers-reduced-motion: reduce)': true });
    assert.equal(prefersReducedMotion(), true);
    stubMatchMedia({});
    assert.equal(prefersReducedMotion(), false);
  });

  it('prefersHighContrast usa (prefers-contrast: more)', () => {
    stubMatchMedia({ '(prefers-contrast: more)': true });
    assert.equal(prefersHighContrast(), true);
  });

  it('onReducedMotionChange registra o callback e devolve o unsubscribe', () => {
    stubMatchMedia({});
    let chamadas = 0;
    const off = onReducedMotionChange(() => {
      chamadas += 1;
    });
    const mq = queries['(prefers-reduced-motion: reduce)'];
    assert.equal(mq.listeners.size, 1);
    mq.listeners.forEach((cb) => cb({ matches: true }));
    assert.equal(chamadas, 1);

    off();
    assert.equal(mq.listeners.size, 0);
  });
});
