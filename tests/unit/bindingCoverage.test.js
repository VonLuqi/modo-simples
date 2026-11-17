/**
 * F6e — cobertura de binding.js e fab.js: painel restaurado aberto, callbacks da barra de
 * sessão, Esc, toggle pelo FAB, opener dentro de shadow DOM, esconder sem <main>, tip do FAB.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import ModoSimples from '../../src/modo-simples.js';
import state from '../../src/core/state.js';
import { installHappy, SAMPLE_PAGE } from './helpers/happyEnv.js';

let env;
let inst;

const shadow = () => document.querySelector('#ms-container').shadowRoot;
const fabBtn = () => shadow().querySelector('#ms-fab');
const panel = () => shadow().querySelector('#ms-a11y-panel');
const boot = (cfg) => {
  inst = new ModoSimples(cfg);
  inst.init();
};
const key = (target, init) =>
  target.dispatchEvent(
    new window.KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      ...init,
    }),
  );

afterEach(() => {
  inst?.destroy();
  env.restore();
});

describe('binding — painel e foco', () => {
  beforeEach(() => {
    env = installHappy({ bodyHtml: SAMPLE_PAGE });
  });

  it('estado com panelOpen no boot abre o painel e deixa a página inert', () => {
    state.set({ panelOpen: true });
    boot();
    assert.equal(panel().hidden, false);
    assert.equal(fabBtn().getAttribute('aria-expanded'), 'true');
    assert.equal(document.querySelector('main').hasAttribute('inert'), true);
  });

  it('clicar no FAB alterna abrir/fechar', () => {
    boot();
    fabBtn().click();
    assert.equal(state.get().panelOpen, true);
    assert.equal(panel().hidden, false);
    fabBtn().click();
    assert.equal(state.get().panelOpen, false);
    assert.equal(panel().hidden, true);
  });

  it('Esc fecha o painel aberto; com painel fechado não faz nada', () => {
    boot();
    key(document, { key: 'Escape' });
    assert.equal(state.get().panelOpen, false);
    fabBtn().click();
    key(document, { key: 'Escape' });
    assert.equal(state.get().panelOpen, false);
    assert.equal(panel().hidden, true);
  });

  it('opener dentro de shadow DOM recebe o foco de volta ao fechar', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = host.attachShadow({ mode: 'open' });
    const inner = document.createElement('button');
    root.appendChild(inner);
    boot();
    inner.focus();
    inst._openPanel();
    inst._closePanel();
    assert.equal(root.activeElement, inner);
  });
});

describe('binding — barra de sessão', () => {
  beforeEach(() => {
    env = installHappy({
      bodyHtml: `${SAMPLE_PAGE}<p data-ms-plain="Difícil" data-ms-simple="Fácil">Difícil</p>`,
    });
  });

  it('botão Imagens alterna hideImages e, com MS ligado, grava a preferência', () => {
    boot({ sessionBar: true });
    const btn = () => document.querySelector('[data-action="images"]');
    btn().click();
    assert.equal(state.get().options.hideImages, true);
    assert.equal(
      localStorage.getItem('ms_preferShowImagesInMs:exemplo.test'),
      null,
    );

    inst.enable();
    assert.equal(state.get().options.hideImages, true);
    btn().click(); // MS ligado: mostrar imagens vira preferência salva
    assert.equal(state.get().options.hideImages, false);
    assert.equal(
      JSON.parse(localStorage.getItem('ms_preferShowImagesInMs:exemplo.test')),
      true,
    );
  });

  it('botão Linguagem simples alterna simpleLanguage no estado', () => {
    boot({ sessionBar: true });
    inst.enable();
    assert.equal(state.get().options.simpleLanguage, true);
    document.querySelector('[data-action="lang"]').click();
    assert.equal(state.get().options.simpleLanguage, false);
  });

  it('ícone do chrome abre o painel', () => {
    boot({ sessionBar: true });
    document.querySelector('[data-action="open-panel"]').click();
    assert.equal(state.get().panelOpen, true);
  });
});

describe('binding — callbacks do painel', () => {
  beforeEach(() => {
    env = installHappy({ bodyHtml: SAMPLE_PAGE });
  });
  const click = (sel) => shadow().querySelector(sel).click();

  it('botão fechar, switch do Modo Simples e opções chegam ao estado', () => {
    boot();
    fabBtn().click();
    click('.ms-a11y-close');
    assert.equal(state.get().panelOpen, false);

    click('[data-action="modo-simples"]');
    assert.equal(state.get().modoSimples, true);

    click('.ms-segment[data-value="150"]');
    assert.equal(state.get().options.textScale, '150');

    click('.ms-switch[data-option="reducedMotion"]');
    assert.equal(state.get().options.reducedMotion, true);
    assert.equal(
      JSON.parse(localStorage.getItem('ms_state:exemplo.test')).options
        .reducedMotion,
      true,
    );

    // MS ligado: mexer em "ocultar imagens" grava a preferência de mostrar imagens
    const wasHidden = state.get().options.hideImages;
    click('.ms-switch[data-option="hideImages"]');
    assert.equal(state.get().options.hideImages, !wasHidden);
    assert.equal(
      JSON.parse(localStorage.getItem('ms_preferShowImagesInMs:exemplo.test')),
      wasHidden,
    );
  });

  it('chrome: switch SIMPLES liga o Modo Simples', () => {
    boot({ sessionBar: true });
    document.querySelector('[data-action="toggle-simples"]').click();
    assert.equal(state.get().modoSimples, true);
  });

  it('syncSpeaking repassa o estado de fala ao painel e ao chrome', () => {
    boot({ sessionBar: true });
    inst._syncSpeaking(true);
    assert.equal(
      shadow().querySelector('[data-speak-text]').textContent,
      'Parar',
    );
    inst._syncSpeaking(false);
    assert.equal(
      shadow().querySelector('[data-speak-text]').textContent,
      'Ouvir',
    );
  });
});

describe('binding — esconder widget sem <main>', () => {
  beforeEach(() => {
    env = installHappy({ bodyHtml: '<div id="x"><p>sem main</p></div>' });
  });

  it('esconde o FAB e tira o foco do elemento ativo da página', () => {
    document.body.insertAdjacentHTML('beforeend', '<button id="b">b</button>');
    boot();
    const b = document.getElementById('b');
    b.focus();
    assert.equal(document.activeElement, b);
    inst._hideWidget();
    assert.equal(shadow().querySelector('.ms-fab-wrap').hidden, true);
    assert.equal(document.activeElement, document.body);
  });
});

describe('binding — esconder widget com <main>', () => {
  beforeEach(() => {
    env = installHappy({ bodyHtml: SAMPLE_PAGE });
  });

  it('foca o main com tabindex temporário, removido ao perder o foco', () => {
    boot();
    const main = document.querySelector('main');
    inst._hideWidget();
    assert.equal(main.getAttribute('tabindex'), '-1');
    assert.equal(document.activeElement, main);
    main.blur();
    assert.equal(main.hasAttribute('tabindex'), false);
  });

  it('preserva tabindex que o site já tinha', () => {
    const main = document.querySelector('main');
    main.setAttribute('tabindex', '0');
    boot();
    inst._hideWidget();
    main.blur();
    assert.equal(main.getAttribute('tabindex'), '0');
  });
});

describe('fab — dica de primeira visita', () => {
  beforeEach(() => {
    env = installHappy({ bodyHtml: SAMPLE_PAGE });
  });

  it('animationend de saída esconde a dica; outras animações são ignoradas', () => {
    boot();
    const tip = shadow().querySelector('.ms-fab-tip');
    assert.equal(tip.hidden, false);
    const fire = (name) => {
      const ev = new window.Event('animationend');
      Object.defineProperty(ev, 'animationName', { value: name });
      tip.dispatchEvent(ev);
    };
    fire('ms-fab-tip-in');
    assert.equal(tip.hidden, false);
    fire('ms-fab-tip-out');
    assert.equal(tip.hidden, true);
    assert.equal(JSON.parse(localStorage.getItem('ms_fabTipSeen')), true);
  });
});
