/**
 * F6a — módulo central de strings: chaves existem, são texto não vazio e o objeto é congelado.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { STRINGS } from '../../src/ui/strings.js';

describe('ui/strings', () => {
  it('é congelado', () => {
    assert.ok(Object.isFrozen(STRINGS));
  });

  it('todas as chaves são strings não vazias', () => {
    const keys = Object.keys(STRINGS);
    assert.ok(keys.length > 0);
    for (const k of keys) {
      assert.equal(typeof STRINGS[k], 'string', k);
      assert.ok(STRINGS[k].length > 0, k);
    }
  });

  it('expõe as chaves-base de cada área', () => {
    for (const k of ['fabTip', 'panelSimpleTitle', 'sessionActivate']) {
      assert.ok(k in STRINGS, k);
    }
  });
});
