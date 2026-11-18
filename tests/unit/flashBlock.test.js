/**
 * F7d — flashBlock: GIF vira 1º quadro (botão), clique revela, marquee para/volta, autoplay
 * pausado via mediaMute, UI da lib ignorada, opção padrão/persistida/anunciada/zerada.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  isGif,
  startFlashBlock,
  stopFlashBlock,
} from '../../src/features/flashBlock.js';
import ModoSimples from '../../src/modo-simples.js';
import state from '../../src/core/state.js';
import { hydratePersistedState } from '../../src/core/persistedState.js';
import { diffStateAnnouncements } from '../../src/core/announcements.js';
import { PAGE_CSS, UI_CSS } from '../../src/ui/styles.generated.js';
import { installHappy } from './helpers/happyEnv.js';

let env;
const $ = (s) => document.querySelector(s);
const html = (h) => (document.body.innerHTML = h);
const GIF =
  'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=';

/** happy-dom não carrega imagem: finge que o GIF já carregou */
function loaded(img) {
  for (const [k, v] of [
    ['complete', true],
    ['naturalWidth', 40],
    ['naturalHeight', 30],
  ])
    Object.defineProperty(img, k, { value: v, configurable: true });
  return img;
}

beforeEach(() => {
  env = installHappy({ bodyHtml: '' });
});
afterEach(() => {
  stopFlashBlock();
  env.restore();
});

describe('isGif', () => {
  it('reconhece .gif (com query) e data:image/gif; ignora o resto', () => {
    const img = (src) => {
      const i = document.createElement('img');
      i.setAttribute('src', src);
      return i;
    };
    assert.equal(isGif(img('/a/b.GIF?x=1')), true);
    assert.equal(isGif(img(GIF)), true);
    assert.equal(isGif(img('/a/b.png')), false);
    assert.equal(isGif(img('/a/gif.png')), false);
  });
});

describe('GIF congelado', () => {
  it('troca o <img> por botão com rótulo/alt e volta ao clicar; não congela de novo', () => {
    html(`<p><img id="g" alt="Gato" src="${GIF}"></p>`);
    const img = loaded($('#g'));
    startFlashBlock();
    const btn = $('[data-ms-gif-still]');
    assert.ok(btn);
    assert.equal($('#g'), null);
    assert.equal(btn.getAttribute('aria-label'), 'Mostrar animação: Gato');
    assert.equal(btn.tagName, 'BUTTON');
    btn.click();
    assert.equal($('[data-ms-gif-still]'), null);
    assert.equal($('#g'), img);
    assert.equal(img.getAttribute('src'), GIF);
  });

  it('desligar devolve o <img> original; PNG e UI da lib ficam como estão', () => {
    html(
      `<img id="g" src="${GIF}"><img id="p" src="/a.png"><div id="ms-container"><img id="own" src="${GIF}"></div>`,
    );
    for (const id of ['g', 'p', 'own']) loaded($(`#${id}`));
    startFlashBlock();
    assert.equal($('#g'), null);
    assert.ok($('#p'));
    assert.ok($('#own'));
    stopFlashBlock();
    assert.ok($('#g'));
    assert.equal($('[data-ms-gif-still]'), null);
  });
});

describe('marquee e autoplay', () => {
  it('marquee: stop() ao ligar, start() ao desligar', () => {
    html('<marquee id="m">oi</marquee>');
    const calls = [];
    const m = $('#m');
    m.stop = () => calls.push('stop');
    m.start = () => calls.push('start');
    startFlashBlock();
    stopFlashBlock();
    assert.deepEqual(calls, ['stop', 'start']);
  });

  it('autoplay: pausa e tira o atributo; desligar não chama play()', () => {
    html('<video id="v" autoplay></video>');
    const v = $('#v');
    let plays = 0;
    v.play = () => (plays += 1);
    v.pause = () => {};
    startFlashBlock();
    assert.equal(v.hasAttribute('autoplay'), false);
    stopFlashBlock();
    assert.equal(plays, 0);
  });
});

describe('opção blockFlashing', () => {
  it('padrão false, persistida como booleano e anunciada', () => {
    assert.equal(state.get().options.blockFlashing, false);
    assert.equal(
      hydratePersistedState({ options: { blockFlashing: 1 } }).options
        .blockFlashing,
      true,
    );
    assert.deepEqual(
      diffStateAnnouncements(
        { options: { blockFlashing: false } },
        { options: { blockFlashing: true } },
      ),
      ['Bloqueio de animações e GIFs ligado'],
    );
  });

  it('CSS corta animation/transition na página e na UI da lib', () => {
    assert.match(
      PAGE_CSS,
      /html\.ms-block-flashing \*[\s\S]*?animation: none !important/,
    );
    assert.match(
      PAGE_CSS,
      /html\.ms-block-flashing[\s\S]*?transition: none !important/,
    );
    assert.match(UI_CSS, /:host\(\[data-ms-noflash\]\) \*/);
  });

  it('ligar marca <html> e o host; "Desligar tudo" zera e restaura o GIF', () => {
    html(`<img id="g" src="${GIF}">`);
    loaded($('#g'));
    const inst = new ModoSimples({ persistence: false });
    inst.init();
    state.set({ options: { ...state.get().options, blockFlashing: true } });
    assert.ok(document.documentElement.classList.contains('ms-block-flashing'));
    assert.ok($('#ms-container').hasAttribute('data-ms-noflash'));
    assert.ok($('[data-ms-gif-still]'));
    inst._resetAll();
    assert.equal(state.get().options.blockFlashing, false);
    assert.equal(
      document.documentElement.classList.contains('ms-block-flashing'),
      false,
    );
    assert.equal($('[data-ms-gif-still]'), null);
    assert.ok($('#g'));
    inst.destroy();
  });
});
