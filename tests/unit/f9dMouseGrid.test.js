/**
 * F9d — Grade de mouse: geometria dos níveis, parada em 24px, Backspace, API, sequência de
 * eventos do clique, teclado (Esc/Enter/Backspace/numérico) e fechamento (reset/destroy).
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  MOUSE_GRID_ID,
  canSubdivide,
  cellArea,
  areaCenter,
  openMouseGrid,
  selectCell,
  clickCurrent,
  closeMouseGrid,
  isMouseGridOpen,
} from '../../src/features/mouseGrid.js';
import { STRINGS as S, SHORTCUTS } from '../../src/ui/strings.js';
import ModoSimples from '../../src/modo-simples.js';
import { installHappy } from './helpers/happyEnv.js';

let env;
let inst;
const $ = (s) => document.querySelector(s);
const cells = () => [
  ...document.querySelectorAll(`#${MOUSE_GRID_ID} [data-cell]`),
];
const key = (code, init = {}) =>
  document.dispatchEvent(
    new window.KeyboardEvent('keydown', {
      code,
      key: init.key ?? code,
      bubbles: true,
      cancelable: true,
      ...init,
    }),
  );

beforeEach(() => {
  env = installHappy({
    bodyHtml: '<main><button id="b">Botão</button><p id="p">x</p></main>',
  });
  // viewport estável para a geometria
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
  closeMouseGrid({ silent: true, restoreFocus: false });
  inst?.destroy();
  inst = null;
  env.restore();
});

describe('F9d geometria', () => {
  const root = { x: 0, y: 0, w: 1, h: 1 };

  it('cellArea divide em 3x3, linha a linha (1 = topo-esquerda, 9 = base-direita)', () => {
    const c1 = cellArea(root, 1);
    const c5 = cellArea(root, 5);
    const c9 = cellArea(root, 9);
    assert.deepEqual([c1.x, c1.y], [0, 0]);
    assert.ok(Math.abs(c5.x - 1 / 3) < 1e-9 && Math.abs(c5.y - 1 / 3) < 1e-9);
    assert.ok(Math.abs(c9.x - 2 / 3) < 1e-9 && Math.abs(c9.y - 2 / 3) < 1e-9);
    assert.ok(Math.abs(c5.w - 1 / 3) < 1e-9);
  });

  it('dois níveis: centro da célula 5 dentro da 9', () => {
    const lvl2 = cellArea(cellArea(root, 9), 5);
    const c = areaCenter(lvl2);
    // 900x600: célula 9 = [600..900]x[400..600]; 5 dentro = centro (750, 500)
    assert.ok(Math.abs(c.x - 750) < 1e-6 && Math.abs(c.y - 500) < 1e-6);
  });

  it('canSubdivide para quando a célula filha ficaria < 24px', () => {
    assert.equal(canSubdivide(root), true);
    // 72px de menor lado → células de 24px: ainda divide
    assert.equal(canSubdivide({ x: 0, y: 0, w: 72 / 900, h: 1 }), true);
    assert.equal(canSubdivide({ x: 0, y: 0, w: 71 / 900, h: 1 }), false);
  });
});

describe('F9d grade e API', () => {
  it('abre com 9 células, diálogo modal e atalho listado nos SHORTCUTS', () => {
    openMouseGrid();
    const root = $(`#${MOUSE_GRID_ID}`);
    assert.equal(root.getAttribute('role'), 'dialog');
    assert.equal(root.getAttribute('aria-modal'), 'true');
    assert.equal(cells().length, 9);
    assert.deepEqual(
      cells().map((c) => c.textContent),
      ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    );
    assert.ok(SHORTCUTS.some((s) => s.keys === 'Alt+Shift+G'));
  });

  it('selectCell redesenha a grade dentro da célula; valores inválidos são ignorados', () => {
    openMouseGrid();
    assert.equal(selectCell(0), false);
    assert.equal(selectCell(10), false);
    assert.equal(selectCell(1.5), false);
    const before = cells()[0].style.width;
    assert.equal(selectCell(5), true);
    assert.equal(cells().length, 9);
    assert.notEqual(cells()[0].style.width, before);
    assert.equal(parseFloat(cells()[0].style.width), 100); // 900/3/3
  });

  it('para de subdividir abaixo de 24px: sem células e selectCell → false', () => {
    openMouseGrid();
    let guard = 0;
    while (cells().length && guard++ < 20) selectCell(1);
    assert.equal(cells().length, 0);
    assert.equal(selectCell(1), false);
    assert.ok(isMouseGridOpen()); // ainda aberta: só Enter
  });

  it('Backspace sobe um nível; no topo não faz nada', () => {
    openMouseGrid();
    selectCell(9);
    selectCell(1);
    key('Backspace', { key: 'Backspace' });
    assert.equal(parseFloat(cells()[0].style.width), 100);
    key('Backspace', { key: 'Backspace' });
    assert.equal(parseFloat(cells()[0].style.width), 300);
    key('Backspace', { key: 'Backspace' });
    assert.equal(parseFloat(cells()[0].style.width), 300);
  });

  it('teclas 1–9 (linha de cima e numérico) escolhem; ignora com Ctrl/Alt/Meta', () => {
    openMouseGrid();
    key('Digit3', { key: '3' });
    assert.equal(parseFloat(cells()[0].style.width), 100);
    key('Backspace', { key: 'Backspace' });
    key('Numpad7', { key: '7' });
    assert.equal(parseFloat(cells()[0].style.width), 100);
    key('Digit1', { key: '1', ctrlKey: true });
    key('Digit1', { key: '1', altKey: true });
    key('Digit1', { key: '1', metaKey: true });
    assert.equal(parseFloat(cells()[0].style.width), 100);
  });

  it('clique numa célula escolhe; Esc fecha e devolve o foco', () => {
    const b = $('#b');
    b.focus();
    openMouseGrid();
    assert.notEqual(document.activeElement, b);
    cells()[4].click();
    assert.equal(parseFloat(cells()[0].style.width), 100);
    key('Escape', { key: 'Escape' });
    assert.equal(isMouseGridOpen(), false);
    assert.equal($(`#${MOUSE_GRID_ID}`), null);
    assert.equal(document.activeElement, b);
  });

  it('com a grade fechada a API não faz nada', () => {
    assert.equal(selectCell(5), false);
    assert.equal(clickCurrent(), null);
    closeMouseGrid();
  });
});

describe('F9d clique', () => {
  it('Enter clica no centro: some a grade antes do hit test e dispara a sequência completa + foco', () => {
    const b = $('#b');
    let hitWhileOpen = null;
    let point = null;
    document.elementFromPoint = (x, y) => {
      point = [x, y];
      hitWhileOpen = !!$(`#${MOUSE_GRID_ID}`);
      return b;
    };
    const seen = [];
    for (const t of [
      'pointerdown',
      'mousedown',
      'pointerup',
      'mouseup',
      'click',
    ]) {
      b.addEventListener(t, (e) =>
        seen.push([t, e.clientX, e.clientY, e.bubbles]),
      );
    }
    openMouseGrid();
    selectCell(9);
    selectCell(5); // centro (750, 500)
    key('Enter', { key: 'Enter' });
    assert.equal(hitWhileOpen, false);
    assert.ok(
      Math.abs(point[0] - 750) < 1e-6 &&
        Math.abs(point[1] - (5 / 6) * 584) < 1e-6,
    );
    assert.deepEqual(
      seen.map((s) => s[0]),
      ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'],
    );
    for (const s of seen)
      assert.ok(
        Math.abs(s[1] - 750) < 1e-6 &&
          Math.abs(s[2] - (5 / 6) * 584) < 1e-6 &&
          s[3],
      );
    assert.equal(isMouseGridOpen(), false);
    assert.equal(document.activeElement, b);
  });

  it('alvo não focalizável é clicado sem mover o foco; sem alvo só fecha', () => {
    const p = $('#p');
    document.elementFromPoint = () => p;
    let clicked = 0;
    p.addEventListener('click', () => clicked++);
    openMouseGrid();
    assert.equal(clickCurrent(), p);
    assert.equal(clicked, 1);
    document.elementFromPoint = () => null;
    openMouseGrid();
    assert.equal(clickCurrent(), null);
    assert.equal(isMouseGridOpen(), false);
  });
});

describe('F9d integração', () => {
  const shadow = () => $('#ms-container').shadowRoot;

  it('botão no painel fecha o painel e abre a grade; Alt+Shift+G abre; Desligar tudo e destroy fecham', () => {
    inst = new ModoSimples();
    inst.init();
    inst._openPanel();
    const btn = shadow().querySelector('[data-action="mouse-grid"]');
    assert.equal(btn.textContent.trim(), S.panelMouseGrid);
    btn.click();
    assert.ok($(`#${MOUSE_GRID_ID}`));
    assert.equal(shadow().querySelector('#ms-a11y-panel').hidden, true);
    closeMouseGrid({ silent: true });
    key('KeyG', { key: 'G', altKey: true, shiftKey: true });
    assert.ok($(`#${MOUSE_GRID_ID}`));
    inst._resetAll();
    assert.equal($(`#${MOUSE_GRID_ID}`), null);
    openMouseGrid();
    inst.destroy();
    inst = null;
    assert.equal($(`#${MOUSE_GRID_ID}`), null);
  });
});
