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
const os = require('os');
const fs = require('fs');

const isWatch = process.argv.includes('--watch');
const isCoverage = process.argv.includes('--coverage');
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

let files;
if (onlyStructure) files = structureFiles;
else if (onlyUnit) files = unitFiles;
else files = [...unitFiles, ...structureFiles];

if (files.length === 0) {
  console.error('Nenhum arquivo de teste encontrado.');
  process.exit(1);
}

// Pisos de cobertura (src/): o `npm run coverage` falha se algum cair abaixo (L2)
const COVERAGE_FLOOR = { lines: 90, branches: 80, functions: 80 };

// TAP num arquivo temporário, em paralelo ao reporter spec: serve para detectar `todo` que passou
const tapFile = path.join(os.tmpdir(), `ms-test-${process.pid}.tap`);

const args = [
  '--test',
  ...(isWatch ? ['--watch'] : []),
  ...(isCoverage
    ? [
        '--experimental-test-coverage',
        '--test-coverage-include=src/**',
        `--test-coverage-lines=${COVERAGE_FLOOR.lines}`,
        `--test-coverage-branches=${COVERAGE_FLOOR.branches}`,
        `--test-coverage-functions=${COVERAGE_FLOOR.functions}`,
      ]
    : []),
  ...(isWatch
    ? []
    : [
        '--test-reporter=spec',
        '--test-reporter-destination=stdout',
        '--test-reporter=tap',
        `--test-reporter-destination=${tapFile}`,
      ]),
  ...files,
];

const result = spawnSync(process.execPath, args, {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'test' },
});

let status = result.status ?? 1;

/**
 * Sinal de "flip" dos `todo`: um teste `todo` descreve um bug conhecido e DEVE falhar.
 * Se passar (`ok ... # TODO`), o bug foi corrigido e o todo precisa sair.
 */
if (!isWatch && fs.existsSync(tapFile)) {
  const tap = fs.readFileSync(tapFile, 'utf8');
  fs.rmSync(tapFile, { force: true });
  const fixed = tap
    .split('\n')
    .map((line) => line.match(/^\s*ok \d+ - (.*?) # TODO\b/))
    .filter(Boolean)
    .map((m) => m[1]);
  if (fixed.length > 0) {
    console.error(
      '\n✖ Teste `todo` que PASSOU — o bug foi corrigido, remova o todo:',
    );
    for (const name of fixed) {
      const id = name.match(/\b[A-Z]{2,4}-\d+\b/);
      console.error(`  - ${id ? `${id[0]} fixed: remove todo → ` : ''}${name}`);
    }
    status = status || 1;
  }
}

process.exit(status);
