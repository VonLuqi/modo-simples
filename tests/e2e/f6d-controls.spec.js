import { test, expect, waitForLib, openPanel } from './helpers.js';

/**
 * F6d — Desligar tudo, mover painel E/D, esconder widget (X no FAB), atalho Alt+Shift+A.
 */
const INDEX = '/examples/index.html';
const PANEL = '#ms-a11y-panel';
const FAB = '#ms-fab';

async function boot(page) {
  await page.goto(INDEX);
  await waitForLib(page);
}

test.describe('F6d — controles do painel/widget', () => {
  test('mover painel: FAB e painel vão para a esquerda e o lado persiste', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await openPanel(page);
    await page.locator('[data-action="move-side"]').click();
    const fabBox = await page.locator(FAB).boundingBox();
    const vw = page.viewportSize().width;
    expect(fabBox.x).toBeLessThan(vw / 2);
    await page.reload();
    await waitForLib(page);
    const after = await page.locator(FAB).boundingBox();
    expect(after.x).toBeLessThan(vw / 2);
  });

  test('X esconde o FAB só nesta página; recarregar traz de volta', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    const hide = page.locator('.ms-fab-hide');
    const box = await hide.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(24);
    expect(box.height).toBeGreaterThanOrEqual(24);
    await hide.click();
    await expect(page.locator(FAB)).toBeHidden();
    await page.reload();
    await waitForLib(page);
    await expect(page.locator(FAB)).toBeVisible();
  });

  test('Alt+Shift+A reexibe o FAB e abre o painel com foco dentro dele', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await page.locator('.ms-fab-hide').click();
    await expect(page.locator(FAB)).toBeHidden();
    await page.keyboard.press('Alt+Shift+KeyA');
    await expect(page.locator(FAB)).toBeVisible();
    await expect(page.locator(PANEL)).toBeVisible();
    await expect(page.locator('.ms-a11y-close')).toBeFocused();
  });

  test('Desligar tudo zera opções e Modo Simples', async ({ site }) => {
    const { page } = site;
    await boot(page);
    await openPanel(page);
    await page.locator('[data-action="modo-simples"]').click();
    await page.locator('.ms-segment[data-value="150"]').click();
    await page.locator('[data-action="reset-all"]').click();
    await expect(page.locator('[data-action="modo-simples"]')).toHaveAttribute(
      'aria-checked',
      'false',
    );
    await expect(page.locator('.ms-segment[data-value="100"]')).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(page.locator('html')).not.toHaveClass(/ms-ativo/);
  });
});
