/**
 * A-04 — utils/focus.js: casos de borda de getFocusable e trapFocus.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { getFocusable, trapFocus } from '../../src/utils/focus.js';
import { installHappy } from './helpers/happyEnv.js';

let env;

const mostrar = (el) => {
  el.getBoundingClientRect = () => ({ width: 10, height: 10 });
};
const keydown = (target, key, shiftKey = false) => {
  const ev = new env.win.KeyboardEvent('keydown', {
    key,
    shiftKey,
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(ev);
  return ev;
};

beforeEach(() => {
  env = installHappy({
    bodyHtml: `<div id="box">
      <button id="a">A</button>
      <button id="b">B</button>
      <div hidden><section><button id="deep">D</button></section></div>
      <div tabindex="0" id="t0">T</div>
      <select id="s"><option>1</option></select>
      <textarea id="ta"></textarea>
    </div>
    <button id="fora">fora</button>`,
  });
  document
    .querySelectorAll('button, div#t0, select, textarea')
    .forEach(mostrar);
});
afterEach(() => env.restore());

const box = () => document.getElementById('box');

describe('getFocusable (bordas)', () => {
  it('container vazio devolve lista vazia', () => {
    const vazio = document.createElement('div');
    assert.deepEqual(getFocusable(vazio), []);
  });

  it('exclui descendentes profundos de [hidden], inclui tabindex=0, select e textarea', () => {
    const ids = getFocusable(box()).map((el) => el.id);
    assert.deepEqual(ids, ['a', 'b', 't0', 's', 'ta']);
  });

  it('preserva a ordem do documento', () => {
    const ids = getFocusable(box()).map((el) => el.id);
    assert.deepEqual(
      ids,
      [...ids].sort((x, y) => ids.indexOf(x) - ids.indexOf(y)),
    );
    assert.equal(ids[0], 'a');
  });
});

describe('trapFocus (bordas)', () => {
  it('sem focáveis visíveis não faz nada (Tab segue o fluxo)', () => {
    document.querySelectorAll('#box *').forEach((el) => {
      el.getBoundingClientRect = () => ({ width: 0, height: 0 });
    });
    const off = trapFocus(box());
    const ev = keydown(document.getElementById('fora'), 'Tab');
    assert.equal(ev.defaultPrevented, false);
    off();
  });

  it('Tab com foco fora do painel entra pelo primeiro', () => {
    const off = trapFocus(box());
    document.getElementById('fora').focus();
    const ev = keydown(document.getElementById('fora'), 'Tab');
    assert.equal(ev.defaultPrevented, true);
    assert.equal(document.activeElement.id, 'a');
    off();
  });

  it('Shift+Tab com foco fora do painel entra pelo último', () => {
    const off = trapFocus(box());
    document.getElementById('fora').focus();
    keydown(document.getElementById('fora'), 'Tab', true);
    assert.equal(document.activeElement.id, 'ta');
    off();
  });

  it('Tab no último volta ao primeiro; Shift+Tab no primeiro vai ao último', () => {
    const off = trapFocus(box());
    document.getElementById('ta').focus();
    keydown(box(), 'Tab');
    assert.equal(document.activeElement.id, 'a');
    keydown(box(), 'Tab', true);
    assert.equal(document.activeElement.id, 'ta');
    off();
  });

  it('Shift+Tab no meio e Tab no primeiro não são interceptados', () => {
    const off = trapFocus(box());
    document.getElementById('b').focus();
    assert.equal(keydown(box(), 'Tab', true).defaultPrevented, false);
    document.getElementById('a').focus();
    assert.equal(keydown(box(), 'Tab').defaultPrevented, false);
    off();
  });

  it('dois traps independentes: remover um não solta o outro', () => {
    const off1 = trapFocus(box());
    const off2 = trapFocus(box());
    off1();
    document.getElementById('fora').focus();
    const ev = keydown(document.getElementById('fora'), 'Tab');
    assert.equal(ev.defaultPrevented, true);
    off2();
  });

  it('cleanup duplo não lança', () => {
    const off = trapFocus(box());
    off();
    off();
  });
});
