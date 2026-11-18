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
/** A barra de botões tira altura da área da grade: põe o alvo no centro da célula 9 → 5 dela. */
const alignTarget = (page) =>
  page.evaluate(() => {
    const bar = document.querySelector(
      '#ms-mouse-grid button:not([data-cell])',
    ).parentElement;
    const barH = bar.offsetHeight + 16;
    document.getElementById('target').style.top =
      `${((innerHeight - barH) * 5) / 6}px`;
  });
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
    await alignTarget(page);
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
    await alignTarget(page);
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
    await alignTarget(page);
    await page.locator(`${CELLS}[data-cell="9"]`).click();
    await page.locator(`${CELLS}[data-cell="5"]`).click();
    await page.getByRole('button', { name: /^Clicar/ }).click();
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

  for (const vp of [
    { width: 390, height: 844 },
    { width: 223, height: 482 }, // 390 px com zoom de 175%
  ]) {
    test(`QA L1: a ${vp.width}x${vp.height} nenhuma célula fica debaixo da barra de botões`, async ({
      site,
    }) => {
      const { page } = site;
      await page.setViewportSize(vp);
      await load(page);
      await page.keyboard.press('Alt+Shift+G');
      await expect(page.locator(CELLS)).toHaveCount(9);
      for (let nivel = 0; nivel < 2; nivel++) {
        const m = await page.evaluate(() => {
          const bar = [
            ...document.querySelectorAll(
              '#ms-mouse-grid button:not([data-cell])',
            ),
          ].map((b) => b.getBoundingClientRect());
          const barTop = Math.min(...bar.map((r) => r.top));
          const cells = [
            ...document.querySelectorAll('#ms-mouse-grid [data-cell]'),
          ].map((b) => b.getBoundingClientRect());
          return {
            barTop,
            cellsBottom: Math.max(...cells.map((r) => r.bottom)),
            nBar: bar.length,
            barH: Math.max(...bar.map((r) => r.bottom)) - barTop,
          };
        });
        expect(m.cellsBottom).toBeLessThanOrEqual(m.barTop + 1);
        await page.keyboard.press('9');
      }
      // a barra em uma linha só (botões lado a lado)
      const tops = await page.$$eval(
        '#ms-mouse-grid button:not([data-cell])',
        (bs) => bs.map((b) => Math.round(b.getBoundingClientRect().top)),
      );
      expect(new Set(tops).size).toBe(1);
    });
  }

  test('QA L1/M3: com o teclado virtual aberto a barra vai para o topo e as células cobrem o teclado', async ({
    site,
  }) => {
    const { page } = site;
    await page.setViewportSize({ width: 390, height: 844 });
    await load(page);
    await page.evaluate(() => {
      const kb = document.createElement('div');
      kb.id = 'ms-virtual-keyboard';
      kb.style.cssText = 'position:fixed;left:0;right:0;bottom:0;height:200px';
      document.body.appendChild(kb);
    });
    await page.keyboard.press('Alt+Shift+G');
    const m = await page.evaluate(() => {
      const bar = [
        ...document.querySelectorAll('#ms-mouse-grid button:not([data-cell])'),
      ].map((b) => b.getBoundingClientRect());
      const barBottom = Math.max(...bar.map((r) => r.bottom));
      const cells = [
        ...document.querySelectorAll('#ms-mouse-grid [data-cell]'),
      ].map((b) => b.getBoundingClientRect());
      return {
        barBottom,
        cellsTop: Math.min(...cells.map((r) => r.top)),
        cellsBottom: Math.max(...cells.map((r) => r.bottom)),
        vh: innerHeight,
      };
    });
    expect(m.cellsTop).toBeGreaterThanOrEqual(m.barBottom - 1);
    expect(m.cellsBottom).toBeGreaterThan(m.vh - 4); // chega ao rodapé (onde fica o teclado)
  });
});
