import { test, expect, waitForLib, openPanel } from './helpers.js';

/**
 * IMP-22 — com confiança baixa a seleção manual só aplica o Modo Simples depois de confirmar.
 * Fixture com confidenceThreshold alto: sempre cai na seleção manual.
 */
const PAGE = '/tests/e2e/fixtures/manual-select.html';
const BANNER = '#ms-manual-select-banner';
const NOTICE = '#ms-low-confidence-notice';

/** teclado: o mouse parado sobre a página não vira "Escolha atual" por hover */
async function escolherPeloTeclado(page) {
  await page.locator(NOTICE).getByText('Escolher o conteúdo').focus();
  await page.keyboard.press('Enter');
}

/** liga o Modo Simples (confiança baixa → aviso) e pede a seleção manual opcional */
async function ligarEEscolher(page) {
  await page.evaluate(() => window.ModoSimples.enable());
  await escolherPeloTeclado(page);
}

const ocultos = (page) => page.locator('[data-ms-hidden="true"]');
const principais = (page) => page.locator('[data-ms-principal]');

test.describe('seleção manual (IMP-22)', () => {
  test('enquanto o usuário escolhe, nada é ocultado', async ({ site }) => {
    const { page, errors } = site;
    await page.goto(PAGE);
    await waitForLib(page);
    await page.evaluate(() => window.ModoSimples.enable());

    // UX-21: aviso em linguagem simples; a seleção manual só abre se o usuário pedir
    await expect(page.locator(NOTICE)).toBeVisible();
    await expect(page.locator(NOTICE)).toContainText(
      'Não achei o conteúdo principal, quer escolher?',
    );
    await expect(page.locator(BANNER)).toHaveCount(0);
    await expect(page.locator('html')).toHaveClass(/ms-ativo/);
    await expect(ocultos(page)).toHaveCount(0);
    await expect(principais(page)).toHaveCount(0);

    await escolherPeloTeclado(page);
    await expect(page.locator(BANNER)).toBeVisible();
    await expect(ocultos(page)).toHaveCount(0);
    await expect(principais(page)).toHaveCount(0);
    await expect(page.locator('#lateral')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('confirmar: oculta em volta da escolha e fecha o banner', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(PAGE);
    await waitForLib(page);
    await ligarEEscolher(page);

    // #alvo (não <main>): no mobile o banner fixo cobre o centro da página curta
    await page.locator('#alvo').click();

    await expect(page.locator(BANNER)).toHaveCount(0);
    await expect(page.locator('#alvo')).toHaveAttribute(
      'data-ms-principal',
      '',
    );
    await expect(page.locator('#lateral')).toBeHidden();
    await expect(page.locator('header.topo')).toBeHidden();
  });

  test('cancelar (botão): nada oculto, SEM principal e a página continua inteira', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(PAGE);
    await waitForLib(page);
    await ligarEEscolher(page);

    await page.locator(`${BANNER} button`).click();

    await expect(page.locator(BANNER)).toHaveCount(0);
    await expect(ocultos(page)).toHaveCount(0);
    await expect(principais(page)).toHaveCount(0);
    await expect(page.locator('#lateral')).toBeVisible();
    await expect(page.locator('html')).toHaveClass(/ms-ativo/);
    // sem principal, o max-width do principal não estreita a página (antes: body virava principal)
    const maxWidth = await page.evaluate(
      () => getComputedStyle(document.body).maxWidth,
    );
    expect(maxWidth).toBe('none');
  });

  test('cancelar (Esc): mesmo resultado', async ({ site }) => {
    const { page } = site;
    await page.goto(PAGE);
    await waitForLib(page);
    await ligarEEscolher(page);

    await page.keyboard.press('Escape');

    await expect(page.locator(BANNER)).toHaveCount(0);
    await expect(ocultos(page)).toHaveCount(0);
    await expect(principais(page)).toHaveCount(0);
  });

  test('depois de cancelar, uma mutação do host não escolhe principal sozinha', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(PAGE);
    await waitForLib(page);
    await ligarEEscolher(page);
    await page.locator(`${BANNER} button`).click();

    await page.evaluate(() => {
      const el = document.createElement('div');
      el.className = 'banner novo';
      el.textContent = 'slide do carrossel';
      document.body.appendChild(el);
    });
    await page.waitForTimeout(800); // > debounce (300 ms)

    await expect(principais(page)).toHaveCount(0);
    await expect(ocultos(page)).toHaveCount(0);
  });
});

test.describe('seleção manual — teclado e toque (IMP-07)', () => {
  test('Tab escolhe, Enter confirma: oculta em volta e fecha o banner', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(PAGE);
    await waitForLib(page);
    await ligarEEscolher(page);
    await expect(page.locator(BANNER)).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator(BANNER)).toContainText('Você escolheu: main');
    await expect(page.locator('#ms-manual-select-highlight')).toBeVisible();
    await page.keyboard.press('Enter');

    await expect(page.locator(BANNER)).toHaveCount(0);
    await expect(page.locator('main')).toHaveAttribute('data-ms-principal', '');
    await expect(page.locator('#lateral')).toBeHidden();
  });

  test('Enter sem escolha não confirma; Shift+Tab percorre ao contrário; Esc cancela', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(PAGE);
    await waitForLib(page);
    await ligarEEscolher(page);

    await page.keyboard.press('Enter');
    await expect(page.locator(BANNER)).toBeVisible();
    await page.keyboard.press('Shift+Tab'); // do início volta ao Cancelar (LOW-1)
    await expect(page.locator(`${BANNER} button`)).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator(BANNER)).toContainText('Você escolheu:');
    await page.keyboard.press('Escape');
    await expect(page.locator(BANNER)).toHaveCount(0);
    await expect(principais(page)).toHaveCount(0);
  });

  test('Cancelar é alcançável por Tab e Enter nele cancela sem escolher (QA R34 LOW-1)', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(PAGE);
    await waitForLib(page);
    await ligarEEscolher(page);

    const cancelar = page.locator(`${BANNER} button`);
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      if (await cancelar.evaluate((el) => el === document.activeElement)) break;
    }
    await expect(cancelar).toBeFocused();
    await page.keyboard.press('Tab'); // o ciclo volta ao primeiro candidato
    await expect(page.locator(BANNER)).toContainText('Você escolheu:');
    await page.keyboard.press('Shift+Tab');
    await expect(cancelar).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page.locator(BANNER)).toHaveCount(0);
    await expect(principais(page)).toHaveCount(0);
  });

  test('Esc devolve o foco ao controle do painel que iniciou a seleção (QA R34 LOW-2)', async ({
    site,
  }) => {
    const { page } = site;
    await page.goto(PAGE);
    await waitForLib(page);
    await openPanel(page);

    const interruptor = page.locator('[data-action="modo-simples"]');
    await interruptor.focus();
    await page.keyboard.press('Enter'); // liga o MS → aviso de confiança baixa
    await escolherPeloTeclado(page);
    await expect(page.locator(BANNER)).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator(BANNER)).toHaveCount(0);
    await expect(interruptor).toBeFocused();
  });

  test('toque (tap) no conteúdo escolhe como o clique', async ({
    site,
  }, testInfo) => {
    test.skip(!testInfo.project.use.hasTouch, 'só no projeto mobile');
    const { page } = site;
    await page.goto(PAGE);
    await waitForLib(page);
    await ligarEEscolher(page);

    await page.locator('#alvo').tap();

    await expect(page.locator(BANNER)).toHaveCount(0);
    await expect(page.locator('#alvo')).toHaveAttribute(
      'data-ms-principal',
      '',
    );
  });
});
