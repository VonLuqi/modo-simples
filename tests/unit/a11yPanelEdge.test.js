/**
 * A-04 — a11yPanel: teclado em radiogroups (UX-10), marca vazia/parcial,
 * sync com estado parcial, rótulo de fala e liberação do trap no close.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { createA11yPanel } from '../../src/ui/a11yPanel.js';
import { installHappy } from './helpers/happyEnv.js';

let env;
let calls;

const montar = (extra = {}, state = { modoSimples: false, options: {} }) => {
  const panel = createA11yPanel({
    state,
    onClose: () => calls.push(['close']),
    onToggleModoSimples: (v) => calls.push(['modo', v]),
    onSetOption: (k, v) => calls.push(['opt', k, v]),
    onSpeak: () => calls.push(['speak']),
    ...extra,
  });
  document.body.appendChild(panel.element);
  return panel;
};

beforeEach(() => {
  env = installHappy();
  calls = [];
});
afterEach(() => env.restore());

const key = (el, k) => {
  const ev = new env.win.KeyboardEvent('keydown', {
    key: k,
    bubbles: true,
    cancelable: true,
  });
  el.dispatchEvent(ev);
  return ev;
};

describe('a11yPanel — teclado nos radiogroups (UX-10)', () => {
  const grupo = (p) => p.element.querySelector('[data-option="textScale"]');
  const radios = (p) => [...grupo(p).querySelectorAll('[role="radio"]')];

  it('ArrowRight/ArrowDown avançam e selecionam; ArrowLeft/ArrowUp voltam', () => {
    const p = montar();
    const r = radios(p);
    key(r[0], 'ArrowRight');
    key(r[1], 'ArrowDown');
    key(r[2], 'ArrowLeft');
    key(r[1], 'ArrowUp');
    assert.deepEqual(
      calls.filter((c) => c[0] === 'opt').map((c) => c[2]),
      ['125', '150', '125', '100'],
    );
  });

  it('as setas dão a volta nas extremidades', () => {
    const p = montar();
    const r = radios(p);
    key(r[r.length - 1], 'ArrowRight');
    key(r[0], 'ArrowLeft');
    assert.deepEqual(
      calls.map((c) => c[2]),
      ['100', '175'],
    );
  });

  it('Home vai ao primeiro e End ao último; a seta é bloqueada (preventDefault)', () => {
    const p = montar();
    const r = radios(p);
    const evEnd = key(r[1], 'End');
    const evHome = key(r[2], 'Home');
    assert.equal(evEnd.defaultPrevented, true);
    assert.equal(evHome.defaultPrevented, true);
    assert.deepEqual(
      calls.map((c) => c[2]),
      ['175', '100'],
    );
  });

  it('outras teclas e alvo fora dos radios não fazem nada', () => {
    const p = montar();
    const r = radios(p);
    const ev = key(r[0], 'a');
    assert.equal(ev.defaultPrevented, false);
    key(grupo(p), 'ArrowRight'); // alvo é o próprio grupo (não é radio)
    assert.equal(calls.length, 0);
  });

  it('o grupo de temas também navega por setas', () => {
    const p = montar();
    const temas = [
      ...p.element.querySelectorAll(
        '[data-option="colorTheme"] [role="radio"]',
      ),
    ];
    key(temas[0], 'ArrowRight');
    assert.deepEqual(calls[0].slice(0, 2), ['opt', 'colorTheme']);
    assert.equal(calls[0][2], temas[1].getAttribute('data-value'));
  });
});

describe('a11yPanel — marca e sync', () => {
  it('título vazio cai no padrão; subtítulo e rodapé vazios ficam ocultos', () => {
    const p = montar({ brand: { title: '', subtitle: '', footer: '' } });
    const titulo = p.element.querySelector('#ms-a11y-title');
    assert.equal(titulo.textContent, 'Acessibilidade Digital');
    assert.equal(titulo.hidden, false);
    assert.equal(p.element.querySelector('.ms-a11y-subtitle').hidden, true);
    assert.equal(p.element.querySelector('.ms-a11y-footer-note').hidden, true);
  });

  it('brand parcial mantém os demais padrões', () => {
    const p = montar({ brand: { title: 'Minha Marca' } });
    assert.equal(
      p.element.querySelector('#ms-a11y-title').textContent,
      'Minha Marca',
    );
    assert.match(
      p.element.querySelector('.ms-a11y-footer-note').textContent,
      /salvas neste navegador/,
    );
  });

  it('sync sem options usa 100% e tema padrão; tabindex roving só no selecionado', () => {
    const p = montar();
    p.sync({ modoSimples: true });
    const on = p.element.querySelectorAll(
      '[data-option="textScale"] [aria-checked="true"]',
    );
    assert.equal(on.length, 1);
    assert.equal(on[0].getAttribute('data-value'), '100');
    assert.equal(on[0].getAttribute('tabindex'), '0');
    const off = p.element.querySelectorAll(
      '[data-option="textScale"] [aria-checked="false"]',
    );
    off.forEach((b) => assert.equal(b.getAttribute('tabindex'), '-1'));
    const tema = p.element.querySelector(
      '[data-option="colorTheme"] [aria-checked="true"]',
    );
    assert.equal(tema.getAttribute('data-value'), 'senac');
    assert.equal(
      p.element
        .querySelector('[data-action="modo-simples"]')
        .getAttribute('aria-checked'),
      'true',
    );
  });

  it('sync troca o rótulo de fala e só mexe nele quando speaking é informado', () => {
    const p = montar();
    const btn = p.element.querySelector('[data-action="speak"]');
    const antes = btn.textContent;
    p.sync({ modoSimples: false, options: {} });
    assert.equal(btn.textContent, antes);
    p.sync({ modoSimples: false, options: {} }, { speaking: true });
    assert.equal(btn.textContent, 'Parar');
    assert.equal(btn.getAttribute('aria-label'), 'Parar leitura');
    p.sync({ modoSimples: false, options: {} }, { speaking: false });
    assert.equal(btn.textContent, 'Ouvir');
    assert.equal(btn.getAttribute('aria-label'), 'Ouvir conteúdo principal');
  });

  it('switch de opção ligado alterna para false ao clicar', () => {
    const p = montar({}, { modoSimples: false, options: { hideImages: true } });
    p.element.querySelector('.ms-switch[data-option="hideImages"]').click();
    assert.deepEqual(calls[0], ['opt', 'hideImages', false]);
  });

  it('botão de Modo Simples ligado chama onToggleModoSimples(false)', () => {
    const p = montar({}, { modoSimples: true, options: {} });
    p.element.querySelector('[data-action="modo-simples"]').click();
    assert.deepEqual(calls[0], ['modo', false]);
  });

  it('botão de fala chama onSpeak', () => {
    const p = montar();
    p.element.querySelector('[data-action="speak"]').click();
    assert.deepEqual(calls[0], ['speak']);
  });
});

describe('a11yPanel — open/close e trap', () => {
  it('open prende o Tab no painel e close solta', () => {
    const fora = document.createElement('button');
    document.body.appendChild(fora);
    const p = montar();
    p.element.querySelectorAll('button').forEach((b) => {
      b.getBoundingClientRect = () => ({ width: 10, height: 10 });
    });
    p.open();
    fora.focus();
    const ev1 = key(fora, 'Tab');
    assert.equal(ev1.defaultPrevented, true);
    p.close();
    assert.equal(p.element.hidden, true);
    fora.focus();
    const ev2 = key(fora, 'Tab');
    assert.equal(ev2.defaultPrevented, false);
  });

  it('close sem open e close duplo não lançam', () => {
    const p = montar();
    p.close();
    p.open();
    p.close();
    p.close();
    assert.equal(p.element.hidden, true);
  });
});
