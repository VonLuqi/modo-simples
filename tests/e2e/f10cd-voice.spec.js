import { test, expect, waitForLib } from './helpers.js';

/**
 * F10c (pausar/retomar a leitura) e F10d (comandos de voz) pela API pública, sem painel.
 * speechSynthesis e SpeechRecognition são stubs; o estado inicial vem do localStorage
 * (mesmo caminho de quem ligou antes e recarregou a página).
 */
const PAGE = '/tests/e2e/fixtures/generic.html';
const KEY = 'ms_state:127.0.0.1';

/**
 * @param {import('@playwright/test').Page} page
 * @param {{voiceCommands?: boolean, consent?: boolean, rec?: 'none'|'cloud'|'local'|'download'}} o
 *   rec: 'none' = sem SpeechRecognition; 'cloud' = sem .available; 'local' = available() → 'available'; 'download' = available() → 'downloadable'
 */
async function boot(
  page,
  { voiceCommands = false, consent = false, rec = 'local' } = {},
) {
  await page.addInitScript(
    ([key, vc, cs, mode]) => {
      try {
        if (!localStorage.getItem(key)) {
          localStorage.setItem(
            key,
            JSON.stringify({
              v: 1,
              modoSimples: false,
              options: { voiceCommands: vc, voiceCloudConsent: cs },
            }),
          );
        }
      } catch {
        /* sem storage */
      }
      window.__spoken = [];
      window.__utts = [];
      window.__cancels = 0;
      window.__pending = [];
      Object.defineProperty(window, 'speechSynthesis', {
        configurable: true,
        value: {
          speaking: false,
          getVoices: () => [],
          cancel() {
            window.__cancels++;
            // como no navegador: a fala em curso recebe onerror depois, de forma assíncrona
            for (const u of window.__pending.splice(0)) {
              setTimeout(
                () => u.onerror && u.onerror({ error: 'canceled' }),
                0,
              );
            }
          },
          speak(u) {
            window.__spoken.push(u.text);
            window.__utts.push({ text: u.text, rate: u.rate, lang: u.lang });
            window.__pending.push(u);
          },
        },
      });
      // termina a fala atual como se o navegador tivesse acabado de falar
      window.__endCurrent = () =>
        window.__pending[window.__pending.length - 1].onend();

      window.__recs = [];
      // o Chromium real tem os dois construtores: o stub manda; 'none' os remove
      delete window.SpeechRecognition;
      delete window.webkitSpeechRecognition;
      if (mode === 'none') return;
      class Rec {
        constructor() {
          this.starts = 0;
          this.aborted = false;
          window.__recs.push(this);
        }
        start() {
          this.starts++;
        }
        abort() {
          this.aborted = true;
        }
      }
      if (mode === 'local') Rec.available = async () => 'available';
      if (mode === 'download') Rec.available = async () => 'downloadable';
      window.SpeechRecognition = Rec;
      window.__say = (text) => {
        const r = window.__recs[window.__recs.length - 1];
        r.onresult({
          resultIndex: 0,
          results: [Object.assign([{ transcript: text }], { isFinal: true })],
        });
      };
      window.__recError = (error) => {
        window.__recs[window.__recs.length - 1].onerror({ error });
      };
    },
    [KEY, voiceCommands, consent, rec],
  );
  await page.goto(PAGE);
  await waitForLib(page);
}

const say = (page, text) => page.evaluate((t) => window.__say(t), text);
const spoken = (page) => page.evaluate(() => window.__spoken);
const persisted = (page) =>
  page.evaluate((k) => JSON.parse(localStorage.getItem(k)).options, KEY);
const listening = (page) =>
  expect
    .poll(() =>
      page.evaluate(() =>
        window.__recs.some((r) => r.starts > 0 && !r.aborted),
      ),
    )
    .toBe(true);
const flipsOff = (page) =>
  expect.poll(async () => (await persisted(page)).voiceCommands).toBe(false);

/** Parágrafo longo (vários pedaços de fala) no início do conteúdo principal. */
const addLongParagraph = (page) =>
  page.evaluate(() => {
    const p = document.createElement('p');
    p.textContent =
      'Frase um com algumas palavras. '.repeat(8) +
      'Outra frase mais curta. '.repeat(16);
    document.querySelector('main').prepend(p);
  });

