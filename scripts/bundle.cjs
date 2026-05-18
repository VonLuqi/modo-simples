/**
 * scripts/bundle.js
 *
 * Bundler Node.js puro — sem dependências externas.
 *
 * Produz:
 *   dist/modo-simples.js      (bundle IIFE com source map inline opcional)
 *   dist/modo-simples.min.js  (versão com comentários removidos)
 *
 * Uso:
 *   node scripts/bundle.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ── Configuração ────────────────────────────────────────────────────────────

const ROOT    = path.resolve(__dirname, '..');
const SRC     = path.join(ROOT, 'src');
const DIST    = path.join(ROOT, 'dist');

/** Pacote do projeto para cabeçalho do bundle */
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

/**
 * Ordem topológica dos módulos.
 * Cada módulo deve aparecer DEPOIS de todos de que depende.
 */
const MODULE_ORDER = [
  'config/defaults.js',
  'core/eventBus.js',
  'core/state.js',
  'core/persistence.js',
  'utils/mediaQuery.js',
  'utils/aria.js',
  'utils/focus.js',
  'ui/styles.js',
  'ui/button.js',
  'ui/toggle.js',
  'ui/panel.js',
  'heuristics/scoring.js',
  'heuristics/contentDetector.js',
  'heuristics/distractionDetector.js',
  'mutator/domMutator.js',
  'mutator/domObserver.js',
  'modo-simples.js',
];

// ── Transformação de módulo ─────────────────────────────────────────────────

/**
 * Transforma o conteúdo de um módulo ES para uso em IIFE:
 *   1. Remove linhas `import ... from '...'`
 *   2. Remove a palavra-chave `export ` antes de declarações de função/classe/const/let/var
 *   3. Remove linhas `export default X;` (o identificador já existirá no escopo)
 *
 * @param {string} source
 * @returns {string}
 */
function transformModule(source) {
  return source
    // Linha de import simples de uma linha: import X from '...' ou import { a, b } from '...'
    .replace(/^import\s[^;]+from\s+['"][^'"]+['"]\s*;?\s*\n/gm, '')
    // export default X; — remove a linha inteira (o valor já está declarado)
    .replace(/^export\s+default\s+\w+\s*;?\s*\n?/gm, '')
    // export function/class/const/let/var — mantém a declaração, remove só 'export '
    .replace(/^export\s+((?:async\s+)?function|class|const|let|var)\s/gm, '$1 ');
}

// ── Leitura e concatenação ──────────────────────────────────────────────────

function readModule(relPath) {
  const fullPath = path.join(SRC, relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Módulo não encontrado: ${fullPath}`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

function buildBundle() {
  const year     = new Date().getFullYear();
  const version  = pkg.version || '0.0.0';
  const name     = pkg.name    || 'modo-simples';

  const header = [
    `/*!`,
    ` * ${name} v${version}`,
    ` * ${pkg.description || ''}`,
    ` * (c) ${year} ${pkg.author || ''}`,
    ` * Released under the ${pkg.license || 'MIT'} License`,
    ` */`,
  ].join('\n');

  const parts = [`${header}\n(function () {\n'use strict';\n`];

  for (const modPath of MODULE_ORDER) {
    const raw         = readModule(modPath);
    const transformed = transformModule(raw);
    const trimmed     = transformed.trim();

    if (trimmed) {
      parts.push(`// ── src/${modPath} ──────────────────────────────────────\n${trimmed}\n`);
    }
  }

  parts.push('\n}());\n');

  return parts.join('\n');
}

// ── Minificação básica ──────────────────────────────────────────────────────

/**
 * Remoção de comentários de bloco e linhas em branco consecutivas.
 * Não altera strings multi-linha — suficiente para um bundle de desenvolvimento.
 *
 * @param {string} code
 * @returns {string}
 */
function minify(code) {
  return code
    // Remove comentários de bloco /* ... */ (não-gananciosos)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove comentários de linha //...
    .replace(/(?<!['"https?:])\/\/[^\n]*/g, '')
    // Colapsa múltiplas linhas em branco para no máximo uma
    .replace(/\n{3,}/g, '\n\n')
    .trim() + '\n';
}

// ── Entry point ─────────────────────────────────────────────────────────────

(function main() {
  fs.mkdirSync(DIST, { recursive: true });

  console.log('Construindo bundle...\n');

  let bundle;
  try {
    bundle = buildBundle();
  } catch (err) {
    console.error('ERRO ao construir bundle:', err.message);
    process.exit(1);
  }

  const devPath = path.join(DIST, 'modo-simples.js');
  fs.writeFileSync(devPath, bundle, 'utf8');
  const devKb = (Buffer.byteLength(bundle, 'utf8') / 1024).toFixed(1);
  console.log(`✓ dist/modo-simples.js       (${devKb} kB)`);

  const minified  = minify(bundle);
  const minPath   = path.join(DIST, 'modo-simples.min.js');
  fs.writeFileSync(minPath, minified, 'utf8');
  const minKb = (Buffer.byteLength(minified, 'utf8') / 1024).toFixed(1);
  console.log(`✓ dist/modo-simples.min.js   (${minKb} kB)`);

  console.log('\nBuild concluído com sucesso.');
})();
