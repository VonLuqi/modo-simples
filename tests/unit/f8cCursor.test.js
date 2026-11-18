/**
 * F8c — cursor grande branco/preto (+ F8b QA: altura de linha começa em 1,5 e "Redefinir fonte" anuncia).
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import ModoSimples from '../../src/modo-simples.js';
import state, { TYPO_LIMITS, clampTypo } from '../../src/core/state.js';
import { hydratePersistedState } from '../../src/core/persistedState.js';
import { diffStateAnnouncements } from '../../src/core/announcements.js';
import { PAGE_CSS } from '../../src/ui/styles.generated.js';
import { installHappy, SAMPLE_PAGE } from './helpers/happyEnv.js';

let env;
let inst;
const html = () => document.documentElement;
const shadow = () => document.querySelector('#ms-container').shadowRoot;
const panel = () => shadow().querySelector('#ms-a11y-panel');
const q = (sel) => panel().querySelector(sel);
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

beforeEach(() => {
  env = installHappy({ bodyHtml: SAMPLE_PAGE });
  inst = new ModoSimples();
  inst.init();
});
afterEach(() => {
  inst?.destroy();
  env.restore();
});

describe('F8c — controle do cursor', () => {
  const radios = () => [
    ...panel().querySelectorAll('[data-option="cursorStyle"] [role="radio"]'),
  ];

  it('radiogroup com 3 opções PT-BR; padrão marcado e sem classe no <html>', () => {
    assert.deepEqual(
      radios().map((r) => r.textContent),
      ['Padrão', 'Grande branco', 'Grande preto'],
    );
    assert.equal(radios()[0].getAttribute('aria-checked'), 'true');
    assert.equal(
      q('[data-option="cursorStyle"]').getAttribute('role'),
      'radiogroup',
    );
    for (const c of ['ms-cursor-white', 'ms-cursor-black'])
      assert.equal(html().classList.contains(c), false, c);
  });

  it('escolher aplica a classe certa, uma por vez; Padrão remove', () => {
    q('[data-option="cursorStyle"] [data-value="bigWhite"]').click();
    assert.equal(state.get().options.cursorStyle, 'bigWhite');
    assert.ok(html().classList.contains('ms-cursor-white'));
    q('[data-option="cursorStyle"] [data-value="bigBlack"]').click();
    assert.ok(html().classList.contains('ms-cursor-black'));
    assert.equal(html().classList.contains('ms-cursor-white'), false);
    assert.equal(radios()[2].getAttribute('aria-checked'), 'true');
    assert.equal(radios()[2].getAttribute('tabindex'), '0');
    q('[data-option="cursorStyle"] [data-value="default"]').click();
    assert.equal(html().classList.contains('ms-cursor-black'), false);
  });

  it('teclado (APG): seta move e seleciona', () => {
    radios()[0].focus();
    const ev = new window.KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    });
    radios()[0].dispatchEvent(ev);
    assert.equal(state.get().options.cursorStyle, 'bigWhite');
  });

  it('persiste e sanitiza valor desconhecido para o padrão', () => {
    assert.equal(
      hydratePersistedState({ options: { cursorStyle: 'bigBlack' } }).options
        .cursorStyle,
      'bigBlack',
    );
    assert.equal(
      hydratePersistedState({ options: { cursorStyle: 'url(x)' } }).options
        .cursorStyle,
      'default',
    );
  });

  it('anuncia o cursor escolhido', () => {
    const a = state.get();
    const b = { ...a, options: { ...a.options, cursorStyle: 'bigWhite' } };
    assert.deepEqual(diffStateAnnouncements(a, b), ['Cursor grande branco']);
  });

  it('destroy limpa as classes', () => {
    state.set({ options: { cursorStyle: 'bigBlack' } });
    inst.destroy();
    assert.equal(html().classList.contains('ms-cursor-black'), false);
    inst = null;
  });
});

describe('F8c — CSS do cursor', () => {
  const regra = (cls) =>
    PAGE_CSS.slice(
      PAGE_CSS.indexOf(`html.ms-cursor-${cls},`),
      PAGE_CSS.indexOf('}', PAGE_CSS.indexOf(`html.ms-cursor-${cls},`)),
    );

  it('seta SVG 48px com contorno contrastante, hotspot na ponta e fallback auto', () => {
    const w = regra('white');
    assert.match(w, /width='48' height='48'/);
    assert.match(w, /fill='%23fff' stroke='%23000'/);
    assert.match(w, /\) 6 3, auto !important/);
    const b = regra('black');
    assert.match(b, /fill='%23000' stroke='%23fff'/);
    assert.match(b, /\) 6 3, auto !important/);
  });

  it('mão grande para links/botões/[role=button] com hotspot no dedo e fallback pointer', () => {
    for (const cls of ['white', 'black']) {
      const i = PAGE_CSS.indexOf(`html.ms-cursor-${cls} :is(a[href], button`);
      assert.ok(i > 0, cls);
      const bloco = PAGE_CSS.slice(i, PAGE_CSS.indexOf('}', i));
      assert.match(bloco, /\[role="button"\]/);
      assert.match(bloco, /\) 19 4, pointer !important/);
    }
  });

  it('precedência: cursor grande vem depois e vence o crosshair da régua; só o <html> da régua tem crosshair', () => {
    assert.ok(
      PAGE_CSS.indexOf('html.ms-cursor-white,') >
        PAGE_CSS.indexOf('html.ms-reading-ruler { cursor: crosshair; }'),
    );
    assert.match(PAGE_CSS, /html\.ms-cursor-white,\s*html\.ms-cursor-white \*/);
  });

  it('campos de texto mantêm o cursor nativo "text"', () => {
    assert.match(PAGE_CSS, /textarea[^{]*\{\s*cursor: text !important/);
  });

  it('o tamanho de cada imagem fica abaixo do limite de cursor do navegador (128px)', () => {
    for (const m of PAGE_CSS.matchAll(/width='(\d+)' height='(\d+)'/g))
      assert.ok(Number(m[1]) <= 128 && Number(m[2]) <= 128);
  });
});

