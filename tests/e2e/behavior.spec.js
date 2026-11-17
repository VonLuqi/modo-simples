import { test, expect, waitForLib, openPanel } from './helpers.js';

const INDEX = '/examples/index.html';
const GENERIC = '/tests/e2e/fixtures/generic.html';

const htmlHasClass = (page, cls) =>
  page.evaluate((c) => document.documentElement.classList.contains(c), cls);

test.describe('Modo Simples: ligar e desligar', () => {
  test('pela barra do protótipo: Ativar → Voltar, com foco coerente (UX-18/20)', async ({
    site,
  }) => {
    const { page, errors } = site;
    await page.goto(INDEX);
    await waitForLib(page);

    const ativar = page.locator('#ms-session-bar [data-action="activate"]');
    await expect(ativar).toBeVisible();
    await ativar.click();

    await expect.poll(() => htmlHasClass(page, 'ms-ativo')).toBe(true);
    const voltar = page.locator('#ms-session-bar [data-action="exit"]');
    await expect(voltar).toBeVisible();
    // foco vai ao título do estado ligado
    await expect(page.locator('.ms-session-on-title')).toBeFocused();

    await voltar.click();
    await expect.poll(() => htmlHasClass(page, 'ms-ativo')).toBe(false);
    await expect(ativar).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('botões da barra têm alvo de pelo menos 44px (UX-18/20)', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(INDEX);
    await waitForLib(page);

    const medidas = async (sel) =>
      page.locator(sel).evaluate((el) => {
        const r = el.getBoundingClientRect();
        return { w: r.width, h: r.height };
      });

    const a = await medidas('[data-action="activate"]');
    expect(a.h).toBeGreaterThanOrEqual(44);
    await page.locator('[data-action="activate"]').click();
    const v = await medidas('[data-action="exit"]');
    expect(v.h).toBeGreaterThanOrEqual(44);
  });

  test('pela API window.ModoSimples: enable / disable / toggle', async ({
    site,
  }) => {
    const { page, errors } = site;
    await page.goto(GENERIC);
    await waitForLib(page);

    await page.evaluate(() => window.ModoSimples.enable());
    await expect.poll(() => htmlHasClass(page, 'ms-ativo')).toBe(true);
    await expect(page.locator('main[data-ms-principal]')).toHaveCount(1);

    await page.evaluate(() => window.ModoSimples.disable());
    await expect.poll(() => htmlHasClass(page, 'ms-ativo')).toBe(false);
    await expect(page.locator('[data-ms-principal]')).toHaveCount(0);

    await page.evaluate(() => window.ModoSimples.toggle());
    await expect.poll(() => htmlHasClass(page, 'ms-ativo')).toBe(true);
    expect(errors).toEqual([]);
  });

  test('a preferência persiste ao recarregar', async ({ site }) => {
    const { page } = site;
    await page.goto(GENERIC);
    await waitForLib(page);
    await page.evaluate(() => window.ModoSimples.enable());
    await expect.poll(() => htmlHasClass(page, 'ms-ativo')).toBe(true);

    await page.reload();
    await waitForLib(page);
    await expect.poll(() => htmlHasClass(page, 'ms-ativo')).toBe(true);
  });
});

test.describe('painel: teclado e foco', () => {
  test('Enter no FAB abre; foco entra no painel; Esc fecha e devolve o foco', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(GENERIC);
    await waitForLib(page);

    await page.locator('#ms-fab').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#ms-a11y-panel')).toBeVisible();
    await expect(page.locator('.ms-a11y-close')).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(page.locator('#ms-a11y-panel')).toBeHidden();
    await expect(page.locator('#ms-fab')).toBeFocused();
  });

  test('Tab não escapa do painel aberto (foco preso)', async ({ site }) => {
    const { page } = site;
    await page.goto(GENERIC);
    await waitForLib(page);
    await openPanel(page);

    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Tab');
      const dentro = await page.evaluate(() => {
        const host = document.getElementById('ms-container');
        const ativo = host.shadowRoot.activeElement;
        return (
          !!ativo &&
          host.shadowRoot.getElementById('ms-a11y-panel').contains(ativo)
        );
      });
      expect(dentro, `Tab ${i + 1} saiu do painel`).toBe(true);
    }
  });

  test('o FAB expõe estado: aria-expanded e rótulo', async ({ site }) => {
    const { page } = site;
    await page.goto(GENERIC);
    await waitForLib(page);
    const fab = page.locator('#ms-fab');

    await expect(fab).toHaveAttribute('aria-expanded', 'false');
    await openPanel(page);
    await expect(fab).toHaveAttribute('aria-expanded', 'true');
    await expect(fab).toHaveAttribute('aria-label', /Fechar painel/);
  });
});

