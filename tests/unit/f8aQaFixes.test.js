/**
 * Correções dos achados do QA em F8a: M1 (par de cores sempre legível), M2 (links distintos sob
 * cor personalizada) e L1 (valor do seletor livre exposto como rádio marcado).
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import ModoSimples from '../../src/modo-simples.js';
import state from '../../src/core/state.js';
import {
  contrastRatio,
  effectiveColors,
  linkOn,
  readableOn,
} from '../../src/utils/colorContrast.js';
import { PAGE_CSS, UI_CSS } from '../../src/ui/styles.generated.js';
import { installHappy, SAMPLE_PAGE } from './helpers/happyEnv.js';

let env;
let inst;
const html = () => document.documentElement;
const shadow = () => document.querySelector('#ms-container').shadowRoot;
const panel = () => shadow().querySelector('#ms-a11y-panel');
const q = (sel) => panel().querySelector(sel);

beforeEach(() => {
  env = installHappy({ bodyHtml: SAMPLE_PAGE });
  inst = new ModoSimples();
  inst.init();
});
afterEach(() => {
  inst?.destroy();
  env.restore();
});

describe('M1 — cor efetiva (lado não escolhido ganha contraparte legível)', () => {
  it('readableOn: claro → preto, escuro → branco', () => {
    assert.equal(readableOn('#ffffff'), '#000000');
    assert.equal(readableOn('#fef08a'), '#000000');
    assert.equal(readableOn('#000000'), '#ffffff');
    assert.equal(readableOn('#0b2c5f'), '#ffffff');
  });

  it('só fundo → texto automático; só texto/título → fundo automático; nada → vazio', () => {
    const so = (o) =>
      effectiveColors({
        customText: '',
        customHeading: '',
        customBg: '',
        ...o,
      });
    assert.deepEqual(
      [so({ customBg: '#000000' }).text, so({ customBg: '#000000' }).bg],
      ['#ffffff', '#000000'],
    );
    assert.equal(so({ customText: '#ffffff' }).bg, '#000000');
    assert.equal(so({ customText: '#fef08a' }).bg, '#000000');
    const h = so({ customHeading: '#7f1d1d' });
    assert.deepEqual([h.bg, h.text], ['#ffffff', '#000000']);
    assert.deepEqual(so({}), { text: '', heading: '', bg: '', link: '' });
    assert.equal(so({ customBg: 'url(x)' }).bg, ''); // só #rrggbb
  });

  it('o que o usuário escolheu nunca é trocado', () => {
    const e = effectiveColors({
      customText: '#fef08a',
      customHeading: '',
      customBg: '#ffffff',
    });
    assert.deepEqual([e.text, e.bg], ['#fef08a', '#ffffff']); // par ruim: só o painel avisa
  });

  it('todo par automático tem ≥ 4,5:1 (preto/branco sobre qualquer base)', () => {
    for (const hex of [
      '#000000',
      '#ffffff',
      '#777777',
      '#808080',
      '#fef08a',
      '#0b2c5f',
      '#123456',
      '#ff00ff',
    ]) {
      const e = effectiveColors({ customText: hex });
      assert.ok(contrastRatio(hex, e.bg) >= 4.5, hex);
      const b = effectiveColors({ customBg: hex });
      assert.ok(contrastRatio(b.text, hex) >= 4.5, hex);
    }
  });

  it('applyOptions aplica a contraparte automática no <html>', () => {
    state.set({ options: { customBg: '#000000' } });
    assert.ok(html().classList.contains('ms-custom-text'));
    assert.equal(html().style.getPropertyValue('--ms-custom-text'), '#ffffff');
    state.set({ options: { customBg: '', customText: '#ffffff' } });
    assert.ok(html().classList.contains('ms-custom-bg'));
    assert.equal(html().style.getPropertyValue('--ms-custom-bg'), '#000000');
    state.set({ options: { customText: '' } });
    for (const c of ['ms-custom-text', 'ms-custom-bg', 'ms-custom-link'])
      assert.equal(html().classList.contains(c), false, c);
  });

  it('painel avisa (role=status) quando o par escolhido tem < 4,5:1 e limpa quando melhora', () => {
    const warn = q('[data-contrast-warn]');
    assert.equal(warn.getAttribute('role'), 'status');
    assert.equal(warn.textContent, '');
    state.set({ options: { customText: '#fef08a', customBg: '#ffffff' } });
    assert.match(warn.textContent, /Atenção: contraste baixo/);
    assert.match(warn.textContent, /Cor do texto/);
    assert.match(warn.textContent, /Cor do texto \/ Cor do fundo:/); // fundo escolhido pelo usuário
    assert.match(warn.textContent, /1,2:1/);
    state.set({ options: { customHeading: '#bae6fd' } });
    assert.match(warn.textContent, /Cor dos títulos/);
    state.set({ options: { customText: '#000000', customHeading: '#0b2c5f' } });
    assert.equal(warn.textContent, '');
    // sem fundo escolhido o fundo é automático e o par automático é legível: sem aviso
    state.set({
      options: { customBg: '', customText: '#ffffff', customHeading: '' },
    });
    assert.equal(warn.textContent, '');
  });

  it('sem fundo: texto e título em oposição geram aviso do par efetivo (T126 M-new)', () => {
    const warn = q('[data-contrast-warn]');
    // texto #fff + título #000 → fundo automático não serve aos dois: o título (ou texto) é avisado
    state.set({
      options: {
        customText: '#ffffff',
        customHeading: '#000000',
        customBg: '',
      },
    });
    assert.match(warn.textContent, /Cor dos títulos/);
    assert.match(warn.textContent, /1,0:1/);
    // fundo não escolhido pelo usuário: o aviso diz "Fundo automático", não "Cor do fundo"
    assert.match(warn.textContent, /Cor dos títulos \/ Fundo automático:/);
    assert.equal(/Cor do fundo/.test(warn.textContent), false);
    // inverso: texto #000 + título #fff
    state.set({ options: { customText: '#000000', customHeading: '#ffffff' } });
    assert.match(warn.textContent, /Cor dos títulos/);
    // par compatível (ambos escuros → fundo branco; ambos claros → fundo preto): sem aviso
    state.set({ options: { customText: '#000000', customHeading: '#0b2c5f' } });
    assert.equal(warn.textContent, '');
    state.set({ options: { customText: '#ffffff', customHeading: '#fde047' } });
    assert.equal(warn.textContent, '');
  });

  it('autoBg considera texto E título: fundo que serve aos dois quando existe', () => {
    const so = (o) =>
      effectiveColors({
        customText: '',
        customHeading: '',
        customBg: '',
        ...o,
      });
    assert.equal(
      so({ customText: '#000000', customHeading: '#0b2c5f' }).bg,
      '#ffffff',
    );
    assert.equal(
      so({ customText: '#ffffff', customHeading: '#93c5fd' }).bg,
      '#000000',
    );
    // texto médio-escuro + título claro: escolhe o fundo de melhor pior-caso (preto serve ao título)
    const e = so({ customText: '#7f1d1d', customHeading: '#ffffff' });
    assert.ok(
      Math.min(contrastRatio(e.text, e.bg), contrastRatio(e.heading, e.bg)) >=
        Math.min(
          contrastRatio(e.text, e.bg === '#000000' ? '#ffffff' : '#000000'),
          contrastRatio(e.heading, e.bg === '#000000' ? '#ffffff' : '#000000'),
        ),
    );
    // empate total (texto branco + título preto): vale o fundo que serve ao texto
    assert.equal(
      so({ customText: '#ffffff', customHeading: '#000000' }).bg,
      '#000000',
    );
    assert.equal(
      so({ customText: '#000000', customHeading: '#ffffff' }).bg,
      '#ffffff',
    );
  });

  it('a região de aviso é persistente: sem display:none quando vazia (leitor de tela)', () => {
    const warn = q('[data-contrast-warn]');
    assert.equal(warn.getAttribute('aria-atomic'), 'true');
    const regra = UI_CSS.match(/\.ms-a11y-warn:empty\s*\{([^}]*)\}/)[1];
    assert.equal(/display:\s*none/.test(regra), false);
    assert.match(regra, /height:\s*0/);
    assert.match(regra, /overflow:\s*hidden/);
  });
});

describe('M2 — links distintos sob cor personalizada', () => {
  it('linkOn: ≥ 4,5:1 sobre o fundo (azul escuro no claro, azul claro no escuro)', () => {
    assert.equal(linkOn('#ffffff'), '#0000cc');
    assert.equal(linkOn('#000000'), '#93c5fd');
    for (const bg of [
      '#fffbe6',
      '#f5efe0',
      '#e6f0ff',
      '#0f172a',
      '#1a1a1a',
      '#808080',
    ])
      assert.ok(contrastRatio(linkOn(bg), bg) >= 4.5, bg);
  });

  it('cor de link derivada do fundo efetivo é aplicada ao <html>', () => {
    state.set({ options: { customBg: '#000000' } });
    assert.ok(html().classList.contains('ms-custom-link'));
    assert.equal(html().style.getPropertyValue('--ms-custom-link'), '#93c5fd');
    state.set({ options: { customBg: '#ffffff' } });
    assert.equal(html().style.getPropertyValue('--ms-custom-link'), '#0000cc');
  });

  it('CSS: regra de link vem depois de texto e títulos, com sublinhado, fora do widget', () => {
    const i = PAGE_CSS.indexOf('html.ms-custom-link body a:not(#ms-container)');
    assert.ok(i > PAGE_CSS.indexOf('html.ms-custom-heading body'));
    const bloco = PAGE_CSS.slice(i, PAGE_CSS.indexOf('}', i));
    assert.match(bloco, /color: var\(--ms-custom-link\) !important/);
    assert.match(bloco, /text-decoration: underline !important/);
    assert.match(bloco, /:not\(#ms-container \*\)/);
  });
});

describe('L1 — cor do seletor livre exposta como rádio marcado', () => {
  const grupo = (k) => [
    ...panel().querySelectorAll(`[data-option="${k}"] [role="radio"]`),
  ];
  const marcados = (k) =>
    grupo(k).filter((r) => r.getAttribute('aria-checked') === 'true');

  it('cor fora dos presets marca o rádio "Personalizada" (visível, com o hex)', () => {
    state.set({ options: { customText: '#123456' } });
    const on = marcados('customText');
    assert.equal(on.length, 1);
    assert.ok(on[0].classList.contains('ms-swatch--custom'));
    assert.equal(on[0].hidden, false);
    assert.equal(on[0].getAttribute('data-value'), '#123456');
    assert.match(on[0].getAttribute('aria-label'), /Personalizada/);
    assert.equal(on[0].getAttribute('tabindex'), '0');
  });

  it('preset ou "padrão" voltam a marcar o rádio certo e escondem a Personalizada', () => {
    state.set({ options: { customText: '#123456' } });
    state.set({ options: { customText: '#000000' } });
    let on = marcados('customText');
    assert.equal(on.length, 1);
    assert.equal(on[0].getAttribute('data-value'), '#000000');
    assert.equal(
      q('[data-option="customText"] .ms-swatch--custom').hidden,
      true,
    );
    state.set({ options: { customText: '' } });
    on = marcados('customText');
    assert.ok(on[0].classList.contains('ms-swatch--none'));
  });

  it('clicar na Personalizada mantém a cor (não zera nem troca)', () => {
    state.set({ options: { customBg: '#123456' } });
    q('[data-option="customBg"] .ms-swatch--custom').click();
    assert.equal(state.get().options.customBg, '#123456');
  });
});
