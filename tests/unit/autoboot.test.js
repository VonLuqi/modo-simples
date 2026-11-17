/**
 * IMP-32 — opt-out do auto-boot (data-ms-autoboot="false" ou ModoSimplesConfig.autoboot=false)
 * e declaração de sideEffects para quem importa o ESM.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { shouldAutoBoot } from '../../src/modo-simples.js';

const script = (value) => ({
  getAttribute: (name) => (name === 'data-ms-autoboot' ? value : null),
});

describe('shouldAutoBoot', () => {
  it('por padrão sobe sozinho', () => {
    assert.equal(shouldAutoBoot({}, null), true);
    assert.equal(shouldAutoBoot({}, script(null)), true);
  });

  it('data-ms-autoboot="false" na tag <script> desliga', () => {
    assert.equal(shouldAutoBoot({}, script('false')), false);
  });

  it('outros valores do atributo não desligam', () => {
    assert.equal(shouldAutoBoot({}, script('true')), true);
    assert.equal(shouldAutoBoot({}, script('')), true);
  });

  it('ModoSimplesConfig.autoboot === false desliga', () => {
    assert.equal(
      shouldAutoBoot({ ModoSimplesConfig: { autoboot: false } }, null),
      false,
    );
  });

  it('ModoSimplesConfig sem autoboot (ou true) mantém ligado', () => {
    assert.equal(
      shouldAutoBoot({ ModoSimplesConfig: { sessionBar: true } }, null),
      true,
    );
    assert.equal(
      shouldAutoBoot({ ModoSimplesConfig: { autoboot: true } }, null),
      true,
    );
  });
});

describe('package.json (IMP-32)', () => {
  const pkg = JSON.parse(
    readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
  );

  it('declara sideEffects: o entry ESM e o dist têm efeito colateral (boot)', () => {
    assert.ok(Array.isArray(pkg.sideEffects));
    assert.ok(pkg.sideEffects.includes('./src/modo-simples.js'));
    assert.ok(pkg.sideEffects.some((p) => p.startsWith('./dist/')));
  });
});
