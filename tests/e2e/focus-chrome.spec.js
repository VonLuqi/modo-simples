import { test, expect, waitForLib } from './helpers.js';

/**
 * UX-09 (QA R34 HIGH-1) — no protótipo real o switch SIMPLES muda de pai (header ↔ pills)
 * e o foco precisa continuar nele, ao ligar e ao desligar. Só um browser prova isso: o nav
 * de destino fica display:none até o <html> ganhar ms-ativo.
 */
const INDEX = '/examples/index.html';
const SWITCH = '[data-action="toggle-simples"]';

test('o foco fica no switch SIMPLES ao ligar e ao desligar (Enter)', async ({
  site,
}) => {
  const { page } = site;
  await page.goto(INDEX);
  await waitForLib(page);

  const sw = page.locator(SWITCH);
  await sw.focus();
  await expect(sw).toBeFocused();

  await page.keyboard.press('Enter'); // liga
  await expect(page.locator('html')).toHaveClass(/ms-ativo/);
  await expect(
    page.locator('.ms-pills-nav__inner').locator(SWITCH),
  ).toHaveCount(1);
  await expect(sw).toBeFocused();

  await page.keyboard.press('Enter'); // desliga
  await expect(page.locator('html')).not.toHaveClass(/ms-ativo/);
  await expect(sw).toBeFocused();
});
