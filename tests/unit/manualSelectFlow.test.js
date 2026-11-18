/**
 * IMP-22 — com confiança baixa, nada é aplicado antes de o usuário confirmar a seleção manual.
 * Antes: applyModoSimples rodava primeiro (ocultando em volta de um principal incerto) e
 * "Cancelar" deixava o resultado aplicado.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import ModoSimples from '../../src/modo-simples.js';
import state from '../../src/core/state.js';
import { installHappy, SAMPLE_PAGE } from './helpers/happyEnv.js';

let env;
let inst;

const $ = (s) => document.querySelector(s);
const hidden = () => document.querySelectorAll('[data-ms-hidden="true"]');
const banner = () => $('#ms-manual-select-banner');

/** threshold acima do máximo possível: força o caminho de seleção manual */
function baixaConfianca() {
  inst = new ModoSimples({ confidenceThreshold: 2, persistence: false });
  inst.init();
  inst.enable();
}

const notice = () => $('#ms-low-confidence-notice');

/** "Escolher o conteúdo" no aviso: abre a seleção manual (opcional, UX-21) */
function escolher() {
  clicar(notice().querySelector('button'));
}

function clicar(el) {
  el.dispatchEvent(
    new env.win.MouseEvent('click', { bubbles: true, cancelable: true }),
  );
}

beforeEach(() => {
  env = installHappy({ bodyHtml: SAMPLE_PAGE });
});

afterEach(() => {
  inst?.destroy();
  inst = null;
  env.restore();
});

describe('seleção manual com confiança baixa (IMP-22)', () => {
  it('confiança baixa (UX-21): aviso em linguagem simples, sem seleção aberta, nada oculto nem marcado', () => {
    baixaConfianca();
    assert.equal(banner(), null, 'a seleção manual não abre sozinha');
    assert.ok(notice(), 'aviso aberto');
    assert.equal(notice().getAttribute('aria-live'), 'polite');
    assert.match(notice().textContent, /Não achei o conteúdo principal/);
    assert.equal(hidden().length, 0);
    assert.equal(document.querySelectorAll('[data-ms-principal]').length, 0);
    assert.ok(document.documentElement.classList.contains('ms-ativo'));
  });

  it('"Fechar" dispensa o aviso e mantém a página simplificada', () => {
    baixaConfianca();
    const fechar = notice().querySelectorAll('button')[1];
    assert.equal(fechar.textContent, 'Fechar');
    clicar(fechar);
    assert.equal(notice(), null);
    assert.equal(banner(), null);
    assert.ok(document.documentElement.classList.contains('ms-ativo'));
  });

  it('"Escolher o conteúdo": abre a seleção, sem jargão, e ainda nada oculto (IMP-22)', () => {
    baixaConfianca();
    escolher();
    assert.ok(banner(), 'banner de seleção aberto');
    assert.equal(notice(), null, 'o aviso sai quando a escolha começa');
    assert.doesNotMatch(banner().textContent, /candidato|seletor/i);
    assert.equal(hidden().length, 0, 'nada oculto antes de confirmar');
    assert.equal(document.querySelectorAll('[data-ms-principal]').length, 0);
  });

  it('confirmar: aplica em volta da escolha e fecha o banner', () => {
    baixaConfianca();
    escolher();
    clicar($('main'));

    assert.equal(banner(), null);
    assert.ok($('main').hasAttribute('data-ms-principal'));
    assert.equal($('header').getAttribute('data-ms-hidden'), 'true');
    assert.equal($('aside').getAttribute('data-ms-hidden'), 'true');
    assert.ok(document.documentElement.classList.contains('ms-ativo'));
  });

  it('cancelar pelo botão: modo ligado, SEM principal e nada oculto', () => {
    baixaConfianca();
    escolher();
    const cancelar = banner().querySelector('button');
    clicar(cancelar);

    assert.equal(banner(), null);
    assert.equal(hidden().length, 0, 'cancelar não pode deixar nada oculto');
    assert.equal(state.get().modoSimples, true);
    assert.ok(document.documentElement.classList.contains('ms-ativo'));
    assert.equal(
      document.querySelectorAll('[data-ms-principal]').length,
      0,
      'sem escolha não há principal (nem body: o max-width do principal estreitaria a página)',
    );
  });

  it('cancelar com Esc: mesmo resultado do botão', () => {
    baixaConfianca();
    escolher();
    document.dispatchEvent(
      new env.win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    assert.equal(banner(), null);
    assert.equal(hidden().length, 0);
    assert.equal(document.querySelectorAll('[data-ms-principal]').length, 0);
  });

  it('cancelar não persiste nada como principal', () => {
    inst?.destroy();
    inst = new ModoSimples({ confidenceThreshold: 2 }); // com persistência
    inst.init();
    inst.enable();
    escolher();
    clicar(banner().querySelector('button'));
    const keys = Object.keys(localStorage).filter((k) =>
      k.startsWith('ms_principal'),
    );
    assert.deepEqual(keys, []);
  });

  it('depois de cancelar, mutação do host NÃO escolhe um principal sozinha', async () => {
    inst?.destroy();
    inst = new ModoSimples({
      confidenceThreshold: 2,
      persistence: false,
      reprocessDebounce: 20,
    });
    inst.init();
    inst.enable();
    escolher();
    clicar(banner().querySelector('button'));

    const novo = document.createElement('div');
    novo.className = 'ad novo';
    novo.textContent = 'slide do carrossel';
    document.body.appendChild(novo);
    await env.wait(150);

    assert.equal(document.querySelectorAll('[data-ms-principal]').length, 0);
    assert.equal(hidden().length, 0);
    assert.ok(document.documentElement.classList.contains('ms-ativo'));
  });

  it('desligar e ligar de novo mostra o aviso outra vez após um cancelamento', () => {
    baixaConfianca();
    escolher();
    clicar(banner().querySelector('button'));
    inst.disable();
    inst.enable();
    assert.ok(notice(), 'o aviso volta');
    assert.equal(banner(), null);
  });

  it('desligar o modo durante a seleção fecha o banner sem aplicar nada', () => {
    baixaConfianca();
    escolher();
    inst.disable();
    assert.equal(banner(), null);
    assert.equal(hidden().length, 0);
    assert.equal(document.querySelectorAll('[data-ms-principal]').length, 0);
  });
});
