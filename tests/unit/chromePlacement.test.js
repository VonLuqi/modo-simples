/**
 * sessionChrome — onde o switch SIMPLES fica com MS ligado (_placeChrome / _moveChrome).
 * Cobre o prepend no nav de pills e as alternativas quando o nav não existe.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { createSessionChrome } from '../../src/ui/sessionChrome.js';
import { installHappy } from './helpers/happyEnv.js';

let env;

const noop = () => {};
const estado = (modoSimples) => ({
  modoSimples,
  panelOpen: false,
  options: { textScale: '100', colorTheme: 'senac' },
});

function montar(mount) {
  return createSessionChrome({
    onToggleModoSimples: noop,
    onOpenPanel: noop,
    onSpeak: noop,
    onToggleSimpleLanguage: noop,
    onToggleHideImages: noop,
    mount,
  });
}

beforeEach(() => {
  env = installHappy();
});
afterEach(() => env.restore());

describe('sessionChrome — posição do switch com MS on', () => {
  it('já filho do nav de pills mas não o primeiro: volta a ser o primeiro filho', () => {
    document.body.innerHTML =
      '<nav data-ms-pills><div class="ms-pills-nav__inner"></div></nav>';
    const chrome = montar({ chrome: '[data-ms-pills]' });
    chrome.sync(estado(false));
    const wrap = document.getElementById('ms-simples-chrome');
    const nav = document.querySelector('[data-ms-pills]');
    assert.equal(wrap.parentElement, nav);
    assert.notEqual(nav.children[0], wrap);

    chrome.sync(estado(true));
    assert.equal(wrap.parentElement, nav);
    assert.equal(nav.children[0], wrap);

    // sync repetido: já é o primeiro, não mexe
    chrome.sync(estado(true));
    assert.equal(nav.children[0], wrap);
    chrome.destroy();
  });

  it('sem nav de pills: usa a barra de sessão; sem os botões, o interior da barra', () => {
    const chrome = montar(undefined);
    chrome.sync(estado(true));
    const wrap = document.getElementById('ms-simples-chrome');
    assert.ok(wrap.parentElement.classList.contains('ms-session-actions'));

    document.querySelector('.ms-session-actions').remove();
    chrome.sync(estado(false));
    chrome.sync(estado(true));
    assert.ok(wrap.parentElement.classList.contains('ms-session-bar-inner'));
    chrome.destroy();
  });

  it('sem nav nem barra: fica fixo no body', () => {
    const chrome = montar(undefined);
    chrome.sync(estado(false));
    document.querySelector('.ms-session-actions').remove();
    document.querySelector('.ms-session-bar-inner').remove();
    chrome.sync(estado(true));
    const wrap = document.getElementById('ms-simples-chrome');
    assert.equal(wrap.parentElement, document.body);
    assert.ok(wrap.classList.contains('ms-simples-chrome--fixed'));
    chrome.destroy();
  });
});
