/**
 * A-03 — o CSS vive em src/ui/css/**.css; src/ui/styles.generated.js é gerado e commitado.
 * Falha se alguém editar um .css sem rodar `node scripts/gen-styles.cjs`.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);

describe('styles.generated.js (A-03)', () => {
  it('está em dia com src/ui/css (gen-styles --check)', () => {
    const r = spawnSync(
      process.execPath,
      [path.join(root, 'scripts', 'gen-styles.cjs'), '--check'],
      { encoding: 'utf8' },
    );
    assert.equal(r.status, 0, r.stderr || r.stdout);
  });
});
