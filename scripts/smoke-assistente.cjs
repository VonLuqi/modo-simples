/**
 * Smoke leve do assistente (F5-T07) — filtra dados stub sem browser.
 */
const path = require('path');
const fs = require('fs');
const vm = require('vm');

const dataPath = path.join(__dirname, '..', 'examples', 'js', 'cursos-data.js');
const code = fs.readFileSync(dataPath, 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(code, sandbox);
const data = sandbox.window.MS_CURSOS_DATA;

if (!Array.isArray(data) || data.length < 5) {
  console.error('FAIL: MS_CURSOS_DATA precisa de ≥ 5 cursos');
  process.exit(1);
}

const free = data.filter((c) => c.isFreePSG);
const tech = data.filter((c) => c.category === 'Tecnologia');
const bh = data.filter((c) => c.cities.includes('Belo Horizonte'));

if (free.length < 3) {
  console.error('FAIL: poucos cursos PSG');
  process.exit(1);
}
if (!tech.length || !bh.length) {
  console.error('FAIL: filtros categoria/cidade vazios');
  process.exit(1);
}

console.log('OK   cursos-data:', data.length, 'cursos,', free.length, 'PSG');
console.log('Smoke assistente OK');
