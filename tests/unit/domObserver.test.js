/**
 * IMP-45 — domObserver / reprocess (SPA). happy-dom fornece o MutationObserver real.
 *
 * Os dois testes marcados `todo` documentam bugs conhecidos (relatório de revisão,
 * IMP-01/IMP-02) que são escopo da Fase 2: eles descrevem o comportamento DESEJADO e
 * hoje falham de propósito — o runner os reporta como "todo", sem quebrar a suíte.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import defaults from '../../src/config/defaults.js';
import {
  startObserving,
  stopObserving,
} from '../../src/mutator/domObserver.js';
import {
  applyModoSimples,
  revert,
  revertModoSimples,
  setPrincipal,
} from '../../src/mutator/domMutator.js';
import { announce } from '../../src/utils/aria.js';
import { installHappy, SAMPLE_PAGE } from './helpers/happyEnv.js';

const DEBOUNCE = 25;
const config = {
  ...defaults,
  mainSelectors: ['main'],
  distractionSelectors: ['.ad'],
  reprocessDebounce: DEBOUNCE,
};

let env;
let on;
let reprocessCount;
let realMO;
let created;

/** Cada reprocess() termina em applyModoSimples → classList.add('ms-ativo'). */
function countReprocess() {
  const cl = document.documentElement.classList;
  const original = cl.add.bind(cl);
  cl.add = (...tokens) => {
    if (tokens.includes('ms-ativo')) reprocessCount += 1;
    return original(...tokens);
  };
}

const addAd = (text = 'novo anúncio') => {
  const el = document.createElement('div');
  el.className = 'ad novo';
  el.textContent = text;
  document.body.appendChild(el);
  return el;
};

beforeEach(() => {
  env = installHappy({ bodyHtml: SAMPLE_PAGE });
  created = [];
  realMO = globalThis.MutationObserver;
  globalThis.MutationObserver = class extends realMO {
    constructor(cb) {
      super(cb);
      created.push(this);
    }
  };
  on = true;
  reprocessCount = 0;
  applyModoSimples({ options: {} }, config);
  countReprocess();
});

afterEach(() => {
  stopObserving();
  revert();
  globalThis.MutationObserver = realMO;
  env.restore();
});

const start = () =>
  startObserving(() => ({ modoSimples: on, options: {} }), config);
const settle = () => env.wait(DEBOUNCE * 4);

describe('startObserving / stopObserving', () => {
  it('startObserving é idempotente (um único MutationObserver)', () => {
    start();
    start();
    assert.equal(created.length, 1);
  });

  it('com Modo Simples desligado, mutações são ignoradas', async () => {
    on = false;
    start();
    addAd();
    await settle();
    assert.equal(reprocessCount, 0);
  });

  it('com Modo Simples ligado, novo nó casando seletor é oculto após o debounce', async () => {
    start();
    const ad = addAd();
    assert.equal(ad.getAttribute('data-ms-hidden'), null); // ainda no debounce
    await settle();
    assert.equal(ad.getAttribute('data-ms-hidden'), 'true');
  });

  it('várias mutações em rajada viram um único reprocess (debounce)', async () => {
    start();
    addAd('1');
    addAd('2');
    addAd('3');
    await settle();
    assert.equal(reprocessCount, 1);
  });

  it('mutações que só removem nós não disparam reprocess', async () => {
    start();
    document.querySelector('aside').remove();
    await settle();
    assert.equal(reprocessCount, 0);
  });

  it('stopObserving cancela o reprocess pendente e desconecta', async () => {
    start();
    addAd();
    stopObserving();
    await settle();
    assert.equal(reprocessCount, 0);
    addAd();
    await settle();
    assert.equal(reprocessCount, 0);
  });

  it('reprocessDebounce usa o valor da config', async () => {
    startObserving(() => ({ modoSimples: true, options: {} }), {
      ...config,
      reprocessDebounce: 200,
    });
    addAd();
    await env.wait(DEBOUNCE * 2);
    assert.equal(reprocessCount, 0);
    await env.wait(250);
    assert.equal(reprocessCount, 1);
  });
});

describe('regressões do observer (F2)', () => {
  it('nós da própria lib (announce) não disparam reprocess (IMP-01)', async () => {
    start();
    announce('Painel de acessibilidade aberto');
    await settle();
    assert.equal(reprocessCount, 0);
  });

  it('nós injetados pela lib (host, barra, pills injetadas, régua) não disparam reprocess (IMP-01)', async () => {
    start();
    for (const html of [
      '<div id="ms-container"></div>',
      '<div id="ms-session-bar"></div>',
      '<nav data-ms-pills data-ms-injected></nav>',
      '<div id="ms-reading-ruler"></div>',
    ]) {
      document.body.insertAdjacentHTML('beforeend', html);
    }
    await settle();
    assert.equal(reprocessCount, 0);
  });

  it('nó do host adicionado junto com um anúncio da lib ainda reprocessa', async () => {
    start();
    announce('x');
    addAd();
    await settle();
    assert.equal(reprocessCount > 0, true);
  });

  it('o principal escolhido manualmente sobrevive ao reprocess (IMP-02)', async () => {
    const escolhido = document.createElement('section');
    escolhido.textContent = 'conteúdo escolhido pelo usuário';
    document.body.appendChild(escolhido);
    setPrincipal(escolhido, config);
    start();
    addAd();
    await settle();
    assert.ok(escolhido.hasAttribute('data-ms-principal'));
    assert.equal(
      document.querySelector('main').hasAttribute('data-ms-principal'),
      false,
    );
  });

  it('se o host recria o principal manual, reaplica pelo caminho CSS (IMP-02)', async () => {
    const wrap = document.createElement('div');
    wrap.id = 'conteudo-escolhido';
    wrap.textContent = 'escolhido';
    document.body.appendChild(wrap);
    setPrincipal(wrap, config);
    start();
    // SPA troca o nó por outro com o mesmo id
    wrap.remove();
    const novo = document.createElement('div');
    novo.id = 'conteudo-escolhido';
    novo.textContent = 'novo';
    document.body.appendChild(novo);
    await settle();
    assert.ok(novo.hasAttribute('data-ms-principal'));
  });

  it('desligar o Modo Simples esquece a escolha manual (reprocess volta à heurística)', async () => {
    const escolhido = document.createElement('section');
    escolhido.textContent = 'x';
    document.body.appendChild(escolhido);
    setPrincipal(escolhido, config);
    revertModoSimples();
    applyModoSimples({ options: {} }, config);
    start();
    addAd();
    await settle();
    assert.equal(escolhido.hasAttribute('data-ms-principal'), false);
    assert.ok(document.querySelector('main').hasAttribute('data-ms-principal'));
  });
});
