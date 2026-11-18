import { test, expect, waitForLib, openPanel } from './helpers.js';

/**
 * F9e — "Teclado virtual": teclado ABNT2 pt-BR na tela que escreve nos campos de texto da página.
 */
const PAGE = '/tests/e2e/fixtures/virtual-keyboard.html';
const KB = '#ms-virtual-keyboard';

async function open(page) {
  await page.goto(PAGE);
  await waitForLib(page);
  await openPanel(page);
  const sec = page.locator('#ms-sec-pageTools-btn');
  if ((await sec.getAttribute('aria-expanded')) !== 'true') await sec.click();
  await page.locator('[data-action="virtual-keyboard"]').click();
  await expect(page.locator(KB)).toBeVisible();
}

const isMobile = (info) => info.project.name === 'mobile';
async function press(page, info, def) {
  const k = page.locator(`${KB} [data-vk="${def}"]`).first();
  if (isMobile(info)) await k.tap();
  else await k.click();
}
async function typeKeys(page, info, defs) {
  for (const d of defs) await press(page, info, d);
}
const active = (page) => page.evaluate(() => document.activeElement?.id);
const logOf = (page) => page.evaluate(() => window.__log);

// "ação Ünico"
const ACAO_UNICO = [
  'a',
  'ç',
  '~^',
  'a',
  'o',
  'Space',
  'Shift',
  '6¨',
  'Shift',
  'u',
  'n',
  'i',
  'c',
  'o',
];

test.describe('F9e — Teclado virtual', () => {
  test('abre pelo painel com a dica; ao focar um campo mostram-se as teclas', async ({
    site,
  }) => {
    const { page } = site;
    await open(page);
    await expect(page.locator(`${KB} [data-vk-hint]`)).toBeVisible();
    await expect(page.locator(`${KB} [data-vk-hint]`)).toHaveText(
      'Toque num campo de texto',
    );
    await page.locator('#t').focus();
    await expect(page.locator(`${KB} [data-vk-keys]`)).toBeVisible();
    await expect(page.locator(`${KB} [data-vk-hint]`)).toBeHidden();
    await page.locator('#ro').focus(); // readonly: não escreve
    await expect(page.locator(`${KB} [data-vk-hint]`)).toBeVisible();
  });

  test('escreve "ação Ünico" no input e no textarea sem tirar o foco; o framework vê os eventos', async ({
    site,
  }, info) => {
    const { page } = site;
    await open(page);
    for (const id of ['t', 'ta']) {
      await page.locator(`#${id}`).focus();
      await typeKeys(page, info, ACAO_UNICO);
      expect(await active(page)).toBe(id);
      await expect(page.locator(`#${id}`)).toHaveValue('ação Ünico');
    }
    const log = await logOf(page);
    const doInput = log.filter((l) => l.id === 't');
    expect(doInput.every((l) => l.type === 'insertText')).toBe(true);
    expect(doInput.at(-1).value).toBe('ação Ünico');
    expect(doInput.length).toBeGreaterThanOrEqual(10);
  });

  test('Backspace apaga (deleteContentBackward); Enter no textarea quebra a linha', async ({
    site,
  }, info) => {
    const { page } = site;
    await open(page);
    await page.locator('#ta').focus();
    await typeKeys(page, info, ['o', 'k', 'Enter', 'x', 'Backspace']);
    await expect(page.locator('#ta')).toHaveValue('ok\n');
    const log = await logOf(page);
    expect(log.at(-1).type).toBe('deleteContentBackward');
  });

  test('Enter no campo de pesquisa envia o formulário', async ({
    site,
  }, info) => {
    const { page } = site;
    await open(page);
    await page.locator('#q').focus();
    await typeKeys(page, info, ['o', 'i', 'Enter']);
    await expect(page.locator('#q')).toHaveValue('oi');
    expect(await page.evaluate(() => window.__submits)).toBe(1);
  });

  test('contenteditable recebe o texto', async ({ site }, info) => {
    const { page } = site;
    await open(page);
    await page.locator('#ce').focus();
    await typeKeys(page, info, ['p', '~^', 'a', 'o']);
    await expect(page.locator('#ce')).toHaveText('pão');
  });

  test('Fechar restaura o inputmode do campo e desfaz a reserva de espaço', async ({
    site,
  }, info) => {
    const { page } = site;
    await page.goto(PAGE);
    await waitForLib(page);
    await page.evaluate(() =>
      document.getElementById('t').setAttribute('inputmode', 'text'),
    );
    await openPanel(page);
    await page.locator('#ms-sec-pageTools-btn').click();
    await page.locator('[data-action="virtual-keyboard"]').click();
    await page.locator('#t').focus();
    const mode = () => page.locator('#t').getAttribute('inputmode');
    expect(await mode()).toBe(isMobile(info) ? 'none' : 'text');
    expect(
      await page.evaluate(() =>
        parseFloat(getComputedStyle(document.body).paddingBottom),
      ),
    ).toBeGreaterThan(30);
    await press(page, info, 'Fechar');
    await expect(page.locator(KB)).toHaveCount(0);
    expect(await mode()).toBe('text');
    expect(
      await page.evaluate(() =>
        parseFloat(getComputedStyle(document.body).paddingBottom),
      ),
    ).toBeLessThanOrEqual(16);
  });

  test('o teclado não cobre o campo (rola para cima dele) e as teclas têm ≥ 44px', async ({
    site,
  }) => {
    const { page } = site;
    await open(page);
    await page.locator('#last').focus();
    await expect(page.locator(`${KB} [data-vk-keys]`)).toBeVisible();
    const m = await page.evaluate(() => {
      const kb = document
        .getElementById('ms-virtual-keyboard')
        .getBoundingClientRect();
      const f = document.getElementById('last').getBoundingClientRect();
      const keys = [
        ...document.querySelectorAll('#ms-virtual-keyboard [data-vk]'),
      ].map((b) => {
        const r = b.getBoundingClientRect();
        return { w: r.width, h: r.height };
      });
      return {
        kbTop: kb.top,
        fBottom: f.bottom,
        fTop: f.top,
        minW: Math.min(...keys.map((k) => k.w)),
        minH: Math.min(...keys.map((k) => k.h)),
      };
    });
    expect(m.fBottom).toBeLessThanOrEqual(m.kbTop);
    expect(m.fTop).toBeGreaterThanOrEqual(0);
    expect(m.minW).toBeGreaterThanOrEqual(44);
    expect(m.minH).toBeGreaterThanOrEqual(44);
  });

  test('"Desligar tudo" fecha o teclado', async ({ site }) => {
    const { page } = site;
    await open(page);
    await openPanel(page);
    await page.locator('[data-action="reset-all"]').click();
    await expect(page.locator(KB)).toHaveCount(0);
  });
});
