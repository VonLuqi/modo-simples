import { test, expect, waitForLib, openPanel } from './helpers.js';

/**
 * F9a — "Ferramentas de página": Destacar cabeçalhos, Destacar botões e campos, Ampliar botões.
 */
const PAGE = '/tests/e2e/fixtures/page-tools.html';

async function boot(page) {
  await page.goto(PAGE);
  await waitForLib(page);
  await openPanel(page);
  const sec = page.locator('#ms-sec-pageTools-btn');
  if ((await sec.getAttribute('aria-expanded')) !== 'true') await sec.click();
}

const on = (page, option) => page.locator(`[data-option="${option}"]`).click();
const outline = (page, sel) =>
  page.evaluate(
    (s) => getComputedStyle(document.querySelector(s)).outlineStyle,
    sel,
  );
const shadow = (page, sel) =>
  page.evaluate(
    (s) => getComputedStyle(document.querySelector(s)).boxShadow,
    sel,
  );
const box = (page, sel) =>
  page.evaluate((s) => {
    const r = document.querySelector(s).getBoundingClientRect();
    return { w: r.width, h: r.height };
  }, sel);

test.describe('F9a — Ferramentas de página', () => {
  test('seção traz os 3 toggles, desligados por padrão', async ({ site }) => {
    const { page } = site;
    await boot(page);
    await expect(page.locator('#ms-sec-pageTools-btn')).toContainText(
      'Ferramentas de página',
    );
    for (const o of [
      'highlightHeadings',
      'highlightControls',
      'enlargeTargets',
    ]) {
      await expect(page.locator(`[data-option="${o}"]`)).toHaveAttribute(
        'aria-checked',
        'false',
      );
    }
  });

  test('Destacar cabeçalhos: h1 e [role=heading]; botões/campos não mudam', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    expect(await outline(page, '#h')).toBe('none');
    await on(page, 'highlightHeadings');
    expect(await outline(page, '#h')).toBe('solid');
    expect(await outline(page, '#rh')).toBe('solid');
    expect(await outline(page, '#btn')).toBe('none');
    expect(await outline(page, '#p')).toBe('none');
    await on(page, 'highlightHeadings');
    expect(await outline(page, '#h')).toBe('none');
  });

  test('Destacar botões e campos: button/input; títulos e links não mudam', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await on(page, 'highlightControls');
    expect(await shadow(page, '#btn')).not.toBe('none');
    expect(await shadow(page, '#fld')).not.toBe('none');
    expect(await outline(page, '#h')).toBe('none');
    expect(await outline(page, '#lnk')).toBe('none');
  });

  test('Ampliar botões: alvos da página ≥ 44px; painel e FAB intactos', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    const fabSize = async () => {
      // espera a animação do FAB acabar: medida determinística
      await page
        .locator('#ms-fab')
        .evaluate((el) =>
          Promise.all(el.getAnimations().map((a) => a.finished)),
        );
      return page.locator('#ms-fab').boundingBox();
    };
    const fabAntes = await fabSize();
    expect((await box(page, '#btn')).h).toBeLessThan(44);
    await on(page, 'enlargeTargets');
    for (const s of ['#btn', '#lnk', '#fld']) {
      const b = await box(page, s);
      expect(b.w, s).toBeGreaterThanOrEqual(44);
      expect(b.h, s).toBeGreaterThanOrEqual(44);
    }
    expect(await fabSize()).toEqual(fabAntes);
    await expect(page.locator('#ms-a11y-panel')).toBeVisible();
    await on(page, 'enlargeTargets');
    expect((await box(page, '#btn')).h).toBeLessThan(44);
  });

  test('persistem ao recarregar e "Desligar tudo" zera', async ({ site }) => {
    const { page } = site;
    await boot(page);
    await on(page, 'highlightHeadings');
    await on(page, 'highlightControls');
    await on(page, 'enlargeTargets');
    await page.reload();
    await waitForLib(page);
    expect(await outline(page, '#h')).toBe('solid');
    expect(await shadow(page, '#btn')).not.toBe('none');
    expect((await box(page, '#btn')).h).toBeGreaterThanOrEqual(44);

    await openPanel(page);
    await page.locator('[data-action="reset-all"]').click();
    expect(await outline(page, '#h')).toBe('none');
    expect(await shadow(page, '#btn')).toBe('none');
    expect((await box(page, '#btn')).h).toBeLessThan(44);
    await page.reload();
    await waitForLib(page);
    expect(await outline(page, '#h')).toBe('none');
  });

  test('QA M2: link no meio do texto fica em linha e quebra; a 390px com texto 175% não estoura a largura', async ({
    site,
  }) => {
    const { page } = site;
    await page.setViewportSize({ width: 390, height: 844 });
    await boot(page);
    await page.addStyleTag({ content: 'html { font-size: 175% !important; }' });
    await on(page, 'enlargeTargets');
    await page.keyboard.press('Escape');
    const m = await page.evaluate(() => {
      const a = document.getElementById('inl');
      const rects = [...a.getClientRects()];
      const de = document.documentElement;
      return {
        display: getComputedStyle(a).display,
        minH: getComputedStyle(a).minHeight,
        lines: rects.length,
        maxH: Math.max(...rects.map((r) => r.height)),
        scrollW: de.scrollWidth,
        clientW: de.clientWidth,
      };
    });
    expect(m.display).toBe('inline');
    expect(m.minH).toBe('0px');
    expect(m.lines).toBeGreaterThan(1);
    expect(m.maxH).toBeLessThan(44);
    expect(m.scrollW).toBeLessThanOrEqual(m.clientW);
  });

  test('QA M2: link solto (lista de menu) segue com 44px', async ({ site }) => {
    const { page } = site;
    await boot(page);
    await on(page, 'enlargeTargets');
    const b = await box(page, '#navlnk');
    expect(b.w).toBeGreaterThanOrEqual(44);
    expect(b.h).toBeGreaterThanOrEqual(44);
    expect((await box(page, '#lnk')).h).toBeGreaterThanOrEqual(44);
  });

  test('QA M3: com o destaque ligado, o foco por teclado segue distinguível do destaque', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await on(page, 'highlightControls');
    await page.keyboard.press('Escape');
    const state = () =>
      page.evaluate(() => {
        const cs = getComputedStyle(document.getElementById('btn'));
        return { outline: cs.outlineStyle, shadow: cs.boxShadow };
      });
    const parado = await state();
    expect(parado.shadow).not.toBe('none'); // destaque visível
    expect(parado.outline).toBe('none');
    await page.locator('#lnk').focus();
    await page.keyboard.press('Tab'); // foco por teclado no #btn
    await expect(page.locator('#btn')).toBeFocused();
    const focado = await state();
    expect(focado.shadow).toBe(parado.shadow); // destaque continua
    expect(focado.outline).not.toBe('none'); // e o anel de foco aparece por cima
  });
});
