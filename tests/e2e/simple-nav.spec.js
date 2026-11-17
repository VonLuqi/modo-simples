import { test, expect, waitForLib } from './helpers.js';

const GENERIC = '/tests/e2e/fixtures/generic.html';

/** IMP-42 — configure({ simpleNav }) não injeta links com esquema perigoso. */
test.describe('simpleNav: href seguro (IMP-42)', () => {
  test('javascript: e data: são descartados; relativo, https e mailto passam', async ({
    site,
  }) => {
    const { page, errors } = site;
    await page.goto(GENERIC);
    await waitForLib(page);

    await page.evaluate(() =>
      window.ModoSimples.configure({
        simpleNav: [
          { label: 'Ruim 1', href: 'javascript:window.__pwned = 1' },
          { label: 'Ruim 2', href: 'data:text/html,<b>x</b>' },
          { label: 'Cursos', href: '#cursos' },
          { label: 'Site', href: 'https://exemplo.com/' },
          { label: 'Email', href: 'mailto:oi@exemplo.com' },
        ],
      }),
    );

    const hrefs = await page
      .locator('nav[data-ms-injected] a.ms-pill')
      .evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    expect(hrefs).toEqual([
      '#cursos',
      'https://exemplo.com/',
      'mailto:oi@exemplo.com',
    ]);

    // e nada executou
    expect(await page.evaluate(() => window.__pwned)).toBeUndefined();
    expect(errors).toEqual([]);
  });
});
