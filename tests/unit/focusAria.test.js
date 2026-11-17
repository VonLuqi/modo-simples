/**
 * F3 grupo B — foco, ARIA e modalidade de entrada (UX-09, UX-10, UX-11, IMP-07, IMP-08).
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { createA11yPanel } from '../../src/ui/a11yPanel.js';
import { createSessionChrome } from '../../src/ui/sessionChrome.js';
import { installHappy } from './helpers/happyEnv.js';

let env;

const estado = (over = {}, modoSimples = false) => ({
  modoSimples,
  panelOpen: false,
  options: { textScale: '100', colorTheme: 'senac', ...over },
});

function montarChrome(extra = {}) {
  return createSessionChrome({
    onToggleModoSimples() {},
    onOpenPanel() {},
    onSpeak() {},
    onToggleSimpleLanguage() {},
    onToggleHideImages() {},
    ...extra,
  });
}

beforeEach(() => {
  env = installHappy();
});
afterEach(() => env.restore());

describe('UX-11 — nome estável + estado por atributo', () => {
  it('switch do chrome e do painel não trocam de rótulo ao ligar/desligar', () => {
    const chrome = montarChrome();
    const panel = createA11yPanel({
      state: estado(),
      onClose() {},
      onToggleModoSimples() {},
      onSetOption() {},
      onSpeak() {},
    });
    document.body.appendChild(panel.element);

    const sw = document.querySelector('[data-action="toggle-simples"]');
    const modo = panel.element.querySelector('[data-action="modo-simples"]');
    for (const on of [false, true, false]) {
      chrome.sync(estado({}, on));
      panel.sync(estado({}, on));
      assert.equal(sw.getAttribute('aria-label'), 'Modo Simples');
      assert.equal(modo.getAttribute('aria-label'), 'Modo Simples');
      assert.equal(sw.getAttribute('aria-checked'), String(on));
      assert.equal(modo.getAttribute('aria-checked'), String(on));
    }
    chrome.destroy();
  });

  it('botões de linguagem/imagens: sem aria-label que muda; estado só em aria-pressed', () => {
    const chrome = montarChrome();
    const lang = document.querySelector('[data-action="lang"]');
    const imgs = document.querySelector('[data-action="images"]');
    chrome.sync(estado({ hideImages: false }, true));
    chrome.sync(estado({ hideImages: true }, true));
    assert.equal(lang.getAttribute('aria-label'), null);
    assert.equal(imgs.getAttribute('aria-label'), null);
    assert.equal(imgs.getAttribute('aria-pressed'), 'false');
    assert.equal(
      document.querySelector('[data-images-label]').getAttribute('aria-hidden'),
      'true',
    );
    chrome.destroy();
  });
});
