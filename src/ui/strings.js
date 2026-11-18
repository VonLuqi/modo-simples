/**
 * ui/strings.js
 *
 * Mantido para os imports existentes: reexporta o locale base (pt) de i18n/pt.js.
 * Texto por idioma: t(key) em i18n/index.js.
 */

export { STRINGS, SHORTCUTS, VOICE_CMD_STRINGS } from '../i18n/pt.js';

import { t } from '../i18n/index.js';

/**
 * Textos no idioma atual, lidos na hora do uso (S.chave === t('chave')). Os consumidores de
 * src/ui usam este objeto no lugar de STRINGS (fixo em pt) para acompanhar o idioma.
 */
export const STRINGS_T = new Proxy(
  {},
  { get: (_, k) => (typeof k === 'string' ? t(k) : undefined) },
);
