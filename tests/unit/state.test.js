/**
 * tests/unit/state.test.js
 *
 * Testa o módulo core/state usando o test runner nativo do Node.js.
 *
 * NOTA: state.js é um singleton. As mutações acumulam entre testes.
 * Chamamos state.reset() no beforeEach para garantir estado inicial limpo.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import state from '../../src/core/state.js';
import eventBus from '../../src/core/eventBus.js';

describe('state', () => {
  beforeEach(() => {
    eventBus.clearAll();
    state.reset();
  });

  // ── get() ────────────────────────────────────────────────────────────────

  it('get() deve retornar o estado inicial correto', () => {
    const s = state.get();
    assert.strictEqual(s.modoSimples, false);
    assert.strictEqual(s.panelOpen, false);
    assert.strictEqual(s.options.reducedMotion, false);
    assert.strictEqual(s.options.highContrast, false);
    assert.strictEqual(s.options.largerText, false);
    assert.strictEqual(s.options.highlightLinks, false);
    assert.strictEqual(s.options.dyslexiaFont, false);
    assert.strictEqual(s.options.textSpacing, false);
    assert.strictEqual(s.options.hideImages, false);
  });

  it('get() deve retornar uma cópia — mutações externas não afetam o estado', () => {
    const s1 = state.get();
    s1.modoSimples = true;
    s1.options.highContrast = true;

    const s2 = state.get();
    assert.strictEqual(s2.modoSimples, false);
    assert.strictEqual(s2.options.highContrast, false);
  });

  // ── set() ─────────────────────────────────────────────────────────────────

  it('set() deve atualizar o campo de topo', () => {
    state.set({ modoSimples: true });
    assert.strictEqual(state.get().modoSimples, true);
  });

  it('set() deve mesclar options sem apagar outros campos', () => {
    state.set({ options: { highContrast: true } });
    const s = state.get();
    assert.strictEqual(s.options.highContrast, true);
    assert.strictEqual(s.options.largerText, false, 'largerText deve permanecer false');
    assert.strictEqual(s.options.reducedMotion, false, 'reducedMotion deve permanecer false');
  });

  it('set() deve emitir stateChange com prev e next corretos', () => {
    let evtPrev, evtNext;
    eventBus.on('stateChange', ({ prev, next }) => {
      evtPrev = prev;
      evtNext = next;
    });

    state.set({ panelOpen: true });

    assert.strictEqual(evtPrev.panelOpen, false);
    assert.strictEqual(evtNext.panelOpen, true);
  });

  it('o next emitido por stateChange é uma cópia independente', () => {
    let nextReceived;
    eventBus.on('stateChange', ({ next }) => { nextReceived = next; });

    state.set({ modoSimples: true });

    // Modificar o snapshot recebido não deve afetar o estado atual
    nextReceived.modoSimples = false;
    assert.strictEqual(state.get().modoSimples, true);
  });

  // ── reset() ───────────────────────────────────────────────────────────────

  it('reset() deve restaurar o estado inicial', () => {
    state.set({ modoSimples: true, options: { highContrast: true, largerText: true } });
    state.reset();

    const s = state.get();
    assert.strictEqual(s.modoSimples, false);
    assert.strictEqual(s.options.highContrast, false);
    assert.strictEqual(s.options.largerText, false);
  });

  it('reset() deve emitir stateChange', () => {
    let emitido = false;
    state.set({ modoSimples: true });
    eventBus.on('stateChange', () => { emitido = true; });
    state.reset();
    assert.ok(emitido);
  });
});
