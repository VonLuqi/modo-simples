/**
 * tests/unit/distractionDetector.test.js
 *
 * Testa o módulo heuristics/distractionDetector com foco nas salvaguardas:
 *   - Nunca esconde o contêiner #ms-container
 *   - Nunca esconde um ancestral do conteúdo principal
 *   - Nunca esconde um descendente do conteúdo principal
 *   - Deduplica resultados
 *
 * `document.querySelectorAll` é mockado globalmente para cada teste.
 */

import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { detectDistractions } from '../../src/heuristics/distractionDetector.js';
import defaults from '../../src/config/defaults.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

let selectorMap = {};

/**
 * Cria um mock de Element com os métodos mínimos necessários.
 *
 * @param {{ id?: string, contains?: Function }} opts
 */
function mockEl({ id = '', containsFn = () => false } = {}) {
  return {
    id,
    contains: containsFn,
  };
}

/**
 * Configura document.querySelectorAll para retornar elementos específicos
 * por seletor. Qualquer seletor não mapeado retorna lista vazia.
 *
 * @param {Record<string, Element[]>} map
 */
function setQueryMap(map) {
  selectorMap = map;
}

before(() => {
  global.document = {
    querySelectorAll(sel) {
      return {
        forEach(cb) {
          (selectorMap[sel] || []).forEach(cb);
        },
      };
    },
  };
});

after(() => {
  delete global.document;
});

beforeEach(() => {
  selectorMap = {};
});

// ── Configuração de teste com um único seletor ─────────────────────────────

const configUm = {
  ...defaults,
  distractionSelectors: ['.ad'],
};

describe('detectDistractions', () => {
  it('deve retornar os elementos que correspondem aos seletores', () => {
    const el = mockEl();
    setQueryMap({ '.ad': [el] });

    const resultado = detectDistractions(null, configUm);
    assert.deepEqual(resultado, [el]);
  });

  it('deve retornar lista vazia quando nenhum seletor tem correspondência', () => {
    setQueryMap({});
    const resultado = detectDistractions(null, configUm);
    assert.deepEqual(resultado, []);
  });

  it('nunca deve incluir o elemento #ms-container', () => {
    const container = mockEl({ id: 'ms-container' });
    const anuncio = mockEl();
    setQueryMap({ '.ad': [container, anuncio] });

    const resultado = detectDistractions(null, configUm);
    assert.ok(
      !resultado.includes(container),
      '#ms-container não deve ser incluído',
    );
    assert.ok(
      resultado.includes(anuncio),
      'Outros elementos devem ser incluídos',
    );
  });

  it('nunca deve esconder um ancestral do conteúdo principal', () => {
    // O elemento principal é FILHO do anuncio — log: anuncio.contains(principal) === true
    const principal = mockEl();
    const ancestral = mockEl({
      containsFn: (el) => el === principal, // contém o conteúdo principal
    });
    setQueryMap({ '.ad': [ancestral] });

    const resultado = detectDistractions(principal, configUm);
    assert.ok(
      !resultado.includes(ancestral),
      'Ancestral do conteúdo não deve ser escondido',
    );
  });

  it('nunca deve esconder um descendente do conteúdo principal', () => {
    const descendente = mockEl();
    // principal.contains(descendente) === true
    const principal = mockEl({
      containsFn: (el) => el === descendente,
    });
    setQueryMap({ '.ad': [descendente] });

    const resultado = detectDistractions(principal, configUm);
    assert.ok(
      !resultado.includes(descendente),
      'Descendente do conteúdo não deve ser escondido',
    );
  });

  it('deve deduplicar elementos que aparecem em múltiplos seletores', () => {
    const el = mockEl();
    const configDois = {
      ...defaults,
      distractionSelectors: ['.ad', '.banner'],
    };
    setQueryMap({ '.ad': [el], '.banner': [el] });

    const resultado = detectDistractions(null, configDois);
    const ocorrencias = resultado.filter((r) => r === el).length;
    assert.strictEqual(
      ocorrencias,
      1,
      'O elemento não deve aparecer duplicado',
    );
  });

  it('deve tolerar seletores CSS malformados sem lançar', () => {
    const original = global.document.querySelectorAll;
    global.document.querySelectorAll = (sel) => {
      if (sel === '.invalido:::bla') throw new Error('seletor inválido');
      return { forEach() {} };
    };

    const configInvalido = {
      ...defaults,
      distractionSelectors: ['.invalido:::bla'],
    };
    assert.doesNotThrow(() => detectDistractions(null, configInvalido));
    global.document.querySelectorAll = original;
  });

  it('deve funcionar quando mainElement é null (sem página mapeada ainda)', () => {
    const el = mockEl();
    setQueryMap({ '.ad': [el] });

    const resultado = detectDistractions(null, configUm);
    assert.ok(resultado.includes(el));
  });
});
