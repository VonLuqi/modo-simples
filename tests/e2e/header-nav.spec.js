import { test, expect, waitForLib } from './helpers.js';

/**
 * UX-25 — cabeçalho do protótipo: em telas largas o nav fica numa linha só ("Pesquisar" não
 * quebra); em telas estreitas vira o botão "Menu" e o cabeçalho não empurra o conteúdo.
 */
const INDEX = '/examples/index.html';
const HEADER = '.site-header';
const TOGGLE = '.main-nav .nav-toggle';
const LIST = '#main-nav-list';

test.describe('nav em uma linha (largo)', () => {
  // com fonte de fallback larga (E2E_FONT) o nav recolhe por falta de espaço: é o comportamento certo
  test.skip(!!process.env.E2E_FONT, 'só vale com a fonte normal');
  test.use({ viewport: { width: 1200, height: 800 } });

  for (const largura of [1200, 1181]) {
    test(`${largura}px: itens do nav na mesma linha, sem botão Menu`, async ({
      site,
    }) => {
      const { page } = site;
      await page.setViewportSize({ width: largura, height: 800 });
      await page.goto(INDEX);
      await waitForLib(page);

      await expect(page.locator(TOGGLE)).toBeHidden();
      const tops = await page
        .locator('.main-nav li a')
        .evaluateAll((as) =>
          as.map((a) => Math.round(a.getBoundingClientRect().top)),
        );
      expect(tops).toHaveLength(7);
      expect(Math.max(...tops) - Math.min(...tops)).toBeLessThan(10);

      const pesquisar = page.locator('.header-search');
      const box = await pesquisar.boundingBox();
      expect(box.height).toBeLessThan(40); // uma linha só
    });
  }
});

test.describe('menu recolhível (estreito)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('cabeçalho ≤ 140px e conteúdo não é empurrado', async ({
    site,
  }, testInfo) => {
    const { page } = site;
    await page.goto(INDEX);
    await waitForLib(page);
    const altura = await page
      .locator(HEADER)
      .evaluate((h) => Math.round(h.getBoundingClientRect().height));
    testInfo.annotations.push({
      type: 'header-height-390',
      description: `${altura}px`,
    });
    console.log(`header 390x844: ${altura}px`);
    expect(altura).toBeLessThanOrEqual(140);
  });

  test('botão Menu: ≥44px, aria-expanded/aria-controls, abre, Esc e link fecham', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(INDEX);
    await waitForLib(page);

    const menu = page.locator(TOGGLE);
    await expect(menu).toBeVisible();
    const box = await menu.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    await expect(menu).toHaveAttribute('aria-controls', 'main-nav-list');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator(LIST)).toBeHidden();

    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator(LIST)).toBeVisible();
    const itens = await page
      .locator('.main-nav li a')
      .evaluateAll((as) => as.map((a) => a.getBoundingClientRect().height));
    for (const h of itens) expect(h).toBeGreaterThanOrEqual(44);

    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator(LIST)).toBeHidden();
    await expect(menu).toBeFocused();

    await menu.click();
    await page.locator('.main-nav a', { hasText: 'Cursos' }).click();
    await page.waitForURL(/cursos\.html/);
  });

  test('abrir o menu não muda a posição do conteúdo', async ({ site }) => {
    const { page } = site;
    await page.goto(INDEX);
    await waitForLib(page);
    const topoMain = () =>
      page
        .locator('main')
        .evaluate((m) => Math.round(m.getBoundingClientRect().top));
    const antes = await topoMain();
    await page.locator(TOGGLE).click();
    expect(await topoMain()).toBe(antes);
  });

  test('"Entrar" tem ≥44px de altura e o cabeçalho segue ≤140px', async ({
    site,
  }, testInfo) => {
    const { page } = site;
    await page.goto('/examples/cursos.html');
    await waitForLib(page);
    const entrar = page.locator('.site-header__actions .btn', {
      hasText: 'Entrar',
    });
    const box = await entrar.boundingBox();
    testInfo.annotations.push({
      type: 'entrar-height-390',
      description: `${box.height}px`,
    });
    console.log(`Entrar 390x844: ${box.height}px`);
    expect(box.height).toBeGreaterThanOrEqual(44);
    const altura = await page
      .locator(HEADER)
      .evaluate((h) => Math.round(h.getBoundingClientRect().height));
    console.log(`header com Entrar 44px: ${altura}px`);
    expect(altura).toBeLessThanOrEqual(140);
  });

  test('Tab para fora do último item fecha o menu', async ({ site }) => {
    const { page } = site;
    await page.goto(INDEX);
    await waitForLib(page);
    const menu = page.locator(TOGGLE);
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await page.locator('.main-nav li:last-child a').focus();
    await page.keyboard.press('Tab');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator(LIST)).toBeHidden();
  });

  test('redimensionar para 1200px zera aria-expanded', async ({ site }) => {
    const { page } = site;
    await page.goto(INDEX);
    await waitForLib(page);
    const menu = page.locator(TOGGLE);
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
  });
});
