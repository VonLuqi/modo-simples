/**
 * F4c LOW-1 — injectPageStyles sem CSS não injeta <style> vazio
 * (um <style id> vazio travaria a injeção real depois, pela guarda de idempotência).
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { installDocument } from './helpers/miniDom.js';
import { injectPageStyles } from '../../src/mutator/domMutator.js';

let env;

beforeEach(() => {
  env = installDocument();
});
afterEach(() => {
  env?.restore();
  env = null;
});

const styleEl = () => document.getElementById('ms-page-styles');

describe('injectPageStyles (LOW-1)', () => {
  it('sem argumento ou com string vazia não cria <style>', () => {
    injectPageStyles();
    injectPageStyles('');
    assert.equal(styleEl(), null);
  });

  it('chamada vazia seguida de chamada com CSS injeta o CSS', () => {
    injectPageStyles();
    injectPageStyles('.x{color:red}');
    assert.ok(styleEl());
    assert.equal(styleEl().textContent, '.x{color:red}');
  });

  it('é idempotente: a segunda chamada com CSS não duplica nem sobrescreve', () => {
    injectPageStyles('.a{}');
    injectPageStyles('.b{}');
    assert.equal(styleEl().textContent, '.a{}');
  });
});
