/**
 * F9b (QA T159) — Lupa de texto: campos sensíveis (L2), esconder por focusout/pointercancel/scroll (M1),
 * posicionamento, cores do tema e demais ramos.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  MAGNIFIER_ID,
  magnifierTextFor,
  startTextMagnifier,
  stopTextMagnifier,
} from '../../src/features/textMagnifier.js';
import { installHappy } from './helpers/happyEnv.js';

let env;
let frames;
const prevRaf = globalThis.requestAnimationFrame;
const prevCaf = globalThis.cancelAnimationFrame;
const $ = (s) => document.querySelector(s);
const box = () => $(`#${MAGNIFIER_ID}`);
const flush = () => frames.splice(0).forEach((fn) => fn && fn());
const fire = (el, type, props = {}) => {
  const e = new window.Event(type, { bubbles: true });
  for (const [k, v] of Object.entries(props)) {
    Object.defineProperty(e, k, { value: v });
  }
  el.dispatchEvent(e);
};
const setProp = (obj, key, value) =>
  Object.defineProperty(obj, key, {
    value,
    configurable: true,
    writable: true,
  });
const hover = (sel, props = {}) => {
  fire($(sel), 'pointermove', { clientX: 10, clientY: 10, ...props });
  flush();
};

beforeEach(() => {
  env = installHappy({
    bodyHtml: `<main>
      <p id="p">Parágrafo de teste.</p>
      <p id="q">Outro parágrafo.</p>
      <div id="empty"></div>
      <label for="cc">Cartão</label>
      <input id="cc" autocomplete="cc-number" value="4111111111111111" />
      <input id="otp" aria-label="Código" autocomplete="one-time-code" value="123456" />
      <input id="np" aria-label="Nova senha" type="text" autocomplete="new-password" value="abc" />
      <input id="cp" aria-label="Senha atual" type="text" autocomplete="on current-password" value="abc" />
      <textarea id="ta" aria-label="Nota">texto da nota</textarea>
      <textarea id="tacc" aria-label="Segredo" autocomplete="cc-csc">999</textarea>
      <div id="ce" contenteditable="true" aria-label="Editor"><p id="cep">conteúdo digitado</p></div>
      <div id="cef" contenteditable="false"><p id="cefp">texto fixo</p></div>
      <input id="chk" type="checkbox" aria-label="Aceito" />
      <input id="btn" type="submit" value="Enviar" />
      <input id="hid" type="hidden" value="x" />
      <input id="ph" placeholder="Digite o nome" />
      <select id="sel" aria-label="Cidade"><option>Rio</option><option selected>Recife</option></select>
      <select id="sel0" aria-label="Vazio"></select>
    </main>`,
  });
  frames = [];
  globalThis.requestAnimationFrame = (fn) => frames.push(fn);
  globalThis.cancelAnimationFrame = (id) => {
    frames[id - 1] = null;
  };
});
afterEach(() => {
  stopTextMagnifier();
  globalThis.requestAnimationFrame = prevRaf;
  globalThis.cancelAnimationFrame = prevCaf;
  env.restore();
});

describe('L2 — campos sensíveis mostram só o rótulo', () => {
  it('autocomplete cc-*, one-time-code, new-password, current-password', () => {
    assert.equal(magnifierTextFor($('#cc')), 'Cartão');
    assert.equal(magnifierTextFor($('#otp')), 'Código');
    assert.equal(magnifierTextFor($('#np')), 'Nova senha');
    assert.equal(magnifierTextFor($('#cp')), 'Senha atual');
    assert.equal(magnifierTextFor($('#tacc')), 'Segredo');
    for (const id of ['cc', 'otp', 'np', 'cp', 'tacc']) {
      assert.ok(!/\d{3}|abc/.test(magnifierTextFor($(`#${id}`))), id);
    }
  });
  it('contenteditable (e filhos): só o rótulo; contenteditable=false segue normal', () => {
    assert.equal(magnifierTextFor($('#ce')), 'Editor');
    assert.equal(magnifierTextFor($('#cep')), 'Editor');
    assert.equal(magnifierTextFor($('#cefp')), 'texto fixo');
  });
  it('campos comuns seguem mostrando rótulo + valor', () => {
    assert.equal(magnifierTextFor($('#ta')), 'Nota texto da nota');
    assert.equal(magnifierTextFor($('#chk')), 'Aceito');
    assert.equal(magnifierTextFor($('#btn')), 'Enviar');
    assert.equal(magnifierTextFor($('#hid')), '');
    assert.equal(magnifierTextFor($('#ph')), 'Digite o nome');
    assert.equal(magnifierTextFor($('#sel')), 'Cidade Recife');
    assert.equal(magnifierTextFor($('#sel0')), 'Vazio');
  });
  it('entradas inválidas', () => {
    assert.equal(magnifierTextFor(null), '');
    assert.equal(magnifierTextFor(document.createTextNode('x')), '');
  });
});

describe('M1 — esconder no momento certo', () => {
  it('focusout não esconde a caixa do ponteiro/toque; esconde a do foco', () => {
    startTextMagnifier();
    hover('#p');
    assert.equal(box().style.display, 'block');
    fire($('#q'), 'focusout');
    assert.equal(box().style.display, 'block');

    fire($('#cp'), 'focusin');
    flush();
    assert.equal(box().style.display, 'block');
    fire($('#cp'), 'focusout');
    assert.equal(box().style.display, 'none');
  });

  it('pointercancel (toque que virou rolagem) esconde', () => {
    startTextMagnifier();
    fire($('#p'), 'pointerdown', {
      pointerType: 'touch',
      clientX: 1,
      clientY: 1,
    });
    flush();
    assert.equal(box().style.display, 'block');
    fire($('#p'), 'pointercancel', { pointerType: 'touch' });
    assert.equal(box().style.display, 'none');
  });

  it('scroll: esconde só se a janela mudou de posição (ponteiro) ou se um contêiner rolou', () => {
    setProp(window, 'scrollY', 0);
    setProp(window, 'scrollX', 0);
    startTextMagnifier();
    hover('#p');
    fire(document, 'scroll'); // sem mudança (scroll atrasado de um scrollIntoView anterior)
    assert.equal(box().style.display, 'block');
    setProp(window, 'scrollY', 120);
    fire(document, 'scroll');
    assert.equal(box().style.display, 'none');

    hover('#p');
    assert.equal(box().style.display, 'block');
    fire($('#ta'), 'scroll'); // contêiner interno rolou
    assert.equal(box().style.display, 'none');
  });

  it('scroll não esconde a caixa do foco (o foco acabou de rolar a página)', () => {
    setProp(window, 'scrollY', 0);
    startTextMagnifier();
    fire($('#cp'), 'focusin');
    flush();
    setProp(window, 'scrollY', 300);
    fire(document, 'scroll');
    assert.equal(box().style.display, 'block');
  });

  it('pointerout para fora da janela esconde (mouse), mas não no toque', () => {
    startTextMagnifier();
    hover('#p');
    fire($('#p'), 'pointerout', { relatedTarget: $('#q') });
    assert.equal(box().style.display, 'block');
    fire($('#p'), 'pointerout', { relatedTarget: null, pointerType: 'touch' });
    assert.equal(box().style.display, 'block');
    fire($('#p'), 'pointerout', { relatedTarget: null });
    assert.equal(box().style.display, 'none');
  });

  it('wheel esconde; resize só se a largura mudou', () => {
    setProp(window, 'innerWidth', 400);
    startTextMagnifier();
    hover('#p');
    fire(window, 'resize');
    assert.equal(box().style.display, 'block');
    setProp(window, 'innerWidth', 800);
    fire(window, 'resize');
    assert.equal(box().style.display, 'none');
    hover('#p');
    fire(document, 'wheel');
    assert.equal(box().style.display, 'none');
  });

  it('foco no body ou no painel, e toque no painel, escondem; alvo sem texto esconde', () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div id="ms-container"><button id="fab">x</button></div>',
    );
    startTextMagnifier();
    hover('#p');
    fire(document.body, 'focusin');
    assert.equal(box().style.display, 'none');
    hover('#p');
    fire($('#fab'), 'focusin');
    assert.equal(box().style.display, 'none');
    hover('#p');
    fire($('#fab'), 'pointerdown', { pointerType: 'touch' });
    assert.equal(box().style.display, 'none');
    hover('#p');
    hover('#empty');
    assert.equal(box().style.display, 'none');
  });

  it('mouse ignora pointerdown; pointermove com tooltip em painel não mostra', () => {
    startTextMagnifier();
    fire($('#p'), 'pointerdown', { pointerType: 'mouse' });
    flush();
    assert.equal(box(), null);
  });
});

describe('posicionamento', () => {
  const setup = ({ vw = 400, vh = 800, boxW = 300, boxH = 100 } = {}) => {
    setProp(window, 'innerWidth', vw);
    setProp(window, 'innerHeight', vh);
    const proto = window.HTMLElement.prototype;
    Object.defineProperty(proto, 'offsetWidth', {
      configurable: true,
      get() {
        return this.id === MAGNIFIER_ID ? boxW : 0;
      },
    });
    Object.defineProperty(proto, 'offsetHeight', {
      configurable: true,
      get() {
        return this.id === MAGNIFIER_ID ? boxH : 0;
      },
    });
  };
  const target = (r) => {
    $('#p').getBoundingClientRect = () => ({
      ...r,
      height: r.bottom - r.top,
      width: r.right - r.left,
    });
  };
  const pos = () => [parseInt(box().style.top), parseInt(box().style.left)];

  it('abaixo do alvo quando cabe; acima quando não cabe abaixo', () => {
    setup();
    startTextMagnifier();
    target({ top: 100, bottom: 130, left: 20, right: 200 });
    hover('#p');
    assert.deepEqual(pos(), [142, 20]);
    target({ top: 700, bottom: 730, left: 20, right: 200 });
    hover('#p');
    assert.equal(pos()[0], 700 - 12 - 100);
  });

  it('alvo enorme: usa a borda mais livre da tela', () => {
    setup();
    startTextMagnifier();
    target({ top: 0, bottom: 800, left: 20, right: 200 });
    fire($('#p'), 'focusin');
    flush();
    assert.equal(pos()[0], 800 - 100 - 8);
    target({ top: 100, bottom: 800, left: 20, right: 200 });
    fire($('#p'), 'focusin');
    flush();
    assert.equal(pos()[0], 8);
  });

  it('bloco alto sob o ponteiro: posiciona pela faixa do ponteiro', () => {
    setup();
    startTextMagnifier();
    target({ top: 0, bottom: 790, left: 20, right: 200 });
    hover('#p', { clientY: 200 });
    assert.equal(pos()[0], 212 + 12);
  });

  it('não sai pela direita nem pela esquerda', () => {
    setup();
    startTextMagnifier();
    target({ top: 100, bottom: 130, left: 390, right: 400 });
    hover('#p');
    assert.equal(pos()[1], 92);
    target({ top: 100, bottom: 130, left: -50, right: 10 });
    hover('#p');
    assert.equal(pos()[1], 8);
  });
});

describe('cores do tema', () => {
  const prevGcs = globalThis.getComputedStyle;
  afterEach(() => {
    globalThis.getComputedStyle = prevGcs;
  });
  const colors = (body, html = { backgroundColor: 'rgba(0, 0, 0, 0)' }) => {
    globalThis.getComputedStyle = (el) =>
      el === document.body ? body : el === document.documentElement ? html : {};
    startTextMagnifier();
    hover('#p');
    return [box().style.color, box().style.background];
  };

  it('usa texto e fundo do body quando o fundo é opaco', () => {
    assert.deepEqual(
      colors({ color: 'rgb(255, 230, 0)', backgroundColor: 'rgb(0, 0, 0)' }),
      ['rgb(255, 230, 0)', 'rgb(0, 0, 0)'],
    );
  });
  it('fundo do body transparente: usa o do <html> se opaco', () => {
    assert.deepEqual(
      colors(
        { color: 'rgb(10, 10, 10)', backgroundColor: 'rgba(0, 0, 0, 0)' },
        { backgroundColor: 'rgb(240, 240, 200)' },
      ),
      ['rgb(10, 10, 10)', 'rgb(240, 240, 200)'],
    );
  });
  it('tudo transparente: fundo oposto ao texto (claro → preto, escuro → branco)', () => {
    assert.deepEqual(
      colors({ color: 'rgb(250, 250, 250)', backgroundColor: 'transparent' }),
      ['rgb(250, 250, 250)', 'rgb(0, 0, 0)'],
    );
    stopTextMagnifier();
    assert.deepEqual(
      colors({ color: 'rgb(20, 20, 20)', backgroundColor: 'transparent' }),
      ['rgb(20, 20, 20)', 'rgb(255, 255, 255)'],
    );
  });
  it('cor ilegível: cai em preto no branco', () => {
    assert.deepEqual(colors({ color: 'lab(1 2 3)', backgroundColor: 'x' }), [
      'rgb(0, 0, 0)',
      'rgb(255, 255, 255)',
    ]);
  });
  it('rgb com alfa e sintaxe moderna é entendido', () => {
    assert.deepEqual(
      colors({
        color: 'rgb(1 2 3 / 0.9)',
        backgroundColor: 'rgba(200, 201, 202, 0.9)',
      }),
      ['rgb(1, 2, 3)', 'rgb(200, 201, 202)'],
    );
  });
});
