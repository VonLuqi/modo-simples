import { test, expect, waitForLib } from './helpers.js';

/**
 * IMP-22 — com confiança baixa a seleção manual só aplica o Modo Simples depois de confirmar.
 * Fixture com confidenceThreshold alto: sempre cai na seleção manual.
 */
const PAGE = '/tests/e2e/fixtures/manual-select.html';
const BANNER = '#ms-manual-select-banner';

const ocultos = (page) => page.locator('[data-ms-hidden="true"]');

test.describe('seleção manual (IMP-22)', () => {
  test('enquanto o usuário escolhe, nada é ocultado', async ({ site }) => {
    const { page, errors } = site;
    await page.goto(PAGE);
    await waitForLib(page);
    await page.evaluate(() => window.ModoSimples.enable());

    await expect(page.locator(BANNER)).toBeVisible();
    await expect(ocultos(page)).toHaveCount(0);
    await expect(page.locator('#lateral')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('confirmar: oculta em volta da escolha e fecha o banner', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(PAGE);
    await waitForLib(page);
    await page.evaluate(() => window.ModoSimples.enable());

    // #alvo (não <main>): no mobile o banner fixo cobre o centro da página curta
    await page.locator('#alvo').click();

    await expect(page.locator(BANNER)).toHaveCount(0);
    await expect(page.locator('#alvo')).toHaveAttribute(
      'data-ms-principal',
      '',
    );
    await expect(page.locator('#lateral')).toBeHidden();
    await expect(page.locator('header.topo')).toBeHidden();
  });

  test('cancelar (botão): nada fica oculto e a página continua inteira', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(PAGE);
    await waitForLib(page);
    await page.evaluate(() => window.ModoSimples.enable());

    await page.locator(`${BANNER} button`).click();

    await expect(page.locator(BANNER)).toHaveCount(0);
    await expect(ocultos(page)).toHaveCount(0);
    await expect(page.locator('#lateral')).toBeVisible();
    await expect(page.locator('html')).toHaveClass(/ms-ativo/);
  });

  test('cancelar (Esc): mesmo resultado', async ({ site }) => {
    const { page } = site;
    await page.goto(PAGE);
    await waitForLib(page);
    await page.evaluate(() => window.ModoSimples.enable());

    await page.keyboard.press('Escape');

    await expect(page.locator(BANNER)).toHaveCount(0);
    await expect(ocultos(page)).toHaveCount(0);
  });
});
