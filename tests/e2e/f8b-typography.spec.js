import { test, expect, waitForLib, openPanel } from './helpers.js';

/**
 * F8b — sliders de tipografia (altura da linha, espaço entre palavras e letras) + Redefinir fonte.
 */
const INDEX = '/examples/index.html';
const range = (key) => `[data-range="${key}"]`;

async function boot(page) {
  await page.goto(INDEX);
  await waitForLib(page);
  await openPanel(page); // seção "Texto e leitura" já nasce aberta
}

/** Estilo computado de um elemento do host, como razão em relação ao font-size. */
const spacing = (page, sel) =>
  page.evaluate((s) => {
    const cs = getComputedStyle(document.querySelector(s));
    const fs = parseFloat(cs.fontSize);
    const px = (v) => (v === 'normal' ? 0 : parseFloat(v));
    return {
      line: cs.lineHeight === 'normal' ? 0 : parseFloat(cs.lineHeight) / fs,
      word: px(cs.wordSpacing) / fs,
      letter: px(cs.letterSpacing) / fs,
    };
  }, sel);

/** Estilo computado do título do painel (widget): não pode mudar com os sliders. */
const widgetText = (page) =>
  page.locator('#ms-a11y-title').evaluate((el) => {
    const cs = getComputedStyle(el);
    return `${cs.lineHeight}|${cs.letterSpacing}|${cs.wordSpacing}`;
  });

test.describe('F8b — tipografia', () => {
  test('sliders: rótulo PT-BR, teclado e valor falado (aria-valuetext)', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    const slider = page.locator(range('lineHeight'));
    await expect(page.getByLabel('Altura da linha')).toBeVisible();
    await expect(page.getByLabel('Espaço entre palavras')).toBeVisible();
    await expect(page.getByLabel('Espaço entre letras')).toBeVisible();
    await expect(slider).toHaveAttribute('aria-valuetext', 'Padrão do site');

    await slider.focus();
    for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveAttribute('aria-valuetext', '1,5');
    expect((await spacing(page, 'main p')).line).toBeCloseTo(1.5, 1);

    await page.keyboard.press('Home');
    await expect(slider).toHaveAttribute('aria-valuetext', 'Padrão do site');
    await page.keyboard.press('End');
    await expect(slider).toHaveAttribute('aria-valuetext', '3');
  });

  test('alcança os mínimos do WCAG 1.4.12 (1,5 / 0,16em / 0,12em)', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    const set = async (key, n) => {
      const el = page.locator(range(key));
      await el.focus();
      await page.keyboard.press('Home');
      for (let i = 0; i < n; i++) await page.keyboard.press('ArrowRight');
    };
    await set('lineHeight', 5);
    await set('wordSpacing', 8);
    await set('letterSpacing', 12);
    const s = await spacing(page, 'main p');
    expect(s.line).toBeCloseTo(1.5, 1);
    expect(s.word).toBeCloseTo(0.16, 2);
    expect(s.letter).toBeCloseTo(0.12, 2);
  });

  test('slider vence o preset textSpacing só na propriedade movida', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await page.locator('.ms-switch[data-option="textSpacing"]').click();
    const preset = await spacing(page, 'main p');
    expect(preset.line).toBeCloseTo(2, 1);
    expect(preset.letter).toBeCloseTo(0.12, 2);

    const letter = page.locator(range('letterSpacing'));
    await letter.focus();
    await page.keyboard.press('Home');
    for (let i = 0; i < 20; i++) await page.keyboard.press('ArrowRight'); // 0,2em
    const depois = await spacing(page, 'main p');
    expect(depois.letter).toBeCloseTo(0.2, 2); // slider venceu
    expect(depois.line).toBeCloseTo(2, 1); // preset continua nas demais
    expect(depois.word).toBeCloseTo(0.16, 2);

    // voltando ao padrão, o preset reassume
    await page.keyboard.press('Home');
    expect((await spacing(page, 'main p')).letter).toBeCloseTo(0.12, 2);
  });

  test('o texto do próprio widget não muda com os sliders', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    const antes = await widgetText(page);
    for (const key of ['lineHeight', 'wordSpacing', 'letterSpacing']) {
      await page.locator(range(key)).focus();
      await page.keyboard.press('End');
    }
    expect(await widgetText(page)).toBe(antes);
    await expect(page.locator('#ms-a11y-panel')).toBeVisible();
  });

  test('persiste ao recarregar; Redefinir fonte zera tamanho, fonte, preset e sliders', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await page.locator(range('wordSpacing')).focus();
    for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowRight');
    await page.reload();
    await waitForLib(page);
    expect((await spacing(page, 'main p')).word).toBeCloseTo(0.2, 2); // persistiu
    await openPanel(page);
    await page.locator('.ms-segment[data-value="150"]').click();
    await page.locator('.ms-switch[data-option="textSpacing"]').click();

    await page.locator('[data-action="reset-font"]').click();
    const s = await spacing(page, 'main p');
    expect(s.word).toBeCloseTo(0, 2);
    expect(s.letter).toBeCloseTo(0, 2);
    await expect(page.locator(range('wordSpacing'))).toHaveAttribute(
      'aria-valuetext',
      'Padrão do site',
    );
    await expect(page.locator('.ms-segment[data-value="100"]')).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(
      page.locator('.ms-switch[data-option="textSpacing"]'),
    ).toHaveAttribute('aria-checked', 'false');
  });
});