test.describe('F10d — modo de reconhecimento e consentimento', () => {
  test('local (available): escuta com processLocally=true e pt-BR, sem pedir consentimento', async ({
    site,
  }) => {
    const { page, errors } = site;
    await boot(page, { voiceCommands: true, rec: 'local' });
    await listening(page);
    const r = await page.evaluate(() => ({
      local: window.__recs[0].processLocally,
      lang: window.__recs[0].lang,
      continuous: window.__recs[0].continuous,
    }));
    expect(r).toEqual({ local: true, lang: 'pt-BR', continuous: true });
    expect((await persisted(page)).voiceCommands).toBe(true);
    expect(errors).toEqual([]);
  });

  test('nuvem SEM consentimento: nunca chama start e o interruptor desliga (e segue desligado ao recarregar)', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { voiceCommands: true, consent: false, rec: 'cloud' });
    await flipsOff(page);
    expect(
      await page.evaluate(() => window.__recs.map((r) => r.starts)),
    ).toEqual([]);
    await page.reload();
    await waitForLib(page);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.__recs.length)).toBe(0);
    expect((await persisted(page)).voiceCommands).toBe(false);
  });

  test('nuvem COM voiceCloudConsent: escuta sem processLocally; ao recarregar continua', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { voiceCommands: true, consent: true, rec: 'cloud' });
    await listening(page);
    expect(await page.evaluate(() => window.__recs[0].processLocally)).toBe(
      undefined,
    );
    await page.reload();
    await waitForLib(page);
    await listening(page);
    expect((await persisted(page)).voiceCommands).toBe(true);
  });

  test('modelo local por baixar + consentimento: escuta em nuvem (sem processLocally) e segue ligado', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { voiceCommands: true, consent: true, rec: 'download' });
    await listening(page);
    expect(await page.evaluate(() => window.__recs[0].processLocally)).toBe(
      undefined,
    );
    expect((await persisted(page)).voiceCommands).toBe(true);
  });

  test('modelo local por baixar SEM consentimento: não escuta e desliga (needs-model)', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { voiceCommands: true, consent: false, rec: 'download' });
    await flipsOff(page);
    expect(await page.evaluate(() => window.__recs.length)).toBe(0);
    expect(await page.evaluate(() => window.ModoSimples.voiceStatus)).toBe(
      'needs-model',
    );
  });

  test('status pela instância: voiceStatus e onVoiceStatus acompanham escutar, bloquear e desligar', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { voiceCommands: true, rec: 'local' });
    await listening(page);
    await expect
      .poll(() => page.evaluate(() => window.ModoSimples.voiceStatus))
      .toBe('listening');
    await page.evaluate(() => {
      window.__seen = [];
      window.__off = window.ModoSimples.onVoiceStatus((s) =>
        window.__seen.push(s),
      );
      window.__recError('not-allowed');
    });
    await flipsOff(page);
    expect(await page.evaluate(() => window.__seen)).toEqual(['blocked']);
    expect(await page.evaluate(() => window.ModoSimples.voiceStatus)).toBe(
      'blocked',
    );
    await page.evaluate(() => window.__off());
  });

  test('sem SpeechRecognition: não escuta e o interruptor desliga', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { voiceCommands: true, rec: 'none' });
    await flipsOff(page);
  });

  test('microfone negado (not-allowed): para e desliga; recarregar não religa', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { voiceCommands: true, rec: 'local' });
    await listening(page);
    await page.evaluate(() => window.__recError('not-allowed'));
    await flipsOff(page);
    expect(await page.evaluate(() => window.__recs[0].aborted)).toBe(true);
    await page.reload();
    await waitForLib(page);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.__recs.length)).toBe(0);
  });

  test('sem microfone (audio-capture): para, desliga e não reinicia em laço', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { voiceCommands: true, rec: 'local' });
    await listening(page);
    await page.evaluate(() => window.__recError('audio-capture'));
    await flipsOff(page);
    expect(await page.evaluate(() => window.__recs[0].aborted)).toBe(true);
    expect(await page.evaluate(() => window.__recs[0].starts)).toBe(1);
  });

  test('erro desconhecido (bad-grammar): para e desliga; no-speech continua escutando', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { voiceCommands: true, rec: 'local' });
    await listening(page);
    await page.evaluate(() => window.__recError('no-speech'));
    expect((await persisted(page)).voiceCommands).toBe(true);
    await page.evaluate(() => window.__recError('bad-grammar'));
    await flipsOff(page);
  });

  test('mais de 5 reinícios em 10 s: para e desliga (sem laço)', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { voiceCommands: true, rec: 'local' });
    await listening(page);
    await page.evaluate(() => {
      for (let i = 0; i < 6; i++) window.__recs[0].onend();
    });
    await flipsOff(page);
    expect(await page.evaluate(() => window.__recs[0].starts)).toBe(6);
  });

  test('desligado por padrão: sem opção salva, nada escuta', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { voiceCommands: false, rec: 'local' });
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.__recs.length)).toBe(0);
  });
});

