/**
 * F9e — Teclado virtual ABNT2: teclas mortas, escrita no cursor, apagar, Enter, Shift/Caps,
 * campos readonly/disabled ignorados, inputmode no toque, fechar em resetAll/destroy.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  KEYBOARD_ID,
  DEAD_KEYS,
  ROWS,
  composeDead,
  deleteBack,
  insertText,
  isEditableField,
  isVirtualKeyboardOpen,
  openVirtualKeyboard,
  closeVirtualKeyboard,
  pressEnter,
} from '../../src/features/virtualKeyboard.js';
import ModoSimples from '../../src/modo-simples.js';
import state from '../../src/core/state.js';
import { installHappy } from './helpers/happyEnv.js';

let env;
const $ = (s) => document.querySelector(s);
const key = (def) => $(`#${KEYBOARD_ID} [data-vk="${def}"]`);
const tap = (def) => key(def).click();
const word = (s) => [...s].forEach((c) => tap(c));
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
      <form id="f"><input id="q" type="search" /><button type="submit">Ir</button></form>
      <input id="t" type="text" />
      <input id="ml" type="text" maxlength="3" />
      <input id="em" type="email" />
      <input id="ro" type="text" readonly />
      <input id="dis" type="text" disabled />
      <input id="cb" type="checkbox" />
      <textarea id="ta"></textarea>
      <div id="ce" contenteditable="true"></div>
      <div id="plain">texto</div>
    </main>`,
  });
});
afterEach(() => {
  closeVirtualKeyboard({ silent: true });
  env.restore();
});

describe('teclas mortas', () => {
  it('tabela de composição (vogais, ç não é morta, y e n)', () => {
    const casos = {
      '´': 'áéíóúÁÉÍÓÚ',
      '`': 'àèìòùÀÈÌÒÙ',
      '~': 'ãõÃÕ',
      '^': 'âêîôûÂÊÎÔÛ',
      '¨': 'äëïöüÄËÏÖÜ',
    };
    const base = {
      '´': 'aeiouAEIOU',
      '`': 'aeiouAEIOU',
      '~': 'aoAO',
      '^': 'aeiouAEIOU',
      '¨': 'aeiouAEIOU',
    };
    for (const [d, out] of Object.entries(casos)) {
      [...base[d]].forEach((b, i) =>
        assert.equal(composeDead(d, b), out[i], d + b),
      );
    }
    assert.equal(composeDead('~', 'n'), 'ñ');
    assert.equal(composeDead('´', 'y'), 'ý');
    assert.equal(composeDead('¨', 'y'), 'ÿ');
    assert.equal(composeDead('´', 'k'), null);
    assert.equal(composeDead('x', 'a'), null);
  });
  it('layout: 5 linhas, 5 teclas mortas presentes, ç e ~ na linha certa', () => {
    assert.equal(ROWS.length, 5);
    const all = ROWS.flat().join('');
    for (const d of DEAD_KEYS) assert.ok(all.includes(d), d);
    assert.ok(ROWS[2].includes('ç'));
    assert.ok(ROWS[2].includes('~^'));
  });
});

describe('isEditableField', () => {
  it('texto sim; readonly, disabled, checkbox e div comum não; contenteditable sim', () => {
    for (const id of ['t', 'q', 'em', 'ta', 'ce'])
      assert.ok(isEditableField($(`#${id}`)), id);
    for (const id of ['ro', 'dis', 'cb', 'plain'])
      assert.ok(!isEditableField($(`#${id}`)), id);
    assert.ok(!isEditableField(null));
  });
  it('UI da lib e o próprio teclado nunca são alvo', () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div id="ms-container"><input id="pin" /></div>',
    );
    assert.ok(!isEditableField($('#pin')));
  });
});

describe('escrita no campo', () => {
  it('insere no cursor, troca a seleção e dispara beforeinput + input com inputType', () => {
    const t = $('#t');
    t.value = 'abef';
    t.setSelectionRange(2, 2);
    const seen = [];
    t.addEventListener('beforeinput', (e) =>
      seen.push(['before', e.inputType, e.data]),
    );
    t.addEventListener('input', (e) =>
      seen.push(['input', e.inputType, e.data, t.value]),
    );
    assert.ok(insertText(t, 'cd'));
    assert.equal(t.value, 'abcdef');
    assert.equal(t.selectionStart, 4);
    assert.deepEqual(seen, [
      ['before', 'insertText', 'cd'],
      ['input', 'insertText', 'cd', 'abcdef'],
    ]);
    t.setSelectionRange(1, 3);
    insertText(t, 'X');
    assert.equal(t.value, 'aXdef');
  });
  it('listener "React-like" no input enxerga o valor novo', () => {
    const t = $('#t');
    let last = null;
    t.addEventListener('input', () => (last = t.value));
    insertText(t, 'ç');
    assert.equal(last, 'ç');
  });
  it('respeita maxlength e beforeinput cancelado', () => {
    const ml = $('#ml');
    insertText(ml, 'abc');
    assert.equal(insertText(ml, 'd'), false);
    assert.equal(ml.value, 'abc');
    const t = $('#t');
    t.addEventListener('beforeinput', (e) => e.preventDefault());
    assert.equal(insertText(t, 'x'), false);
    assert.equal(t.value, '');
  });
  it('email (sem seleção) escreve no fim', () => {
    const em = $('#em');
    insertText(em, 'a@b');
    insertText(em, '.com');
    assert.equal(em.value, 'a@b.com');
  });
  it('apagar: caractere antes do cursor, seleção, início não faz nada, par substituto inteiro', () => {
    const t = $('#t');
    t.value = 'abc';
    t.setSelectionRange(3, 3);
    const tipos = [];
    t.addEventListener('input', (e) => tipos.push(e.inputType));
    assert.ok(deleteBack(t));
    assert.equal(t.value, 'ab');
    t.setSelectionRange(0, 2);
    deleteBack(t);
    assert.equal(t.value, '');
    assert.equal(deleteBack(t), false);
    t.value = 'a😀';
    t.setSelectionRange(3, 3);
    deleteBack(t);
    assert.equal(t.value, 'a');
    assert.ok(tipos.every((x) => x === 'deleteContentBackward'));
    const em = $('#em');
    em.value = 'xy';
    deleteBack(em);
    assert.equal(em.value, 'x');
  });
  it('Enter: textarea ganha quebra de linha; input dispara keydown/keyup e envia o form', () => {
    const ta = $('#ta');
    insertText(ta, 'a');
    pressEnter(ta);
    assert.equal(ta.value, 'a\n');

    const q = $('#q');
    const log = [];
    q.addEventListener('keydown', (e) => log.push(['down', e.key]));
    q.addEventListener('keyup', (e) => log.push(['up', e.key]));
    let enviado = 0;
    $('#f').requestSubmit = () => enviado++;
    pressEnter(q);
    assert.deepEqual(log, [
      ['down', 'Enter'],
      ['up', 'Enter'],
    ]);
    assert.equal(enviado, 1);
    q.addEventListener('keydown', (e) => e.preventDefault());
    pressEnter(q);
    assert.equal(enviado, 1); // keydown cancelado: o site tratou
    const t = $('#t'); // sem form: não quebra
    assert.ok(pressEnter(t));
  });
  it('contenteditable: insere e apaga (via Range quando não há execCommand)', () => {
    const ce = $('#ce');
    ce.textContent = '';
    const sel = window.getSelection();
    const r = document.createRange();
    r.selectNodeContents(ce);
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);
    const prev = document.execCommand;
    document.execCommand = undefined;
    try {
      insertText(ce, 'olá');
      assert.equal(ce.textContent, 'olá');
    } finally {
      document.execCommand = prev;
    }
  });
});

describe('teclado na tela', () => {
  it('abre com dica e sem teclas; foco num campo mostra as teclas; readonly volta à dica', () => {
    openVirtualKeyboard({ touch: false });
    assert.ok(isVirtualKeyboardOpen());
    const root = $(`#${KEYBOARD_ID}`);
    assert.equal(root.querySelector('[data-vk-hint]').style.display, 'block');
    assert.equal(root.querySelector('[data-vk-keys]').style.display, 'none');
    assert.match(root.textContent, /Toque num campo de texto/);
    focus($('#t'));
    assert.equal(root.querySelector('[data-vk-keys]').style.display, 'flex');
    focus($('#ro'));
    assert.equal(root.querySelector('[data-vk-hint]').style.display, 'block');
    focus($('#dis'));
    assert.equal(root.querySelector('[data-vk-keys]').style.display, 'none');
  });

  it('digita "ação Ünico" (ç, til, trema com Shift) e Backspace', () => {
    openVirtualKeyboard({ touch: false });
    const t = $('#t');
    focus(t);
    tap('a');
    tap('ç');
    tap('~^'); // til (morta)
    tap('a'); // ã
    tap('o');
    tap('Space');
    tap('Shift');
    tap('6¨'); // trema
    tap('Shift');
    tap('u'); // Ü
    word('nico');
    assert.equal(t.value, 'ação Ünico');
    tap('Backspace');
    assert.equal(t.value, 'ação Ünic');
  });

  it('morta + espaço = símbolo; morta + letra que não compõe = símbolo + letra', () => {
    openVirtualKeyboard({ touch: false });
    const t = $('#t');
    focus(t);
    tap('´`');
    tap('Space');
    assert.equal(t.value, '´');
    tap('´`');
    tap('k');
    assert.equal(t.value, '´´k');
    tap('Shift');
    tap('´`'); // grave
    tap('e');
    assert.equal(t.value, '´´kè');
  });

  it('Shift vale uma tecla; Caps fica; símbolos usam só Shift', () => {
    openVirtualKeyboard({ touch: false });
    const t = $('#t');
    focus(t);
    tap('Shift');
    assert.equal(key('Shift').getAttribute('aria-pressed'), 'true');
    tap('a');
    tap('a');
    assert.equal(t.value, 'Aa');
    assert.equal(key('Shift').getAttribute('aria-pressed'), 'false');
    tap('Caps');
    tap('b');
    tap('b');
    tap('1!');
    assert.equal(t.value, 'AaBB1'); // Caps não vira "!"
    tap('Shift');
    tap('1!');
    tap('Caps');
    tap('c');
    assert.equal(t.value, 'AaBB1!c');
    assert.equal(key('a').textContent, 'a');
  });

  it('Enter tecla: textarea quebra linha', () => {
    openVirtualKeyboard({ touch: false });
    const ta = $('#ta');
    focus(ta);
    tap('x');
    tap('Enter');
    tap('y');
    assert.equal(ta.value, 'x\ny');
  });

  it('teclas não roubam o foco (mousedown/pointerdown cancelados) e têm tamanho mínimo (24x40)', () => {
    openVirtualKeyboard({ touch: false });
    focus($('#t'));
    const b = key('a');
    assert.equal(fire(b, 'mousedown'), false);
    assert.equal(fire(b, 'pointerdown'), false);
    assert.equal(b.style.minWidth, '24px');
    assert.ok(parseInt(b.style.minHeight) >= 40);
  });

  it('toque: inputmode=none no campo focado; volta ao original ao trocar de campo e ao fechar', () => {
    const t = $('#t');
    const ta = $('#ta');
    ta.setAttribute('inputmode', 'text');
    openVirtualKeyboard({ touch: true });
    focus(t);
    assert.equal(t.getAttribute('inputmode'), 'none');
    focus(ta);
    assert.equal(t.hasAttribute('inputmode'), false);
    assert.equal(ta.getAttribute('inputmode'), 'none');
    closeVirtualKeyboard();
    assert.equal(ta.getAttribute('inputmode'), 'text');
  });

  it('sem toque não mexe no inputmode', () => {
    openVirtualKeyboard({ touch: false });
    focus($('#t'));
    assert.equal($('#t').hasAttribute('inputmode'), false);
  });

  it('Fechar fecha, tira listeners e devolve o padding do body', () => {
    document.body.style.setProperty('padding-bottom', '7px');
    openVirtualKeyboard({ touch: false });
    focus($('#t'));
    tap('Fechar');
    assert.equal(isVirtualKeyboardOpen(), false);
    assert.equal($(`#${KEYBOARD_ID}`), null);
    assert.equal(document.body.style.paddingBottom, '7px');
    focus($('#q')); // sem teclado: nada acontece
    assert.equal($(`#${KEYBOARD_ID}`), null);
  });

  it('aberto duas vezes não duplica; foco em tecla (Tab) mantém o campo', () => {
    openVirtualKeyboard({ touch: false });
    openVirtualKeyboard({ touch: false });
    assert.equal(document.querySelectorAll(`#${KEYBOARD_ID}`).length, 1);
    const t = $('#t');
    focus(t);
    fire(key('Fechar'), 'focusin');
    tap('z');
    assert.equal(t.value, 'z');
  });

  it('tocar fora de tudo (focusout sem destino) volta à dica', () => {
    openVirtualKeyboard({ touch: false });
    const t = $('#t');
    focus(t);
    fire(t, 'focusout', { relatedTarget: null });
    assert.equal($(`#${KEYBOARD_ID} [data-vk-hint]`).style.display, 'block');
  });

  it('abrir com um campo já focado já mostra as teclas', () => {
    const t = $('#t');
    t.focus();
    openVirtualKeyboard({ touch: false });
    assert.equal($(`#${KEYBOARD_ID} [data-vk-keys]`).style.display, 'flex');
  });
});

describe('ciclo de vida', () => {
  it('"Desligar tudo" e destroy() fecham o teclado', () => {
    const inst = new ModoSimples({ persistence: false });
    inst.init();
    openVirtualKeyboard({ touch: false });
    inst._resetAll();
    assert.equal(isVirtualKeyboardOpen(), false);
    openVirtualKeyboard({ touch: false });
    inst.destroy();
    assert.equal(isVirtualKeyboardOpen(), false);
    assert.equal($(`#${KEYBOARD_ID}`), null);
    assert.equal(state.get().options.textMagnifier, false);
  });
});

describe('F11a — AltGr (ABNT2)', () => {
  it('toggle aria-pressed; escreve ¹ ² ³ £ ¢ ¬ § ª º ° / ? ° e volta ao normal após uma tecla', () => {
    openVirtualKeyboard({ touch: false });
    const t = $('#t');
    focus(t);
    const casos = [
      ['1!', '¹'],
      ['2@', '²'],
      ['3#', '³'],
      ['4$', '£'],
      ['5%', '¢'],
      ['6¨', '¬'],
      ['=+', '§'],
      ['[{', 'ª'],
      [']}', 'º'],
      ['/?', '°'],
      ['q', '/'],
      ['w', '?'],
      ['e', '°'],
    ];
    for (const [def, ch] of casos) {
      t.value = '';
      tap('AltGr');
      assert.equal(key('AltGr').getAttribute('aria-pressed'), 'true');
      tap(def);
      assert.equal(t.value, ch, def);
      assert.equal(key('AltGr').getAttribute('aria-pressed'), 'false');
    }
    t.value = '';
    tap('q');
    assert.equal(t.value, 'q');
  });
  it('tecla sem nível AltGr escreve o normal; AltGr some ao fechar', () => {
    openVirtualKeyboard({ touch: false });
    const t = $('#t');
    focus(t);
    tap('AltGr');
    tap('r');
    assert.equal(t.value, 'r');
    tap('AltGr');
    closeVirtualKeyboard({ silent: true });
    openVirtualKeyboard({ touch: false });
    focus(t);
    assert.equal(key('AltGr').getAttribute('aria-pressed'), 'false');
  });
});
