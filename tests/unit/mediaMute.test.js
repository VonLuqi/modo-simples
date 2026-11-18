/**
 * F7c — mediaMute: pausa + muta mídia existente e tardia, restaura só o `muted`, nunca play(),
 * aviso em iframe de outro site, UI da lib ignorada, opção persistida e zerada.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  pauseAutoplay,
  restoreMedia,
  startMediaMute,
  stopMediaMute,
} from '../../src/features/mediaMute.js';
import ModoSimples from '../../src/modo-simples.js';
import state from '../../src/core/state.js';
import { hydratePersistedState } from '../../src/core/persistedState.js';
import { diffStateAnnouncements } from '../../src/core/announcements.js';
import { installHappy } from './helpers/happyEnv.js';

let env;
let plays;

const $ = (s) => document.querySelector(s);
const html = (h) => (document.body.innerHTML = h);

/** happy-dom não toca mídia: simula paused/pause()/play() */
/** happy-dom não faz layout: dá tamanho ao elemento (iframe sem tamanho não ganha aviso) */
function sized(el, w = 300, h = 150) {
  el.getBoundingClientRect = () => ({ top: 0, left: 0, width: w, height: h });
  return el;
}

function fake(el, { paused = false, muted = false } = {}) {
  for (const [k, v] of [
    ['paused', paused],
    ['muted', muted],
  ]) {
    Object.defineProperty(el, k, {
      value: v,
      writable: true,
      configurable: true,
    });
  }
  el.pause = () => {
    el.paused = true;
  };
  el.play = () => {
    plays += 1;
    el.paused = false;
  };
  return el;
}

beforeEach(() => {
  env = installHappy({ bodyHtml: '' });
  plays = 0;
});

afterEach(() => {
  stopMediaMute();
  env.restore();
});

describe('pauseAutoplay / restoreMedia', () => {
  it('pausa, muta e tira o autoplay; restore devolve o muted anterior sem play()', () => {
    html(`<video id="v" autoplay></video><audio id="a" autoplay></audio>`);
    fake($('#v'), { muted: false });
    fake($('#a'), { muted: true }); // já estava mudo
    assert.equal(pauseAutoplay(), 2);
    for (const id of ['#v', '#a']) {
      assert.equal($(id).muted, true);
      assert.equal($(id).paused, true);
      assert.equal($(id).hasAttribute('autoplay'), false);
    }
    restoreMedia();
    assert.equal($('#v').muted, false, 'volta ao estado de antes');
    assert.equal($('#a').muted, true, 'quem já era mudo continua');
    assert.equal(plays, 0, 'nunca chama play()');
    assert.equal($('#v').paused, true, 'não volta a tocar sozinho');
  });

  it('alcança mídia dentro de shadow root aberto e ignora a UI da lib', () => {
    html(
      `<div id="host"></div><div id="ms-container"><video id="proprio"></video></div>`,
    );
    const sr = $('#host').attachShadow({ mode: 'open' });
    sr.innerHTML = '<video id="dentro"></video>';
    fake(sr.querySelector('#dentro'));
    fake($('#proprio'));
    assert.equal(pauseAutoplay(), 1);
    assert.equal(sr.querySelector('#dentro').muted, true);
    assert.equal($('#proprio').muted, false);
  });
});

