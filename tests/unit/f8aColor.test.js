/**
 * F8a — cor: temas monocromático e claro alto contraste, saturação baixa/normal/alta
 * e cor personalizada (texto/títulos/fundo: presets + seletor livre). Tudo entra no
 * "Desligar tudo" (ADR-015) e na persistência sanitizada.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import ModoSimples from '../../src/modo-simples.js';
import state from '../../src/core/state.js';
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
const stored = (k) => localStorage.getItem(`ms_${k}:exemplo.test`);

beforeEach(() => {
  env = installHappy({ bodyHtml: SAMPLE_PAGE });
  inst = new ModoSimples();
  inst.init();
});
afterEach(() => {
  inst?.destroy();
  env.restore();
});

describe('F8a — temas novos', () => {
  it('mono e lightHigh são opções do painel e aplicam a classe no <html>', () => {
    for (const t of ['mono', 'lightHigh']) {
      q(`[data-option="colorTheme"] [data-value="${t}"]`).click();
      assert.equal(state.get().options.colorTheme, t);
      assert.ok(html().classList.contains(`ms-theme-${t}`));
    }
    assert.equal(html().classList.contains('ms-theme-mono'), false);
  });

  it('CSS: mono = grayscale no <html>; claro alto contraste = preto sobre branco', () => {
    const css = PAGE_CSS;
    assert.match(css, /html\.ms-theme-mono\s*\{\s*filter:\s*grayscale\(1\)/);
    assert.match(
      css,
      /html\.ms-theme-lightHigh,\s*html\.ms-theme-lightHigh body\s*\{\s*background-color:\s*#ffffff[^}]*color:\s*#000000/,
    );
  });
});

describe('F8a — saturação', () => {
  it('baixa/alta ligam classe; normal não deixa classe nem filtro', () => {
    q('[data-option="colorSaturation"] [data-value="low"]').click();
    assert.ok(html().classList.contains('ms-sat-low'));
    q('[data-option="colorSaturation"] [data-value="high"]').click();
    assert.ok(html().classList.contains('ms-sat-high'));
    assert.equal(html().classList.contains('ms-sat-low'), false);
    q('[data-option="colorSaturation"] [data-value="normal"]').click();
    assert.equal(html().classList.contains('ms-sat-high'), false);
    assert.equal(html().classList.contains('ms-sat-low'), false);
  });

  it('o filtro fica só no <html> (nunca em body/filhos: não quebra position:fixed)', () => {
    const css = PAGE_CSS.replace(/\/\*[\s\S]*?\*\//g, '');
    assert.match(css, /html\.ms-sat-low\s*\{\s*filter:\s*saturate\(/);
    assert.match(css, /html\.ms-sat-high\s*\{\s*filter:\s*saturate\(/);
    const regras = [
      ...css.matchAll(/([^{}]+)\{([^{}]*(?:saturate|grayscale)\([^{}]*)\}/g),
    ];
    assert.equal(regras.length, 3);
    for (const [, sel] of regras)
      assert.match(sel.trim(), /^html\.ms-[\w-]+(\.[\w-]+)?$/);
  });
});

describe('F8a — cor personalizada', () => {
  const alvos = [
    ['customText', 'ms-custom-text', '--ms-custom-text'],
    ['customHeading', 'ms-custom-heading', '--ms-custom-heading'],
    ['customBg', 'ms-custom-bg', '--ms-custom-bg'],
  ];

  it('cada alvo tem 8 presets + "padrão" e um seletor livre', () => {
    for (const [key] of alvos) {
      const sw = panel().querySelectorAll(`[data-option="${key}"] .ms-swatch`);
      assert.equal(sw.length, 10, key); // 8 presets + padrão do site + "Personalizada" (oculta)
      assert.ok(q(`input[type="color"][data-picker="${key}"]`), key);
      assert.ok(q(`input[data-picker="${key}"]`).getAttribute('aria-label'));
    }
  });

  it('preset aplica classe + variável; "padrão" remove os dois', () => {
    for (const [key, cls, prop] of alvos) {
      const preset = q(
        `[data-option="${key}"] .ms-swatch:not(.ms-swatch--none):not(.ms-swatch--custom)`,
      );
      const hex = preset.getAttribute('data-value');
      preset.click();
      assert.equal(state.get().options[key], hex);
      assert.ok(html().classList.contains(cls));
      assert.equal(html().style.getPropertyValue(prop), hex);
      q(`[data-option="${key}"] .ms-swatch--none`).click();
      assert.equal(state.get().options[key], '');
      assert.equal(html().classList.contains(cls), false);
      assert.equal(html().style.getPropertyValue(prop), '');
    }
  });

  it('seletor livre grava o hex escolhido', () => {
    const input = q('input[data-picker="customBg"]');
    input.value = '#123456';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    assert.equal(state.get().options.customBg, '#123456');
    assert.equal(html().style.getPropertyValue('--ms-custom-bg'), '#123456');
  });

  it('hex inválido no estado não vira estilo', () => {
    state.set({ options: { customText: 'red;} body{display:none' } });
    assert.equal(html().classList.contains('ms-custom-text'), false);
    assert.equal(html().style.getPropertyValue('--ms-custom-text'), '');
  });

  it('presets de texto/títulos têm contraste ≥ 7:1 contra branco ou preto', () => {
    const lum = (hex) => {
      const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
      const [r, g, b] = c.map((x) =>
        x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4,
      );
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const ratio = (a, b) => {
      const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };
    for (const key of ['customText', 'customHeading']) {
      for (const sw of panel().querySelectorAll(
        `[data-option="${key}"] .ms-swatch:not(.ms-swatch--none):not(.ms-swatch--custom)`,
      )) {
        const hex = sw.getAttribute('data-value');
        assert.ok(
          Math.max(ratio(hex, '#ffffff'), ratio(hex, '#000000')) >= 7,
          `${key} ${hex}`,
        );
      }
    }
  });

  it('CSS: títulos vencem o texto (mesma cadeia de exclusão do widget, h1–h6 a mais)', () => {
    const css = PAGE_CSS;
    assert.match(
      css,
      /html\.ms-custom-heading body :is\(h1, h2, h3, h4, h5, h6\):not\(#ms-container\)/,
    );
    assert.match(css, /html\.ms-custom-text body \*:not\(#ms-container\)/);
  });
});

describe('F8a — Desligar tudo, persistência e anúncios', () => {
  it('Desligar tudo zera saturação e cores e limpa classes/variáveis', () => {
    state.set({
      options: {
        colorTheme: 'mono',
        colorSaturation: 'high',
        customText: '#000000',
        customHeading: '#0b2c5f',
        customBg: '#fffbe6',
      },
    });
    q('[data-action="reset-all"]').click();
    const o = state.get().options;
    assert.equal(o.colorTheme, 'senac');
    assert.equal(o.colorSaturation, 'normal');
    assert.deepEqual([o.customText, o.customHeading, o.customBg], ['', '', '']);
    for (const c of [
      'ms-sat-high',
      'ms-custom-text',
      'ms-custom-heading',
      'ms-custom-bg',
    ])
      assert.equal(html().classList.contains(c), false, c);
    assert.equal(html().style.getPropertyValue('--ms-custom-bg'), '');
  });

  it('persiste e reidrata; valores inválidos caem no padrão', () => {
    state.set({ options: { colorSaturation: 'low', customBg: '#FFFBE6' } });
    const saved = JSON.parse(stored('state'));
    assert.equal(saved.options.colorSaturation, 'low');
    const ok = hydratePersistedState(saved);
    assert.equal(ok.options.colorSaturation, 'low');
    assert.equal(ok.options.customBg, '#fffbe6');
    const ruim = hydratePersistedState({
      options: {
        colorTheme: 'mono',
        colorSaturation: 'extrema',
        customText: 'url(x)',
        customHeading: 42,
      },
    });
    assert.equal(ruim.options.colorTheme, 'mono');
    assert.equal(ruim.options.colorSaturation, 'normal');
    assert.equal(ruim.options.customText, '');
    assert.equal(ruim.options.customHeading, '');
  });

  it('anuncia saturação e cor personalizada', () => {
    const base = state.get();
    const mk = (o) => ({ ...base, options: { ...base.options, ...o } });
    assert.deepEqual(
      diffStateAnnouncements(base, mk({ colorSaturation: 'high' })),
      ['Saturação alta'],
    );
    assert.deepEqual(
      diffStateAnnouncements(base, mk({ customBg: '#ffffff' })),
      ['Cor personalizada de fundo #ffffff'],
    );
    assert.deepEqual(
      diffStateAnnouncements(mk({ customText: '#000000' }), base),
      ['Cor personalizada de texto removida'],
    );
  });

  it('painel mostra o estado atual (sem match no radiogroup ainda deixa 1 tabulável)', () => {
    state.set({ options: { customText: '#123456' } });
    const tab = [
      ...panel().querySelectorAll('[data-option="customText"] .ms-swatch'),
    ].filter((b) => b.getAttribute('tabindex') === '0');
    assert.equal(tab.length, 1);
    assert.equal(q('[data-state-for="customText"]').textContent, '#123456');
  });
});
