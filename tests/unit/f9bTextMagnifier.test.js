/**
 * F9b — Lupa de texto: padrão/persistência/anúncio, texto do bloco sob o ponteiro ou foco,
 * senha excluída, painel escondido, Esc, toque, e limpeza de listeners (toggle off e destroy).
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  MAGNIFIER_ID,
  magnifierTextFor,
  startTextMagnifier,
  stopTextMagnifier,
} from '../../src/features/textMagnifier.js';
import ModoSimples from '../../src/modo-simples.js';
import state from '../../src/core/state.js';
import { hydratePersistedState } from '../../src/core/persistedState.js';
import { diffStateAnnouncements } from '../../src/core/announcements.js';
import { PROFILES } from '../../src/core/profiles.js';
import { installHappy } from './helpers/happyEnv.js';

let env;
let frames;
let added;
let removed;
const prevRaf = globalThis.requestAnimationFrame;
const prevCaf = globalThis.cancelAnimationFrame;
const $ = (s) => document.querySelector(s);
const flush = () => {
  const f = frames.splice(0);
  f.forEach((fn) => fn && fn());
};
const fire = (el, type, props = {}) => {
  const e = new window.Event(type, { bubbles: true });
  for (const [k, v] of Object.entries(props)) {
    Object.defineProperty(e, k, { value: v });
  }
  el.dispatchEvent(e);
};

beforeEach(() => {
  env = installHappy({
    bodyHtml: `<main>
      <h1 id="h">Título grande</h1>
      <p id="p">Texto <b id="b">em negrito</b> do parágrafo.</p>
      <img id="img" alt="Foto da turma" />
      <label for="nome">Nome</label><input id="nome" value="Ana" />
      <label for="pw">Senha</label><input id="pw" type="password" value="segredo123" />
      <a id="a" href="#x">Link aqui</a>
    </main>`,
  });
  frames = [];
  globalThis.requestAnimationFrame = (fn) => frames.push(fn);
  globalThis.cancelAnimationFrame = (id) => {
    frames[id - 1] = null;
  };
  added = [];
  removed = [];
  for (const t of [document, window]) {
    const a = t.addEventListener.bind(t);
    const r = t.removeEventListener.bind(t);
    t.addEventListener = (type, fn, o) => {
      added.push([t, type, fn]);
      return a(type, fn, o);
    };
    t.removeEventListener = (type, fn, o) => {
      removed.push([t, type, fn]);
      return r(type, fn, o);
    };
  }
});
afterEach(() => {
  stopTextMagnifier();
  globalThis.requestAnimationFrame = prevRaf;
  globalThis.cancelAnimationFrame = prevCaf;
  env.restore();
});

describe('opção textMagnifier', () => {
  it('padrão false, persistida, anunciada; perfis não a ligam', () => {
    assert.equal(state.get().options.textMagnifier, false);
    assert.equal(
      hydratePersistedState({ options: { textMagnifier: 1 } }).options
        .textMagnifier,
      true,
    );
    const d = (a, b) =>
      diffStateAnnouncements(
        { options: { textMagnifier: a } },
        { options: { textMagnifier: b } },
      );
    assert.deepEqual(d(false, true), ['Lupa de texto ligada']);
    assert.deepEqual(d(true, false), ['Lupa de texto desligada']);
    for (const p of PROFILES) {
      assert.ok(!('textMagnifier' in (p.options ?? {})), p.id);
    }
  });
});

describe('magnifierTextFor', () => {
  it('usa o bloco de texto mais próximo (de um filho inline sobe ao <p>)', () => {
    assert.equal($('#h') && magnifierTextFor($('#h')), 'Título grande');
    assert.equal(magnifierTextFor($('#b')), 'Texto em negrito do parágrafo.');
  });
  it('img: alt; campo: rótulo + valor; senha: nada', () => {
    assert.equal(magnifierTextFor($('#img')), 'Foto da turma');
    assert.equal(magnifierTextFor($('#nome')), 'Nome Ana');
    assert.equal(magnifierTextFor($('#pw')), '');
  });
  it('UI da lib e do próprio box nunca geram texto', () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div id="ms-container"><p id="x">painel</p></div>',
    );
    assert.equal(magnifierTextFor($('#x')), '');
  });
  it('limita o tamanho', () => {
    $('#p').textContent = 'a'.repeat(1000);
    assert.equal(magnifierTextFor($('#p')).length, 280);
  });
  it('sem bloco conhecido: só o texto direto, não o contêiner inteiro', () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div id="w">Só isto <section><p>outro</p></section></div>',
    );
    assert.equal(magnifierTextFor($('#w')), 'Só isto');
  });
});

describe('caixa da lupa', () => {
  it('ponteiro: mostra o texto do bloco, aria-hidden, fonte ≥ 32px, sem capturar eventos', () => {
    startTextMagnifier();
    assert.equal($(`#${MAGNIFIER_ID}`), null); // nada até haver alvo
    fire($('#b'), 'pointermove', { clientX: 5, clientY: 5 });
    flush();
    const box = $(`#${MAGNIFIER_ID}`);
    assert.equal(box.textContent, 'Texto em negrito do parágrafo.');
    assert.equal(box.getAttribute('aria-hidden'), 'true');
    assert.equal(box.style.display, 'block');
    assert.equal(box.style.pointerEvents, 'none');
    assert.match(box.style.font, /\b3[2-9]px|\b[4-9]\d px/);
  });

  it('foco do teclado mostra o texto; senha em foco não mostra nada', () => {
    startTextMagnifier();
    fire($('#a'), 'focusin');
    flush();
    assert.equal($(`#${MAGNIFIER_ID}`).textContent, 'Link aqui');
    fire($('#pw'), 'focusin');
    flush();
    assert.equal($(`#${MAGNIFIER_ID}`).style.display, 'none');
  });

  it('painel/FAB (#ms-container) esconde a caixa', () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div id="ms-container"><button id="fab">x</button></div>',
    );
    startTextMagnifier();
    fire($('#p'), 'pointermove');
    flush();
    assert.equal($(`#${MAGNIFIER_ID}`).style.display, 'block');
    fire($('#fab'), 'pointermove');
    flush();
    assert.equal($(`#${MAGNIFIER_ID}`).style.display, 'none');
  });

  it('Esc esconde (inclusive show pendente) até o próximo movimento', () => {
    startTextMagnifier();
    fire($('#p'), 'pointermove');
    flush();
    fire($('#p'), 'pointermove'); // show pendente
    fire(document.body, 'keydown', { key: 'Escape' });
    flush();
    assert.equal($(`#${MAGNIFIER_ID}`).style.display, 'none');
    fire($('#h'), 'pointermove');
    flush();
    assert.equal($(`#${MAGNIFIER_ID}`).style.display, 'block');
    assert.equal($(`#${MAGNIFIER_ID}`).textContent, 'Título grande');
  });

  it('toque: mostra no toque (pointerdown), ignora pointermove de toque', () => {
    startTextMagnifier();
    fire($('#h'), 'pointermove', { pointerType: 'touch' });
    flush();
    assert.equal($(`#${MAGNIFIER_ID}`), null);
    fire($('#h'), 'pointerdown', {
      pointerType: 'touch',
      clientX: 3,
      clientY: 3,
    });
    flush();
    assert.equal($(`#${MAGNIFIER_ID}`).textContent, 'Título grande');
  });
});

describe('limpeza', () => {
  const balanced = () => {
    assert.ok(added.length > 0);
    for (const [t, type, fn] of added) {
      assert.ok(
        removed.some((r) => r[0] === t && r[1] === type && r[2] === fn),
        `listener "${type}" não removido`,
      );
    }
  };

  it('stop remove todos os listeners e a caixa; eventos depois não fazem nada', () => {
    startTextMagnifier();
    fire($('#p'), 'pointermove');
    flush();
    stopTextMagnifier();
    balanced();
    assert.equal($(`#${MAGNIFIER_ID}`), null);
    fire($('#p'), 'pointermove');
    fire($('#a'), 'focusin');
    flush();
    assert.equal($(`#${MAGNIFIER_ID}`), null);
  });

  it('start duplo não duplica listeners', () => {
    startTextMagnifier();
    const n = added.length;
    startTextMagnifier();
    assert.equal(added.length, n);
  });

  it('desligar pela opção e "Desligar tudo" removem; destroy remove', () => {
    const inst = new ModoSimples({ persistence: false });
    inst.init();
    state.set({ options: { ...state.get().options, textMagnifier: true } });
    fire($('#p'), 'pointermove');
    flush();
    assert.ok($(`#${MAGNIFIER_ID}`));
    state.set({ options: { ...state.get().options, textMagnifier: false } });
    assert.equal($(`#${MAGNIFIER_ID}`), null);

    state.set({ options: { ...state.get().options, textMagnifier: true } });
    fire($('#p'), 'pointermove');
    flush();
    inst._resetAll();
    assert.equal(state.get().options.textMagnifier, false);
    assert.equal($(`#${MAGNIFIER_ID}`), null);

    state.set({ options: { ...state.get().options, textMagnifier: true } });
    fire($('#p'), 'pointermove');
    flush();
    inst.destroy();
    assert.equal($(`#${MAGNIFIER_ID}`), null);
    balanced();
  });
});
