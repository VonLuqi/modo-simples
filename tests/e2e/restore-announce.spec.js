import { test, expect, waitForLib } from './helpers.js';

/**
 * UX-19 — modo restaurado ao carregar outra página: sem anúncio a cada navegação;
 * um único aviso "continua ligado" por sessão. Ligar pelo usuário continua anunciando.
 */
const INDEX = '/examples/index.html';
const LIVE = '[data-ms-live]';

test('restaurar o modo avisa uma vez por sessão, não a cada página', async ({
  site,
}) => {
  const { page } = site;
  await page.goto(INDEX);
  await waitForLib(page);
  await page.evaluate(() => window.ModoSimples.enable()); // ação do usuário: anuncia
  await expect(page.locator(LIVE).first()).toHaveText(/Modo Simples ativado/);

  await page.reload(); // 1ª restauração da sessão
  await waitForLib(page);
  await expect(page.locator('html')).toHaveClass(/ms-ativo/);
  await expect(page.locator(LIVE).first()).toHaveText(
    'Modo Simples continua ligado',
  );

  await page.reload(); // 2ª restauração: em silêncio
  await waitForLib(page);
  await expect(page.locator('html')).toHaveClass(/ms-ativo/);
  await page.waitForTimeout(400); // > atraso do announce (50 ms)
  await expect(page.locator(LIVE)).toHaveCount(0);
});
