/**
 * IMP-33 — esquema versionado (v:1) e chaves por página, sem perder preferências antigas.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import ModoSimples from '../../src/modo-simples.js';
import state from '../../src/core/state.js';
import persistence from '../../src/core/persistence.js';
import { SCHEMA_VERSION } from '../../src/core/persistedState.js';
import { installHappy, SAMPLE_PAGE } from './helpers/happyEnv.js';

let env;
let inst;
const KEY = 'ms_state:exemplo.test';
const saved = () => JSON.parse(localStorage.getItem(KEY));

beforeEach(() => {
  env = installHappy({
    bodyHtml: SAMPLE_PAGE,
    url: 'https://exemplo.test/cursos/lista.html',
  });
});
afterEach(() => {
  inst?.destroy();
  env.restore();
});

describe('esquema do estado salvo (IMP-33)', () => {
  it('SCHEMA_VERSION é 1 e o payload novo carrega v', () => {
    assert.equal(SCHEMA_VERSION, 1);
    inst = new ModoSimples();
    inst.init();
    state.set({ options: { textScale: '150' } });
    assert.equal(saved().v, 1);
  });

  it('payload antigo (sem v, chaves legadas) é lido sem perder preferências e regravado como v1', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        modoSimples: false,
        options: { largerText: true, highContrast: true, dyslexiaFont: true },
      }),
    );
    inst = new ModoSimples();
    inst.init();
    const o = state.get().options;
    assert.equal(o.textScale, '125'); // largerText migrado
    assert.equal(o.colorTheme, 'yellowBlack'); // highContrast migrado
    assert.equal(o.dyslexiaFont, true);

    state.set({ options: { highlightLinks: true } });
    assert.equal(saved().v, 1);
    assert.equal(saved().options.dyslexiaFont, true);
  });

  it('payload gravado por versão futura ainda é lido com o que se conhece', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        v: 99,
        modoSimples: false,
        options: { textScale: '175' },
      }),
    );
    inst = new ModoSimples();
    inst.init();
    assert.equal(state.get().options.textScale, '175');
  });

  it('JSON corrompido não derruba o init', () => {
    localStorage.setItem(KEY, '{nao-e-json');
    inst = new ModoSimples();
    assert.doesNotThrow(() => inst.init());
  });
});

describe('chaves por página (IMP-33)', () => {
  it('pathKey inclui pathname e host; hostKey continua só com o host', () => {
    assert.equal(
      persistence.pathKey('principal'),
      'principal@/cursos/lista.html:exemplo.test',
    );
    assert.equal(persistence.hostKey('principal'), 'principal:exemplo.test');
  });

  it('save/load/remove por página são independentes da chave por host', () => {
    persistence.saveForPath('x', 'pagina');
    persistence.saveForHost('x', 'host');
    assert.equal(persistence.loadForPath('x'), 'pagina');
    assert.equal(persistence.loadForHost('x'), 'host');
    persistence.removeForPath('x');
    assert.equal(persistence.loadForPath('x'), null);
    assert.equal(persistence.loadForHost('x'), 'host');
  });

  it('outra página do mesmo host não enxerga o valor da primeira', () => {
    persistence.saveForPath('x', 'a');
    env.win.happyDOM.setURL('https://exemplo.test/outra.html');
    assert.equal(persistence.loadForPath('x'), null);
  });
});
