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
    assert.strictEqual(s.options.textScale, '100');
    assert.strictEqual(s.options.colorTheme, 'senac');
    assert.strictEqual(s.options.dyslexiaFont, false);
    assert.strictEqual(s.options.readingRuler, false);
    assert.strictEqual(s.options.highlightLinks, false);
    assert.strictEqual(s.options.textSpacing, false);
    assert.strictEqual(s.options.reducedMotion, false);
    assert.strictEqual(s.options.hideImages, false);
    assert.strictEqual(s.options.simpleLanguage, false);
    assert.strictEqual(s.options.largerText, undefined);
    assert.strictEqual(s.options.highContrast, undefined);
  });

  it('get() deve retornar uma cópia — mutações externas não afetam o estado', () => {
    const s1 = state.get();
    s1.modoSimples = true;
    s1.options.dyslexiaFont = true;

    const s2 = state.get();
    assert.strictEqual(s2.modoSimples, false);
    assert.strictEqual(s2.options.dyslexiaFont, false);
  });

  // ── set() ─────────────────────────────────────────────────────────────────

  it('set() deve atualizar o campo de topo', () => {
    state.set({ modoSimples: true });
    assert.strictEqual(state.get().modoSimples, true);
  });

  it('set() deve mesclar options sem apagar outros campos', () => {
    state.set({ options: { textScale: '150' } });
    const s = state.get();
    assert.strictEqual(s.options.textScale, '150');
    assert.strictEqual(s.options.colorTheme, 'senac', 'colorTheme deve permanecer senac');
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

    nextReceived.modoSimples = false;
    assert.strictEqual(state.get().modoSimples, true);
  });

  // ── reset() ───────────────────────────────────────────────────────────────

  it('reset() deve restaurar o estado inicial', () => {
    state.set({
      modoSimples: true,
      options: { textScale: '175', colorTheme: 'darkHigh', dyslexiaFont: true },
    });
    state.reset();

    const s = state.get();
    assert.strictEqual(s.modoSimples, false);
    assert.strictEqual(s.options.textScale, '100');
    assert.strictEqual(s.options.colorTheme, 'senac');
    assert.strictEqual(s.options.dyslexiaFont, false);
  });

  it('reset() deve emitir stateChange', () => {
    let emitido = false;
    state.set({ modoSimples: true });
    eventBus.on('stateChange', () => { emitido = true; });
    state.reset();
    assert.ok(emitido);
  });
});
