/**
 * Consulta várias listas de seletores com UMA varredura do DOM (IMP-37).
 *
 * Antes cada seletor fazia um querySelectorAll próprio (~23 varreduras, várias com
 * [class*=…] que percorrem a página inteira) a cada reprocess. Aqui os seletores são
 * unidos numa única consulta; o resultado já vem sem duplicatas, em ordem de documento.
 *
 * Seletor inválido derruba a consulta unida: nesse caso (raro) cai no caminho por seletor,
 * ignorando só os inválidos — mesmo comportamento de antes.
 *
 * @param {string[]} selectors
 * @returns {Element[]}
 */
export function queryAll(selectors) {
  if (!Array.isArray(selectors) || selectors.length === 0) return [];
  try {
    return Array.from(document.querySelectorAll(selectors.join(',')));
  } catch (_) {
    const found = new Set();
    for (const selector of selectors) {
      try {
        document.querySelectorAll(selector).forEach((el) => found.add(el));
      } catch (_) {
        // seletor inválido ou não suportado: ignora
      }
    }
    return [...found];
  }
}
