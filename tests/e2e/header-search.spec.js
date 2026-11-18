import { readdirSync } from 'node:fs';
import { test, expect, waitForLib } from './helpers.js';

/**
 * T238 — "Pesquisar" duplicado no cabeçalho do demo: em qualquer largura há exatamente UM
 * controle de busca visível por página (o botão do cabeçalho), igual em todas as páginas
 * (3.2.3), e o nav não encosta nele.
 */
const PAGES = readdirSync(new URL('../../examples', import.meta.url))
  .filter((f) => f.endsWith('.html') && f !== 'hello-modo-simples.html')
  .sort();

const buscasVisiveis = (page) =>
  page.evaluate(() => {
    const vis = (n) => {
      const r = n.getBoundingClientRect();
      const cs = getComputedStyle(n);
      return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden';
    };
    return [...document.querySelectorAll('header a[href="pesquisa.html"]')]
      .filter(vis)
      .map((a) => a.className);
  });

for (const width of [390, 768, 1024, 1280]) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    for (const file of PAGES) {
      test(`${file}: um só controle "Pesquisar" visível`, async ({ site }) => {
        const { page } = site;
        await page.goto(`/examples/${file}`);
        await waitForLib(page);
        expect(await buscasVisiveis(page)).toEqual([
          expect.stringContaining('header-search'),
        ]);
      });
    }

    test('menu aberto não repete a busca e o nav não encosta no botão', async ({
      site,
    }) => {
      const { page } = site;
      await page.goto('/examples/index.html');
      await waitForLib(page);
      const toggle = page.locator('.nav-toggle');
      if (await toggle.isVisible()) await toggle.click();
      expect(await buscasVisiveis(page)).toHaveLength(1);
      await expect(
        page.locator('.main-nav a[href="pesquisa.html"]'),
      ).toHaveCount(0);
      if (!(await toggle.isVisible())) {
        const folga = await page.evaluate(() => {
          const ultimo = [...document.querySelectorAll('.main-nav li a')].pop();
          const btn = document.querySelector('.header-search');
          return (
            btn.getBoundingClientRect().left -
            ultimo.getBoundingClientRect().right
          );
        });
        expect(folga).toBeGreaterThan(0);
      }
    });
  });
}
