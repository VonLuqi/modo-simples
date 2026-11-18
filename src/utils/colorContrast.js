/**
 * utils/colorContrast.js — contraste WCAG para as cores personalizadas (F8a QA M1/M2).
 * Só entende #rrggbb (o estado já é sanitizado antes de chegar aqui).
 */

const HEX = /^#[0-9a-f]{6}$/i;

/** Luminância relativa WCAG 2.x de um #rrggbb. */
export function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razão de contraste WCAG (1–21) entre dois #rrggbb. */
export function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Preto ou branco, o que contrasta mais com `hex`. */
export const readableOn = (hex) =>
  luminance(hex) > 0.179 ? '#000000' : '#ffffff';

/** Cor de link com ≥ 4,5:1 sobre `bg`; entre azul escuro e azul claro, o de maior contraste. */
export function linkOn(bg) {
  const best = ['#0000cc', '#93c5fd'].sort(
    (a, b) => contrastRatio(b, bg) - contrastRatio(a, bg),
  )[0];
  return contrastRatio(best, bg) >= 4.5 ? best : readableOn(bg);
}

/**
 * Fundo automático (preto ou branco) para texto e/ou título escolhidos: o que dá o maior pior-caso
 * de contraste entre os dois; em empate (ex.: texto branco + título preto) vale o do texto.
 */
function autoBg(t, h) {
  const refs = [t, h].filter(Boolean);
  if (!refs.length) return '';
  const score = (c) => Math.min(...refs.map((r) => contrastRatio(r, c)));
  const [black, white] = [score('#000000'), score('#ffffff')];
  if (Math.abs(black - white) < 0.01) return readableOn(t || h);
  return black > white ? '#000000' : '#ffffff';
}

/**
 * Cores efetivas a partir do que o usuário definiu: o lado não definido ganha a contraparte
 * legível (preto/branco) do lado definido, para nunca sobrar texto do site sobre fundo escolhido
 * (ou vice-versa). Sem nenhuma escolha → tudo vazio (o site manda).
 * @returns {{ text: string, heading: string, bg: string, link: string }}
 */
export function effectiveColors({ customText, customHeading, customBg }) {
  const ok = (v) => (HEX.test(v || '') ? v : '');
  const t = ok(customText);
  const h = ok(customHeading);
  const b = ok(customBg);
  const bg = b || autoBg(t, h);
  const text = t || (bg ? readableOn(bg) : '');
  return { text, heading: h, bg, link: bg ? linkOn(bg) : '' };
}
