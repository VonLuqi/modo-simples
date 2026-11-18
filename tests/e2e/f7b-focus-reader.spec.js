import { test, expect, waitForLib, openPanel } from './helpers.js';

/**
 * F7b — "Leia o foco": com a opção ligada, o elemento que recebe foco é lido em voz alta.
 * speechSynthesis é trocado por um stub que só registra o texto falado.
 */
const PAGE = '/tests/e2e/fixtures/generic.html';
const SWITCH = '[data-option="readFocus"]';

async function boot(page, { semVoz = false } = {}) {
  await page.addInitScript((sem) => {
    window.__spoken = [];
    if (sem) {
      Object.defineProperty(window, 'speechSynthesis', { value: undefined });
      return;
    }
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        speaking: false,
        cancel() {},
        speak(u) {
          window.__spoken.push(u.text);
        },
      },
    });
  }, semVoz);
  await page.goto(PAGE);
  await waitForLib(page);
  await openPanel(page);
}

const spoken = (page) => page.evaluate(() => window.__spoken);

test.describe('F7b — Leia o foco', () => {
  test('ligado: Tab até um link fala "nome, link"; desligado: silêncio', async ({
    site,
  }) => {
    const { page, errors } = site;
    await boot(page);
    await page.locator(SWITCH).click();
    await expect(page.locator(SWITCH)).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('Escape'); // fecha o painel

    await page.evaluate(() => (window.__spoken = []));
    await page.locator('nav a').first().focus();
    await page.keyboard.press('Tab');
    await expect.poll(() => spoken(page)).toContain('Contato, link');

    // desligar: nada mais é falado
    await openPanel(page);
    await page.locator(SWITCH).click();
    await expect(page.locator(SWITCH)).toHaveAttribute('aria-checked', 'false');
    await page.keyboard.press('Escape');
    await page.evaluate(() => (window.__spoken = []));
    await page.locator('nav a').first().focus();
    await page.keyboard.press('Tab');
    await page.waitForTimeout(400);
    expect(await spoken(page)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('o painel da lib também é lido (nome + papel)', async ({ site }) => {
    const { page } = site;
    await boot(page);
    await page.locator(SWITCH).click();
    await page.evaluate(() => (window.__spoken = []));
    await page.keyboard.press('Tab'); // próximo controle do painel
    await expect
      .poll(async () => (await spoken(page)).length)
      .toBeGreaterThan(0);
    const [fala] = await spoken(page);
    expect(fala).toMatch(/, (interruptor|botão|opção|campo|lista de opções)/);
  });

  test('sem speechSynthesis: opção desabilitada com o motivo', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { semVoz: true });
    await expect(page.locator(SWITCH)).toBeDisabled();
    await expect(page.locator(SWITCH)).toHaveAttribute('title', /não tem voz/);
  });
});
