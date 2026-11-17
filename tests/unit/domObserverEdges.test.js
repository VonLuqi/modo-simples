/**
 * A-04 (F4b) — domObserver: o que conta como mutação relevante, religar depois de
 * parar e defaults de debounce. Complementa domObserver.test.js.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import defaults from '../../src/config/defaults.js';
import {
  startObserving,
  stopObserving,
} from '../../src/mutator/domObserver.js';
import { applyModoSimples, revert } from '../../src/mutator/domMutator.js';
import { installHappy, SAMPLE_PAGE } from './helpers/happyEnv.js';

const DEBOUNCE = 25;
const config = {
  ...defaults,
  mainSelectors: ['main'],
  distractionSelectors: ['.ad'],
  reprocessDebounce: DEBOUNCE,
};

let env;
let reprocessCount;

/** Cada reprocess() termina em applyModoSimples → classList.add('ms-ativo'). */
function countReprocess() {
  const cl = document.documentElement.classList;
  const original = cl.add.bind(cl);
  cl.add = (...tokens) => {
    if (tokens.includes('ms-ativo')) reprocessCount += 1;
    return original(...tokens);
  };
}

const start = (cfg = config) =>
  startObserving(() => ({ modoSimples: true, options: {} }), cfg);
const settle = () => env.wait(DEBOUNCE * 4);

beforeEach(() => {
  env = installHappy({ bodyHtml: SAMPLE_PAGE });
  reprocessCount = 0;
  applyModoSimples({ options: {} }, config);
  countReprocess();
});

afterEach(() => {
  stopObserving();
  revert();
  env.restore();
});

describe('domObserver — relevância da mutação', () => {
  it('só atributo/texto alterado em nó existente não reprocessa', async () => {
    start();
    document.querySelector('main').setAttribute('data-x', '1');
    document.querySelector('main').firstChild.textContent = 'outro texto';
    await settle();
    assert.equal(reprocessCount, 0);
  });

  it('nó de texto adicionado pelo host conta como mutação relevante', async () => {
    start();
    document.body.appendChild(document.createTextNode('texto solto'));
    await settle();
    assert.equal(reprocessCount, 1);
  });

  it('nó adicionado DENTRO de um nó da lib não reprocessa', async () => {
    const own = document.createElement('div');
    own.id = 'ms-container';
    document.body.appendChild(own);
    start();
    own.appendChild(document.createElement('span'));
    await settle();
    assert.equal(reprocessCount, 0);
  });
});

describe('domObserver — ciclo de vida', () => {
  it('stopObserving sem start prévio não lança', () => {
    assert.doesNotThrow(() => stopObserving());
  });

  it('pode religar depois de parar e volta a reprocessar', async () => {
    start();
    stopObserving();
    start();
    const ad = document.createElement('div');
    ad.className = 'ad';
    document.body.appendChild(ad);
    await settle();
    assert.equal(reprocessCount, 1);
    assert.equal(ad.getAttribute('data-ms-hidden'), 'true');
  });
});

describe('domObserver — defaults de debounce', () => {
  it('sem reprocessDebounce na config usa 300 ms', async () => {
    const semDebounce = { ...config };
    delete semDebounce.reprocessDebounce;
    delete semDebounce.reprocessMaxWait;
    start(semDebounce);
    document.body.appendChild(document.createElement('div'));
    await env.wait(120);
    assert.equal(reprocessCount, 0, 'ainda dentro dos 300 ms');
    await env.wait(450);
    assert.equal(reprocessCount, 1);
  });
});
