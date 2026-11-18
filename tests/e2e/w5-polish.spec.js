import { test, expect, waitForLib } from './helpers.js';

/** W5 (T221) — UX-26 skip link; UX-27 temas não apagam fundo de mídia; IMP-11 escala só no <html>. */
const INDEX = '/examples/index.html';

test.describe('W5 — polimento', () => {
  test('UX-26: primeiro Tab foca "Pular para o conteúdo"; Enter leva ao main; alvo >= 44px', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(INDEX);
    await waitForLib(page);
    await page.keyboard.press('Tab');
    const skip = page.locator('a.skip-link');
    await expect(skip).toBeFocused();
    await expect(skip).toHaveText('Pular para o conteúdo');
    const box = await skip.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.y).toBeGreaterThanOrEqual(0); // visível ao focar
    await page.keyboard.press('Enter');
    await expect(page.locator('main#conteudo-principal')).toBeFocused();
  });

  test('UX-26: fora de foco o link fica fora da tela', async ({ site }) => {
    const { page } = site;
    await page.goto(INDEX);
    await waitForLib(page);
    const box = await page.locator('a.skip-link').boundingBox();
    expect(box.y + box.height).toBeLessThanOrEqual(0);
  });

  test('UX-27: tema zera fundo de texto, mas preserva o de img/svg/video', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(INDEX);
    await waitForLib(page);
    await page.evaluate(() => {
      const main = document.querySelector('main');
      main.insertAdjacentHTML(
        'beforeend',
        '<p id="t27-p" style="background:rgb(255,0,0)">x</p>' +
          '<img id="t27-img" alt="" width="10" height="10" style="background:rgb(255,0,0)">' +
          '<svg id="t27-svg" width="10" height="10" style="background:rgb(255,0,0)"></svg>',
      );
      document.documentElement.classList.add('ms-theme-darkHigh');
    });
    const bg = (s) =>
      page.evaluate(
        (q) => getComputedStyle(document.querySelector(q)).backgroundColor,
        s,
      );
    expect(await bg('#t27-p')).toBe('rgba(0, 0, 0, 0)');
    expect(await bg('#t27-img')).toBe('rgb(255, 0, 0)');
    expect(await bg('#t27-svg')).toBe('rgb(255, 0, 0)');
  });

  test('IMP-11: escala de texto muda só o font-size do <html>', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(INDEX);
    await waitForLib(page);
    const m = () =>
      page.evaluate(() => ({
        html: getComputedStyle(document.documentElement).fontSize,
        body: document.body.style.cssText,
        zoom: getComputedStyle(document.body).zoom,
        tf: getComputedStyle(document.body).transform,
      }));
    const antes = await m();
    await page.evaluate(() =>
      document.documentElement.classList.add('ms-text-scale-150'),
    );
    const depois = await m();
    expect(parseFloat(depois.html)).toBeCloseTo(parseFloat(antes.html) * 1.5, 1);
    expect(depois.body).toBe(antes.body);
    expect(depois.zoom).toBe(antes.zoom);
    expect(depois.tf).toBe(antes.tf);
  });
});
