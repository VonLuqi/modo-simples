/**
 * F4d-2 — diffStateAnnouncements: função pura prev/next -> mensagens aria-live.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { diffStateAnnouncements } from '../../src/core/announcements.js';

const base = {
  textScale: '100',
  colorTheme: 'senac',
  dyslexiaFont: false,
  readingRuler: false,
  highlightLinks: false,
  textSpacing: false,
  reducedMotion: false,
  hideImages: false,
  simpleLanguage: false,
};
const st = (o = {}) => ({ options: { ...base, ...o } });

describe('diffStateAnnouncements', () => {
  it('sem mudança: lista vazia', () => {
    assert.deepEqual(diffStateAnnouncements(st(), st()), []);
  });

  it('régua ligada/desligada', () => {
    assert.deepEqual(diffStateAnnouncements(st(), st({ readingRuler: true })), [
      'Régua de leitura ativada',
    ]);
    assert.deepEqual(diffStateAnnouncements(st({ readingRuler: true }), st()), [
      'Régua de leitura desativada',
    ]);
  });

  it('cada toggle: texto on e off', () => {
    const casos = {
      dyslexiaFont: ['Fonte Lexend ativada', 'Fonte Lexend desativada'],
      highlightLinks: [
        'Destaque de links ativado',
        'Destaque de links desativado',
      ],
      textSpacing: [
        'Espaçamento de texto ativado',
        'Espaçamento de texto desativado',
      ],
      hideImages: ['Imagens ocultadas', 'Imagens visíveis'],
      reducedMotion: [
        'Movimento reduzido ativado',
        'Movimento reduzido desativado',
      ],
      simpleLanguage: [
        'Linguagem simples ligada',
        'Linguagem simples desligada',
      ],
    };
    for (const [k, [on, off]] of Object.entries(casos)) {
      assert.deepEqual(diffStateAnnouncements(st(), st({ [k]: true })), [on]);
      assert.deepEqual(diffStateAnnouncements(st({ [k]: true }), st()), [off]);
    }
  });

  it('tamanho do texto', () => {
    assert.deepEqual(diffStateAnnouncements(st(), st({ textScale: '150' })), [
      'Tamanho do texto 150%',
    ]);
  });

  it('tema: rótulos conhecidos e fallback cru', () => {
    const t = (colorTheme) =>
      diffStateAnnouncements(st({ colorTheme: 'x' }), st({ colorTheme }));
    assert.deepEqual(t('senac'), ['Tema Cores do site']);
    assert.deepEqual(t('yellowBlack'), ['Tema Amarelo e Preto']);
    assert.deepEqual(t('darkHigh'), ['Tema Modo Escuro Alto']);
    assert.deepEqual(t('soft'), ['Tema Descanso Suave']);
    assert.deepEqual(t('neon'), ['Tema neon']);
  });

  it('várias mudanças: ordem régua, toggles, texto, tema', () => {
    const out = diffStateAnnouncements(
      st(),
      st({
        colorTheme: 'soft',
        textScale: '200',
        simpleLanguage: true,
        dyslexiaFont: true,
        readingRuler: true,
      }),
    );
    assert.deepEqual(out, [
      'Régua de leitura ativada',
      'Fonte Lexend ativada',
      'Linguagem simples ligada',
      'Tamanho do texto 200%',
      'Tema Descanso Suave',
    ]);
  });
});
