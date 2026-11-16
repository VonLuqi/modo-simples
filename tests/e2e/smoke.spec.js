import { readdirSync } from 'node:fs';
import { test, expect, waitForLib } from './helpers.js';

const EXAMPLES = readdirSync(new URL('../../examples', import.meta.url))
  .filter((f) => f.endsWith('.html'))
  .sort();

const GENERIC = '/tests/e2e/fixtures/generic.html';

// Erros conhecidos de páginas do protótipo (rastreados; o Playwright acusa quando passam).
const KNOWN_PAGE_ERRORS = {
  // examples/hello-modo-simples.html:87 chama window.ModoSimples.configure(...) logo após o
  // <script> da lib, mas o boot só acontece em DOMContentLoaded (modo-simples.js:561-565):
  // window.ModoSimples ainda é undefined. Corrigir a página (esperar DOMContentLoaded)
  // ou o boot (iniciar já quando o DOM permitir).
  'hello-modo-simples.html':
    'configure() chamado antes do boot (hello-modo-simples.html:87)',
};

test.describe('examples/*.html carregam o bundle sem erro (IMP-49)', () => {
  for (const file of EXAMPLES) {
    test(file, async ({ site }) => {
      if (KNOWN_PAGE_ERRORS[file]) test.fail(true, KNOWN_PAGE_ERRORS[file]);
      const { page, errors } = site;
      await page.goto(`/examples/${file}`);
      await waitForLib(page);
      await expect(page.locator('#ms-fab')).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  test('há pelo menos as 9 páginas do protótipo', () => {
    expect(EXAMPLES.length).toBeGreaterThanOrEqual(9);
  });
});

test.describe('host genérico (sem ModoSimplesConfig)', () => {
  test('só FAB + painel; nenhuma requisição externa no init', async ({
    site,
  }) => {
    const { page, errors, external } = site;
    await page.goto(GENERIC);
    await waitForLib(page);

    await expect(page.locator('#ms-fab')).toBeVisible();
    await expect(page.locator('#ms-a11y-panel')).toBeHidden();
    // barra de sessão é opt-in: não entra no DOM do host
    await expect(page.locator('#ms-session-bar')).toHaveCount(0);
    await expect(page.locator('#ms-simples-chrome')).toHaveCount(0);

    expect(external, 'nenhum pedido a terceiros no init').toEqual([]);
    expect(errors).toEqual([]);
  });

  test('painel genérico não exibe marca do protótipo', async ({ site }) => {
    const { page } = site;
    await page.goto(GENERIC);
    await waitForLib(page);
    const texto = await page.locator('#ms-a11y-panel').textContent();
    expect(texto).not.toMatch(/senac|projeto integrador/i);
  });
});
