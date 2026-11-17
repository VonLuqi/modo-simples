/**
 * IMP-32/D3 — auto-boot lê window.ModoSimplesConfig antes do init.
 * O boot roda no import do módulo, então este arquivo prepara o ambiente primeiro
 * (um cenário por arquivo: o módulo só é avaliado uma vez por processo).
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

import { installHappy, SAMPLE_PAGE } from './helpers/happyEnv.js';

let env;
let mod;

before(async () => {
  env = installHappy({ bodyHtml: SAMPLE_PAGE });
  window.ModoSimplesConfig = {
    sessionBar: true,
    position: 'top-left',
    mount: { chrome: ['header'], bar: ['header'] },
    brand: { title: 'Minha marca' },
  };
  mod = await import('../../src/modo-simples.js');
});

after(() => {
  window.ModoSimples?.destroy();
  env.restore();
});

describe('boot com window.ModoSimplesConfig', () => {
  it('cria window.ModoSimples já inicializado com a classe exportada', () => {
    assert.ok(window.ModoSimples instanceof mod.default);
    assert.equal(window.ModoSimples._initialized, true);
  });

  it('a config pré-boot vale desde o init', () => {
    const cfg = window.ModoSimples._config;
    assert.equal(cfg.sessionBar, true);
    assert.equal(cfg.position, 'top-left');
    assert.equal(cfg.confidenceThreshold, 0.45); // defaults preservados
  });

  it('sessionBar + mount: barra após o header, switch dentro do header', () => {
    const header = document.querySelector('header');
    assert.equal(header.nextElementSibling.id, 'ms-session-bar');
    assert.ok(header.querySelector('#ms-simples-chrome'));
  });

  it('brand pré-boot aparece no painel', () => {
    const root = document.querySelector('#ms-container').shadowRoot;
    assert.equal(
      root.querySelector('#ms-a11y-title').textContent,
      'Minha marca',
    );
  });

  it('o FAB respeita position pré-boot', () => {
    const css = document
      .querySelector('#ms-container')
      .shadowRoot.querySelector('style').textContent;
    assert.ok(
      css.includes(
        'top: calc(1.5 * var(--ms-u));left: calc(1.5 * var(--ms-u));',
      ),
    );
  });

  it('API pública do window.ModoSimples está completa', () => {
    for (const m of ['enable', 'disable', 'toggle', 'configure', 'destroy']) {
      assert.equal(typeof window.ModoSimples[m], 'function', m);
    }
  });
});
