import { test, expect, waitForLib, openPanel } from './helpers.js';

/**
 * F10b — Estúdio de Voz no painel: voz instalada, velocidade, tom, volume, Testar, Voltar ao padrão.
 * speechSynthesis e SpeechSynthesisUtterance são trocados por stubs que registram o que seria falado.
 */
const PAGE = '/examples/index.html';
const VOICES = [
  { name: 'Zeta Inglês', lang: 'en-US' },
  { name: 'Maria Brasil', lang: 'pt-BR' },
  { name: 'Ana Portugal', lang: 'pt-PT' },
];

async function boot(page, { semVoz = false } = {}) {
  await page.addInitScript(
    ([sem, voices]) => {
      window.__spoken = [];
      if (sem) {
        Object.defineProperty(window, 'speechSynthesis', { value: undefined });
        return;
      }
      window.SpeechSynthesisUtterance = class {
        constructor(text) {
          this.text = text;
        }
      };
      Object.defineProperty(window, 'speechSynthesis', {
        configurable: true,
        value: {
          speaking: false,
          getVoices: () => voices,
          addEventListener() {},
          removeEventListener() {},
          cancel() {},
          speak(u) {
            window.__spoken.push({
              text: u.text,
              voice: u.voice?.name ?? null,
              rate: u.rate,
              pitch: u.pitch,
              volume: u.volume,
              lang: u.lang,
            });
          },
        },
      });
    },
    [semVoz, VOICES],
  );
  await page.goto(PAGE);
  await waitForLib(page);
  await openPanel(page);
}

const spoken = (page) => page.evaluate(() => window.__spoken);
const SEL = '[data-voice="voiceName"]';
const range = (key) => `[data-voice="${key}"]`;

/** Clique de verdade (mouse) no centro do elemento + confere que ele é o que está no ponto. */
async function realClick(page, locator) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(43.5);
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const hit = await locator.evaluate(
    (el, [px, py]) => {
      const top = el.getRootNode().elementFromPoint(px, py);
      return !!top && (top === el || el.contains(top));
    },
    [x, y],
  );
  expect(hit).toBe(true);
  await page.mouse.click(x, y);
}

test.describe('F10b — Estúdio de Voz', () => {
  test('mostra voz (Automática + instaladas, pt primeiro), sliders com valor visível e alvos >= 44px', async ({
    site,
  }) => {
    const { page, errors } = site;
    await boot(page);
    await expect(page.getByText('Estúdio de Voz')).toBeVisible();
    const sel = page.locator(SEL);
    await expect(page.getByLabel('Voz', { exact: true })).toBeVisible();
    const labels = await sel
      .locator('option')
      .evaluateAll((os) => os.map((o) => o.textContent));
    expect(labels).toEqual([
      'Automática (português)',
      'Maria Brasil (pt-BR)',
      'Ana Portugal (pt-PT)',
      'Zeta Inglês (en-US)',
    ]);
    for (const [key, label, text] of [
      ['voiceRate', 'Velocidade', '1,0×'],
      ['voicePitch', 'Tom', '1,0'],
      ['voiceVolume', 'Volume', '100%'],
    ]) {
      await expect(page.getByLabel(label, { exact: true })).toBeVisible();
      await expect(page.locator(range(key))).toHaveAttribute(
        'aria-valuetext',
        text,
      );
      await expect(page.locator(`[data-state-for="${key}"]`)).toHaveText(text);
    }
    for (const s of [SEL, range('voiceRate'), '[data-action="voice-test"]']) {
      const box = await page.locator(s).boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(43.5);
    }
    expect(errors).toEqual([]);
  });

  test('trocar voz e velocidade persiste após recarregar', async ({ site }) => {
    const { page } = site;
    await boot(page);
    await page.locator(SEL).selectOption('Ana Portugal');
    const rate = page.locator(range('voiceRate'));
    await rate.focus();
    await page.keyboard.press('End'); // 2×
    await expect(rate).toHaveAttribute('aria-valuetext', '2,0×');

    await page.reload();
    await waitForLib(page);
    await openPanel(page);
    await expect(page.locator(SEL)).toHaveValue('Ana Portugal');
    await expect(page.locator(range('voiceRate'))).toHaveAttribute(
      'aria-valuetext',
      '2,0×',
    );
  });

  test('Testar voz fala a frase de exemplo com as configurações escolhidas (clique real)', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await page.locator(SEL).selectOption('Maria Brasil');
    await page.locator(range('voiceRate')).focus();
    await page.keyboard.press('Home'); // 0,5×
    await page.locator(range('voicePitch')).focus();
    await page.keyboard.press('End'); // 2
    await page.locator(range('voiceVolume')).focus();
    await page.keyboard.press('Home'); // 10% (mínimo 0,1)
    await realClick(page, page.locator('[data-action="voice-test"]'));
    const out = await spoken(page);
    expect(out.at(-1)).toEqual({
      text: 'Esta é a voz que vai ler para você.',
      voice: 'Maria Brasil',
      rate: 0.5,
      pitch: 2,
      volume: 0.1,
      lang: 'pt-BR',
    });
  });

  test('Voltar ao padrão restaura voz, velocidade, tom e volume', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await page.locator(SEL).selectOption('Zeta Inglês');
    await page.locator(range('voiceRate')).focus();
    await page.keyboard.press('End');
    await realClick(page, page.locator('[data-action="voice-reset"]'));
    await expect(page.locator(SEL)).toHaveValue('');
    await expect(page.locator(range('voiceRate'))).toHaveAttribute(
      'aria-valuetext',
      '1,0×',
    );
  });

  test('L1 (WCAG 2.5.3): o nome acessível de cada botão começa pelo texto visível', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    for (const action of ['voice-test', 'voice-reset']) {
      const { visivel, nome } = await page
        .locator(`[data-action="${action}"]`)
        .evaluate((b) => ({
          visivel: b.textContent.trim(),
          nome: b.getAttribute('aria-label') || b.textContent.trim(),
        }));
      expect(nome.toLowerCase().startsWith(visivel.toLowerCase())).toBe(true);
    }
    await expect(
      page.getByRole('button', { name: 'Voltar ao padrão', exact: false }),
    ).toHaveCount(1);
  });

  test('L2: o seletor de voz não é reconstruído a cada atualização do painel (menu em uso)', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    const sel = page.locator(SEL);
    await sel.focus();
    await sel.evaluate((s) => {
      s.querySelector('option').__marca = true; // se reconstruir, o nó some
    });
    // dispara atualizações do painel (sync) sem tirar o foco do seletor
    for (const v of ['1.5', '1.6', '1.7']) {
      await page.locator(range('voiceRate')).evaluate((i, val) => {
        i.value = val;
        i.dispatchEvent(new Event('input', { bubbles: true }));
      }, v);
    }
    await expect(page.locator(range('voiceRate'))).toHaveAttribute(
      'aria-valuetext',
      '1,7×',
    );
    expect(
      await sel.evaluate((s) => s.querySelector('option').__marca === true),
    ).toBe(true);
    await expect(sel).toBeFocused();
  });

  test('sem speechSynthesis: controles desligados com o motivo', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { semVoz: true });
    await expect(page.locator(SEL)).toBeDisabled();
    await expect(page.locator(range('voiceRate'))).toBeDisabled();
    await expect(page.locator('[data-action="voice-test"]')).toBeDisabled();
    await expect(
      page.getByText(
        'Este navegador não tem voz para ler. Tente outro navegador.',
      ),
    ).toBeVisible();
  });
});
