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

  test('UX-07: a barra segue ≤ 120px com fonte de fallback larga (não depende das métricas da fonte do runner)', async ({
    site,
  }) => {
    const { page } = site;
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(INDEX);
    await waitForLib(page);
    await ligarMS(page);
    // CI sem Lexend/Noto cai em system-ui largo (DejaVu): o título quebrava em 2 linhas (+31px)
    await page.addStyleTag({
      content:
        "#ms-session-bar, #ms-session-bar * { font-family: 'DejaVu Sans', sans-serif !important; }",
    });
    const h = await page
      .locator('#ms-session-bar')
      .evaluate((el) => el.getBoundingClientRect().height);
    expect(h).toBeLessThanOrEqual(120);
  });
});

test.describe('W2 mobile — título curto da barra', () => {
  for (const width of [320, 360, 390]) {
    test(`título sem corte com fonte larga a ${width}px e nome acessível com "ativado"`, async ({
      site,
    }) => {
      const { page } = site;
      await page.setViewportSize({ width, height: 844 });
      await page.goto(INDEX);
      await waitForLib(page);
      await ligarMS(page);
      await page.addStyleTag({
        content:
          "#ms-session-bar, #ms-session-bar * { font-family: 'DejaVu Sans', sans-serif !important; }",
      });
      const strong = page.locator(
        '#ms-session-bar .ms-session-on-title strong',
      );
      const m = await strong.evaluate((el) => ({
        sw: el.scrollWidth,
        cw: el.clientWidth,
      }));
      expect(m.sw).toBeLessThanOrEqual(m.cw);
      const h = await page
        .locator('#ms-session-bar')
        .evaluate((el) => el.getBoundingClientRect().height);
      expect(h).toBeLessThanOrEqual(120);
      expect(await strong.evaluate((el) => el.textContent)).toContain(
        'ativado',
      );
    });
  }
});
