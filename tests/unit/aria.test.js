/**
 * W4d — src/utils/aria.js: setExpanded, setPressed, setHidden, announce.
 */

import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';

import {
  setExpanded,
  setPressed,
  setHidden,
  announce,
} from '../../src/utils/aria.js';
import { installHappy } from './helpers/happyEnv.js';

let env;

beforeEach(() => {
  env = installHappy({ bodyHtml: '<button id="b">x</button>' });
});
afterEach(() => {
  mock.timers.reset();
  env.restore();
});

const btn = () => document.getElementById('b');
const lives = () => document.querySelectorAll('[data-ms-live]');

describe('setExpanded / setPressed', () => {
  it('gravam "true"/"false" como string', () => {
    setExpanded(btn(), true);
    assert.equal(btn().getAttribute('aria-expanded'), 'true');
    setExpanded(btn(), false);
    assert.equal(btn().getAttribute('aria-expanded'), 'false');

    setPressed(btn(), true);
    assert.equal(btn().getAttribute('aria-pressed'), 'true');
    setPressed(btn(), false);
    assert.equal(btn().getAttribute('aria-pressed'), 'false');
  });
});

describe('setHidden', () => {
  it('true põe aria-hidden="true"; false remove o atributo', () => {
    setHidden(btn(), true);
    assert.equal(btn().getAttribute('aria-hidden'), 'true');
    setHidden(btn(), false);
    assert.equal(btn().hasAttribute('aria-hidden'), false);
  });

  it('false em elemento sem o atributo é inofensivo', () => {
    setHidden(btn(), false);
    assert.equal(btn().hasAttribute('aria-hidden'), false);
  });
});

describe('announce', () => {
  beforeEach(() => mock.timers.enable({ apis: ['setTimeout'] }));

  it('insere região polite oculta, marcada como da lib; texto entra após 50ms', () => {
    announce('Olá');
    const live = lives()[0];
    assert.ok(live);
    assert.equal(live.getAttribute('role'), 'status');
    assert.equal(live.getAttribute('aria-live'), 'polite');
    assert.equal(live.getAttribute('aria-atomic'), 'true');
    assert.match(live.style.cssText, /clip/);
    assert.equal(live.textContent, '');

    mock.timers.tick(50);
    assert.equal(live.textContent, 'Olá');
  });

  it('politeness assertive é respeitada', () => {
    announce('Alerta', 'assertive');
    assert.equal(lives()[0].getAttribute('aria-live'), 'assertive');
  });

  it('o nó some do DOM 3s depois do texto', () => {
    announce('Some');
    mock.timers.tick(50);
    mock.timers.tick(2999);
    assert.equal(lives().length, 1);
    mock.timers.tick(1);
    assert.equal(lives().length, 0);
  });

  it('chamadas repetidas criam um nó cada e todos são limpos', () => {
    announce('a');
    announce('b');
    assert.equal(lives().length, 2);
    mock.timers.tick(50);
    mock.timers.tick(3000);
    assert.equal(lives().length, 0);
  });

  it('nó já removido por outro (ex.: destroy) não quebra a limpeza', () => {
    announce('x');
    mock.timers.tick(50);
    lives()[0].remove();
    assert.doesNotThrow(() => mock.timers.tick(3000));
  });
});
