/**
 * scripts/gen-styles.cjs
 *
 * Concatena src/ui/css/ui/*.css e src/ui/css/page/*.css (ordem alfabética do nome)
 * em src/ui/styles.generated.js. O CSS fica em arquivos .css; o JS gerado exporta as
 * strings, para que o entry ESM e os testes continuem importando src/ direto (sem loader).
 *
 *   node scripts/gen-styles.cjs          grava o módulo
 *   node scripts/gen-styles.cjs --check  falha (exit 1) se o módulo commitado estiver defasado
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CSS_DIR = path.join(ROOT, 'src', 'ui', 'css');
const OUT = path.join(ROOT, 'src', 'ui', 'styles.generated.js');

function bundle(dir) {
  const d = path.join(CSS_DIR, dir);
  const css = fs
    .readdirSync(d)
    .filter((f) => f.endsWith('.css'))
    .sort()
    .map((f) => fs.readFileSync(path.join(d, f), 'utf8'))
    .join('');
  if (/[`\\]|\$\{/.test(css)) {
    throw new Error(
      `${dir}: CSS não pode conter crase, barra invertida ou \${`,
    );
  }
  // mesmo formato do antigo template literal: "\n" + linhas + indent de fechamento
  return `\n${css}  `;
}

const out = `/* GENERATED - edit src/ui/css, then run: node scripts/gen-styles.cjs */

export const UI_CSS = \`${bundle('ui')}\`;

export const PAGE_CSS = \`${bundle('page')}\`;
`;

if (process.argv.includes('--check')) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (cur !== out) {
    console.error(
      'src/ui/styles.generated.js defasado: rode node scripts/gen-styles.cjs',
    );
    process.exit(1);
  }
  console.log('styles.generated.js em dia');
} else {
  fs.writeFileSync(OUT, out);
  console.log('✓ src/ui/styles.generated.js');
}
