/**
 * F6b — seções do painel em sanfona: botão nativo com aria-expanded/aria-controls,
 * região com aria-labelledby, primeira seção aberta, controles intactos (data-option).
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { createA11yPanel } from '../../src/ui/a11yPanel.js';
import { installHappy } from './helpers/happyEnv.js';

let env;
let calls;

function montar() {
  const panel = createA11yPanel({
    state: { modoSimples: false, panelOpen: false, options: {} },
    onClose: () => {},
    onToggleModoSimples: () => {},
    onSetOption: (k, v) => calls.push([k, v]),
    onSpeak: () => {},
  });
  document.body.appendChild(panel.element);
  return panel.element;
}

beforeEach(() => {
  env = installHappy();
  calls = [];
});
afterEach(() => env.restore());

describe('a11yPanel — sanfona (F6b)', () => {
  it('4 seções, cada uma com botão aria-expanded + aria-controls e região rotulada', () => {
    const el = montar();
    const btns = [...el.querySelectorAll('.ms-a11y-section-toggle')];
    assert.equal(btns.length, 4);
    for (const btn of btns) {
      assert.equal(btn.tagName, 'BUTTON');
      const region = el.querySelector(`#${btn.getAttribute('aria-controls')}`);
      assert.ok(region);
      assert.equal(region.getAttribute('role'), 'region');
      assert.equal(region.getAttribute('aria-labelledby'), btn.id);
    }
  });

  it('só a primeira seção nasce aberta', () => {
    const el = montar();
    const states = [...el.querySelectorAll('.ms-a11y-section-toggle')].map(
      (b) => [
        b.getAttribute('aria-expanded'),
        el.querySelector(`#${b.getAttribute('aria-controls')}`).hidden,
      ],
    );
    assert.deepEqual(states, [
      ['true', false],
      ['false', true],
      ['false', true],
      ['false', true],
    ]);
  });

  it('clique alterna aria-expanded e hidden da região', () => {
    const el = montar();
    const btn = el.querySelectorAll('.ms-a11y-section-toggle')[1];
    const region = el.querySelector(`#${btn.getAttribute('aria-controls')}`);
    btn.click();
    assert.equal(btn.getAttribute('aria-expanded'), 'true');
    assert.equal(region.hidden, false);
    btn.click();
    assert.equal(btn.getAttribute('aria-expanded'), 'false');
    assert.equal(region.hidden, true);
  });

  it('seções são independentes (abrir uma não fecha a outra)', () => {
    const el = montar();
    const [a, b] = el.querySelectorAll('.ms-a11y-section-toggle');
    b.click();
    assert.equal(a.getAttribute('aria-expanded'), 'true');
    assert.equal(b.getAttribute('aria-expanded'), 'true');
  });

  it('todos os controles seguem presentes com seus data-option/data-action', () => {
    const el = montar();
    for (const opt of [
      'textScale',
      'colorTheme',
      'dyslexiaFont',
      'readingRuler',
      'highlightLinks',
      'textSpacing',
      'reducedMotion',
      'hideImages',
    ]) {
      assert.ok(el.querySelector(`[data-option="${opt}"]`), opt);
    }
    assert.ok(el.querySelector('[data-action="speak"]'));
    assert.ok(el.querySelector('[data-action="modo-simples"]'));
  });

  it('controle dentro de seção recolhida continua ligado ao onSetOption', () => {
    const el = montar();
    el.querySelector('[data-option="hideImages"]').click();
    assert.deepEqual(calls, [['hideImages', true]]);
  });
});
