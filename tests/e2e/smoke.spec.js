import { readdirSync } from 'node:fs';
import { test, expect, waitForLib } from './helpers.js';

const EXAMPLES = readdirSync(new URL('../../examples', import.meta.url))
  .filter((f) => f.endsWith('.html'))
  .sort();

const GENERIC = '/tests/e2e/fixtures/generic.html';

test.describe('examples/*.html carregam o bundle sem erro (IMP-49)', () => {
  for (const file of EXAMPLES) {
    test(file, async ({ site }) => {
      const { page, errors } = site;
      await page.goto(`/examples/${file}`);
      await waitForLib(page);
      await expect(page.locator('#ms-fab')).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  test('há pelo menos as 9 páginas do protótipo', () => {
    expect(EXAMPLES.length).toBeGreaterThanOrEqual(9);
  });
});

test.describe('host genérico (sem ModoSimplesConfig)', () => {
  test('só FAB + painel; nenhuma requisição externa no init', async ({
    site,
  }) => {
    const { page, errors, external } = site;
    await page.goto(GENERIC);
    await waitForLib(page);

    await expect(page.locator('#ms-fab')).toBeVisible();
    await expect(page.locator('#ms-a11y-panel')).toBeHidden();
    // barra de sessão é opt-in: não entra no DOM do host
    await expect(page.locator('#ms-session-bar')).toHaveCount(0);
    await expect(page.locator('#ms-simples-chrome')).toHaveCount(0);

    expect(external, 'nenhum pedido a terceiros no init').toEqual([]);
    expect(errors).toEqual([]);
  });

  test('painel genérico não exibe marca do protótipo', async ({ site }) => {
    const { page } = site;
    await page.goto(GENERIC);
    await waitForLib(page);
    const texto = await page.locator('#ms-a11y-panel').textContent();
    expect(texto).not.toMatch(/senac|projeto integrador/i);
  });
});

test.describe('host com html { font-size: 62.5% } (IMP-05)', () => {
  const REM = '/tests/e2e/fixtures/rem-trick.html';
  const htmlFont = (page) =>
    page.evaluate(() => getComputedStyle(document.documentElement).fontSize);

  test('a lib não troca o tamanho-base do host ao subir', async ({ site }) => {
    const { page } = site;
    await page.goto(REM);
    await waitForLib(page);
    expect(await htmlFont(page)).toBe('10px');
    await expect(page.locator('h1')).toHaveCSS('font-size', '32px');
  });

  test('ligar o Modo Simples também não mexe no tamanho-base', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(REM);
    await waitForLib(page);
    await page.evaluate(() => window.ModoSimples.enable());
    await expect(page.locator('html')).toHaveClass(/ms-ativo/);
    expect(await htmlFont(page)).toBe('10px');
  });

  test('só quando o usuário pede texto maior o tamanho-base muda', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(REM);
    await waitForLib(page);
    await page.evaluate(() => {
      const root = document.querySelector('#ms-container').shadowRoot;
      root
        .querySelector('[data-option="textScale"] [data-value="125"]')
        .click();
    });
    await expect(page.locator('html')).toHaveClass(/ms-text-scale-125/);
    expect(await htmlFont(page)).toBe('20px'); // 125% de 16px: escolha explícita do usuário
  });
});

test.describe('auto-boot desligado (IMP-32)', () => {
  const OFF = '/tests/e2e/fixtures/autoboot-off.html';

  test('data-ms-autoboot="false": nada é injetado até o integrador subir', async ({
    site,
  }) => {
    const { page, errors } = site;
    await page.goto(OFF);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => !!window.ModoSimplesClass);
    expect(await page.locator('#ms-container').count()).toBe(0);
    expect(await page.evaluate(() => typeof window.ModoSimples)).toBe(
      'undefined',
    );

    // sobe manualmente (a classe fica exposta; ModoSimplesBoot respeita ModoSimplesConfig)
    await page.evaluate(() => window.ModoSimplesBoot());
    await waitForLib(page);
    await expect(page.locator('#ms-fab')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('a classe exposta permite subir com config própria', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(OFF);
    await page.waitForFunction(() => !!window.ModoSimplesClass);
    await page.evaluate(() => {
      const inst = new window.ModoSimplesClass({ position: 'top-left' });
      inst.init();
      window.ModoSimples = inst;
    });
    await waitForLib(page);
    const css = await page.evaluate(
      () =>
        document
          .querySelector('#ms-container')
          .shadowRoot.querySelector('style').textContent,
    );
    expect(css).toContain('top: 1.5rem;left: 1.5rem;');
  });
});
