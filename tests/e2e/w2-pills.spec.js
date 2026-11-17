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

test('W4c: pills no tema darkHigh — texto ≥ 4.5:1 e borda ≥ 3:1 (AA)', async ({
  site,
}) => {
  const { page } = site;
  await page.goto(INDEX);
  await waitForLib(page);
  await ligarMS(page);
  await page.evaluate(() =>
    document.documentElement.classList.add('ms-theme-darkHigh'),
  );
  await page.waitForTimeout(500); // pill tem transition de 0.15s no fundo
  const r = await page.evaluate(() => {
    const rgb = (c) =>
      c
        .match(/[\d.]+/g)
        .slice(0, 3)
        .map(Number);
    const lum = (c) => {
      const [R, G, B] = rgb(c).map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * R + 0.7152 * G + 0.0722 * B;
    };
    const ratio = (a, b) => {
      const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
      return (x + 0.05) / (y + 0.05);
    };
    const nav = getComputedStyle(document.querySelector('.ms-pills-nav'));
    return [...document.querySelectorAll('.ms-pills-nav .ms-pill')].map((p) => {
      const cs = getComputedStyle(p);
      return {
        atual: p.getAttribute('aria-current') === 'page',
        texto: ratio(cs.color, cs.backgroundColor),
        borda: ratio(cs.borderTopColor, nav.backgroundColor),
      };
    });
  });
  expect(r.length).toBeGreaterThan(1);
  for (const p of r) {
    expect(p.texto).toBeGreaterThanOrEqual(4.5);
    // a pill atual tem fundo próprio (#38bdf8 sobre #0f172a); a inativa usa a borda
    expect(p.borda).toBeGreaterThanOrEqual(3);
  }
});
