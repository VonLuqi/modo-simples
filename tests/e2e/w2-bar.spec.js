import { test, expect, waitForLib } from './helpers.js';

const INDEX = '/examples/index.html';

async function ligarMS(page) {
  await page.evaluate(() => window.ModoSimples.enable());
  await expect(page.locator('html')).toHaveClass(/ms-ativo/);
}

test.describe('W2 mobile — barra do Modo Simples', () => {
  test('UX-07: barra compacta com Modo Simples ligado a 390x844 (≤ 120px)', async ({
    site,
  }, testInfo) => {
    const { page } = site;
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(INDEX);
    await waitForLib(page);
    await ligarMS(page);

    const bar = page.locator('#ms-session-bar');
    await expect(bar).toBeVisible();
    const h = await bar.evaluate((el) => el.getBoundingClientRect().height);
    testInfo.annotations.push({
      type: 'altura-barra-390',
      description: `${Math.round(h)}px`,
    });
    expect(h).toBeLessThanOrEqual(120);

    // alvos de toque preservados (UX-16)
    const menores = await bar
      .locator('.ms-session-btn:visible')
      .evaluateAll(
        (bs) =>
          bs
            .map((b) => b.getBoundingClientRect())
            .filter((b) => b.height < 43.5 || b.width < 43.5).length,
      );
    expect(menores).toBe(0);
  });
});
