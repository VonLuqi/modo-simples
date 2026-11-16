import {
  test,
  expect,
  waitForLib,
  openPanel,
  expectNoNewViolations,
} from './helpers.js';

/**
 * axe (WCAG 2.0/2.1/2.2 A+AA) com o modo desligado, ligado e com o painel aberto,
 * no protótipo (index) e num host genérico. Violações conhecidas ficam em
 * a11y-baseline.json, cada uma com o id do achado que as corrige (F3).
 */
const PAGES = [
  { name: 'index', url: '/examples/index.html' },
  { name: 'generic', url: '/tests/e2e/fixtures/generic.html' },
];

for (const { name, url } of PAGES) {
  test.describe(`axe — ${name}`, () => {
    test('modo desligado', async ({ site }, testInfo) => {
      const { page } = site;
      await page.goto(url);
      await waitForLib(page);
      await expectNoNewViolations(page, testInfo, `${name}/ms-off`);
    });

    test('modo ligado', async ({ site }, testInfo) => {
      const { page } = site;
      await page.goto(url);
      await waitForLib(page);
      await page.evaluate(() => window.ModoSimples.enable());
      await expect
        .poll(() =>
          page.evaluate(() =>
            document.documentElement.classList.contains('ms-ativo'),
          ),
        )
        .toBe(true);
      await expectNoNewViolations(page, testInfo, `${name}/ms-on`);
    });

    test('painel aberto', async ({ site }, testInfo) => {
      const { page } = site;
      await page.goto(url);
      await waitForLib(page);
      await openPanel(page);
      await expectNoNewViolations(page, testInfo, `${name}/panel`);
    });

    // axe só avalia o que está visível: rola o corpo do painel para checar a parte de baixo
    test('painel aberto, rolado até o fim', async ({ site }, testInfo) => {
      const { page } = site;
      await page.goto(url);
      await waitForLib(page);
      await openPanel(page);
      await page
        .locator('.ms-a11y-body')
        .evaluate((el) => el.scrollTo(0, el.scrollHeight));
      await expectNoNewViolations(page, testInfo, `${name}/panel-fim`);
    });
  });
}
