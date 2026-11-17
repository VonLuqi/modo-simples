/**
 * Reprocess não reaplica a heurística enquanto o principal está por escolher
 * (confiança baixa): uma mutação do host (carrossel etc.) não pode aplicar o incerto.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import ModoSimples from '../../src/modo-simples.js';
import { installHappy, SAMPLE_PAGE } from './helpers/happyEnv.js';

let env;
let inst;

const $ = (s) => document.querySelector(s);
const marked = () =>
  document.querySelectorAll('[data-ms-hidden], [data-ms-principal]');
const banner = () => $('#ms-manual-select-banner');

function addHostNode() {
  const el = document.createElement('div');
  el.className = 'ad novo';
  el.textContent = 'slide do carrossel';
  document.body.appendChild(el);
}

beforeEach(() => {
  env = installHappy({ bodyHtml: SAMPLE_PAGE });
  // threshold impossível de atingir: força a seleção manual
  inst = new ModoSimples({
    confidenceThreshold: 2,
    persistence: false,
    reprocessDebounce: 20,
  });
  inst.init();
  inst.enable();
});

afterEach(() => {
  inst?.destroy();
  inst = null;
  env.restore();
});

describe('reprocess com principal por escolher', () => {
  it('mutação do host durante a seleção manual não aplica a heurística', async () => {
    assert.ok(banner(), 'seleção manual aberta');
    addHostNode();
    await env.wait(150);
    assert.equal(marked().length, 0);
    assert.ok(document.documentElement.classList.contains('ms-ativo'));
    assert.ok(banner(), 'a seleção continua aberta');
  });

  it('depois de o usuário escolher, o reprocess volta a funcionar (preserva a escolha)', async () => {
    $('main').dispatchEvent(
      new env.win.MouseEvent('click', { bubbles: true, cancelable: true }),
    );
    assert.ok($('main').hasAttribute('data-ms-principal'));
    addHostNode();
    await env.wait(150);
    assert.ok($('main').hasAttribute('data-ms-principal'));
    assert.equal($('.novo').getAttribute('data-ms-hidden'), 'true');
  });

  it('desligar e ligar o modo reinicia o fluxo (sem resto do bloqueio)', async () => {
    inst.disable();
    assert.equal(marked().length, 0);
    inst.enable();
    assert.ok(banner(), 'seleção manual reaberta');
    addHostNode();
    await env.wait(150);
    assert.equal(marked().length, 0);
  });
});
