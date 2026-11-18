/**
 * Setup dos testes unitários (carregado com `node --import` por scripts/test.cjs).
 * Fixa navigator.language em pt-BR: o idioma 'auto' cai no navegador quando a página não tem
 * lang, e o navegador da máquina/CI (ex.: en-US) não pode mudar os textos esperados em PT.
 */

if (typeof globalThis.navigator === 'object' && globalThis.navigator) {
  const proto = Object.getPrototypeOf(globalThis.navigator);
  for (const [key, value] of [
    ['language', 'pt-BR'],
    ['languages', ['pt-BR', 'pt']],
  ]) {
    Object.defineProperty(proto, key, {
      get: () => value,
      configurable: true,
    });
  }
}
