/**
 * DOM de verdade (happy-dom) para testes que precisam de MutationObserver, Shadow DOM,
 * localStorage, matchMedia etc. O miniDom continua servindo aos testes simples.
 *
 * Por que happy-dom: implementa MutationObserver/attachShadow/matchMedia/localStorage
 * (o miniDom não), é só devDependency e o suíte continua no node:test.
 *
 * Uso: importe os módulos de src/ ANTES de chamar installHappy() — assim o auto-boot
 * de src/modo-simples.js (que só roda se `window` existir) não dispara no import.
 */

import { Window } from 'happy-dom';

const GLOBAL_KEYS = [
  'window',
  'document',
  'location',
  'localStorage',
  'MutationObserver',
  'ShadowRoot',
  'Node',
  'Element',
  'HTMLElement',
  'matchMedia',
  'getComputedStyle',
];

const DEFAULT_HTML =
  '<!doctype html><html lang="pt-BR"><head></head><body></body></html>';

/**
 * @param {{ html?: string, url?: string, bodyHtml?: string }} [opts]
 * @returns {{ win: any, restore: () => void, wait: (ms: number) => Promise<void> }}
 */
export function installHappy({
  html = DEFAULT_HTML,
  url = 'https://exemplo.test/',
  bodyHtml,
} = {}) {
  const win = new Window({ url });
  win.document.write(html);
  if (bodyHtml !== undefined) win.document.body.innerHTML = bodyHtml;

  const previous = {};
  for (const key of GLOBAL_KEYS) {
    previous[key] = Object.getOwnPropertyDescriptor(globalThis, key);
    const value = key === 'window' ? win : win[key];
    Object.defineProperty(globalThis, key, {
      value:
        typeof value === 'function' && key === 'matchMedia'
          ? value.bind(win)
          : value,
      configurable: true,
      writable: true,
    });
  }

  return {
    win,
    restore() {
      for (const key of GLOBAL_KEYS) {
        if (previous[key])
          Object.defineProperty(globalThis, key, previous[key]);
        else delete globalThis[key];
      }
      win.happyDOM?.close?.();
    },
    wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  };
}

/** Página-modelo: header, main com h1 + texto denso, aside e anúncio. */
export const SAMPLE_PAGE = `
  <header class="topo"><a href="/">Logo</a></header>
  <main>
    <h1>Título da página</h1>
    <p>${'Texto principal com densidade suficiente para o scorer heurístico. '.repeat(8)}</p>
  </main>
  <aside class="ad">Anúncio</aside>
`;
