/**
 * F7e — strongFocus (anel duplo no <html>.ms-strong-focus) e showShortcuts (cartão de atalhos):
 * opções padrão/persistidas/anunciadas/zeradas, lista única de atalhos, Fechar só na sessão.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  CARD_ID,
  hideShortcutsCard,
  placeShortcutsCard,
  startShortcutsCard,
  stopShortcutsCard,
} from '../../src/features/shortcutsCard.js';
import ModoSimples from '../../src/modo-simples.js';
import state from '../../src/core/state.js';
import { hydratePersistedState } from '../../src/core/persistedState.js';
import { diffStateAnnouncements } from '../../src/core/announcements.js';
import { SHORTCUTS } from '../../src/ui/strings.js';
import { PAGE_CSS } from '../../src/ui/styles.generated.js';
import { installHappy } from './helpers/happyEnv.js';

let env;
const $ = (s) => document.querySelector(s);

beforeEach(() => {
  env = installHappy({
    bodyHtml: '<main><a href="#" accesskey="m">Menu</a></main>',
  });
});
afterEach(() => {
  stopShortcutsCard();
  env.restore();
});

describe('strongFocus', () => {
  it('padrão false, persistida, anunciada; CSS com anel duplo ≥ 2px fora da UI da lib', () => {
    assert.equal(state.get().options.strongFocus, false);
    assert.equal(
      hydratePersistedState({ options: { strongFocus: 1 } }).options
        .strongFocus,
      true,
    );
    assert.deepEqual(
      diffStateAnnouncements(
        { options: { strongFocus: false } },
        { options: { strongFocus: true } },
      ),
      ['Foco reforçado ligado'],
    );
    const bloco = PAGE_CSS.match(
      /html\.ms-strong-focus :focus-visible[^{]*\{([^}]*)\}/,
    )[1];
    assert.match(bloco, /outline: 3px solid #000 !important/);
    assert.match(bloco, /box-shadow: 0 0 0 6px #ffd400 !important/);
    assert.match(PAGE_CSS, /:focus-visible:not\(#ms-container/);
  });

  it('ligar marca o <html>; "Desligar tudo" zera', () => {
    const inst = new ModoSimples({ persistence: false });
    inst.init();
    state.set({ options: { ...state.get().options, strongFocus: true } });
    assert.ok(document.documentElement.classList.contains('ms-strong-focus'));
    inst._resetAll();
    assert.equal(state.get().options.strongFocus, false);
    assert.equal(
      document.documentElement.classList.contains('ms-strong-focus'),
      false,
    );
    inst.destroy();
  });
});

describe('showShortcuts', () => {
  it('padrão false, persistida e anunciada', () => {
    assert.equal(state.get().options.showShortcuts, false);
    assert.equal(
      hydratePersistedState({ options: { showShortcuts: 1 } }).options
        .showShortcuts,
      true,
    );
    assert.deepEqual(
      diffStateAnnouncements(
        { options: { showShortcuts: false } },
        { options: { showShortcuts: true } },
      ),
      ['Atalhos do teclado visíveis'],
    );
  });

  it('cartão: region rotulada, atalhos da lista única + accesskey da página, Fechar 44px', () => {
    startShortcutsCard();
    const card = $(`#${CARD_ID}`);
    assert.equal(card.getAttribute('role'), 'region');
    assert.equal(card.getAttribute('aria-label'), 'Atalhos do teclado');
    const txt = card.textContent;
    for (const s of SHORTCUTS) assert.ok(txt.includes(s.keys), s.keys);
    assert.match(txt, /Alt\+M/);
    assert.match(txt, /Menu/);
    assert.equal(card.querySelector('button').style.minHeight, '44px');
  });

  it('Fechar esconde só nesta sessão; desligar e ligar mostra de novo', () => {
    startShortcutsCard();
    $(`#${CARD_ID} button`).click();
    assert.equal($(`#${CARD_ID}`), null);
    startShortcutsCard(); // opção segue ligada (ex.: recarregar na mesma sessão): continua fechado
    assert.equal($(`#${CARD_ID}`), null);
    stopShortcutsCard();
    startShortcutsCard();
    assert.ok($(`#${CARD_ID}`));
  });

  it('ligar/desligar pela opção; lado oposto ao botão; "Desligar tudo" remove o cartão', () => {
    const inst = new ModoSimples({
      persistence: false,
      position: 'bottom-left',
    });
    inst.init();
    state.set({ options: { ...state.get().options, showShortcuts: true } });
    assert.equal($(`#${CARD_ID}`).style.right, '16px');
    inst._resetAll();
    assert.equal(state.get().options.showShortcuts, false);
    assert.equal($(`#${CARD_ID}`), null);
    inst.destroy();
  });
});

describe('achados do QA T148 (cartão)', () => {
  it('M4: lado vem do botão real (_side) e o cartão troca ao mover o painel', () => {
    const inst = new ModoSimples({ persistence: false });
    inst.init();
    state.set({ options: { ...state.get().options, showShortcuts: true } });
    const lado = inst._side; // botão flutuante
    const card = () => $(`#${CARD_ID}`);
    const oposto = lado === 'left' ? 'right' : 'left';
    assert.equal(card().style[oposto], '16px');
    inst._movePanelSide();
    const novo = inst._side === 'left' ? 'right' : 'left';
    assert.equal(card().style[novo], '16px');
    assert.equal(card().style[inst._side], 'auto'); // não fica embaixo do botão
    inst.destroy();
  });

  it('placeShortcutsCard sem cartão aberto não faz nada', () => {
    placeShortcutsCard('left');
    assert.equal($(`#${CARD_ID}`), null);
  });

  it('sem sessionStorage (bloqueado), o cartão ainda abre e fecha', () => {
    const real = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
    Object.defineProperty(globalThis, 'sessionStorage', {
      configurable: true,
      get() {
        throw new Error('bloqueado');
      },
    });
    try {
      startShortcutsCard();
      assert.ok($(`#${CARD_ID}`));
      $(`#${CARD_ID} button`).click();
      assert.equal($(`#${CARD_ID}`), null);
      stopShortcutsCard();
    } finally {
      if (real) Object.defineProperty(globalThis, 'sessionStorage', real);
      else delete globalThis.sessionStorage;
    }
  });

  it('accesskey vazio é ignorado; sem texto usa a própria tecla; hideShortcutsCard mantém o "Fechar"', () => {
    document.body.innerHTML =
      '<a accesskey=" ">a</a><button accesskey="z"></button>';
    startShortcutsCard();
    const txt = $(`#${CARD_ID}`).textContent;
    assert.match(txt, /Alt\+Z/);
    assert.equal(/Alt\+ /.test(txt), false);
    $(`#${CARD_ID} button`).click();
    hideShortcutsCard();
    startShortcutsCard();
    assert.equal($(`#${CARD_ID}`), null, 'segue fechado na sessão');
  });
});
