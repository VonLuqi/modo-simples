/**
 * QA T163 (complemento): Fechar na dica do teclado e barra da grade no topo com o teclado aberto.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  KEYBOARD_ID,
  openVirtualKeyboard,
  closeVirtualKeyboard,
  isVirtualKeyboardOpen,
} from '../../src/features/virtualKeyboard.js';
import {
  MOUSE_GRID_ID,
  openMouseGrid,
  closeMouseGrid,
} from '../../src/features/mouseGrid.js';
import { installHappy } from './helpers/happyEnv.js';

let env;
const $ = (s) => document.querySelector(s);

beforeEach(() => {
  env = installHappy({ bodyHtml: '<main><input id="t" type="text"></main>' });
  Object.defineProperty(document.documentElement, 'clientWidth', {
    value: 900,
    configurable: true,
  });
  Object.defineProperty(document.documentElement, 'clientHeight', {
    value: 600,
    configurable: true,
  });
});
afterEach(() => {
  closeVirtualKeyboard({ silent: true });
  closeMouseGrid({ silent: true, restoreFocus: false });
  env.restore();
});

describe('dica do teclado virtual', () => {
  it('sem campo focado a dica tem um Fechar que desliga o modo; com campo, a dica some', () => {
    openVirtualKeyboard({ touch: false });
    const row = $(`#${KEYBOARD_ID} [data-vk-hintrow]`);
    assert.equal(row.style.display, 'flex');
    const close = $(`#${KEYBOARD_ID} [data-vk-hint-close]`);
    assert.equal(close.textContent, 'Fechar');
    assert.equal(
      close.dispatchEvent(new window.Event('mousedown', { cancelable: true })),
      false,
    );
    close.click();
    assert.equal(isVirtualKeyboardOpen(), false);

    openVirtualKeyboard({ touch: false });
    const t = $('#t');
    t.focus();
    t.dispatchEvent(new window.Event('focusin', { bubbles: true }));
    assert.equal($(`#${KEYBOARD_ID} [data-vk-hintrow]`).style.display, 'none');
  });
});

describe('barra da grade', () => {
  it('embaixo normalmente; no topo quando o teclado virtual está aberto (ele ocupa o rodapé)', () => {
    openMouseGrid();
    let bar = $(`#${MOUSE_GRID_ID} button:not([data-cell])`).parentElement;
    assert.equal(bar.style.bottom, '8px');
    assert.equal(bar.style.top, '');
    closeMouseGrid({ silent: true, restoreFocus: false });

    openVirtualKeyboard({ touch: false });
    openMouseGrid();
    bar = $(`#${MOUSE_GRID_ID} button:not([data-cell])`).parentElement;
    assert.equal(bar.style.top, '8px');
    assert.equal(bar.style.bottom, '');
    // as células começam abaixo da barra (offsetHeight 0 no happy-dom: só os 16px de margem)
    const first = $(`#${MOUSE_GRID_ID} [data-cell="1"]`);
    assert.ok(parseFloat(first.style.top) >= 16);
  });
});