test.describe('F10c — pausar e retomar a leitura (por comando de voz)', () => {
  test('pausar e continuar: re-fala o mesmo pedaço e segue dali', async ({
    site,
  }) => {
    const { page, errors } = site;
    await boot(page, { voiceCommands: true, rec: 'local' });
    await listening(page);
    await addLongParagraph(page);

    await say(page, 'ler página');
    await expect.poll(() => spoken(page).then((s) => s.length)).toBe(1);
    await page.evaluate(() => window.__endCurrent()); // pedaço 0 → pedaço 1
    await expect.poll(() => spoken(page).then((s) => s.length)).toBe(2);
    const [, atual] = await spoken(page);

    await say(page, 'pausar');
    await page.waitForTimeout(50); // o onerror da fala cancelada não pode avançar a fila
    expect((await spoken(page)).length).toBe(2);

    await say(page, 'continuar');
    const s = await spoken(page);
    expect(s.length).toBe(3);
    expect(s[2]).toBe(atual); // mesmo pedaço, não o início do bloco
    await page.evaluate(() => window.__endCurrent());
    expect((await spoken(page)).length).toBe(4);
    expect(errors).toEqual([]);
  });

  test('parar limpa a pausa: continuar depois não fala mais nada', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { voiceCommands: true, rec: 'local' });
    await listening(page);
    await say(page, 'ler página');
    await expect.poll(() => spoken(page).then((s) => s.length)).toBe(1);
    await say(page, 'pausar');
    await say(page, 'parar');
    await say(page, 'continuar');
    await page.waitForTimeout(100);
    expect((await spoken(page)).length).toBe(1);
  });
});

test.describe('F10d — frases reconhecidas', () => {
  test('"ler página" fala o conteúdo principal; "mais rápido" sobe a velocidade para 1,1 e persiste', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { voiceCommands: true, rec: 'local' });
    await listening(page);
    await say(page, 'ler página');
    await expect.poll(() => spoken(page).then((s) => s.length)).toBe(1);
    expect((await spoken(page))[0]).toContain('Bem-vindo');
    expect(await page.evaluate(() => window.__utts[0].rate)).toBe(1);

    await say(page, 'mais rápido');
    await expect.poll(async () => (await persisted(page)).voiceRate).toBe(1.1);
    await say(page, 'ler página'); // recomeça já na nova velocidade
    await expect.poll(() => spoken(page).then((s) => s.length)).toBe(2);
    expect(await page.evaluate(() => window.__utts[1].rate)).toBeCloseTo(
      1.1,
      5,
    );
  });

  test('"parar" cancela a fala em curso', async ({ site }) => {
    const { page } = site;
    await boot(page, { voiceCommands: true, rec: 'local' });
    await listening(page);
    await say(page, 'ler página');
    await expect.poll(() => spoken(page).then((s) => s.length)).toBe(1);
    const antes = await page.evaluate(() => window.__cancels);
    await say(page, 'parar');
    expect(await page.evaluate(() => window.__cancels)).toBeGreaterThan(antes);
  });

  test('"ligar modo simples" liga e "abrir painel" abre o painel; frase solta é ignorada', async ({
    site,
  }) => {
    const { page } = site;
    await boot(page, { voiceCommands: true, rec: 'local' });
    await listening(page);

    await say(page, 'bom dia a todos');
    await page.waitForTimeout(100);
    await expect(page.locator('html')).not.toHaveClass(/ms-ativo/);

    await say(page, 'ligar modo simples');
    await expect(page.locator('html')).toHaveClass(/ms-ativo/);

    await say(page, 'abrir painel');
    await expect(page.locator('#ms-a11y-panel')).toBeVisible();
  });
});
