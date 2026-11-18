/**
 * W5 — IMP-20: distractionSelectors não escondem diálogos/cookie/header/nav/iframes de conteúdo.
 *       IMP-26: preferências salvas são aplicadas já na execução do script (applyEarlyPrefs),
 *       sem esperar o DOMContentLoaded.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import defaults from '../../src/config/defaults.js';
import { applyEarlyPrefs } from '../../src/modo-simples.js';
import persistence from '../../src/core/persistence.js';
import state from '../../src/core/state.js';
import { installHappy } from './helpers/happyEnv.js';

let env;
afterEach(() => env?.restore());

describe('IMP-20 — seletores de distração', () => {
  const hidden = (bodyHtml) => {
    env = installHappy({ bodyHtml });
    const found = document.querySelectorAll(
      defaults.distractionSelectors.join(','),
    );
    return [...found].map((el) => el.id);
  };

  it('não pega diálogos, modais (inclusive header/nav), cookie/consent nem iframe de conteúdo', () => {
    const ids = hidden(`
      <div id="d1" role="dialog" class="popup"></div>
      <div id="d2" role="alertdialog" class="overlay"></div>
      <div id="d3" aria-modal="true" class="banner"></div>
      <div id="d4" class="modal-overlay"></div>
      <div id="d5" class="cookie-banner"></div>
      <div id="d6" class="consent-banner"></div>
      <header id="h" role="dialog"></header>
      <nav id="n" aria-modal="true"></nav>
      <iframe id="f" src="https://www.youtube.com/embed/x"></iframe>`);
    assert.deepEqual(ids, []);
  });

  it('continua pegando anúncios e distrações específicas', () => {
    const ids = hidden(`
      <div id="a1" class="ad"></div>
      <div id="a2" class="popup-newsletter"></div>
      <div id="a3" class="promo-banner"></div>
      <div id="a4" class="overlay-ad"></div>
      <aside id="a5"></aside><footer id="a6"></footer>
      <header id="a8"></header><nav id="a9"></nav>
      <iframe id="a7" src="https://ad.doubleclick.net/x"></iframe>`);
    assert.deepEqual(ids, [
      'a1',
      'a2',
      'a3',
      'a4',
      'a5',
      'a6',
      'a8',
      'a9',
      'a7',
    ]);
  });
});

describe('IMP-26 — preferências aplicadas antes do DOMContentLoaded', () => {
  beforeEach(() => {
    env = installHappy({ bodyHtml: '' });
    state.reset?.();
  });

  it('aplica tema/escala salvos e o CSS da página de forma síncrona', () => {
    const saved = {
      v: 1,
      options: { colorTheme: 'darkHigh', textScale: '150' },
    };
    persistence.save('state', saved);
    persistence.saveForHost('state', saved);
    const html = document.documentElement;
    assert.equal(html.classList.contains('ms-theme-darkHigh'), false);

    applyEarlyPrefs(window);

    assert.ok(html.classList.contains('ms-theme-darkHigh'));
    assert.ok(html.classList.contains('ms-text-scale-150'));
    assert.ok(document.getElementById('ms-page-styles'));
    // a UI (depende do DOM) não é criada nesta etapa
    assert.equal(document.getElementById('ms-container'), null);
  });

  it('sem <head> ainda, não faz nada', () => {
    const win = { document: { documentElement: {}, head: null } };
    assert.doesNotThrow(() => applyEarlyPrefs(win));
  });
});
