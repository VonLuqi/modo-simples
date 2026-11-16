/**
 * Auto-boot sem window.ModoSimplesConfig: defaults genéricos (só FAB + painel).
 * Arquivo separado do bootConfig: o módulo é avaliado uma vez por processo.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

import { installHappy, SAMPLE_PAGE } from './helpers/happyEnv.js';

let env;

before(async () => {
  env = installHappy({ bodyHtml: SAMPLE_PAGE });
  await import('../../src/modo-simples.js');
});

after(() => {
  window.ModoSimples?.destroy();
  env.restore();
});

describe('boot sem config pré-boot', () => {
  it('window.ModoSimples existe e usa os defaults', () => {
    assert.ok(window.ModoSimples);
    assert.equal(window.ModoSimples._config.sessionBar, false);
    assert.equal(window.ModoSimples._config.mount, null);
  });

  it('injeta só o host (FAB + painel); nada de barra no light DOM', () => {
    assert.equal(document.querySelectorAll('#ms-container').length, 1);
    assert.equal(document.querySelector('#ms-session-bar'), null);
    assert.equal(document.querySelector('#ms-simples-chrome'), null);
    assert.equal(document.querySelector('#ms-lexend-font'), null);
  });
});
