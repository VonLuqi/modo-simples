import { test, expect, waitForLib, openPanel } from './helpers.js';

/**
 * F7f — perfis de acessibilidade: escolher pelo teclado, efeitos no <html>, trocar de perfil,
 * "Personalizado" e o painel cabendo em 390 px.
 */
const PAGE = '/tests/e2e/fixtures/generic.html';
const btn = (id) => `[data-profile="${id}"]`;

async function boot(page) {
  await page.addInitScript(() => {
    // voz de mentira: perfis TDAH/Teclado ligam "leia o foco"
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: { speaking: false, cancel() {}, speak() {} },
    });
  });
  await page.goto(PAGE);
  await waitForLib(page);
  await openPanel(page);
}

const html = (page) =>
  page.evaluate(() => [...document.documentElement.classList]);

async function escolher(page, id) {
  await page.locator(btn(id)).focus();
  await page.keyboard.press('Enter'); // teclado: botão nativo
}

test.describe('F7f — perfis', () => {
  test('cada perfil, escolhido pelo teclado, liga os efeitos certos', async ({
    site,
  }) => {
    const { page, errors } = site;
    await boot(page);

    await escolher(page, 'lowVision');
    await expect(page.locator(btn('lowVision'))).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    let c = await html(page);
    for (const k of [
      'ms-text-scale-150',
      'ms-theme-yellowBlack',
      'ms-cursor-white',
    ]) {
      expect(c).toContain(k);
    }

    await escolher(page, 'dyslexia');
    c = await html(page);
    for (const k of ['ms-dyslexia-font', 'ms-reading-ruler'])
      expect(c).toContain(k);
    expect(c).not.toContain('ms-text-scale-150'); // trocar = volta ao padrão
    expect(c).not.toContain('ms-theme-yellowBlack');
    await expect(page.locator(btn('lowVision'))).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    await escolher(page, 'adhd');
    c = await html(page);
    for (const k of ['ms-ativo', 'ms-reduced-motion']) expect(c).toContain(k);
    expect(c).not.toContain('ms-dyslexia-font');

    await escolher(page, 'epilepsy');
    c = await html(page);
    for (const k of ['ms-block-flashing', 'ms-reduced-motion'])
      expect(c).toContain(k);
    expect(c).not.toContain('ms-ativo'); // Modo Simples desligado na troca

    await escolher(page, 'keyboard');
    c = await html(page);
    expect(c).toContain('ms-strong-focus');
    expect(c).not.toContain('ms-block-flashing');
    await expect(page.locator('#ms-shortcuts-card')).toBeVisible();

    await escolher(page, 'simple');
    c = await html(page);
    expect(c).toContain('ms-ativo');
    expect(c).not.toContain('ms-strong-focus');

    // clicar de novo no ativo desliga
    await escolher(page, 'simple');
    c = await html(page);
    expect(c).not.toContain('ms-ativo');
    await expect(
      page.locator('[aria-pressed="true"][data-profile]'),
    ).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('ajuste manual mantém o perfil e mostra "Personalizado"', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await escolher(page, 'lowVision');
    const personalizado = page.locator(
      `${btn('lowVision')} .ms-profile-custom`,
    );
    await expect(personalizado).toBeHidden();

    await page
      .locator('.ms-segment, [data-option="textScale"] [role="radio"]')
      .first()
      .click();
    await expect(page.locator(btn('lowVision'))).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(personalizado).toBeVisible();
    await expect(personalizado).toHaveText('Personalizado');

    // Desligar tudo limpa o perfil
    await page.locator('[data-action="reset-all"]').click();
    await expect(
      page.locator('[aria-pressed="true"][data-profile]'),
    ).toHaveCount(0);
    await expect(personalizado).toBeHidden();
  });

  test('persiste ao recarregar (perfil marcado)', async ({ site }) => {
    const { page } = site;
    await boot(page);
    await escolher(page, 'dyslexia');
    await page.reload();
    await waitForLib(page);
    await openPanel(page);
    await expect(page.locator(btn('dyslexia'))).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(await html(page)).toContain('ms-dyslexia-font');
  });

  test('painel em 390 px: sem rolagem horizontal e botões ≥ 44 px', async ({
    site,
  }) => {
    const { page } = site;
    await page.setViewportSize({ width: 390, height: 780 });
    await boot(page);
    const panel = page.locator('#ms-a11y-panel');
    const dims = await panel.evaluate((el) => ({
      cw: el.clientWidth,
      sw: el.scrollWidth,
    }));
    expect(dims.sw).toBeLessThanOrEqual(dims.cw);
    const box = await panel.boundingBox();
    expect(box.x + box.width).toBeLessThanOrEqual(390 + 1);
    for (const b of await page.locator('[data-profile]').all()) {
      const r = await b.boundingBox();
      expect(r.height).toBeGreaterThanOrEqual(44);
      expect(r.x + r.width).toBeLessThanOrEqual(390);
    }
  });
});
