/**
 * F5-T09 — Regressão UX da lib: classes do mutator, FAB aria-expanded, sync do chrome.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { createElement, installDocument } from './helpers/miniDom.js';
import {
  applyOptions,
  applyModoSimples,
  revertModoSimples,
  revert,
} from '../../src/mutator/domMutator.js';
import { createFab } from '../../src/ui/fab.js';
import { createSessionChrome } from '../../src/ui/sessionChrome.js';
import { getPageStyles, getUIStyles } from '../../src/ui/styles.js';
import defaults from '../../src/config/defaults.js';

const configTeste = {
  ...defaults,
  mainSelectors: ['main'],
  distractionSelectors: ['.ad'],
};

let env;

function montarPaginaBasica() {
  env = installDocument((_doc, _html, body) => {
    const header = createElement('header');
    header.className = 'site-header';
    const inner = createElement('div');
    inner.className = 'header-inner';
    header.appendChild(inner);
    body.appendChild(header);

    const main = createElement('main');
    main.textContent =
      'Texto principal da página com densidade suficiente para o scorer heurístico.';
    body.appendChild(main);

    const ad = createElement('aside');
    ad.className = 'ad';
    ad.textContent = 'Anúncio';
    body.appendChild(ad);
  });
}

beforeEach(() => {
  montarPaginaBasica();
  revert();
});

afterEach(() => {
  revert();
  env?.restore();
  env = null;
});

describe('mutator — classes Modo Simples (F5-T09)', () => {
  it('applyOptions liga classes de escala, tema e flags no <html>', () => {
    applyOptions({
      options: {
        textScale: '125',
        colorTheme: 'yellowBlack',
        simpleLanguage: true,
        dyslexiaFont: true,
        highlightLinks: true,
      },
    });

    const html = document.documentElement;
    assert.ok(html.classList.contains('ms-text-scale-125'));
    assert.ok(html.classList.contains('ms-theme-yellowBlack'));
    assert.ok(html.classList.contains('ms-simple-language'));
    assert.ok(html.classList.contains('ms-dyslexia-font'));
    assert.ok(html.classList.contains('ms-highlight-links'));
    assert.ok(!html.classList.contains('ms-ativo'));
  });

  it('applyModoSimples adiciona ms-ativo, marca principal e esconde distrações', () => {
    applyModoSimples(
      { options: { textScale: '100', colorTheme: 'senac' } },
      configTeste,
    );

    const html = document.documentElement;
    assert.ok(html.classList.contains('ms-ativo'));
    // 100% é o padrão: sem classe (não sobrescreve o font-size do host — IMP-05)
    assert.ok(!html.classList.contains('ms-text-scale-100'));
    assert.ok(html.classList.contains('ms-theme-senac'));

    const main = document.querySelector('main');
    assert.ok(main);
    assert.equal(main.getAttribute('data-ms-principal'), '');

    const ad = document.querySelector('.ad');
    assert.ok(ad);
    assert.equal(ad.getAttribute('data-ms-hidden'), 'true');
  });

  it('revertModoSimples remove ms-ativo e marcadores, mantém opções', () => {
    applyModoSimples(
      {
        options: {
          textScale: '150',
          colorTheme: 'senac',
          simpleLanguage: true,
        },
      },
      configTeste,
    );
    revertModoSimples();

    const html = document.documentElement;
    assert.ok(!html.classList.contains('ms-ativo'));
    assert.ok(html.classList.contains('ms-text-scale-150'));
    assert.ok(html.classList.contains('ms-simple-language'));

    assert.equal(document.querySelector('[data-ms-principal]'), null);
    assert.equal(document.querySelector('[data-ms-hidden="true"]'), null);
  });
});

describe('createFab — aria-expanded (F5-T09)', () => {
  it('sync atualiza aria-expanded, label e estado visual', () => {
    const { button, element, sync } = createFab({ onClick() {} });

    assert.equal(button.getAttribute('aria-expanded'), 'false');
    assert.equal(
      button.getAttribute('aria-label'),
      'Abrir painel de acessibilidade',
    );
    assert.ok(!button.classList.contains('ms-fab--open'));

    sync({ panelOpen: true });
    assert.equal(button.getAttribute('aria-expanded'), 'true');
    assert.equal(
      button.getAttribute('aria-label'),
      'Fechar painel de acessibilidade',
    );
    assert.ok(button.classList.contains('ms-fab--open'));
    assert.ok(element.classList.contains('ms-fab-wrap--open'));

    const tip = element.querySelector('.ms-fab-tip');
    assert.ok(tip);
    assert.equal(tip.hidden, true);

    sync({ panelOpen: false });
    assert.equal(button.getAttribute('aria-expanded'), 'false');
    // UX-08: depois de visto (aqui, ao abrir o painel) a dica não volta
    assert.equal(tip.hidden, true);
  });

  it('dica: só na primeira visita, sem aria-describedby (UX-08)', () => {
    const store = new Map();
    global.localStorage = {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
    };
    const first = createFab({ onClick() {} });
    assert.equal(first.element.querySelector('.ms-fab-tip').hidden, false);
    assert.equal(first.button.hasAttribute('aria-describedby'), false);

    // QA LOW-3: sem abrir o painel nem esperar a animação, a 2ª visita já não vê a dica
    const again = createFab({ onClick() {} });
    assert.equal(again.element.querySelector('.ms-fab-tip').hidden, true);
    delete global.localStorage;
  });
});

describe('createSessionChrome — sync (F5-T09)', () => {
  it('sync liga toggle, barra on/off e rótulo de linguagem', () => {
    const chrome = createSessionChrome({
      onToggleModoSimples() {},
      onOpenPanel() {},
      onSpeak() {},
      onToggleSimpleLanguage() {},
    });

    const switchBtn = document.querySelector('[data-action="toggle-simples"]');
    const toggleWrap = document.querySelector('.ms-simples-toggle-wrap');
    const barInner = document.querySelector('.ms-session-bar-inner');
    const off = document.querySelector('.ms-session-off');
    const onBlock = document.querySelector('.ms-session-on');
    const langLabel = document.querySelector('[data-lang-label]');

    assert.ok(switchBtn);
    assert.ok(document.querySelector('#ms-session-bar'));

    // página com markup duplo plain/simple (senão a lib marca Linguagem Simples indisponível)
    const plain = createElement('p');
    plain.setAttribute('data-ms-plain', '');
    const simple = createElement('p');
    simple.setAttribute('data-ms-simple', '');
    document.body.appendChild(plain);
    document.body.appendChild(simple);

    chrome.sync({
      modoSimples: false,
      options: { simpleLanguage: false },
    });
    assert.equal(switchBtn.getAttribute('aria-checked'), 'false');
    assert.equal(toggleWrap.getAttribute('data-active'), 'false');
    assert.equal(barInner.getAttribute('data-state'), 'off');
    assert.equal(off.hidden, false);
    assert.equal(onBlock.hidden, true);
    assert.equal(langLabel.textContent, 'DESLIGADA');

    chrome.sync({
      modoSimples: true,
      options: { simpleLanguage: true },
    });
    assert.equal(switchBtn.getAttribute('aria-checked'), 'true');
    assert.ok(switchBtn.classList.contains('ms-switch--on'));
    assert.equal(toggleWrap.getAttribute('data-active'), 'true');
    assert.equal(barInner.getAttribute('data-state'), 'on');
    assert.equal(off.hidden, true);
    assert.equal(onBlock.hidden, false);
    assert.equal(langLabel.textContent, 'LIGADA');

    const imgLabel = document.querySelector('[data-images-label]');
    assert.ok(imgLabel);
    assert.equal(imgLabel.textContent, 'VISÍVEIS');

    chrome.sync({
      modoSimples: true,
      options: { simpleLanguage: true, hideImages: true },
    });
    assert.equal(imgLabel.textContent, 'OCULTAS');
    const imgBtn = document.querySelector('[data-action="images"]');
    assert.equal(imgBtn.getAttribute('aria-pressed'), 'false');

    const pageCss = getPageStyles();
    assert.ok(
      pageCss.includes('.ms-session-off[hidden]') &&
        pageCss.includes('.ms-session-on[hidden]') &&
        pageCss.includes('display: none !important'),
      'CSS deve forçar [hidden] sobre display da barra',
    );
    // Decisão F0 (2026-11-16, supera doc/07 §8): a barra tem CTA Ativar e botão Voltar
    assert.ok(
      document.querySelector('[data-action="activate"]') &&
        document.querySelector('[data-action="exit"]'),
      'Barra deve ter CTA "Ativar Modo Simples" e botão "Voltar ao site normal"',
    );
    assert.ok(
      pageCss.includes('html.ms-hide-images img:not([data-ms-keep-img])') &&
        !pageCss.includes('.brand-logo'),
      'Ocultar imagens deve esconder todas as imgs (sem exceção .brand-logo)',
    );
    assert.ok(
      pageCss.includes('html.ms-theme-darkHigh .site-header') &&
        pageCss.includes('background-color: #0f172a !important') &&
        pageCss.includes(
          "html.ms-theme-darkHigh .main-nav a[aria-current='page']",
        ),
      'Temas devem dar fundo opaco no header e destaque em aria-current',
    );

    const langBtn = document.querySelector('[data-action="lang"]');
    assert.equal(langBtn.getAttribute('aria-pressed'), 'true');
    assert.ok(langBtn.classList.contains('ms-session-btn--active'));

    const sub = document.querySelector('[data-sub]');
    assert.equal(sub.textContent, 'Interface Simplificada');

    chrome.destroy();
  });

  it('sync atualiza rótulo de TTS quando speaking é informado', () => {
    const chrome = createSessionChrome({
      onToggleModoSimples() {},
      onOpenPanel() {},
      onSpeak() {},
      onToggleSimpleLanguage() {},
    });

    chrome.sync({ modoSimples: true, options: {} }, { speaking: true });
    const speakLabel = document.querySelector('[data-speak-label]');
    const speakBtn = document.querySelector('[data-action="speak"]');
    assert.equal(speakLabel.textContent, 'Parar Voz');
    assert.ok(speakBtn.classList.contains('ms-session-btn--speaking'));

    chrome.sync({ modoSimples: true, options: {} }, { speaking: false });
    assert.equal(speakLabel.textContent, 'Ouvir Página');
    assert.ok(!speakBtn.classList.contains('ms-session-btn--speaking'));

    chrome.destroy();
  });

  it('com MS on reposiciona o switch SIMPLES nas pills (header some)', () => {
    const chrome = createSessionChrome({
      mount: { chrome: '.site-header .header-inner' },
      onToggleModoSimples() {},
      onOpenPanel() {},
      onSpeak() {},
      onToggleSimpleLanguage() {},
    });

    const pills = createElement('nav');
    pills.setAttribute('data-ms-pills', '');
    pills.className = 'ms-pills-nav';
    const inner = createElement('div');
    inner.className = 'ms-pills-nav__inner';
    pills.appendChild(inner);
    document.body.appendChild(pills);

    const chromeEl = document.querySelector('#ms-simples-chrome');
    const switchBtn = document.querySelector('[data-action="toggle-simples"]');
    assert.ok(chromeEl);
    assert.ok(switchBtn);
    assert.ok(document.querySelector('.header-inner #ms-simples-chrome'));

    chrome.sync({ modoSimples: true, options: {} });
    assert.equal(switchBtn.getAttribute('aria-checked'), 'true');
    assert.ok(
      inner.contains(chromeEl),
      'switch deve ir para o nav de pills com MS on',
    );
    assert.ok(chromeEl.classList.contains('ms-simples-chrome--ms-nav'));

    chrome.sync({ modoSimples: false, options: {} });
    assert.ok(
      document.querySelector('.header-inner #ms-simples-chrome'),
      'switch volta ao header com MS off',
    );

    chrome.destroy();
  });
});

describe('CSS da lib: tamanho mínimo de texto (UX-15)', () => {
  it('nenhuma regra usa font-size abaixo de 0.75rem (12px)', () => {
    const css = getUIStyles() + getPageStyles();
    const pequenos = [...css.matchAll(/font-size:\s*(\d*\.?\d+)rem/g)]
      .map((m) => Number(m[1]))
      .filter((v) => v < 0.75);
    assert.deepEqual(pequenos, []);
  });
});

describe('CSS da lib: fonte e espaçamento do texto (IMP-09, IMP-21)', () => {
  it('Lexend não vale para fontes de ícone nem código (IMP-09)', () => {
    const css = getPageStyles();
    const i = css.indexOf('html.ms-dyslexia-font body *');
    assert.ok(i >= 0);
    const seletor = css.slice(i, css.indexOf('{', i));
    for (const ex of [
      '[class*="icon"]',
      '.fa',
      '.material-icons',
      'code',
      'pre',
    ]) {
      assert.ok(seletor.includes(`:not(${ex})`), `falta :not(${ex})`);
    }
  });

  it('espaçamento de texto cobre títulos, tabelas, dl, blockquote e label (IMP-21)', () => {
    const css = getPageStyles();
    const i = css.indexOf('html.ms-text-spacing body');
    const seletor = css.slice(i, css.indexOf('{', i));
    for (const t of [
      'h1',
      'h6',
      'td',
      'th',
      'dd',
      'dt',
      'blockquote',
      'label',
    ]) {
      assert.ok(seletor.includes(`html.ms-text-spacing ${t}`), `falta ${t}`);
    }
  });
});

describe('CSS da lib: sem salto no hover (UX-17)', () => {
  it('botões da barra e pills não se deslocam no :hover', () => {
    const css = getPageStyles();
    const hovers = css.match(/[^{}]*:hover\s*\{[^}]*\}/g) || [];
    const comLift = hovers.filter(
      (r) =>
        /\.ms-session-btn|\.ms-pill/.test(r) &&
        /translateY\(-/.test(r) &&
        !/transform:\s*none/.test(r),
    );
    assert.deepEqual(comLift, []);
  });
});
