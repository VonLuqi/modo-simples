import { test, expect, waitForLib } from './helpers.js';

/**
 * IMP-22 — com confiança baixa a seleção manual só aplica o Modo Simples depois de confirmar.
 * Fixture com confidenceThreshold alto: sempre cai na seleção manual.
 */
const PAGE = '/tests/e2e/fixtures/manual-select.html';
const BANNER = '#ms-manual-select-banner';

const ocultos = (page) => page.locator('[data-ms-hidden="true"]');
const principais = (page) => page.locator('[data-ms-principal]');

test.describe('seleção manual (IMP-22)', () => {
  test('enquanto o usuário escolhe, nada é ocultado', async ({ site }) => {
    const { page, errors } = site;
    await page.goto(PAGE);
    await waitForLib(page);
    await page.evaluate(() => window.ModoSimples.enable());

    await expect(page.locator(BANNER)).toBeVisible();
    await expect(ocultos(page)).toHaveCount(0);
    await expect(principais(page)).toHaveCount(0);
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

  test('cancelar (botão): nada oculto, SEM principal e a página continua inteira', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(PAGE);
    await waitForLib(page);
    await page.evaluate(() => window.ModoSimples.enable());

    await page.locator(`${BANNER} button`).click();

    await expect(page.locator(BANNER)).toHaveCount(0);
    await expect(ocultos(page)).toHaveCount(0);
    await expect(principais(page)).toHaveCount(0);
    await expect(page.locator('#lateral')).toBeVisible();
    await expect(page.locator('html')).toHaveClass(/ms-ativo/);
    // sem principal, o max-width do principal não estreita a página (antes: body virava principal)
    const maxWidth = await page.evaluate(
      () => getComputedStyle(document.body).maxWidth,
    );
    expect(maxWidth).toBe('none');
  });

  test('cancelar (Esc): mesmo resultado', async ({ site }) => {
    const { page } = site;
    await page.goto(PAGE);
    await waitForLib(page);
    await page.evaluate(() => window.ModoSimples.enable());

    await page.keyboard.press('Escape');

    await expect(page.locator(BANNER)).toHaveCount(0);
    await expect(ocultos(page)).toHaveCount(0);
    await expect(principais(page)).toHaveCount(0);
  });

  test('depois de cancelar, uma mutação do host não escolhe principal sozinha', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(PAGE);
    await waitForLib(page);
    await page.evaluate(() => window.ModoSimples.enable());
    await page.locator(`${BANNER} button`).click();

    await page.evaluate(() => {
      const el = document.createElement('div');
      el.className = 'banner novo';
      el.textContent = 'slide do carrossel';
      document.body.appendChild(el);
    });
    await page.waitForTimeout(800); // > debounce (300 ms)

    await expect(principais(page)).toHaveCount(0);
    await expect(ocultos(page)).toHaveCount(0);
  });
});
