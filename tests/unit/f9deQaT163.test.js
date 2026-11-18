/**
 * F9d/F9e — correções do QA T163: campo number (H1), FAB escondido (M2), foco na UI da lib (M3),
 * grade sem células sob a barra (L1), eventos do clique (L2), Enter como o nativo (L3).
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  KEYBOARD_ID,
  openVirtualKeyboard,
  closeVirtualKeyboard,
  insertText,
  deleteBack,
  pressEnter,
} from '../../src/features/virtualKeyboard.js';
import {
  MOUSE_GRID_ID,
  openMouseGrid,
  selectCell,
  clickCurrent,
  closeMouseGrid,
} from '../../src/features/mouseGrid.js';
import { installHappy } from './helpers/happyEnv.js';

let env;
let protoDesc;
const $ = (s) => document.querySelector(s);
const key = (def) => $(`#${KEYBOARD_ID} [data-vk="${def}"]`);
const tap = (def) => key(def).click();
const fire = (el, type, props = {}) => {
  const e = new window.Event(type, { bubbles: true, cancelable: true });
  for (const [k, v] of Object.entries(props)) {
    Object.defineProperty(e, k, { value: v });
  }
  return el.dispatchEvent(e);
};
const focus = (el) => {
  el.focus();
  fire(el, 'focusin');
};

beforeEach(() => {
  env = installHappy({
    bodyHtml: `<main>
      <input id="n" type="number" />
      <input id="t" type="text" />
      <button id="b">Botão</button>
    </main>`,
  });
  // o happy-dom não sanitiza <input type=number>; emula o navegador: texto inválido vira ""
  const proto = window.HTMLInputElement.prototype;
  protoDesc = Object.getOwnPropertyDescriptor(proto, 'value');
  Object.defineProperty(proto, 'value', {
    configurable: true,
    get: protoDesc.get,
    set(v) {
      const ok = /^-?(\d+|\d*\.\d+)([eE][+-]?\d+)?$/.test(String(v));
      protoDesc.set.call(
        this,
        this.type === 'number' && v !== '' && !ok ? '' : v,
      );
    },
  });
});
afterEach(() => {
  closeVirtualKeyboard({ silent: true });
  closeMouseGrid({ silent: true, restoreFocus: false });
  Object.defineProperty(window.HTMLInputElement.prototype, 'value', protoDesc);
  env.restore();
});

describe('H1 — campo numérico', () => {
  it('1 . 5 → 1.5; - 5 → -5; 1 , 5 → 1.5 (vírgula vira ponto)', () => {
    const n = $('#n');
    for (const [seq, out] of [
      [['1', '.', '5'], '1.5'],
      [['-', '5'], '-5'],
      [['1', ',', '5'], '1.5'],
      [['0', '.', '0', '5'], '0.05'],
    ]) {
      n.value = '';
      for (const c of seq) insertText(n, c);
      assert.equal(n.value, out, seq.join(''));
    }
  });
  it('o campo mantém o último valor válido enquanto o texto é intermediário', () => {
    const n = $('#n');
    insertText(n, '1');
    insertText(n, '.');
    assert.equal(n.value, '1');
    insertText(n, '5');
    assert.equal(n.value, '1.5');
  });
  it('input só dispara quando o valor vira válido; letras são recusadas', () => {
    const n = $('#n');
    const vals = [];
    n.addEventListener('input', () => vals.push(n.value));
    insertText(n, '1');
    insertText(n, '.');
    insertText(n, '5');
    assert.deepEqual(vals, ['1', '1.5']);
    assert.equal(insertText(n, 'a'), false);
    assert.equal(n.value, '1.5');
  });
  it('Backspace: apaga e também passa por intermediário ("1.5" → "1." → "1")', () => {
    const n = $('#n');
    for (const c of ['1', '.', '5']) insertText(n, c);
    assert.ok(deleteBack(n)); // "1." é inválido: fica pendente, campo segue "1.5"
    assert.equal(n.value, '1.5');
    assert.ok(deleteBack(n)); // "1" é válido
    assert.equal(n.value, '1');
    assert.ok(deleteBack(n));
    assert.equal(n.value, '');
    assert.equal(deleteBack(n), false);
  });
  it('valor mudado por fora descarta o texto pendente', () => {
    const n = $('#n');
    insertText(n, '1');
    insertText(n, '.'); // pendente "1."
    n.value = '7';
    insertText(n, '3');
    assert.equal(n.value, '73');
  });
  it('teclado: mostra "Digitando: 1." na linha de prévia e limpa ao valer; reseta ao sair do campo', () => {
    openVirtualKeyboard({ touch: false });
    const n = $('#n');
    focus(n);
    const pv = $(`#${KEYBOARD_ID} [data-vk-preview]`);
    assert.equal(pv.style.display, 'none');
    tap('1!');
    tap('.>');
    assert.equal(pv.style.display, 'block');
    assert.equal(pv.textContent, 'Digitando: 1.');
    tap('5%');
    assert.equal(n.value, '1.5');
    assert.equal(pv.style.display, 'none');
    tap('-_');
    assert.equal(pv.textContent, 'Digitando: 1.5-');
    focus($('#t'));
    assert.equal(pv.style.display, 'none');
  });
});

describe('M2 — FAB escondido com o teclado aberto', () => {
  it('esconde o FAB e restaura (inclusive o display que ele já tinha)', () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div id="ms-container"></div>',
    );
    const sr = $('#ms-container').attachShadow({ mode: 'open' });
    const wrap = document.createElement('div');
    wrap.setAttribute('data-ms-fab-wrap', '');
    sr.appendChild(wrap);
    openVirtualKeyboard({ touch: false });
    assert.equal(wrap.style.display, 'none');
    closeVirtualKeyboard();
    assert.equal(wrap.style.display, '');

    wrap.style.setProperty('display', 'flex');
    openVirtualKeyboard({ touch: false });
    assert.equal(wrap.style.display, 'none');
    closeVirtualKeyboard();
    assert.equal(wrap.style.display, 'flex');
  });
});

describe('M3 — foco na UI da própria lib mantém o campo', () => {
  it('foco na grade, no FAB/painel ou numa tecla não esconde as teclas; foco em outro elemento esconde', () => {
    openVirtualKeyboard({ touch: false });
    focus($('#t'));
    const keys = $(`#${KEYBOARD_ID} [data-vk-keys]`);
    assert.equal(keys.style.display, 'flex');
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div id="ms-mouse-grid"><button id="g">x</button></div><div id="ms-container"><button id="fab">f</button></div>',
    );
    fire($('#g'), 'focusin');
    fire($('#fab'), 'focusin');
    assert.equal(keys.style.display, 'flex');
    focus($('#b')); // um botão da página: não é campo
    assert.equal(keys.style.display, 'none');
  });

  it('a grade clica numa tecla do teclado e o caractere vai para o campo que estava focado', () => {
    Object.defineProperty(document.documentElement, 'clientWidth', {
      value: 900,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      value: 600,
      configurable: true,
    });
    openVirtualKeyboard({ touch: false });
    const t = $('#t');
    focus(t);
    const z = key('z');
    openMouseGrid();
    document.elementFromPoint = () => z;
    clickCurrent();
    assert.equal(t.value, 'z');
  });
});

describe('L1/L2 — grade', () => {
  beforeEach(() => {
    Object.defineProperty(document.documentElement, 'clientWidth', {
      value: 900,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      value: 600,
      configurable: true,
    });
  });
  it('nenhuma célula passa da área acima da barra', () => {
    openMouseGrid();
    for (let n = 0; n < 2; n++) {
      const bar = $(`#${MOUSE_GRID_ID} button:not([data-cell])`).parentElement;
      const barTop = 600 - (bar.offsetHeight + 16);
      for (const c of document.querySelectorAll(
        `#${MOUSE_GRID_ID} [data-cell]`,
      )) {
        const bottom = parseFloat(c.style.top) + parseFloat(c.style.height);
        assert.ok(bottom <= barTop + 1e-6, `${bottom} <= ${barTop}`);
      }
      selectCell(9);
    }
  });
  it('largura estreita usa os rótulos curtos da barra', () => {
    Object.defineProperty(document.documentElement, 'clientWidth', {
      value: 360,
      configurable: true,
    });
    openMouseGrid();
    const labels = [
      ...document.querySelectorAll(`#${MOUSE_GRID_ID} button:not([data-cell])`),
    ].map((b) => b.textContent);
    assert.deepEqual(labels, ['Clicar', 'Voltar', 'Fechar']);
  });
  it('clique sintético: mousedown/mouseup/click com detail 1; pointer* com pointerId 1 e isPrimary', () => {
    const b = $('#b');
    document.elementFromPoint = () => b;
    const seen = {};
    for (const t of [
      'pointerdown',
      'pointerup',
      'mousedown',
      'mouseup',
      'click',
    ]) {
      b.addEventListener(t, (e) => (seen[t] = e));
    }
    openMouseGrid();
    clickCurrent();
    for (const t of ['mousedown', 'mouseup', 'click'])
      assert.equal(seen[t].detail, 1, t);
    for (const t of ['pointerdown', 'pointerup']) {
      if ('pointerId' in seen[t]) {
        assert.equal(seen[t].pointerId, 1, t);
        assert.equal(seen[t].isPrimary, true, t);
        assert.equal(seen[t].pointerType, 'mouse', t);
      }
    }
    assert.equal(seen.pointerdown.button, 0);
    assert.equal(seen.pointerdown.buttons, 1);
    assert.equal(seen.click.buttons, 0);
  });
});

describe('L3 — Enter só envia como o Enter nativo enviaria', () => {
  const forma = (html) => {
    document.body.insertAdjacentHTML(
      'beforeend',
      `<form id="f">${html}</form>`,
    );
    const f = $('#f');
    const calls = [];
    f.requestSubmit = (b) => calls.push(b ?? 'sem-botao');
    return { f, calls, input: f.querySelector('input') };
  };
  it('vários campos e nenhum botão de envio: não envia', () => {
    const { calls, input } = forma(
      '<input id="a" type="text"><input id="c" type="email">',
    );
    assert.ok(pressEnter(input));
    assert.deepEqual(calls, []);
  });
  it('um único campo de texto: envio implícito', () => {
    const { calls, input } = forma('<input id="a" type="search">');
    pressEnter(input);
    assert.deepEqual(calls, ['sem-botao']);
  });
  it('com botão de envio: envia usando o botão; desabilitado: não envia', () => {
    const a = forma(
      '<input type="text"><input type="text"><button type="submit" id="s">Ir</button>',
    );
    pressEnter(a.input);
    assert.equal(a.calls.length, 1);
    assert.equal(a.calls[0].id, 's');
    $('#f').remove();
    const b = forma('<input type="text"><button id="s" disabled>Ir</button>');
    pressEnter(b.input);
    assert.deepEqual(b.calls, []);
  });
  it('checkbox/hidden não contam como campo de texto', () => {
    const { calls, input } = forma(
      '<input type="text"><input type="checkbox"><input type="hidden">',
    );
    pressEnter(input);
    assert.deepEqual(calls, ['sem-botao']);
  });
});

describe('F11a — número pendente ao sair do campo', () => {
  it('focusout para fora limpa o pendente: ao focar de novo recomeça do valor do campo', () => {
    const n = $('#n');
    openVirtualKeyboard({ touch: false });
    focus(n);
    tap('1!');
    tap('.>');
    assert.match(
      $('#' + KEYBOARD_ID + ' [data-vk-preview]').textContent,
      /1\./,
    );
    fire(n, 'focusout', { relatedTarget: null });
    assert.equal($('#' + KEYBOARD_ID + ' [data-vk-preview]').textContent, '');
    focus(n);
    tap('5%');
    assert.equal(n.value, '15');
  });
});
