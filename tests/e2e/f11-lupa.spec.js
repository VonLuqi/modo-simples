import { test, expect, waitForLib } from './helpers.js';

/**
 * T239 — passo "Lupa de texto" do tutorial: a película bloqueia o mouse e o painel cobre a página,
 * então a lupa ligada nunca mostrava nada. Agora o passo DEMONSTRA sozinho (caixa de lupa com o
 * texto de um título visível da página) e o mouse sobre a película também aciona a lupa.
 */
const INDEX = '/examples/index.html';
const STEPS = 34;
const BOX = '#ms-text-magnifier';

const nextBtn = (page) => page.locator('.ms-tut-btn--primary');
const count = (page) => page.locator('.ms-tut-count');

async function ateLupa(page) {
  await page.locator('.header-tutorial').click();
  await expect(count(page)).toHaveText(`Passo 1 de ${STEPS}`);
  const n =
    1 +
    (await page.evaluate(() =>
      window.MSTutorialStrings.steps.findIndex(
        (s) => s.tool && s.tool.o === 'textMagnifier',
      ),
    ));
  for (let i = 2; i <= n; i++) {
    await nextBtn(page).focus();
    await page.keyboard.press('Enter');
    await expect(count(page)).toHaveText(`Passo ${i} de ${STEPS}`);
  }
  return n;
}

const boxInfo = (page) =>
  page.evaluate((sel) => {
    const b = document.querySelector(sel);
    if (!b) return null;
    const r = b.getBoundingClientRect();
    const bal = document
      .querySelector('.ms-tut-balloon')
      .getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const top = document.elementFromPoint(cx, cy);
    return {
      shown: getComputedStyle(b).display !== 'none' && r.width > 0,
      text: b.textContent,
      font: parseFloat(getComputedStyle(b).fontSize),
      inView:
        r.left >= 0 &&
        r.top >= 0 &&
        r.right <= innerWidth &&
        r.bottom <= innerHeight,
      overBalloon:
        r.left < bal.right &&
        bal.left < r.right &&
        r.top < bal.bottom &&
        bal.top < r.bottom,
      topIsBox: top === b || b.contains(top),
    };
  }, BOX);

for (const vp of [
  { name: '1280', width: 1280, height: 800 },
  { name: '390', width: 390, height: 844 },
]) {
  test.describe(`lupa no tutorial (${vp.name}px)`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    // fonte larga = o que o CI tem sem a Lexend (webfont bloqueada, fonte de reserva mais larga)
    for (const larga of [false, true]) {
      test(`o passo mostra a caixa da lupa sozinho, legível e fora do balão${larga ? ' (fonte larga, como no CI)' : ''}`, async ({
        site,
      }) => {
        const { page } = site;
        if (larga)
          await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) =>
            r.abort(),
          );
        await page.goto(INDEX);
        await waitForLib(page);
        if (larga) {
          await page.addStyleTag({
            content:
              'html, body, body * { font-family: "DejaVu Sans", sans-serif !important; }',
          });
        }
        await ateLupa(page);
        await page.waitForTimeout(400);
        await page.screenshot({
          path: `test-results/lupa-${vp.name}${larga ? '-larga' : ''}.png`,
        });
        await expect(page.locator(BOX)).toBeVisible();
        const info = await boxInfo(page);
        expect(info.shown).toBe(true);
        expect(info.text.length).toBeGreaterThan(5);
        expect(info.font).toBeGreaterThanOrEqual(32);
        expect(info.inView).toBe(true);
        expect(info.overBalloon).toBe(false);
      });
    }

    test('a caixa some ao avançar e o estado do visitante é restaurado', async ({
      site,
    }) => {
      const { page } = site;
      await page.goto(INDEX);
      await waitForLib(page);
      const n = await ateLupa(page);
      await expect(page.locator(BOX)).toBeVisible();
      await nextBtn(page).focus();
      await page.keyboard.press('Enter');
      await expect(count(page)).toHaveText(`Passo ${n + 1} de ${STEPS}`);
      await expect(page.locator(BOX)).toHaveCount(0);
      // fim: Esc encerra e nada fica ligado
      await page.keyboard.press('Escape');
      await expect(page.locator('#ms-tutorial')).toHaveCount(0);
      await expect(page.locator(BOX)).toHaveCount(0);
    });
  });
}

test('mouse sobre um texto da página (por cima da película) aciona a lupa', async ({
  site,
}) => {
  const { page } = site;
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(INDEX);
  await waitForLib(page);
  await ateLupa(page);
  // alvo real: um título/parágrafo visível da página, fora do painel e do balão
  const alvo = await page.evaluate(() => {
    const bal = document
      .querySelector('.ms-tut-balloon')
      .getBoundingClientRect();
    const panel = document
      .getElementById('ms-container')
      .shadowRoot.querySelector('#ms-a11y-panel')
      .getBoundingClientRect();
    const hit = (r, x, y) =>
      x > r.left && x < r.right && y > r.top && y < r.bottom;
    for (const el of document.querySelectorAll(
      'main h2, main h3, main p, main li',
    )) {
      const r = el.getBoundingClientRect();
      if (r.width < 80 || r.height < 12 || r.top < 0 || r.bottom > innerHeight)
        continue;
      const x = r.left + 20;
      const y = r.top + r.height / 2;
      if (!hit(bal, x, y) && !hit(panel, x, y))
        return { x, y, text: el.textContent.trim().slice(0, 20) };
    }
    return null;
  });
  expect(alvo).not.toBeNull();
  await page.mouse.move(alvo.x, alvo.y);
  await page.mouse.move(alvo.x + 3, alvo.y + 1);
  await expect(page.locator(BOX)).toBeVisible();
  const info = await boxInfo(page);
  expect(info.text).toContain(alvo.text.slice(0, 10));
});
