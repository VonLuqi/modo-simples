/**
 * F6c — grade de blocos: texto de estado visível (Ligado/Desligado, valor dos radiogroups)
 * acompanha aria-checked em todo sync (toggle, restauração, mudança de radiogroup).
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { createA11yPanel } from '../../src/ui/a11yPanel.js';
import { STRINGS as S } from '../../src/ui/strings.js';
import { installHappy } from './helpers/happyEnv.js';

let env;

const estado = (options = {}) => ({
  modoSimples: false,
  panelOpen: false,
  options: { textScale: '100', colorTheme: 'senac', ...options },
});

function montar(s = estado()) {
  const panel = createA11yPanel({
    state: s,
    onClose: () => {},
    onToggleModoSimples: () => {},
    onSetOption: () => {},
    onSpeak: () => {},
  });
  document.body.appendChild(panel.element);
  return panel;
}

const tile = (el, key) => el.querySelector(`.ms-switch[data-option="${key}"]`);
const stateOf = (el, key) =>
  tile(el, key).querySelector('[data-state]').textContent;

beforeEach(() => {
  env = installHappy();
});
afterEach(() => env.restore());

describe('a11yPanel — texto de estado dos blocos (F6c)', () => {
  it('tiles nascem Desligado e o estado é aria-hidden (sem duplicar o nome)', () => {
    const { element } = montar();
    const t = tile(element, 'dyslexiaFont');
    const st = t.querySelector('[data-state]');
    assert.equal(st.textContent, S.stateOff);
    assert.equal(st.getAttribute('aria-hidden'), 'true');
    assert.ok(!t.getAttribute('aria-label').includes(S.stateOff));
    assert.equal(t.getAttribute('role'), 'switch');
  });

  it('sync liga/desliga: texto acompanha aria-checked', () => {
    const p = montar();
    p.sync(estado({ dyslexiaFont: true }));
    assert.equal(
      tile(p.element, 'dyslexiaFont').getAttribute('aria-checked'),
      'true',
    );
    assert.equal(stateOf(p.element, 'dyslexiaFont'), S.stateOn);
    p.sync(estado({ dyslexiaFont: false }));
    assert.equal(
      tile(p.element, 'dyslexiaFont').getAttribute('aria-checked'),
      'false',
    );
    assert.equal(stateOf(p.element, 'dyslexiaFont'), S.stateOff);
  });

  it('restauração: primeiro sync com opções salvas já mostra Ligado', () => {
    const p = montar();
    p.sync(estado({ hideImages: true, readingRuler: true }));
    assert.equal(stateOf(p.element, 'hideImages'), S.stateOn);
    assert.equal(stateOf(p.element, 'readingRuler'), S.stateOn);
    assert.equal(stateOf(p.element, 'textSpacing'), S.stateOff);
  });

  it('radiogroups mostram o valor atual como texto de estado', () => {
    const p = montar();
    const q = (k) => p.element.querySelector(`[data-state-for="${k}"]`);
    p.sync(estado({ textScale: '125', colorTheme: 'darkHigh' }));
    assert.ok(q('textScale').textContent.startsWith('125%'));
    assert.equal(q('colorTheme').textContent, 'Modo Escuro Alto');
    p.sync(estado({ textScale: '175', colorTheme: 'soft' }));
    assert.ok(q('textScale').textContent.startsWith('175%'));
    assert.equal(q('colorTheme').textContent, 'Descanso / Suave');
    assert.equal(q('textScale').getAttribute('aria-hidden'), 'true');
  });

  it('Ouvir é tile de ação: sem texto de estado; rótulo troca ao falar', () => {
    const p = montar();
    const btn = p.element.querySelector('[data-action="speak"]');
    assert.equal(btn.querySelector('[data-state]'), null);
    assert.equal(btn.hasAttribute('aria-checked'), false);
    p.sync(estado(), { speaking: true });
    assert.equal(btn.textContent, S.panelVoiceStopButton);
    p.sync(estado(), { speaking: false });
    assert.equal(btn.textContent, S.panelVoiceButton);
  });

  it('radiogroups ocupam a linha inteira da grade', () => {
    const { element } = montar();
    const wide = element.querySelectorAll('.ms-a11y-block--wide');
    assert.equal(wide.length, 2);
    for (const w of wide) assert.ok(w.querySelector('[role="radiogroup"]'));
  });
});
