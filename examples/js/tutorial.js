/**
 * Tutorial guiado do demo (ADR-016 / F11b) — SÓ do demo (examples/); nunca em dist/ nem src/.
 * Destaca cada parte do painel de acessibilidade e explica em um balão (Próximo/Voltar/Pular).
 * Fala com a lib apenas pelo DOM (shadowRoot aberto + cliques nos botões do próprio painel);
 * nunca altera uma configuração do visitante. Textos em js/tutorial-strings.js.
 */
(function () {
  var T = window.MSTutorialStrings;
  if (!T) return;

  var GAP = 12; // distância balão ↔ painel
  var PAD = 6; // folga do destaque
  var memSeen = false; // fallback se o localStorage falhar

  var run = null; // sessão ativa
  var live = null; // região aria-live persistente

  function seen() {
    try {
      return localStorage.getItem(T.storageKey) === '1';
    } catch (e) {
      return memSeen;
    }
  }
  function markSeen() {
    memSeen = true;
    try {
      localStorage.setItem(T.storageKey, '1');
    } catch (e) {
      /* sem storage: vale só nesta página */
    }
  }

  function root() {
    var host = document.getElementById('ms-container');
    return host && host.shadowRoot;
  }
  function q(sel) {
    var r = root();
    return r ? r.querySelector(sel) : null;
  }
  function deepActive() {
    var a = document.activeElement;
    while (a && a.shadowRoot && a.shadowRoot.activeElement) {
      a = a.shadowRoot.activeElement;
    }
    return a;
  }
  function reduced() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function targetEl(key) {
    if (key === 'fab') return q('#ms-fab');
    if (key === 'panel') return q('#ms-a11y-panel');
    if (key === 'profiles') return q('.ms-a11y-profiles');
    if (key === 'simple') return q('.ms-a11y-card--simple');
    if (key.indexOf('section:') === 0) {
      return q('[data-section-id="' + key.slice(8) + '"]');
    }
    return null;
  }
  function panelOpen() {
    var p = q('#ms-a11y-panel');
    return !!p && !p.hidden;
  }
  function toggles() {
    var r = root();
    return r
      ? Array.prototype.slice.call(
          r.querySelectorAll('.ms-a11y-section-toggle'),
        )
      : [];
  }

  function settled(el) {
    // espera a animação de entrada do painel acabar (medidas corretas)
    return Promise.all(
      el.getAnimations().map(function (a) {
        return a.finished.catch(function () {});
      }),
    );
  }

  function ensurePanel(want) {
    var panel = q('#ms-a11y-panel');
    if (!panel) return Promise.resolve();
    var open = !panel.hidden;
    if (want && !open) {
      q('#ms-fab').click();
      return settled(panel);
    }
    if (!want && open) {
      var x = q('.ms-a11y-close');
      if (x) x.click();
    }
    return Promise.resolve();
  }

  function announce(msg) {
    if (!live) {
      live = document.createElement('div');
      live.id = 'ms-tutorial-live';
      live.className = 'ms-tut-sr';
      live.setAttribute('role', 'status');
      live.setAttribute('aria-live', 'polite');
      document.body.appendChild(live);
    }
    live.textContent = '';
    window.requestAnimationFrame(function () {
      live.textContent = msg;
    });
  }

  function el(tag, cls) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  }
  function btn(cls, label) {
    var b = el('button', cls);
    b.type = 'button';
    b.textContent = label;
    return b;
  }

  function build() {
    var r = el('div', 'ms-tut');
    r.id = 'ms-tutorial';
    // aria-live (qualquer valor) = a lib não torna este nó inert enquanto o painel está aberto
    r.setAttribute('aria-live', 'off');
    var shield = el('div', 'ms-tut-shield');
    var spot = el('div', 'ms-tut-spot');
    spot.hidden = true;

    var b = el('div', 'ms-tut-balloon');
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-label', T.dialogLabel);
    b.setAttribute('aria-describedby', 'ms-tut-body');
    b.tabIndex = -1;
    var title = el('h2', 'ms-tut-title');
    title.id = 'ms-tut-title';
    var body = el('div', 'ms-tut-body');
    body.id = 'ms-tut-body';
    var text = el('p', 'ms-tut-text');
    var tools = el('ul', 'ms-tut-tools');
    var link = el('a', 'ms-tut-link');
    link.href = T.formUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.appendChild(document.createTextNode(T.formLink + ' '));
    var note = el('span', 'ms-tut-note');
    note.textContent = T.formLinkNote;
    link.appendChild(note);
    body.appendChild(text);
    body.appendChild(tools);
    body.appendChild(link);

    var actions = el('div', 'ms-tut-actions');
    var skip = btn('ms-tut-btn ms-tut-btn--quiet', T.skip);
    var count = el('span', 'ms-tut-count');
    var back = btn('ms-tut-btn ms-tut-btn--ghost', T.back);
    var next = btn('ms-tut-btn ms-tut-btn--primary', T.next);
    actions.appendChild(skip);
    actions.appendChild(count);
    actions.appendChild(back);
    actions.appendChild(next);

    b.appendChild(title);
    b.appendChild(body);
    b.appendChild(actions);
    b.setAttribute('aria-labelledby', 'ms-tut-title');
    r.appendChild(shield);
    r.appendChild(spot);
    r.appendChild(b);
    document.body.appendChild(r);

    // cliques no tutorial nunca chegam ao "clicar fora fecha o painel" da lib
    r.addEventListener('click', function (e) {
      e.stopPropagation();
    });

    return {
      root: r,
      spot: spot,
      balloon: b,
      title: title,
      text: text,
      tools: tools,
      link: link,
      count: count,
      skip: skip,
      back: back,
      next: next,
    };
  }

  function clip(r, c) {
    var l = Math.max(r.left, c.left);
    var t = Math.max(r.top, c.top);
    var rt = Math.min(r.right, c.right);
    var bt = Math.min(r.bottom, c.bottom);
    return {
      left: l,
      top: t,
      width: rt - l,
      height: bt - t,
      right: rt,
      bottom: bt,
    };
  }

  function place() {
    if (!run) return;
    var ui = run.ui;
    var step = T.steps[run.i];
    var t = targetEl(step.target);
    var fab = q('#ms-fab');
    var panel = q('#ms-a11y-panel');
    var open = panelOpen();
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var M = 12;

    var r = t ? t.getBoundingClientRect() : null;
    if (r && open && t !== fab && t !== panel && panel) {
      r = clip(r, panel.getBoundingClientRect());
    }
    if (r && r.width > 0 && r.height > 0) {
      ui.spot.hidden = false;
      ui.spot.style.left = r.left - PAD + 'px';
      ui.spot.style.top = r.top - PAD + 'px';
      ui.spot.style.width = r.width + 2 * PAD + 'px';
      ui.spot.style.height = r.height + 2 * PAD + 'px';
    } else {
      ui.spot.hidden = true;
      r = null;
    }

    var b = ui.balloon;
    b.classList.remove('ms-tut-balloon--sheet', 'ms-tut-balloon--sheet-top');
    b.style.left = b.style.top = '';
    var anchor =
      open && panel
        ? panel.getBoundingClientRect()
        : fab
          ? fab.getBoundingClientRect()
          : r;
    var bw = b.offsetWidth;
    var bh = b.offsetHeight;
    var placed = false;
    if (vw >= 640 && anchor) {
      var room = {
        left: anchor.left - GAP - bw >= M,
        right: vw - anchor.right - GAP - bw >= M,
      };
      var preferLeft = anchor.left + anchor.width / 2 > vw / 2;
      var side = preferLeft
        ? room.left
          ? 'left'
          : room.right
            ? 'right'
            : ''
        : room.right
          ? 'right'
          : room.left
            ? 'left'
            : '';
      if (side) {
        var cy = r ? r.top + r.height / 2 : anchor.top + anchor.height / 2;
        b.style.left =
          (side === 'left' ? anchor.left - GAP - bw : anchor.right + GAP) +
          'px';
        b.style.top = Math.max(M, Math.min(cy - bh / 2, vh - bh - M)) + 'px';
        placed = true;
      }
    }
    if (!placed) {
      b.classList.add('ms-tut-balloon--sheet');
      if (r && r.top > vh * 0.5) b.classList.add('ms-tut-balloon--sheet-top');
    }
  }

  function render() {
    var ui = run.ui;
    var step = T.steps[run.i];
    var total = T.steps.length;
    var title = step.title;
    if (step.target.indexOf('section:') === 0) {
      var tg = q(
        '#ms-sec-' + step.target.slice(8) + '-btn .ms-a11y-section-name',
      );
      if (tg && tg.textContent) title = tg.textContent.trim();
    }
    ui.title.textContent = title;
    ui.text.textContent = step.text;
    ui.tools.textContent = '';
    (step.tools || []).forEach(function (s) {
      var li = document.createElement('li');
      li.textContent = s;
      ui.tools.appendChild(li);
    });
    ui.tools.hidden = !(step.tools && step.tools.length);
    ui.link.hidden = !step.final;
    ui.count.textContent = T.counter(run.i + 1, total);
    ui.back.hidden = run.i === 0;
    ui.next.textContent = run.i === total - 1 ? T.done : T.next;
    announce(T.announce(run.i + 1, total, title, step.text));
  }

  function go(i, firstFocus) {
    var token = ++run.token;
    run.i = i;
    var step = T.steps[i];
    var wantPanel = step.target !== 'fab' || run.wasOpen;
    return ensurePanel(wantPanel).then(function () {
      if (!run || token !== run.token) return;
      if (step.target.indexOf('section:') === 0) {
        var id = step.target.slice(8);
        var tg = q('#ms-sec-' + id + '-btn');
        if (tg && tg.getAttribute('aria-expanded') === 'false') tg.click();
      }
      var t = targetEl(step.target);
      var scroller = q('.ms-a11y-body');
      if (t && scroller && step.target !== 'fab' && step.target !== 'panel') {
        var d =
          t.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
        scroller.scrollTop += d - 8;
      } else if (scroller && step.target === 'panel') {
        scroller.scrollTop = 0;
      }
      render();
      place();
      var prefer = firstFocus ? run.ui.balloon : run.lastBtn;
      if (!prefer || prefer.hidden) prefer = run.ui.next;
      prefer.focus();
    });
  }

  function onKey(e) {
    if (!run) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      end();
      return;
    }
    if (e.key !== 'Tab') return;
    // o foco do tutorial é do balão: o trap do painel da lib não pode puxá-lo de volta
    e.preventDefault();
    e.stopPropagation();
    var f = Array.prototype.filter.call(
      run.ui.balloon.querySelectorAll('button, a[href]'),
      function (n) {
        return !n.hidden && !n.closest('[hidden]');
      },
    );
    var a = document.activeElement;
    var idx = f.indexOf(a);
    var n =
      idx === -1
        ? e.shiftKey
          ? f.length - 1
          : 0
        : (idx + (e.shiftKey ? -1 : 1) + f.length) % f.length;
    f[n].focus();
  }

  function end() {
    if (!run) return;
    var s = run;
    run = null;
    s.token++;
    document.removeEventListener('keydown', onKey, true);
    window.removeEventListener('resize', place);
    var r = root();
    if (r) r.removeEventListener('scroll', place, true);
    s.ui.root.remove();
    // devolve o painel ao estado de antes: acordeões, rolagem e aberto/fechado
    toggles().forEach(function (tg) {
      var id = tg.id;
      var was = s.sections[id];
      if (was !== undefined && String(was) !== tg.getAttribute('aria-expanded'))
        tg.click();
    });
    var scroller = q('.ms-a11y-body');
    if (scroller) scroller.scrollTop = s.scroll;
    if (!s.wasOpen) ensurePanel(false);
    announce(T.closed);
    var o = s.opener;
    if (o && o !== document.body && o.isConnected) o.focus();
  }

  function start(opener) {
    if (run || !q('#ms-fab')) return;
    markSeen();
    var sections = {};
    toggles().forEach(function (tg) {
      sections[tg.id] = tg.getAttribute('aria-expanded');
    });
    var scroller = q('.ms-a11y-body');
    run = {
      i: 0,
      token: 0,
      ui: build(),
      opener: opener || deepActive(),
      wasOpen: panelOpen(),
      sections: sections,
      scroll: scroller ? scroller.scrollTop : 0,
      lastBtn: null,
    };
    var ui = run.ui;
    ui.skip.addEventListener('click', end);
    ui.back.addEventListener('click', function () {
      run.lastBtn = ui.back;
      go(run.i - 1);
    });
    ui.next.addEventListener('click', function () {
      run.lastBtn = ui.next;
      if (run.i === T.steps.length - 1) end();
      else go(run.i + 1);
    });
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', place);
    root().addEventListener('scroll', place, true);
    go(0, true);
  }

  function whenLibReady(cb) {
    var tries = 0;
    (function poll() {
      if (q('#ms-fab')) return cb();
      if (++tries < 300) window.requestAnimationFrame(poll);
    })();
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-tutorial-start]');
    if (b) start(b);
  });

  window.MSTutorial = { start: start, end: end };

  whenLibReady(function () {
    if (!seen()) start();
  });
})();
