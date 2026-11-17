/**
 * F4d QA LOW-1 — ramos de instancePersistence antes sem teste:
 *  - loadPrincipal: flag `legacy` (registro da página x registro antigo por host)
 *  - isPlausiblePrincipal: limite de 50% do textLen gravado
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import ModoSimples from '../../src/modo-simples.js';
import persistence from '../../src/core/persistence.js';
import { installHappy } from './helpers/happyEnv.js';

let env;
let inst;

beforeEach(() => {
  env = installHappy({
    bodyHtml: '<main>conteúdo</main>',
    url: 'https://exemplo.test/pagina-a.html',
  });
  inst = new ModoSimples();
  inst.init();
});
afterEach(() => {
  inst?.destroy();
  env.restore();
});

describe('loadPrincipal — flag legacy', () => {
  it('registro objeto DA PÁGINA: legacy=false', () => {
    persistence.saveForPath('principal', { path: '#a', textLen: 500 });
    assert.deepEqual(inst._loadPrincipal(), {
      path: '#a',
      textLen: 500,
      legacy: false,
    });
  });

  it('registro objeto antigo POR HOST (sem registro da página): legacy=true', () => {
    persistence.saveForHost('principal', { path: '#b', textLen: 500 });
    assert.deepEqual(inst._loadPrincipal(), {
      path: '#b',
      textLen: 500,
      legacy: true,
    });
  });

  it('registro string antigo por host: legacy=true e textLen=null', () => {
    persistence.saveForHost('principal', '#c');
    assert.deepEqual(inst._loadPrincipal(), {
      path: '#c',
      textLen: null,
      legacy: true,
    });
  });
});

describe('isPlausiblePrincipal — limite de 50% do tamanho gravado', () => {
  const el = (n) => ({ textContent: 'x'.repeat(n) });
  const saved = { path: '#a', textLen: 1000, legacy: false };

  it('40% do tamanho gravado: rejeita', () => {
    assert.equal(inst._isPlausiblePrincipal(el(400), saved), false);
  });

  it('exatamente 50%: aceita', () => {
    assert.equal(inst._isPlausiblePrincipal(el(500), saved), true);
  });

  it('60% do tamanho gravado: aceita', () => {
    assert.equal(inst._isPlausiblePrincipal(el(600), saved), true);
  });
});
