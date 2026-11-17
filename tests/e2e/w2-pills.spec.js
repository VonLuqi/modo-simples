import { test, expect, waitForLib } from './helpers.js';

const INDEX = '/examples/index.html';

async function ligarMS(page) {
  await page.evaluate(() => window.ModoSimples.enable());
  await expect(page.locator('html')).toHaveClass(/ms-ativo/);
}

for (const largura of [390, 1200]) {
  test.describe(`W2 mobile — ${largura}px`, () => {
    test(`UX-06: switch SIMPLES não cobre as pills e não há barra de rolagem horizontal (${largura}px)`, async ({
      site,
    }) => {
      const { page } = site;
      await page.setViewportSize({ width: largura, height: 844 });
      await page.goto(INDEX);
      await waitForLib(page);
      await ligarMS(page);

      const r = await page.evaluate(() => {
        const box = (el) => {
          const b = el.getBoundingClientRect();
          return { l: b.left, r: b.right, t: b.top, b: b.bottom };
        };
        const sw = document.querySelector('.ms-chrome-switch');
        const pills = [...document.querySelectorAll('.ms-pills-nav .ms-pill')];
        const inner = document.querySelector('.ms-pills-nav__inner');
        const s = box(sw);
        const sobrepoe = pills.filter((p) => {
          const b = box(p);
          return b.l < s.r && b.r > s.l && b.t < s.b && b.b > s.t && b.r > b.l;
        }).length;
        return {
          sobrepoe,
          foraDaTela: pills.filter((p) => box(p).r > window.innerWidth + 0.5)
            .length,
          rolagem: inner.scrollWidth > inner.clientWidth + 1,
          docRolagem:
            document.documentElement.scrollWidth > window.innerWidth + 1,
          pills: pills.length,
        };
      });
      expect(r.pills).toBeGreaterThan(0);
      expect(r.sobrepoe).toBe(0);
      expect(r.foraDaTela).toBe(0);
      expect(r.rolagem).toBe(false);
      expect(r.docRolagem).toBe(false);
    });
  });
}
