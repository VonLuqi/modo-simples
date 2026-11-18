import { test, expect, waitForLib, openPanel } from './helpers.js';

/**
 * Correções do QA em F8a: FAB bloqueado (mobile + texto grande), M1 (par legível),
 * M2 (links distintos) e L1 (cor do seletor livre marcada para leitor de tela).
 */
const INDEX = '/examples/index.html';
const group = (opt) => `[data-option="${opt}"]`;

async function boot(page) {
  await page.goto(INDEX);
  await waitForLib(page);
  await openPanel(page);
}

const css = (page, sel, prop) =>
  page.evaluate(
    ([s, p]) => getComputedStyle(document.querySelector(s))[p],
    [sel, prop],
  );

test.describe('FAB não fica fora da tela / bloqueado (regressão)', () => {
  test('150% + espaçamento + recarregar: sem rolagem horizontal, FAB visível e clicável', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await page.locator('.ms-segment[data-value="150"]').click();
    await page.locator('.ms-switch[data-option="textSpacing"]').click();
    await page.reload();
    await waitForLib(page);

    // a barra SIMPLES do próprio widget não pode alargar a página (empurrava o FAB para fora)
    const m = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));
    expect(m.sw).toBeLessThanOrEqual(m.cw);

    const box = await page.locator('#ms-fab').boundingBox();
    const vw = page.viewportSize();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(vw.width);
    expect(box.y + box.height).toBeLessThanOrEqual(vw.height);

    await openPanel(page); // clica no FAB: falhava com "h1 intercepts pointer events"
  });
});

test.describe('M1 — par de cores sempre legível', () => {
  test('só fundo escuro → texto claro automático; só texto claro → fundo escuro', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await page.locator('#ms-sec-colors-btn').click();
    await page
      .locator(`${group('customBg')} .ms-swatch[data-value="#000000"]`)
      .click();
    expect(await css(page, 'main p', 'color')).toBe('rgb(255, 255, 255)');
    expect(await css(page, 'body', 'backgroundColor')).toBe('rgb(0, 0, 0)');

    await page.locator(`${group('customBg')} .ms-swatch--none`).click();
    await page
      .locator(`${group('customText')} .ms-swatch[data-value="#fef08a"]`)
      .click();
    expect(await css(page, 'body', 'backgroundColor')).toBe('rgb(0, 0, 0)');
    expect(await css(page, 'main p', 'color')).toBe('rgb(254, 240, 138)');
  });

  test('par escolhido com pouco contraste mostra aviso (role=status) sem bloquear', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await page.locator('#ms-sec-colors-btn').click();
    const warn = page.locator('[data-contrast-warn]');
    await expect(warn).toHaveAttribute('role', 'status');
    await expect(warn).toBeHidden(); // vazio = sem aviso
    await page
      .locator(`${group('customBg')} .ms-swatch[data-value="#ffffff"]`)
      .click();
    await page
      .locator(`${group('customText')} .ms-swatch[data-value="#fef08a"]`)
      .click();
    await expect(warn).toBeVisible();
    await expect(warn).toContainText('Atenção: contraste baixo');
    // não bloqueou: a cor foi aplicada
    expect(await css(page, 'main p', 'color')).toBe('rgb(254, 240, 138)');
    await page
      .locator(`${group('customText')} .ms-swatch[data-value="#000000"]`)
      .click();
    await expect(warn).toBeHidden();
  });
});

test.describe('T126 — aviso do par efetivo e região viva persistente', () => {
  test('texto branco + título preto sem fundo: avisa o título; par compatível não avisa', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await page.locator('#ms-sec-colors-btn').click();
    const warn = page.locator('[data-contrast-warn]');
    await page
      .locator(`${group('customText')} .ms-swatch[data-value="#ffffff"]`)
      .click();
    await page
      .locator(`${group('customHeading')} .ms-swatch[data-value="#000000"]`)
      .click();
    await expect(warn).toBeVisible();
    await expect(warn).toContainText('Cor dos títulos');
    // não bloqueou: o título foi aplicado
    expect(await css(page, 'h1', 'color')).toBe('rgb(0, 0, 0)');

    await page
      .locator(`${group('customHeading')} .ms-swatch[data-value="#fde047"]`)
      .click();
    await expect(warn).toBeHidden();
  });

  test('a região role=status existe e não é display:none quando vazia', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await page.locator('#ms-sec-colors-btn').click();
    const warn = page.locator('[data-contrast-warn]');
    await expect(warn).toHaveAttribute('role', 'status');
    await expect(warn).toBeEmpty();
    expect(await warn.evaluate((el) => getComputedStyle(el).display)).not.toBe(
      'none',
    );
  });
});

test.describe('M2 — links distintos sob cor personalizada', () => {
  test('link ganha cor própria (≥ 4,5:1) e sublinhado, diferente do texto', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await page.locator('#ms-sec-colors-btn').click();
    await page
      .locator(`${group('customText')} .ms-swatch[data-value="#14532d"]`)
      .click();
    await page
      .locator(`${group('customBg')} .ms-swatch[data-value="#ffffff"]`)
      .click();
    expect(await css(page, 'main a', 'color')).toBe('rgb(0, 0, 204)');
    expect(await css(page, 'main a', 'textDecorationLine')).toBe('underline');
    expect(await css(page, 'main p', 'color')).toBe('rgb(20, 83, 45)');

    await page
      .locator(`${group('customBg')} .ms-swatch[data-value="#000000"]`)
      .click();
    await page
      .locator(`${group('customText')} .ms-swatch[data-value="#ffffff"]`)
      .click();
    expect(await css(page, 'main a', 'color')).toBe('rgb(147, 197, 253)');
  });

  test('sob Claro Alto Contraste + texto personalizado, o link não vira cor do texto', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await page.locator('#ms-sec-colors-btn').click();
    await page
      .locator(`${group('colorTheme')} [data-value="lightHigh"]`)
      .click();
    await page
      .locator(`${group('customText')} .ms-swatch[data-value="#14532d"]`)
      .click();
    expect(await css(page, 'main a', 'color')).not.toBe(
      await css(page, 'main p', 'color'),
    );
  });
});

test.describe('L1 — seletor livre exposto a leitor de tela', () => {
  test('cor fora dos presets marca o rádio "Personalizada"; preset volta a marcar o preset', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await page.locator('#ms-sec-colors-btn').click();
    const checked = page.locator(`${group('customBg')} [aria-checked="true"]`);
    await page.locator('input[data-picker="customBg"]').fill('#123456');
    await expect(checked).toHaveCount(1);
    await expect(checked).toHaveClass(/ms-swatch--custom/);
    await expect(checked).toHaveAttribute('aria-label', /Personalizada/);
    await expect(
      page.getByRole('radio', { name: /Cor do fundo: Personalizada/ }),
    ).toBeChecked();

    await page
      .locator(`${group('customBg')} .ms-swatch[data-value="#ffffff"]`)
      .click();
    await expect(checked).toHaveCount(1);
    await expect(checked).toHaveAttribute('data-value', '#ffffff');
    await expect(
      page.locator(`${group('customBg')} .ms-swatch--custom`),
    ).toBeHidden();
  });
});
