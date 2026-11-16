/**
 * D3 — núcleo genérico: sem seletores do Senac nos defaults, barra de sessão opt-in,
 * mount configurável e config pré-boot (window.ModoSimplesConfig).
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { createElement, installDocument } from './helpers/miniDom.js';
import defaults from '../../src/config/defaults.js';
import ModoSimples, { readPreBootConfig } from '../../src/modo-simples.js';

let env;

beforeEach(() => {
  env = installDocument();
});

afterEach(() => {
  env?.restore();
  env = null;
});

describe('defaults genéricos (D3)', () => {
  it('sessionBar desligada e mount nulo por padrão', () => {
    assert.equal(defaults.sessionBar, false);
    assert.equal(defaults.mount, null);
  });

  it('seletores do protótipo Senac não estão mais nos defaults da lib', () => {
    for (const sel of ['.barra-superior', '.s1']) {
      assert.ok(!defaults.distractionSelectors.includes(sel), sel);
    }
  });
});

describe('readPreBootConfig (IMP-32 mínimo)', () => {
  it('lê window.ModoSimplesConfig quando é objeto', () => {
    const cfg = { sessionBar: true };
    assert.equal(readPreBootConfig({ ModoSimplesConfig: cfg }), cfg);
  });

  it('ignora ausente / não-objeto', () => {
    assert.deepEqual(readPreBootConfig({}), {});
    assert.deepEqual(readPreBootConfig({ ModoSimplesConfig: 'x' }), {});
    assert.deepEqual(readPreBootConfig(null), {});
  });

  it('config pré-boot sobrescreve defaults no construtor', () => {
    const inst = new ModoSimples(
      readPreBootConfig({
        ModoSimplesConfig: { sessionBar: true, position: 'top-left' },
      }),
    );
    assert.equal(inst._config.sessionBar, true);
    assert.equal(inst._config.position, 'top-left');
    assert.equal(
      inst._config.confidenceThreshold,
      defaults.confidenceThreshold,
    );
  });
});

describe('barra de sessão opt-in + mount (D3)', () => {
  it('default: nada é injetado no light DOM do host', () => {
    const inst = new ModoSimples();
    inst._syncSessionChrome();
    assert.equal(inst._chrome, null);
    assert.equal(document.querySelector('#ms-simples-chrome'), null);
    assert.equal(document.querySelector('#ms-session-bar'), null);
  });

  it('sessionBar sem mount: switch fixo e barra no topo do body (genérico)', () => {
    const existing = createElement('main');
    document.body.appendChild(existing);
    const inst = new ModoSimples({ sessionBar: true });
    inst._syncSessionChrome();

    const chrome = document.querySelector('#ms-simples-chrome');
    const bar = document.querySelector('#ms-session-bar');
    assert.ok(chrome.classList.contains('ms-simples-chrome--fixed'));
    assert.equal(document.body.children[0], bar);
    inst._chrome.destroy();
  });

  it('mount resolve a lista de seletores e insere a barra APÓS o âncora', () => {
    const header = createElement('header');
    header.className = 'topo';
    const inner = createElement('div');
    inner.className = 'topo-inner';
    header.appendChild(inner);
    document.body.appendChild(header);

    const inst = new ModoSimples({
      sessionBar: true,
      mount: {
        chrome: ['.nao-existe', '.topo-inner'],
        bar: ['.nao-existe', 'header'],
      },
    });
    inst._syncSessionChrome();

    assert.ok(document.querySelector('.topo-inner #ms-simples-chrome'));
    const bar = document.querySelector('#ms-session-bar');
    assert.equal(header.nextElementSibling, bar);
    inst._chrome.destroy();
  });

  it('desligar sessionBar em runtime remove o chrome', () => {
    const inst = new ModoSimples({ sessionBar: true });
    inst._syncSessionChrome();
    assert.ok(document.querySelector('#ms-session-bar'));
    inst._config = { ...inst._config, sessionBar: false };
    inst._syncSessionChrome();
    assert.equal(inst._chrome, null);
    assert.equal(document.querySelector('#ms-session-bar'), null);
  });

  it('seletor inválido em mount é ignorado (cai no genérico)', () => {
    const inst = new ModoSimples({
      sessionBar: true,
      mount: { chrome: ['::inválido:::'], bar: '::inválido:::' },
    });
    assert.doesNotThrow(() => inst._syncSessionChrome());
    assert.ok(document.querySelector('#ms-simples-chrome'));
    inst._chrome.destroy();
  });
});
