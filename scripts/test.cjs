/**
 * scripts/test.cjs
 *
 * Wrapper para o test runner nativo do Node.js.
 * Roda unitários (tests/unit) + estruturais (tests/structure).
 */
'use strict';

process.env.NODE_ENV = 'test';

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const isWatch = process.argv.includes('--watch');
const onlyStructure = process.argv.includes('--structure');
const onlyUnit = process.argv.includes('--unit');

function collectTests(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.test.js'))
    .map((f) => path.join(dir, f));
}

const root = path.join(__dirname, '..', 'tests');
const unitFiles = collectTests(path.join(root, 'unit'));
const structureFiles = collectTests(path.join(root, 'structure'));

let files = [];
if (onlyStructure) files = structureFiles;
else if (onlyUnit) files = unitFiles;
else files = [...unitFiles, ...structureFiles];

if (files.length === 0) {
  console.error('Nenhum arquivo de teste encontrado.');
  process.exit(1);
}

const args = ['--test', ...(isWatch ? ['--watch'] : []), ...files];

const result = spawnSync(process.execPath, args, {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'test' },
});

process.exit(result.status ?? 1);
