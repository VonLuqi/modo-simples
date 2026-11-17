/**
 * A-04 / U-03 — readingRuler: casos de borda (idempotência, foco no body,
 * toque sem touches, limite superior, stop com frame pendente).
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  startReadingRuler,
  stopReadingRuler,
} from '../../src/features/readingRuler.js';
import { installHappy } from './helpers/happyEnv.js';

let env;
let frames;
let cancelled;
const prevRaf = globalThis.requestAnimationFrame;
const prevCaf = globalThis.cancelAnimationFrame;

const flush = () => frames.splice(0).forEach((fn) => fn && fn());
const ruler = () => document.getElementById('ms-reading-ruler');

beforeEach(() => {
  env = installHappy();
  frames = [];
  cancelled = [];
  globalThis.requestAnimationFrame = (fn) => frames.push(fn);
  globalThis.cancelAnimationFrame = (id) => {
    cancelled.push(id);
    frames[id - 1] = null;
  };
});
afterEach(() => {
  stopReadingRuler();
  globalThis.requestAnimationFrame = prevRaf;
  globalThis.cancelAnimationFrame = prevCaf;
  env.restore();
});

const pointer = (y) => {
  const ev = new window.Event('pointermove', { bubbles: true });
  ev.clientY = y;
  document.dispatchEvent(ev);
};

describe('readingRuler (bordas)', () => {
  it('start é idempotente: só uma régua no DOM', () => {
    startReadingRuler();
    startReadingRuler();
    assert.equal(document.querySelectorAll('#ms-reading-ruler').length, 1);
  });

  it('a régua é decorativa: aria-hidden, sem eventos de ponteiro, fixa', () => {
    startReadingRuler();
    assert.equal(ruler().getAttribute('aria-hidden'), 'true');
    assert.equal(ruler().style.pointerEvents, 'none');
    assert.equal(ruler().style.position, 'fixed');
  });

  it('não deixa a janela subir acima do topo (translateY nunca negativo)', () => {
    startReadingRuler();
    pointer(5);
    flush();
    assert.equal(ruler().style.transform, 'translateY(0px)');
  });

  it('touchstart sem touches é ignorado', () => {
    startReadingRuler();
    const ev = new window.Event('touchstart', { bubbles: true });
    ev.touches = [];
    document.dispatchEvent(ev);
    assert.equal(frames.length, 0);
    assert.equal(ruler().style.visibility, 'hidden');
  });

  it('touchstart com touches posiciona e revela', () => {
    startReadingRuler();
    const ev = new window.Event('touchstart', { bubbles: true });
    ev.touches = [{ clientY: 148 }];
    document.dispatchEvent(ev);
    flush();
    assert.equal(ruler().style.transform, 'translateY(124px)');
    assert.equal(ruler().style.visibility, 'visible');
  });

  it('focusin no body não move a janela', () => {
    startReadingRuler();
    document.body.dispatchEvent(new window.Event('focusin', { bubbles: true }));
    assert.equal(frames.length, 0);
    assert.equal(ruler().style.visibility, 'hidden');
  });

  it('o último pointermove do frame vence', () => {
    startReadingRuler();
    pointer(100);
    pointer(400);
    flush();
    assert.equal(ruler().style.transform, 'translateY(376px)');
  });

  it('stop com frame pendente cancela o frame e não revela nada', () => {
    startReadingRuler();
    pointer(200);
    assert.equal(frames.length, 1);
    stopReadingRuler();
    assert.deepEqual(cancelled, [1]);
    flush();
    assert.equal(ruler(), null);
  });

  it('stop sem start e stop duplo não lançam', () => {
    stopReadingRuler();
    startReadingRuler();
    stopReadingRuler();
    stopReadingRuler();
    assert.equal(ruler(), null);
  });

  it('start depois de stop recria a régua oculta e reativa os listeners', () => {
    startReadingRuler();
    stopReadingRuler();
    startReadingRuler();
    assert.equal(ruler().style.visibility, 'hidden');
    pointer(200);
    flush();
    assert.equal(ruler().style.visibility, 'visible');
  });
});
