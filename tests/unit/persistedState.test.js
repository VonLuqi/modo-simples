/**
 * Preferências do painel devem sobreviver a reload / troca de página com MS off.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { hydratePersistedState } from '../../src/core/persistedState.js';

describe('hydratePersistedState', () => {
  it('restaura tema e escala com Modo Simples desligado', () => {
    const patch = hydratePersistedState({
      modoSimples: false,
      options: {
        textScale: '150',
        colorTheme: 'darkHigh',
        dyslexiaFont: true,
        highlightLinks: true,
        hideImages: true,
        simpleLanguage: true,
      },
    });

    assert.equal(patch.modoSimples, false);
    assert.equal(patch.options.textScale, '150');
    assert.equal(patch.options.colorTheme, 'darkHigh');
    assert.equal(patch.options.dyslexiaFont, true);
    assert.equal(patch.options.highlightLinks, true);
    assert.equal(patch.options.hideImages, true);
    assert.equal(
      patch.options.simpleLanguage,
      false,
      'simpleLanguage não fica órfã sem MS',
    );
  });

  it('com MS on restaura simpleLanguage e hideImages', () => {
    const patch = hydratePersistedState({
      modoSimples: true,
      options: {
        colorTheme: 'soft',
        simpleLanguage: true,
        hideImages: false,
      },
    });

    assert.equal(patch.modoSimples, true);
    assert.equal(patch.options.colorTheme, 'soft');
    assert.equal(patch.options.simpleLanguage, true);
    assert.equal(patch.options.hideImages, false);
  });

  it('migra flags legadas largerText / highContrast', () => {
    const patch = hydratePersistedState({
      modoSimples: false,
      options: { largerText: true, highContrast: true },
    });
    assert.equal(patch.options.textScale, '125');
    assert.equal(patch.options.colorTheme, 'yellowBlack');
  });

  it('retorna null para payload inválido', () => {
    assert.equal(hydratePersistedState(null), null);
    assert.equal(hydratePersistedState(undefined), null);
  });
});