describe('F8b QA L1 — altura de linha começa em 1,5', () => {
  it('limite mínimo 1,5; clamp de valores abaixo (persistidos) sobe para 1,5', () => {
    assert.equal(TYPO_LIMITS.lineHeight.min, 1.5);
    assert.equal(clampTypo('lineHeight', 1.1), 1.5);
    assert.equal(clampTypo('lineHeight', 1.49), 1.5);
    assert.equal(clampTypo('lineHeight', 1.6), 1.6);
    assert.equal(clampTypo('lineHeight', 3), 3);
    assert.equal(
      hydratePersistedState({ options: { lineHeight: 1.2 } }).options
        .lineHeight,
      1.5,
    );
    assert.equal(
      hydratePersistedState({ options: { lineHeight: 0 } }).options.lineHeight,
      0,
    );
  });

  it('1.º passo do slider = 1,5; 2.º = 1,6; topo = 3,0; WCAG 1.4.12 continua alcançável', () => {
    const input = q('[data-range="lineHeight"]');
    const mover = (idx) => {
      input.value = String(idx);
      input.dispatchEvent(new window.Event('input', { bubbles: true }));
    };
    mover(1);
    assert.equal(state.get().options.lineHeight, 1.5);
    mover(2);
    assert.equal(state.get().options.lineHeight, 1.6);
    mover(Number(input.max));
    assert.equal(state.get().options.lineHeight, 3);
    state.set({ options: { lineHeight: 1.5 } });
    assert.equal(input.value, '1');
    assert.equal(input.getAttribute('aria-valuetext'), '1,5');
  });
});

describe('Redefinir fonte anuncia (aria-live)', () => {
  it('após clicar, um nó de status com a mensagem PT-BR existe no documento', async () => {
    state.set({ options: { textScale: '150', lineHeight: 2 } });
    q('[data-action="reset-font"]').click();
    await espera(150);
    const msgs = [...document.querySelectorAll('[data-ms-live]')].map(
      (n) => n.textContent,
    );
    assert.ok(
      msgs.some((m) => m.startsWith('Fonte redefinida')),
      msgs.join(' | '),
    );
  });
});
