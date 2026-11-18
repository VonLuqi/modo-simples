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

describe('GIF congelado — achados do QA T148', () => {
  it('M2: substituto herda a classe do <img> (layout) e mantém proporção ao redimensionar', () => {
    html(`<img id="g" class="thumb" alt="Gato" src="${GIF}">`);
    loaded($('#g'));
    startFlashBlock();
    const b = $('[data-ms-gif-still]');
    assert.equal(b.className, 'thumb');
    assert.equal(b.style.height, 'auto');
    assert.match(b.style.aspectRatio, /\//);
    assert.equal(b.style.maxWidth, '100%');
  });

  it('M3: ao revelar, o <img> recebe foco (tabindex=-1 temporário, removido no blur)', () => {
    html(`<img id="g" alt="Gato" src="${GIF}">`);
    const img = loaded($('#g'));
    startFlashBlock();
    $('[data-ms-gif-still]').click();
    assert.equal(img.getAttribute('tabindex'), '-1');
    assert.equal(document.activeElement, img);
    img.dispatchEvent(new env.win.Event('blur'));
    assert.equal(img.hasAttribute('tabindex'), false);
  });

  it('M3: <img> que já tem tabindex não é alterado', () => {
    html(`<img id="g" tabindex="0" src="${GIF}">`);
    const img = loaded($('#g'));
    startFlashBlock();
    $('[data-ms-gif-still]').click();
    assert.equal(img.getAttribute('tabindex'), '0');
  });

  it('L1: desligar e ligar de novo congela outra vez um GIF já revelado', () => {
    html(`<img id="g" src="${GIF}">`);
    loaded($('#g'));
    startFlashBlock();
    $('[data-ms-gif-still]').click();
    assert.equal($('[data-ms-gif-still]'), null);
    stopFlashBlock();
    startFlashBlock();
    assert.ok($('[data-ms-gif-still]'));
  });

  it('L2: GIF dentro de link vira imagem parada sem botão; o link segue intacto', () => {
    html(`<a id="l" href="#x"><img id="g" alt="Capa" src="${GIF}"></a>`);
    loaded($('#g'));
    startFlashBlock();
    const still = $('#l [data-ms-gif-still]');
    assert.ok(still);
    assert.equal(still.tagName, 'SPAN');
    assert.equal($('#l button'), null);
    assert.equal(still.getAttribute('role'), 'img');
    assert.equal(still.getAttribute('aria-label'), 'Capa');
    stopFlashBlock();
    assert.ok($('#l #g'));
  });

  it('L2: sem alt, a imagem parada dentro de link some para leitor de tela', () => {
    html(`<a href="#x"><img id="g" src="${GIF}"></a>`);
    loaded($('#g'));
    startFlashBlock();
    assert.equal($('[data-ms-gif-still]').getAttribute('aria-hidden'), 'true');
  });

  it('isGif: endereço inválido não quebra (falso)', () => {
    const i = document.createElement('img');
    i.setAttribute('src', 'http://');
    assert.equal(isGif(i), false);
  });
});

describe('ramos de borda', () => {
  it('GIF ainda carregando congela quando o load chega; sem alt o rótulo é só a ação', () => {
    html(`<img id="g" src="${GIF}">`);
    const img = $('#g');
    Object.defineProperty(img, 'complete', {
      value: false,
      configurable: true,
    });
    startFlashBlock();
    assert.equal($('[data-ms-gif-still]'), null);
    loaded(img);
    img.dispatchEvent(new env.win.Event('load'));
    assert.equal(
      $('[data-ms-gif-still]').getAttribute('aria-label'),
      'Mostrar animação',
    );
  });

  it('play em elemento que não é mídia ou é da lib é ignorado', () => {
    html(
      '<div id="d"></div><div id="ms-container"><video id="o"></video></div>',
    );
    let pauses = 0;
    $('#o').pause = () => (pauses += 1);
    startFlashBlock();
    $('#d').dispatchEvent(new env.win.Event('play'));
    $('#o').dispatchEvent(new env.win.Event('play'));
    assert.equal(pauses, 0);
  });

  it('ligar duas vezes e desligar sem ter ligado não quebra', () => {
    startFlashBlock();
    startFlashBlock();
    stopFlashBlock();
    stopFlashBlock();
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

  it('M5: não muta, não toca mídia do usuário; play() sem gesto pausa, com gesto não', () => {
    html('<video id="v" autoplay></video><video id="u"></video>');
    let pauses = 0;
    for (const id of ['v', 'u']) {
      const x = $(`#${id}`);
      for (const [k, val] of [
        ['paused', false],
        ['muted', false],
      ])
        Object.defineProperty(x, k, {
          value: val,
          writable: true,
          configurable: true,
        });
      x.pause = () => {
        pauses += 1;
        x.paused = true;
      };
    }
    startFlashBlock();
    assert.equal($('#v').muted, false);
    assert.equal($('#u').muted, false);
    assert.equal($('#u').paused, false, 'sem autoplay: intocada');
    assert.equal(pauses, 1);
    $('#u').dispatchEvent(new env.win.Event('play')); // sem gesto
    assert.equal($('#u').muted, false);
    assert.equal(pauses, 2);
    navigator.userActivation = { isActive: true };
    try {
      $('#u').paused = false;
      $('#u').dispatchEvent(new env.win.Event('play')); // com gesto: não briga
      assert.equal(pauses, 2);
    } finally {
      delete navigator.userActivation;
    }
    stopFlashBlock();
    assert.equal($('#v').hasAttribute('autoplay'), true, 'atributo volta');
  });

  it('marquee sem stop() (navegador sem suporte) é ignorado', () => {
    html('<marquee id="m">x</marquee>');
    $('#m').stop = undefined;
    startFlashBlock();
    stopFlashBlock();
    assert.ok($('#m'));
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

describe('destroy() (M1)', () => {
  it('destroy desfaz tudo: GIF volta, marquee recomeça, observer parado, cartão removido', () => {
    html(`<img id="g" src="${GIF}"><marquee id="m">x</marquee>`);
    loaded($('#g'));
    const calls = [];
    $('#m').stop = () => calls.push('stop');
    $('#m').start = () => calls.push('start');
    const inst = new ModoSimples({ persistence: false });
    inst.init();
    state.set({
      options: {
        ...state.get().options,
        blockFlashing: true,
        showShortcuts: true,
      },
    });
    assert.ok($('[data-ms-gif-still]'));
    assert.ok($('#ms-shortcuts-card'));
    inst.destroy();
    assert.equal($('[data-ms-gif-still]'), null);
    assert.ok($('#g'));
    assert.equal($('#ms-shortcuts-card'), null);
    assert.deepEqual(calls, ['stop', 'start']);
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
      /html\.ms-block-flashing \*[\s\S]*?animation-duration: 0.01ms !important/,
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