test.describe('fonte Lexend sob demanda (IMP-04)', () => {
  test('nenhum pedido ao Google Fonts até o usuário ligar a opção', async ({
    site,
  }) => {
    const { page, external } = site;
    await page.goto(GENERIC);
    await waitForLib(page);
    await expect(page.locator('#ms-lexend-font')).toHaveCount(0);
    expect(external).toEqual([]);

    await openPanel(page);
    await page.locator('.ms-switch[data-option="dyslexiaFont"]').click();

    const link = page.locator('link#ms-lexend-font');
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute(
      'href',
      /fonts\.googleapis\.com.*Lexend/,
    );
    expect(external.some((u) => u.includes('fonts.googleapis.com'))).toBe(true);
  });
});

/** Razão de contraste WCAG entre duas cores "rgb(r, g, b)" */
function contraste(a, b) {
  const lum = (css) => {
    const [r, g, bl] = css
      .match(/\d+(\.\d+)?/g)
      .slice(0, 3)
      .map(Number);
    const f = (c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl);
  };
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

test.describe('contraste de componentes (WCAG 1.4.11): o axe não mede', () => {
  test('UX-02: trilho do interruptor desligado contra o fundo do painel ≥ 3:1', async ({
    site,
  }) => {
    // Regressão do UX-02: trilho #64748b sobre branco = 4,76:1 (antes #cbd5e1 = 1,48:1).
    const { page } = site;
    await page.goto(GENERIC);
    await waitForLib(page);
    await openPanel(page);

    const { trilho, fundo } = await page
      .locator('.ms-switch[data-option="dyslexiaFont"]')
      .evaluate((el) => {
        let bg = el.parentElement;
        while (
          bg &&
          /rgba\(0, 0, 0, 0\)|transparent/.test(
            getComputedStyle(bg).backgroundColor,
          )
        ) {
          bg = bg.parentElement;
        }
        return {
          trilho: getComputedStyle(el).backgroundColor,
          fundo: bg
            ? getComputedStyle(bg).backgroundColor
            : 'rgb(255, 255, 255)',
        };
      });
    expect(contraste(trilho, fundo)).toBeGreaterThanOrEqual(3);
  });

  test('UX-02 (QA MED-1): trilho LIGADO do switch do painel contra o card ≥ 3:1', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(INDEX);
    await waitForLib(page);
    await openPanel(page);
    const sw = page.locator('[data-action="modo-simples"]');
    await sw.click();
    await expect(sw).toHaveAttribute('aria-checked', 'true');

    // a cor do trilho tem transition de 0,18s: espera assentar
    await expect
      .poll(async () => {
        const { trilho, fundo } = await sw.evaluate((el) => {
          const card = el.closest('.ms-a11y-card--simple');
          return {
            trilho: getComputedStyle(el).backgroundColor,
            fundo: getComputedStyle(card).backgroundColor,
          };
        });
        return contraste(trilho, fundo);
      })
      .toBeGreaterThanOrEqual(3);
  });
});

test.describe('estado visual do FAB e do painel', () => {
  test('UX-30: com o painel aberto o FAB mostra X e esconde os sliders', async ({
    site,
  }) => {
    // Regressão do UX-30: SVGElement não tem `.hidden`; o FAB usa toggleAttribute('hidden').
    const { page } = site;
    await page.goto(GENERIC);
    await waitForLib(page);

    await expect(page.locator('.ms-fab-icon--open')).toBeVisible();
    await expect(page.locator('.ms-fab-icon--close')).toBeHidden();

    await openPanel(page);
    await expect(page.locator('.ms-fab-icon--close')).toBeVisible();
    await expect(page.locator('.ms-fab-icon--open')).toBeHidden();
  });

  test('UX-05: o painel cabe inteiro na janela (390x844 no mobile)', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(GENERIC);
    await waitForLib(page);
    await openPanel(page);

    const box = await page.locator('#ms-a11y-panel').boundingBox();
    const viewport = page.viewportSize();
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  });

  test('UX-08 (QA LOW-3): recarregar antes dos 6s não mostra a dica de novo', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(INDEX);
    await waitForLib(page);
    await expect(page.locator('.ms-fab-tip')).toBeVisible();

    await page.reload();
    await waitForLib(page);
    await expect(page.locator('.ms-fab-tip')).toBeHidden();
  });
});
