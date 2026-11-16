/**
 * tests/unit/scoring.test.js
 *
 * Testa o módulo heuristics/scoring.
 *
 * Cria elementos DOM mínimos como objetos literais com a interface
 * necessária: tagName, getAttribute(), querySelector(), textContent.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { scoreElement } from '../../src/heuristics/scoring.js';
import defaults from '../../src/config/defaults.js';

// ── Helpers de mock DOM ─────────────────────────────────────────────────────

/**
 * Cria um mock mínimo de Element compatível com scoreElement().
 *
 * @param {{ tag?: string, role?: string, h1?: boolean, h2?: boolean, text?: string }} opts
 */
function mockEl({
  tag = 'div',
  role = null,
  h1 = false,
  h2 = false,
  text = '',
} = {}) {
  return {
    tagName: tag.toUpperCase(),
    getAttribute(attr) {
      if (attr === 'role') return role;
      return null;
    },
    querySelector(sel) {
      if (sel === 'h1') return h1 ? {} : null;
      if (sel === 'h2') return h2 ? {} : null;
      return null;
    },
    get textContent() {
      return text;
    },
  };
}

// ── Testes ──────────────────────────────────────────────────────────────────

describe('scoreElement', () => {
  it('deve retornar 0 para um <div> vazio sem semântica', () => {
    const score = scoreElement(mockEl());
    assert.strictEqual(score, 0);
  });

  it('deve pontuar mais alto para <main>', () => {
    const main = scoreElement(mockEl({ tag: 'main' }));
    const div = scoreElement(mockEl({ tag: 'div' }));
    assert.ok(main > div, `<main> (${main}) deve superar <div> (${div})`);
  });

  it('deve pontuar mais alto para role="main"', () => {
    const roleMain = scoreElement(mockEl({ role: 'main' }));
    const sem = scoreElement(mockEl());
    assert.ok(roleMain > sem);
  });

  it('deve pontuar mais alto para <article>', () => {
    const article = scoreElement(mockEl({ tag: 'article' }));
    const div = scoreElement(mockEl({ tag: 'div' }));
    assert.ok(article > div);
  });

  it('deve adicionar pontuação pela presença de h1', () => {
    const comH1 = scoreElement(mockEl({ h1: true }));
    const semH1 = scoreElement(mockEl({ h1: false }));
    assert.ok(comH1 > semH1);
  });

  it('deve adicionar pontuação pela presença de h2', () => {
    const comH2 = scoreElement(mockEl({ h2: true }));
    const semH2 = scoreElement(mockEl({ h2: false }));
    assert.ok(comH2 > semH2);
  });

  it('deve adicionar pontuação quando o texto excede o mínimo', () => {
    const { minTextLength } = defaults.scoring;
    const longo = scoreElement(mockEl({ text: 'x'.repeat(minTextLength + 1) }));
    const curto = scoreElement(mockEl({ text: 'curto' }));
    assert.ok(longo > curto);
  });

  it('deve adicionar pontuação extra quando o texto é muito longo (3× mínimo)', () => {
    const { minTextLength } = defaults.scoring;
    const muitoLongo = scoreElement(
      mockEl({ text: 'x'.repeat(minTextLength * 3 + 1) }),
    );
    const moderado = scoreElement(
      mockEl({ text: 'x'.repeat(minTextLength + 1) }),
    );
    assert.ok(
      muitoLongo > moderado,
      'Textos muito longos devem ter bônus extra',
    );
  });

  it('elemento <main> com h1 e texto longo deve ter pontuação máxima entre as variantes', () => {
    const { minTextLength } = defaults.scoring;
    const completo = scoreElement(
      mockEl({ tag: 'main', h1: true, text: 'x'.repeat(minTextLength + 1) }),
    );
    const semH1 = scoreElement(
      mockEl({ tag: 'main', text: 'x'.repeat(minTextLength + 1) }),
    );
    const semTexto = scoreElement(mockEl({ tag: 'main', h1: true }));
    const divVazia = scoreElement(mockEl());
    assert.ok(completo > semH1);
    assert.ok(completo > semTexto);
    assert.ok(completo > divVazia);
  });

  it('deve funcionar com config personalizada', () => {
    const configCustom = {
      ...defaults,
      scoring: { ...defaults.scoring, mainTagBonus: 999 },
    };
    const score = scoreElement(mockEl({ tag: 'main' }), configCustom);
    assert.ok(score >= 999);
  });
});
