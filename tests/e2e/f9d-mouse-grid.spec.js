import { test, expect, waitForLib, openPanel } from './helpers.js';

/**
 * F9d — "Grade de mouse": grade 3x3 numerada, teclas 1–9 subdividem, Enter clica.
 * O projeto "mobile" roda em 390px (toque nas células).
 */
const PAGE = '/tests/e2e/fixtures/mouse-grid.html';
const GRID = '#ms-mouse-grid';
const CELLS = `${GRID} [data-cell]`;

async function load(page) {
  await page.goto(PAGE);
  await waitForLib(page);
}
const clicks = (page) => page.evaluate(() => window.__clicks);
const activeId = (page) => page.evaluate(() => document.activeElement?.id);

test.describe('F9d — Grade de mouse', () => {
  test('abre pelo botão do painel: painel fecha, grade 3x3 numerada aparece', async ({
    site,
  }) => {
    const { page } = site;
    await load(page);
    await openPanel(page);
    const sec = page.locator('#ms-sec-pageTools-btn');
    if ((await sec.getAttribute('aria-expanded')) !== 'true') await sec.click();
    await page.locator('[data-action="mouse-grid"]').click();
    await expect(page.locator('#ms-a11y-panel')).toBeHidden();
    await expect(page.locator(GRID)).toBeVisible();
    await expect(page.locator(CELLS)).toHaveCount(9);
    await expect(page.locator(`${CELLS} >> nth=4`)).toHaveText('5');
    const fs = await page
      .locator(`${CELLS} >> nth=0`)
      .evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
    expect(fs).toBeGreaterThanOrEqual(24);
  });

  test('atalho Alt+Shift+G; 9, 5 e Enter clicam no botão real e o handler dispara', async ({
    site,
  }) => {
    const { page } = site;
    await load(page);
    await page.keyboard.press('Alt+Shift+G');
    await expect(page.locator(GRID)).toBeVisible();
    await page.keyboard.press('9');
    await expect(page.locator(CELLS)).toHaveCount(9); // 2º nível desenhado
    await page.keyboard.press('5');
    await page.keyboard.press('Enter');
    await expect(page.locator(GRID)).toHaveCount(0);
    expect(await clicks(page)).toEqual([
      'pointerdown',
      'mousedown',
      'pointerup',
      'mouseup',
      'click',
    ]);
    expect(await activeId(page)).toBe('target');
  });

  test('Backspace sobe um nível', async ({ site }) => {
    const { page } = site;
    await load(page);
    await page.keyboard.press('Alt+Shift+G');
    const w0 = (await page.locator(`${CELLS} >> nth=0`).boundingBox()).width;
    await page.keyboard.press('9');
    const w1 = (await page.locator(`${CELLS} >> nth=0`).boundingBox()).width;
    expect(w1).toBeLessThan(w0);
    await page.keyboard.press('Backspace');
    const w2 = (await page.locator(`${CELLS} >> nth=0`).boundingBox()).width;
    expect(Math.round(w2)).toBe(Math.round(w0));
  });

  test('Esc fecha a grade e devolve o foco ao elemento anterior, sem clicar', async ({
    site,
  }) => {
    const { page } = site;
    await load(page);
    await page.locator('#other').focus();
    await page.keyboard.press('Alt+Shift+G');
    await expect(page.locator(GRID)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator(GRID)).toHaveCount(0);
    expect(await activeId(page)).toBe('other');
    expect(await clicks(page)).toEqual([]);
  });

  test('a grade não é alvo do clique e some antes do teste de acerto', async ({
    site,
  }) => {
    const { page } = site;
    await load(page);
    await page.keyboard.press('Alt+Shift+G');
    // sobre o alvo, o elemento do topo é a grade; ao clicar, o alvo da página recebe o clique
    const top = await page.evaluate(() => {
      const r = document.getElementById('target').getBoundingClientRect();
      return !!document
        .elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
        ?.closest('#ms-mouse-grid');
    });
    expect(top).toBe(true);
    await page.keyboard.press('9');
    await page.keyboard.press('5');
    await page.keyboard.press('Enter');
    expect((await clicks(page)).at(-1)).toBe('click');
  });

  test('toque/clique nas células (390px) e botão Clicar aqui', async ({
    site,
  }) => {
    const { page } = site;
    await load(page);
    await page.keyboard.press('Alt+Shift+G');
    await page.locator(`${CELLS}[data-cell="9"]`).click();
    await page.locator(`${CELLS}[data-cell="5"]`).click();
    await page.getByRole('button', { name: /Clicar aqui/ }).click();
    await expect(page.locator(GRID)).toHaveCount(0);
    expect((await clicks(page)).at(-1)).toBe('click');
  });

  test('células cabem na janela e Desligar tudo não é necessário para fechar (Esc)', async ({
    site,
  }) => {
    const { page } = site;
    await load(page);
    await page.keyboard.press('Alt+Shift+G');
    const b = await page.locator(GRID).boundingBox();
    const vp = page.viewportSize();
    expect(b.width).toBeLessThanOrEqual(vp.width);
    expect(b.height).toBeLessThanOrEqual(vp.height);
    const last = await page.locator(`${CELLS} >> nth=8`).boundingBox();
    expect(last.x + last.width).toBeLessThanOrEqual(vp.width + 1);
    expect(last.y + last.height).toBeLessThanOrEqual(vp.height + 1);
  });
});
