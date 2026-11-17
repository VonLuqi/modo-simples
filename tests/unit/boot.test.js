/**
 * IMP-23 — boot idempotente (script incluído 2x) e destroy() só mexe no que é da instância.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import ModoSimples, { bootModoSimples } from '../../src/modo-simples.js';
import eventBus from '../../src/core/eventBus.js';
import state from '../../src/core/state.js';
import { installHappy, SAMPLE_PAGE } from './helpers/happyEnv.js';

let env;

beforeEach(() => {
  env = installHappy({ bodyHtml: SAMPLE_PAGE });
});
afterEach(() => {
  window.ModoSimples?.destroy();
  env.restore();
});

describe('bootModoSimples (IMP-23)', () => {
  it('chamado duas vezes devolve a mesma instância e uma única UI', () => {
    const a = bootModoSimples(window);
    const b = bootModoSimples(window);
    assert.equal(a, b);
    assert.equal(window.ModoSimples, a);
    assert.equal(document.querySelectorAll('#ms-container').length, 1);
    assert.equal(document.querySelectorAll('#ms-page-styles').length, 1);
  });

  it('depois de destroy(), um novo boot cria instância nova', () => {
    const a = bootModoSimples(window);
    a.destroy();
    const b = bootModoSimples(window);
    assert.notEqual(a, b);
    assert.equal(document.querySelectorAll('#ms-container').length, 1);
  });

  it('lê window.ModoSimplesConfig', () => {
    window.ModoSimplesConfig = { position: 'top-left' };
    assert.equal(bootModoSimples(window)._config.position, 'top-left');
  });
});

describe('destroy() só desfaz o que é da instância (IMP-23)', () => {
  it('instância que nunca subiu não derruba a UI nem o estado da instância ativa', () => {
    const ativa = bootModoSimples(window);
    ativa.enable();
    const intrusa = new ModoSimples();
    intrusa.destroy();
    assert.equal(document.querySelectorAll('#ms-container').length, 1);
    assert.equal(state.get().modoSimples, true);
    assert.ok(document.documentElement.classList.contains('ms-ativo'));
  });

  it('listeners alheios do eventBus sobrevivem ao destroy()', () => {
    let chamadas = 0;
    const off = eventBus.on('stateChange', () => {
      chamadas += 1;
    });
    const inst = bootModoSimples(window);
    inst.destroy();
    const antes = chamadas;
    state.set({ panelOpen: true });
    assert.equal(chamadas, antes + 1);
    off();
    state.reset();
  });
});
