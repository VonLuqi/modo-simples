/**
 * scripts/test.cjs
 *
 * Wrapper para o test runner nativo do Node.js.
 * Define NODE_ENV=test antes de passar o controle ao runner,
 * eliminando logs de console desnecessários durante os testes.
 */
'use strict';

process.env.NODE_ENV = 'test';

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const isWatch = process.argv.includes('--watch');

// Expande o glob tests/unit/*.test.js manualmente
const testDir = path.join(__dirname, '..', 'tests', 'unit');
const files = fs.readdirSync(testDir)
  .filter((f) => f.endsWith('.test.js'))
  .map((f) => path.join(testDir, f));

if (files.length === 0) {
  console.error('Nenhum arquivo de teste encontrado em tests/unit/');
  process.exit(1);
}

const args = ['--test', ...(isWatch ? ['--watch'] : []), ...files];

const result = spawnSync(process.execPath, args, {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'test' },
});

process.exit(result.status ?? 1);
