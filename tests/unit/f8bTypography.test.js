/**
 * F8b — tipografia: sliders de altura de linha, espaço entre palavras e entre letras
 * (0 = padrão, sem override) + "Redefinir fonte". O botão textSpacing continua preset.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import ModoSimples from '../../src/modo-simples.js';
import state, { TYPO_LIMITS, clampTypo } from '../../src/core/state.js';
import { hydratePersistedState } from '../../src/core/persistedState.js';
import { PAGE_CSS } from '../../src/ui/styles.generated.js';
import { installHappy, SAMPLE_PAGE } from './helpers/happyEnv.js';

let env;
let inst;

const html = () => document.documentElement;
const shadow = () => document.querySelector('#ms-container').shadowRoot;
const panel = () => shadow().querySelector('#ms-a11y-panel');
const q = (sel) => panel().querySelector(sel);
const stored = (k) => localStorage.getItem(`ms_${k}:exemplo.test`);

/** Move o slider como o usuário: define o valor e dispara `input`. */
const mover = (key, idx) => {
  const input = q(`[data-range="${key}"]`);
  input.value = String(idx);
  input.dispatchEvent(new window.Event('input', { bubbles: true }));
};

beforeEach(() => {
  env = installHappy({ bodyHtml: SAMPLE_PAGE });
  inst = new ModoSimples();
  inst.init();
});
afterEach(() => {
  inst?.destroy();
  env.restore();
});

describe('F8b — sliders', () => {
  it('padrão = sem classe nem variável (não mexe no site)', () => {
    for (const c of ['ms-lh', 'ms-ws', 'ms-ls'])
      assert.equal(html().classList.contains(c), false, c);
    assert.equal(html().style.getPropertyValue('--ms-lh'), '');
  });

  it('cada slider tem rótulo PT-BR associado, aria-valuetext e faixa que passa do WCAG 1.4.12', () => {
    for (const key of ['lineHeight', 'wordSpacing', 'letterSpacing']) {
      const input = q(`[data-range="${key}"]`);
      assert.equal(input.type, 'range');
      assert.ok(q(`label[for="${input.id}"]`).textContent.length > 3, key);
      assert.equal(input.getAttribute('aria-valuetext'), 'Padrão do site');
    }
    assert.ok(TYPO_LIMITS.lineHeight.max > 1.5);
    assert.ok(TYPO_LIMITS.wordSpacing.max > 0.16);
    assert.ok(TYPO_LIMITS.letterSpacing.max > 0.12);
  });

  it('WCAG 1.4.12 é alcançável: 1,5 / 0,16em / 0,12em por posição inteira do slider', () => {
    mover('lineHeight', 1);
    mover('wordSpacing', 8);
    mover('letterSpacing', 12);
    const o = state.get().options;
    assert.deepEqual(
      [o.lineHeight, o.wordSpacing, o.letterSpacing],
      [1.5, 0.16, 0.12],
    );
    assert.equal(html().style.getPropertyValue('--ms-lh'), '1.5');
    assert.equal(html().style.getPropertyValue('--ms-ws'), '0.16em');
    assert.equal(html().style.getPropertyValue('--ms-ls'), '0.12em');
    assert.equal(
      q('[data-range="lineHeight"]').getAttribute('aria-valuetext'),
      '1,5',
    );
    assert.equal(
      q('[data-range="wordSpacing"]').getAttribute('aria-valuetext'),
      '0,16 em',
    );
  });

  it('extremos: topo da faixa e volta a 0 removem/aplicam corretamente', () => {
    const max = Number(q('[data-range="lineHeight"]').max);
    mover('lineHeight', max);
    assert.equal(state.get().options.lineHeight, TYPO_LIMITS.lineHeight.max);
    mover('lineHeight', 0);
    assert.equal(state.get().options.lineHeight, 0);
    assert.equal(html().classList.contains('ms-lh'), false);
    assert.equal(html().style.getPropertyValue('--ms-lh'), '');
  });

  it('painel acompanha o estado (sync) e o preset textSpacing segue independente', () => {
    state.set({ options: { wordSpacing: 0.2, textSpacing: true } });
    assert.equal(q('[data-range="wordSpacing"]').value, '10');
    assert.ok(html().classList.contains('ms-text-spacing'));
    assert.ok(html().classList.contains('ms-ws'));
  });

  it('CSS: sliders vêm depois do preset e só tocam a própria propriedade; nunca o widget', () => {
    const css = PAGE_CSS;
    assert.ok(
      css.indexOf('html.ms-lh :is(') > css.indexOf('html.ms-text-spacing body'),
    );
    assert.match(
      css,
      /html\.ms-lh :is\([^)]*\)\s*\{\s*line-height: var\(--ms-lh\) !important;\s*\}/,
    );
    assert.match(
      css,
      /html\.ms-ws :is\([^)]*\)\s*\{\s*word-spacing: var\(--ms-ws\) !important;\s*\}/,
    );
    assert.match(
      css,
      /html\.ms-ls :is\([^)]*\)\s*\{\s*letter-spacing: var\(--ms-ls\) !important;\s*\}/,
    );
    assert.equal(/html\.ms-(lh|ws|ls)[^{]*#ms-container/.test(css), false);
  });
});

