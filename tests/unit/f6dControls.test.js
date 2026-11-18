/**
 * F6d — Desligar tudo, mover painel E/D, esconder widget (X no FAB) e atalho Alt+Shift+A.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import ModoSimples from '../../src/modo-simples.js';
import state from '../../src/core/state.js';
import { installHappy, SAMPLE_PAGE } from './helpers/happyEnv.js';

let env;
let inst;

const shadow = () => document.querySelector('#ms-container').shadowRoot;
const wrap = () => shadow().querySelector('.ms-fab-wrap');
const panel = () => shadow().querySelector('#ms-a11y-panel');
const stored = (k) => localStorage.getItem(`ms_${k}:exemplo.test`);

const boot = () => {
  inst = new ModoSimples();
  inst.init();
};
const altShiftA = (target = document) => {
  const ev = new window.KeyboardEvent('keydown', {
    key: 'A',
    code: 'KeyA',
    altKey: true,
    shiftKey: true,
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(ev);
  return ev;
};

beforeEach(() => {
  env = installHappy({ bodyHtml: SAMPLE_PAGE });
});
afterEach(() => {
  inst?.destroy();
  env.restore();
});

describe('Desligar tudo', () => {
  it('desliga o Modo Simples, zera todas as opções e persiste', () => {
    boot();
    inst.enable();
    state.set({
      options: {
        textScale: '150',
        colorTheme: 'darkHigh',
        dyslexiaFont: true,
        readingRuler: true,
        highlightLinks: true,
        textSpacing: true,
        reducedMotion: true,
        hideImages: true,
      },
    });
    panel().querySelector('[data-action="reset-all"]').click();

    const s = state.get();
    assert.equal(s.modoSimples, false);
    assert.deepEqual(s.options, {
      textScale: '100',
      colorTheme: 'senac',
      colorSaturation: 'normal',
      customText: '',
      customHeading: '',
      customBg: '',
      dyslexiaFont: false,
      readingRuler: false,
      highlightLinks: false,
      highlightHeadings: false,
      highlightControls: false,
      enlargeTargets: false,
      textMagnifier: false,
      textSpacing: false,
      lineHeight: 0,
      wordSpacing: 0,
      letterSpacing: 0,
      cursorStyle: 'default',
      reducedMotion: false,
      hideImages: false,
      simpleLanguage: false,
      readFocus: false,
      muteMedia: false,
      blockFlashing: false,
      strongFocus: false,
      showShortcuts: false,
      voiceName: '',
      voiceCommands: false,
      voiceCloudConsent: false,
      voiceRate: 1,
      voicePitch: 1,
      voiceVolume: 1,
    });
    const saved = JSON.parse(stored('state'));
    assert.equal(saved.modoSimples, false);
    assert.equal(saved.options.textScale, '100');
    assert.equal(saved.options.dyslexiaFont, false);
    assert.equal(saved.options.reducedMotion, null); // volta a seguir o SO
  });

  it('esquece a preferência "mostrar imagens no Modo Simples" (L3)', () => {
    boot();
    inst.enable();
    // MS ligado: desligar "ocultar imagens" grava a preferência
    panel().querySelector('.ms-switch[data-option="hideImages"]').click();
    assert.equal(stored('preferShowImagesInMs'), 'true');

    panel().querySelector('[data-action="reset-all"]').click();
    assert.equal(stored('preferShowImagesInMs'), null);

    // religar o MS volta a ocultar imagens (padrão), sem a preferência antiga
    inst.enable();
    assert.equal(state.get().options.hideImages, true);
  });
});

describe('Lado do painel', () => {
  it('padrão = lado do config.position (direita)', () => {
    boot();
    assert.equal(wrap().getAttribute('data-ms-side'), 'right');
    assert.equal(panel().getAttribute('data-ms-side'), 'right');
  });

  it('mover grava, e o FAB acompanha o painel', () => {
    boot();
    panel().querySelector('[data-action="move-side"]').click();
    assert.equal(panel().getAttribute('data-ms-side'), 'left');
    assert.equal(wrap().getAttribute('data-ms-side'), 'left');
    assert.equal(JSON.parse(stored('panelSide')), 'left');
  });

  it('restaura o lado salvo no próximo boot', () => {
    localStorage.setItem('ms_panelSide:exemplo.test', JSON.stringify('left'));
    boot();
    assert.equal(wrap().getAttribute('data-ms-side'), 'left');
    assert.equal(panel().getAttribute('data-ms-side'), 'left');
  });

  it('valor salvo inválido cai no padrão', () => {
    localStorage.setItem('ms_panelSide:exemplo.test', JSON.stringify('cima'));
    boot();
    assert.equal(wrap().getAttribute('data-ms-side'), 'right');
  });
});

describe('Esconder widget', () => {
  it('X é irmão do botão do FAB, com nome acessível próprio', () => {
    boot();
    const hideBtn = wrap().querySelector('.ms-fab-hide');
    assert.ok(hideBtn);
    assert.ok(hideBtn.getAttribute('aria-label'));
    assert.equal(hideBtn.closest('#ms-fab'), null);
    assert.equal(
      hideBtn.parentElement,
      wrap().querySelector('#ms-fab').parentElement,
    );
  });

  it('esconde o FAB sem persistir nada e fecha o painel', () => {
    boot();
    const before = { ...localStorage };
    state.set({ panelOpen: true });
    wrap().querySelector('.ms-fab-hide').click();
    assert.equal(wrap().hidden, true);
    assert.equal(state.get().panelOpen, false);
    assert.equal(stored('widgetHidden'), null);
    assert.equal(
      Object.keys(localStorage).some((k) => /hidden/i.test(k)),
      false,
    );
    assert.equal(
      Object.keys(before).length <= Object.keys(localStorage).length,
      true,
    );
  });

  it('nova instância (reload) mostra o FAB de novo', () => {
    boot();
    wrap().querySelector('.ms-fab-hide').click();
    inst.destroy();
    boot();
    assert.equal(wrap().hidden, false);
  });
});

describe('Atalho Alt+Shift+A', () => {
  it('reexibe o FAB escondido e abre o painel', () => {
    boot();
    wrap().querySelector('.ms-fab-hide').click();
    const ev = altShiftA();
    assert.equal(ev.defaultPrevented, true);
    assert.equal(wrap().hidden, false);
    assert.equal(state.get().panelOpen, true);
    assert.equal(panel().hidden, false);
  });

  it('ignorado dentro de input e contenteditable', () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<input id="campo"><div id="ed" contenteditable="true"></div>',
    );
    boot();
    wrap().querySelector('.ms-fab-hide').click();
    for (const id of ['campo', 'ed']) {
      const ev = altShiftA(document.getElementById(id));
      assert.equal(ev.defaultPrevented, false);
      assert.equal(wrap().hidden, true);
      assert.equal(state.get().panelOpen, false);
    }
  });
});
