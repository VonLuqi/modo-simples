import { test, expect, waitForLib, openPanel } from './helpers.js';

/**
 * F7d — "Bloquear animações e GIFs": corta animation/transition, para marquee, congela GIF
 * no 1º quadro (clique mostra), pausa autoplay (também o tardio) e restaura ao desligar.
 */
const PAGE = '/tests/e2e/fixtures/flash.html';
const SWITCH = '[data-option="blockFlashing"]';

const cs = (page, sel, prop) =>
  page.evaluate(
    ([s, p]) => getComputedStyle(document.querySelector(s))[p],
    [sel, prop],
  );

async function turnOn(page) {
  await openPanel(page);
  await page.locator('#ms-sec-motion-btn').click();
  await page.locator(SWITCH).click();
  await expect(page.locator(SWITCH)).toHaveAttribute('aria-checked', 'true');
}

test.describe('F7d — Bloqueio de intermitência', () => {
  test('liga: animação e transição somem; desliga: voltam', async ({
    site,
  }) => {
    const { page, errors } = site;
    await page.goto(PAGE);
    await waitForLib(page);
    expect(await cs(page, '#anim', 'animationName')).toBe('pulse');
    await turnOn(page);
    expect(await cs(page, '#anim', 'animationName')).toBe('none');
    expect(await cs(page, '#anim', 'transitionDuration')).toBe('0s');
    // a UI da lib (shadow DOM) também não anima
    const host = page.locator('#ms-container');
    await expect(host).toHaveAttribute('data-ms-noflash', '');
    await page.locator(SWITCH).click();
    expect(await cs(page, '#anim', 'animationName')).toBe('pulse');
    await expect(host).not.toHaveAttribute('data-ms-noflash', '');
    expect(errors).toEqual([]);
  });

  test('marquee para e volta a correr ao desligar', async ({ site }) => {
    const { page } = site;
    await page.goto(PAGE);
    await waitForLib(page);
    // o texto corre dentro do <marquee>: compara capturas da área dele
    const pos = async () =>
      (await page.locator('#marq').screenshot()).toString('base64');
    await turnOn(page);
    const a = await pos();
    await page.waitForTimeout(300);
    expect(await pos()).toBe(a); // parado
    await page.locator(SWITCH).click();
    await expect.poll(pos, { timeout: 4000 }).not.toBe(a); // voltou a correr
  });

  test('GIF vira 1º quadro com botão "Mostrar animação"; clique revela; desligar restaura', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(PAGE);
    await waitForLib(page);
    const orig = await page.evaluate(() => ({
      src: document.getElementById('gif').src,
      w: document.getElementById('gif').getBoundingClientRect().width,
    }));
    await turnOn(page);
    const still = page.locator('[data-ms-gif-still]');
    await expect(still).toHaveCount(1);
    await expect(page.locator('#gif')).toHaveCount(0);
    await expect(still).toHaveAttribute(
      'aria-label',
      'Mostrar animação: Gato girando',
    );
    await expect(still).toContainText('Mostrar animação');
    expect((await still.boundingBox()).width).toBeCloseTo(orig.w, 0);

    // teclado: Enter no botão revela a animação (mesmo <img>, mesmo src)
    await page.keyboard.press('Escape'); // fecha o painel (prende o foco)
    await still.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-ms-gif-still]')).toHaveCount(0);
    expect(await page.evaluate(() => document.getElementById('gif').src)).toBe(
      orig.src,
    );
    await openPanel(page);
    await page.locator(SWITCH).click(); // desligar com GIF já revelado não quebra nada
    await expect(page.locator('#gif')).toHaveCount(1);
  });

  test('desligar devolve o <img> original ainda congelado', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(PAGE);
    await waitForLib(page);
    await turnOn(page);
    await expect(page.locator('[data-ms-gif-still]')).toHaveCount(1);
    await page.locator(SWITCH).click();
    await expect(page.locator('[data-ms-gif-still]')).toHaveCount(0);
    await expect(page.locator('#gif')).toHaveAttribute('alt', 'Gato girando');
  });

  test('conteúdo tardio: GIF, marquee e vídeo com autoplay também são tratados', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(PAGE);
    await waitForLib(page);
    await turnOn(page);
    await page.evaluate(() => {
      const gif = new Image();
      gif.id = 'late-gif';
      gif.alt = 'Tardio';
      gif.src =
        'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=';
      const m = document.createElement('marquee');
      m.id = 'late-marq';
      m.textContent = 'tarde';
      const v = document.createElement('video');
      v.id = 'late-vid';
      v.setAttribute('autoplay', '');
      document.querySelector('main').append(gif, m, v);
    });
    await expect(page.locator('[data-ms-gif-still]')).toHaveCount(2);
    await expect(page.locator('#late-vid')).not.toHaveAttribute('autoplay');
    expect(
      await page.evaluate(() => document.getElementById('late-vid').paused),
    ).toBe(true);
  });

  test('persiste ao recarregar e "Desligar tudo" zera', async ({ site }) => {
    const { page } = site;
    await page.goto(PAGE);
    await waitForLib(page);
    await turnOn(page);
    await page.reload();
    await waitForLib(page);
    expect(await cs(page, '#anim', 'animationName')).toBe('none');
    await expect(page.locator('[data-ms-gif-still]')).toHaveCount(1);
    await openPanel(page);
    await page.getByRole('button', { name: 'Desligar tudo' }).click();
    expect(await cs(page, '#anim', 'animationName')).toBe('pulse');
    await expect(page.locator('#gif')).toHaveCount(1);
  });
});
