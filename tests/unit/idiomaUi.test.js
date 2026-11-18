/**
 * Idioma da UI (T229): seletor no painel, textos por locale e refazer a UI em 'ms:localechange'.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { createA11yPanel } from '../../src/ui/a11yPanel.js';
import { createFab } from '../../src/ui/fab.js';
import { buildUI, bindEvents } from '../../src/ui/binding.js';
import state from '../../src/core/state.js';
import { setLocale } from '../../src/i18n/index.js';
import { installHappy } from './helpers/happyEnv.js';

let env;
let calls;

const estado = (over = {}) => ({
  modoSimples: false,
  panelOpen: false,
  options: { textScale: '100', colorTheme: 'senac', ...over },
});

const painel = (opts = {}) => {
  const panel = createA11yPanel({
    state: estado(opts.options),
    onClose: () => {},
    onToggleModoSimples: () => {},
    onSetOption: (k, v) => calls.push([k, v]),
    onSpeak: () => {},
  });
  document.body.appendChild(panel.element);
  return panel;
};

beforeEach(() => {
  env = installHappy();
  calls = [];
  setLocale('pt');
});
afterEach(() => {
  setLocale('pt');
  env.restore();
});

describe('seletor de idioma no painel', () => {
  it('lista Automático + um por idioma, cada um na própria língua', () => {
    const panel = painel();
    const opts = [...panel.element.querySelectorAll('[data-language] option')];
    assert.deepEqual(
      opts.map((o) => o.value),
      ['auto', 'pt', 'en', 'es'],
    );
    assert.deepEqual(
      opts.slice(1).map((o) => o.textContent),
      ['Português', 'English', 'Español'],
    );
    assert.match(opts[0].textContent, /^Automático \(/);
  });

  it('mostra o idioma salvo e avisa onSetOption ao escolher', () => {
    const panel = painel({ options: { language: 'es' } });
    const sel = panel.element.querySelector('[data-language]');
    assert.equal(sel.value, 'es');
    sel.value = 'en';
    sel.dispatchEvent(new window.Event('change', { bubbles: true }));
    assert.deepEqual(calls, [['language', 'en']]);
  });

  it('o rótulo do seletor e do painel seguem o locale em que o painel nasce', () => {
    for (const [loc, label, voice] of [
      ['pt', 'Idioma', 'Estúdio de Voz'],
      ['en', 'Language', 'Voice Studio'],
      ['es', 'Idioma', 'Estudio de Voz'],
    ]) {
      setLocale(loc);
      const panel = painel();
      assert.equal(
        panel.element.querySelector('label[for="ms-language"]').textContent,
        label,
      );
      assert.ok(panel.element.textContent.includes(voice), `${loc}: ${voice}`);
      panel.element.remove();
    }
  });

  it('auto mostra o idioma resolvido (html lang) no rótulo', () => {
    document.documentElement.setAttribute('lang', 'es');
    setLocale('en');
    const panel = painel();
    const auto = panel.element.querySelector('[data-language] option');
    assert.equal(auto.textContent, 'Automatic (Español)');
    document.documentElement.removeAttribute('lang');
  });
});

describe('FAB acompanha o idioma', () => {
  it('rótulo do botão por locale', () => {
    setLocale('en');
    const fab = createFab({ onClick() {}, onHide() {} });
    assert.equal(
      fab.button.getAttribute('aria-label'),
      'Open accessibility panel',
    );
  });
});

describe('refazer a UI em ms:localechange', () => {
  const montar = () => {
    const ms = {
      _config: { position: 'bottom-right', brand: {} },
      _closePanel() {},
      _setModoSimples() {},
      _savePreferShowImages() {},
      _toggleSpeak() {},
      _resetAll() {},
      _applyProfile() {},
      _movePanelSide() {},
      _togglePanel() {},
      _hideWidget() {},
      _loadPanelSide: () => 'right',
      _setPageInert() {},
      _syncSessionChrome() {},
      _syncSimpleNav() {},
      _onStateChange() {},
      _syncSpeaking() {},
    };
    buildUI(ms);
    bindEvents(ms);
    return ms;
  };
  const limpar = (ms) => {
    ms._removeStateListener?.();
    document.removeEventListener('keydown', ms._onDocKeydown);
    document.removeEventListener('click', ms._onDocClick, true);
    ms._removeSpeakListener?.();
    ms._host.remove();
  };

  it('troca para en e es: painel e FAB novos, lang do host, painel aberto continua aberto', () => {
    state.set({ panelOpen: true });
    const ms = montar();
    const antigo = ms._panel.element;
    assert.equal(ms._host.lang, 'pt-BR');
    assert.equal(ms._panel.element.hidden, false);
    for (const [loc, bcp, fabLabel] of [
      ['en', 'en-US', 'Close accessibility panel'],
      ['es', 'es-ES', 'Cerrar el panel de accesibilidad'],
    ]) {
      setLocale(loc);
      assert.notEqual(ms._panel.element, antigo, `${loc}: painel refeito`);
      assert.equal(ms._host.lang, bcp);
      assert.equal(ms._panel.element.hidden, false, `${loc}: segue aberto`);
      assert.equal(ms._shadow.querySelectorAll('#ms-a11y-panel').length, 1);
      assert.equal(ms._fab.button.getAttribute('aria-label'), fabLabel);
    }
    state.set({ panelOpen: false });
    limpar(ms);
  });

  it('depois de remover o listener (destroy), trocar o idioma não refaz nada', () => {
    const ms = montar();
    const painelAntes = ms._panel.element;
    ms._removeStateListener();
    setLocale('en');
    assert.equal(ms._panel.element, painelAntes);
    ms._removeStateListener = null;
    limpar(ms);
  });
});
