import { test, expect, waitForLib, openPanel } from './helpers.js';

/**
 * F9c — "Estrutura da página": diálogo com títulos e áreas; pular foca o alvo.
 * O projeto "mobile" roda em 390px (cobre o diálogo em tela pequena).
 */
const PAGE = '/tests/e2e/fixtures/page-outline.html';
const TRIGGER = '[data-action="page-outline"]';
const DLG = '#ms-page-outline';

async function boot(page) {
  await page.goto(PAGE);
  await waitForLib(page);
  await openPanel(page);
  const sec = page.locator('#ms-sec-pageTools-btn');
  if ((await sec.getAttribute('aria-expanded')) !== 'true') await sec.click();
}

const activeId = (page) => page.evaluate(() => document.activeElement?.id);

test.describe('F9c — Estrutura da página', () => {
  test('abre listando títulos e áreas; oculto e UI própria ficam de fora', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await page.locator(TRIGGER).click();
    const dlg = page.locator(DLG);
    await expect(dlg).toBeVisible();
    await expect(dlg).toHaveAttribute('role', 'dialog');
    await expect(
      dlg.getByRole('heading', { name: 'Estrutura da página' }),
    ).toBeVisible();
    for (const t of [
      'Portal de exemplo',
      'Primeira seção',
      'Segunda seção',
      'Navegação: Menu principal',
      'Conteúdo principal',
    ]) {
      await expect(dlg.locator('.ms-outline-link', { hasText: t })).toHaveCount(
        1,
      );
    }
    await expect(
      dlg.locator('.ms-outline-link', { hasText: 'escondido' }),
    ).toHaveCount(0);
    await expect(
      dlg.locator('.ms-outline-link', { hasText: /Acessibilidade/ }),
    ).toHaveCount(0);
  });

  test('Enter num item rola, foca o alvo e fecha diálogo e painel', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await page.locator(TRIGGER).click();
    const link = page.locator(`${DLG} .ms-outline-link`, {
      hasText: 'Segunda seção',
    });
    await link.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator(DLG)).toHaveCount(0);
    await expect(page.locator('#ms-a11y-panel')).toBeHidden();
    expect(await activeId(page)).toBe('h2b');
    const top = await page.evaluate(
      () => document.getElementById('h2b').getBoundingClientRect().top,
    );
    expect(top).toBeLessThan(100);
    // tabindex temporário some ao sair do foco
    await page.locator('#btn').focus();
    await expect(page.locator('#h2b')).not.toHaveAttribute('tabindex', /.*/);
  });

  test('Esc fecha só o diálogo e devolve o foco ao botão; painel segue aberto', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await page.locator(TRIGGER).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator(DLG)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator(DLG)).toHaveCount(0);
    await expect(page.locator('#ms-a11y-panel')).toBeVisible();
    await expect(page.locator(TRIGGER)).toBeFocused();
  });

  test('botão Fechar devolve o foco ao botão', async ({ site }) => {
    const { page } = site;
    await boot(page);
    await page.locator(TRIGGER).click();
    await page.locator(`${DLG} .ms-outline-close`).click();
    await expect(page.locator(DLG)).toHaveCount(0);
    await expect(page.locator(TRIGGER)).toBeFocused();
  });

  test('só teclado: Tab fica preso no diálogo e Enter pula', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await page.locator(TRIGGER).focus();
    await page.keyboard.press('Enter');
    const inside = () =>
      page.evaluate(() => {
        const root = document.querySelector('#ms-container').shadowRoot;
        return !!root.activeElement?.closest('#ms-page-outline');
      });
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press('Tab');
      expect(await inside()).toBe(true);
    }
    await page
      .locator(`${DLG} .ms-outline-link`, { hasText: 'Portal de exemplo' })
      .focus();
    await page.keyboard.press('Enter');
    expect(await activeId(page)).toBe('h1');
  });

  test('Desligar tudo fecha o diálogo', async ({ site }) => {
    const { page } = site;
    await boot(page);
    await page.locator(TRIGGER).click();
    await page.evaluate(() => {
      const root = document.querySelector('#ms-container').shadowRoot;
      root.querySelector('[data-action="reset-all"]').click();
    });
    await expect(page.locator(DLG)).toHaveCount(0);
  });

  test('diálogo cabe na janela', async ({ site }) => {
    const { page } = site;
    await boot(page);
    await page.locator(TRIGGER).click();
    const b = await page.locator(DLG).boundingBox();
    const vp = page.viewportSize();
    expect(b.x).toBeGreaterThanOrEqual(0);
    expect(b.x + b.width).toBeLessThanOrEqual(vp.width);
    expect(b.y + b.height).toBeLessThanOrEqual(vp.height);
  });

  test('página sem estrutura mostra o texto de vazio', async ({ site }) => {
    const { page } = site;
    await boot(page);
    await page.evaluate(() => {
      document
        .querySelectorAll('h1,h2,h3,nav,main,header,footer')
        .forEach((e) => e.remove());
    });
    await page.locator(TRIGGER).click();
    await expect(page.locator(`${DLG} .ms-outline-empty`)).toHaveText(
      'Esta página não tem títulos nem áreas para listar.',
    );
  });
});
