import { test, expect, waitForLib, openPanel } from './helpers.js';

/**
 * F10f (T211) — aviso quando a fala falha / não há voz instalada; Brave sem comandos de voz;
 * 'network' vira "não entende comandos de voz"; Estúdio de Voz só com português + "todas as vozes".
 * speechSynthesis e SpeechRecognition são stubs; cliques são de mouse real.
 */
const PAGE = '/tests/e2e/fixtures/generic.html';
const KEY = 'ms_state:127.0.0.1';
const NOTICE =
  'Seu navegador não conseguiu ler em voz alta: não há voz instalada. No Brave, abra-o com a opção --enable-speech-dispatcher, ou use Chrome ou Edge.';
const VOICES = [
  { name: 'Maria Brasil', lang: 'pt-BR' },
  { name: 'Zeta Inglês', lang: 'en-US' },
];

/**
 * speakError: erro que o utterance recebe ao falar ('' = fala normal)
 * voices: lista de vozes do stub; brave: navigator.brave presente; rec: SpeechRecognition stub
 */
async function boot(
  page,
  { speakError = '', voices = VOICES, brave = false, rec = true } = {},
) {
  await page.addInitScript(
    ([speakErr, vs, isBrave, hasRec]) => {
      // sem available() em HeadlessChrome: o UA vira Chrome como no navegador de verdade
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value: navigator.userAgent.replace('HeadlessChrome', 'Chrome'),
      });
      if (isBrave) {
        Object.defineProperty(navigator, 'brave', {
          configurable: true,
          value: { isBrave: async () => true },
        });
      }
      window.__spoken = [];
      window.SpeechSynthesisUtterance = class {
        constructor(text) {
          this.text = text;
        }
      };
      Object.defineProperty(window, 'speechSynthesis', {
        configurable: true,
        value: {
          speaking: false,
          getVoices: () => vs,
          addEventListener() {},
          removeEventListener() {},
          cancel() {},
          speak(u) {
            window.__spoken.push(u.text);
            if (speakErr) {
              setTimeout(() => u.onerror && u.onerror({ error: speakErr }), 10);
            }
          },
        },
      });
      window.__recs = [];
      delete window.SpeechRecognition;
      delete window.webkitSpeechRecognition;
      if (!hasRec) return;
      class Rec {
        constructor() {
          window.__recs.push(this);
          this.starts = 0;
        }
        start() {
          this.starts++;
        }
        abort() {}
      }
      Rec.available = async () => 'available';
      window.SpeechRecognition = Rec;
      window.__recError = (error) => {
        window.__recs[window.__recs.length - 1].onerror({ error });
      };
    },
    [speakError, voices, brave, rec],
  );
  await page.goto(PAGE);
  await waitForLib(page);
  await openPanel(page);
}

const SW = '[data-option="voiceCommands"]';
const NOTE = '[data-speech-notice]';
const NOTE_STUDIO = '[data-speech-notice-studio]';
const persisted = (page) =>
  page.evaluate((k) => JSON.parse(localStorage.getItem(k)).options, KEY);

/** Clique de verdade (mouse) no centro + confere que o alvo é o que está no ponto e tem >= 44px. */
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

