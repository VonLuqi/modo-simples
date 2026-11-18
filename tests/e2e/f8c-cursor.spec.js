import { test, expect, waitForLib, openPanel } from './helpers.js';

/**
 * F8c — cursor grande branco/preto; F8b QA: altura de linha a partir de 1,5 e Redefinir fonte anuncia.
 */
const INDEX = '/examples/index.html';
const group = '[data-option="cursorStyle"]';

async function boot(page) {
  await page.goto(INDEX);
  await waitForLib(page);
  await openPanel(page);
}

const cursorOf = (page, sel) =>
  page.evaluate((s) => getComputedStyle(document.querySelector(s)).cursor, sel);

test.describe('F8c — cursor grande', () => {
  test('branco/preto: seta no corpo, mão grande em links; padrão restaura; persiste', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await page.locator('#ms-sec-colors-btn').click();
    expect(await cursorOf(page, 'main p')).not.toContain('url(');

    await page.locator(`${group} [data-value="bigWhite"]`).click();
    const seta = await cursorOf(page, 'main p');
    expect(seta).toContain('data:image/svg+xml');
    expect(seta).toContain("fill='%23fff'");
    expect(seta).toMatch(/\) 6 3, auto$/);
    const mao = await cursorOf(page, 'main a');
    expect(mao).toMatch(/\) 19 4, pointer$/);

    await page.locator(`${group} [data-value="bigBlack"]`).click();
    expect(await cursorOf(page, 'main p')).toContain("fill='%23000'");

    await page.reload();
    await waitForLib(page);
    expect(await cursorOf(page, 'main p')).toContain("fill='%23000'");

    await openPanel(page);
    await page.locator('#ms-sec-colors-btn').click();
    await page.locator(`${group} [data-value="default"]`).click();
    expect(await cursorOf(page, 'main p')).not.toContain('url(');
  });

  test('o cursor grande vence o crosshair da régua de leitura', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await page.locator('.ms-switch[data-option="readingRuler"]').click();
    expect(await cursorOf(page, 'html')).toBe('crosshair');
    await page.locator('#ms-sec-colors-btn').click();
    await page.locator(`${group} [data-value="bigWhite"]`).click();
    expect(await cursorOf(page, 'html')).toContain('data:image/svg+xml');
    expect(await cursorOf(page, 'main p')).toContain('data:image/svg+xml');
  });

  test('contenteditable (true, vazio, plaintext-only) mantém o cursor text; false e texto comum não', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await page.locator('#ms-sec-colors-btn').click();
    await page.locator(`${group} [data-value="bigWhite"]`).click();
    await page.evaluate(() => {
      const add = (id, attr) => {
        const d = document.createElement('div');
        d.id = id;
        d.textContent = 'texto';
        if (attr !== null) d.setAttribute('contenteditable', attr);
        document.querySelector('main').appendChild(d);
      };
      add('ce-true', 'true');
      add('ce-vazio', '');
      add('ce-plain', 'plaintext-only');
      add('ce-false', 'false');
      add('ce-nenhum', null);
    });
    for (const id of ['ce-true', 'ce-vazio', 'ce-plain'])
      expect(await cursorOf(page, `#${id}`), id).toBe('text');
    for (const id of ['ce-false', 'ce-nenhum'])
      expect(await cursorOf(page, `#${id}`), id).toContain(
        'data:image/svg+xml',
      );
  });

  test('radiogroup acessível: nome, estado marcado e setas selecionam', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await page.locator('#ms-sec-colors-btn').click();
    const radios = page.getByRole('radiogroup', { name: 'Cursor do mouse' });
    await expect(radios).toBeVisible();
    await expect(radios.getByRole('radio', { name: /Padrão/ })).toBeChecked();
    await radios.getByRole('radio', { name: /Padrão/ }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(
      radios.getByRole('radio', { name: /Grande branco/ }),
    ).toBeChecked();
    await expect(page.locator('[data-state-for="cursorStyle"]')).toHaveText(
      'Grande branco',
    );
  });

  test('Desligar tudo devolve o cursor do site', async ({ site }) => {
    const { page } = site;
    await boot(page);
    await page.locator('#ms-sec-colors-btn').click();
    await page.locator(`${group} [data-value="bigBlack"]`).click();
    await page.locator('[data-action="reset-all"]').click();
    expect(await cursorOf(page, 'main p')).not.toContain('url(');
    await expect(
      page.locator(`${group} [data-value="default"]`),
    ).toHaveAttribute('aria-checked', 'true');
  });

  test('em tela de toque o controle funciona sem erro (só não há cursor)', async ({
    site,
  }) => {
    const { page, errors } = site;
    await boot(page);
    await page.locator('#ms-sec-colors-btn').click();
    await page.locator(`${group} [data-value="bigWhite"]`).click();
    await expect(
      page.locator(`${group} [data-value="bigWhite"]`),
    ).toHaveAttribute('aria-checked', 'true');
    expect(errors).toEqual([]);
  });
});

