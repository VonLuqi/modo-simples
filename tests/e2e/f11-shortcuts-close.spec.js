import { test, expect, waitForLib, openPanel } from './helpers.js';

/**
 * F11 LOW (a) — com o painel aberto, o cartão de atalhos chega ao <body> e ficava `inert`:
 * "Fechar" não respondia ao clique. Clique real (mouse) + elementFromPoint, não el.click().
 */
const PAGE = '/tests/e2e/fixtures/keyboard.html';
const CARD = '#ms-shortcuts-card';

for (const vp of [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
]) {
  test(`Fechar do cartão de atalhos responde ao clique real com o painel aberto (${vp.width}x${vp.height})`, async ({
    site,
  }, testInfo) => {
    const { page, errors } = site;
    await page.setViewportSize(vp);
    await page.goto(PAGE);
    await waitForLib(page);
    await openPanel(page);
    const sec = page.locator('#ms-sec-keyboard-btn');
    if ((await sec.getAttribute('aria-expanded')) !== 'true') await sec.click();
    await page.locator('[data-option="showShortcuts"]').click();
    const card = page.locator(CARD);
    await expect(card).toBeVisible();
    await expect(page.locator('#ms-a11y-panel')).toBeVisible(); // painel segue aberto

    const close = card.getByRole('button', { name: 'Fechar' });
    const box = await close.boundingBox();
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    // nada por cima do botão: o clique cai nele (e ele não está inert)
    const hit = await page.evaluate(
      ([px, py]) => {
        const el = document.elementFromPoint(px, py);
        return !!el && !!el.closest('#ms-shortcuts-card button');
      },
      [x, y],
    );
    expect(hit).toBe(true);
    expect(await card.evaluate((el) => el.hasAttribute('inert'))).toBe(false);
    await page.screenshot({
      path: testInfo.outputPath(`cartao-${vp.width}x${vp.height}.png`),
    });

    await page.mouse.click(x, y);
    await expect(card).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}
