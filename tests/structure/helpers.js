/**
 * Helpers para testes estruturais do protótipo (F5-T08).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Window } from 'happy-dom';

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

/** Parser HTML real (happy-dom) — substitui as regex de marcação (Q08). */
export function parseHtml(html) {
  const win = new Window();
  return new win.DOMParser().parseFromString(html, 'text/html');
}

export function hasTag(html, tag) {
  return !!parseHtml(html).querySelector(tag);
}

const MAIN_NAV = 'nav[aria-label="Menu principal"]';

export function hasMainNav(html) {
  return !!parseHtml(html).querySelector(MAIN_NAV);
}

export function extractMainNavHrefs(html) {
  const nav = parseHtml(html).querySelector(MAIN_NAV);
  if (!nav) return null;
  return [...nav.querySelectorAll('[href]')].map((el) =>
    el.getAttribute('href'),
  );
}

export function collectLocalRefs(html) {
  const refs = [];
  for (const el of parseHtml(html).querySelectorAll('[href], [src]')) {
    for (const attr of ['href', 'src']) {
      const raw = (el.getAttribute(attr) || '').trim();
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
  }
  return refs;
}

export function resolveExampleRef(pageFile, raw) {
  return path.resolve(EXAMPLES, path.dirname(pageFile), raw);
}

export function hasModoSimplesScript(html) {
  return [...parseHtml(html).querySelectorAll('script[src]')].some((el) =>
    /modo-simples(\.min)?\.js/.test(el.getAttribute('src')),
  );
}
