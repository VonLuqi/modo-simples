/**
 * scripts/bundle.cjs
 *
 * Build via esbuild (IIFE, target ES2018) for distribuição.
 * Produz:
 *   dist/modo-simples.js
 *   dist/modo-simples.min.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const ENTRY = path.join(ROOT, 'src', 'modo-simples.js');

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

const banner = `/*! ${pkg.name} v${pkg.version} | ${pkg.license || 'MIT'} | ${pkg.description || ''} */`;

async function build() {
  fs.mkdirSync(DIST, { recursive: true });
  console.log('Construindo bundle (esbuild, target es2018)...\n');

  const shared = {
    entryPoints: [ENTRY],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2018'],
    banner: { js: banner },
    logLevel: 'warning',
  };

  await esbuild.build({
    ...shared,
    outfile: path.join(DIST, 'modo-simples.js'),
    minify: false,
  });

  await esbuild.build({
    ...shared,
    outfile: path.join(DIST, 'modo-simples.min.js'),
    minify: true,
  });

  // Vercel output (D2): publica só index.html, examples/ e dist/ — nada de doc/, tests/, scripts/…
  const PUBLIC = path.join(ROOT, 'public');
  fs.rmSync(PUBLIC, { recursive: true, force: true });
  fs.mkdirSync(PUBLIC, { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'index.html'), path.join(PUBLIC, 'index.html'));
  fs.cpSync(path.join(ROOT, 'examples'), path.join(PUBLIC, 'examples'), { recursive: true });
  fs.cpSync(DIST, path.join(PUBLIC, 'dist'), { recursive: true });
  console.log('✓ public/ (index.html, examples/, dist/) — saída do deploy Vercel');

  const devKb = (fs.statSync(path.join(DIST, 'modo-simples.js')).size / 1024).toFixed(1);
  const minKb = (fs.statSync(path.join(DIST, 'modo-simples.min.js')).size / 1024).toFixed(1);
  console.log(`✓ dist/modo-simples.js       (${devKb} kB)`);
  console.log(`✓ dist/modo-simples.min.js   (${minKb} kB)`);
  console.log('\nBuild concluído com sucesso.');
}

build().catch((err) => {
  console.error('ERRO ao construir bundle:', err.message);
  process.exit(1);
});
