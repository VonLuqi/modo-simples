/**
 * Assistente de Cursos — busca, chips de área, cidade e PSG (F5-T07).
 *
 * Uso:
 *   <div id="curso-assistente" data-mode="all|psg"></div>
 *   <script src="js/cursos-data.js"></script>
 *   <script src="js/cursos-assistente.js"></script>
 */
(function () {
  var root = document.getElementById('curso-assistente');
  if (!root) return;

  var data = window.MS_CURSOS_DATA || [];
  var mode = (root.getAttribute('data-mode') || 'all').toLowerCase();
  var psgOnlyPage = mode === 'psg';

  var CATEGORIES = ['Todas', 'Saúde', 'Tecnologia', 'Gestão', 'Gastronomia', 'Beleza'];
  var CITIES = [
    'Todas',
    'Belo Horizonte',
    'Betim',
    'Contagem',
    'Divinópolis',
    'Juiz de Fora',
    'Uberlândia',
  ];

  var state = {
    q: '',
    category: 'Todas',
    city: 'Todas',
    onlyFree: psgOnlyPage,
  };

  root.innerHTML =
    '<div class="assistant panel">' +
    '<span class="callout__eyebrow">Assistente de cursos</span>' +
    '<h2 id="assistente-titulo">' +
    (psgOnlyPage ? 'Vagas gratuitas (PSG)' : 'Encontre o curso ideal') +
    '</h2>' +
    '<p class="assistant__lead" data-ms-plain>' +
    (psgOnlyPage
      ? 'Filtre as vagas 100% gratuitas por área e cidade.'
      : 'Digite o que procura, escolha uma área e, se quiser, só cursos gratuitos.') +
    '</p>' +
    '<p class="assistant__lead" data-ms-simple>' +
    (psgOnlyPage
      ? 'Escolha a área e a cidade. Só aparecem cursos de graça.'
      : 'Escreva o nome do curso ou escolha a área. Pode marcar só gratuitos.') +
    '</p>' +
    '<form class="assistant__form" role="search" aria-labelledby="assistente-titulo">' +
    '<label class="assistant__label" for="curso-q">Buscar</label>' +
    '<div class="assistant__search-row">' +
    '<input id="curso-q" type="search" name="q" placeholder="Ex.: Enfermagem, Informática, Cozinha…" autocomplete="off" />' +
    '</div>' +
    '<p class="assistant__label" id="label-areas">Escolha por área</p>' +
    '<div class="chip-row" id="curso-areas" role="group" aria-labelledby="label-areas"></div>' +
    '<label class="assistant__label" for="curso-cidade">Cidade</label>' +
    '<select id="curso-cidade" name="cidade"></select>' +
    (psgOnlyPage
      ? ''
      : '<label class="assistant__check"><input id="curso-psg" type="checkbox" /> Mostrar apenas cursos 100% gratuitos (PSG)</label>') +
    '</form>' +
    '<p class="assistant__count" id="curso-count" aria-live="polite"></p>' +
    '<ul class="list-cards assistant__results" id="curso-results"></ul>' +
    '</div>';

  var areasEl = document.getElementById('curso-areas');
  var cityEl = document.getElementById('curso-cidade');
  var qEl = document.getElementById('curso-q');
  var psgEl = document.getElementById('curso-psg');
  var resultsEl = document.getElementById('curso-results');
  var countEl = document.getElementById('curso-count');

  CATEGORIES.forEach(function (cat) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip' + (cat === 'Todas' ? ' is-active' : '');
    btn.setAttribute('data-category', cat);
    btn.setAttribute('aria-pressed', cat === 'Todas' ? 'true' : 'false');
    btn.textContent = cat === 'Todas' ? 'Todas as áreas' : cat;
    areasEl.appendChild(btn);
  });

  CITIES.forEach(function (city) {
    var opt = document.createElement('option');
    opt.value = city;
    opt.textContent = city === 'Todas' ? 'Todas as cidades' : city;
    cityEl.appendChild(opt);
  });

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function filterCourses() {
    var q = state.q.trim().toLowerCase();
    return data.filter(function (c) {
      if (state.onlyFree && !c.isFreePSG) return false;
      if (state.category !== 'Todas' && c.category !== state.category) return false;
      if (state.city !== 'Todas' && c.cities.indexOf(state.city) === -1) return false;
      if (!q) return true;
      var hay =
        (c.title + ' ' + c.description + ' ' + c.simpleDescription + ' ' + c.category).toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  function render() {
    var list = filterCourses();
    countEl.textContent =
      list.length === 0
        ? 'Nenhum curso encontrado com esses filtros.'
        : list.length === 1
          ? '1 curso encontrado'
          : list.length + ' cursos encontrados';

    if (!list.length) {
      resultsEl.innerHTML =
        '<li class="list-card"><p>Tente outra palavra, área ou cidade.</p>' +
        '<a class="btn btn-primary" href="contato.html">Falar com atendente</a></li>';
      return;
    }

    resultsEl.innerHTML = list
      .map(function (c) {
        var cities = c.cities.join(', ');
        return (
          '<li class="list-card">' +
          '<div class="list-card__body">' +
          (c.isFreePSG
            ? '<span class="badge badge--free">100% gratuito (PSG)</span> '
            : '') +
          '<span class="course-card__tag" style="display:inline-block;margin:0.15rem 0">' +
          escapeHtml(c.category) +
          '</span>' +
          '<h3>' +
          escapeHtml(c.title) +
          '</h3>' +
          '<p data-ms-plain>' +
          escapeHtml(c.description) +
          '</p>' +
          '<p data-ms-simple>' +
          escapeHtml(c.simpleDescription) +
          '</p>' +
          '<span class="list-card__meta">Duração: ' +
          escapeHtml(c.duration) +
          ' · Onde: ' +
          escapeHtml(cities) +
          '</span>' +
          '</div>' +
          '<div class="unit-actions">' +
          '<a class="btn btn-primary" href="contato.html">Saiba mais</a>' +
          (c.isFreePSG
            ? '<a class="btn btn-ghost" href="psg.html">Sobre o PSG</a>'
            : '') +
          '</div>' +
          '</li>'
        );
      })
      .join('');
  }

  areasEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.chip');
    if (!btn) return;
    state.category = btn.getAttribute('data-category');
    areasEl.querySelectorAll('.chip').forEach(function (c) {
      var on = c === btn;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    render();
  });

  cityEl.addEventListener('change', function () {
    state.city = cityEl.value;
    render();
  });

  qEl.addEventListener('input', function () {
    state.q = qEl.value;
    render();
  });

  if (psgEl) {
    psgEl.addEventListener('change', function () {
      state.onlyFree = psgEl.checked;
      render();
    });
  }

  var params = new URLSearchParams(window.location.search);
  if (params.get('q')) {
    state.q = params.get('q');
    qEl.value = state.q;
  }
  if (params.get('psg') === '1' && psgEl) {
    state.onlyFree = true;
    psgEl.checked = true;
  }

  render();
})();
