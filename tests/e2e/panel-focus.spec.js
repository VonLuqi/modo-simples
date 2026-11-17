import { test, expect, waitForLib, openPanel } from './helpers.js';

/**
 * UX-12 — ao fechar o painel (botão X, clique fora ou Esc) o foco volta a quem o abriu
 * (FAB ou ícone do chrome). Antes só o Esc devolvia o foco, e sempre ao FAB.
 */
const INDEX = '/examples/index.html';
const PANEL = '#ms-a11y-panel';

async function abrirPeloFab(page) {
  await page.goto(INDEX);
  await waitForLib(page);
  await openPanel(page);
}

test.describe('foco volta ao opener ao fechar o painel (UX-12)', () => {
  test('botão X → FAB', async ({ site }) => {
    const { page } = site;
    await abrirPeloFab(page);
    await page.locator('.ms-a11y-close').click();
    await expect(page.locator(PANEL)).toBeHidden();
    await expect(page.locator('#ms-fab')).toBeFocused();
  });

  test('Esc → FAB', async ({ site }) => {
    const { page } = site;
    await abrirPeloFab(page);
    await page.keyboard.press('Escape');
    await expect(page.locator(PANEL)).toBeHidden();
    await expect(page.locator('#ms-fab')).toBeFocused();
  });

  test('clique fora → FAB', async ({ site }) => {
    const { page } = site;
    await abrirPeloFab(page);
    await page.mouse.click(5, 5);
    await expect(page.locator(PANEL)).toBeHidden();
    await expect(page.locator('#ms-fab')).toBeFocused();
  });

  test('aberto pelo ícone do chrome: Esc e X devolvem o foco ao ícone, não ao FAB', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(INDEX);
    await waitForLib(page);
    const icone = page.locator('[data-action="open-panel"]');
    if (!(await icone.isVisible()))
      test.skip(true, 'sem ícone visível neste viewport');

    await icone.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator(PANEL)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator(PANEL)).toBeHidden();
    await expect(icone).toBeFocused();

    await icone.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator(PANEL)).toBeVisible();
    await page.locator('.ms-a11y-close').click();
    await expect(icone).toBeFocused();
  });
});
