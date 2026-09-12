/**
 * Helpers para testes estruturais do protótipo (F5-T08).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const ROOT = path.resolve(__dirname, '../..');
export const EXAMPLES = path.join(ROOT, 'examples');

export const MAP_PAGES = [
  'index.html',
  'sobrenos.html',
  'cursos.html',
  'psg.html',
  'unidades.html',
  'contato.html',
  'aluno.html',
  'pesquisa.html',
];

export const EXPECTED_NAV = [...MAP_PAGES];

export const CANONICAL_CSS = ['tokens.css', 'shell.css', 'pages.css'];

export function readPage(file) {
  const full = path.join(EXAMPLES, file);
  return {
    full,
    exists: fs.existsSync(full),
    html: fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : '',
  };
}

export function hasTag(html, tag) {
  return new RegExp(`<${tag}\\b`, 'i').test(html);
}

export function extractMainNavHrefs(html) {
  const navMatch = html.match(
    /<nav[^>]*aria-label=["']Menu principal["'][^>]*>([\s\S]*?)<\/nav>/i,
  );
  if (!navMatch) return null;
  const hrefs = [];
  const re = /href=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(navMatch[1]))) {
    hrefs.push(m[1]);
  }
  return hrefs;
}

export function collectLocalRefs(html) {
  const refs = [];
  const re = /\b(?:href|src)=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    const raw = m[1].trim();
    if (
      !raw ||
      raw.startsWith('#') ||
      raw.startsWith('mailto:') ||
      raw.startsWith('tel:') ||
      raw.startsWith('http://') ||
      raw.startsWith('https://') ||
      raw.startsWith('data:')
    ) {
      continue;
    }
    refs.push(raw);
  }
  return refs;
}

export function resolveExampleRef(pageFile, raw) {
  return path.resolve(EXAMPLES, path.dirname(pageFile), raw);
}

export function hasModoSimplesScript(html) {
  return (
    html.includes('modo-simples.js') || html.includes('modo-simples.min.js')
  );
}
