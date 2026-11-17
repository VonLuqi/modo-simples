/**
 * IMP-06 — o principal escolhido à mão vale POR PÁGINA e é validado antes de reaplicar.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import ModoSimples from '../../src/modo-simples.js';
import persistence from '../../src/core/persistence.js';
import { installHappy } from './helpers/happyEnv.js';

let env;
let inst;

const texto = (n) =>
  'Texto de conteúdo denso para a área escolhida. '.repeat(n);
const PAGE = `
  <header>topo</header>
  <main id="auto"><h1>Título</h1><p>${texto(20)}</p></main>
  <section id="escolhido"><p>${texto(12)}</p></section>
  <section id="medio"><p>${texto(5)}</p></section>
  <aside class="ad">anúncio</aside>
  <div id="pequeno">pouco texto</div>`;

const principal = () => document.querySelector('[data-ms-principal]');

beforeEach(() => {
  env = installHappy({
    bodyHtml: PAGE,
    url: 'https://exemplo.test/pagina-a.html',
  });
  inst = new ModoSimples();
  inst.init();
});
afterEach(() => {
  inst?.destroy();
  env.restore();
});

describe('principal manual por página (IMP-06)', () => {
  it('escolha salva é reaplicada na MESMA página', () => {
    inst._savePrincipalPath('#escolhido', document.getElementById('escolhido'));
    inst.enable();
    assert.equal(principal().id, 'escolhido');
  });

  it('a mesma escolha NÃO vale em outra página do host', () => {
    inst._savePrincipalPath('#escolhido', document.getElementById('escolhido'));
    env.win.happyDOM.setURL('https://exemplo.test/pagina-b.html');
    inst.enable();
    assert.equal(principal().id, 'auto'); // heurística
  });

  it('registro antigo (string por host) válido é aplicado e migrado para a página', () => {
    persistence.saveForHost('principal', '#escolhido');
    inst.enable();
    assert.equal(principal().id, 'escolhido');
    const migrado = persistence.loadForPath('principal');
    assert.equal(migrado.path, '#escolhido');
    assert.ok(migrado.textLen > 200);
  });

  it('registro antigo apontando para área pequena demais não se aplica, mas o registro por host FICA', () => {
    persistence.saveForHost('principal', '#pequeno');
    inst.enable();
    assert.equal(principal().id, 'auto');
    // M2: falhar numa página não pode apagar a dica das outras páginas
    assert.equal(persistence.loadForHost('principal'), '#pequeno');
  });

  it('dica antiga bem menor que o candidato confiante da heurística não se aplica (e fica guardada)', () => {
    persistence.saveForHost('principal', '#medio'); // ~235 chars vs ~940 do main
    inst.enable();
    assert.equal(principal().id, 'auto');
    assert.equal(persistence.loadForHost('principal'), '#medio');
    assert.equal(persistence.loadForPath('principal'), null); // nada migrado
  });

  it('falha numa página não impede a mesma dica de valer em outra página do host', () => {
    persistence.saveForHost('principal', '#medio');
    inst.enable();
    assert.equal(principal().id, 'auto'); // página A: rejeitada
    inst.disable();

    // página B: sem main dominante (o #medio é o maior bloco)
    env.win.happyDOM.setURL('https://exemplo.test/pagina-b.html');
    document.body.innerHTML = `<section id="medio"><p>${texto(5)}</p></section><aside class="ad">x</aside>`;
    inst.enable();
    assert.equal(principal().id, 'medio');
    assert.equal(persistence.loadForPath('principal').path, '#medio'); // migrada só para B
    assert.equal(persistence.loadForHost('principal'), '#medio');
  });

  it('registro DA PÁGINA inválido sai, mas o registro antigo por host continua', () => {
    persistence.saveForHost('principal', '#escolhido');
    persistence.saveForPath('principal', { path: '#sumiu', textLen: 5000 });
    inst.enable();
    assert.equal(persistence.loadForPath('principal'), null);
    assert.equal(persistence.loadForHost('principal'), '#escolhido');
  });

  it('texto muito menor que o da escolha original (< 50%) descarta a escolha', () => {
    persistence.saveForPath('principal', {
      path: '#escolhido',
      textLen: 100000,
    });
    inst.enable();
    assert.equal(principal().id, 'auto');
    assert.equal(persistence.loadForPath('principal'), null);
  });

  it('caminho que não existe mais é descartado', () => {
    persistence.saveForPath('principal', { path: '#sumiu', textLen: 5000 });
    inst.enable();
    assert.equal(principal().id, 'auto');
    assert.equal(persistence.loadForPath('principal'), null);
  });

  it('seletor inválido é descartado sem lançar', () => {
    persistence.saveForPath('principal', { path: '::inválido:::' });
    assert.doesNotThrow(() => inst.enable());
    assert.equal(persistence.loadForPath('principal'), null);
  });

  it('persistence:false não lê nem grava principal', () => {
    inst.destroy();
    inst = new ModoSimples({ persistence: false });
    inst.init();
    persistence.saveForPath('principal', {
      path: '#escolhido',
      textLen: 4000,
    });
    inst.enable();
    assert.equal(principal().id, 'auto');
  });
});