test.describe('F10f — falha de fala e falta de voz', () => {
  test('voz instalada e fala normal: nenhum aviso', async ({ site }) => {
    const { page, errors } = site;
    await boot(page);
    await realClick(page, page.locator('[data-action="speak"]'));
    await page.waitForTimeout(300);
    await expect(page.locator(NOTE)).toHaveText('');
    await expect(page.locator(NOTE_STUDIO)).toBeHidden();
    expect(errors).toEqual([]);
  });

  test('"Ouvir" com synthesis-failed: aviso visível (região viva) perto de Ouvir e do Estúdio de Voz', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { speakError: 'synthesis-failed' });
    await expect(page.locator(NOTE)).toHaveAttribute('role', 'status');
    await expect(page.locator(NOTE)).toHaveAttribute('aria-live', 'polite');
    await realClick(page, page.locator('[data-action="speak"]'));
    await expect(page.locator(NOTE)).toHaveText(NOTICE);
    await expect(page.locator(NOTE)).toBeVisible();
    await expect(page.locator(NOTE_STUDIO)).toBeVisible();
    await expect(page.locator(NOTE_STUDIO)).toHaveText(NOTICE);
    // a leitura parou: o botão volta a "Ouvir" e não sobra "Pausar"
    await expect(page.locator('[data-action="pause"]')).toBeHidden();
    await expect(page.locator('[data-action="speak"]')).toHaveText('Ouvir');
  });

  test('erros "interrupted"/"canceled" não são falha: sem aviso', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { speakError: 'interrupted' });
    await realClick(page, page.locator('[data-action="speak"]'));
    await page.waitForTimeout(400);
    await expect(page.locator(NOTE)).toHaveText('');
  });

  test('nenhuma voz instalada: aviso ao abrir o painel e ao usar Testar voz', async ({
    site,
  }, testInfo) => {
    const { page } = site;
    await boot(page, { voices: [] });
    await expect(page.locator(NOTE)).toHaveText(NOTICE, { timeout: 5000 });
    await expect(page.locator(NOTE_STUDIO)).toBeVisible();
    await realClick(page, page.locator('[data-action="voice-test"]'));
    await expect(page.locator(NOTE)).toHaveText(NOTICE);
    if (process.env.F10F_SHOTS) {
      const vp = page.viewportSize();
      await page.locator(NOTE_STUDIO).scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `${process.env.F10F_SHOTS}/${testInfo.project.name}-${vp.width}x${vp.height}-sem-voz.png`,
      });
    }
  });
});

test.describe('F10f — comandos de voz no Brave e erro de rede', () => {
  test('Brave: interruptor desligado com o motivo do Brave; nada tenta escutar', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { brave: true });
    await expect(page.locator(SW)).toBeDisabled();
    const texto = 'O Brave não permite comandos de voz. Use Chrome ou Edge.';
    await expect(page.locator('[data-vc-status]')).toHaveText(texto);
    await expect(page.locator(SW)).toHaveAttribute('title', texto);
    expect(
      await page.evaluate(() =>
        window.__recs.reduce((n, r) => n + r.starts, 0),
      ),
    ).toBe(0);
  });

  test('erro "network" ao escutar: desliga e explica que o navegador não entende comandos de voz', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await realClick(page, page.locator(SW));
    await expect(page.locator(SW)).toHaveAttribute('aria-checked', 'true');
    await expect
      .poll(() => page.evaluate(() => window.__recs[0]?.starts ?? 0))
      .toBe(1);
    await page.evaluate(() => window.__recError('network'));
    await expect(page.locator(SW)).toHaveAttribute('aria-checked', 'false');
    await expect(page.locator('[data-vc-status]')).toHaveText(
      'Seu navegador não entende comandos de voz. Use Chrome ou Edge.',
    );
    expect((await persisted(page)).voiceCommands).toBe(false);
  });
});

