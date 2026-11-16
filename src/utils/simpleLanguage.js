/**
 * utils/simpleLanguage.js
 *
 * "Linguagem Simples" só tem efeito onde o host trouxe markup duplo:
 * [data-ms-plain] (texto padrão) e [data-ms-simple] (versão simples).
 * Sem esses pares nenhum texto é trocado, então a UI não deve prometer simplificação.
 */

/**
 * @returns {boolean} true se a página tem ao menos um par plain/simple
 */
export function hasSimpleLanguagePairs() {
  if (typeof document === 'undefined') return false;
  return !!(
    document.querySelector('[data-ms-plain]') &&
    document.querySelector('[data-ms-simple]')
  );
}
