/**
 * Insere / atualiza nav pills do Modo Simples (F5-T05).
 * node scripts/sync-ms-pills.cjs
 */
const fs = require('fs');
const path = require('path');

const examples = path.join(__dirname, '..', 'examples');

const PAGES = [
  { file: 'index.html', current: 'index.html' },
  { file: 'sobrenos.html', current: null },
  { file: 'cursos.html', current: 'cursos.html' },
  { file: 'psg.html', current: 'psg.html' },
  { file: 'unidades.html', current: 'unidades.html' },
  { file: 'contato.html', current: 'contato.html' },
  { file: 'aluno.html', current: 'aluno.html' },
  { file: 'pesquisa.html', current: null },
];

const PILLS = [
  { href: 'index.html', short: 'Início', full: 'Início / O que precisa?' },
  { href: 'cursos.html', short: 'Cursos', full: 'Cursos Disponíveis' },
  { href: 'psg.html', short: 'Gratuitos (PSG)', full: 'Cursos 100% Gratuitos (PSG)' },
  { href: 'unidades.html', short: 'Unidades', full: 'Onde tem Senac?' },
  { href: 'contato.html', short: 'Atendente', full: 'Falar com Atendente' },
  { href: 'aluno.html', short: 'Área do Aluno', full: 'Área do Aluno' },
];

function pillsHtml(current) {
  const links = PILLS.map((p) => {
    const cur = p.href === current ? ' aria-current="page"' : '';
    return `        <a class="ms-pill" href="${p.href}"${cur}><span class="ms-pill__full">${p.full}</span><span class="ms-pill__short">${p.short}</span></a>`;
  }).join('\n');

  return `    <nav class="ms-pills-nav ms-simple-only" data-ms-pills aria-label="Navegação do Modo Simples">
      <div class="container ms-pills-nav__inner">
${links}
      </div>
    </nav>`;
}

const blockRe =
  /\s*<nav class="ms-pills-nav[\s\S]*?<\/nav>\s*/;

for (const { file, current } of PAGES) {
  const full = path.join(examples, file);
  if (!fs.existsSync(full)) {
    console.warn('SKIP', file);
    continue;
  }
  let html = fs.readFileSync(full, 'utf8');
  html = html.replace(blockRe, '\n');

  const insert = `\n${pillsHtml(current)}\n`;
  if (!html.includes('</header>')) {
    console.error('FAIL sem </header>:', file);
    process.exitCode = 1;
    continue;
  }
  html = html.replace('</header>', `</header>${insert}`);
  fs.writeFileSync(full, html);
  console.log('OK  ', file);
}
