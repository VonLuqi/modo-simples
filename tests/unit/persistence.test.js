/**
 * tests/unit/persistence.test.js
 *
 * Testa o módulo core/persistence.
 *
 * localStorage não existe no Node.js. Um mock mínimo é injetado globalmente
 * antes dos testes e removido depois.
 */

import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// ── Mock do localStorage ────────────────────────────────────────────────────

function criarLocalStorageMock() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
    get _store() {
      return store;
    },
  };
}

let lsMock;

before(() => {
  lsMock = criarLocalStorageMock();
  global.localStorage = lsMock;
});

after(() => {
  delete global.localStorage;
});

// Importado DEPOIS de global.localStorage ser definido para que o módulo
// encontre o objeto quando for utilizado.
const { default: persistence } = await import('../../src/core/persistence.js');

describe('persistence', () => {
  beforeEach(() => {
    lsMock.clear();
  });

  // ── save() / load() ───────────────────────────────────────────────────────

  it('deve salvar e recuperar um valor primitivo', () => {
    persistence.save('chave', 42);
    assert.strictEqual(persistence.load('chave'), 42);
  });

  it('deve salvar e recuperar um objeto', () => {
    const obj = { ativo: true, tema: 'escuro' };
    persistence.save('prefs', obj);
    assert.deepEqual(persistence.load('prefs'), obj);
  });

  it('deve prefixar as chaves automaticamente com ms_', () => {
    persistence.save('teste', 'valor');
    // O valor deve existir na store com prefixo
    assert.ok(
      lsMock._store.has('ms_teste'),
      'Chave deve existir com prefixo ms_',
    );
    // E não existir sem prefixo
    assert.strictEqual(lsMock._store.has('teste'), false);
  });

  it('deve retornar o fallback quando a chave não existe', () => {
    const resultado = persistence.load('inexistente', 'padrao');
    assert.strictEqual(resultado, 'padrao');
  });

  it('deve retornar null quando não há fallback e a chave não existe', () => {
    const resultado = persistence.load('nada');
    assert.strictEqual(resultado, null);
  });

  // ── remove() ─────────────────────────────────────────────────────────────

  it('deve remover um valor salvo', () => {
    persistence.save('remover', 'sim');
    persistence.remove('remover');
    assert.strictEqual(persistence.load('remover'), null);
  });

  it('remove() não deve lançar quando a chave não existe', () => {
    assert.doesNotThrow(() => persistence.remove('inexistente'));
  });

  // ── Tolerância a falhas ───────────────────────────────────────────────────

  it('save() não deve propagar exceções quando localStorage lança', () => {
    const original = global.localStorage.setItem;
    global.localStorage.setItem = () => {
      throw new Error('quota exceeded');
    };
    assert.doesNotThrow(() => persistence.save('qualquer', 1));
    global.localStorage.setItem = original;
  });

  it('load() deve retornar o fallback quando localStorage lança', () => {
    const original = global.localStorage.getItem;
    global.localStorage.getItem = () => {
      throw new Error('bloqueado');
    };
    const result = persistence.load('chave', 'seguro');
    assert.strictEqual(result, 'seguro');
    global.localStorage.getItem = original;
  });

  it('load() deve retornar o fallback quando o JSON é inválido', () => {
    // Insere JSON malformado diretamente na store
    lsMock._store.set('ms_corrompido', '{invalido}');
    const result = persistence.load('corrompido', 'default');
    assert.strictEqual(result, 'default');
  });

  // ── hostKey / saveForHost / loadForHost ───────────────────────────────────

  it('hostKey deve concatenar base e hostname', () => {
    const prev = global.location;
    global.location = { hostname: 'localhost' };
    assert.strictEqual(persistence.hostKey('state'), 'state:localhost');
    global.location = prev;
  });

  it('saveForHost e loadForHost devem usar chave com hostname', () => {
    const prev = global.location;
    global.location = { hostname: 'demo.local' };
    persistence.saveForHost('prefs', { a: 1 });
    assert.ok(lsMock._store.has('ms_prefs:demo.local'));
    assert.deepEqual(persistence.loadForHost('prefs'), { a: 1 });
    global.location = prev;
  });
});
