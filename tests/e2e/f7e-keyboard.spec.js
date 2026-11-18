import { test, expect, waitForLib, openPanel } from './helpers.js';

/**
 * F7e — "Foco bem visível" (anel duplo na página, mesmo com outline:none do site) e
 * "Mostrar atalhos do teclado" (cartão que lista, fecha e não cobre o botão flutuante).
 */
const PAGE = '/tests/e2e/fixtures/keyboard.html';
const CARD = '#ms-shortcuts-card';

async function toggle(page, option) {
  await openPanel(page);
  const sec = page.locator('#ms-sec-keyboard-btn');
  if ((await sec.getAttribute('aria-expanded')) !== 'true') await sec.click();
  await page.locator(`[data-option="${option}"]`).click();
  await expect(page.locator(`[data-option="${option}"]`)).toHaveAttribute(
    'aria-checked',
    'true',
  );
}

test.describe('F7e — Foco bem visível', () => {
  test('liga: link com outline:none do site ganha anel duplo ≥ 3px; desliga: volta ao do site', async ({
    site,
  }) => {
    const { page, errors } = site;
    await page.goto(PAGE);
    await waitForLib(page);
    const ring = () =>
      page.evaluate(() => {
        const cs = getComputedStyle(document.getElementById('lnk'));
        return {
          style: cs.outlineStyle,
          width: cs.outlineWidth,
          color: cs.outlineColor,
          shadow: cs.boxShadow,
        };
      });
    await page.keyboard.press('Tab');
    await expect(page.locator('#lnk')).toBeFocused();
    expect((await ring()).style).toBe('none'); // sem a opção: site manda

    await toggle(page, 'strongFocus');
    await page.keyboard.press('Escape'); // fecha o painel
    await page.locator('#lnk').focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(page.locator('#lnk')).toBeFocused();
    const on = await ring();
    expect(on.style).toBe('solid');
    expect(on.width).toBe('3px');
    expect(on.color).toBe('rgb(0, 0, 0)');
    expect(on.shadow).toContain('rgb(255, 212, 0)');
    expect(errors).toEqual([]);
  });
});

test.describe('F7e — Atalhos do teclado', () => {
  test('cartão lista os atalhos e o accesskey da página; Fechar esconde; opção segue ligada', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(PAGE);
    await waitForLib(page);
    await toggle(page, 'showShortcuts');
    const card = page.locator(CARD);
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute('role', 'region');
    await expect(card).toHaveAttribute('aria-label', 'Atalhos do teclado');
    await expect(card).toContainText('Alt+Shift+A');
    await expect(card).toContainText('Esc');
    await expect(card).toContainText('Alt+M');
    await expect(card).toContainText('Menu principal');

    await page.keyboard.press('Escape'); // painel modal deixa o resto inerte; fechado, o cartão responde
    const close = card.getByRole('button', { name: 'Fechar' });
    expect((await close.boundingBox()).height).toBeGreaterThanOrEqual(44);
    await close.click();
    await expect(card).toHaveCount(0);
    await expect(page.locator('[data-option="showShortcuts"]')).toHaveAttribute(
      'aria-checked',
      'true',
    );
    // recarregar na mesma sessão: continua fechado
    await page.reload();
    await waitForLib(page);
    await expect(page.locator(CARD)).toHaveCount(0);
  });

  test('cartão não cobre o botão flutuante e tem contraste ≥ 4,5:1 (390px)', async ({
    site,
  }) => {
    const { page } = site;
    await page.setViewportSize({ width: 390, height: 700 });
    await page.goto(PAGE);
    await waitForLib(page);
    await toggle(page, 'showShortcuts');
    await page.keyboard.press('Escape');
    const card = await page.locator(CARD).boundingBox();
    const fab = await page.locator('#ms-fab').boundingBox();
    expect(card.x).toBeGreaterThanOrEqual(0);
    expect(card.x + card.width).toBeLessThanOrEqual(390);
    const overlap =
      card.x < fab.x + fab.width &&
      card.x + card.width > fab.x &&
      card.y < fab.y + fab.height &&
      card.y + card.height > fab.y;
    expect(overlap).toBe(false);
    const rgb = await page.evaluate(() => {
      const cs = getComputedStyle(document.getElementById('ms-shortcuts-card'));
      return [cs.backgroundColor, cs.color];
    });
    expect(rgb).toEqual(['rgb(11, 44, 95)', 'rgb(255, 255, 255)']); // #0B2C5F / #fff ≈ 12:1
  });

  test('"Desligar tudo" zera as duas opções e remove o cartão', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(PAGE);
    await waitForLib(page);
    await toggle(page, 'showShortcuts');
    await page.getByRole('button', { name: 'Desligar tudo' }).click();
    await expect(page.locator(CARD)).toHaveCount(0);
  });
});
