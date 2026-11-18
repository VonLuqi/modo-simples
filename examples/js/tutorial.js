/**
 * Tutorial guiado do demo (ADR-016 / F11b, T179) — SÓ do demo (examples/); nunca em dist/ nem src/.
 * Liga UMA ferramenta do painel por passo, mostra o efeito na página e a desliga ao avançar;
 * ao fim (Explorar, Pular, Esc ou sair da página) devolve tudo ao estado exato do visitante.
 * Fala com a lib apenas pelo DOM (shadowRoot aberto + cliques/eventos nos controles do painel).
 * Textos em js/tutorial-strings.js.
 */
(function () {
  var T = window.MSTutorialStrings;
  if (!T) return;

  var GAP = 12; // distância balão ↔ painel
  var PAD = 6; // folga do destaque
  var NARROW = 640; // abaixo disso o painel cobre a página: some durante a demonstração
  var memSeen = false; // fallback se o localStorage falhar
  var memCorner = null;
  var CORNER_ID = 'ms-tut-corner';

  // valor "desligado" de cada radiogroup (para saber se o painel está limpo)
  var RADIO_DEFAULT = {
    textScale: '100',
    colorTheme: 'senac',
    colorSaturation: 'normal',
    cursorStyle: 'default',
    customText: '',
    customHeading: '',
    customBg: '',
  };

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
  function qa(sel) {
    var r = root();
    return r ? Array.prototype.slice.call(r.querySelectorAll(sel)) : [];
  }
  function deepActive() {
    var a = document.activeElement;
    while (a && a.shadowRoot && a.shadowRoot.activeElement) {
      a = a.shadowRoot.activeElement;
    }
    return a;
  }
  function checked(n) {
    return !!n && n.getAttribute('aria-checked') === 'true';
  }
  function shown(n) {
    var r = n.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function panelOpen() {
    var p = q('#ms-a11y-panel');
    return !!p && !p.hidden;
  }
  function toggles() {
    return qa('.ms-a11y-section-toggle');
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

  // ── Fotografia e restauração do estado do visitante ───────────────────────

  function readUi() {
    var u = { sw: {}, rad: {}, rng: {}, modo: false, profile: null };
    qa('.ms-switch[data-option]').forEach(function (b) {
      u.sw[b.getAttribute('data-option')] = checked(b);
    });
    qa('[role="radiogroup"][data-option]').forEach(function (g) {
      var on = g.querySelector('[role="radio"][aria-checked="true"]');
      u.rad[g.getAttribute('data-option')] = on
        ? on.getAttribute('data-value')
        : '';
    });
    qa('[data-range]').forEach(function (i) {
      u.rng[i.getAttribute('data-range')] = i.value;
    });
    u.modo = checked(q('[data-action="modo-simples"]'));
    var p = q('.ms-profile[aria-pressed="true"]');
    u.profile = p ? p.getAttribute('data-profile') : null;
    return u;
  }

  // tudo em ms_* (estado, lado do painel, preferências): é o que a lib grava no navegador
  function readStore() {
    var m = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k.indexOf('ms_') === 0) m[k] = localStorage.getItem(k);
      }
    } catch (e) {
      /* sem storage */
    }
    return m;
  }
  function writeStore(m) {
    try {
      var cur = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k.indexOf('ms_') === 0) cur.push(k);
      }
      cur.forEach(function (k) {
        if (!(k in m)) localStorage.removeItem(k);
      });
      Object.keys(m).forEach(function (k) {
        if (localStorage.getItem(k) !== m[k]) localStorage.setItem(k, m[k]);
      });
    } catch (e) {
      /* sem storage */
    }
  }

  function isClean(u) {
    if (u.modo || u.profile) return false;
    var dirty = Object.keys(u.sw).some(function (k) {
      return u.sw[k];
    });
    if (dirty) return false;
    dirty = Object.keys(u.rng).some(function (k) {
      return u.rng[k] !== '0';
    });
    if (dirty) return false;
    return Object.keys(RADIO_DEFAULT).every(function (k) {
      return !(k in u.rad) || u.rad[k] === RADIO_DEFAULT[k];
    });
  }

  function radios(o) {
    var g = q('[role="radiogroup"][data-option="' + o + '"]');
    return g
      ? Array.prototype.slice.call(g.querySelectorAll('[role="radio"]'))
      : [];
  }
  function setRadio(o, v) {
    var cur = radios(o).filter(function (r) {
      return r.getAttribute('aria-checked') === 'true';
    })[0];
    if ((cur ? cur.getAttribute('data-value') : '') === v) return;
    var t = radios(o).filter(function (r) {
      return r.getAttribute('data-value') === v && !r.hidden;
    })[0];
    if (t) {
      t.click();
      return;
    }
    var pk = q('[data-picker="' + o + '"]'); // cor livre (fora dos presets)
    if (pk) {
      pk.value = v;
      pk.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
  function setRange(key, v) {
    var i = q('[data-range="' + key + '"]');
    if (!i || i.value === String(v)) return;
    i.value = String(v);
    i.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function resetAll() {
    var b = q('[data-action="reset-all"]');
    if (b) b.click();
  }

  /** Leva o painel de volta ao que a fotografia `u` registrou (perfil → Modo Simples → opções). */
  function applyUi(u) {
    if (u.profile) {
      var p = q('.ms-profile[data-profile="' + u.profile + '"]');
      if (p && p.getAttribute('aria-pressed') !== 'true') p.click();
    }
    var mb = q('[data-action="modo-simples"]');
    if (mb && checked(mb) !== u.modo) mb.click();
    Object.keys(u.sw).forEach(function (o) {
      var b = q('.ms-switch[data-option="' + o + '"]');
      if (b && !b.disabled && checked(b) !== u.sw[o]) b.click();
    });
    Object.keys(u.rad).forEach(function (o) {
      setRadio(o, u.rad[o]);
    });
    Object.keys(u.rng).forEach(function (k) {
      setRange(k, u.rng[k]);
    });
  }

  function baseline(s) {
    if (s.baselined) return;
    s.baselined = true;
    if (!isClean(s.snap.ui)) resetAll();
  }

  function closeOverlays() {
    var o = q('.ms-outline-close');
    if (o) o.click();
    if (document.getElementById('ms-mouse-grid')) {
      run.synthetic = true; // o Esc de mentira não pode encerrar o tutorial
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        }),
      );
      run.synthetic = false;
    }
    var vk = document.querySelector('[data-vk-hint-close]');
    if (vk) vk.click();
  }

  function setPanelHidden(s, on) {
    var p = q('#ms-a11y-panel');
    if (p) p.style.visibility = on ? 'hidden' : '';
    s.panelHidden = on;
  }

  function leave(s) {
    if (s.undo) {
      s.undo();
      s.undo = null;
    }
    closeOverlays();
    setPanelHidden(s, false);
  }

  function restoreAll(s) {
    if (!s.baselined) return;
    closeOverlays();
    setPanelHidden(s, false);
    if (!isClean(readUi())) resetAll();
    applyUi(s.snap.ui);
    writeStore(s.snap.store);
    s.baselined = false;
  }

  // ── Ferramentas ───────────────────────────────────────────────────────────

  var PLAIN = ['', '100', 'normal', 'default', 'senac', 'x'];

  /** Liga a ferramenta do passo. Devolve { undo, unsupported }. */
  function activate(tool) {
    var b;
    if (tool.t === 'switch') {
      b = q('.ms-switch[data-option="' + tool.o + '"]');
      if (!b || b.disabled) return { unsupported: true };
      if (!checked(b)) b.click();
      return {
        undo: function () {
          if (checked(b)) b.click();
        },
      };
    }
    if (tool.t === 'radio') {
      var v = tool.v;
      if (v === 'auto') {
        var c = radios(tool.o).filter(function (r) {
          return !r.hidden && PLAIN.indexOf(r.getAttribute('data-value')) < 0;
        })[0];
        v = c ? c.getAttribute('data-value') : tool.off;
      }
      setRadio(tool.o, v);
      return {
        undo: function () {
          setRadio(tool.o, tool.off);
        },
      };
    }
    if (tool.t === 'range') {
      qa('[data-range]').forEach(function (i) {
        setRange(
          i.getAttribute('data-range'),
          Math.max(1, Math.round(i.max / 2)),
        );
      });
      return {
        undo: function () {
          var r = q('[data-action="reset-font"]');
          if (r) r.click();
        },
      };
    }
    if (tool.t === 'speak') {
      b = q('[data-action="speak"]');
      var label = b.getAttribute('aria-label');
      b.click();
      return {
        undo: function () {
          if (b.getAttribute('aria-label') !== label) b.click(); // está falando: para
        },
      };
    }
    if (tool.t === 'outline') {
      q('[data-action="page-outline"]').click();
      return {
        undo: function () {
          var x = q('.ms-outline-close');
          if (x) x.click();
        },
      };
    }
    if (tool.t === 'grid') {
      q('[data-action="mouse-grid"]').click();
      return { undo: closeOverlays };
    }
    if (tool.t === 'vk') {
      q('[data-action="virtual-keyboard"]').click();
      return { undo: closeOverlays };
    }
    if (tool.t === 'profile') {
      b = q('.ms-profile[data-profile="' + tool.v + '"]');
      if (b.getAttribute('aria-pressed') !== 'true') b.click();
      return {
        undo: function () {
          if (b.getAttribute('aria-pressed') === 'true') b.click();
        },
      };
    }
    // modo
    b = q('[data-action="modo-simples"]');
    if (!checked(b)) b.click();
    return {
      undo: function () {
        if (checked(b)) b.click();
      },
    };
  }

  function targetEl(step) {
    var t = step.tool;
    if (!t) {
      return step.target === 'panel' ? q('#ms-a11y-panel') : null;
    }
    if (t.t === 'switch') return q('.ms-switch[data-option="' + t.o + '"]');
    if (t.t === 'radio') {
      var g = q('[role="radiogroup"][data-option="' + t.o + '"]');
      return g && (g.closest('.ms-a11y-block') || g.parentElement);
    }
    if (t.t === 'range') {
      return q('[role="group"][aria-labelledby="ms-label-typo"]');
    }
    if (t.t === 'speak') return q('[data-action="speak"]');
    if (t.t === 'outline') return q('[data-action="page-outline"]');
    if (t.t === 'grid') return q('[data-action="mouse-grid"]');
    if (t.t === 'vk') return q('[data-action="virtual-keyboard"]');
    if (t.t === 'profile') return q('.ms-a11y-profiles');
    return q('.ms-a11y-card--simple');
  }

  // ── Balão ─────────────────────────────────────────────────────────────────

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
    var head = el('div', 'ms-tut-head');
    var title = el('h2', 'ms-tut-title');
    title.id = 'ms-tut-title';
    var peek = btn('ms-tut-peek', T.peekHide);
    peek.setAttribute('aria-label', T.peekLabel);
    peek.setAttribute('aria-expanded', 'true');
    head.appendChild(title);
    head.appendChild(peek);
    var body = el('div', 'ms-tut-body');
    body.id = 'ms-tut-body';
    var text = el('p', 'ms-tut-text');
    var link = el('a', 'ms-tut-link');
    link.href = T.formUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.appendChild(document.createTextNode(T.formNow + ' '));
    var note = el('span', 'ms-tut-note');
    note.textContent = T.formLinkNote;
    link.appendChild(note);
    body.appendChild(text); // o link só entra no DOM no último passo (render)
    var demo = el('input', 'ms-tut-demo'); // só no passo do teclado virtual (render)
    demo.type = 'text';
    demo.autocomplete = 'off';
    demo.setAttribute('aria-label', T.vkDemoLabel);
    demo.placeholder = T.vkDemoPlaceholder;

    var actions = el('div', 'ms-tut-actions');
    var skip = btn('ms-tut-btn ms-tut-btn--quiet', T.skip);
    var count = el('span', 'ms-tut-count');
    var back = btn('ms-tut-btn ms-tut-btn--ghost', T.back);
    var next = btn('ms-tut-btn ms-tut-btn--primary', T.next);
    actions.appendChild(skip);
    actions.appendChild(count);
    actions.appendChild(back);
    actions.appendChild(next);

    b.appendChild(head);
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
      peek: peek,
      body: body,
      text: text,
      link: link,
      demo: demo,
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

  // Conteúdo que o balão não pode cobrir: cartão de atalhos, lista da estrutura, célula 1 da grade,
  // teclas do teclado virtual.
  function avoidRects(step) {
    var t = step.tool;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var n = null;
    if (!t) return [];
    if (t.t === 'grid') {
      return [{ left: 0, top: 0, right: vw / 3, bottom: vh / 3 }];
    }
    if (t.t === 'switch' && t.o === 'showShortcuts') {
      n = document.getElementById('ms-shortcuts-card');
    } else if (t.t === 'outline') {
      n = q('.ms-outline');
    } else if (t.t === 'vk') {
      n = document.getElementById('ms-virtual-keyboard');
    }
    return n && shown(n) ? [n.getBoundingClientRect()] : [];
  }
  function hits(b, rs) {
    var r = b.getBoundingClientRect();
    return rs.some(function (a) {
      return (
        r.left < a.right &&
        a.left < r.right &&
        r.top < a.bottom &&
        a.top < r.bottom
      );
    });
  }
  function setCollapsed(on) {
    var ui = run.ui;
    ui.body.hidden = on;
    ui.balloon.classList.toggle('ms-tut-balloon--min', on);
    ui.peek.textContent = on ? T.peekShow : T.peekHide;
    ui.peek.setAttribute('aria-expanded', String(!on));
  }
  // posições livres do balão (celular: faixa no topo ou no pé; desktop: os 4 cantos)
  function tryFree(b, rs) {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var M = 12;
    var cands;
    b.classList.remove('ms-tut-balloon--sheet', 'ms-tut-balloon--sheet-top');
    b.style.left = b.style.top = '';
    if (vw < NARROW) {
      cands = [
        ['ms-tut-balloon--sheet', 'ms-tut-balloon--sheet-top'],
        ['ms-tut-balloon--sheet'],
      ];
      return cands.some(function (c) {
        b.classList.remove(
          'ms-tut-balloon--sheet',
          'ms-tut-balloon--sheet-top',
        );
        c.forEach(function (k) {
          b.classList.add(k);
        });
        return !hits(b, rs);
      });
    }
    var bw = b.offsetWidth;
    var bh = b.offsetHeight;
    cands = [
      [vw - bw - M, M],
      [vw - bw - M, vh - bh - M],
      [M, vh - bh - M],
      [M, M],
    ];
    return cands.some(function (p) {
      b.style.left = p[0] + 'px';
      b.style.top = p[1] + 'px';
      return !hits(b, rs);
    });
  }
  function place() {
    if (!run) return;
    layout();
    var rs = avoidRects(T.steps[run.i]);
    var b = run.ui.balloon;
    if (!rs.length || !hits(b, rs) || tryFree(b, rs)) return;
    // sem área livre com o texto aberto: recolhe o balão (Recolher) e tenta de novo
    if (!run.ui.body.hidden && !run.ui.peek.hidden) {
      setCollapsed(true);
      layout();
      if (!hits(b, rs) || tryFree(b, rs)) return;
    }
  }

  function layout() {
    var ui = run.ui;
    var step = T.steps[run.i];
    var t = targetEl(step);
    var panel = q('#ms-a11y-panel');
    var open = panelOpen() && !run.panelHidden;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var M = 12;

    var r = t && open ? t.getBoundingClientRect() : null;
    if (r && panel && t !== panel) r = clip(r, panel.getBoundingClientRect());
    // sobreposições (estrutura, grade, teclado) não têm alvo no painel: sem anel de destaque
    if (step.tool && /^(outline|grid|vk)$/.test(step.tool.t)) r = null;
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
    var anchor = open && panel ? panel.getBoundingClientRect() : null;
    var bw = b.offsetWidth;
    var bh = b.offsetHeight;
    var onTop = step.tool && (step.tool.t === 'grid' || step.tool.t === 'vk');
    if (vw >= NARROW) {
      var side = '';
      if (anchor) {
        var room = {
          left: anchor.left - GAP - bw >= M,
          right: vw - anchor.right - GAP - bw >= M,
        };
        var preferLeft = anchor.left + anchor.width / 2 > vw / 2;
        side = preferLeft
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
      }
      if (side) {
        var cy = r ? r.top + r.height / 2 : anchor.top + anchor.height / 2;
        b.style.left =
          (side === 'left' ? anchor.left - GAP - bw : anchor.right + GAP) +
          'px';
        b.style.top = Math.max(M, Math.min(cy - bh / 2, vh - bh - M)) + 'px';
        return;
      }
      if (!anchor) {
        // sem painel (grade, teclado virtual): canto superior esquerdo, longe do rodapé
        b.style.left = M + 'px';
        b.style.top = M + 'px';
        return;
      }
    }
    b.classList.add('ms-tut-balloon--sheet');
    if (onTop || (r && r.top > vh * 0.5)) {
      b.classList.add('ms-tut-balloon--sheet-top');
    }
  }

  function render(extra) {
    var ui = run.ui;
    var step = T.steps[run.i];
    var total = T.steps.length;
    var text = step.text + (extra || '');
    ui.title.textContent = step.title;
    ui.text.textContent = text;
    // fora do DOM (não só [hidden]): os estilos da lib, como "aumentar áreas de clique", vazam
    if (step.final) ui.body.appendChild(ui.link);
    else ui.link.remove();
    ui.count.textContent = T.counter(run.i + 1, total);
    ui.back.hidden = run.i === 0;
    ui.skip.hidden = !!step.final; // no último passo "Explorar sozinho" já encerra
    ui.next.textContent = step.final ? T.explore : T.next;
    ui.peek.hidden = !!step.final || !!step.dim;
    // campo de teste: só no passo do teclado virtual (as teclas só aparecem com um campo em foco)
    ui.demo.value = '';
    if (step.tool && step.tool.t === 'vk') ui.body.appendChild(ui.demo);
    else ui.demo.remove();
    setCollapsed(run.peek && !ui.peek.hidden);
    announce(T.announce(run.i + 1, total, step.title, text));
  }

  function go(i, firstFocus) {
    var s = run;
    var token = ++s.token;
    leave(s);
    s.i = i;
    var step = T.steps[i];
    s.ui.root.classList.toggle('ms-tut--live', !step.dim);
    if (step.tool) baseline(s);
    else restoreAll(s);
    return ensurePanel(true).then(function () {
      if (!run || token !== s.token) return;
      var t = targetEl(step);
      var sec = t && t.closest('[data-section-id]');
      if (sec) {
        var tg = q('#ms-sec-' + sec.getAttribute('data-section-id') + '-btn');
        if (tg && tg.getAttribute('aria-expanded') === 'false') tg.click();
      }
      var scroller = q('.ms-a11y-body');
      if (t && scroller && !step.dim) {
        var d =
          t.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
        scroller.scrollTop += d - 8;
      } else if (scroller) {
        scroller.scrollTop = 0;
      }
      var extra = '';
      if (step.tool) {
        var res = activate(step.tool);
        s.undo = res.undo || null;
        if (res.unsupported) extra = T.unsupported;
        var t0 = step.tool.t;
        if (
          window.innerWidth < NARROW &&
          t0 !== 'grid' &&
          t0 !== 'vk' &&
          t0 !== 'outline'
        ) {
          setPanelHidden(s, true); // o painel cobriria o efeito: só o balão fica
        }
        // grade e teclado virtual entram no fim do <body>/<html>: o balão volta ao topo da pilha
        document.body.appendChild(s.ui.root);
      }
      render(extra);
      place();
      var prefer = firstFocus ? s.ui.balloon : s.lastBtn;
      // teclado virtual: o foco vai ao campo de teste (dentro do balão) e as teclas aparecem
      if (step.tool && step.tool.t === 'vk' && !s.ui.body.hidden) {
        prefer = s.ui.demo;
      }
      if (!prefer || prefer.hidden) prefer = s.ui.next;
      prefer.focus();
    });
  }

  function onKey(e) {
    if (!run || run.synthetic) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      end(false);
      return;
    }
    // teclas do balão nunca chegam à lib (grade de mouse: Enter/dígitos; painel: trap de foco)
    var inside = run.ui.balloon.contains(e.target);
    if (inside) e.stopImmediatePropagation();
    if (e.key !== 'Tab') return;
    // o foco do tutorial é do balão: o trap do painel da lib não pode puxá-lo de volta
    e.preventDefault();
    e.stopPropagation();
    var f = Array.prototype.filter.call(
      run.ui.balloon.querySelectorAll('button, a[href], input'),
      function (n) {
        return !n.hidden && !n.closest('[hidden]');
      },
    );
    var idx = f.indexOf(document.activeElement);
    var n =
      idx === -1
        ? e.shiftKey
          ? f.length - 1
          : 0
        : (idx + (e.shiftKey ? -1 : 1) + f.length) % f.length;
    f[n].focus();
  }

  function onHide() {
    // saiu da página no meio: o que a lib gravou durante a demonstração volta ao do visitante
    if (run && run.baselined) writeStore(run.snap.store);
  }

  function end(explore) {
    if (!run) return;
    var s = run;
    leave(s);
    restoreAll(s);
    run = null;
    s.token++;
    document.removeEventListener('keydown', onKey, true);
    window.removeEventListener('resize', place);
    window.removeEventListener('pagehide', onHide);
    var r = root();
    if (r) r.removeEventListener('scroll', place, true);
    s.ui.root.remove();
    // devolve o painel ao estado de antes: acordeões, rolagem e aberto/fechado
    toggles().forEach(function (tg) {
      var was = s.sections[tg.id];
      if (was !== undefined && String(was) !== tg.getAttribute('aria-expanded'))
        tg.click();
    });
    var scroller = q('.ms-a11y-body');
    if (scroller) scroller.scrollTop = s.scroll;
    if (!s.wasOpen) ensurePanel(false);
    announce(explore === true ? T.exploreClosed : T.closed);
    setCorner('1');
    syncCorner();
    // foco: Explorar → botão da lib; senão quem abriu (ou o botão Tutorial visível: cabeçalho, ou
    // a pílula do Modo Simples quando o cabeçalho está oculto), depois do foco que a lib devolve
    // ao FAB ao fechar o painel.
    var o;
    if (explore === true) {
      o = q('#ms-fab');
    } else {
      o = s.opener;
      if (!(o && o !== document.body && o.isConnected && shown(o))) {
        o = [].filter.call(
          document.querySelectorAll('[data-tutorial-start]'),
          shown,
        )[0];
      }
    }
    if (o) {
      o.focus();
      window.requestAnimationFrame(function () {
        if (!run && (explore === true || !panelOpen())) o.focus();
      });
    }
  }

  function start(opener) {
    if (run || !q('#ms-fab')) return;
    markSeen();
    syncCorner(); // o botão do canto some enquanto o tutorial roda
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
      snap: { ui: readUi(), store: readStore() },
      baselined: false,
      panelHidden: false,
      peek: false,
      synthetic: false,
      undo: null,
      lastBtn: null,
    };
    var ui = run.ui;
    ui.skip.addEventListener('click', function () {
      end(false);
    });
    ui.peek.addEventListener('click', function () {
      run.peek = !run.peek;
      render();
      place();
      ui.peek.focus();
    });
    ui.back.addEventListener('click', function () {
      run.lastBtn = ui.back;
      go(run.i - 1);
    });
    ui.next.addEventListener('click', function () {
      run.lastBtn = ui.next;
      if (run.i === T.steps.length - 1) end(true);
      else go(run.i + 1);
    });
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', place);
    window.addEventListener('pagehide', onHide);
    root().addEventListener('scroll', place, true);
    go(0, true);
  }

  // ── Botão "Responder formulário" no canto (depois do tutorial) ─────────────

  function cornerState() {
    try {
      return localStorage.getItem(T.cornerKey);
    } catch (e) {
      return memCorner;
    }
  }
  function setCorner(v) {
    memCorner = v;
    try {
      localStorage.setItem(T.cornerKey, v);
    } catch (e) {
      /* sem storage: vale só nesta página */
    }
  }

  // some enquanto grade de mouse, teclado virtual ou cartão de atalhos ocupam a tela
  function cornerBusy() {
    return !!document.querySelector(
      '#ms-mouse-grid, #ms-virtual-keyboard, #ms-shortcuts-card',
    );
  }
  function syncCornerBusy() {
    var c = document.getElementById(CORNER_ID);
    if (c) c.hidden = cornerBusy();
  }

  function syncCorner() {
    var c = document.getElementById(CORNER_ID);
    var want = !run && cornerState() === '1';
    if (!want) {
      if (c) c.remove();
      return;
    }
    if (c) return;
    c = el('div', 'ms-tut-corner');
    c.id = CORNER_ID;
    var wrap = q('[data-ms-fab-wrap]');
    var side =
      wrap && wrap.getAttribute('data-ms-side') === 'left' ? 'left' : 'right';
    c.setAttribute('data-side', side === 'left' ? 'right' : 'left'); // canto oposto ao FAB
    var a = el('a', 'ms-tut-corner__link');
    a.href = T.formUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', T.cornerLabel);
    a.textContent = T.cornerText;
    var x = btn('ms-tut-corner__x', '×');
    x.setAttribute('aria-label', T.cornerDismiss);
    x.addEventListener('click', function () {
      setCorner('x');
      c.remove();
      var f = document.querySelector('[data-tutorial-start]');
      if (f && shown(f)) f.focus();
    });
    c.appendChild(a);
    c.appendChild(x);
    document.body.appendChild(c);
    c.hidden = cornerBusy();
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
    else syncCorner();
    var mo = new MutationObserver(syncCornerBusy);
    mo.observe(document.documentElement, { childList: true }); // teclado virtual
    mo.observe(document.body, { childList: true }); // grade e cartão de atalhos
  });
})();
