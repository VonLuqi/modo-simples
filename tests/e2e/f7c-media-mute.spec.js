import { test, expect, waitForLib, openPanel } from './helpers.js';

/**
 * F7c — "Pausar e mutar tudo": pausa e muta vídeo/áudio (também os que aparecem depois),
 * desligar devolve o muted anterior sem dar play, iframe de outro site recebe aviso.
 */
const PAGE = '/tests/e2e/fixtures/media.html';
const SWITCH = '[data-option="muteMedia"]';
const BADGE = '[data-ms-media-badge]';

/** WAV mudo de 2 s gerado na hora (sem arquivo nem rede) */
const WAV = () => {
  const n = 16000;
  const b = new Uint8Array(44 + n).fill(128);
  const dv = new DataView(b.buffer);
  const w = (o, s) => [...s].forEach((c, i) => (b[o + i] = c.charCodeAt(0)));
  w(0, 'RIFF');
  dv.setUint32(4, 36 + n, true);
  w(8, 'WAVEfmt ');
  dv.setUint32(16, 16, true);
  dv.setUint16(20, 1, true);
  dv.setUint16(22, 1, true);
  dv.setUint32(24, 8000, true);
  dv.setUint32(28, 8000, true);
  dv.setUint16(32, 1, true);
  dv.setUint16(34, 8, true);
  w(36, 'data');
  dv.setUint32(40, n, true);
  return URL.createObjectURL(new Blob([b], { type: 'audio/wav' }));
};

async function boot(page) {
  await page.goto(PAGE);
  await waitForLib(page);
  // iframe externo sem rede: o fixture não precisa carregá-lo
  await page.click('h1'); // gesto real: libera play() com som
  await page.evaluate(async (mk) => {
    const wav = eval(`(${mk})`)();
    for (const id of ['video', 'audio']) {
      const el = document.getElementById(id);
      el.src = wav;
      el.muted = false;
      el.play().catch(() => {});
    }
  }, WAV.toString());
  await page.waitForFunction(
    () =>
      !document.getElementById('video').paused &&
      !document.getElementById('audio').paused,
  );
}

const state = (page, id) =>
  page.evaluate((i) => {
    const el = document.getElementById(i);
    return { muted: el.muted, paused: el.paused };
  }, id);

test.describe('F7c — Pausar e mutar tudo', () => {
  test('ligar pausa e muta; desligar devolve o som sem dar play', async ({
    site,
  }) => {
    const { page, errors } = site;
    await boot(page);
    expect(await state(page, 'video')).toEqual({ muted: false, paused: false });

    await openPanel(page);
    await page.locator('#ms-sec-motion-btn').click(); // seção "Movimento e imagens"
    await page.locator(SWITCH).click();
    await expect(page.locator(SWITCH)).toHaveAttribute('aria-checked', 'true');
    for (const id of ['video', 'audio']) {
      expect(await state(page, id)).toEqual({ muted: true, paused: true });
    }

    await page.locator(SWITCH).click();
    await expect(page.locator(SWITCH)).toHaveAttribute('aria-checked', 'false');
    for (const id of ['video', 'audio']) {
      expect(await state(page, id)).toEqual({ muted: false, paused: true });
    }
    expect(errors).toEqual([]);
  });

  test('mídia que aparece depois (autoplay) nasce muda e sem autoplay', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await openPanel(page);
    await page.locator('#ms-sec-motion-btn').click(); // seção "Movimento e imagens"
    await page.locator(SWITCH).click();

    await page.evaluate(() => {
      const a = document.createElement('audio');
      a.id = 'tardio';
      a.setAttribute('autoplay', '');
      document.querySelector('main').appendChild(a);
    });
    await expect
      .poll(() => page.evaluate(() => document.getElementById('tardio').muted))
      .toBe(true);
    expect(
      await page.evaluate(() =>
        document.getElementById('tardio').hasAttribute('autoplay'),
      ),
    ).toBe(false);
  });

  test('iframe de outro site: aviso por cima que não bloqueia clique; some ao desligar', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await openPanel(page);
    await page.locator('#ms-sec-motion-btn').click(); // seção "Movimento e imagens"
    await page.locator(SWITCH).click();

    const aviso = page.locator(BADGE);
    await expect(aviso).toHaveCount(1);
    await expect(aviso).toHaveText(
      'Este vídeo é de outro site. Não consigo tirar o som dele.',
    );
    expect(
      await aviso.evaluate((el) => getComputedStyle(el).pointerEvents),
    ).toBe('none');

    await page.locator(SWITCH).click();
    await expect(aviso).toHaveCount(0);
  });

  test('vídeo criado DEPOIS dentro de shadow root já existente também é mutado (QA T144 M2)', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page);
    await page.evaluate(() => {
      const host = document.createElement('div');
      host.id = 'sh';
      host.attachShadow({ mode: 'open' });
      document.querySelector('main').appendChild(host);
    });
    await openPanel(page);
    await page.locator('#ms-sec-motion-btn').click();
    await page.locator(SWITCH).click();
    await page.evaluate(() => {
      const v = document.createElement('video');
      v.id = 'tardio-sh';
      v.setAttribute('autoplay', '');
      document.getElementById('sh').shadowRoot.appendChild(v);
    });
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.getElementById('sh').shadowRoot.getElementById('tardio-sh')
              .muted,
        ),
      )
      .toBe(true);
  });
});
