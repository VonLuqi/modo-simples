/**
 * IMP-08 — régua de leitura: sem posição conhecida não escurece a página;
 * segue ponteiro/toque/foco; usa requestAnimationFrame.
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
const prevRaf = globalThis.requestAnimationFrame;
const prevCaf = globalThis.cancelAnimationFrame;

const flush = () => {
  const run = frames.splice(0);
  run.forEach((fn) => fn && fn());
};

beforeEach(() => {
  env = installHappy();
  frames = [];
  globalThis.requestAnimationFrame = (fn) => frames.push(fn);
  globalThis.cancelAnimationFrame = (id) => {
    frames[id - 1] = null;
  };
});
afterEach(() => {
  stopReadingRuler();
  globalThis.requestAnimationFrame = prevRaf;
  globalThis.cancelAnimationFrame = prevCaf;
  env.restore();
});

const ruler = () => document.getElementById('ms-reading-ruler');
const fire = (type, init) =>
  document.dispatchEvent(new window.Event(type, { bubbles: true, ...init }));

describe('readingRuler (IMP-08)', () => {
  it('nasce oculta: sem posição conhecida a página não escurece', () => {
    startReadingRuler();
    assert.equal(ruler().style.visibility, 'hidden');
  });

  it('pointermove (mouse/toque/caneta) revela e posiciona, 1 atualização por frame', () => {
    startReadingRuler();
    const ev = new window.Event('pointermove', { bubbles: true });
    ev.clientY = 200;
    document.dispatchEvent(ev);
    ev.clientY = 300;
    document.dispatchEvent(ev);
    assert.equal(frames.length, 1);
    flush();
    assert.equal(ruler().style.visibility, 'visible');
    assert.equal(ruler().style.transform, 'translateY(276px)');
  });

  it('touchmove usa a posição do primeiro toque', () => {
    startReadingRuler();
    const ev = new window.Event('touchmove', { bubbles: true });
    ev.touches = [{ clientY: 100 }];
    document.dispatchEvent(ev);
    flush();
    assert.equal(ruler().style.visibility, 'visible');
    assert.equal(ruler().style.transform, 'translateY(76px)');
  });

  it('foco por teclado leva a janela ao elemento focado', () => {
    document.body.innerHTML = '<button id="b">x</button>';
    startReadingRuler();
    const b = document.getElementById('b');
    b.getBoundingClientRect = () => ({ top: 500, height: 40 });
    b.dispatchEvent(new window.Event('focusin', { bubbles: true }));
    flush();
    assert.equal(ruler().style.visibility, 'visible');
    assert.equal(ruler().style.transform, 'translateY(496px)');
  });

  it('stop remove a régua e os listeners', () => {
    startReadingRuler();
    stopReadingRuler();
    assert.equal(ruler(), null);
    fire('pointermove');
    assert.equal(frames.length, 0);
  });
});
