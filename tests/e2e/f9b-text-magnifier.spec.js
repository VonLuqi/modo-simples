import { test, expect, waitForLib, openPanel } from './helpers.js';

/**
 * F9b — "Lupa de texto": caixa grande com o texto sob o ponteiro/foco/toque.
 */
const PAGE = '/tests/e2e/fixtures/magnifier.html';
const BOX = '#ms-text-magnifier';

async function boot(page) {
  await page.goto(PAGE);
  await waitForLib(page);
  await openPanel(page);
  const sec = page.locator('#ms-sec-pageTools-btn');
  if ((await sec.getAttribute('aria-expanded')) !== 'true') await sec.click();
  await page.locator('[data-option="textMagnifier"]').click();
  await expect(page.locator('[data-option="textMagnifier"]')).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await page.keyboard.press('Escape'); // fecha o painel
  await expect(page.locator('#ms-a11y-panel')).toBeHidden();
}

const rectOf = (page, sel) =>
  page.evaluate((s) => {
    const r = document.querySelector(s).getBoundingClientRect();
    return { top: r.top, bottom: r.bottom, left: r.left, right: r.right };
  }, sel);

async function expectBoxOk(page, targetSel) {
  const box = page.locator(BOX);
  await expect(box).toBeVisible();
  const b = await box.boundingBox();
  const vp = page.viewportSize();
  expect(b.x).toBeGreaterThanOrEqual(0);
  expect(b.y).toBeGreaterThanOrEqual(0);
  expect(b.x + b.width).toBeLessThanOrEqual(vp.width);
  expect(b.y + b.height).toBeLessThanOrEqual(vp.height);
  const t = await rectOf(page, targetSel);
  const overlap = !(
    b.y + b.height <= t.top ||
    b.y >= t.bottom ||
    b.x + b.width <= t.left ||
    b.x >= t.right
  );
  expect(overlap, 'a caixa não cobre o alvo').toBe(false);
  const fs = await box.evaluate((e) =>
    parseFloat(getComputedStyle(e).fontSize),
  );
  expect(fs).toBeGreaterThanOrEqual(32);
  await expect(box).toHaveAttribute('aria-hidden', 'true');
}

test.describe('F9b — Lupa de texto', () => {
  test('ponteiro: mostra o texto ampliado, sem cobrir o alvo nem sair da tela', async ({
    site,
  }, info) => {
    const { page } = site;
    await boot(page);
    await expect(page.locator(BOX)).toHaveCount(0);
    if (info.project.name === 'mobile') {
      await page.locator('#p').tap();
    } else {
      await page.locator('#p').hover();
    }
    await expect(page.locator(BOX)).toContainText(
      'Este é um parágrafo pequeno',
    );
    await expectBoxOk(page, '#p');
    // QA M1: nenhum evento posterior (focusout, resize, scroll atrasado) pode esconder a caixa
    await page.waitForTimeout(600);
    await expectBoxOk(page, '#p');
  });

  test('perto do rodapé a caixa vai para cima do alvo e continua na tela', async ({
    site,
  }, info) => {
    const { page } = site;
    await boot(page);
    await page.locator('#bottom').scrollIntoViewIfNeeded();
    if (info.project.name === 'mobile') await page.locator('#bottom').tap();
    else await page.locator('#bottom').hover();
    await expect(page.locator(BOX)).toContainText('Texto lá embaixo');
    await expectBoxOk(page, '#bottom');
  });

  test('foco do teclado mostra o campo; senha em foco não mostra o valor', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await page.locator('#nome').focus();
    await expect(page.locator(BOX)).toContainText('Ana');
    await page.locator('#pw').focus();
    await expect(page.locator(BOX)).toBeHidden();
    expect(await page.locator('body').innerText()).not.toContain('segredo123');
    await expect(page.locator(BOX)).not.toContainText('segredo123');
  });

  test('Esc esconde até o próximo movimento', async ({ site }, info) => {
    test.skip(info.project.name === 'mobile', 'sem ponteiro de mouse');
    const { page } = site;
    await boot(page);
    await page.locator('#p').hover();
    await expect(page.locator(BOX)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator(BOX)).toBeHidden();
    await page.locator('#h').hover();
    await expect(page.locator(BOX)).toContainText('Título da página');
  });

  test('ponteiro sobre o FAB esconde a caixa', async ({ site }, info) => {
    test.skip(info.project.name === 'mobile', 'sem ponteiro de mouse');
    const { page } = site;
    await boot(page);
    await page.locator('#p').hover();
    await expect(page.locator(BOX)).toBeVisible();
    await page.locator('#ms-fab').hover();
    await expect(page.locator(BOX)).toBeHidden();
  });

  test('a caixa não bloqueia o clique no alvo', async ({ site }, info) => {
    const { page } = site;
    await boot(page);
    if (info.project.name === 'mobile') await page.locator('#btn').tap();
    else await page.locator('#btn').click();
    await expect(page.locator(BOX)).toContainText('Enviar formulário');
    expect(await page.evaluate(() => window.__clicks)).toBe(1);
  });

  test('desligar remove a caixa e o efeito; persiste ao recarregar; "Desligar tudo" zera', async ({
    site,
  }, info) => {
    test.skip(info.project.name === 'mobile', 'sem ponteiro de mouse');
    const { page } = site;
    await boot(page);
    await page.locator('#p').hover();
    await expect(page.locator(BOX)).toBeVisible();

    await page.reload();
    await waitForLib(page);
    await page.locator('#p').hover();
    await expect(page.locator(BOX)).toBeVisible(); // persistiu

    await openPanel(page);
    await page.locator('#ms-sec-pageTools-btn').click();
    await page.locator('[data-option="textMagnifier"]').click(); // desliga
    await expect(page.locator(BOX)).toHaveCount(0);
    await page.keyboard.press('Escape');
    await page.locator('#h').hover();
    await page.locator('#p').hover();
    await expect(page.locator(BOX)).toHaveCount(0); // listeners saíram

    await page.locator('#ms-fab').click();
    await page.locator('[data-option="textMagnifier"]').click(); // liga
    await page.locator('[data-action="reset-all"]').click();
    await page.keyboard.press('Escape');
    await page.locator('#p').hover();
    await expect(page.locator(BOX)).toHaveCount(0);
    await page.reload();
    await waitForLib(page);
    await page.locator('#p').hover();
    await expect(page.locator(BOX)).toHaveCount(0);
  });
});