describe('F8b — números sanitizados', () => {
  it('clampTypo: inválido/≤0 → 0; fora da faixa é limitado', () => {
    assert.equal(clampTypo('lineHeight', 'x'), 0);
    assert.equal(clampTypo('lineHeight', -2), 0);
    assert.equal(clampTypo('lineHeight', 0), 0);
    assert.equal(clampTypo('lineHeight', 0.5), TYPO_LIMITS.lineHeight.min);
    assert.equal(clampTypo('lineHeight', 99), 3);
    assert.equal(clampTypo('wordSpacing', 9), 0.8);
    assert.equal(clampTypo('letterSpacing', Infinity), 0);
    assert.equal(clampTypo('nada', 1), 0);
  });

  it('persistência: grava, reidrata e limita valores adulterados', () => {
    state.set({ options: { lineHeight: 1.8, letterSpacing: 0.05 } });
    const saved = JSON.parse(stored('state'));
    assert.equal(saved.options.lineHeight, 1.8);
    const ok = hydratePersistedState(saved);
    assert.deepEqual(
      [ok.options.lineHeight, ok.options.wordSpacing, ok.options.letterSpacing],
      [1.8, 0, 0.05],
    );
    const ruim = hydratePersistedState({
      options: {
        lineHeight: '999',
        wordSpacing: 'calc(1px)',
        letterSpacing: null,
      },
    });
    assert.deepEqual(
      [
        ruim.options.lineHeight,
        ruim.options.wordSpacing,
        ruim.options.letterSpacing,
      ],
      [3, 0, 0],
    );
  });

  it('valor adulterado no estado não vira CSS fora da faixa', () => {
    state.set({ options: { lineHeight: 999, wordSpacing: 'red;}' } });
    assert.equal(html().style.getPropertyValue('--ms-lh'), '3');
    assert.equal(html().classList.contains('ms-ws'), false);
  });
});

describe('F8b — Redefinir fonte / Desligar tudo', () => {
  it('Redefinir fonte zera só a tipografia e preserva o resto', () => {
    state.set({
      options: {
        textScale: '150',
        dyslexiaFont: true,
        textSpacing: true,
        lineHeight: 2,
        wordSpacing: 0.3,
        letterSpacing: 0.1,
        colorTheme: 'darkHigh',
        highlightLinks: true,
      },
    });
    q('[data-action="reset-font"]').click();
    const o = state.get().options;
    assert.deepEqual(
      [
        o.textScale,
        o.dyslexiaFont,
        o.textSpacing,
        o.lineHeight,
        o.wordSpacing,
        o.letterSpacing,
      ],
      ['100', false, false, 0, 0, 0],
    );
    assert.equal(o.colorTheme, 'darkHigh');
    assert.equal(o.highlightLinks, true);
    for (const c of [
      'ms-lh',
      'ms-ws',
      'ms-ls',
      'ms-text-spacing',
      'ms-dyslexia-font',
    ])
      assert.equal(html().classList.contains(c), false, c);
    assert.equal(q('[data-range="lineHeight"]').value, '0');
  });

  it('Desligar tudo também zera os sliders e limpa as variáveis', () => {
    state.set({
      options: { lineHeight: 2, wordSpacing: 0.3, letterSpacing: 0.1 },
    });
    q('[data-action="reset-all"]').click();
    const o = state.get().options;
    assert.deepEqual([o.lineHeight, o.wordSpacing, o.letterSpacing], [0, 0, 0]);
    for (const p of ['--ms-lh', '--ms-ws', '--ms-ls'])
      assert.equal(html().style.getPropertyValue(p), '');
  });

  it('destroy remove classes e variáveis de tipografia do <html>', () => {
    state.set({
      options: { lineHeight: 2, wordSpacing: 0.3, letterSpacing: 0.1 },
    });
    inst.destroy();
    for (const c of ['ms-lh', 'ms-ws', 'ms-ls'])
      assert.equal(html().classList.contains(c), false, c);
    assert.equal(html().style.getPropertyValue('--ms-lh'), '');
    inst = null;
  });
});
