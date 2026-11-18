import { test, expect, waitForLib, openPanel } from './helpers.js';

/**
 * Idioma da UI (T229): seletor no painel, textos em en/es, persistência, "automático" e demo
 * (link de pular e tutorial). Depende do boot chamar setLocale ao mudar options.language.
 */
const INDEX = '/examples/index.html';
const GENERIC = '/tests/e2e/fixtures/generic.html';
const SEL = '[data-language]';
const FAB = '#ms-fab';

const fabLabel = (page) => page.locator(FAB).getAttribute('aria-label');

async function escolher(page, value) {
  await page.locator(SEL).selectOption(value);
}

test.describe('Idioma — painel', () => {
  test('seletor lista Automático + 3 idiomas, cada um na própria língua', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(INDEX);
    await waitForLib(page);
    await openPanel(page);
    const opts = await page
      .locator(`${SEL} option`)
      .evaluateAll((os) => os.map((o) => [o.value, o.textContent]));
    expect(opts.map(([v]) => v)).toEqual(['auto', 'pt', 'en', 'es']);
    expect(opts[0][1]).toBe('Automático (Português)');
    expect(opts.slice(1).map(([, l]) => l)).toEqual([
      'Português',
      'English',
      'Español',
    ]);
  });

  test('en e es: textos do painel, FAB e lang do widget mudam; painel segue aberto', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(INDEX);
    await waitForLib(page);
    await openPanel(page);
    await escolher(page, 'en');
    await expect(page.locator('label[for="ms-language"]')).toHaveText(
      'Language',
    );
    await expect(page.locator('#ms-a11y-panel')).toBeVisible();
    await expect(page.locator(SEL)).toHaveValue('en');
    await expect(page.locator(SEL)).toBeFocused();
    expect(await fabLabel(page)).toBe('Close accessibility panel');
    await expect(page.locator('#ms-container')).toHaveAttribute(
      'lang',
      'en-US',
    );
    await expect(
      page.locator('#ms-a11y-panel [data-action="reset-all"]'),
    ).toHaveText('Turn everything off');

    await escolher(page, 'es');
    await expect(page.locator('label[for="ms-language"]')).toHaveText('Idioma');
    await expect(page.locator('#ms-container')).toHaveAttribute(
      'lang',
      'es-ES',
    );
    expect(await fabLabel(page)).toBe('Cerrar el panel de accesibilidad');
    await expect(
      page.locator('#ms-a11y-panel [data-action="reset-all"]'),
    ).toHaveText('Desactivar todo');

    await escolher(page, 'pt');
    await expect(page.locator('label[for="ms-language"]')).toHaveText('Idioma');
    expect(await fabLabel(page)).toBe('Fechar painel de acessibilidade');
  });

  test('a escolha fica salva: depois do reload a UI nasce em inglês', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(INDEX);
    await waitForLib(page);
    await openPanel(page);
    await escolher(page, 'en');
    await expect(page.locator('label[for="ms-language"]')).toHaveText(
      'Language',
    );
    await page.reload();
    await waitForLib(page);
    expect(await fabLabel(page)).toBe('Open accessibility panel');
    await openPanel(page);
    await expect(page.locator(SEL)).toHaveValue('en');
    await expect(page.locator('label[for="ms-language"]')).toHaveText(
      'Language',
    );
  });

  test('o botão "Linguagem Simples" da barra de sessão segue o idioma sem colidir com o seletor', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(INDEX);
    await waitForLib(page);
    await openPanel(page);
    await escolher(page, 'en');
    const lang = page.locator('[data-action="lang"]');
    await expect(lang).toContainText('Plain Language');
    await expect(page.locator(SEL)).toHaveCount(1);
  });
});

test.describe('Idioma — automático', () => {
  test.use({ locale: 'en-US' });

  test('sem lang no site, "Automático" usa o idioma do navegador', async ({
    site,
  }) => {
    const { page } = site;
    await page.route('**/fixtures/generic.html', async (route) => {
      const res = await route.fetch();
      const body = (await res.text()).replace(' lang="pt-BR"', '');
      await route.fulfill({ response: res, body });
    });
    await page.goto(GENERIC);
    await waitForLib(page);
    expect(await fabLabel(page)).toBe('Open accessibility panel');
    await openPanel(page);
    await expect(page.locator(`${SEL} option`).first()).toHaveText(
      'Automatic (English)',
    );
  });

  test('com lang="pt-BR" no site, "Automático" fica em português mesmo com navegador em inglês', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(GENERIC);
    await waitForLib(page);
    expect(await fabLabel(page)).toBe('Abrir painel de acessibilidade');
  });
});

test.describe('Idioma — demo', () => {
  test('link de pular e tutorial acompanham o idioma', async ({ site }) => {
    const { page } = site;
    await page.goto(INDEX);
    await waitForLib(page);
    await openPanel(page);
    await escolher(page, 'en');
    await expect(page.locator('a.skip-link')).toHaveText('Skip to content');
    await escolher(page, 'es');
    await expect(page.locator('a.skip-link')).toHaveText('Saltar al contenido');
    await page.locator('.ms-a11y-close').click();
    await page.evaluate(() => window.MSTutorial.start());
    const dlg = page.locator('#ms-tutorial [role="dialog"]');
    await expect(dlg).toHaveAttribute(
      'aria-label',
      'Tutorial del panel de accesibilidad',
    );
    await expect(dlg).toContainText('Probemos el panel');
    await page.evaluate(() => window.MSTutorial.end());
    await openPanel(page);
    await escolher(page, 'en');
    await page.locator('.ms-a11y-close').click();
    await page.evaluate(() => window.MSTutorial.start());
    await expect(page.locator('#ms-tutorial [role="dialog"]')).toContainText(
      "Let's try the panel",
    );
  });
});
