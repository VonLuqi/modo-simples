/**
 * Atualiza o bloco nav principal em todas as páginas do mapa (F5-T04) e garante o
 * script do botão "Menu" (UX-25): em telas estreitas o nav vira um menu recolhível.
 * node scripts/sync-nav.cjs
 */
const fs = require('fs');
const path = require('path');

const examples = path.join(__dirname, '..', 'examples');

const PAGES = [
  { file: 'index.html', current: 'index.html' },
  { file: 'sobrenos.html', current: 'sobrenos.html' },
  { file: 'cursos.html', current: 'cursos.html' },
  { file: 'psg.html', current: 'psg.html' },
  { file: 'unidades.html', current: 'unidades.html' },
  { file: 'contato.html', current: 'contato.html' },
  { file: 'aluno.html', current: 'aluno.html' },
  { file: 'pesquisa.html', current: 'pesquisa.html' },
];

const ITEMS = [
  { href: 'index.html', label: 'Início' },
  { href: 'sobrenos.html', label: 'Sobre Nós' },
  { href: 'cursos.html', label: 'Cursos' },
  { href: 'psg.html', label: 'Gratuitos (PSG)' },
  { href: 'unidades.html', label: 'Unidades' },
  { href: 'contato.html', label: 'Contato' },
  { href: 'aluno.html', label: 'Área do Aluno' },
];

const NAV_SCRIPT = '<script src="js/nav-toggle.js" defer></script>';

function navHtml(current) {
  const lis = ITEMS.map((item) => {
    const cur = item.href === current ? ' aria-current="page"' : '';
    return `            <li><a href="${item.href}"${cur}>${item.label}</a></li>`;
  }).join('\n');
  return `        <nav class="main-nav" aria-label="Menu principal">
          <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="main-nav-list">Menu</button>
          <ul id="main-nav-list">
${lis}
          </ul>
        </nav>`;
}

const navRe =
  /[ \t]*<nav class="main-nav" aria-label="Menu principal">[\s\S]*?<\/nav>/;

for (const { file, current } of PAGES) {
  const full = path.join(examples, file);
  if (!fs.existsSync(full)) {
    console.warn('SKIP (ainda não existe):', file);
    continue;
  }
  let html = fs.readFileSync(full, 'utf8');
  if (!navRe.test(html)) {
    console.error('FAIL nav não encontrado:', file);
    process.exitCode = 1;
    continue;
  }
  html = html.replace(navRe, navHtml(current));
  if (!html.includes('js/nav-toggle.js')) {
    html = html.replace(/[ \t]*<\/body>/, `    ${NAV_SCRIPT}\n  </body>`);
  }
  fs.writeFileSync(full, html);
  console.log('OK  ', file);
}
