import { test, expect, waitForLib, openPanel } from './helpers.js';

/**
 * F8a — monocromático, claro alto contraste, saturação baixa/alta e cor personalizada.
 * Garante também que filtros de cor nunca quebram o widget (fixed + legível).
 */
const INDEX = '/examples/index.html';
const FAB = '#ms-fab';
const PANEL = '#ms-a11y-panel';
const group = (opt) => `[data-option="${opt}"]`;

async function boot(page) {
  await page.goto(INDEX);
  await waitForLib(page);
  await openPanel(page);
  await page.locator('#ms-sec-colors-btn').click(); // seção Cores e destaque
}

const htmlHas = (page, cls) =>
  page.evaluate((c) => document.documentElement.classList.contains(c), cls);

/** Cor (computed) de um elemento da página do host. */
const colorOf = (page, sel, prop = 'color') =>
  page.evaluate(
    ([s, p]) => getComputedStyle(document.querySelector(s))[p],
    [sel, prop],
  );

test.describe('F8a — cor', () => {
  test('temas Monocromático e Claro Alto Contraste aplicam e persistem', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await page.locator(`${group('colorTheme')} [data-value="mono"]`).click();
    expect(await htmlHas(page, 'ms-theme-mono')).toBe(true);
    expect(
      await page.evaluate(
        () => getComputedStyle(document.documentElement).filter,
      ),
    ).toContain('grayscale');

    await page
      .locator(`${group('colorTheme')} [data-value="lightHigh"]`)
      .click();
    expect(await htmlHas(page, 'ms-theme-lightHigh')).toBe(true);
    expect(await htmlHas(page, 'ms-theme-mono')).toBe(false);
    expect(await colorOf(page, 'body', 'backgroundColor')).toBe(
      'rgb(255, 255, 255)',
    );
    expect(await colorOf(page, 'body')).toBe('rgb(0, 0, 0)');

    await page.reload();
    await waitForLib(page);
    expect(await htmlHas(page, 'ms-theme-lightHigh')).toBe(true);
  });

  test('saturação baixa/alta liga filtro no <html>; normal remove', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    const filter = () =>
      page.evaluate(() => getComputedStyle(document.documentElement).filter);
    await page
      .locator(`${group('colorSaturation')} [data-value="low"]`)
      .click();
    expect(await filter()).toBe('saturate(0.5)');
    await page
      .locator(`${group('colorSaturation')} [data-value="high"]`)
      .click();
    expect(await filter()).toBe('saturate(1.8)');
    await page
      .locator(`${group('colorSaturation')} [data-value="normal"]`)
      .click();
    expect(await filter()).toBe('none');
  });

  test('widget continua fixo, no mesmo lugar e legível sob mono + saturação alta', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(INDEX);
    await waitForLib(page);
    const fab = page.locator(FAB);
    const antes = await fab.boundingBox();
    await openPanel(page);
    await page.locator('#ms-sec-colors-btn').click();
    const titleColor = () =>
      page.locator('#ms-a11y-title').evaluate((el) => {
        const cs = getComputedStyle(el);
        return `${cs.color}|${cs.opacity}|${cs.fontSize}`;
      });
    const tituloAntes = await titleColor();
    await page
      .locator(`${group('colorSaturation')} [data-value="high"]`)
      .click();
    await page.locator(`${group('colorTheme')} [data-value="mono"]`).click();

    // fixed + mesma posição (rolar a página não o move)
    expect(
      await fab.evaluate(
        () =>
          getComputedStyle(document.querySelector('#ms-container')).position,
      ),
    ).toBe('fixed');
    await page.evaluate(() => window.scrollTo(0, 600));
    const depois = await fab.boundingBox();
    expect(depois.x).toBeCloseTo(antes.x, 0);
    expect(depois.y).toBeCloseTo(antes.y, 0);
    const vp = page.viewportSize();
    expect(depois.x + depois.width).toBeLessThanOrEqual(vp.width);
    expect(depois.y + depois.height).toBeLessThanOrEqual(vp.height);

    // legível: o tema da página não altera texto/opacidade/tamanho do painel
    await expect(page.locator(PANEL)).toBeVisible();
    expect(await titleColor()).toBe(tituloAntes);
    const box = await page.locator('#ms-a11y-title').boundingBox();
    expect(box.width).toBeGreaterThan(40);
    expect(box.height).toBeGreaterThan(10);
  });

  test('cor personalizada: texto, títulos e fundo (preset + seletor livre)', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    const sw = (opt, hex) =>
      page.locator(`${group(opt)} .ms-swatch[data-value="${hex}"]`);

    await sw('customText', '#14532d').click();
    expect(await colorOf(page, 'main p')).toBe('rgb(20, 83, 45)');
    await sw('customHeading', '#7f1d1d').click();
    expect(await colorOf(page, 'h1')).toBe('rgb(127, 29, 29)'); // título ≠ texto
    await sw('customBg', '#fffbe6').click();
    expect(await colorOf(page, 'body', 'backgroundColor')).toBe(
      'rgb(255, 251, 230)',
    );

    // seletor livre
    await page.locator('input[data-picker="customBg"]').fill('#123456');
    expect(await colorOf(page, 'body', 'backgroundColor')).toBe(
      'rgb(18, 52, 86)',
    );

    // estado selecionado visível e anunciado no painel
    await expect(page.locator('[data-state-for="customText"]')).toHaveText(
      '#14532d',
    );

    // "Padrão do site" remove só a escolha do texto; com fundo escuro escolhido o texto vira o automático (M1)
    await page.locator(`${group('customText')} .ms-swatch--none`).click();
    expect(await colorOf(page, 'main p')).toBe('rgb(255, 255, 255)');
    expect(await htmlHas(page, 'ms-custom-heading')).toBe(true);

    // persiste
    await page.reload();
    await waitForLib(page);
    expect(await colorOf(page, 'h1')).toBe('rgb(127, 29, 29)');
  });

  test('widget não herda a cor personalizada da página', async ({ site }) => {
    const { page } = site;
    await boot(page);
    const cor = () =>
      page
        .locator('#ms-a11y-title')
        .evaluate((el) => getComputedStyle(el).color);
    const antes = await cor();
    await page
      .locator(`${group('customText')} .ms-swatch[data-value="#ffffff"]`)
      .click();
    await page
      .locator(`${group('customBg')} .ms-swatch[data-value="#ffffff"]`)
      .click();
    expect(await cor()).toBe(antes);
  });

  test('teclado: setas nos swatches movem e selecionam; Desligar tudo zera', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    const none = page.locator(`${group('customText')} .ms-swatch--none`);
    await none.focus();
    await page.keyboard.press('ArrowRight');
    const primeiro = page.locator(`${group('customText')} .ms-swatch`).nth(1);
    await expect(primeiro).toBeFocused();
    await expect(primeiro).toHaveAttribute('aria-checked', 'true');
    expect(await htmlHas(page, 'ms-custom-text')).toBe(true);

    await page
      .locator(`${group('colorSaturation')} [data-value="low"]`)
      .click();
    await page.locator('[data-action="reset-all"]').click();
    for (const c of ['ms-custom-text', 'ms-sat-low', 'ms-theme-mono'])
      expect(await htmlHas(page, c)).toBe(false);
    expect(
      await page.evaluate(() =>
        document.documentElement.style.getPropertyValue('--ms-custom-text'),
      ),
    ).toBe('');
  });
});
