/**
 * IMP-46 — ciclo de vida da classe ModoSimples (init/destroy/enable/configure).
 * Usa happy-dom (DOM real). Imports de src/ vêm antes de installHappy (sem auto-boot).
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import ModoSimples from '../../src/modo-simples.js';
import state from '../../src/core/state.js';
import { installHappy, SAMPLE_PAGE } from './helpers/happyEnv.js';

let env;
let inst;
let observers;
let intervals;
let realMO;
let realSetInterval;
let realClearInterval;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

beforeEach(() => {
  env = installHappy({ bodyHtml: SAMPLE_PAGE });

  // espiões: MutationObserver criados/desconectados e setInterval vivos
  observers = [];
  realMO = globalThis.MutationObserver;
  globalThis.MutationObserver = class extends realMO {
    constructor(cb) {
      super(cb);
      this.disconnected = false;
      observers.push(this);
    }
    disconnect() {
      this.disconnected = true;
      super.disconnect();
    }
  };
  intervals = new Set();
  realSetInterval = globalThis.setInterval;
  realClearInterval = globalThis.clearInterval;
  globalThis.setInterval = (...args) => {
    const id = realSetInterval(...args);
    intervals.add(id);
    return id;
  };
  globalThis.clearInterval = (id) => {
    intervals.delete(id);
    realClearInterval(id);
  };

  inst = new ModoSimples();
});

afterEach(() => {
  inst?.destroy();
  for (const id of intervals) realClearInterval(id);
  globalThis.setInterval = realSetInterval;
  globalThis.clearInterval = realClearInterval;
  globalThis.MutationObserver = realMO;
  env.restore();
});

describe('init / destroy', () => {
  it('init() é idempotente: um host, um <style>, um observer', () => {
    inst.init();
    inst.init();
    assert.equal($$('#ms-container').length, 1);
    assert.equal($$('#ms-page-styles').length, 1);
    assert.equal(observers.length, 1);
  });

  it('por padrão não injeta barra de sessão nem pede a fonte Lexend', () => {
    inst.init();
    assert.equal($('#ms-session-bar'), null);
    assert.equal($('#ms-simples-chrome'), null);
    assert.equal($('#ms-lexend-font'), null);
  });

  it('o host tem Shadow DOM aberto com FAB e painel', () => {
    inst.init();
    const root = $('#ms-container').shadowRoot;
    assert.ok(root);
    assert.ok(root.querySelector('#ms-a11y-panel'));
  });

  it('destroy() remove host, estilos, link da fonte, barra, classes e desconecta o observer', () => {
    inst.configure({ sessionBar: true });
    inst.init();
    state.set({ options: { dyslexiaFont: true, textScale: '150' } });
    inst.enable();
    assert.ok($('#ms-lexend-font'));
    assert.ok($('#ms-session-bar'));

    inst.destroy();

    assert.equal($('#ms-container'), null);
    assert.equal($('#ms-page-styles'), null);
    assert.equal($('#ms-lexend-font'), null);
    assert.equal($('#ms-session-bar'), null);
    assert.equal($('#ms-simples-chrome'), null);
    const msClasses = [...document.documentElement.classList].filter((c) =>
      c.startsWith('ms-'),
    );
    assert.deepEqual(msClasses, []);
    assert.equal($$('[data-ms-hidden], [data-ms-principal]').length, 0);
    assert.ok(observers.every((o) => o.disconnected));
    assert.equal(state.get().modoSimples, false);
  });

  it('é possível init() de novo depois de destroy()', () => {
    inst.init();
    inst.destroy();
    inst.init();
    assert.equal($$('#ms-container').length, 1);
  });

  it('destroy() sem init() não lança', () => {
    assert.doesNotThrow(() => inst.destroy());
  });

  // IMP-25: o polling do fim da fala é limpo no destroy() e nunca acumula.
  it('destroy() não deixa setInterval vivo (IMP-25)', () => {
    inst.init();
    inst._toggleSpeak(); // sem speechSynthesis no ambiente: cria o polling
    inst.destroy();
    assert.equal(intervals.size, 0);
  });

  it('ouvir de novo não acumula intervalos (IMP-25)', () => {
    inst.init();
    inst._toggleSpeak();
    inst._toggleSpeak();
    assert.ok(intervals.size <= 1);
  });
});

describe('enable / disable / toggle', () => {
  it('enable() marca principal, oculta distrações e liga ms-ativo', () => {
    inst.init();
    inst.enable();
    assert.equal(state.get().modoSimples, true);
    assert.ok(document.documentElement.classList.contains('ms-ativo'));
    assert.ok($('main').hasAttribute('data-ms-principal'));
    assert.equal($('header').getAttribute('data-ms-hidden'), 'true');
    assert.equal($('aside').getAttribute('data-ms-hidden'), 'true');
  });

  it('disable() desfaz marcadores e ms-ativo', () => {
    inst.init();
    inst.enable();
    inst.disable();
    assert.equal(state.get().modoSimples, false);
    assert.ok(!document.documentElement.classList.contains('ms-ativo'));
    assert.equal($$('[data-ms-hidden], [data-ms-principal]').length, 0);
  });

  it('toggle() alterna', () => {
    inst.init();
    inst.toggle();
    assert.equal(state.get().modoSimples, true);
    inst.toggle();
    assert.equal(state.get().modoSimples, false);
  });

  it('enable() só liga simpleLanguage se a página tem pares plain/simple (D4)', () => {
    inst.init();
    inst.enable();
    assert.equal(state.get().options.simpleLanguage, false);
    inst.disable();

    document.body.insertAdjacentHTML(
      'beforeend',
      '<p data-ms-plain>a</p><p data-ms-simple>b</p>',
    );
    inst.enable();
    assert.equal(state.get().options.simpleLanguage, true);
  });

  it('persiste o estado por hostname e restaura no próximo init', () => {
    inst.init();
    inst.enable();
    assert.ok(localStorage.getItem('ms_state:exemplo.test'));
    inst.destroy();

    const outra = new ModoSimples();
    outra.init();
    assert.equal(state.get().modoSimples, true);
    assert.ok(document.documentElement.classList.contains('ms-ativo'));
    outra.destroy();
  });
});

describe('configure em runtime', () => {
  it('sessionBar liga/desliga a barra', () => {
    inst.init();
    assert.equal($('#ms-session-bar'), null);
    inst.configure({ sessionBar: true });
    assert.ok($('#ms-session-bar'));
    inst.configure({ sessionBar: false });
    assert.equal($('#ms-session-bar'), null);
  });

  it('simpleNav injeta pills quando a página não tem [data-ms-pills]', () => {
    inst.init();
    inst.configure({ simpleNav: [{ label: 'Início', href: '/' }] });
    assert.equal($$('nav[data-ms-pills] a.ms-pill').length, 1);
    inst.configure({ simpleNav: null });
    assert.equal($('nav[data-ms-pills]'), null);
  });

  it('fontUrl: string usa o CSS self-hosted; false nunca carrega', () => {
    inst.init();
    inst.configure({ fontUrl: '/lexend.css' });
    state.set({ options: { dyslexiaFont: true } });
    assert.equal($('#ms-lexend-font').getAttribute('href'), '/lexend.css');

    state.set({ options: { dyslexiaFont: false } });
    $('#ms-lexend-font').remove();
    inst.configure({ fontUrl: false });
    state.set({ options: { dyslexiaFont: true } });
    assert.equal($('#ms-lexend-font'), null);
  });

  it('configure() de seletores vale para o reprocess do observer (IMP-16)', async () => {
    inst.init();
    inst.enable();
    inst.configure({
      distractionSelectors: ['.novo-ruido'],
      reprocessDebounce: 20,
    });
    const el = document.createElement('div');
    el.className = 'novo-ruido';
    el.textContent = 'ruído';
    document.body.appendChild(el);
    await env.wait(120);
    assert.equal(el.getAttribute('data-ms-hidden'), 'true');
  });

  it('configure() mescla sem perder as demais chaves', () => {
    inst.configure({ confidenceThreshold: 0.9 });
    assert.equal(inst._config.confidenceThreshold, 0.9);
    assert.ok(inst._config.mainSelectors.length > 0);
  });

  // IMP-31: position vale em runtime (refaz o CSS do Shadow DOM)
  it('configure({ position }) reposiciona o FAB em runtime (IMP-31)', () => {
    inst.init();
    const css = () =>
      $('#ms-container').shadowRoot.querySelector('style').textContent;
    assert.ok(
      css().includes(
        'bottom: calc(1.5 * var(--ms-u));right: calc(1.5 * var(--ms-u));',
      ),
    );
    inst.configure({ position: 'top-left' });
    assert.ok(
      css().includes(
        'top: calc(1.5 * var(--ms-u));left: calc(1.5 * var(--ms-u));',
      ),
    );
    assert.ok(
      !css().includes(
        'bottom: calc(1.5 * var(--ms-u));right: calc(1.5 * var(--ms-u));',
      ),
    );
    inst.configure({ position: 'bottom-left' });
    assert.ok(
      css().includes(
        'bottom: calc(1.5 * var(--ms-u));left: calc(1.5 * var(--ms-u));',
      ),
    );
  });

  it('configure({ position }) antes do init continua valendo', () => {
    inst.configure({ position: 'top-right' });
    inst.init();
    const css =
      $('#ms-container').shadowRoot.querySelector('style').textContent;
    assert.ok(
      css.includes(
        'top: calc(1.5 * var(--ms-u));right: calc(1.5 * var(--ms-u));',
      ),
    );
  });
});
