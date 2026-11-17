/**
 * A-04 — utils/focus.js: getFocusable e trapFocus em DOM real.
 * happy-dom não calcula layout; getBoundingClientRect é forçado nos botões "visíveis".
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { getFocusable, trapFocus } from '../../src/utils/focus.js';
import { installHappy } from './helpers/happyEnv.js';

let env;
let box;

const mostrar = (el) => {
  el.getBoundingClientRect = () => ({ width: 10, height: 10 });
};
const tab = (shiftKey = false) => {
  const ev = new env.win.KeyboardEvent('keydown', {
    key: 'Tab',
    shiftKey,
    bubbles: true,
    cancelable: true,
  });
  box.dispatchEvent(ev);
  return ev;
};

beforeEach(() => {
  env = installHappy({
    bodyHtml: `<div id="box">
      <button id="a">A</button>
      <input id="b" />
      <button id="c" disabled>C</button>
      <a id="d" href="#x">D</a>
      <span id="e" tabindex="-1">E</span>
      <div hidden><button id="f">F</button></div>
      <button id="g">G</button>
    </div>`,
  });
  box = document.getElementById('box');
  box.querySelectorAll('button, input, a').forEach(mostrar);
});
afterEach(() => env.restore());

describe('getFocusable', () => {
  it('inclui botões/inputs/links ativos e exclui disabled, tabindex=-1 e [hidden]', () => {
    const ids = getFocusable(box).map((el) => el.id);
    assert.deepEqual(ids, ['a', 'b', 'd', 'g']);
  });

  it('exclui elementos sem tamanho (display:none etc.)', () => {
    box.querySelector('#b').getBoundingClientRect = () => ({
      width: 0,
      height: 0,
    });
    const ids = getFocusable(box).map((el) => el.id);
    assert.ok(!ids.includes('b'));
  });
});

describe('trapFocus', () => {
  it('Tab no último volta ao primeiro', () => {
    const release = trapFocus(box);
    document.getElementById('g').focus();
    const ev = tab();
    assert.equal(ev.defaultPrevented, true);
    assert.equal(document.activeElement.id, 'a');
    release();
  });

  it('Shift+Tab no primeiro vai ao último', () => {
    const release = trapFocus(box);
    document.getElementById('a').focus();
    const ev = tab(true);
    assert.equal(ev.defaultPrevented, true);
    assert.equal(document.activeElement.id, 'g');
    release();
  });

  it('Tab no meio não interfere', () => {
    const release = trapFocus(box);
    document.getElementById('b').focus();
    assert.equal(tab().defaultPrevented, false);
    release();
  });

  it('UX-13: Tab com foco fora do painel entra pelo primeiro; Shift+Tab pelo último', () => {
    const fora = document.createElement('button');
    document.body.appendChild(fora);
    const release = trapFocus(box);

    fora.focus();
    const ev = tab(false);
    assert.equal(ev.defaultPrevented, true);
    assert.equal(document.activeElement.id, 'a');

    fora.focus();
    assert.equal(tab(true).defaultPrevented, true);
    assert.equal(document.activeElement.id, 'g');
    release();
  });

  it('UX-13: foco no próprio contêiner (tabindex -1) + Shift+Tab vai ao último', () => {
    box.setAttribute('tabindex', '-1');
    const release = trapFocus(box);
    box.focus();
    assert.equal(document.activeElement, box);
    assert.equal(tab(true).defaultPrevented, true);
    assert.equal(document.activeElement.id, 'g');
    release();
  });

  it('com menos de 2 focáveis não prende nada', () => {
    box.innerHTML = '<button id="so">só</button>';
    mostrar(box.querySelector('#so'));
    const release = trapFocus(box);
    document.getElementById('so').focus();
    assert.equal(tab().defaultPrevented, false);
    release();
  });

  it('a função de cleanup remove o trap', () => {
    const release = trapFocus(box);
    release();
    document.getElementById('g').focus();
    assert.equal(tab().defaultPrevented, false);
  });

  it('ignora teclas que não são Tab', () => {
    const release = trapFocus(box);
    document.getElementById('g').focus();
    const ev = new env.win.KeyboardEvent('keydown', {
      key: 'Enter',
      cancelable: true,
    });
    box.dispatchEvent(ev);
    assert.equal(ev.defaultPrevented, false);
    release();
  });
});
