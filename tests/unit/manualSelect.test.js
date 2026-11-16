/**
 * tests/unit/manualSelect.test.js
 *
 * Testes DOM-free para buildCssPath e helpers de persistência por host.
 */

import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { buildCssPath } from '../../src/features/manualSelect.js';

// ── Minimal DOM stubs for buildCssPath ──────────────────────────────────────

function createEl(tag, { id, parent } = {}) {
  const children = [];
  const el = {
    nodeType: 1,
    tagName: tag.toUpperCase(),
    id: id || '',
    parentElement: null,
    children,
    appendChild(child) {
      child.parentElement = this;
      children.push(child);
      return child;
    },
  };
  if (parent) parent.appendChild(el);
  return el;
}

describe('buildCssPath', () => {
  it('deve retornar string vazia para entrada inválida', () => {
    assert.strictEqual(buildCssPath(null), '');
    assert.strictEqual(buildCssPath(undefined), '');
  });

  it('deve preferir #id quando o elemento tem id', () => {
    const el = createEl('div', { id: 'conteudo' });
    assert.strictEqual(buildCssPath(el), '#conteudo');
  });

  it('deve montar caminho com nth-of-type para irmãos do mesmo tag', () => {
    const root = createEl('html');
    // Avoid walking past our stub: give an id on an ancestor to stop
    const body = createEl('body', { id: 'app', parent: root });
    createEl('section', { parent: body });
    const second = createEl('section', { parent: body });

    const path = buildCssPath(second);
    assert.ok(path.includes('section:nth-of-type(2)'), `path=${path}`);
    assert.ok(path.startsWith('#app'), `path=${path}`);
  });
});

// ── Persistência por hostname ───────────────────────────────────────────────

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
let originalLocation;

before(() => {
  lsMock = criarLocalStorageMock();
  global.localStorage = lsMock;
  originalLocation = global.location;
  global.location = { hostname: 'exemplo.senac.br' };
});

after(() => {
  delete global.localStorage;
  if (originalLocation === undefined) delete global.location;
  else global.location = originalLocation;
});

const { default: persistence } = await import('../../src/core/persistence.js');

describe('persistence host helpers', () => {
  beforeEach(() => {
    lsMock.clear();
    global.location = { hostname: 'exemplo.senac.br' };
  });

  it('hostKey deve incluir o hostname', () => {
    assert.strictEqual(persistence.hostKey('state'), 'state:exemplo.senac.br');
  });

  it('hostKey deve usar "local" quando location não tem hostname', () => {
    global.location = {};
    assert.strictEqual(persistence.hostKey('state'), 'state:local');
  });

  it('saveForHost / loadForHost devem isolar por host', () => {
    persistence.saveForHost('state', { modoSimples: true });
    assert.deepEqual(persistence.loadForHost('state'), { modoSimples: true });
    assert.ok(lsMock._store.has('ms_state:exemplo.senac.br'));

    global.location = { hostname: 'outro.host' };
    assert.strictEqual(persistence.loadForHost('state'), null);
  });
});
