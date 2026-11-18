/**
 * F9c — Estrutura da página: coleta de títulos/áreas (ocultos e UI própria excluídos, nomes
 * acessíveis), diálogo (abrir, pular, Esc, Fechar, estado vazio) e limpeza (reset/destroy).
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  collectOutline,
  createPageOutline,
  jumpToElement,
} from '../../src/features/pageOutline.js';
import { STRINGS as S } from '../../src/ui/strings.js';
import ModoSimples from '../../src/modo-simples.js';
import state from '../../src/core/state.js';
import { installHappy } from './helpers/happyEnv.js';

let env;
let inst;
const $ = (s) => document.querySelector(s);

afterEach(() => {
  inst?.destroy();
  inst = null;
  env?.restore();
});

const PAGE = `
  <header id="top"><h1 id="h1">Site</h1></header>
  <nav id="nv" aria-label="Menu principal"><a href="#a">A</a></nav>
  <main id="mn">
    <h2 id="h2">Seção</h2>
    <div id="rh" role="heading" aria-level="4">Por papel</div>
    <div id="rh2" role="heading">Sem nível</div>
    <h3 id="hh" hidden>Escondido</h3>
    <div style="display:none"><h3 id="hd">Display none</h3></div>
    <section id="s1" aria-labelledby="t1"><h3 id="t1">Notícias</h3></section>
    <section id="s2"><h3 id="h3b">Sem nome</h3></section>
    <form id="f1" aria-label="Contato"></form>
    <form id="f2"></form>
    <div id="srch" role="search" aria-label="Buscar no site"></div>
    <article><header id="arthdr"><h3 id="h3c">Dentro do artigo</h3></header></article>
  </main>
  <aside id="as"></aside>
  <footer id="ft"></footer>`;

describe('F9c collectOutline', () => {
  beforeEach(() => {
    env = installHappy({ bodyHtml: PAGE });
  });

  it('lista títulos na ordem, com nível (tag e role+aria-level)', () => {
    const { headings } = collectOutline();
    const got = headings.map((h) => [h.text, h.level]);
    assert.deepEqual(got, [
      ['Site', 1],
      ['Seção', 2],
      ['Por papel', 4],
      ['Sem nível', 2],
      ['Notícias', 3],
      ['Sem nome', 3],
      ['Dentro do artigo', 3],
    ]);
  });

  it('exclui elementos ocultos (hidden e display:none)', () => {
    const { headings } = collectOutline();
    const els = headings.map((h) => h.el.id);
    assert.ok(!els.includes('hh'));
    assert.ok(!els.includes('hd'));
  });

  it('landmarks: main/nav/banner/footer/aside sem nome; form/search/region só com nome', () => {
    const { landmarks } = collectOutline();
    const got = landmarks.map((l) => [l.el.id, l.text]);
    assert.deepEqual(got, [
      ['top', S.outlineLmBanner],
      ['nv', `${S.outlineLmNav}: Menu principal`],
      ['mn', S.outlineLmMain],
      ['s1', `${S.outlineLmRegion}: Notícias`],
      ['f1', `${S.outlineLmForm}: Contato`],
      ['srch', `${S.outlineLmSearch}: Buscar no site`],
      ['as', S.outlineLmAside],
      ['ft', S.outlineLmFooter],
    ]);
  });

  it('header dentro de article não é banner', () => {
    const ids = collectOutline().landmarks.map((l) => l.el.id);
    assert.ok(!ids.includes('arthdr'));
  });

  it('exclui a UI própria do Modo Simples', () => {
    const host = document.createElement('div');
    host.id = 'ms-container';
    host.innerHTML = '<h2>Painel</h2><nav aria-label="x"></nav>';
    document.body.appendChild(host);
    const card = document.createElement('div');
    card.id = 'ms-shortcuts-card';
    card.innerHTML = '<h3>Atalhos</h3>';
    document.body.appendChild(card);
    const { headings, landmarks } = collectOutline();
    assert.ok(!headings.some((h) => /Painel|Atalhos/.test(h.text)));
    assert.ok(!landmarks.some((l) => l.name === 'x'));
  });

  it('título vazio usa aria-label ou texto padrão', () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<h2 id="e1" aria-label="Rótulo"></h2><h2 id="e2"></h2>',
    );
    const t = Object.fromEntries(
      collectOutline().headings.map((h) => [h.el.id, h.text]),
    );
    assert.equal(t.e1, 'Rótulo');
    assert.equal(t.e2, S.outlineNoText);
  });

  it('página vazia → listas vazias', () => {
    document.body.innerHTML = '<p>só texto</p>';
    const r = collectOutline();
    assert.equal(r.headings.length + r.landmarks.length, 0);
  });
});

describe('F9c jumpToElement', () => {
  beforeEach(() => {
    env = installHappy({
      bodyHtml: '<h2 id="h">T</h2><a id="a" href="#x">l</a>',
    });
  });

  it('foca o alvo; tabindex=-1 temporário só se não focalizável', () => {
    const h = $('#h');
    jumpToElement(h);
    assert.equal(document.activeElement, h);
    assert.equal(h.getAttribute('tabindex'), '-1');
    h.blur();
    assert.equal(h.hasAttribute('tabindex'), false);
    const a = $('#a');
    jumpToElement(a);
    assert.equal(document.activeElement, a);
    assert.equal(a.hasAttribute('tabindex'), false);
  });
});

describe('F9c diálogo', () => {
  let box;
  let btn;
  let jumped;
  const make = () => {
    box = document.createElement('div');
    box.innerHTML = '<div id="pbody"><button id="trg">Abrir</button></div>';
    document.body.appendChild(box);
    btn = box.querySelector('#trg');
    jumped = [];
    return createPageOutline({
      container: box,
      onJump: (el) => jumped.push(el),
    });
  };
  const key = (target, k) =>
    target.dispatchEvent(
      new window.KeyboardEvent('keydown', {
        key: k,
        bubbles: true,
        cancelable: true,
      }),
    );

  beforeEach(() => {
    env = installHappy({ bodyHtml: PAGE });
  });

  it('abre com itens recuados por nível, foca o 1º e deixa o resto inert', () => {
    const o = make();
    btn.focus();
    o.open(btn);
    const dlg = box.querySelector('[role="dialog"]');
    assert.ok(dlg);
    assert.equal(dlg.getAttribute('aria-modal'), 'true');
    assert.ok(box.querySelector('#pbody').hasAttribute('inert'));
    const links = [...dlg.querySelectorAll('.ms-outline-link')];
    assert.equal(document.activeElement, links[0]);
    const h4 = links.find((l) => l.textContent === 'Por papel');
    assert.equal(h4.parentElement.style.paddingInlineStart, '48px');
    assert.match(h4.getAttribute('aria-label'), /nível 4/);
  });

  it('clicar num item fecha o diálogo e chama onJump com o alvo', () => {
    const o = make();
    o.open(btn);
    const l = [...box.querySelectorAll('.ms-outline-link')].find(
      (x) => x.textContent === 'Seção',
    );
    l.click();
    assert.equal(o.isOpen(), false);
    assert.equal(jumped[0], $('#h2'));
    assert.equal(box.querySelector('#pbody').hasAttribute('inert'), false);
  });

  it('Esc fecha só o diálogo (não propaga) e devolve o foco ao botão', () => {
    const o = make();
    let reached = false;
    document.addEventListener('keydown', () => (reached = true), {
      once: true,
    });
    btn.focus();
    o.open(btn);
    key(document.activeElement, 'Escape');
    assert.equal(o.isOpen(), false);
    assert.equal(reached, false);
    assert.equal(document.activeElement, btn);
  });

  it('Fechar devolve o foco; a lista é refeita a cada abertura', () => {
    const o = make();
    o.open(btn);
    box.querySelector('.ms-outline-close').click();
    assert.equal(document.activeElement, btn);
    document.body.insertAdjacentHTML('beforeend', '<h2>Novo título</h2>');
    o.open(btn);
    assert.ok(
      [...box.querySelectorAll('.ms-outline-link')].some(
        (x) => x.textContent === 'Novo título',
      ),
    );
  });

  it('estado vazio mostra o texto e foca o Fechar', () => {
    document.body.innerHTML = '<p>nada</p>';
    const o = make();
    o.open(btn);
    assert.equal(
      box.querySelector('.ms-outline-empty').textContent,
      S.outlineEmpty,
    );
    assert.equal(
      document.activeElement,
      box.querySelector('.ms-outline-close'),
    );
  });
});

describe('F9c integração com o painel', () => {
  const shadow = () => $('#ms-container').shadowRoot;
  beforeEach(() => {
    env = installHappy({ bodyHtml: PAGE });
    inst = new ModoSimples();
    inst.init();
  });

  it('botão na seção Ferramentas de página abre o diálogo; Desligar tudo fecha', () => {
    const b = shadow().querySelector('[data-action="page-outline"]');
    assert.ok(b);
    assert.equal(b.textContent.trim(), S.panelPageOutline);
    inst._openPanel();
    b.click();
    assert.ok(shadow().querySelector('#ms-page-outline'));
    shadow()
      .querySelector('[data-action="reset-all"]')
      .dispatchEvent(new window.Event('click', { bubbles: true }));
    assert.equal(shadow().querySelector('#ms-page-outline'), null);
  });

  it('pular fecha o painel e foca o alvo; destroy fecha o diálogo; nada é persistido', () => {
    inst._openPanel();
    shadow().querySelector('[data-action="page-outline"]').click();
    [...shadow().querySelectorAll('.ms-outline-link')]
      .find((x) => x.textContent === 'Seção')
      .click();
    assert.equal(state.get().panelOpen, false);
    assert.equal(document.activeElement, $('#h2'));
    assert.equal('pageOutline' in state.get().options, false);
    inst._openPanel();
    shadow().querySelector('[data-action="page-outline"]').click();
    inst.destroy();
    inst = null;
    assert.equal($('#ms-container'), null);
  });
});
