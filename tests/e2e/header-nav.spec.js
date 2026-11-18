import { test, expect, waitForLib } from './helpers.js';

/**
 * UX-25 — cabeçalho do protótipo: em telas largas o nav fica numa linha só ("Pesquisar" não
 * quebra); em telas estreitas vira o botão "Menu" e o cabeçalho não empurra o conteúdo.
 */
const INDEX = '/examples/index.html';
const HEADER = '.site-header';
const TOGGLE = '.main-nav .nav-toggle';
const LIST = '#main-nav-list';

test.describe('nav em telas largas: uma linha OU menu recolhido, nunca sobreposto', () => {
  test.use({ viewport: { width: 1200, height: 800 } });

  for (const largura of [1200, 1181]) {
    test(`${largura}px: itens em uma linha sem botão Menu, ou recolhido com Menu; nunca encosta em Pesquisar`, async ({
      site,
    }) => {
      const { page } = site;
      await page.setViewportSize({ width: largura, height: 800 });
      await page.goto(INDEX);
      await waitForLib(page);

      const menuVisivel = await page.locator(TOGGLE).isVisible();
      const busca = await page.locator('.header-search').boundingBox();
      expect(busca.height).toBeLessThan(60); // o botão não quebra
      if (menuVisivel) {
        // fonte larga: recolhido; a lista só aparece com o Menu aberto
        await expect(page.locator(LIST)).toBeHidden();
      } else {
        const rects = await page.locator('.main-nav li a').evaluateAll((as) =>
          as.map((a) => {
            const r = a.getBoundingClientRect();
            return { top: Math.round(r.top), right: r.right };
          }),
        );
        expect(rects).toHaveLength(7);
        const tops = rects.map((r) => r.top);
        expect(Math.max(...tops) - Math.min(...tops)).toBeLessThan(10);
        expect(Math.max(...rects.map((r) => r.right))).toBeLessThan(busca.x);
      }
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
