/**
 * IMP-17 — desligar o Modo Simples restaura a escolha de imagens de ANTES de ligá-lo.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import ModoSimples from '../../src/modo-simples.js';
import state from '../../src/core/state.js';
import { installHappy, SAMPLE_PAGE } from './helpers/happyEnv.js';

let env;
let inst;

const hide = () => state.get().options.hideImages;
const setHide = (v) => state.set({ options: { hideImages: v } });
const panelImages = () =>
  document
    .querySelector('#ms-container')
    .shadowRoot.querySelector('.ms-switch[data-option="hideImages"]');

beforeEach(() => {
  env = installHappy({ bodyHtml: SAMPLE_PAGE });
  inst = new ModoSimples();
  inst.init();
});
afterEach(() => {
  inst?.destroy();
  env.restore();
});

describe('hideImages antes/depois do Modo Simples (IMP-17)', () => {
  it('imagens visíveis antes: MS oculta, desligar volta a mostrar', () => {
    inst.enable();
    assert.equal(hide(), true);
    inst.disable();
    assert.equal(hide(), false);
  });

  it('imagens JÁ ocultas antes: desligar o MS mantém ocultas', () => {
    setHide(true);
    inst.enable();
    assert.equal(hide(), true);
    inst.disable();
    assert.equal(hide(), true);
  });

  it('enable() repetido não sobrescreve o valor guardado com o forçado pelo MS', () => {
    setHide(false);
    inst.enable();
    inst.enable();
    inst.disable();
    assert.equal(hide(), false);
  });

  it('preferência "mostrar imagens no MS" continua valendo e não vaza para fora do MS', () => {
    inst.enable();
    panelImages().click(); // no MS: passa a mostrar imagens
    assert.equal(hide(), false);
    inst.disable();
    assert.equal(hide(), false);
    inst.enable(); // lembra que o usuário quer ver imagens no MS
    assert.equal(hide(), false);
  });

  it('o valor anterior sobrevive a recarregar a página com o MS ligado', () => {
    setHide(true);
    inst.enable();
    inst.destroy();

    inst = new ModoSimples();
    inst.init(); // MS restaurado do storage
    assert.equal(state.get().modoSimples, true);
    inst.disable();
    assert.equal(hide(), true);
  });

  it('sem persistência, o valor guardado fica em memória', () => {
    inst.destroy();
    inst = new ModoSimples({ persistence: false });
    inst.init();
    setHide(true);
    inst.enable();
    inst.disable();
    assert.equal(hide(), true);
  });
});
