/**
 * IMP-22 — com confiança baixa, nada é aplicado antes de o usuário confirmar a seleção manual.
 * Antes: applyModoSimples rodava primeiro (ocultando em volta de um principal incerto) e
 * "Cancelar" deixava o resultado aplicado.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import ModoSimples from '../../src/modo-simples.js';
import state from '../../src/core/state.js';
import { installHappy, SAMPLE_PAGE } from './helpers/happyEnv.js';

let env;
let inst;

const $ = (s) => document.querySelector(s);
const hidden = () => document.querySelectorAll('[data-ms-hidden="true"]');
const banner = () => $('#ms-manual-select-banner');

/** threshold acima do máximo possível: força o caminho de seleção manual */
function baixaConfianca() {
  inst = new ModoSimples({ confidenceThreshold: 2, persistence: false });
  inst.init();
  inst.enable();
}

function clicar(el) {
  el.dispatchEvent(
    new env.win.MouseEvent('click', { bubbles: true, cancelable: true }),
  );
}

beforeEach(() => {
  env = installHappy({ bodyHtml: SAMPLE_PAGE });
});

afterEach(() => {
  inst?.destroy();
  inst = null;
  env.restore();
});

describe('seleção manual com confiança baixa (IMP-22)', () => {
  it('enquanto o usuário não escolhe: banner aberto e NADA oculto nem marcado', () => {
    baixaConfianca();
    assert.ok(banner(), 'banner de seleção deveria estar aberto');
    assert.equal(
      hidden().length,
      0,
      'nada pode ser ocultado antes de confirmar',
    );
    assert.equal(document.querySelectorAll('[data-ms-principal]').length, 0);
  });

  it('confirmar: aplica em volta da escolha e fecha o banner', () => {
    baixaConfianca();
    clicar($('main'));

    assert.equal(banner(), null);
    assert.ok($('main').hasAttribute('data-ms-principal'));
    assert.equal($('header').getAttribute('data-ms-hidden'), 'true');
    assert.equal($('aside').getAttribute('data-ms-hidden'), 'true');
    assert.ok(document.documentElement.classList.contains('ms-ativo'));
  });

  it('cancelar pelo botão: nada fica oculto e o modo continua ligado (página inteira)', () => {
    baixaConfianca();
    const cancelar = banner().querySelector('button');
    clicar(cancelar);

    assert.equal(banner(), null);
    assert.equal(hidden().length, 0, 'cancelar não pode deixar nada oculto');
    assert.equal(state.get().modoSimples, true);
    assert.ok(document.documentElement.classList.contains('ms-ativo'));
    assert.ok(
      document.body.hasAttribute('data-ms-principal'),
      'sem escolha, o principal é a página inteira (body)',
    );
  });

  it('cancelar com Esc: mesmo resultado do botão', () => {
    baixaConfianca();
    document.dispatchEvent(
      new env.win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    assert.equal(banner(), null);
    assert.equal(hidden().length, 0);
  });

  it('desligar o modo durante a seleção fecha o banner sem aplicar nada', () => {
    baixaConfianca();
    inst.disable();
    assert.equal(banner(), null);
    assert.equal(hidden().length, 0);
    assert.equal(document.querySelectorAll('[data-ms-principal]').length, 0);
  });
});
