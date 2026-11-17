import { test, expect, waitForLib, openPanel } from './helpers.js';

/**
 * IMP-24 — o painel é aria-modal: enquanto aberto, o resto da página fica inert
 * (fora do Tab, do clique e da leitura) e volta ao normal ao fechar.
 */
const INDEX = '/examples/index.html';
const MANUAL = '/tests/e2e/fixtures/manual-select.html';

const inertCount = (page) =>
  page.evaluate(
    () =>
      [...document.body.children].filter(
        (el) =>
          el.id !== 'ms-container' &&
          !el.hasAttribute('data-ms-live') &&
          el.hasAttribute('inert'),
      ).length,
  );
const siblings = (page) =>
  page.evaluate(
    () =>
      [...document.body.children].filter(
        (el) => el.id !== 'ms-container' && !el.hasAttribute('data-ms-live'),
      ).length,
  );

test('painel aberto: irmãos do host inert; fechar desfaz', async ({ site }) => {
  const { page } = site;
  await page.goto(INDEX);
  await waitForLib(page);
  expect(await inertCount(page)).toBe(0);

  await openPanel(page);
  const total = await siblings(page);
  expect(total).toBeGreaterThan(0);
  expect(await inertCount(page)).toBe(total);

  await page.keyboard.press('Escape');
  await expect(page.locator('#ms-a11y-panel')).toBeHidden();
  expect(await inertCount(page)).toBe(0);
});

test('Tab com o painel aberto nunca sai do painel', async ({ site }) => {
  const { page } = site;
  await page.goto(INDEX);
  await waitForLib(page);
  await openPanel(page);

  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    const dentro = await page.evaluate(
      () =>
        document.activeElement?.id === 'ms-container' &&
        !!document
          .getElementById('ms-container')
          .shadowRoot.activeElement?.closest('#ms-a11y-panel'),
    );
    expect(dentro).toBe(true);
  }
});

test('seleção manual iniciada pelo painel: a página não fica inert e o inert volta depois', async ({
  site,
}) => {
  const { page } = site;
  await page.goto(MANUAL);
  await waitForLib(page);
  await openPanel(page);
  expect(await inertCount(page)).toBeGreaterThan(0);

  await page.locator('[data-action="modo-simples"]').click();
  await expect(page.locator('#ms-manual-select-banner')).toBeVisible();
  expect(await inertCount(page)).toBe(0);

  await page.locator('#alvo').dispatchEvent('click'); // o painel cobre a página no mobile
  await expect(page.locator('#alvo')).toHaveAttribute('data-ms-principal', '');
  await expect(page.locator('#ms-a11y-panel')).toBeVisible();
  expect(await inertCount(page)).toBeGreaterThan(0);
});

test('inert: filho tardio do body fica inert; região aria-live do site não (LOW QA T46)', async ({
  site,
}) => {
  const { page } = site;
  await page.goto(INDEX);
  await waitForLib(page);
  await page.evaluate(() => {
    const live = document.createElement('div');
    live.id = 'site-live';
    live.setAttribute('aria-live', 'polite');
    document.body.appendChild(live);
  });
  await openPanel(page);
  await page.evaluate(() => {
    const tardio = document.createElement('div');
    tardio.id = 'tardio';
    document.body.appendChild(tardio);
  });
  await expect(page.locator('#tardio')).toHaveAttribute('inert', '');
  await expect(page.locator('#site-live')).not.toHaveAttribute('inert', '');

  await page.keyboard.press('Escape');
  await expect(page.locator('#tardio')).not.toHaveAttribute('inert', '');
});