describe('startMediaMute — mídia tardia, iframes e desligar', () => {
  it('mídia que aparece depois é mutada e pausada; desligar restaura sem play()', async () => {
    html('<main></main>');
    startMediaMute();
    const v = fake(document.createElement('video'), { muted: false });
    v.setAttribute('autoplay', '');
    $('main').appendChild(v);
    await env.wait(30);
    assert.equal(v.muted, true);
    assert.equal(v.paused, true);
    assert.equal(v.hasAttribute('autoplay'), false);
    stopMediaMute();
    assert.equal(v.muted, false);
    assert.equal(plays, 0);
  });

  it('autoplay por script (evento play sem gesto) é pausado e mudo', () => {
    html('<video id="v"></video>');
    const v = fake($('#v'), { paused: true });
    startMediaMute();
    v.paused = false; // o site chamou play()
    v.dispatchEvent(new env.win.Event('play'));
    assert.equal(v.muted, true);
    assert.equal(v.paused, true);
  });

  it('iframe de outro site de vídeo ganha aviso sem bloquear cliques; some ao desligar', () => {
    html(
      `<iframe id="yt" src="https://www.youtube.com/embed/x"></iframe>` +
        `<iframe id="meu" src="/mesmo-site"></iframe>` +
        `<iframe id="outro" src="https://exemplo.org/doc"></iframe>`,
    );
    document.querySelectorAll('iframe').forEach((f) => sized(f));
    startMediaMute();
    const badges = document.querySelectorAll('[data-ms-media-badge]');
    assert.equal(badges.length, 1, 'só o iframe de vídeo de outro site');
    assert.equal(
      badges[0].textContent,
      'Este vídeo é de outro site. Não consigo tirar o som dele.',
    );
    assert.equal(badges[0].style.pointerEvents, 'none');
    stopMediaMute();
    assert.equal(document.querySelectorAll('[data-ms-media-badge]').length, 0);
  });

  it('iframe com allow=autoplay de outro site também ganha aviso', () => {
    html(
      `<iframe src="https://player.exemplo.org/x" allow="autoplay; fullscreen"></iframe>`,
    );
    sized($('iframe'));
    startMediaMute();
    assert.equal(document.querySelectorAll('[data-ms-media-badge]').length, 1);
  });

  it('iframe sem tamanho (display:none / 0x0) não ganha aviso; facebook.com sozinho também não (L1)', () => {
    html(
      `<iframe id="z" src="https://www.youtube.com/embed/x"></iframe>` +
        `<iframe id="fb" src="https://www.facebook.com/plugins/like.php"></iframe>`,
    );
    sized($('#z'), 0, 0);
    sized($('#fb'), 90, 20);
    startMediaMute();
    assert.equal(document.querySelectorAll('[data-ms-media-badge]').length, 0);
  });

  it('vídeo adicionado DEPOIS dentro de um shadow root já existente é mutado (M2)', async () => {
    html('<div id="host"></div>');
    const sr = $('#host').attachShadow({ mode: 'open' });
    startMediaMute();
    const v = fake(document.createElement('video'), { muted: false });
    sr.appendChild(v);
    await env.wait(30);
    assert.equal(v.muted, true);
    assert.equal(v.paused, true);
  });

  it('play() de script dentro do shadow root (evento não composed) é pausado (M2)', () => {
    html('<div id="host"></div>');
    const sr = $('#host').attachShadow({ mode: 'open' });
    sr.innerHTML = '<video id="v"></video>';
    const v = fake(sr.querySelector('#v'), { paused: true });
    startMediaMute();
    v.paused = false;
    v.dispatchEvent(new env.win.Event('play'));
    assert.equal(v.muted, true);
    assert.equal(v.paused, true);
  });

  it('se o usuário ligou o som por gesto, desligar não o silencia de volta (L3)', () => {
    html('<video id="v"></video>');
    const v = fake($('#v'), { muted: true }); // estava mudo antes
    Object.defineProperty(navigator, 'userActivation', {
      configurable: true,
      value: { isActive: true },
    });
    try {
      startMediaMute();
      v.muted = false; // usuário liga o som
      v.dispatchEvent(new env.win.Event('volumechange'));
      stopMediaMute();
      assert.equal(v.muted, false, 'não refaz o muted antigo');
    } finally {
      delete navigator.userActivation;
    }
  });
});

describe('opção muteMedia', () => {
  it('padrão false, persistida como booleano e anunciada', () => {
    assert.equal(state.get().options.muteMedia, false);
    assert.equal(
      hydratePersistedState({ options: { muteMedia: 1 } }).options.muteMedia,
      true,
    );
    assert.deepEqual(
      diffStateAnnouncements(
        { options: { muteMedia: false } },
        { options: { muteMedia: true } },
      ),
      ['Vídeos e sons silenciados'],
    );
  });

  it('ligar muta a página; "Desligar tudo" restaura e zera a opção', () => {
    html('<video id="v"></video>');
    const v = fake($('#v'), { muted: false });
    const inst = new ModoSimples({ persistence: false });
    inst.init();
    state.set({ options: { ...state.get().options, muteMedia: true } });
    assert.equal(v.muted, true);
    inst._resetAll();
    assert.equal(state.get().options.muteMedia, false);
    assert.equal(v.muted, false);
    assert.equal(plays, 0);
    inst.destroy();
  });
});
