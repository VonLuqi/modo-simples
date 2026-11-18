/**
 * i18n/index.js
 *
 * Idioma da UI (pt | en | es). t(key, vars) busca no locale atual → pt → a própria chave.
 * O locale começa em 'pt'; quem sobe a biblioteca chama setLocale(preferência salva), onde
 * 'auto' = html[lang] do site → navigator.language → 'pt'.
 */

import * as pt from './pt.js';
import * as en from './en.js';
import * as es from './es.js';

export const SUPPORTED = Object.freeze(['pt', 'en', 'es']);

/** Tag BCP 47 de cada locale (lang do <html>, voz, Intl). */
export const BCP47 = Object.freeze({ pt: 'pt-BR', en: 'en-US', es: 'es-ES' });

const LOCALES = { pt, en, es };

let current = 'pt';

/** 'pt-BR' / 'en_US' / 'ES' → 'pt' | 'en' | 'es' | null */
function toSupported(tag) {
  const primary = String(tag || '')
    .toLowerCase()
    .split(/[-_]/)[0];
  return SUPPORTED.includes(primary) ? primary : null;
}

/**
 * Resolve a preferência ('auto' | 'pt' | 'en' | 'es') para um locale suportado.
 * 'auto': html[lang] → navigator.language → 'pt'. Valor desconhecido conta como 'auto'.
 * @param {string} [pref]
 * @returns {'pt'|'en'|'es'}
 */
export function resolveLocale(pref = 'auto') {
  if (SUPPORTED.includes(pref)) return pref;
  const htmlLang =
    typeof document !== 'undefined' && document.documentElement
      ? document.documentElement.getAttribute('lang')
      : null;
  const navLang = typeof navigator !== 'undefined' ? navigator.language : null;
  return toSupported(htmlLang) || toSupported(navLang) || 'pt';
}

/** @returns {'pt'|'en'|'es'} */
export function getLocale() {
  return current;
}

/**
 * Define o idioma e avisa a UI com 'ms:localechange' no document (detail: { locale, preference }).
 * @param {string} pref 'auto' | 'pt' | 'en' | 'es'
 * @returns {'pt'|'en'|'es'} locale efetivo
 */
export function setLocale(pref = 'auto') {
  current = resolveLocale(pref);
  if (typeof document !== 'undefined') {
    // CustomEvent da janela do próprio document (happy-dom exige o construtor dela)
    const Ev = document.defaultView?.CustomEvent ?? CustomEvent;
    document.dispatchEvent(
      new Ev('ms:localechange', {
        detail: { locale: current, preference: pref },
      }),
    );
  }
  return current;
}

const lookup = (locale, key) =>
  LOCALES[locale].STRINGS[key] ?? LOCALES[locale].VOICE_CMD_STRINGS[key];

/**
 * Texto da UI no locale atual. Fallback: pt → a própria chave. `{nome}` é trocado por vars.nome.
 * @param {string} key
 * @param {Record<string, string|number>} [vars]
 * @returns {string}
 */
export function t(key, vars) {
  let text = lookup(current, key) ?? lookup('pt', key) ?? key;
  if (vars) {
    text = text.replace(/\{(\w+)\}/g, (m, name) =>
      name in vars ? String(vars[name]) : m,
    );
  }
  return text;
}

/** Atalhos do teclado no locale atual (mesma ordem e teclas em todos os locales). */
export function getShortcuts() {
  return LOCALES[current].SHORTCUTS;
}