test.describe('F8c — cursor grande dentro do widget', () => {
  const cursorIn = (page, sel) =>
    page.locator(sel).evaluate((el) => getComputedStyle(el).cursor);
  const MAO = /\) 19 4, pointer$/;

  test('FAB, painel e controles do widget também usam seta/mão grande; padrão restaura', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    // padrão: o widget mantém o pointer nativo
    expect(await cursorIn(page, '#ms-fab')).toBe('pointer');
    expect(await cursorIn(page, '#ms-a11y-title')).not.toContain('url(');

    await page.locator('#ms-sec-colors-btn').click();
    await page.locator(`${group} [data-value="bigWhite"]`).click();
    // área sem ação dentro do painel: seta branca
    const seta = await cursorIn(page, '#ms-a11y-title');
    expect(seta).toContain('data:image/svg+xml');
    expect(seta).toContain("fill='%23fff'");
    expect(seta).toMatch(/\) 6 3, auto$/);
    // botões do painel e FAB: mão grande
    for (const sel of [
      '#ms-fab',
      `${group} [data-value="bigBlack"]`,
      '.ms-switch[data-option="textSpacing"]',
    ]) {
      expect(await cursorIn(page, sel)).toMatch(MAO);
    }

    await page.locator(`${group} [data-value="bigBlack"]`).click();
    expect(await cursorIn(page, '#ms-a11y-title')).toContain("fill='%23000'");

    await page.locator(`${group} [data-value="default"]`).click();
    expect(await cursorIn(page, '#ms-fab')).toBe('pointer');
    expect(await cursorIn(page, '#ms-a11y-title')).not.toContain('url(');
  });

  test('sobrevive ao recarregar (host liga no boot)', async ({ site }) => {
    const { page } = site;
    await boot(page);
    await page.locator('#ms-sec-colors-btn').click();
    await page.locator(`${group} [data-value="bigBlack"]`).click();
    await page.reload();
    await waitForLib(page);
    expect(await cursorIn(page, '#ms-fab')).toMatch(MAO);
  });
});

test.describe('F8b QA — altura da linha e Redefinir fonte', () => {
  test('1.º passo do slider de altura de linha é 1,5 (não mais apertado que o site)', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    const slider = page.locator('[data-range="lineHeight"]');
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveAttribute('aria-valuetext', '1,5');
    await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveAttribute('aria-valuetext', '1,6');
    await page.keyboard.press('End');
    await expect(slider).toHaveAttribute('aria-valuetext', '3');
  });

  test('Redefinir fonte anuncia em PT-BR para leitor de tela', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await page.locator('.ms-segment[data-value="150"]').click();
    await page.locator('[data-action="reset-font"]').click();
    await expect(
      page.locator('[data-ms-live]', { hasText: 'Fonte redefinida' }),
    ).toHaveAttribute('aria-live', 'polite');
  });
});