test.describe('F10f — lista de vozes', () => {
  test('só português por padrão; "Mostrar todas as vozes" revela as outras por nome; fica salvo ao escolher', async ({
    site,
  }) => {
    const { page } = site;
    const muitas = [
      { name: 'Maria Brasil', lang: 'pt-BR' },
      { name: 'Zed', lang: 'de-DE' },
      { name: 'Alfa', lang: 'en-US' },
      { name: 'Mike', lang: 'fr-FR' },
    ];
    await boot(page, { voices: muitas });
    const sel = page.locator('[data-voice="voiceName"]');
    const nomes = () =>
      sel.locator('option').evaluateAll((os) => os.map((o) => o.textContent));
    expect(await nomes()).toEqual([
      'Automática (português)',
      'Maria Brasil (pt-BR)',
    ]);
    const all = page.locator('[data-action="voice-all"]');
    await realClick(page, all);
    // agrupado por idioma: pt-BR primeiro, depois os códigos em ordem (de, en, fr)
    expect(await nomes()).toEqual([
      'Automática (português)',
      'Maria Brasil (pt-BR)',
      'Zed (de-DE)',
      'Alfa (en-US)',
      'Mike (fr-FR)',
    ]);
    await sel.selectOption('Alfa');
    await expect
      .poll(async () => (await persisted(page)).voiceName)
      .toBe('Alfa');
    // L3: com uma voz não-pt salva a lista curta só ganha essa voz; o botão recolhe e abre à vontade
    await page.reload();
    await waitForLib(page);
    await openPanel(page);
    await expect(sel).toHaveValue('Alfa');
    await expect(all).toHaveAttribute('aria-pressed', 'false');
    expect(await nomes()).toEqual([
      'Automática (português)',
      'Maria Brasil (pt-BR)',
      'Alfa (en-US)',
    ]);
    await realClick(page, all);
    await expect(all).toHaveAttribute('aria-pressed', 'true');
    expect((await nomes()).length).toBe(5);
    await realClick(page, all);
    await expect(all).toHaveAttribute('aria-pressed', 'false');
    expect((await nomes()).length).toBe(3);
    await expect(sel).toHaveValue('Alfa');
  });

  test('L1: 204 variantes parecidas viram poucas na lista curta, com dica; "todas" agrupa por idioma', async ({
    site,
  }) => {
    const { page } = site;
    const variantes = Array.from({ length: 204 }, (_, i) => ({
      name: `Voz${String(i).padStart(3, '0')}`,
      lang: 'pt-BR',
    }));
    const outras = [
      { name: 'Zed', lang: 'de-DE' },
      { name: 'Alfa', lang: 'en-US' },
    ];
    await boot(page, { voices: [...variantes, ...outras] });
    const sel = page.locator('[data-voice="voiceName"]');
    await expect(sel.locator('option')).toHaveCount(7); // Automática + 6
    await expect(page.locator('[data-voice-hint]')).toBeVisible();
    await expect(page.locator('[data-voice-hint]')).toContainText(
      'Mostrar todas as vozes',
    );
    const all = page.locator('[data-action="voice-all"]');
    await realClick(page, all);
    await expect(page.locator('[data-voice-hint]')).toBeHidden();
    const grupos = await sel
      .locator('optgroup')
      .evaluateAll((gs) =>
        gs.map((g) => [g.label, g.querySelectorAll('option').length]),
      );
    expect(grupos.map(([l]) => l.match(/\(([\w-]+)\)$/)?.[1])).toEqual([
      'pt-BR',
      'de-DE',
      'en-US',
    ]);
    expect(grupos.map(([, n]) => n)).toEqual([204, 1, 1]);
    await expect(sel.locator('option')).toHaveCount(1 + 206);
    await realClick(page, all); // volta a recolher
    await expect(sel.locator('option')).toHaveCount(7);
  });

  test('L1: variante "Nome+Variante" fica fora; ficam os nomes-base', async ({
    site,
  }) => {
    const { page } = site;
    const vs = [
      { name: 'Maria', lang: 'pt-BR' },
      { name: 'Joao', lang: 'pt-BR' },
      ...Array.from({ length: 40 }, (_, i) => ({
        name: `Maria+m${i}`,
        lang: 'pt-BR',
      })),
    ];
    await boot(page, { voices: vs });
    const nomes = await page
      .locator('[data-voice="voiceName"] option')
      .evaluateAll((os) => os.map((o) => o.textContent));
    expect(nomes).toEqual([
      'Automática (português)',
      'Joao (pt-BR)',
      'Maria (pt-BR)',
    ]);
  });

  test('sem voz fora do português, não há botão "Mostrar todas as vozes"', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { voices: [{ name: 'Maria Brasil', lang: 'pt-BR' }] });
    await expect(page.locator('[data-action="voice-all"]')).toBeHidden();
  });
});

for (const [w, h] of [
  [320, 568],
  [390, 844],
]) {
  test(`aviso de falta de voz cabe em ${w}x${h} e o botão "todas as vozes" tem >= 44px`, async ({
    site,
  }, testInfo) => {
    const { page } = site;
    await page.setViewportSize({ width: w, height: h });
    await boot(page, { voices: [{ name: 'Zed', lang: 'de-DE' }] });
    // fala falha (nenhuma voz pt) também avisa: aqui há voz, só não é pt → sem aviso de "não há voz"
    const all = page.locator('[data-action="voice-all"]');
    await all.scrollIntoViewIfNeeded();
    const box = await all.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(43.5);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(w);
    await realClick(page, page.locator('[data-action="speak"]')); // sem erro: nada a avisar
    await expect(page.locator(NOTE)).toHaveText('');
    if (process.env.F10F_SHOTS) {
      await page.waitForTimeout(300);
      await page.screenshot({
        path: `${process.env.F10F_SHOTS}/${testInfo.project.name}-${w}x${h}-todas-as-vozes.png`,
      });
    }
  });
}
