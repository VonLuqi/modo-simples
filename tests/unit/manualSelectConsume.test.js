/**
 * IMP-29 — no modo de seleção manual o evento é consumido uma vez: não vaza para o host
 * nem é tratado de novo pelos handlers globais da lib.
 *
 * Antes: Escape cancelava a seleção E fechava o painel (e chegava aos diálogos do host);
 * o clique de escolha também passava pelo handler "clique fora fecha o painel";
 * mousedown/pointerdown chegavam ao host.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import ModoSimples from '../../src/modo-simples.js';
import state from '../../src/core/state.js';
import { isManualSelectActive } from '../../src/features/manualSelect.js';
import { installHappy, SAMPLE_PAGE } from './helpers/happyEnv.js';

let env;
let inst;

const $ = (s) => document.querySelector(s);

function iniciarSelecaoComPainelAberto() {
  inst = new ModoSimples({ confidenceThreshold: 2, persistence: false });
  inst.init();
  inst.enable(); // confiança baixa → aviso
  escolher(); // opcional: abre a seleção manual
  inst._openPanel();
}

/** confiança baixa: o aviso aparece; "Escolher o conteúdo" abre a seleção manual (UX-21) */
function escolher() {
  document
    .querySelector('#ms-low-confidence-notice button')
    .dispatchEvent(
      new env.win.MouseEvent('click', { bubbles: true, cancelable: true }),
    );
}

const mouse = (type) =>
  new env.win.MouseEvent(type, { bubbles: true, cancelable: true });

beforeEach(() => {
  env = installHappy({ bodyHtml: SAMPLE_PAGE });
});

afterEach(() => {
  inst?.destroy();
  inst = null;
  env.restore();
});

describe('seleção manual consome o evento (IMP-29)', () => {
  it('isManualSelectActive reflete o modo', () => {
    inst = new ModoSimples({ confidenceThreshold: 2, persistence: false });
    inst.init();
    assert.equal(isManualSelectActive(), false);
    inst.enable();
    assert.equal(
      isManualSelectActive(),
      false,
      'confiança baixa não abre a seleção sozinha (UX-21)',
    );
    escolher();
    assert.equal(isManualSelectActive(), true);
    inst.disable();
    assert.equal(isManualSelectActive(), false);
  });

  it('Esc cancela só a seleção: o painel continua aberto', () => {
    iniciarSelecaoComPainelAberto();
    document.dispatchEvent(
      new env.win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    assert.equal(isManualSelectActive(), false, 'a seleção foi cancelada');
    assert.equal(
      state.get().panelOpen,
      true,
      'o mesmo Esc não pode fechar também o painel',
    );
  });

  it('Esc na seleção não chega aos handlers do host', () => {
    iniciarSelecaoComPainelAberto();
    let visto = 0;
    document.addEventListener('keydown', () => (visto += 1)); // ex.: fechar modal do site
    document.dispatchEvent(
      new env.win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    assert.equal(visto, 0);
  });

  it('o clique de escolha não passa pelo "clique fora fecha o painel"', () => {
    iniciarSelecaoComPainelAberto();
    $('main').dispatchEvent(mouse('click'));
    assert.ok($('main').hasAttribute('data-ms-principal'), 'escolheu o main');
    assert.equal(state.get().panelOpen, true, 'o clique foi consumido uma vez');
  });

  it('clique de escolha não chega ao host', () => {
    iniciarSelecaoComPainelAberto();
    let visto = 0;
    $('main').addEventListener('click', () => (visto += 1));
    $('main').dispatchEvent(mouse('click'));
    assert.equal(visto, 0);
  });

  it('mousedown/pointerdown/mouseup durante a seleção não vazam para o host', () => {
    iniciarSelecaoComPainelAberto();
    const vistos = [];
    for (const tipo of ['mousedown', 'mouseup', 'pointerdown', 'pointerup']) {
      $('main').addEventListener(tipo, () => vistos.push(tipo));
      $('main').dispatchEvent(mouse(tipo));
    }
    assert.deepEqual(vistos, []);
  });

  it('fora do modo de seleção nada é consumido (painel fecha com clique fora)', () => {
    inst = new ModoSimples({ persistence: false });
    inst.init();
    inst._openPanel();
    let visto = 0;
    $('main').addEventListener('mousedown', () => (visto += 1));
    $('main').dispatchEvent(mouse('mousedown'));
    assert.equal(visto, 1, 'o host recebe seus eventos normalmente');
    $('main').dispatchEvent(mouse('click'));
    assert.equal(state.get().panelOpen, false);
  });
});
