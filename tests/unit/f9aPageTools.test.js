/**
 * F9a — highlightHeadings, highlightControls, enlargeTargets: padrão, persistência,
 * anúncio, classe no <html>, CSS fora da UI da lib e "Desligar tudo".
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import ModoSimples from '../../src/modo-simples.js';
import state from '../../src/core/state.js';
import { hydratePersistedState } from '../../src/core/persistedState.js';
import { diffStateAnnouncements } from '../../src/core/announcements.js';
import { PAGE_CSS } from '../../src/ui/styles.generated.js';
import { PROFILES } from '../../src/core/profiles.js';
import { installHappy } from './helpers/happyEnv.js';

const OPTS = {
  highlightHeadings: [
    'ms-highlight-headings',
    ['Destaque de cabeçalhos ativado', 'Destaque de cabeçalhos desativado'],
  ],
  highlightControls: [
    'ms-highlight-controls',
    [
      'Destaque de botões e campos ativado',
      'Destaque de botões e campos desativado',
    ],
  ],
  enlargeTargets: [
    'ms-enlarge-targets',
    ['Botões ampliados', 'Botões com tamanho normal'],
  ],
};

let env;
beforeEach(() => {
  env = installHappy({ bodyHtml: '<main><h1>T</h1><button>b</button></main>' });
});
afterEach(() => env.restore());

for (const [key, [cls, [msgOn, msgOff]]] of Object.entries(OPTS)) {
  describe(key, () => {
    it('padrão false, persistida e anunciada (on/off)', () => {
      assert.equal(state.get().options[key], false);
      assert.equal(
        hydratePersistedState({ options: { [key]: 1 } }).options[key],
        true,
      );
      const d = (a, b) =>
        diffStateAnnouncements(
          { options: { [key]: a } },
          { options: { [key]: b } },
        );
      assert.deepEqual(d(false, true), [msgOn]);
      assert.deepEqual(d(true, false), [msgOff]);
    });

    it('ligar marca o <html>; "Desligar tudo" zera', () => {
      const inst = new ModoSimples({ persistence: false });
      inst.init();
      state.set({ options: { ...state.get().options, [key]: true } });
      assert.ok(document.documentElement.classList.contains(cls));
      inst._resetAll();
      assert.equal(state.get().options[key], false);
      assert.equal(document.documentElement.classList.contains(cls), false);
      inst.destroy();
    });

    it('CSS exclui a UI da lib', () => {
      const i = PAGE_CSS.indexOf(`html.${cls}`);
      assert.ok(i >= 0);
      assert.match(
        PAGE_CSS.slice(i, i + 700),
        /:not\(#ms-container \*, #ms-simples-chrome \*/,
      );
    });
  });
}

describe('F9a — escopo', () => {
  it('perfis não ligam as ferramentas de página (ADR-019)', () => {
    for (const p of Object.values(PROFILES)) {
      for (const k of Object.keys(OPTS)) {
        assert.ok(!(k in (p.options ?? p)), `${p.id ?? ''} ${k}`);
      }
    }
  });

  it('Ampliar botões garante 44px; cabeçalhos cobrem role=heading; controles cobrem summary', () => {
    assert.match(PAGE_CSS, /min-width: 44px !important/);
    assert.match(PAGE_CSS, /min-height: 44px !important/);
    assert.match(PAGE_CSS, /\[role="heading"\]/);
    assert.match(PAGE_CSS, /summary/);
  });
});
