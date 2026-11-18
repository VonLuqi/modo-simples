/*! modo-simples v2.0.0 | MIT | Script JavaScript injetável de acessibilidade web — Modo Simples */
(() => {
  // src/config/defaults.js
  var defaults = {
    /**
     * CSS selectors tried in order to locate the main content.
     * The first selector that returns a high-scoring element wins.
     */
    mainSelectors: [
      "main",
      '[role="main"]',
      "article",
      "#conteudo",
      "#content",
      ".content",
      ".main-content",
      ".post-content",
      ".article-body",
      ".entry-content"
    ],
    /**
     * Candidates for hiding when Modo Simples is active.
     * Elements inside the detected main content are never hidden, regardless
     * of whether they match these selectors.
     */
    distractionSelectors: [
      "header",
      "footer",
      "aside",
      '[role="complementary"]',
      '[role="banner"]',
      '[role="contentinfo"]',
      "nav",
      ".ad",
      ".ads",
      ".advertisement",
      '[class*="banner"]:not([class*="page-banner"])',
      '[class*="popup"]',
      '[class*="overlay"]',
      '[class*="sidebar"]',
      '[class*="cookie"]',
      '[class*="newsletter"]',
      '[class*="promo"]',
      '[class*="carousel"]',
      '[class*="slider"]',
      ".slider",
      "iframe"
    ],
    /**
     * Scoring weights used by the heuristic engine (somam; sem teto).
     * Confiança = min(nota / (mainTagBonus + h1Bonus + 2 × textLengthBonus), 1).
     * Detalhes e exemplos: doc/08-heuristicas-edges.md.
     */
    scoring: {
      mainTagBonus: 100,
      roleMainBonus: 90,
      articleBonus: 60,
      h1Bonus: 30,
      h2Bonus: 20,
      textLengthBonus: 40,
      /** Minimum text length (chars) to award textLengthBonus. */
      minTextLength: 200
    },
    /** Persist state (modoSimples on/off + options) across page loads. */
    persistence: true,
    /** Scope persistence keys by hostname (`state:hostname`). */
    hostnamePersistence: true,
    /**
     * Floating button corner position.
     * One of: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
     */
    position: "bottom-right",
    /**
     * Minimum heuristic confidence (0–1) to auto-apply main detection.
     * Below this threshold (confidence < value), a manual-selection fallback is
     * shown instead. With default weights: ideal score 210, minimum score 95.
     */
    confidenceThreshold: 0.45,
    /**
     * Milliseconds to debounce MutationObserver reprocessing after DOM changes.
     */
    reprocessDebounce: 300,
    /**
     * Teto (ms) de espera do debounce: com mutações contínuas o reprocess roda pelo menos
     * a cada reprocessMaxWait ms (evita "starvation" em páginas que mutam sem parar).
     */
    reprocessMaxWait: 1500,
    /**
     * Session bar (switch SIMPLES + barra "Modo Simples ativado") injected in the host page.
     * Default false: only the FAB + panel (Shadow DOM) are injected.
     * @type {boolean}
     */
    sessionBar: false,
    /**
     * Where the session bar goes (only used when sessionBar is true). Selector or list of
     * selectors (first match wins). Without mount: switch fixed on screen + bar at top of <body>.
     *   chrome → container that receives the SIMPLES switch
     *   bar    → element AFTER which the bar is inserted
     * @type {null | { chrome?: string|string[], bar?: string|string[] }}
     */
    mount: null,
    /**
     * Lexend font source. Loaded lazily, only when the user turns on the dyslexia font.
     *   null   → default (Google Fonts, no-referrer) — requested only after the user opts in
     *   string → self-hosted stylesheet URL
     *   false  → never load; keep the system fallback stack
     * @type {null | string | false}
     */
    fontUrl: null,
    /**
     * Texts of the accessibility panel header/footer. Generic by default; the host sets its own
     * (pre-boot via window.ModoSimplesConfig — the panel is built at init). Partial overrides merge.
     *   title    → panel heading
     *   subtitle → line under the heading ('' hides it)
     *   footer   → note at the bottom of the panel ('' hides it)
     * @type {{ title: string, subtitle: string, footer: string }}
     */
    brand: {
      title: "Acessibilidade Digital",
      subtitle: "",
      footer: "Prefer\xEAncias salvas neste navegador"
    },
    /**
     * Optional simple-mode nav pills for host pages without markup.
     * Example: [{ label: 'Início', href: '/' }, { label: 'Ajuda', href: '/ajuda' }]
     * Ignored when the page already has [data-ms-pills] authored in HTML.
     * @type {null | { label: string, href: string, short?: string }[]}
     */
    simpleNav: null
  };
  var defaults_default = defaults;

  // src/config/mergeConfig.js
  function mergeConfig(base, patch) {
    const merged = { ...base, ...patch };
    const scoring = { ...base.scoring };
    const patchScoring = patch && patch.scoring;
    if (patchScoring && typeof patchScoring === "object") {
      for (const [key, value] of Object.entries(patchScoring)) {
        if (typeof value === "number" && Number.isFinite(value)) {
          scoring[key] = value;
        }
      }
    }
    merged.scoring = scoring;
    return merged;
  }

  // src/core/eventBus.js
  var eventBus = {
    /** @type {Record<string, Function[]>} */
    _listeners: {},
    /**
     * Subscribe to an event.
     * @param {string} event
     * @param {Function} callback
     * @returns {Function} Unsubscribe function
     */
    on(event, callback) {
      if (!this._listeners[event]) this._listeners[event] = [];
      this._listeners[event].push(callback);
      return () => this.off(event, callback);
    },
    /**
     * Unsubscribe a specific callback from an event.
     * @param {string} event
     * @param {Function} callback
     */
    off(event, callback) {
      if (!this._listeners[event]) return;
      this._listeners[event] = this._listeners[event].filter(
        (cb) => cb !== callback
      );
    },
    /**
     * Emit an event, invoking all registered callbacks with data.
     * Errors inside callbacks are caught and logged so a bad handler cannot
     * crash the whole system.
     * @param {string} event
     * @param {*} data
     */
    emit(event, data) {
      const listeners = this._listeners[event];
      if (!listeners || listeners.length === 0) return;
      [...listeners].forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          if (typeof process === "undefined" || true) {
            console.error("[ModoSimples] Event handler error:", err);
          }
        }
      });
    },
    /**
     * Remove all listeners for one event. Used on destroy().
     * @param {string} event
     */
    clear(event) {
      delete this._listeners[event];
    },
    /** Remove all listeners for every event. */
    clearAll() {
      this._listeners = {};
    }
  };
  var eventBus_default = eventBus;

  // src/core/state.js
  var TYPO_LIMITS = {
    lineHeight: { min: 1.5, max: 3, step: 0.1 },
    wordSpacing: { min: 0, max: 0.8, step: 0.02 },
    letterSpacing: { min: 0, max: 0.3, step: 0.01 }
  };
  function clampTypo(key, value) {
    const n = Number(value);
    const lim = TYPO_LIMITS[key];
    if (!lim || !Number.isFinite(n) || n <= 0) return 0;
    return Math.round(Math.min(lim.max, Math.max(lim.min, n)) * 100) / 100;
  }
  var initialState = {
    modoSimples: false,
    panelOpen: false,
    /** F7f: id do perfil ativo (core/profiles.js) ou null; `profileCustom` = ajustado à mão depois */
    activeProfile: null,
    profileCustom: false,
    options: {
      textScale: "100",
      colorTheme: "senac",
      colorSaturation: "normal",
      customText: "",
      customHeading: "",
      customBg: "",
      dyslexiaFont: false,
      readingRuler: false,
      highlightLinks: false,
      highlightHeadings: false,
      highlightControls: false,
      enlargeTargets: false,
      textMagnifier: false,
      textSpacing: false,
      lineHeight: 0,
      wordSpacing: 0,
      letterSpacing: 0,
      cursorStyle: "default",
      reducedMotion: false,
      hideImages: false,
      simpleLanguage: false,
      readFocus: false,
      blockFlashing: false,
      strongFocus: false,
      showShortcuts: false,
      muteMedia: false
    }
  };
  function cloneState(s) {
    return { ...s, options: { ...s.options } };
  }
  function createState(initial) {
    let current = cloneState(initial);
    return {
      /** Returns a snapshot — never a direct reference to internal state. */
      get() {
        return cloneState(current);
      },
      /**
       * Merge a patch into current state and emit 'stateChange'.
       * Nested `options` are merged (not replaced), so partial patches work:
       *   state.set({ options: { textScale: '150' } })
       *   → only textScale changes; others are preserved.
       *
       * @param {Object} patch
       */
      set(patch) {
        const prev = cloneState(current);
        if (patch.options) {
          current = {
            ...current,
            ...patch,
            options: { ...current.options, ...patch.options }
          };
        } else {
          current = { ...current, ...patch };
        }
        eventBus_default.emit("stateChange", { prev, next: cloneState(current) });
      },
      /** Reset state to initial values (e.g. on destroy). */
      reset() {
        this.set(cloneState(initialState));
      }
    };
  }
  var state = createState(initialState);
  var state_default = state;

  // src/core/announcements.js
  var TOGGLE_ANNOUNCEMENTS = {
    dyslexiaFont: ["Fonte Lexend ativada", "Fonte Lexend desativada"],
    highlightLinks: ["Destaque de links ativado", "Destaque de links desativado"],
    highlightHeadings: [
      "Destaque de cabe\xE7alhos ativado",
      "Destaque de cabe\xE7alhos desativado"
    ],
    highlightControls: [
      "Destaque de bot\xF5es e campos ativado",
      "Destaque de bot\xF5es e campos desativado"
    ],
    textMagnifier: ["Lupa de texto ligada", "Lupa de texto desligada"],
    enlargeTargets: ["Bot\xF5es ampliados", "Bot\xF5es com tamanho normal"],
    textSpacing: [
      "Espa\xE7amento de texto ativado",
      "Espa\xE7amento de texto desativado"
    ],
    hideImages: ["Imagens ocultadas", "Imagens vis\xEDveis"],
    reducedMotion: [
      "Movimento reduzido ativado",
      "Movimento reduzido desativado"
    ],
    simpleLanguage: ["Linguagem simples ligada", "Linguagem simples desligada"],
    readFocus: ["Leitura do foco ligada", "Leitura do foco desligada"],
    muteMedia: ["V\xEDdeos e sons silenciados", "V\xEDdeos e sons liberados"],
    strongFocus: ["Foco refor\xE7ado ligado", "Foco refor\xE7ado desligado"],
    showShortcuts: ["Atalhos do teclado vis\xEDveis", "Atalhos do teclado ocultos"],
    blockFlashing: [
      "Bloqueio de anima\xE7\xF5es e GIFs ligado",
      "Bloqueio de anima\xE7\xF5es e GIFs desligado"
    ]
  };
  var THEME_LABELS = {
    senac: "Cores do site",
    yellowBlack: "Amarelo e Preto",
    darkHigh: "Modo Escuro Alto",
    soft: "Descanso Suave",
    mono: "Monocrom\xE1tico",
    lightHigh: "Claro Alto Contraste"
  };
  var SATURATION_LABELS = { low: "baixa", normal: "normal", high: "alta" };
  var CURSOR_LABELS = {
    default: "padr\xE3o",
    bigWhite: "grande branco",
    bigBlack: "grande preto"
  };
  var CUSTOM_LABELS = {
    customText: "texto",
    customHeading: "t\xEDtulos",
    customBg: "fundo"
  };
  function diffStateAnnouncements(prev, next) {
    const out = [];
    if (prev.options.readingRuler !== next.options.readingRuler) {
      out.push(
        next.options.readingRuler ? "R\xE9gua de leitura ativada" : "R\xE9gua de leitura desativada"
      );
    }
    Object.entries(TOGGLE_ANNOUNCEMENTS).forEach(([k, [on2, off]]) => {
      if (prev.options[k] !== next.options[k])
        out.push(next.options[k] ? on2 : off);
    });
    if (prev.options.textScale !== next.options.textScale) {
      out.push(`Tamanho do texto ${next.options.textScale}%`);
    }
    if (prev.options.colorTheme !== next.options.colorTheme) {
      out.push(
        `Tema ${THEME_LABELS[next.options.colorTheme] || next.options.colorTheme}`
      );
    }
    if (prev.options.colorSaturation !== next.options.colorSaturation) {
      out.push(
        `Satura\xE7\xE3o ${SATURATION_LABELS[next.options.colorSaturation] || next.options.colorSaturation}`
      );
    }
    if (prev.options.cursorStyle !== next.options.cursorStyle) {
      out.push(
        `Cursor ${CURSOR_LABELS[next.options.cursorStyle] || next.options.cursorStyle}`
      );
    }
    Object.entries(CUSTOM_LABELS).forEach(([k, label]) => {
      if (prev.options[k] !== next.options[k])
        out.push(
          next.options[k] ? `Cor personalizada de ${label} ${next.options[k]}` : `Cor personalizada de ${label} removida`
        );
    });
    return out;
  }

  // src/core/persistence.js
  var KEY_PREFIX = "ms_";
  var persistence = {
    /**
     * Save a JSON-serialisable value.
     * @param {string} key
     * @param {*} value
     */
    save(key, value) {
      try {
        localStorage.setItem(KEY_PREFIX + key, JSON.stringify(value));
      } catch (_) {
      }
    },
    /**
     * Load a previously saved value.
     * @param {string} key
     * @param {*} [fallback=null] Value returned when the key is not found or parsing fails
     * @returns {*}
     */
    load(key, fallback = null) {
      try {
        const raw = localStorage.getItem(KEY_PREFIX + key);
        return raw !== null ? JSON.parse(raw) : fallback;
      } catch (_) {
        return fallback;
      }
    },
    /**
     * Remove a saved value.
     * @param {string} key
     */
    remove(key) {
      try {
        localStorage.removeItem(KEY_PREFIX + key);
      } catch (_) {
      }
    },
    /**
     * Build a hostname-scoped key: `base:hostname`.
     * @param {string} base
     * @returns {string}
     */
    hostKey(base) {
      const host = typeof location !== "undefined" && location.hostname ? location.hostname : "local";
      return `${base}:${host}`;
    },
    /**
     * Save a value under a hostname-scoped key.
     * @param {string} base
     * @param {*} value
     */
    saveForHost(base, value) {
      this.save(this.hostKey(base), value);
    },
    /**
     * Remove a value saved under a hostname-scoped key.
     * @param {string} base
     */
    removeForHost(base) {
      this.remove(this.hostKey(base));
    },
    /**
     * Load a value from a hostname-scoped key.
     * @param {string} base
     * @param {*} [fallback=null]
     * @returns {*}
     */
    loadForHost(base, fallback = null) {
      return this.load(this.hostKey(base), fallback);
    },
    /**
     * Build a page-scoped key: `base@/pathname:hostname`.
     * Para dados que só fazem sentido numa página (ex.: conteúdo principal escolhido).
     * @param {string} base
     * @returns {string}
     */
    pathKey(base) {
      const path = typeof location !== "undefined" && location.pathname ? location.pathname : "/";
      return `${base}@${path}:${this.hostKey("").slice(1)}`;
    },
    /** @param {string} base @param {*} value */
    saveForPath(base, value) {
      this.save(this.pathKey(base), value);
    },
    /** @param {string} base */
    removeForPath(base) {
      this.remove(this.pathKey(base));
    },
    /**
     * Load a page-scoped value. Sem registro para a página, devolve fallback
     * (quem migra dados antigos consulta a chave por host explicitamente).
     * @param {string} base
     * @param {*} [fallback=null]
     * @returns {*}
     */
    loadForPath(base, fallback = null) {
      return this.load(this.pathKey(base), fallback);
    }
  };
  var persistence_default = persistence;

  // src/core/profiles.js
  var freeze = (p) => Object.freeze({ ...p, options: Object.freeze({ ...p.options }) });
  var PROFILES = Object.freeze([
    freeze({ id: "simple", key: "Simple", modoSimples: true, options: {} }),
    freeze({
      id: "lowVision",
      key: "LowVision",
      modoSimples: false,
      options: {
        textScale: "150",
        colorTheme: "yellowBlack",
        cursorStyle: "bigWhite",
        lineHeight: 1.5
      }
    }),
    freeze({
      id: "dyslexia",
      key: "Dyslexia",
      modoSimples: false,
      options: {
        dyslexiaFont: true,
        letterSpacing: 0.12,
        wordSpacing: 0.16,
        lineHeight: 1.5,
        readingRuler: true
      }
    }),
    freeze({
      id: "adhd",
      key: "Adhd",
      modoSimples: true,
      options: { readFocus: true, muteMedia: true, reducedMotion: true }
    }),
    freeze({
      id: "epilepsy",
      key: "Epilepsy",
      modoSimples: false,
      options: { blockFlashing: true, reducedMotion: true, muteMedia: true }
    }),
    freeze({
      id: "keyboard",
      key: "Keyboard",
      modoSimples: false,
      options: { strongFocus: true, readFocus: true, showShortcuts: true }
    })
  ]);
  function getProfile(id) {
    return PROFILES.find((p) => p.id === id) || null;
  }
  function profileDiffers(base, now, reducedMotionIsUserChoice) {
    if (base.modoSimples !== now.modoSimples) return true;
    return Object.keys(base.options).some(
      (k) => (k !== "reducedMotion" || reducedMotionIsUserChoice) && base.options[k] !== now.options[k]
    );
  }

  // src/core/persistedState.js
  var SCHEMA_VERSION = 1;
  var hexOrEmpty = (v) => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v) ? v.toLowerCase() : "";
  function hydratePersistedState(saved) {
    var _a, _b;
    if (!saved || typeof saved !== "object") return null;
    const opts = saved.options || {};
    let textScale = opts.textScale || "100";
    if (!opts.textScale && opts.largerText) textScale = "125";
    let colorTheme = opts.colorTheme || "senac";
    if (!opts.colorTheme && opts.highContrast) colorTheme = "yellowBlack";
    const modoSimples = Boolean(saved.modoSimples);
    const activeProfile = (_b = (_a = getProfile(saved.activeProfile)) == null ? void 0 : _a.id) != null ? _b : null;
    return {
      modoSimples,
      activeProfile,
      profileCustom: activeProfile ? Boolean(saved.profileCustom) : false,
      options: {
        textScale: ["100", "125", "150", "175"].includes(textScale) ? textScale : "100",
        colorTheme: [
          "senac",
          "yellowBlack",
          "darkHigh",
          "soft",
          "mono",
          "lightHigh"
        ].includes(colorTheme) ? colorTheme : "senac",
        colorSaturation: ["low", "normal", "high"].includes(opts.colorSaturation) ? opts.colorSaturation : "normal",
        customText: hexOrEmpty(opts.customText),
        customHeading: hexOrEmpty(opts.customHeading),
        customBg: hexOrEmpty(opts.customBg),
        dyslexiaFont: Boolean(opts.dyslexiaFont),
        readingRuler: Boolean(opts.readingRuler),
        highlightLinks: Boolean(opts.highlightLinks),
        highlightHeadings: Boolean(opts.highlightHeadings),
        highlightControls: Boolean(opts.highlightControls),
        enlargeTargets: Boolean(opts.enlargeTargets),
        textMagnifier: Boolean(opts.textMagnifier),
        textSpacing: Boolean(opts.textSpacing),
        lineHeight: clampTypo("lineHeight", opts.lineHeight),
        wordSpacing: clampTypo("wordSpacing", opts.wordSpacing),
        letterSpacing: clampTypo("letterSpacing", opts.letterSpacing),
        cursorStyle: ["default", "bigWhite", "bigBlack"].includes(
          opts.cursorStyle
        ) ? opts.cursorStyle : "default",
        reducedMotion: Boolean(opts.reducedMotion),
        hideImages: Boolean(opts.hideImages),
        readFocus: Boolean(opts.readFocus),
        muteMedia: Boolean(opts.muteMedia),
        blockFlashing: Boolean(opts.blockFlashing),
        strongFocus: Boolean(opts.strongFocus),
        showShortcuts: Boolean(opts.showShortcuts),
        // Linguagem simples é acoplada ao MS; sem MS não reativa “órfã”
        simpleLanguage: modoSimples ? Boolean(opts.simpleLanguage) : false
      }
    };
  }

  // src/heuristics/scoring.js
  function scoreElement(element, config = defaults_default) {
    var _a;
    const { scoring } = config;
    let score = 0;
    const tag = element.tagName.toLowerCase();
    const role = element.getAttribute("role");
    if (tag === "main") score += scoring.mainTagBonus;
    if (role === "main") score += scoring.roleMainBonus;
    if (tag === "article") score += scoring.articleBonus;
    if (element.querySelector("h1")) score += scoring.h1Bonus;
    if (element.querySelector("h2")) score += scoring.h2Bonus;
    const textLength2 = ((_a = element.textContent) != null ? _a : "").trim().length;
    if (textLength2 >= scoring.minTextLength) {
      score += scoring.textLengthBonus;
      if (textLength2 >= scoring.minTextLength * 3)
        score += scoring.textLengthBonus;
    }
    return score;
  }

  // src/heuristics/queryAll.js
  function queryAll(selectors) {
    if (!Array.isArray(selectors) || selectors.length === 0) return [];
    try {
      return Array.from(document.querySelectorAll(selectors.join(",")));
    } catch (_) {
      const found = /* @__PURE__ */ new Set();
      for (const selector of selectors) {
        try {
          document.querySelectorAll(selector).forEach((el2) => found.add(el2));
        } catch (_2) {
        }
      }
      return [...found];
    }
  }

  // src/heuristics/contentDetector.js
  function detectMainContent(config = defaults_default) {
    const scored = [];
    const rank = (el2) => {
      if (typeof el2.matches !== "function") return 0;
      const i = config.mainSelectors.findIndex((sel) => {
        try {
          return el2.matches(sel);
        } catch (_) {
          return false;
        }
      });
      return i === -1 ? config.mainSelectors.length : i;
    };
    const candidates = queryAll(config.mainSelectors).map((element, order) => ({
      element,
      order,
      priority: rank(element)
    }));
    candidates.sort((a, b) => a.priority - b.priority || a.order - b.order);
    for (const { element } of candidates) {
      scored.push({ element, score: scoreElement(element, config) });
    }
    if (scored.length === 0) {
      return { element: document.body, confidence: 0 };
    }
    scored.sort((a, b) => b.score - a.score);
    const best = scored[0];
    const { scoring } = config;
    const ideal = scoring.mainTagBonus + scoring.h1Bonus + scoring.textLengthBonus * 2;
    const confidence = Math.min(best.score / ideal, 1);
    return { element: best.element, confidence };
  }

  // src/core/instancePersistence.js
  var textLength = (el2) => (el2 && el2.textContent || "").trim().length;
  var STATE_KEY = "state";
  var PRINCIPAL_KEY = "principal";
  var SIDE_KEY = "panelSide";
  function saveHideImagesBeforeMs(ms, hide3) {
    ms._hideImagesBeforeMs = !!hide3;
    if (!ms._config.persistence) return;
    const key = "hideImagesBeforeMs";
    if (ms._config.hostnamePersistence) {
      persistence_default.saveForHost(key, !!hide3);
    } else {
      persistence_default.save(key, !!hide3);
    }
  }
  function takeHideImagesBeforeMs(ms) {
    let hide3 = ms._hideImagesBeforeMs;
    if (hide3 === null && ms._config.persistence) {
      const key = "hideImagesBeforeMs";
      hide3 = ms._config.hostnamePersistence ? persistence_default.loadForHost(key, null) : persistence_default.load(key, null);
    }
    ms._hideImagesBeforeMs = null;
    if (ms._config.persistence) {
      const key = "hideImagesBeforeMs";
      if (ms._config.hostnamePersistence) {
        persistence_default.removeForHost(key);
      } else {
        persistence_default.remove(key);
      }
    }
    return !!hide3;
  }
  function loadPreferShowImages(ms) {
    if (!ms._config.persistence) return false;
    const key = "preferShowImagesInMs";
    const v = ms._config.hostnamePersistence ? persistence_default.loadForHost(key, false) : persistence_default.load(key, false);
    return !!v;
  }
  function savePreferShowImages(ms, show2) {
    if (!ms._config.persistence) return;
    const key = "preferShowImagesInMs";
    if (ms._config.hostnamePersistence) {
      persistence_default.saveForHost(key, !!show2);
    } else {
      persistence_default.save(key, !!show2);
    }
  }
  function loadPanelSide(ms) {
    const fallback = ms._config.position.endsWith("left") ? "left" : "right";
    if (!ms._config.persistence) return fallback;
    const v = ms._config.hostnamePersistence ? persistence_default.loadForHost(SIDE_KEY) : persistence_default.load(SIDE_KEY);
    return v === "left" || v === "right" ? v : fallback;
  }
  function savePanelSide(ms, side) {
    if (!ms._config.persistence) return;
    if (ms._config.hostnamePersistence) {
      persistence_default.saveForHost(SIDE_KEY, side);
    } else {
      persistence_default.save(SIDE_KEY, side);
    }
  }
  function persistState(ms, next) {
    if (!ms._config.persistence) return;
    const payload = {
      v: SCHEMA_VERSION,
      modoSimples: next.modoSimples,
      activeProfile: next.activeProfile,
      profileCustom: next.profileCustom,
      // reducedMotion só é gravado quando o usuário escolheu (null = derivado do SO)
      options: { ...next.options, reducedMotion: ms._reducedMotionUser }
    };
    const json = JSON.stringify(payload);
    if (json === ms._lastPersisted) return;
    ms._lastPersisted = json;
    if (ms._config.hostnamePersistence) {
      persistence_default.saveForHost(STATE_KEY, payload);
    } else {
      persistence_default.save(STATE_KEY, payload);
    }
  }
  function loadPersistedState(ms) {
    if (!ms._config.persistence) return;
    const saved = ms._config.hostnamePersistence ? persistence_default.loadForHost(STATE_KEY) : persistence_default.load(STATE_KEY);
    if (!saved) return;
    const patch = hydratePersistedState(saved);
    if (patch) state_default.set(patch);
    const rm = saved.options && saved.options.reducedMotion;
    const isUserChoice = saved.v >= 1 && typeof rm === "boolean";
    ms._reducedMotionUser = isUserChoice ? rm : null;
  }
  function savePrincipalPath(ms, path, el2) {
    if (!ms._config.persistence || !path) return;
    persistence_default.saveForPath(PRINCIPAL_KEY, {
      path,
      textLen: textLength(el2)
    });
  }
  function loadPrincipal(ms) {
    if (!ms._config.persistence) return null;
    let v = persistence_default.loadForPath(PRINCIPAL_KEY);
    const viaHost = v == null;
    if (viaHost) {
      v = ms._config.hostnamePersistence ? persistence_default.loadForHost(PRINCIPAL_KEY) : persistence_default.load(PRINCIPAL_KEY);
    }
    if (typeof v === "string" && v) {
      return { path: v, textLen: null, legacy: true };
    }
    if (v && typeof v.path === "string" && v.path) {
      return {
        path: v.path,
        textLen: Number.isFinite(v.textLen) ? v.textLen : null,
        legacy: viaHost
      };
    }
    return null;
  }
  function discardPrincipal(ms) {
    if (!ms._config.persistence) return;
    persistence_default.removeForPath(PRINCIPAL_KEY);
  }
  function isPlausiblePrincipal(ms, el2, saved) {
    const len = textLength(el2);
    if (len < ms._config.scoring.minTextLength) return false;
    if (saved.textLen && len < saved.textLen * 0.5) return false;
    if (saved.legacy) return ms._legacyHintFits(el2, len);
    return true;
  }
  function legacyHintFits(ms, el2, len) {
    const { element, confidence } = detectMainContent(ms._config);
    if (confidence < ms._config.confidenceThreshold || element === el2) {
      return true;
    }
    return len >= textLength(element) * 0.5;
  }

  // src/utils/mediaQuery.js
  function match(query) {
    return typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia(query) : null;
  }
  function prefersReducedMotion() {
    const mq = match("(prefers-reduced-motion: reduce)");
    return !!(mq && mq.matches);
  }
  function onReducedMotionChange(callback) {
    const mq = match("(prefers-reduced-motion: reduce)");
    if (!mq) return () => {
    };
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", callback);
      return () => mq.removeEventListener("change", callback);
    }
    if (typeof mq.addListener === "function") {
      mq.addListener(callback);
      return () => mq.removeListener(callback);
    }
    return () => {
    };
  }

  // src/utils/aria.js
  function announce(message, politeness = "polite") {
    const live = document.createElement("div");
    live.setAttribute("role", "status");
    live.setAttribute("aria-live", politeness);
    live.setAttribute("aria-atomic", "true");
    live.setAttribute("data-ms-live", "");
    live.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;";
    document.body.appendChild(live);
    setTimeout(() => {
      live.textContent = message;
      setTimeout(() => {
        if (live.parentNode) live.parentNode.removeChild(live);
      }, 3e3);
    }, 50);
  }

  // src/utils/simpleLanguage.js
  function hasSimpleLanguagePairs() {
    if (typeof document === "undefined") return false;
    return !!(document.querySelector("[data-ms-plain]") && document.querySelector("[data-ms-simple]"));
  }

  // src/ui/styles.generated.js
  var UI_CSS = `
    :host {
      all: initial;
      display: block;
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 2147483647;
      --ms-blue: #0B2C5F;
      --ms-blue-mid: #1B3F92;
      --ms-orange: #F39200;
      --ms-orange-dark: #E08400;
      --ms-simple-bg: #FFF8E7;
      --ms-simple-border: #F39200;
      --ms-panel-radius: 14px;
      --ms-u: calc(16px * var(--ms-scale, 1));
      --ms-font: 'Lexend', system-ui, -apple-system, 'Segoe UI', sans-serif;
      font-family: var(--ms-font);
      font-size: 15px;
      line-height: 1.45;
      color: #1a1a1a;
      box-sizing: border-box;
    }

    *, *::before, *::after { box-sizing: inherit; }

    /* \u2500\u2500 FAB \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .ms-fab-wrap {
      position: absolute;
      {{fabCorner}}
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: calc(0.45 * var(--ms-u));
      pointer-events: none;
      z-index: 2;
    }
    .ms-fab-tip {
      pointer-events: none;
      position: relative;
      background: #0B2C5F;
      color: #fff;
      font-size: calc(0.75 * var(--ms-u));
      font-weight: 700;
      padding: calc(0.45 * var(--ms-u)) calc(0.8 * var(--ms-u));
      border-radius: 999px;
      box-shadow:
        0 2px 4px rgba(11, 44, 95, 0.18),
        0 8px 20px rgba(11, 44, 95, 0.28);
      white-space: nowrap;
      max-width: min(240px, 72vw);
      line-height: 1.25;
      animation:
        ms-fab-tip-in 0.38s ease both,
        ms-fab-tip-out 0.4s ease 6s forwards;
    }
    .ms-fab-tip::after {
      content: '';
      position: absolute;
      bottom: -5px;
      right: calc(1.15 * var(--ms-u));
      width: 0;
      height: 0;
      border: 6px solid transparent;
      border-top-color: #0B2C5F;
      filter: drop-shadow(0 2px 1px rgba(11, 44, 95, 0.15));
    }
    .ms-fab-tip[hidden] { display: none !important; }

    @keyframes ms-fab-tip-in {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes ms-fab-tip-out {
      to {
        opacity: 0;
        visibility: hidden;
      }
    }

    #ms-fab,
    .ms-fab {
      position: relative;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      border: none;
      background: var(--ms-orange);
      color: #fff;
      cursor: pointer;
      pointer-events: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow:
        0 2px 6px rgba(243, 146, 0, 0.35),
        0 8px 22px rgba(243, 146, 0, 0.4);
      transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.15s ease;
      padding: 0;
    }

    #ms-fab:hover {
      background: var(--ms-orange-dark);
      transform: scale(1.06);
      box-shadow:
        0 4px 10px rgba(243, 146, 0, 0.4),
        0 12px 28px rgba(243, 146, 0, 0.45);
    }
    #ms-fab:active { transform: scale(0.96); }
    #ms-fab:focus-visible {
      outline: 3px solid var(--ms-blue);
      outline-offset: 3px;
    }
    #ms-fab.ms-fab--open {
      box-shadow:
        0 0 0 4px rgba(243, 146, 0, 0.35),
        0 4px 16px rgba(0, 0, 0, 0.25);
    }
    .ms-fab-icon { display: block; }
    .ms-fab-icon--close[hidden],
    .ms-fab-icon--open[hidden] { display: none !important; }


    .ms-fab-wrap[hidden] { display: none !important; }
    .ms-fab-wrap[data-ms-side="left"] {
      right: auto;
      left: calc(1.5 * var(--ms-u));
      align-items: flex-start;
    }
    .ms-fab-wrap[data-ms-side="right"] {
      left: auto;
      right: calc(1.5 * var(--ms-u));
      align-items: flex-end;
    }
    .ms-fab-wrap[data-ms-side="left"] .ms-fab-tip::after {
      right: auto;
      left: calc(1.15 * var(--ms-u));
    }
    .ms-fab-box { position: relative; }
    .ms-fab-hide {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 28px;
      height: 28px;
      padding: 0;
      border-radius: 50%;
      border: 2px solid #fff;
      background: #0B2C5F;
      color: #fff;
      cursor: pointer;
      pointer-events: auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ms-fab-wrap[data-ms-side="left"] .ms-fab-hide { right: auto; left: -8px; }
    .ms-fab-hide:hover { background: #123f86; }
    .ms-fab-hide:focus-visible { outline: 3px solid var(--ms-blue); outline-offset: 2px; }
    .ms-fab-wrap--open .ms-fab-hide { display: none; }
    /* \u2500\u2500 Panel \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    #ms-a11y-panel,
    .ms-a11y-panel {
      position: absolute;
      {{panelCorner}}
      width: min(380px, calc(100vw - calc(2 * var(--ms-u))));
      max-height: min(72vh, 640px);
      display: flex;
      flex-direction: column;
      background: #fff;
      border-radius: var(--ms-panel-radius);
      box-shadow:
        0 4px 12px rgba(11, 44, 95, 0.12),
        0 16px 48px rgba(11, 44, 95, 0.28);
      overflow: hidden;
      pointer-events: auto;
      z-index: 1;
      transform-origin: {{panelOrigin}};
      animation: ms-panel-in 0.22s ease both;
    }

    #ms-a11y-panel[hidden] { display: none !important; }

    @keyframes ms-panel-in {
      from {
        opacity: 0;
        transform: translateY(10px) scale(0.97);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .ms-a11y-header {
      display: flex;
      align-items: flex-start;
      gap: calc(0.75 * var(--ms-u));
      padding: calc(1 * var(--ms-u)) calc(1 * var(--ms-u)) calc(0.9 * var(--ms-u));
      background: linear-gradient(135deg, var(--ms-blue) 0%, var(--ms-blue-mid) 100%);
      color: #fff;
      flex-shrink: 0;
    }

    .ms-a11y-header-icon {
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: var(--ms-orange);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ms-a11y-header-text { flex: 1; min-width: 0; }
    .ms-a11y-header-text h2 {
      margin: 0;
      font-size: calc(1.05 * var(--ms-u));
      font-weight: 700;
      line-height: 1.25;
      color: #fff;
    }
    .ms-a11y-subtitle {
      margin: calc(0.2 * var(--ms-u)) 0 0;
      font-size: calc(0.8125 * var(--ms-u));
      opacity: 0.85;
      color: #fff;
    }

    .ms-a11y-close {
      flex-shrink: 0;
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.85);
      cursor: pointer;
      padding: calc(0.25 * var(--ms-u));
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ms-a11y-close:hover { background: rgba(255, 255, 255, 0.12); color: #fff; }
    .ms-a11y-close:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }

    .ms-a11y-body {
      overflow-y: auto;
      padding: calc(0.85 * var(--ms-u)) calc(1 * var(--ms-u)) calc(1.1 * var(--ms-u));
      flex: 1;
      background: #f7f8fa;
    }


    #ms-a11y-panel[data-ms-side="left"] {
      right: auto;
      left: calc(1.5 * var(--ms-u));
      transform-origin: bottom left;
    }
    #ms-a11y-panel[data-ms-side="right"] {
      left: auto;
      right: calc(1.5 * var(--ms-u));
      transform-origin: bottom right;
    }
    .ms-a11y-actions {
      display: flex;
      flex-wrap: wrap;
      gap: calc(0.5 * var(--ms-u));
      margin-top: calc(0.75 * var(--ms-u));
    }
    .ms-a11y-action {
      flex: 1 1 auto;
      min-height: 44px;
      padding: calc(0.5 * var(--ms-u)) calc(0.75 * var(--ms-u));
      border: 2px solid var(--ms-blue);
      border-radius: 8px;
      background: #fff;
      color: var(--ms-blue);
      font: inherit;
      font-weight: 700;
      font-size: calc(0.875 * var(--ms-u));
      cursor: pointer;
    }
    .ms-a11y-action:hover { background: #eef3fb; }
    .ms-a11y-action:focus-visible { outline: 3px solid var(--ms-blue); outline-offset: 2px; }
    /* \u2500\u2500 Modo Simples card \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .ms-a11y-card--simple {
      background: var(--ms-simple-bg);
      border: 2px solid var(--ms-simple-border);
      border-radius: 12px;
      padding: calc(0.85 * var(--ms-u)) calc(0.9 * var(--ms-u));
      margin-bottom: calc(1 * var(--ms-u));
    }
    .ms-a11y-card-row {
      display: flex;
      align-items: flex-start;
      gap: calc(0.75 * var(--ms-u));
    }
    .ms-a11y-card-text { flex: 1; min-width: 0; }
    .ms-a11y-card-star {
      color: var(--ms-orange);
      margin-right: calc(0.2 * var(--ms-u));
      font-size: calc(1 * var(--ms-u));
    }
    .ms-a11y-card-text strong {
      font-size: calc(0.95 * var(--ms-u));
      color: var(--ms-blue);
    }
    .ms-a11y-card-text p {
      margin: calc(0.35 * var(--ms-u)) 0 0;
      font-size: calc(0.78 * var(--ms-u));
      color: #4a5568;
      line-height: 1.4;
    }

    .ms-a11y-card--simple .ms-switch--on,
    .ms-a11y-card--simple .ms-switch[aria-checked="true"] {
      background: #8a5500;
    }

    /* \u2500\u2500 Sections (sanfona) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .ms-a11y-section {
      background: #fff;
      border-radius: 10px;
      margin-bottom: calc(0.75 * var(--ms-u));
      border: 1px solid #e8eaef;
    }
    .ms-a11y-section-title {
      margin: 0;
      font-size: calc(0.8125 * var(--ms-u));
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--ms-blue);
    }
    .ms-a11y-section-toggle {
      display: flex;
      align-items: center;
      gap: calc(0.35 * var(--ms-u));
      width: 100%;
      min-height: 44px;
      padding: calc(0.75 * var(--ms-u)) calc(0.85 * var(--ms-u));
      border: none;
      border-radius: 10px;
      background: transparent;
      color: inherit;
      font: inherit;
      letter-spacing: inherit;
      text-transform: inherit;
      text-align: start;
      cursor: pointer;
    }
    .ms-a11y-section-toggle:focus-visible {
      outline: 2px solid var(--ms-orange);
      outline-offset: -2px;
    }
    .ms-a11y-section-name {
      flex: 1;
    }
    .ms-a11y-section-chevron {
      display: inline-flex;
      transition: transform 0.15s ease-out;
    }
    .ms-a11y-section-toggle[aria-expanded="true"] .ms-a11y-section-chevron {
      transform: rotate(180deg);
    }
    .ms-a11y-section-body {
      padding: 0 calc(0.85 * var(--ms-u)) calc(0.75 * var(--ms-u));
    }
    .ms-a11y-control-label {
      margin: 0;
      font-size: calc(0.8125 * var(--ms-u));
      font-weight: 700;
      color: #1e293b;
    }
    @media (prefers-reduced-motion: reduce) {
      .ms-a11y-section-chevron {
        transition: none;
      }
    }
    /* \u2500\u2500 Segmented text scale \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .ms-segmented {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: calc(0.35 * var(--ms-u));
    }
    .ms-segment {
      border: none;
      border-radius: 8px;
      padding: calc(0.55 * var(--ms-u)) calc(0.25 * var(--ms-u));
      min-height: 44px;
      font: inherit;
      font-size: calc(0.8 * var(--ms-u));
      font-weight: 600;
      background: #eef0f4;
      color: #334155;
      cursor: pointer;
    }
    .ms-segment--on,
    .ms-segment[aria-checked="true"] {
      background: var(--ms-blue);
      color: #fff;
    }
    .ms-segment:focus-visible {
      outline: 2px solid var(--ms-orange);
      outline-offset: 2px;
    }

    /* \u2500\u2500 Theme grid \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .ms-theme-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: calc(0.5 * var(--ms-u));
    }
    .ms-theme-btn {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: calc(0.15 * var(--ms-u));
      text-align: left;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      padding: calc(0.55 * var(--ms-u)) calc(0.6 * var(--ms-u));
      background: #fff;
      cursor: pointer;
      font: inherit;
      color: #1a1a1a;
    }
    .ms-theme-btn--on,
    .ms-theme-btn[aria-checked="true"] {
      border-color: var(--ms-blue);
      box-shadow: 0 0 0 1px var(--ms-blue);
    }
    .ms-theme-btn:focus-visible {
      outline: 2px solid var(--ms-orange);
      outline-offset: 2px;
    }
    .ms-theme-swatch {
      width: 100%;
      height: 18px;
      border-radius: 4px;
      margin-bottom: calc(0.25 * var(--ms-u));
      border: 1px solid rgba(0, 0, 0, 0.08);
    }
    .ms-theme-btn--senac .ms-theme-swatch {
      background: linear-gradient(90deg, #0B2C5F 40%, #F5A623 40%);
    }
    .ms-theme-btn--yellowBlack .ms-theme-swatch {
      background: linear-gradient(90deg, #000 50%, #ffe600 50%);
    }
    .ms-theme-btn--darkHigh .ms-theme-swatch {
      background: linear-gradient(90deg, #111 50%, #f1f5f9 50%);
    }
    .ms-theme-btn--soft .ms-theme-swatch {
      background: linear-gradient(90deg, #f5efe0 50%, #5c4a32 50%);
    }
    .ms-theme-btn--mono .ms-theme-swatch {
      background: linear-gradient(90deg, #111 33%, #888 33% 66%, #eee 66%);
    }
    .ms-theme-btn--lightHigh .ms-theme-swatch {
      background: linear-gradient(90deg, #fff 50%, #000 50%);
      border-color: #000;
    }
    .ms-segmented[data-option="colorSaturation"],
    .ms-segmented[data-option="cursorStyle"] {
      grid-template-columns: repeat(3, 1fr);
    }
    .ms-swatches {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
      gap: calc(0.35 * var(--ms-u));
    }
    .ms-swatch[hidden] { display: none; }
    .ms-a11y-warn {
      margin: calc(0.4 * var(--ms-u)) 0 0;
      padding: calc(0.4 * var(--ms-u)) calc(0.55 * var(--ms-u));
      border-left: 4px solid #b45309;
      border-radius: 4px;
      background: #fffbeb;
      color: #7c2d12;
      font-size: calc(0.8125 * var(--ms-u));
      font-weight: 600;
    }
    /* regi\xE3o viva persistente: vazia fica sem tamanho mas na \xE1rvore de acessibilidade (display:none faria o leitor perder o an\xFAncio) */
    .ms-a11y-warn:empty { height: 0; margin: 0; padding: 0; border: 0; overflow: hidden; }
    .ms-swatch {
      min-height: 36px;
      min-width: 36px;
      border: 2px solid #64748b;
      border-radius: 8px;
      cursor: pointer;
      font: inherit;
      /* "Padr\xE3o do site": risca diagonal sobre fundo branco */
      background-image: none;
    }
    .ms-swatch--none {
      background: linear-gradient(135deg, #fff 45%, #dc2626 45% 55%, #fff 55%);
    }
    .ms-swatch--on,
    .ms-swatch[aria-checked="true"] {
      border-color: var(--ms-blue);
      box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--ms-blue);
    }
    .ms-swatch:focus-visible,
    .ms-color-input:focus-visible {
      outline: 2px solid var(--ms-orange);
      outline-offset: 2px;
    }
    .ms-color-input {
      display: block;
      width: 100%;
      min-height: 36px;
      margin-top: calc(0.4 * var(--ms-u));
      padding: 2px;
      border: 2px solid #64748b;
      border-radius: 8px;
      background: #fff;
      cursor: pointer;
    }
    .ms-theme-label {
      font-size: calc(0.8125 * var(--ms-u));
      font-weight: 700;
      line-height: 1.2;
    }
    .ms-theme-sub {
      font-size: calc(0.8125 * var(--ms-u));
      color: #64748b;
    }

    /* \u2500\u2500 Option rows + switches \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .ms-a11y-option-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: calc(1.15 * var(--ms-u));
    }
    .ms-a11y-option-row {
      display: flex;
      align-items: center;
      gap: calc(0.75 * var(--ms-u));
    }
    .ms-a11y-option-text { flex: 1; min-width: 0; }
    .ms-a11y-option-text strong {
      font-size: calc(0.85 * var(--ms-u));
      color: #1e293b;
      display: block;
    }
    .ms-a11y-option-hint {
      display: block;
      margin-top: calc(0.2 * var(--ms-u));
      font-size: calc(0.8125 * var(--ms-u));
      font-weight: 500;
      color: #64748b;
      line-height: 1.35;
    }
    .ms-a11y-option-text p {
      margin: calc(0.15 * var(--ms-u)) 0 0;
      font-size: calc(0.8125 * var(--ms-u));
      color: #64748b;
      line-height: 1.35;
    }

    .ms-switch {
      flex-shrink: 0;
      width: 44px;
      height: 26px;
      border-radius: 999px;
      border: none;
      background: #64748b;
      padding: 3px;
      cursor: pointer;
      position: relative;
      transition: background 0.18s ease;
    }
    /* UX-16: \xE1rea de toque de 44px de altura (trilho visual de 26px) */
    .ms-switch::after {
      content: "";
      position: absolute;
      inset: -9px 0;
    }
    .ms-switch-thumb {
      display: block;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
      transition: transform 0.18s ease;
    }
    .ms-switch--on,
    .ms-switch[aria-checked="true"] {
      background: var(--ms-blue);
    }
    .ms-switch--on .ms-switch-thumb,
    .ms-switch[aria-checked="true"] .ms-switch-thumb {
      transform: translateX(18px);
    }
    .ms-switch:focus-visible {
      outline: 2px solid var(--ms-orange);
      outline-offset: 2px;
    }

    /* \u2500\u2500 Grade de blocos (F6c): 3 colunas; radiogroups ocupam a linha inteira \u2500\u2500 */
    .ms-a11y-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(calc(5.4 * var(--ms-u)), 1fr));
      gap: calc(0.5 * var(--ms-u));
    }
    .ms-a11y-block--wide,
    .ms-a11y-block--span { grid-column: 1 / -1; min-width: 0; }
    /* F8b: sliders de tipografia */
    .ms-range { margin-bottom: calc(0.5 * var(--ms-u)); }
    .ms-range-label {
      font-size: calc(0.8125 * var(--ms-u));
      font-weight: 600;
      color: #1e293b;
    }
    .ms-range-input {
      width: 100%;
      min-height: 44px;
      margin: 0;
      accent-color: var(--ms-blue);
      cursor: pointer;
    }
    .ms-range-input:focus-visible {
      outline: 2px solid var(--ms-orange);
      outline-offset: 2px;
    }
    .ms-a11y-action--font { width: 100%; margin-top: calc(0.25 * var(--ms-u)); }
    .ms-a11y-control-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: calc(0.5 * var(--ms-u));
      margin-bottom: calc(0.5 * var(--ms-u));
    }
    .ms-a11y-control-state {
      font-size: calc(0.8125 * var(--ms-u));
      font-weight: 700;
      color: var(--ms-blue);
      text-align: end;
    }

    .ms-switch.ms-tile,
    .ms-btn-ouvir.ms-tile,
    .ms-tile[data-action="page-outline"] {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: calc(0.2 * var(--ms-u));
      width: auto;
      height: auto;
      min-height: 44px;
      padding: calc(0.6 * var(--ms-u)) calc(0.15 * var(--ms-u));
      border: 2px solid #64748b;
      border-radius: 10px;
      background: #fff;
      color: #1e293b;
      font: inherit;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.15s ease, background-color 0.15s ease;
    }
    .ms-switch.ms-tile::after { content: none; }
    .ms-tile-icon {
      display: inline-flex;
      font-size: calc(1.4 * var(--ms-u));
    }
    .ms-tile-label {
      font-size: calc(0.8125 * var(--ms-u));
      font-weight: 700;
      line-height: 1.25;
      overflow-wrap: break-word;
      hyphens: auto;
    }
    .ms-tile-state {
      font-size: calc(0.75 * var(--ms-u));
      font-weight: 600;
      color: #475569;
    }
    .ms-tile-check {
      display: none;
      position: absolute;
      top: calc(0.25 * var(--ms-u));
      right: calc(0.25 * var(--ms-u));
      font-size: calc(0.9 * var(--ms-u));
      color: var(--ms-blue);
    }
    /* Ligado: borda azul + fundo + \u2713 + texto "Ligado" (nunca s\xF3 cor) */
    .ms-switch.ms-tile[aria-checked="true"] {
      background: #e8f0fb;
      border-color: var(--ms-blue);
      box-shadow: 0 0 0 1px var(--ms-blue);
    }
    .ms-switch.ms-tile[aria-checked="true"] .ms-tile-state {
      color: var(--ms-blue);
    }
    .ms-switch.ms-tile[aria-checked="true"] .ms-tile-check { display: inline-flex; }
    .ms-switch.ms-tile:focus-visible,
    .ms-btn-ouvir.ms-tile:focus-visible {
      outline: 2px solid var(--ms-orange);
      outline-offset: 2px;
    }
    .ms-btn-ouvir.ms-tile {
      background: var(--ms-orange);
      border-color: var(--ms-orange);
      color: #1a1205;
    }
    .ms-btn-ouvir.ms-tile:hover { background: var(--ms-orange-dark); }

    .ms-btn-ouvir {
      flex-shrink: 0;
      border: none;
      border-radius: 8px;
      padding: calc(0.45 * var(--ms-u)) calc(0.9 * var(--ms-u));
      background: var(--ms-orange);
      color: #1a1205;
      font: inherit;
      font-size: calc(0.82 * var(--ms-u));
      font-weight: 700;
      cursor: pointer;
    }
    .ms-btn-ouvir:hover { background: var(--ms-orange-dark); }
    .ms-btn-ouvir:focus-visible {
      outline: 2px solid var(--ms-blue);
      outline-offset: 2px;
    }

    .ms-a11y-live {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
    }

    .ms-a11y-footer-note {
      margin: calc(0.35 * var(--ms-u)) 0 0;
      text-align: center;
      font-size: calc(0.8125 * var(--ms-u));
      color: #475569;
      line-height: 1.35;
    }

    @media (max-width: 480px) {
      #ms-a11y-panel {
        width: calc(100vw - calc(1 * var(--ms-u)));
        max-height: calc(100vh - 124px - calc(2.5 * var(--ms-u)));
        max-height: calc(100dvh - 124px - calc(2.5 * var(--ms-u)));
        right: calc(0.5 * var(--ms-u)) !important;
        left: calc(0.5 * var(--ms-u)) !important;
        transform-origin: bottom center;
      }
      .ms-fab-tip {
        max-width: min(180px, 62vw);
        white-space: normal;
        text-align: center;
        border-radius: 14px;
        font-size: calc(0.75 * var(--ms-u));
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .ms-fab-tip {
        animation: ms-fab-tip-out 0.01s linear 6s forwards !important;
      }
      #ms-a11y-panel,
      .ms-a11y-panel {
        animation: none !important;
      }
      #ms-fab,
      .ms-fab,
      .ms-switch-thumb,
      .ms-switch,
      .ms-fab-wrap,
      .ms-chrome-switch .ms-switch-thumb {
        transition: none !important;
      }
      #ms-fab:hover,
      #ms-fab:active {
        transform: none;
      }
    }
    /* \u2500\u2500 F7f: perfis prontos (bot\xF5es com aria-pressed) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .ms-a11y-profiles {
      margin-bottom: calc(1 * var(--ms-u));
    }
    .ms-profiles-title { margin: 0 0 calc(0.25 * var(--ms-u)); }
    .ms-profiles-hint {
      margin: 0 0 calc(0.6 * var(--ms-u));
      font-size: calc(0.8125 * var(--ms-u));
      color: #475569;
      line-height: 1.35;
    }
    .ms-profile-list {
      display: flex;
      flex-direction: column;
      gap: calc(0.5 * var(--ms-u));
    }
    .ms-profile {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0 calc(0.5 * var(--ms-u));
      width: 100%;
      min-height: 44px;
      padding: calc(0.55 * var(--ms-u)) calc(0.75 * var(--ms-u));
      border: 2px solid var(--ms-blue);
      border-radius: 10px;
      background: #fff;
      color: #1e293b;
      font: inherit;
      text-align: start;
      cursor: pointer;
    }
    .ms-profile:hover { background: #eef3fb; }
    .ms-profile:focus-visible { outline: 3px solid var(--ms-blue); outline-offset: 2px; }
    .ms-profile--on {
      background: var(--ms-blue);
      color: #fff;
    }
    .ms-profile--on:hover { background: var(--ms-blue); }
    .ms-profile-name {
      font-weight: 700;
      font-size: calc(0.9 * var(--ms-u));
    }
    .ms-profile-desc {
      flex: 1 1 100%;
      font-size: calc(0.8125 * var(--ms-u));
      line-height: 1.35;
      overflow-wrap: anywhere;
    }
    .ms-profile-custom {
      padding: 0 calc(0.45 * var(--ms-u));
      border: 1px solid currentColor;
      border-radius: 999px;
      font-size: calc(0.75 * var(--ms-u));
      font-weight: 700;
    }
    .ms-profile-custom[hidden] { display: none; }
    /* \u2500\u2500 F9c: Estrutura da p\xE1gina (di\xE1logo dentro do painel) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .ms-tile[data-action="page-outline"]:hover { background: #eef3fb; }
    .ms-tile[data-action="page-outline"]:focus-visible,
    .ms-outline-link:focus-visible { outline: 3px solid var(--ms-blue); outline-offset: 2px; }
    .ms-outline {
      position: absolute;
      inset: 0;
      z-index: 3;
      display: flex;
      flex-direction: column;
      background: #fff;
      color: #1e293b;
    }
    .ms-outline-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: calc(0.5 * var(--ms-u));
      padding: calc(0.75 * var(--ms-u));
      border-bottom: 2px solid #e2e8f0;
      flex-shrink: 0;
    }
    .ms-outline-title { margin: 0; font-size: calc(1.05 * var(--ms-u)); }
    .ms-outline-close { flex: 0 0 auto; }
    .ms-outline-body { flex: 1; overflow-y: auto; padding: calc(0.75 * var(--ms-u)); }
    .ms-outline-group { margin: 0 0 calc(0.4 * var(--ms-u)); font-size: calc(0.9 * var(--ms-u)); color: var(--ms-blue); }
    .ms-outline-list { list-style: none; margin: 0 0 calc(0.9 * var(--ms-u)); padding: 0; }
    .ms-outline-link {
      width: 100%;
      min-height: 44px;
      padding: calc(0.4 * var(--ms-u)) calc(0.6 * var(--ms-u));
      border: 0;
      border-radius: 8px;
      background: transparent;
      color: inherit;
      font: inherit;
      text-align: start;
      cursor: pointer;
    }
    .ms-outline-link:hover { background: #eef3fb; }
    .ms-outline-empty { margin: 0; font-size: calc(0.95 * var(--ms-u)); line-height: 1.4; }
    /* \u2500\u2500 F8c: cursor grande tamb\xE9m dentro do widget \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
       O host recebe data-ms-cursor (domMutator.applyOptions) e herda --ms-cur-arrow/--ms-cur-hand
       do <html> (definidas em page/85-cursor.css): as imagens n\xE3o s\xE3o duplicadas aqui. */
    :host([data-ms-cursor]) * {
      cursor: var(--ms-cur-arrow) !important;
    }
    :host([data-ms-cursor]) :is(button, a[href], summary, select, label, [role="button"], [role="switch"], [role="radio"], [role="tab"], input[type="range"], input[type="color"], input[type="checkbox"]),
    :host([data-ms-cursor]) :is(button, a[href], summary, select, label, [role="button"], [role="switch"], [role="radio"], [role="tab"]) * {
      cursor: var(--ms-cur-hand) !important;
    }
    /* F7d: bloqueio de intermit\xEAncia vale tamb\xE9m para a UI da lib (host recebe o atributo) */
    :host([data-ms-noflash]) *,
    :host([data-ms-noflash]) *::before,
    :host([data-ms-noflash]) *::after {
      animation-duration: 0.01ms !important;
      animation-delay: 0s !important;
      animation-iteration-count: 1 !important;
      transition: none !important;
    }
    /* a dica do bot\xE3o some depois de 6 s: mant\xE9m o atraso (sen\xE3o sumiria na hora) */
    :host([data-ms-noflash]) .ms-fab-tip {
      animation: ms-fab-tip-out 0.01s linear 6s forwards !important;
    }
  `;
  var PAGE_CSS = `
    /* \u2500\u2500 Hidden distractions (Modo Simples only) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    html.ms-ativo [data-ms-hidden="true"] {
      display: none !important;
      visibility: hidden !important;
    }

    html.ms-ativo [data-ms-principal] {
      display: block !important;
      max-width: 75ch !important;
      margin-inline: auto !important;
      padding-inline: 1.5rem !important;
      font-size: 1.125rem !important;
      line-height: 1.8 !important;
    }

    /* \u2500\u2500 Text scale (independent of ms-ativo) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    html.ms-text-scale-125 { font-size: 125%; --ms-scale: 1.25; }
    html.ms-text-scale-150 { font-size: 150%; --ms-scale: 1.5; }
    html.ms-text-scale-175 { font-size: 175%; --ms-scale: 1.75; }

    /* \u2500\u2500 Color themes \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    html.ms-theme-yellowBlack,
    html.ms-theme-yellowBlack body {
      background-color: #000000 !important;
      color: #ffe600 !important;
    }
    html.ms-theme-yellowBlack body *:not(#ms-container):not(#ms-container *):not(.site-header):not(.site-header *):not(#ms-session-bar):not(#ms-session-bar *):not(.ms-pills-nav):not(.ms-pills-nav *):not(#ms-simples-chrome):not(#ms-simples-chrome *) {
      background-color: transparent !important;
      color: #ffe600 !important;
      border-color: #ffe600 !important;
    }
    html.ms-theme-yellowBlack a,
    html.ms-theme-yellowBlack a:visited {
      color: #fff59d !important;
      text-decoration: underline !important;
    }
    html.ms-theme-yellowBlack .site-header,
    html.ms-theme-yellowBlack .ms-pills-nav {
      background-color: #000000 !important;
      color: #ffe600 !important;
      border-bottom-color: #ffe600 !important;
      box-shadow: 0 2px 8px rgb(0 0 0 / 55%) !important;
    }
    html.ms-theme-yellowBlack .site-header a,
    html.ms-theme-yellowBlack .ms-pills-nav a {
      color: #ffe600 !important;
    }
    /* W4c: pill inativa herdava fundo claro (#eef2f7) com texto amarelo (~1.13:1) */
    html.ms-theme-yellowBlack .ms-pills-nav .ms-pill:not([aria-current='page']) {
      background-color: #000000 !important;
      color: #ffe600 !important;
      border-color: #ffe600 !important;
    }
    html.ms-theme-yellowBlack .ms-pills-nav .ms-pill:not([aria-current='page']):hover,
    html.ms-theme-yellowBlack .ms-pills-nav .ms-pill:not([aria-current='page']):focus-visible {
      background-color: #332e00 !important;
    }
    html.ms-theme-yellowBlack .main-nav a[aria-current='page'],
    html.ms-theme-yellowBlack .ms-pill[aria-current='page'] {
      background-color: #ffe600 !important;
      color: #000000 !important;
      border-color: #ffe600 !important;
      text-decoration: none !important;
    }

    html.ms-theme-darkHigh,
    html.ms-theme-darkHigh body {
      background-color: #0f172a !important;
      color: #f8fafc !important;
    }
    html.ms-theme-darkHigh body *:not(#ms-container):not(#ms-container *):not(.site-header):not(.site-header *):not(#ms-session-bar):not(#ms-session-bar *):not(.ms-pills-nav):not(.ms-pills-nav *):not(#ms-simples-chrome):not(#ms-simples-chrome *) {
      background-color: transparent !important;
      color: #f8fafc !important;
      border-color: #94a3b8 !important;
    }
    html.ms-theme-darkHigh a,
    html.ms-theme-darkHigh a:visited {
      color: #93c5fd !important;
    }
    html.ms-theme-darkHigh .site-header,
    html.ms-theme-darkHigh .ms-pills-nav {
      background-color: #0f172a !important;
      color: #f8fafc !important;
      border-bottom-color: #334155 !important;
      box-shadow: 0 2px 10px rgb(0 0 0 / 45%) !important;
    }
    html.ms-theme-darkHigh .site-header a,
    html.ms-theme-darkHigh .ms-pills-nav a {
      color: #e2e8f0 !important;
    }
    /* W4c: pill inativa herdava fundo claro (#eef2f7) com texto claro (~1.1:1) */
    html.ms-theme-darkHigh .ms-pills-nav .ms-pill:not([aria-current='page']) {
      background-color: #1e293b !important;
      color: #e2e8f0 !important;
      border-color: #94a3b8 !important;
    }
    html.ms-theme-darkHigh .ms-pills-nav .ms-pill:not([aria-current='page']):hover {
      background-color: #334155 !important;
    }
    html.ms-theme-darkHigh .main-nav a[aria-current='page'],
    html.ms-theme-darkHigh .ms-pill[aria-current='page'] {
      background-color: #38bdf8 !important;
      color: #0f172a !important;
      border-color: #38bdf8 !important;
      text-decoration: none !important;
    }

    html.ms-theme-soft,
    html.ms-theme-soft body {
      background-color: #f5efe0 !important;
      color: #3d3226 !important;
    }
    html.ms-theme-soft body *:not(#ms-container):not(#ms-container *):not(.site-header):not(.site-header *):not(#ms-session-bar):not(#ms-session-bar *):not(.ms-pills-nav):not(.ms-pills-nav *):not(#ms-simples-chrome):not(#ms-simples-chrome *) {
      background-color: transparent !important;
      color: #3d3226 !important;
      border-color: #c4b59a !important;
    }
    html.ms-theme-soft a,
    html.ms-theme-soft a:visited {
      color: #5c4a32 !important;
    }
    html.ms-theme-soft .site-header,
    html.ms-theme-soft .ms-pills-nav {
      background-color: #f5efe0 !important;
      color: #3d3226 !important;
      border-bottom-color: #c4b59a !important;
      box-shadow: 0 2px 8px rgb(61 50 38 / 12%) !important;
    }
    html.ms-theme-soft .site-header a,
    html.ms-theme-soft .ms-pills-nav a {
      color: #3d3226 !important;
    }
    html.ms-theme-soft .main-nav a[aria-current='page'],
    html.ms-theme-soft .ms-pill[aria-current='page'] {
      background-color: #3d3226 !important;
      color: #f5efe0 !important;
      border-color: #3d3226 !important;
      text-decoration: none !important;
    }

    html.ms-theme-lightHigh,
    html.ms-theme-lightHigh body {
      background-color: #ffffff !important;
      color: #000000 !important;
    }
    html.ms-theme-lightHigh body *:not(#ms-container):not(#ms-container *):not(.site-header):not(.site-header *):not(#ms-session-bar):not(#ms-session-bar *):not(.ms-pills-nav):not(.ms-pills-nav *):not(#ms-simples-chrome):not(#ms-simples-chrome *) {
      background-color: transparent !important;
      color: #000000 !important;
      border-color: #000000 !important;
    }
    html.ms-theme-lightHigh a,
    html.ms-theme-lightHigh a:visited {
      color: #0000cc !important;
      text-decoration: underline !important;
    }
    html.ms-theme-lightHigh .site-header,
    html.ms-theme-lightHigh .ms-pills-nav {
      background-color: #ffffff !important;
      color: #000000 !important;
      border-bottom-color: #000000 !important;
      box-shadow: 0 2px 8px rgb(0 0 0 / 25%) !important;
    }
    html.ms-theme-lightHigh .site-header a,
    html.ms-theme-lightHigh .ms-pills-nav a {
      color: #000000 !important;
    }
    html.ms-theme-lightHigh .ms-pills-nav .ms-pill:not([aria-current='page']) {
      background-color: #ffffff !important;
      color: #000000 !important;
      border-color: #000000 !important;
    }
    html.ms-theme-lightHigh .ms-pills-nav .ms-pill:not([aria-current='page']):hover,
    html.ms-theme-lightHigh .ms-pills-nav .ms-pill:not([aria-current='page']):focus-visible {
      background-color: #e5e5e5 !important;
    }
    html.ms-theme-lightHigh .main-nav a[aria-current='page'],
    html.ms-theme-lightHigh .ms-pill[aria-current='page'] {
      background-color: #000000 !important;
      color: #ffffff !important;
      border-color: #000000 !important;
      text-decoration: none !important;
    }

    /* Session bar: opaque amber over page content under any theme */
    html.ms-theme-yellowBlack #ms-session-bar,
    html.ms-theme-darkHigh #ms-session-bar,
    html.ms-theme-lightHigh #ms-session-bar,
    html.ms-theme-soft #ms-session-bar {
      position: relative;
      z-index: 40;
      background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%) !important;
      color: #1a1205 !important;
      border-bottom-color: #d97706 !important;
    }

    /* ms-theme-senac is a noop (default site look) */

    /* F8a: satura\xE7\xE3o e monocrom\xE1tico via filter no <html> (elemento raiz: n\xE3o cria bloco
       contenedor, ent\xE3o o widget position:fixed continua ancorado \xE0 viewport). Nunca em body/filhos. */
    html.ms-sat-low { filter: saturate(0.5); }
    html.ms-sat-high { filter: saturate(1.8); }
    html.ms-theme-mono { filter: grayscale(1); }

    /* F8a: cor personalizada (texto/t\xEDtulos/fundo); vence os temas por vir depois, mesma especificidade */
    html.ms-custom-bg,
    html.ms-custom-bg body {
      background-color: var(--ms-custom-bg) !important;
    }
    html.ms-custom-bg body *:not(#ms-container):not(#ms-container *):not(.site-header):not(.site-header *):not(#ms-session-bar):not(#ms-session-bar *):not(.ms-pills-nav):not(.ms-pills-nav *):not(#ms-simples-chrome):not(#ms-simples-chrome *) {
      background-color: transparent !important;
    }
    html.ms-custom-text,
    html.ms-custom-text body {
      color: var(--ms-custom-text) !important;
    }
    html.ms-custom-text body *:not(#ms-container):not(#ms-container *):not(.site-header):not(.site-header *):not(#ms-session-bar):not(#ms-session-bar *):not(.ms-pills-nav):not(.ms-pills-nav *):not(#ms-simples-chrome):not(#ms-simples-chrome *) {
      color: var(--ms-custom-text) !important;
    }
    html.ms-custom-heading body :is(h1, h2, h3, h4, h5, h6):not(#ms-container):not(#ms-container *):not(.site-header):not(.site-header *):not(#ms-session-bar):not(#ms-session-bar *):not(.ms-pills-nav):not(.ms-pills-nav *):not(#ms-simples-chrome):not(#ms-simples-chrome *),
    html.ms-custom-heading body :is(h1, h2, h3, h4, h5, h6):not(#ms-container):not(#ms-container *):not(.site-header):not(.site-header *):not(#ms-session-bar):not(#ms-session-bar *):not(.ms-pills-nav):not(.ms-pills-nav *):not(#ms-simples-chrome):not(#ms-simples-chrome *) * {
      color: var(--ms-custom-heading) !important;
    }
    /* F8a QA M2: links n\xE3o viram "texto comum" sob cor personalizada \u2014 cor pr\xF3pria (\u2265 4,5:1 sobre o
       fundo efetivo, calculada em domMutator) + sublinhado; vem por \xFAltimo para vencer texto e t\xEDtulos */
    html.ms-custom-link body a:not(#ms-container):not(#ms-container *):not(.site-header):not(.site-header *):not(#ms-session-bar):not(#ms-session-bar *):not(.ms-pills-nav):not(.ms-pills-nav *):not(#ms-simples-chrome):not(#ms-simples-chrome *),
    html.ms-custom-link body a:visited:not(#ms-container):not(#ms-container *):not(.site-header):not(.site-header *):not(#ms-session-bar):not(#ms-session-bar *):not(.ms-pills-nav):not(.ms-pills-nav *):not(#ms-simples-chrome):not(#ms-simples-chrome *) {
      color: var(--ms-custom-link) !important;
      text-decoration: underline !important;
    }

    /* \u2500\u2500 Reduced motion \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    html.ms-reduced-motion *,
    html.ms-reduced-motion *::before,
    html.ms-reduced-motion *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }


    /* \u2500\u2500 Bloqueio de intermit\xEAncia (F7d): corta anima\xE7\xE3o e transi\xE7\xE3o do site \u2500\u2500 */
    html.ms-block-flashing *,
    html.ms-block-flashing *::before,
    html.ms-block-flashing *::after {
      animation-duration: 0.01ms !important;
      animation-delay: 0s !important;
      animation-iteration-count: 1 !important;
      transition: none !important;
      scroll-behavior: auto !important;
    }
    /* \u2500\u2500 Highlight links \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    html.ms-highlight-links a:not([data-ms-hidden]) {
      text-decoration: underline !important;
      text-decoration-thickness: 2px !important;
      text-underline-offset: 3px !important;
      outline: 1px dashed currentColor !important;
      outline-offset: 2px !important;
    }

    /* \u2500\u2500 Ferramentas de p\xE1gina (F9a) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    html.ms-highlight-headings :is(h1, h2, h3, h4, h5, h6, [role="heading"]):not(#ms-container *, #ms-simples-chrome *, #ms-session-bar *, #ms-shortcuts-card *, [data-ms-hidden]) {
      outline: 3px solid #6a1b9a !important;
      outline-offset: 2px !important;
      background-color: #f3e5f5 !important;
      color: #000 !important;
    }
    html.ms-highlight-controls :is(button, [role="button"], input, select, textarea, summary):not(#ms-container *, #ms-simples-chrome *, #ms-session-bar *, #ms-shortcuts-card *, [data-ms-hidden]) {
      outline: 3px solid #0b57d0 !important;
      outline-offset: 2px !important;
    }
    html.ms-enlarge-targets :is(a, button, [role="button"], input:not([type="hidden"], [type="checkbox"], [type="radio"]), select, textarea, summary):not(#ms-container *, #ms-simples-chrome *, #ms-session-bar *, #ms-shortcuts-card *, [data-ms-hidden]) {
      min-width: 44px !important;
      min-height: 44px !important;
      box-sizing: border-box !important;
    }
    html.ms-enlarge-targets a:not(#ms-container *, #ms-simples-chrome *, #ms-session-bar *, #ms-shortcuts-card *, [data-ms-hidden]):not(:has(img)) {
      display: inline-block !important;
    }
    /* \u2500\u2500 Foco bem vis\xEDvel (F7e): anel duplo (preto + amarelo), leg\xEDvel em qualquer fundo \u2500\u2500 */
    html.ms-strong-focus :focus-visible:not(#ms-container, #ms-simples-chrome *, #ms-session-bar *, #ms-shortcuts-card *) {
      outline: 3px solid #000 !important;
      outline-offset: 2px !important;
      box-shadow: 0 0 0 6px #ffd400 !important;
    }
    /* \u2500\u2500 Lexend / dyslexia font \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    html.ms-dyslexia-font,
    html.ms-dyslexia-font body,
    html.ms-dyslexia-font body *:not(#ms-container):not(#ms-container *):not([class~="icon"]):not([class^="icon-"]):not([class*=" icon-"]):not([class^="icon_"]):not([class*=" icon_"]):not([class^="glyphicon"]):not([class*=" glyphicon"]):not([class$="-icon"]):not([class*="-icon "]):not([class$="_icon"]):not([class*="_icon "]):not([class*="fa-"]):not(.fa):not(.fas):not(.far):not(.fab):not(.material-icons):not(code):not(pre):not(kbd):not(samp) {
      font-family: 'Lexend', system-ui, -apple-system, 'Segoe UI', sans-serif !important;
      letter-spacing: 0.02em !important;
      word-spacing: 0.08em !important;
    }

    /* \u2500\u2500 Text spacing (WCAG 1.4.12) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    html.ms-text-spacing body,
    html.ms-text-spacing p,
    html.ms-text-spacing li,
    html.ms-text-spacing h1,
    html.ms-text-spacing h2,
    html.ms-text-spacing h3,
    html.ms-text-spacing h4,
    html.ms-text-spacing h5,
    html.ms-text-spacing h6,
    html.ms-text-spacing td,
    html.ms-text-spacing th,
    html.ms-text-spacing dd,
    html.ms-text-spacing dt,
    html.ms-text-spacing blockquote,
    html.ms-text-spacing label {
      line-height: 2 !important;
      letter-spacing: 0.12em !important;
      word-spacing: 0.16em !important;
    }
    html.ms-text-spacing p { margin-bottom: 1.5em !important; }

    /* F8b \u2014 sliders: v\xEAm depois do preset (mesma especificidade) e vencem s\xF3 a propriedade movida */
    html.ms-lh :is(body, p, li, h1, h2, h3, h4, h5, h6, td, th, dd, dt, blockquote, label) {
      line-height: var(--ms-lh) !important;
    }
    html.ms-ws :is(body, p, li, h1, h2, h3, h4, h5, h6, td, th, dd, dt, blockquote, label) {
      word-spacing: var(--ms-ws) !important;
    }
    html.ms-ls :is(body, p, li, h1, h2, h3, h4, h5, h6, td, th, dd, dt, blockquote, label) {
      letter-spacing: var(--ms-ls) !important;
    }

    /* \u2500\u2500 Hide images (content + logo; keep only [data-ms-keep-img]) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    html.ms-hide-images img:not([data-ms-keep-img]),
    html.ms-hide-images picture:not([data-ms-keep-img]),
    html.ms-hide-images video,
    html.ms-hide-images [data-ms-deco-img] {
      display: none !important;
    }

    /* \u2500\u2500 Reading ruler marker (overlay is created in JS) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    html.ms-reading-ruler { cursor: crosshair; }

    html.ms-manual-select-active { cursor: pointer !important; }

    /* \u2500\u2500 F8c: cursor grande branco/preto (setas SVG 48px com contorno contrastante) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
       Seta: ponta em (6,3). M\xE3o (links/bot\xF5es): ponta do dedo em (19,4). Fallback: auto / pointer.
       As imagens vivem s\xF3 aqui, em vari\xE1veis do <html> (--ms-cur-arrow/--ms-cur-hand): o widget (shadow
       DOM, ui/80-cursor.css) as herda \u2014 vari\xE1veis atravessam o shadow \u2014 sem duplicar os data-URIs.
       Preced\xEAncia: o cursor grande vence o crosshair da r\xE9gua (80-ruler.css) e o pointer do modo de
       sele\xE7\xE3o manual vira a m\xE3o grande. Campos de texto mant\xEAm o cursor "text" nativo.
       Telas de toque n\xE3o t\xEAm cursor: a classe n\xE3o faz nada, sem erro. */
    html.ms-cursor-white {
      --ms-cur-arrow: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath d='M6 3v36l9-8 6 14 7-3-6-13h12z' fill='%23fff' stroke='%23000' stroke-width='2.5' stroke-linejoin='round'/%3E%3C/svg%3E") 6 3, auto;
      --ms-cur-hand: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath d='M16 6a3.5 3.5 0 0 1 7 0v15.5l2-.4a3 3 0 0 1 3.5 2.3 3 3 0 0 1 3.2-.2 3 3 0 0 1 3.1 2 3 3 0 0 1 3.2 3.1V35c0 6-4 10-10 10h-4c-4 0-6-2-8-5l-7-10a3 3 0 0 1 4.6-3.8L16 30z' fill='%23fff' stroke='%23000' stroke-width='2.5' stroke-linejoin='round'/%3E%3C/svg%3E") 19 4, pointer;
    }
    html.ms-cursor-black {
      --ms-cur-arrow: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath d='M6 3v36l9-8 6 14 7-3-6-13h12z' fill='%23000' stroke='%23fff' stroke-width='2.5' stroke-linejoin='round'/%3E%3C/svg%3E") 6 3, auto;
      --ms-cur-hand: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath d='M16 6a3.5 3.5 0 0 1 7 0v15.5l2-.4a3 3 0 0 1 3.5 2.3 3 3 0 0 1 3.2-.2 3 3 0 0 1 3.1 2 3 3 0 0 1 3.2 3.1V35c0 6-4 10-10 10h-4c-4 0-6-2-8-5l-7-10a3 3 0 0 1 4.6-3.8L16 30z' fill='%23000' stroke='%23fff' stroke-width='2.5' stroke-linejoin='round'/%3E%3C/svg%3E") 19 4, pointer;
    }
    html:is(.ms-cursor-white, .ms-cursor-black),
    html:is(.ms-cursor-white, .ms-cursor-black) * {
      cursor: var(--ms-cur-arrow) !important;
    }
    html:is(.ms-cursor-white, .ms-cursor-black) :is(a[href], button, summary, select, label, [role="button"], [role="link"], [role="tab"], [role="menuitem"], input:is([type="button"], [type="submit"], [type="reset"], [type="checkbox"], [type="radio"], [type="image"])),
    html:is(.ms-cursor-white, .ms-cursor-black) :is(a[href], button, summary, select, label, [role="button"], [role="link"], [role="tab"], [role="menuitem"]) *,
    html:is(.ms-cursor-white, .ms-cursor-black).ms-manual-select-active,
    html:is(.ms-cursor-white, .ms-cursor-black).ms-manual-select-active * {
      cursor: var(--ms-cur-hand) !important;
    }
    html:is(.ms-cursor-white, .ms-cursor-black) :is(textarea, [contenteditable]:not([contenteditable="false"]), input:not([type="button"], [type="submit"], [type="reset"], [type="checkbox"], [type="radio"], [type="image"], [type="range"], [type="color"], [type="file"])),
    /* filhos de bloco edit\xE1vel (editores ricos p\xF5em p/span dentro), menos sub\xE1rvores contenteditable="false" */
    html:is(.ms-cursor-white, .ms-cursor-black) [contenteditable]:not([contenteditable="false"]) *:not([contenteditable="false"]):not([contenteditable="false"] *) {
      cursor: text !important;
    }
    /* \u2500\u2500 Session chrome (SIMPLES header) + barra sob o nav \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    /* UX-14: 1 unidade = 16px fixos, sem depender do html { font-size } do host */
    #ms-simples-chrome,
    #ms-session-bar,
    .ms-pills-nav {
      --ms-u: calc(16px * var(--ms-scale, 1));
    }
    #ms-simples-chrome {
      display: flex;
      align-items: center;
      margin-left: auto;
      z-index: 50;
      /* encolhe em vez de transbordar a linha do header (texto ampliado no mobile) */
      flex-shrink: 1;
      min-width: 0;
      max-width: 100%;
    }
    #ms-simples-chrome.ms-simples-chrome--fixed {
      position: fixed;
      top: calc(0.75 * var(--ms-u));
      right: calc(5.5 * var(--ms-u));
      z-index: 2147483646;
    }
    /* Same SIMPLES control, parked in MS pills nav while site header is hidden */
    #ms-simples-chrome.ms-simples-chrome--ms-nav {
      box-sizing: border-box;
      width: 100%;
      margin: 0;
      padding: calc(0.45 * var(--ms-u)) calc(1 * var(--ms-u)) 0;
      justify-content: flex-end;
      position: static;
    }
    #ms-simples-chrome.ms-simples-chrome--ms-nav .ms-chrome-icon {
      display: none;
    }
    .ms-simples-chrome-inner {
      display: flex;
      align-items: center;
      gap: calc(0.55 * var(--ms-u));
    }
    .ms-chrome-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      border: 1px solid #c5d0e3;
      background: #fff;
      color: #0b2c5f;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      transition: border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
    }
    .ms-chrome-icon:hover {
      border-color: #f39200;
      color: #e08400;
      box-shadow: 0 0 0 3px rgba(243, 146, 0, 0.18);
    }
    .ms-simples-toggle-wrap {
      display: flex;
      min-width: 0;
      align-items: center;
      gap: calc(0.55 * var(--ms-u));
      padding: calc(0.4 * var(--ms-u)) calc(0.7 * var(--ms-u)) calc(0.4 * var(--ms-u)) calc(0.75 * var(--ms-u));
      border-radius: 999px;
      border: 2px solid #d8e1ef;
      background: #fff;
      box-shadow: 0 1px 2px rgb(0 0 0 / 4%);
      transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
    }
    .ms-simples-toggle-wrap[data-active="true"] {
      border-color: #f39200;
      background: #fff8e7;
      box-shadow: 0 0 0 2px rgba(243, 146, 0, 0.22);
    }
    .ms-simples-spark { color: #f39200; font-size: calc(1 * var(--ms-u)); }
    .ms-simples-toggle-text {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }
    .ms-simples-toggle-text strong {
      font-size: calc(0.8 * var(--ms-u));
      letter-spacing: 0.05em;
      color: #0b2c5f;
    }
    .ms-simples-sub {
      font-size: calc(0.75 * var(--ms-u));
      color: #475569;
      font-weight: 600;
    }
    .ms-chrome-switch {
      width: 44px;
      height: 26px;
      border-radius: 999px;
      border: none;
      background: #64748b;
      padding: 3px;
      cursor: pointer;
      position: relative;
    }
    .ms-chrome-switch::after {
      content: "";
      position: absolute;
      inset: -9px 0;
    }
    .ms-chrome-switch .ms-switch-thumb {
      display: block;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 1px 3px rgb(0 0 0 / 20%);
      transition: transform 0.18s ease;
    }
    .ms-chrome-switch.ms-switch--on,
    .ms-chrome-switch[aria-checked="true"] {
      background: #8a5500;
    }
    .ms-chrome-switch.ms-switch--on .ms-switch-thumb,
    .ms-chrome-switch[aria-checked="true"] .ms-switch-thumb {
      transform: translateX(18px);
    }

    #ms-session-bar {
      background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%);
      color: #1a1205;
      width: 100%;
      border-bottom: 2px solid #d97706;
      box-shadow: 0 2px 10px rgb(217 119 6 / 22%);
    }
    .ms-session-bar-inner {
      width: min(calc(72 * var(--ms-u)), calc(100% - calc(2 * var(--ms-u))));
      margin: 0 auto;
      padding: calc(0.9 * var(--ms-u)) 0;
    }
    .ms-session-off {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: calc(0.5 * var(--ms-u)) calc(1 * var(--ms-u));
    }
    .ms-session-off[hidden],
    .ms-session-on[hidden] {
      display: none !important;
    }
    .ms-session-off p {
      margin: 0;
      font-weight: 600;
      max-width: calc(52 * var(--ms-u));
      font-size: calc(0.95 * var(--ms-u));
    }
    .ms-chrome-icon:focus-visible,
    .ms-chrome-switch:focus-visible,
    .ms-session-btn:focus-visible {
      outline: 3px solid #0b2c5f;
      outline-offset: 2px;
    }
    .ms-session-on-top { margin-bottom: calc(0.7 * var(--ms-u)); }
    .ms-sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
    }
    .ms-session-on-title {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: calc(0.5 * var(--ms-u));
      font-size: calc(1.05 * var(--ms-u));
    }
    .ms-session-badge {
      background: #1a1205;
      color: #fff;
      border-radius: 999px;
      padding: calc(0.22 * var(--ms-u)) calc(0.7 * var(--ms-u));
      font-size: calc(0.75 * var(--ms-u));
      font-weight: 700;
    }
    .ms-session-desc {
      margin: calc(0.35 * var(--ms-u)) 0 0;
      font-size: calc(0.9 * var(--ms-u));
      font-weight: 500;
    }
    .ms-session-actions {
      display: flex;
      flex-wrap: wrap;
      gap: calc(0.5 * var(--ms-u));
    }
    .ms-session-btn {
      border: none;
      border-radius: 12px;
      padding: calc(0.55 * var(--ms-u)) calc(0.95 * var(--ms-u));
      min-height: 44px;
      font-weight: 700;
      cursor: pointer;
      font-size: calc(0.85 * var(--ms-u));
      display: inline-flex;
      align-items: center;
      gap: calc(0.35 * var(--ms-u));
      transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    }
    .ms-session-btn--light {
      background: #fff;
      color: #1a1205;
      box-shadow: 0 1px 2px rgb(0 0 0 / 8%);
    }
    .ms-session-btn--dark {
      background: #1a1205;
      color: #fff;
    }
    .ms-session-btn[aria-disabled='true'] {
      opacity: 0.7;
      cursor: not-allowed;
    }
    .ms-session-btn--active {
      box-shadow: 0 0 0 2px #fff, 0 0 0 4px #1a1205;
    }
    .ms-session-btn--speaking {
      background: #dc2626;
      color: #fff;
    }

    /* UX-07: barra compacta no mobile (t\xEDtulo numa linha, bot\xF5es \xEDcone + r\xF3tulo curto em grade) */
    @media (max-width: 480px) {
      .ms-session-bar-inner { padding: calc(0.5 * var(--ms-u)) 0; }
      .ms-session-on-top { margin-bottom: calc(0.4 * var(--ms-u)); }
      .ms-session-on-title { font-size: calc(0.95 * var(--ms-u)); gap: calc(0.4 * var(--ms-u)); flex-wrap: nowrap; }
      .ms-session-on-title > span { flex: none; }
      .ms-session-on-title strong { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .ms-session-badge { font-size: calc(0.75 * var(--ms-u)); padding: calc(0.15 * var(--ms-u)) calc(0.5 * var(--ms-u)); white-space: nowrap; }
      .ms-session-desc,
      .ms-btn-pre,
      .ms-btn-post {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
      }
      .ms-session-actions {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: calc(0.4 * var(--ms-u));
      }
      .ms-session-actions .ms-session-btn {
        min-width: 0;
        overflow-wrap: anywhere;
        flex-direction: column;
        justify-content: center;
        gap: calc(0.15 * var(--ms-u));
        padding: calc(0.3 * var(--ms-u)) calc(0.2 * var(--ms-u));
        font-size: calc(0.75 * var(--ms-u));
        line-height: 1.15;
        text-align: center;
      }
      .ms-session-actions .ms-session-btn svg {
        width: 1.35em;
        height: 1.35em;
      }
      /* W4b: a 175% o r\xF3tulo quebrava letra a letra (barra 235px); 2 colunas, sem \xEDcone, palavra inteira por linha */
      html.ms-text-scale-175 .ms-session-actions {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: calc(0.2 * var(--ms-u));
      }
      html.ms-text-scale-175 .ms-session-bar-inner { padding: calc(0.25 * var(--ms-u)) 0; }
      html.ms-text-scale-175 .ms-session-on-top { margin-bottom: calc(0.2 * var(--ms-u)); }
      html.ms-text-scale-175 #ms-simples-chrome.ms-simples-chrome--ms-nav { padding-top: calc(0.2 * var(--ms-u)); }
      html.ms-text-scale-175 .ms-simples-toggle-wrap { padding-block: calc(0.2 * var(--ms-u)); }
      html.ms-text-scale-175 .ms-session-actions .ms-session-btn {
        overflow-wrap: normal;
      }
      html.ms-text-scale-175 .ms-session-actions .ms-session-btn svg {
        display: none;
      }
    }

    html.ms-simple-language [data-ms-principal],
    html.ms-simple-language main {
      font-size: 1.15em !important;
      line-height: 1.75 !important;
      max-width: 65ch !important;
    }

    /* Pares de linguagem (prot\xF3tipo / sites que marcam o markup) */
    [data-ms-simple] {
      display: none !important;
    }
    html.ms-simple-language [data-ms-plain] {
      display: none !important;
    }
    html.ms-simple-language [data-ms-simple] {
      display: revert !important;
    }

    /* Conven\xE7\xF5es do prot\xF3tipo Senac (F5-T05) */
    .ms-simple-only {
      display: none !important;
    }
    html.ms-ativo .ms-simple-only {
      display: block !important;
    }
    html.ms-ativo .ms-simple-only.ms-hub,
    html.ms-ativo .ms-simple-only.ms-pills-nav {
      display: block !important;
    }
    html.ms-ativo .ms-simple-hide {
      display: none !important;
    }

    /* Highlight do bloco sendo lido pelo TTS */
    [data-ms-tts-active] {
      background: #fef3c7 !important;
      outline: 3px solid #f59e0b !important;
      outline-offset: 4px;
      border-radius: 6px;
      box-decoration-break: clone;
      -webkit-box-decoration-break: clone;
    }

    /* UX-06: pills quebram linha (sem rolagem horizontal); no mobile viram grade de 2 colunas */
    .ms-pills-nav .ms-pills-nav__inner {
      flex-wrap: wrap;
      overflow-x: visible;
    }
    .ms-pills-nav .ms-pill {
      flex: 0 1 auto;
      min-height: 44px;
      box-sizing: border-box;
    }
    @media (max-width: 340px) {
      .ms-session-on-title { font-size: calc(0.85 * var(--ms-u)); }
      .ms-session-badge { padding: calc(0.15 * var(--ms-u)) calc(0.35 * var(--ms-u)); }
    }
    @media (max-width: 720px) {
      .ms-pills-nav .ms-pills-nav__inner {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: calc(0.5 * var(--ms-u));
      }
      .ms-pills-nav .ms-pill {
        justify-content: center;
        text-align: center;
        white-space: normal;
        overflow-wrap: anywhere;
        min-width: 0;
        padding-inline: calc(0.25 * var(--ms-u));
      }
    }
    @media (min-width: 360px) and (max-width: 720px) {
      .ms-pills-nav .ms-pills-nav__inner {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    /* Pills injet\xE1veis (F5-T11 \u2014 simpleNav) */
    .ms-pills-nav[data-ms-injected] {
      background: #fff;
      border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 1px 0 rgb(0 0 0 / 4%);
    }
    .ms-pills-nav[data-ms-injected] .ms-pills-nav__inner {
      display: flex;
      gap: calc(0.5 * var(--ms-u));
      padding: calc(0.65 * var(--ms-u)) calc(1 * var(--ms-u));
    }
    .ms-pills-nav[data-ms-injected] .ms-pill {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      gap: calc(0.35 * var(--ms-u));
      padding: calc(0.55 * var(--ms-u)) calc(0.95 * var(--ms-u));
      border-radius: 10px;
      background: #eef2f7;
      color: #0b2c5f;
      font-weight: 700;
      font-size: calc(0.82 * var(--ms-u));
      font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
      text-decoration: none;
      border: 2px solid transparent;
      white-space: nowrap;
      transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
    }
    .ms-pills-nav[data-ms-injected] .ms-pill:hover {
      background: #e2e8f0;
      text-decoration: none;
      box-shadow: 0 2px 6px rgb(11 44 95 / 10%);
    }
    .ms-pills-nav[data-ms-injected] .ms-pill[aria-current='page'] {
      background: #0b2c5f;
      color: #fff;
      border-color: #f39200;
      box-shadow: 0 0 0 2px rgb(243 146 0 / 35%);
      font-weight: 800;
    }
    .ms-pills-nav[data-ms-injected] .ms-pill__short {
      display: none;
    }
    @media (max-width: 720px) {
      .ms-pills-nav[data-ms-injected] .ms-pill__full {
        display: none;
      }
      .ms-pills-nav[data-ms-injected] .ms-pill__short {
        display: inline;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .ms-chrome-icon,
      .ms-simples-toggle-wrap,
      .ms-chrome-switch .ms-switch-thumb,
      .ms-session-btn,
      .ms-pills-nav[data-ms-injected] .ms-pill {
        transition: none !important;
      }
    }
  `;

  // src/ui/styles.js
  function getUIStyles(position = "bottom-right") {
    const isBottom = position.startsWith("bottom");
    const isRight = position.endsWith("right");
    const fabCorner = [
      isBottom ? "bottom: calc(1.5 * var(--ms-u));" : "top: calc(1.5 * var(--ms-u));",
      isRight ? "right: calc(1.5 * var(--ms-u));" : "left: calc(1.5 * var(--ms-u));"
    ].join("");
    const panelCorner = [
      isBottom ? "bottom: calc(calc(1.5 * var(--ms-u)) + 100px);" : "top: calc(calc(1.5 * var(--ms-u)) + 100px);",
      isRight ? "right: calc(1.5 * var(--ms-u));" : "left: calc(1.5 * var(--ms-u));"
    ].join("");
    const panelOrigin = `${isBottom ? "bottom" : "top"} ${isRight ? "right" : "left"}`;
    return UI_CSS.replace("{{fabCorner}}", () => fabCorner).replace("{{panelCorner}}", () => panelCorner).replace("{{panelOrigin}}", () => panelOrigin);
  }
  function getPageStyles() {
    return PAGE_CSS;
  }

  // src/ui/strings.js
  var STRINGS = Object.freeze({
    // fab.js
    fabTip: "Acessibilidade & Modo Simples",
    fabOpenLabel: "Abrir painel de acessibilidade",
    fabCloseLabel: "Fechar painel de acessibilidade",
    fabHideLabel: "Esconder bot\xE3o de acessibilidade nesta p\xE1gina",
    announceWidgetHidden: "Bot\xE3o de acessibilidade escondido. Alt+Shift+A mostra de novo.",
    announceResetAll: "Tudo desligado. P\xE1gina sem ajustes.",
    announceSideLeft: "Painel movido para a esquerda",
    announceSideRight: "Painel movido para a direita",
    panelResetLabel: "Desligar tudo",
    panelMoveToLeft: "Mover para a esquerda",
    panelMoveToRight: "Mover para a direita",
    // a11yPanel.js
    panelCloseLabel: "Fechar painel de acessibilidade",
    panelSimpleTitle: "Modo Simples (Recomendado)",
    panelSimpleDesc: "Oculta distra\xE7\xF5es visuais, aumenta bot\xF5es e resume conte\xFAdos essenciais.",
    panelSimpleSwitchLabel: "Modo Simples",
    panelTextSizeTitle: "Tamanho do texto",
    panelTextSizeItemLabel: "Tamanho do texto",
    panelThemeTitle: "Contraste e cores",
    panelThemeItemLabel: "Tema",
    panelDyslexiaTitle: "Fonte Acess\xEDvel (Lexend)",
    panelDyslexiaDesc: "Desenvolvida para dislexia e agilidade visual",
    panelDyslexiaLabel: "Fonte Acess\xEDvel Lexend",
    panelRulerTitle: "R\xE9gua de Foco de Leitura",
    panelRulerDesc: "Destaque linha a linha para guiar a aten\xE7\xE3o",
    panelVoiceTitle: "Leitor de Tela por Voz",
    panelVoiceDesc: "L\xEA os t\xEDtulos e textos em portugu\xEAs",
    panelVoiceLabel: "Ouvir conte\xFAdo principal",
    panelVoiceButton: "Ouvir",
    panelVoiceStopButton: "Parar",
    panelVoiceStopLabel: "Parar leitura",
    mediaOtherSiteNotice: "Este v\xEDdeo \xE9 de outro site. N\xE3o consigo tirar o som dele.",
    panelStrongFocusTitle: "Foco bem vis\xEDvel",
    panelStrongFocusDesc: "Contorno grosso e de duas cores no item em que voc\xEA est\xE1, em qualquer fundo",
    panelShortcutsTitle: "Mostrar atalhos do teclado",
    panelShortcutsDesc: "Um cart\xE3o na tela lista as teclas que voc\xEA pode usar",
    shortcutsTitle: "Atalhos do teclado",
    shortcutsClose: "Fechar",
    shortcutAccessKeyPrefix: "Alt+",
    panelBlockFlashingTitle: "Bloquear anima\xE7\xF5es e GIFs",
    panelBlockFlashingDesc: "Para anima\xE7\xF5es, textos que correm e v\xEDdeos que come\xE7am sozinhos. GIFs ficam parados at\xE9 voc\xEA clicar",
    gifShowLabel: "Mostrar anima\xE7\xE3o",
    panelMuteMediaTitle: "Pausar e mutar tudo",
    panelMuteMediaDesc: "Pausa e silencia v\xEDdeos e sons da p\xE1gina, inclusive os que come\xE7am sozinhos",
    panelReadFocusTitle: "Ler o que eu seleciono",
    panelReadFocusDesc: "A voz l\xEA o bot\xE3o, link, campo ou texto em que voc\xEA clicar ou parar com a tecla Tab. Se voc\xEA usa leitor de tela, pode ouvir duas vezes",
    panelReadFocusUnsupported: "Este navegador n\xE3o tem voz para ler em voz alta",
    panelReadFocusUnsupportedState: "Sem voz",
    stateOn: "Ligado",
    stateOff: "Desligado",
    sectionTextTitle: "Texto e leitura",
    sectionColorsTitle: "Cores e destaque",
    sectionKeyboardTitle: "Teclado e foco",
    sectionMotionTitle: "Movimento e imagens",
    panelHighlightLinks: "Destacar links",
    sectionPageToolsTitle: "Ferramentas de p\xE1gina",
    panelHighlightHeadings: "Destacar cabe\xE7alhos",
    panelHighlightControls: "Destacar bot\xF5es e campos",
    panelEnlargeTargets: "Ampliar bot\xF5es",
    panelTextMagnifier: "Lupa de texto",
    panelPageOutline: "Estrutura da p\xE1gina",
    outlineTitle: "Estrutura da p\xE1gina",
    outlineClose: "Fechar",
    outlineLandmarks: "\xC1reas da p\xE1gina",
    outlineHeadings: "T\xEDtulos",
    outlineEmpty: "Esta p\xE1gina n\xE3o tem t\xEDtulos nem \xE1reas para listar.",
    outlineNoText: "(sem texto)",
    outlineLevel: "n\xEDvel",
    outlineLmMain: "Conte\xFAdo principal",
    outlineLmNav: "Navega\xE7\xE3o",
    outlineLmBanner: "Cabe\xE7alho do site",
    outlineLmFooter: "Rodap\xE9 do site",
    outlineLmAside: "Conte\xFAdo lateral",
    outlineLmForm: "Formul\xE1rio",
    outlineLmSearch: "Busca",
    outlineLmRegion: "Regi\xE3o",
    panelTextSpacing: "Espa\xE7amento de texto",
    panelReducedMotion: "Reduzir movimento",
    panelHideImages: "Ocultar imagens",
    panelHideImagesHint: "No Modo Simples, imagens somem por padr\xE3o \u2014 desligue para manter",
    panelDefaultTitle: "Acessibilidade Digital",
    panelDefaultFooter: "Prefer\xEAncias salvas neste navegador",
    scaleDefault: "Padr\xE3o",
    scaleLarge: "Grande",
    scaleLarger: "Maior",
    scaleMax: "M\xE1ximo",
    themeSite: "Cores do site",
    themeSiteSub: "Padr\xE3o",
    themeYellowBlack: "Amarelo e Preto",
    themeYellowBlackSub: "Alto contraste",
    themeDarkHigh: "Modo Escuro Alto",
    themeDarkHighSub: "Fundo escuro",
    themeSoft: "Descanso / Suave",
    themeSoftSub: "Baixa intensidade",
    themeMono: "Monocrom\xE1tico",
    themeMonoSub: "Tons de cinza",
    themeLightHigh: "Claro Alto Contraste",
    themeLightHighSub: "Fundo branco",
    panelTypoGroupLabel: "Ajuste fino da tipografia",
    panelLineHeightTitle: "Altura da linha",
    panelWordSpacingTitle: "Espa\xE7o entre palavras",
    panelLetterSpacingTitle: "Espa\xE7o entre letras",
    panelTypoDefault: "Padr\xE3o do site",
    panelResetFont: "Redefinir fonte",
    announceResetFont: "Fonte redefinida: tamanho, fonte acess\xEDvel e espa\xE7amentos voltaram ao padr\xE3o.",
    panelCursorTitle: "Cursor do mouse",
    panelCursorDefault: "Padr\xE3o",
    panelCursorBigWhite: "Grande branco",
    panelCursorBigBlack: "Grande preto",
    panelResetFontLabel: "Redefinir fonte: tamanho, fonte acess\xEDvel e espa\xE7amentos",
    panelSaturationTitle: "Satura\xE7\xE3o das cores",
    panelSaturationLow: "Baixa",
    panelSaturationNormal: "Normal",
    panelSaturationHigh: "Alta",
    panelCustomTextTitle: "Cor do texto",
    panelCustomHeadingTitle: "Cor dos t\xEDtulos",
    panelCustomBgTitle: "Cor do fundo",
    panelCustomNone: "Padr\xE3o do site",
    panelCustomSwatchLabel: "Usar cor",
    panelCustomPickerLabel: "Escolher outra cor para",
    panelCustomOther: "Personalizada",
    panelAutoBgTitle: "Fundo autom\xE1tico",
    panelContrastWarn: "Aten\xE7\xE3o: contraste baixo (recomendado 4,5:1 ou mais) em",
    // sessionChrome.js
    sessionOpenPanelLabel: "Abrir painel de acessibilidade",
    sessionOpenPanelTitle: "Acessibilidade",
    sessionBrand: "SIMPLES",
    sessionSubOff: "Acessibilidade Cognitiva",
    sessionSubOn: "Interface Simplificada",
    sessionSwitchLabel: "Modo Simples",
    sessionBarLabel: "Modo Simples",
    sessionOffPrompt: "Quer uma navega\xE7\xE3o mais calma, direta e sem excesso de informa\xE7\xE3o?",
    sessionActivate: "Ativar Modo Simples",
    sessionOnTitle: "Modo Simples",
    sessionOnSrSuffix: " ativado",
    sessionBadge: "Foco na Navega\xE7\xE3o",
    sessionDescSimple: "Exibindo explica\xE7\xF5es em palavras f\xE1ceis, sem termos complicados.",
    sessionDescCalm: "Navega\xE7\xE3o mais calma, com bot\xF5es claros e menos distra\xE7\xF5es.",
    sessionSpeakLabel: "Ouvir p\xE1gina",
    sessionSpeakText: "Ouvir P\xE1gina",
    sessionStopLabel: "Parar leitura da p\xE1gina",
    sessionStopText: "Parar Voz",
    sessionLangPre: "Linguagem ",
    sessionLangMain: "Simples",
    sessionLangOn: "LIGADA",
    sessionLangOff: "DESLIGADA",
    sessionLangUnavailable: "Indispon\xEDvel nesta p\xE1gina",
    sessionImages: "Imagens",
    sessionImagesHidden: "OCULTAS",
    sessionImagesVisible: "VIS\xCDVEIS",
    sessionExit: "Voltar",
    sessionExitPost: " ao site normal",
    // F7f — perfis (ui/a11yPanel.js; dados em core/profiles.js)
    profilesTitle: "Perfis prontos",
    profilesHint: "Escolha um e a p\xE1gina se ajusta. Um de cada vez.",
    profileSimpleName: "Modo Simples",
    profileSimpleDesc: "P\xE1gina mais limpa e f\xE1cil de ler",
    profileLowVisionName: "Baixa vis\xE3o",
    profileLowVisionDesc: "Texto maior, cores fortes e cursor grande",
    profileDyslexiaName: "Dislexia",
    profileDyslexiaDesc: "Fonte pr\xF3pria, mais espa\xE7o entre letras e r\xE9gua de leitura",
    profileAdhdName: "TDAH",
    profileAdhdDesc: "Menos distra\xE7\xE3o: sem som, sem movimento e a voz l\xEA o que voc\xEA seleciona",
    profileEpilepsyName: "Epilepsia",
    profileEpilepsyDesc: "Sem anima\xE7\xF5es, sem v\xEDdeo tocando sozinho e sem som",
    profileKeyboardName: "Teclado",
    profileKeyboardDesc: "Foco bem vis\xEDvel, atalhos na tela e a voz l\xEA o que voc\xEA seleciona",
    profileCustom: "Personalizado",
    profileOnPre: "Perfil ",
    profileOnPost: " ativado",
    profileOff: "Perfil desligado. P\xE1gina sem ajustes.",
    // features/focusReader.js (papéis e estados falados)
    roleButton: "bot\xE3o",
    roleLink: "link",
    roleHeading: "t\xEDtulo",
    roleField: "campo",
    roleCheckbox: "caixa de sele\xE7\xE3o",
    roleRadio: "op\xE7\xE3o",
    roleSwitch: "interruptor",
    roleSelect: "lista de op\xE7\xF5es",
    focusSubmitName: "Enviar",
    focusSwitchOn: "ligado",
    focusSwitchOff: "desligado",
    focusChecked: "marcado",
    focusUnchecked: "desmarcado",
    // features/manualSelect.js (linguagem simples, U-02 / UX-21)
    lowConfNotice: "N\xE3o achei o conte\xFAdo principal, quer escolher?",
    lowConfChoose: "Escolher o conte\xFAdo",
    lowConfClose: "Fechar",
    manualInstruction: "Clique ou toque no que voc\xEA quer ler. No teclado: Tab muda de bloco, setas aumentam ou diminuem a \xE1rea, Enter confirma, Esc volta.",
    manualCurrent: "Voc\xEA escolheu:",
    manualChosen: "Conte\xFAdo principal definido",
    manualCancelled: "Sele\xE7\xE3o manual cancelada",
    manualCancel: "Voltar",
    manualCancelLabel: "Voltar sem escolher"
  });
  var SHORTCUTS = Object.freeze([
    { keys: "Alt+Shift+A", text: "Abrir o painel de acessibilidade" },
    { keys: "Esc", text: "Fechar o painel ou sair da escolha de conte\xFAdo" },
    { keys: "Tab", text: "Ir ao pr\xF3ximo item" },
    { keys: "Shift+Tab", text: "Voltar ao item anterior" },
    { keys: "Enter", text: "Ativar o bot\xE3o ou link" },
    { keys: "Espa\xE7o", text: "Ligar ou desligar um interruptor" }
  ]);

  // src/ui/fab.js
  var TIP_SEEN_KEY = "fabTipSeen";
  function createFab({ onClick, onHide }) {
    const wrap = document.createElement("div");
    wrap.className = "ms-fab-wrap";
    wrap.setAttribute("data-ms-fab-wrap", "");
    const tip = document.createElement("span");
    tip.className = "ms-fab-tip";
    tip.id = "ms-fab-tip";
    tip.textContent = STRINGS.fabTip;
    tip.setAttribute("aria-hidden", "true");
    function dismissTip() {
      tip.hidden = true;
      persistence_default.save(TIP_SEEN_KEY, true);
    }
    tip.hidden = persistence_default.load(TIP_SEEN_KEY, false) === true;
    if (!tip.hidden) persistence_default.save(TIP_SEEN_KEY, true);
    tip.addEventListener("animationend", (e) => {
      if (e.animationName === "ms-fab-tip-out") dismissTip();
    });
    const btn = document.createElement("button");
    btn.id = "ms-fab";
    btn.type = "button";
    btn.className = "ms-fab";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", "ms-a11y-panel");
    btn.setAttribute("aria-haspopup", "dialog");
    btn.setAttribute("aria-label", STRINGS.fabOpenLabel);
    const iconOpen = `
    <svg class="ms-fab-icon ms-fab-icon--open" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true" focusable="false">
      <line x1="4" y1="6" x2="20" y2="6"/>
      <line x1="4" y1="12" x2="20" y2="12"/>
      <line x1="4" y1="18" x2="20" y2="18"/>
      <circle cx="8" cy="6" r="2.2" fill="currentColor" stroke="none"/>
      <circle cx="14" cy="12" r="2.2" fill="currentColor" stroke="none"/>
      <circle cx="10" cy="18" r="2.2" fill="currentColor" stroke="none"/>
    </svg>`;
    const iconClose = `
    <svg class="ms-fab-icon ms-fab-icon--close" viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true" focusable="false" hidden>
      <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    </svg>`;
    btn.innerHTML = iconOpen + iconClose;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      onClick();
    });
    const hideBtn = document.createElement("button");
    hideBtn.type = "button";
    hideBtn.className = "ms-fab-hide";
    hideBtn.setAttribute("aria-label", STRINGS.fabHideLabel);
    hideBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true" focusable="false"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
    hideBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      onHide == null ? void 0 : onHide();
    });
    const box = document.createElement("div");
    box.className = "ms-fab-box";
    box.appendChild(btn);
    box.appendChild(hideBtn);
    wrap.appendChild(tip);
    wrap.appendChild(box);
    function sync({ panelOpen }) {
      btn.setAttribute("aria-expanded", String(panelOpen));
      btn.setAttribute(
        "aria-label",
        panelOpen ? STRINGS.fabCloseLabel : STRINGS.fabOpenLabel
      );
      btn.classList.toggle("ms-fab--open", panelOpen);
      wrap.classList.toggle("ms-fab-wrap--open", panelOpen);
      if (panelOpen) dismissTip();
      const openIcon = btn.querySelector(".ms-fab-icon--open");
      const closeIcon = btn.querySelector(".ms-fab-icon--close");
      if (openIcon) openIcon.toggleAttribute("hidden", panelOpen);
      if (closeIcon) closeIcon.toggleAttribute("hidden", !panelOpen);
    }
    sync({ panelOpen: false });
    function setSide(side) {
      wrap.setAttribute("data-ms-side", side);
    }
    function setHidden(hidden) {
      wrap.hidden = hidden;
    }
    return {
      element: wrap,
      button: btn,
      hideButton: hideBtn,
      sync,
      setSide,
      setHidden
    };
  }

  // src/utils/focus.js
  var FOCUSABLE_SELECTORS = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])'
  ].join(", ");
  function getFocusable(container) {
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS)).filter(
      (el2) => !el2.closest("[hidden], [inert]") && el2.getBoundingClientRect().width > 0
    );
  }
  function trapFocus(container) {
    function handleKeydown(e) {
      if (e.key !== "Tab") return;
      const focusable = getFocusable(container);
      if (!focusable.length) return;
      const root = container.getRootNode();
      const active = root instanceof ShadowRoot ? root.activeElement : document.activeElement;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!active || active === container || !container.contains(active)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
        return;
      }
      if (focusable.length < 2) return;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }

  // src/features/tts.js
  var _utterance = null;
  var _speaking = false;
  var _blocks = [];
  var _blockIndex = 0;
  var _activeEl = null;
  var _runId = 0;
  var _listeners = /* @__PURE__ */ new Set();
  var _notified = false;
  function notify() {
    if (_speaking === _notified) return;
    _notified = _speaking;
    for (const cb of Array.from(_listeners)) {
      try {
        cb(_speaking);
      } catch (_) {
      }
    }
  }
  function onSpeakingChange(cb) {
    _listeners.add(cb);
    return () => {
      _listeners.delete(cb);
    };
  }
  var BLOCK_TAGS = [
    "h1",
    "h2",
    "h3",
    "h4",
    "p",
    "li",
    "dt",
    "dd",
    "figcaption",
    "blockquote"
  ];
  function closestSafe(el2, selector) {
    var _a, _b, _c;
    if (!el2) return null;
    if (typeof el2.closest === "function") return el2.closest(selector);
    let node = el2;
    while (node) {
      if (node.matches && node.matches(selector)) return node;
      const parts = selector.split(",").map((s) => s.trim());
      for (const part of parts) {
        if (part.startsWith(".") && ((_a = node.classList) == null ? void 0 : _a.contains(part.slice(1))))
          return node;
        if (part.startsWith("#") && node.id === part.slice(1)) return node;
        if (part.startsWith("[") && part.endsWith("]")) {
          const attr = part.slice(1, -1).split("=")[0];
          if ((_b = node.hasAttribute) == null ? void 0 : _b.call(node, attr)) return node;
        }
        if (/^[a-z][a-z0-9]*$/i.test(part) && ((_c = node.tagName) == null ? void 0 : _c.toLowerCase()) === part.toLowerCase()) {
          return node;
        }
      }
      node = node.parentElement;
    }
    return null;
  }
  function getRoot() {
    return document.querySelector("[data-ms-principal]") || document.querySelector("main") || document.querySelector('[role="main"]') || document.body;
  }
  function isVisiblyReadable(el2) {
    if (!el2 || closestSafe(el2, "#ms-container") || closestSafe(el2, "#ms-simples-chrome") || closestSafe(el2, "#ms-session-bar")) {
      return false;
    }
    if (closestSafe(el2, "[data-ms-hidden]")) return false;
    const html = document.documentElement;
    const msOn = html.classList.contains("ms-ativo");
    const simpleLang = html.classList.contains("ms-simple-language");
    if (msOn && closestSafe(el2, ".ms-simple-hide")) return false;
    if (!msOn && closestSafe(el2, ".ms-simple-only")) return false;
    if (simpleLang && closestSafe(el2, "[data-ms-plain]")) return false;
    if (!simpleLang && closestSafe(el2, "[data-ms-simple]")) return false;
    return (el2.textContent || "").trim().length > 0;
  }
  function collectBlocks() {
    const root = getRoot();
    if (!root) return [];
    const nodes = Array.from(root.querySelectorAll(BLOCK_TAGS.join(",")));
    const readable = new Set(nodes.filter(isVisiblyReadable));
    return nodes.filter((el2) => {
      if (!readable.has(el2)) return false;
      let parent = el2.parentElement;
      while (parent && parent !== root) {
        if (readable.has(parent)) return false;
        parent = parent.parentElement;
      }
      return true;
    });
  }
  var MAX_UTTERANCE = 200;
  function splitForSpeech(text, max = MAX_UTTERANCE) {
    if (text.length <= max) return [text];
    const chunks = [];
    let cur = "";
    const flush = () => {
      const t = cur.trim();
      if (t) chunks.push(t);
      cur = "";
    };
    const sentences = text.match(/[\s\S]+?(?:[.!?…]+(?=\s|$)|$)\s*/g) || [text];
    for (const s of sentences) {
      if (s.length > max) {
        flush();
        const words = s.match(/\S+\s*/g) || [s];
        for (const w of words) {
          if (w.length > max) {
            flush();
            for (let i = 0; i < w.length; i += max)
              chunks.push(w.slice(i, i + max));
          } else if ((cur + w).trim().length > max) {
            flush();
            cur = w;
          } else {
            cur += w;
          }
        }
        continue;
      }
      if ((cur + s).trim().length > max) {
        flush();
        cur = s;
      } else {
        cur += s;
      }
    }
    flush();
    return chunks;
  }
  function clearHighlight() {
    document.querySelectorAll("[data-ms-tts-active]").forEach((node) => {
      node.removeAttribute("data-ms-tts-active");
    });
    _activeEl = null;
  }
  function highlightAndScroll(el2) {
    clearHighlight();
    el2.setAttribute("data-ms-tts-active", "");
    _activeEl = el2;
    const reduceMotion = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (typeof el2.scrollIntoView === "function") {
      try {
        el2.scrollIntoView({
          block: "center",
          behavior: reduceMotion ? "auto" : "smooth"
        });
      } catch (_) {
        el2.scrollIntoView(true);
      }
    }
  }
  function speakBlockAt(index, run) {
    if (!_speaking || run !== _runId) return;
    if (index >= _blocks.length) {
      stopSpeaking();
      return;
    }
    const el2 = _blocks[index];
    _blockIndex = index;
    highlightAndScroll(el2);
    const text = (el2.innerText || el2.textContent || "").replace(/\s+/g, " ").trim();
    if (!text) {
      speakBlockAt(index + 1, run);
      return;
    }
    const chunks = splitForSpeech(text);
    const speakChunk = (i) => {
      if (!_speaking || run !== _runId) return;
      const utterance = new SpeechSynthesisUtterance(chunks[i]);
      _utterance = utterance;
      utterance.lang = "pt-BR";
      utterance.rate = 1;
      const next = () => {
        if (run !== _runId) return;
        _utterance = null;
        if (!_speaking) return;
        if (i + 1 < chunks.length) speakChunk(i + 1);
        else speakBlockAt(index + 1, run);
      };
      utterance.onend = next;
      utterance.onerror = next;
      speechSynthesis.speak(utterance);
    };
    speakChunk(0);
  }
  function speakMainContent() {
    if (typeof speechSynthesis === "undefined") return;
    stopSpeaking();
    const run = _runId;
    _blocks = collectBlocks();
    if (!_blocks.length) {
      const root = getRoot();
      const text = root ? (root.innerText || root.textContent || "").replace(/\s+/g, " ").trim() : "";
      if (!text) return;
      const utterance = new SpeechSynthesisUtterance(text);
      _utterance = utterance;
      utterance.lang = "pt-BR";
      utterance.rate = 1;
      const done = () => {
        if (run !== _runId) return;
        _speaking = false;
        _utterance = null;
        notify();
      };
      utterance.onend = done;
      utterance.onerror = done;
      _speaking = true;
      notify();
      speechSynthesis.speak(utterance);
      return;
    }
    _speaking = true;
    notify();
    speakBlockAt(0, run);
  }
  function stopSpeaking() {
    _runId += 1;
    _speaking = false;
    _blocks = [];
    _blockIndex = 0;
    clearHighlight();
    notify();
    if (typeof speechSynthesis === "undefined") return;
    speechSynthesis.cancel();
    _utterance = null;
  }
  function isReadingMain() {
    return _speaking;
  }
  function isSpeaking() {
    if (typeof speechSynthesis !== "undefined" && speechSynthesis.speaking) {
      return true;
    }
    return _speaking;
  }

  // src/features/focusReader.js
  var MAX_TEXT = 200;
  var DEBOUNCE_MS = 150;
  var _timer = null;
  var _on = false;
  var _spoke = false;
  var _root = null;
  function isFocusReaderSupported() {
    return typeof speechSynthesis !== "undefined" && typeof SpeechSynthesisUtterance !== "undefined";
  }
  var clean = (t) => (t || "").replace(/\s+/g, " ").trim();
  var cap = (t) => t.length > MAX_TEXT ? t.slice(0, MAX_TEXT).trim() : t;
  function accessibleName(el2) {
    var _a, _b, _c;
    const ids = el2.getAttribute("aria-labelledby");
    if (ids) {
      const root = ((_a = el2.getRootNode) == null ? void 0 : _a.call(el2)) || document;
      const text = clean(
        ids.split(/\s+/).map((id) => {
          var _a2, _b2;
          return ((_b2 = (_a2 = root.getElementById) == null ? void 0 : _a2.call(root, id)) == null ? void 0 : _b2.textContent) || "";
        }).join(" ")
      );
      if (text) return cap(text);
    }
    const aria = clean(el2.getAttribute("aria-label"));
    if (aria) return cap(aria);
    const tag = el2.tagName.toLowerCase();
    let label = "";
    if (el2.labels && el2.labels.length) {
      label = clean(
        Array.from(el2.labels).map((l) => l.textContent).join(" ")
      );
    } else if (["input", "select", "textarea"].includes(tag)) {
      label = clean((_c = (_b = el2.closest) == null ? void 0 : _b.call(el2, "label")) == null ? void 0 : _c.textContent);
    }
    if (label) return cap(label);
    const alt = clean(el2.getAttribute("alt"));
    if (alt) return cap(alt);
    const title = clean(el2.getAttribute("title"));
    if (title) return cap(title);
    const type = (el2.getAttribute("type") || "").toLowerCase();
    if (tag === "input") {
      if (["button", "submit", "reset"].includes(type)) {
        return cap(
          clean(el2.value) || (type === "submit" ? STRINGS.focusSubmitName : "")
        );
      }
      return cap(clean(el2.getAttribute("placeholder")));
    }
    if (["select", "textarea"].includes(tag)) return "";
    return cap(clean(el2.textContent));
  }
  function roleWord(el2) {
    const tag = el2.tagName.toLowerCase();
    const role = (el2.getAttribute("role") || "").toLowerCase();
    const type = (el2.getAttribute("type") || "").toLowerCase();
    if (role === "switch") return STRINGS.roleSwitch;
    if (role === "checkbox") return STRINGS.roleCheckbox;
    if (role === "radio") return STRINGS.roleRadio;
    if (role === "button") return STRINGS.roleButton;
    if (role === "link") return STRINGS.roleLink;
    if (role === "heading") return STRINGS.roleHeading;
    if (role === "textbox" || role === "searchbox") return STRINGS.roleField;
    if (role === "combobox" || role === "listbox") return STRINGS.roleSelect;
    if (tag === "button") return STRINGS.roleButton;
    if (tag === "a") return STRINGS.roleLink;
    if (/^h[1-6]$/.test(tag)) return STRINGS.roleHeading;
    if (tag === "select") return STRINGS.roleSelect;
    if (tag === "textarea") return STRINGS.roleField;
    if (tag === "input") {
      if (["button", "submit", "reset", "image"].includes(type))
        return STRINGS.roleButton;
      if (type === "checkbox") return STRINGS.roleCheckbox;
      if (type === "radio") return STRINGS.roleRadio;
      return STRINGS.roleField;
    }
    if (el2.isContentEditable) return STRINGS.roleField;
    return "";
  }
  function stateWord(el2) {
    const checked = el2.getAttribute("aria-checked");
    const isSwitch = (el2.getAttribute("role") || "") === "switch";
    const type = (el2.getAttribute("type") || "").toLowerCase();
    const nativo = el2.tagName === "INPUT" && ["checkbox", "radio"].includes(type);
    if (checked === null && !nativo) return "";
    const on2 = checked !== null ? checked === "true" : el2.checked;
    if (isSwitch) return on2 ? STRINGS.focusSwitchOn : STRINGS.focusSwitchOff;
    return on2 ? STRINGS.focusChecked : STRINGS.focusUnchecked;
  }
  function describeFocus(el2) {
    if (!el2 || el2.nodeType !== 1) return "";
    const tag = el2.tagName.toLowerCase();
    if (tag === "body" || tag === "html") return "";
    const role = roleWord(el2);
    const name = accessibleName(el2);
    const parts = [name, role, role ? stateWord(el2) : ""].filter(Boolean);
    return parts.join(", ");
  }
  function speakNow(target) {
    _timer = null;
    if (!_on || isReadingMain()) return;
    const text = describeFocus(target);
    if (!text) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 1;
    _spoke = true;
    speechSynthesis.speak(utterance);
  }
  function onFocusIn(e) {
    var _a;
    const target = ((_a = e.composedPath) == null ? void 0 : _a.call(e)[0]) || e.target;
    if (_timer !== null) clearTimeout(_timer);
    _timer = setTimeout(() => speakNow(target), DEBOUNCE_MS);
  }
  function startFocusReader() {
    var _a;
    if (_on || !isFocusReaderSupported()) return;
    _on = true;
    document.addEventListener("focusin", onFocusIn, true);
    _root = ((_a = document.querySelector("#ms-container")) == null ? void 0 : _a.shadowRoot) || null;
    _root == null ? void 0 : _root.addEventListener("focusin", onFocusIn, true);
  }
  function stopFocusReader() {
    if (!_on) return;
    _on = false;
    document.removeEventListener("focusin", onFocusIn, true);
    _root == null ? void 0 : _root.removeEventListener("focusin", onFocusIn, true);
    _root = null;
    if (_timer !== null) clearTimeout(_timer);
    _timer = null;
    if (_spoke && !isReadingMain()) speechSynthesis.cancel();
    _spoke = false;
  }

  // src/features/pageOutline.js
  var OUTLINE_ID = "ms-page-outline";
  var OWN = "#ms-container, #ms-shortcuts-card, #ms-simples-chrome, #ms-session-bar, #ms-text-magnifier, [data-ms-live]";
  var FOCUSABLE = 'a[href], button, input, select, textarea, summary, [contenteditable=""], [contenteditable="true"]';
  var CANDIDATES = "h1, h2, h3, h4, h5, h6, [role], main, nav, header, footer, aside, form, section, search";
  var clean2 = (s) => (s || "").replace(/\s+/g, " ").trim();
  function isHidden(el2) {
    for (let n = el2; n && n.nodeType === 1; n = n.parentElement) {
      if (n.hidden || n.getAttribute("aria-hidden") === "true" || n.hasAttribute("data-ms-hidden")) {
        return true;
      }
      const cs = getComputedStyle(n);
      if (cs.display === "none") return true;
      if (n === el2 && cs.visibility === "hidden") return true;
    }
    return false;
  }
  function accessibleName2(el2) {
    const by = el2.getAttribute("aria-labelledby");
    if (by) {
      const t = clean2(
        by.split(/\s+/).map((id) => {
          var _a;
          return ((_a = document.getElementById(id)) == null ? void 0 : _a.textContent) || "";
        }).join(" ")
      );
      if (t) return t;
    }
    return clean2(el2.getAttribute("aria-label"));
  }
  var ROLE_MAP = {
    main: "main",
    navigation: "nav",
    banner: "banner",
    contentinfo: "footer",
    complementary: "aside",
    form: "form",
    search: "search",
    region: "region"
  };
  var TAG_MAP = {
    main: "main",
    nav: "nav",
    aside: "aside",
    search: "search",
    form: "form",
    section: "region"
  };
  function landmarkRole(el2) {
    var _a;
    const explicit = clean2(el2.getAttribute("role")).split(" ")[0].toLowerCase();
    if (explicit) return ROLE_MAP[explicit] || "";
    const tag = el2.tagName.toLowerCase();
    if (TAG_MAP[tag]) return TAG_MAP[tag];
    if (tag === "header" || tag === "footer") {
      if ((_a = el2.parentElement) == null ? void 0 : _a.closest("article, aside, main, nav, section")) {
        return "";
      }
      return tag === "header" ? "banner" : "footer";
    }
    return "";
  }
  var NAME_REQUIRED = /* @__PURE__ */ new Set(["form", "search", "region"]);
  var ROLE_LABEL = {
    main: STRINGS.outlineLmMain,
    nav: STRINGS.outlineLmNav,
    banner: STRINGS.outlineLmBanner,
    footer: STRINGS.outlineLmFooter,
    aside: STRINGS.outlineLmAside,
    form: STRINGS.outlineLmForm,
    search: STRINGS.outlineLmSearch,
    region: STRINGS.outlineLmRegion
  };
  function headingLevel(el2) {
    const m = /^H([1-6])$/.exec(el2.tagName);
    if (m) return Number(m[1]);
    if (clean2(el2.getAttribute("role")).split(" ")[0] !== "heading") return 0;
    const n = parseInt(el2.getAttribute("aria-level"), 10);
    return n >= 1 && n <= 6 ? n : 2;
  }
  function collectOutline(root = document) {
    const headings = [];
    const landmarks = [];
    for (const el2 of root.querySelectorAll(CANDIDATES)) {
      if (el2.closest(OWN) || isHidden(el2)) continue;
      const level = headingLevel(el2);
      if (level) {
        const text = clean2(el2.textContent) || accessibleName2(el2) || STRINGS.outlineNoText;
        headings.push({ el: el2, level, text });
        continue;
      }
      const role = landmarkRole(el2);
      if (!role) continue;
      const name = accessibleName2(el2);
      if (NAME_REQUIRED.has(role) && !name) continue;
      const label = ROLE_LABEL[role];
      landmarks.push({
        el: el2,
        role,
        name,
        text: name ? `${label}: ${name}` : label
      });
    }
    return { headings, landmarks };
  }
  function jumpToElement(el2) {
    var _a, _b;
    if (!(el2 == null ? void 0 : el2.isConnected)) return;
    (_a = el2.scrollIntoView) == null ? void 0 : _a.call(el2, { block: "start" });
    if (!el2.hasAttribute("tabindex") && !el2.matches(FOCUSABLE)) {
      el2.setAttribute("tabindex", "-1");
      el2.addEventListener("blur", () => el2.removeAttribute("tabindex"), {
        once: true
      });
    }
    (_b = el2.focus) == null ? void 0 : _b.call(el2, { preventScroll: true });
  }
  function createPageOutline({ container, onJump }) {
    let dlg = null;
    let trigger = null;
    const inerted = [];
    const el2 = (tag, cls, text) => {
      const n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text) n.textContent = text;
      return n;
    };
    function item(list, text, level, target) {
      const li = el2("li", "ms-outline-item");
      if (level) li.style.paddingInlineStart = `${(level - 1) * 16}px`;
      const b = el2("button", "ms-outline-link", text);
      b.type = "button";
      if (level) {
        b.setAttribute("aria-label", `${STRINGS.outlineLevel} ${level}: ${text}`);
      }
      b.addEventListener("click", () => {
        close({ restoreFocus: false });
        onJump(target);
      });
      li.appendChild(b);
      list.appendChild(li);
    }
    function group(parent, title, rows, levelOf) {
      if (!rows.length) return;
      const h = el2("h3", "ms-outline-group", title);
      const ul = el2("ul", "ms-outline-list");
      rows.forEach((r) => item(ul, r.text, levelOf == null ? void 0 : levelOf(r), r.el));
      parent.append(h, ul);
    }
    function open(from) {
      if (dlg) return;
      trigger = from || null;
      const { headings, landmarks } = collectOutline();
      dlg = el2("div", "ms-outline");
      dlg.id = OUTLINE_ID;
      dlg.setAttribute("role", "dialog");
      dlg.setAttribute("aria-modal", "true");
      dlg.setAttribute("aria-labelledby", `${OUTLINE_ID}-title`);
      const head = el2("div", "ms-outline-head");
      const title = el2("h2", "ms-outline-title", STRINGS.outlineTitle);
      title.id = `${OUTLINE_ID}-title`;
      const closeBtn = el2(
        "button",
        "ms-a11y-action ms-outline-close",
        STRINGS.outlineClose
      );
      closeBtn.type = "button";
      closeBtn.addEventListener("click", () => close());
      head.append(title, closeBtn);
      const body = el2("div", "ms-outline-body");
      if (!headings.length && !landmarks.length) {
        body.appendChild(el2("p", "ms-outline-empty", STRINGS.outlineEmpty));
      } else {
        group(body, STRINGS.outlineLandmarks, landmarks);
        group(body, STRINGS.outlineHeadings, headings, (r) => r.level);
      }
      dlg.append(head, body);
      dlg.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        e.preventDefault();
        e.stopPropagation();
        close();
      });
      for (const n of container.children) {
        if (!n.hasAttribute("inert")) {
          n.setAttribute("inert", "");
          inerted.push(n);
        }
      }
      container.appendChild(dlg);
      (dlg.querySelector(".ms-outline-link") || closeBtn).focus();
    }
    function close({ restoreFocus = true } = {}) {
      if (!dlg) return;
      dlg.remove();
      dlg = null;
      for (const n of inerted.splice(0)) n.removeAttribute("inert");
      const t = trigger;
      trigger = null;
      if (restoreFocus && (t == null ? void 0 : t.isConnected)) t.focus();
    }
    return { open, close, isOpen: () => !!dlg };
  }

  // src/utils/colorContrast.js
  var HEX = /^#[0-9a-f]{6}$/i;
  function luminance(hex) {
    const [r, g, b] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  function contrastRatio(a, b) {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  }
  var readableOn = (hex) => luminance(hex) > 0.179 ? "#000000" : "#ffffff";
  function linkOn(bg) {
    const best = ["#0000cc", "#93c5fd"].sort(
      (a, b) => contrastRatio(b, bg) - contrastRatio(a, bg)
    )[0];
    return contrastRatio(best, bg) >= 4.5 ? best : readableOn(bg);
  }
  function autoBg(t, h) {
    const refs = [t, h].filter(Boolean);
    if (!refs.length) return "";
    const score = (c) => Math.min(...refs.map((r) => contrastRatio(r, c)));
    const [black, white] = [score("#000000"), score("#ffffff")];
    if (Math.abs(black - white) < 0.01) return readableOn(t || h);
    return black > white ? "#000000" : "#ffffff";
  }
  function effectiveColors({ customText, customHeading, customBg }) {
    const ok = (v) => HEX.test(v || "") ? v : "";
    const t = ok(customText);
    const h = ok(customHeading);
    const b = ok(customBg);
    const bg = b || autoBg(t, h);
    const text = t || (bg ? readableOn(bg) : "");
    return { text, heading: h, bg, link: bg ? linkOn(bg) : "" };
  }

  // src/ui/a11yPanel.js
  var TYPO_KEYS = ["lineHeight", "wordSpacing", "letterSpacing"];
  var round2 = (n) => Math.round(n * 100) / 100;
  var typoValue = (key, idx) => idx <= 0 ? 0 : key === "lineHeight" ? round2(
    TYPO_LIMITS.lineHeight.min + (idx - 1) * TYPO_LIMITS.lineHeight.step
  ) : round2(idx * TYPO_LIMITS[key].step);
  var typoIdx = (key, v) => !(v > 0) ? 0 : key === "lineHeight" ? Math.round(
    (v - TYPO_LIMITS.lineHeight.min) / TYPO_LIMITS.lineHeight.step
  ) + 1 : Math.round(v / TYPO_LIMITS[key].step);
  var typoText = (key, v) => v > 0 ? `${String(v).replace(".", ",")}${key === "lineHeight" ? "" : " em"}` : STRINGS.panelTypoDefault;
  var TEXT_SCALES = [
    { value: "100", label: "100%", title: STRINGS.scaleDefault },
    { value: "125", label: "125%", title: STRINGS.scaleLarge },
    { value: "150", label: "150%", title: STRINGS.scaleLarger },
    { value: "175", label: "175%", title: STRINGS.scaleMax }
  ];
  var DEFAULT_BRAND = {
    title: STRINGS.panelDefaultTitle,
    subtitle: "",
    footer: STRINGS.panelDefaultFooter
  };
  var COLOR_THEMES = [
    { value: "senac", label: STRINGS.themeSite, sub: STRINGS.themeSiteSub },
    {
      value: "yellowBlack",
      label: STRINGS.themeYellowBlack,
      sub: STRINGS.themeYellowBlackSub
    },
    { value: "darkHigh", label: STRINGS.themeDarkHigh, sub: STRINGS.themeDarkHighSub },
    { value: "soft", label: STRINGS.themeSoft, sub: STRINGS.themeSoftSub },
    { value: "mono", label: STRINGS.themeMono, sub: STRINGS.themeMonoSub },
    { value: "lightHigh", label: STRINGS.themeLightHigh, sub: STRINGS.themeLightHighSub }
  ];
  var SATURATIONS = [
    { value: "low", label: STRINGS.panelSaturationLow },
    { value: "normal", label: STRINGS.panelSaturationNormal },
    { value: "high", label: STRINGS.panelSaturationHigh }
  ];
  var CURSORS = [
    { value: "default", label: STRINGS.panelCursorDefault },
    { value: "bigWhite", label: STRINGS.panelCursorBigWhite },
    { value: "bigBlack", label: STRINGS.panelCursorBigBlack }
  ];
  var CUSTOM_COLORS = {
    customText: {
      labelId: "ms-label-ctext",
      title: STRINGS.panelCustomTextTitle,
      presets: [
        "#000000",
        "#1a1a1a",
        "#0b2c5f",
        "#14532d",
        "#7f1d1d",
        "#ffffff",
        "#fef08a",
        "#bae6fd"
      ]
    },
    customHeading: {
      labelId: "ms-label-cheading",
      title: STRINGS.panelCustomHeadingTitle,
      presets: [
        "#000000",
        "#0b2c5f",
        "#7f1d1d",
        "#14532d",
        "#4a148c",
        "#ffffff",
        "#fde047",
        "#93c5fd"
      ]
    },
    customBg: {
      labelId: "ms-label-cbg",
      title: STRINGS.panelCustomBgTitle,
      presets: [
        "#ffffff",
        "#fffbe6",
        "#f5efe0",
        "#e6f0ff",
        "#e8f5e9",
        "#000000",
        "#0f172a",
        "#1a1a1a"
      ]
    }
  };
  var svgIcon = (inner) => `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;
  var CHEVRON = svgIcon('<path d="m6 9 6 6 6-6"/>');
  var CHECK = svgIcon('<path d="m5 12.5 4.5 4.5L19 7.5"/>');
  var switchTile = ({ option, title, label, desc, icon }) => `<button type="button" class="ms-switch ms-tile" role="switch" aria-checked="false" data-option="${option}" aria-label="${label}"${desc ? ` aria-describedby="ms-desc-${option}"` : ""}><span class="ms-tile-icon" aria-hidden="true">${icon}</span><span class="ms-tile-label">${title}</span><span class="ms-tile-state" data-state aria-hidden="true">${STRINGS.stateOff}</span><span class="ms-tile-check" aria-hidden="true">${CHECK}</span>${desc ? `<span id="ms-desc-${option}" hidden>${desc}</span>` : ""}</button>`;
  var radioHead = (id, title, option) => `<div class="ms-a11y-control-head"><p id="${id}" class="ms-a11y-control-label">${title}</p><span class="ms-a11y-control-state" data-state-for="${option}" aria-hidden="true"></span></div>`;
  var CONTROLS = {
    textScale: {
      wide: true,
      html: `
        ${radioHead("ms-label-text", STRINGS.panelTextSizeTitle, "textScale")}
        <div class="ms-segmented" role="radiogroup" aria-labelledby="ms-label-text" data-option="textScale">
          ${TEXT_SCALES.map(
        (s) => `
            <button type="button" role="radio" class="ms-segment"
              data-value="${s.value}" aria-checked="false"
              aria-label="${STRINGS.panelTextSizeItemLabel} ${s.label} \u2014 ${s.title}" title="${s.title}">
              ${s.label}
            </button>`
      ).join("")}
        </div>`
    },
    colorTheme: {
      wide: true,
      html: `
        ${radioHead("ms-label-theme", STRINGS.panelThemeTitle, "colorTheme")}
        <div class="ms-theme-grid" role="radiogroup" aria-labelledby="ms-label-theme" data-option="colorTheme">
          ${COLOR_THEMES.map(
        (t) => `
            <button type="button" role="radio" class="ms-theme-btn ms-theme-btn--${t.value}"
              data-value="${t.value}" aria-checked="false"
              aria-label="${STRINGS.panelThemeItemLabel} ${t.label} \u2014 ${t.sub}">
              <span class="ms-theme-swatch" aria-hidden="true"></span>
              <span class="ms-theme-label">${t.label}</span>
              <span class="ms-theme-sub">${t.sub}</span>
            </button>`
      ).join("")}
        </div>`
    },
    // Segmentos preenchidos em createA11yPanel (DOM, sem interpolação no template)
    colorSaturation: {
      wide: true,
      html: `
        ${radioHead("ms-label-sat", STRINGS.panelSaturationTitle, "colorSaturation")}
        <div class="ms-segmented" role="radiogroup" aria-labelledby="ms-label-sat" data-option="colorSaturation"></div>`
    },
    // Segmentos preenchidos em createA11yPanel. Em tela de toque não há cursor: o controle fica e é inofensivo
    cursorStyle: {
      wide: true,
      html: `
        ${radioHead("ms-label-cursor", STRINGS.panelCursorTitle, "cursorStyle")}
        <div class="ms-segmented" role="radiogroup" aria-labelledby="ms-label-cursor" data-option="cursorStyle"></div>`
    },
    customText: {
      wide: true,
      html: `
        ${radioHead("ms-label-ctext", STRINGS.panelCustomTextTitle, "customText")}
        <div class="ms-swatches" role="radiogroup" aria-labelledby="ms-label-ctext" data-option="customText"></div>
        <input type="color" class="ms-color-input" data-picker="customText">`
    },
    customHeading: {
      wide: true,
      html: `
        ${radioHead("ms-label-cheading", STRINGS.panelCustomHeadingTitle, "customHeading")}
        <div class="ms-swatches" role="radiogroup" aria-labelledby="ms-label-cheading" data-option="customHeading"></div>
        <input type="color" class="ms-color-input" data-picker="customHeading">`
    },
    customBg: {
      wide: true,
      html: `
        ${radioHead("ms-label-cbg", STRINGS.panelCustomBgTitle, "customBg")}
        <div class="ms-swatches" role="radiogroup" aria-labelledby="ms-label-cbg" data-option="customBg"></div>
        <input type="color" class="ms-color-input" data-picker="customBg">
        <p class="ms-a11y-warn" role="status" aria-atomic="true" data-contrast-warn></p>`
    },
    dyslexiaFont: {
      html: switchTile({
        option: "dyslexiaFont",
        title: STRINGS.panelDyslexiaTitle,
        label: STRINGS.panelDyslexiaLabel,
        desc: STRINGS.panelDyslexiaDesc,
        icon: svgIcon(
          '<path d="M4 19 10 5l6 14"/><path d="M6.5 14h7"/><path d="M19 9v10"/>'
        )
      })
    },
    readingRuler: {
      html: switchTile({
        option: "readingRuler",
        title: STRINGS.panelRulerTitle,
        label: STRINGS.panelRulerTitle,
        desc: STRINGS.panelRulerDesc,
        icon: svgIcon(
          '<path d="M4 8h16"/><rect x="4" y="11" width="16" height="3" rx="1" fill="currentColor"/><path d="M4 18h16"/>'
        )
      })
    },
    speak: {
      html: `<button type="button" class="ms-btn-ouvir ms-tile" data-action="speak" aria-label="${STRINGS.panelVoiceLabel}"><span class="ms-tile-icon" aria-hidden="true">${svgIcon('<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>')}</span><span class="ms-tile-label" data-speak-text>${STRINGS.panelVoiceButton}</span></button>`
    },
    readFocus: {
      html: switchTile({
        option: "readFocus",
        title: STRINGS.panelReadFocusTitle,
        label: STRINGS.panelReadFocusTitle,
        desc: STRINGS.panelReadFocusDesc,
        icon: svgIcon(
          '<path d="M5 4v14l4-3.5 2.5 5 2.5-1-2.5-5H16z"/><path d="M17.5 5.5a4 4 0 0 1 0 5"/>'
        )
      })
    },
    highlightLinks: {
      html: switchTile({
        option: "highlightLinks",
        title: STRINGS.panelHighlightLinks,
        label: STRINGS.panelHighlightLinks,
        icon: svgIcon(
          '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'
        )
      })
    },
    highlightHeadings: {
      html: switchTile({
        option: "highlightHeadings",
        title: STRINGS.panelHighlightHeadings,
        label: STRINGS.panelHighlightHeadings,
        icon: svgIcon(
          '<path d="M6 4v16"/><path d="M18 4v16"/><path d="M6 12h12"/>'
        )
      })
    },
    highlightControls: {
      html: switchTile({
        option: "highlightControls",
        title: STRINGS.panelHighlightControls,
        label: STRINGS.panelHighlightControls,
        icon: svgIcon(
          '<rect x="3" y="7" width="18" height="10" rx="2"/><path d="M8 12h8"/>'
        )
      })
    },
    enlargeTargets: {
      html: switchTile({
        option: "enlargeTargets",
        title: STRINGS.panelEnlargeTargets,
        label: STRINGS.panelEnlargeTargets,
        icon: svgIcon(
          '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 15l6-6"/><path d="M10 9h5v5"/>'
        )
      })
    },
    textMagnifier: {
      html: switchTile({
        option: "textMagnifier",
        title: STRINGS.panelTextMagnifier,
        label: STRINGS.panelTextMagnifier,
        icon: svgIcon(
          '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/><path d="M8 10h4"/>'
        )
      })
    },
    // F9c: ação de sessão (abre um diálogo), não é opção persistida
    pageOutline: {
      html: `<button type="button" class="ms-tile" data-action="page-outline" aria-haspopup="dialog"><span class="ms-tile-icon" aria-hidden="true">${svgIcon('<path d="M4 6h16"/><path d="M8 12h12"/><path d="M12 18h8"/>')}</span><span class="ms-tile-label">${STRINGS.panelPageOutline}</span></button>`
    },
    // Ocupa a linha inteira da grade (não é radiogroup, então não usa `wide`)
    typography: {
      html: `
        <div class="ms-a11y-block--span" role="group" aria-labelledby="ms-label-typo">
          <p id="ms-label-typo" class="ms-a11y-control-label">${STRINGS.panelTypoGroupLabel}</p>
          <div class="ms-range">
            <div class="ms-a11y-control-head"><label class="ms-range-label" for="ms-range-lineHeight">${STRINGS.panelLineHeightTitle}</label><span class="ms-a11y-control-state" data-state-for="lineHeight" aria-hidden="true"></span></div>
            <input type="range" class="ms-range-input" id="ms-range-lineHeight" data-range="lineHeight" min="0" step="1" value="0">
          </div>
          <div class="ms-range">
            <div class="ms-a11y-control-head"><label class="ms-range-label" for="ms-range-wordSpacing">${STRINGS.panelWordSpacingTitle}</label><span class="ms-a11y-control-state" data-state-for="wordSpacing" aria-hidden="true"></span></div>
            <input type="range" class="ms-range-input" id="ms-range-wordSpacing" data-range="wordSpacing" min="0" step="1" value="0">
          </div>
          <div class="ms-range">
            <div class="ms-a11y-control-head"><label class="ms-range-label" for="ms-range-letterSpacing">${STRINGS.panelLetterSpacingTitle}</label><span class="ms-a11y-control-state" data-state-for="letterSpacing" aria-hidden="true"></span></div>
            <input type="range" class="ms-range-input" id="ms-range-letterSpacing" data-range="letterSpacing" min="0" step="1" value="0">
          </div>
          <button type="button" class="ms-a11y-action ms-a11y-action--font" data-action="reset-font" aria-label="${STRINGS.panelResetFontLabel}">${STRINGS.panelResetFont}</button>
        </div>`
    },
    textSpacing: {
      html: switchTile({
        option: "textSpacing",
        title: STRINGS.panelTextSpacing,
        label: STRINGS.panelTextSpacing,
        icon: svgIcon(
          '<path d="M4 4v16"/><path d="M20 4v16"/><path d="m8 12h8"/><path d="m10 9-3 3 3 3"/><path d="m14 9 3 3-3 3"/>'
        )
      })
    },
    reducedMotion: {
      html: switchTile({
        option: "reducedMotion",
        title: STRINGS.panelReducedMotion,
        label: STRINGS.panelReducedMotion,
        icon: svgIcon(
          '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>'
        )
      })
    },
    strongFocus: {
      html: switchTile({
        option: "strongFocus",
        title: STRINGS.panelStrongFocusTitle,
        label: STRINGS.panelStrongFocusTitle,
        desc: STRINGS.panelStrongFocusDesc,
        icon: svgIcon(
          '<rect x="4" y="6" width="16" height="12" rx="2"/><rect x="1.5" y="3.5" width="21" height="17" rx="3.5"/>'
        )
      })
    },
    showShortcuts: {
      html: switchTile({
        option: "showShortcuts",
        title: STRINGS.panelShortcutsTitle,
        label: STRINGS.panelShortcutsTitle,
        desc: STRINGS.panelShortcutsDesc,
        icon: svgIcon(
          '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>'
        )
      })
    },
    blockFlashing: {
      html: switchTile({
        option: "blockFlashing",
        title: STRINGS.panelBlockFlashingTitle,
        label: STRINGS.panelBlockFlashingTitle,
        desc: STRINGS.panelBlockFlashingDesc,
        icon: svgIcon('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>')
      })
    },
    muteMedia: {
      html: switchTile({
        option: "muteMedia",
        title: STRINGS.panelMuteMediaTitle,
        label: STRINGS.panelMuteMediaTitle,
        desc: STRINGS.panelMuteMediaDesc,
        icon: svgIcon(
          '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 5 6"/><path d="m21 9-5 6"/>'
        )
      })
    },
    hideImages: {
      html: switchTile({
        option: "hideImages",
        title: STRINGS.panelHideImages,
        label: STRINGS.panelHideImages,
        desc: STRINGS.panelHideImagesHint,
        icon: svgIcon(
          '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m21 16-5-5-8 9"/>'
        )
      })
    }
  };
  var SECTIONS = [
    {
      id: "text",
      title: STRINGS.sectionTextTitle,
      icon: svgIcon(
        '<path d="M5 7V5h14v2"/><path d="M12 5v14"/><path d="M9 19h6"/>'
      ),
      controls: [
        "textScale",
        "dyslexiaFont",
        "textSpacing",
        "readingRuler",
        "speak",
        "readFocus",
        "typography"
      ]
    },
    {
      id: "colors",
      title: STRINGS.sectionColorsTitle,
      icon: svgIcon(
        '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor"/>'
      ),
      controls: [
        "colorTheme",
        "colorSaturation",
        "customText",
        "customHeading",
        "customBg",
        "cursorStyle",
        "highlightLinks"
      ]
    },
    {
      id: "pageTools",
      title: STRINGS.sectionPageToolsTitle,
      icon: svgIcon(
        '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 14h8"/>'
      ),
      controls: [
        "highlightHeadings",
        "highlightControls",
        "enlargeTargets",
        "textMagnifier",
        "pageOutline"
      ]
    },
    {
      id: "motion",
      title: STRINGS.sectionMotionTitle,
      icon: svgIcon(
        '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m21 16-5-5-8 9"/>'
      ),
      controls: ["reducedMotion", "blockFlashing", "muteMedia", "hideImages"]
    },
    {
      id: "keyboard",
      title: STRINGS.sectionKeyboardTitle,
      icon: svgIcon(
        '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>'
      ),
      controls: ["strongFocus", "showShortcuts"]
    }
  ];
  function buildProfiles() {
    const el2 = (tag, cls, text) => {
      const n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text) n.textContent = text;
      return n;
    };
    const sec = el2("section", "ms-a11y-profiles");
    sec.setAttribute("aria-labelledby", "ms-profiles-title");
    const h = el2(
      "h3",
      "ms-a11y-section-title ms-profiles-title",
      STRINGS.profilesTitle
    );
    h.id = "ms-profiles-title";
    const list = el2("div", "ms-profile-list");
    for (const p of PROFILES) {
      const b = el2("button", "ms-profile");
      b.type = "button";
      b.setAttribute("data-profile", p.id);
      b.setAttribute("aria-pressed", "false");
      b.appendChild(el2("span", "ms-profile-name", STRINGS["profile" + p.key + "Name"]));
      b.appendChild(el2("span", "ms-profile-desc", STRINGS["profile" + p.key + "Desc"]));
      const custom = el2("span", "ms-profile-custom", STRINGS.profileCustom);
      custom.hidden = true;
      b.appendChild(custom);
      list.appendChild(b);
    }
    sec.appendChild(h);
    sec.appendChild(el2("p", "ms-profiles-hint", STRINGS.profilesHint));
    sec.appendChild(list);
    return sec;
  }
  function renderSection(sec, index) {
    const open = index === 0;
    const blocks = sec.controls.map(
      (k) => CONTROLS[k].wide ? `<div class="ms-a11y-block ms-a11y-block--wide">${CONTROLS[k].html}</div>` : CONTROLS[k].html
    );
    return `
      <section class="ms-a11y-section" data-section-id="${sec.id}">
        <h3 class="ms-a11y-section-title">
          <button type="button" class="ms-a11y-section-toggle" id="ms-sec-${sec.id}-btn"
            aria-expanded="${open}" aria-controls="ms-sec-${sec.id}-body">
            <span aria-hidden="true">${sec.icon}</span>
            <span class="ms-a11y-section-name">${sec.title}</span>
            <span class="ms-a11y-section-chevron" aria-hidden="true">${CHEVRON}</span>
          </button>
        </h3>
        <div class="ms-a11y-section-body" id="ms-sec-${sec.id}-body" role="region"
          aria-labelledby="ms-sec-${sec.id}-btn"${open ? "" : " hidden"}>
          <div class="ms-a11y-grid">${blocks.join("")}
          </div>
        </div>
      </section>`;
  }
  function createA11yPanel({
    state: state2,
    onClose,
    onToggleModoSimples,
    onSetOption,
    onSpeak,
    onResetAll,
    onResetFont,
    onSelectProfile,
    onMoveSide,
    onOutlineJump,
    brand
  }) {
    const texts = { ...DEFAULT_BRAND, ...brand };
    const panel = document.createElement("div");
    panel.id = "ms-a11y-panel";
    panel.className = "ms-a11y-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "ms-a11y-title");
    panel.hidden = true;
    panel.innerHTML = `
    <header class="ms-a11y-header">
      <div class="ms-a11y-header-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
        </svg>
      </div>
      <div class="ms-a11y-header-text">
        <h2 id="ms-a11y-title"></h2>
        <p class="ms-a11y-subtitle"></p>
      </div>
      <button type="button" class="ms-a11y-close" aria-label="${STRINGS.panelCloseLabel}">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
          <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </header>

    <div class="ms-a11y-body">
      <div data-slot="profiles"></div>
      <div class="ms-a11y-card ms-a11y-card--simple" data-section="modo-simples">
        <div class="ms-a11y-card-row">
          <div class="ms-a11y-card-text">
            <span class="ms-a11y-card-star" aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3.5l2.5 5.6 6 .6-4.5 4 1.3 6-5.3-3.1-5.3 3.1 1.3-6-4.5-4 6-.6z" fill="currentColor"/></svg></span>
            <strong>${STRINGS.panelSimpleTitle}</strong>
            <p>${STRINGS.panelSimpleDesc}</p>
          </div>
          <button type="button" class="ms-switch" role="switch" aria-checked="false"
            data-action="modo-simples" aria-label="${STRINGS.panelSimpleSwitchLabel}">
            <span class="ms-switch-thumb"></span>
          </button>
        </div>
      </div>
      ${SECTIONS.map(renderSection).join("")}

      <div class="ms-a11y-actions">
        <button type="button" class="ms-a11y-action" data-action="reset-all">${STRINGS.panelResetLabel}</button>
        <button type="button" class="ms-a11y-action" data-action="move-side">${STRINGS.panelMoveToLeft}</button>
      </div>

      <div class="ms-a11y-live" aria-live="polite" aria-atomic="true"></div>
      <p class="ms-a11y-footer-note"></p>
    </div>
  `;
    const setText = (selector, text) => {
      const el2 = panel.querySelector(selector);
      el2.textContent = text;
      el2.hidden = !text;
    };
    setText("#ms-a11y-title", texts.title || DEFAULT_BRAND.title);
    setText(".ms-a11y-subtitle", texts.subtitle);
    setText(".ms-a11y-footer-note", texts.footer);
    const radioBtn = (cls, value, label) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", "false");
      b.className = cls;
      b.setAttribute("data-value", value);
      b.setAttribute("aria-label", label);
      return b;
    };
    const satGroup = panel.querySelector('[data-option="colorSaturation"]');
    SATURATIONS.forEach((s) => {
      const b = radioBtn(
        "ms-segment",
        s.value,
        `${STRINGS.panelSaturationTitle} ${s.label}`
      );
      b.textContent = s.label;
      satGroup.appendChild(b);
    });
    const cursorGroup = panel.querySelector('[data-option="cursorStyle"]');
    CURSORS.forEach((c) => {
      const b = radioBtn(
        "ms-segment",
        c.value,
        `${STRINGS.panelCursorTitle} ${c.label}`
      );
      b.textContent = c.label;
      cursorGroup.appendChild(b);
    });
    Object.entries(CUSTOM_COLORS).forEach(([key, cfg]) => {
      const group = panel.querySelector(`[data-option="${key}"]`);
      const none = radioBtn(
        "ms-swatch ms-swatch--none",
        "",
        `${cfg.title}: ${STRINGS.panelCustomNone}`
      );
      none.title = STRINGS.panelCustomNone;
      group.appendChild(none);
      cfg.presets.forEach((hex) => {
        const b = radioBtn(
          "ms-swatch",
          hex,
          `${STRINGS.panelCustomSwatchLabel} ${hex} \u2014 ${cfg.title}`
        );
        b.style.backgroundColor = hex;
        b.title = hex;
        group.appendChild(b);
      });
      const other = radioBtn(
        "ms-swatch ms-swatch--custom",
        "x",
        `${cfg.title}: ${STRINGS.panelCustomOther}`
      );
      other.hidden = true;
      group.appendChild(other);
      panel.querySelector(`[data-picker="${key}"]`).setAttribute("aria-label", `${STRINGS.panelCustomPickerLabel} ${cfg.title}`);
    });
    let _releaseFocus = null;
    panel.querySelectorAll(".ms-a11y-section-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const open2 = btn.getAttribute("aria-expanded") !== "true";
        btn.setAttribute("aria-expanded", String(open2));
        panel.querySelector(`#${btn.getAttribute("aria-controls")}`).hidden = !open2;
      });
    });
    panel.querySelector(".ms-a11y-close").addEventListener("click", () => onClose());
    panel.querySelector('[data-slot="profiles"]').appendChild(buildProfiles());
    panel.querySelectorAll("[data-profile]").forEach(
      (btn) => btn.addEventListener(
        "click",
        () => onSelectProfile == null ? void 0 : onSelectProfile(btn.getAttribute("data-profile"))
      )
    );
    panel.querySelector('[data-action="reset-all"]').addEventListener("click", () => onResetAll == null ? void 0 : onResetAll());
    panel.querySelector('[data-action="reset-font"]').addEventListener("click", () => onResetFont == null ? void 0 : onResetFont());
    const outline = createPageOutline({
      container: panel,
      onJump: (el2) => onOutlineJump == null ? void 0 : onOutlineJump(el2)
    });
    panel.querySelector('[data-action="page-outline"]').addEventListener("click", (e) => outline.open(e.currentTarget));
    TYPO_KEYS.forEach((key) => {
      const input = panel.querySelector(`[data-range="${key}"]`);
      input.max = String(typoIdx(key, TYPO_LIMITS[key].max));
      input.setAttribute("aria-valuetext", typoText(key, 0));
      input.addEventListener(
        "input",
        () => onSetOption(key, typoValue(key, Number(input.value)))
      );
    });
    panel.querySelector('[data-action="move-side"]').addEventListener("click", () => onMoveSide == null ? void 0 : onMoveSide());
    function setSide(side) {
      panel.setAttribute("data-ms-side", side);
      panel.querySelector('[data-action="move-side"]').textContent = side === "left" ? STRINGS.panelMoveToRight : STRINGS.panelMoveToLeft;
    }
    panel.querySelector('[data-action="modo-simples"]').addEventListener("click", (e) => {
      const btn = e.currentTarget;
      const next = btn.getAttribute("aria-checked") !== "true";
      onToggleModoSimples(next);
    });
    panel.querySelectorAll(".ms-segmented .ms-segment").forEach((btn) => {
      btn.addEventListener("click", () => {
        onSetOption(
          btn.closest("[data-option]").getAttribute("data-option"),
          btn.getAttribute("data-value")
        );
      });
    });
    panel.querySelectorAll(".ms-swatches .ms-swatch").forEach((btn) => {
      btn.addEventListener("click", () => {
        onSetOption(
          btn.closest("[data-option]").getAttribute("data-option"),
          btn.getAttribute("data-value")
        );
      });
    });
    panel.querySelectorAll(".ms-color-input").forEach((input) => {
      input.addEventListener("input", () => {
        onSetOption(input.getAttribute("data-picker"), input.value);
      });
    });
    panel.querySelectorAll(".ms-theme-grid .ms-theme-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        onSetOption("colorTheme", btn.getAttribute("data-value"));
      });
    });
    panel.querySelectorAll('[role="radiogroup"]').forEach((group) => {
      group.addEventListener("keydown", (e) => {
        const radios = [...group.querySelectorAll('[role="radio"]')].filter(
          (r) => !r.hidden
        );
        const i = radios.indexOf(e.target);
        if (i < 0) return;
        const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        let next;
        if (step) next = radios[(i + step + radios.length) % radios.length];
        else if (e.key === "Home") next = radios[0];
        else if (e.key === "End") next = radios[radios.length - 1];
        if (!next) return;
        e.preventDefault();
        next.focus();
        next.click();
      });
    });
    panel.querySelectorAll(".ms-switch[data-option]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-option");
        const next = btn.getAttribute("aria-checked") !== "true";
        onSetOption(key, next);
      });
    });
    panel.querySelector('[data-action="speak"]').addEventListener("click", () => onSpeak());
    function sync(s, ui = {}) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
      const modoBtn = panel.querySelector('[data-action="modo-simples"]');
      if (modoBtn) {
        modoBtn.setAttribute("aria-checked", String(!!s.modoSimples));
        modoBtn.classList.toggle("ms-switch--on", !!s.modoSimples);
      }
      const scale = ((_a = s.options) == null ? void 0 : _a.textScale) || "100";
      panel.querySelectorAll('[data-option="textScale"] .ms-segment').forEach((btn) => {
        const on2 = btn.getAttribute("data-value") === scale;
        btn.setAttribute("aria-checked", String(on2));
        btn.setAttribute("tabindex", on2 ? "0" : "-1");
        btn.classList.toggle("ms-segment--on", on2);
      });
      const theme = ((_b = s.options) == null ? void 0 : _b.colorTheme) || "senac";
      panel.querySelectorAll('[data-option="colorTheme"] .ms-theme-btn').forEach((btn) => {
        const on2 = btn.getAttribute("data-value") === theme;
        btn.setAttribute("aria-checked", String(on2));
        btn.setAttribute("tabindex", on2 ? "0" : "-1");
        btn.classList.toggle("ms-theme-btn--on", on2);
      });
      TYPO_KEYS.forEach((key) => {
        var _a2;
        const v = Number((_a2 = s.options) == null ? void 0 : _a2[key]) || 0;
        const input = panel.querySelector(`[data-range="${key}"]`);
        if (input) {
          input.value = String(typoIdx(key, v));
          input.setAttribute("aria-valuetext", typoText(key, v));
        }
        const st = panel.querySelector(`[data-state-for="${key}"]`);
        if (st) st.textContent = typoText(key, v);
      });
      const syncRadios = (selector, value) => {
        const radios = [...panel.querySelectorAll(selector)];
        const hit = radios.some((b) => b.getAttribute("data-value") === value);
        radios.forEach((btn, i) => {
          const on2 = btn.getAttribute("data-value") === value;
          btn.setAttribute("aria-checked", String(on2));
          btn.setAttribute("tabindex", on2 || !hit && i === 0 ? "0" : "-1");
          btn.classList.toggle(
            btn.classList.contains("ms-swatch") ? "ms-swatch--on" : "ms-segment--on",
            on2
          );
        });
      };
      const sat = ((_c = s.options) == null ? void 0 : _c.colorSaturation) || "normal";
      const cursor = ((_d = s.options) == null ? void 0 : _d.cursorStyle) || "default";
      syncRadios('[data-option="colorSaturation"] .ms-segment', sat);
      syncRadios('[data-option="cursorStyle"] .ms-segment', cursor);
      Object.keys(CUSTOM_COLORS).forEach((key) => {
        var _a2;
        const val = ((_a2 = s.options) == null ? void 0 : _a2[key]) || "";
        const other = panel.querySelector(
          `[data-option="${key}"] .ms-swatch--custom`
        );
        if (other) {
          const isOther = !!val && !CUSTOM_COLORS[key].presets.includes(val);
          other.hidden = !isOther;
          other.setAttribute("data-value", isOther ? val : "x");
          other.style.backgroundColor = isOther ? val : "";
          other.title = isOther ? val : "";
        }
        syncRadios(`[data-option="${key}"] .ms-swatch`, val);
        const input = panel.querySelector(`[data-picker="${key}"]`);
        if (input) input.value = val || "#000000";
        const st = panel.querySelector(`[data-state-for="${key}"]`);
        if (st) st.textContent = val || STRINGS.panelCustomNone;
      });
      const warn = panel.querySelector("[data-contrast-warn]");
      if (warn) {
        const eff = effectiveColors(s.options || {});
        const low = [
          [STRINGS.panelCustomTextTitle, eff.text],
          [STRINGS.panelCustomHeadingTitle, eff.heading]
        ].filter(([, c]) => c && eff.bg).map(([title, c]) => [title, contrastRatio(c, eff.bg)]).filter(([, r]) => r < 4.5);
        const bgLabel = ((_e = s.options) == null ? void 0 : _e.customBg) ? STRINGS.panelCustomBgTitle : STRINGS.panelAutoBgTitle;
        warn.textContent = low.map(
          ([title, r]) => `${STRINGS.panelContrastWarn} ${title} / ${bgLabel}: ${r.toFixed(1).replace(".", ",")}:1.`
        ).join(" ");
      }
      [
        "dyslexiaFont",
        "readingRuler",
        "highlightLinks",
        "highlightHeadings",
        "highlightControls",
        "enlargeTargets",
        "textMagnifier",
        "textSpacing",
        "reducedMotion",
        "hideImages",
        "readFocus",
        "muteMedia",
        "blockFlashing",
        "strongFocus",
        "showShortcuts"
      ].forEach((key) => {
        var _a2;
        const btn = panel.querySelector(`.ms-switch[data-option="${key}"]`);
        if (!btn) return;
        const on2 = !!((_a2 = s.options) == null ? void 0 : _a2[key]);
        btn.setAttribute("aria-checked", String(on2));
        btn.classList.toggle("ms-switch--on", on2);
        const st = btn.querySelector("[data-state]");
        if (st) st.textContent = on2 ? STRINGS.stateOn : STRINGS.stateOff;
        if (key === "readFocus" && !isFocusReaderSupported()) {
          btn.disabled = true;
          btn.setAttribute("title", STRINGS.panelReadFocusUnsupported);
          if (st) st.textContent = STRINGS.panelReadFocusUnsupportedState;
          const d = panel.querySelector("#ms-desc-readFocus");
          if (d) d.textContent = STRINGS.panelReadFocusUnsupported;
        }
      });
      const setState = (key, text) => {
        const el2 = panel.querySelector(`[data-state-for="${key}"]`);
        if (el2) el2.textContent = text;
      };
      const curScale = TEXT_SCALES.find((x) => x.value === scale);
      setState(
        "textScale",
        curScale ? `${curScale.label} \xB7 ${curScale.title}` : `${scale}%`
      );
      setState(
        "colorTheme",
        (_g = (_f = COLOR_THEMES.find((x) => x.value === theme)) == null ? void 0 : _f.label) != null ? _g : theme
      );
      setState(
        "colorSaturation",
        (_i = (_h = SATURATIONS.find((x) => x.value === sat)) == null ? void 0 : _h.label) != null ? _i : sat
      );
      setState(
        "cursorStyle",
        (_k = (_j = CURSORS.find((x) => x.value === cursor)) == null ? void 0 : _j.label) != null ? _k : cursor
      );
      panel.querySelectorAll("[data-profile]").forEach((btn) => {
        const active = s.activeProfile === btn.getAttribute("data-profile");
        btn.setAttribute("aria-pressed", String(active));
        btn.classList.toggle("ms-profile--on", active);
        btn.querySelector(".ms-profile-custom").hidden = !(active && s.profileCustom);
      });
      const speakBtn = panel.querySelector('[data-action="speak"]');
      if (speakBtn && ui.speaking !== void 0) {
        speakBtn.querySelector("[data-speak-text]").textContent = ui.speaking ? STRINGS.panelVoiceStopButton : STRINGS.panelVoiceButton;
        speakBtn.setAttribute(
          "aria-label",
          ui.speaking ? STRINGS.panelVoiceStopLabel : STRINGS.panelVoiceLabel
        );
      }
    }
    function open() {
      panel.hidden = false;
      _releaseFocus = trapFocus(panel);
      const closeBtn = panel.querySelector(".ms-a11y-close");
      if (closeBtn) closeBtn.focus();
    }
    function close() {
      outline.close({ restoreFocus: false });
      panel.hidden = true;
      if (_releaseFocus) {
        _releaseFocus();
        _releaseFocus = null;
      }
    }
    sync(state2);
    return {
      element: panel,
      open,
      close,
      sync,
      setSide,
      closeOutline: () => outline.close({ restoreFocus: false })
    };
  }

  // src/ui/sessionChrome.js
  var SLIDERS_ICON = `
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true" focusable="false">
    <line x1="4" y1="6" x2="20" y2="6"/>
    <line x1="4" y1="12" x2="20" y2="12"/>
    <line x1="4" y1="18" x2="20" y2="18"/>
    <circle cx="8" cy="6" r="2" fill="currentColor" stroke="none"/>
    <circle cx="14" cy="12" r="2" fill="currentColor" stroke="none"/>
    <circle cx="10" cy="18" r="2" fill="currentColor" stroke="none"/>
  </svg>`;
  function createSessionChrome({
    onToggleModoSimples,
    onOpenPanel,
    onSpeak,
    onToggleSimpleLanguage,
    onToggleHideImages,
    mount = {}
  }) {
    const chrome = document.createElement("div");
    chrome.id = "ms-simples-chrome";
    chrome.className = "ms-simples-chrome";
    chrome.innerHTML = `
    <div class="ms-simples-chrome-inner">
      <button type="button" class="ms-chrome-icon" data-action="open-panel"
        aria-label="${STRINGS.sessionOpenPanelLabel}" title="${STRINGS.sessionOpenPanelTitle}">
        ${SLIDERS_ICON}
      </button>
      <div class="ms-simples-toggle-wrap" data-active="false">
        <span class="ms-simples-spark" aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3.5l2.5 5.6 6 .6-4.5 4 1.3 6-5.3-3.1-5.3 3.1 1.3-6-4.5-4 6-.6z" fill="currentColor"/></svg></span>
        <div class="ms-simples-toggle-text">
          <strong>${STRINGS.sessionBrand}</strong>
          <span class="ms-simples-sub" data-sub>${STRINGS.sessionSubOff}</span>
        </div>
        <button type="button" class="ms-switch ms-chrome-switch" role="switch" aria-checked="false"
          data-action="toggle-simples" aria-label="${STRINGS.sessionSwitchLabel}">
          <span class="ms-switch-thumb"></span>
        </button>
      </div>
    </div>
  `;
    const bar = document.createElement("div");
    bar.id = "ms-session-bar";
    bar.className = "ms-session-bar";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", STRINGS.sessionBarLabel);
    bar.innerHTML = `
    <div class="ms-session-bar-inner" data-state="off">
      <div class="ms-session-off">
        <p><span aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3.5l2.5 5.6 6 .6-4.5 4 1.3 6-5.3-3.1-5.3 3.1 1.3-6-4.5-4 6-.6z" fill="currentColor"/></svg></span> ${STRINGS.sessionOffPrompt}</p>
        <button type="button" class="ms-session-btn ms-session-btn--dark" data-action="activate">${STRINGS.sessionActivate}</button>
      </div>
      <div class="ms-session-on" hidden>
        <div class="ms-session-on-top">
          <div class="ms-session-on-title" tabindex="-1">
            <span aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3.5l2.5 5.6 6 .6-4.5 4 1.3 6-5.3-3.1-5.3 3.1 1.3-6-4.5-4 6-.6z" fill="currentColor"/></svg></span>
            <strong>${STRINGS.sessionOnTitle}<span class="ms-sr-only">${STRINGS.sessionOnSrSuffix}</span></strong>
            <span class="ms-session-badge">${STRINGS.sessionBadge}</span>
          </div>
          <p class="ms-session-desc" data-session-desc>
            ${STRINGS.sessionDescSimple}
          </p>
        </div>
        <div class="ms-session-actions">
          <button type="button" class="ms-session-btn ms-session-btn--light" data-action="speak" aria-label="${STRINGS.sessionSpeakLabel}">
            <span aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg></span> <span data-speak-label>${STRINGS.sessionSpeakText}</span>
          </button>
          <button type="button" class="ms-session-btn ms-session-btn--dark" data-action="lang" aria-pressed="false">
            <span aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6"/><path d="M9 17h6"/></svg></span> <span class="ms-btn-pre">${STRINGS.sessionLangPre}</span>${STRINGS.sessionLangMain}<span class="ms-btn-post">: <span data-lang-label aria-hidden="true">${STRINGS.sessionLangOff}</span></span>
          </button>
          <button type="button" class="ms-session-btn ms-session-btn--dark" data-action="images" aria-pressed="false">
            <span aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m21 16-5-5-8 9"/></svg></span> ${STRINGS.sessionImages}<span class="ms-btn-post">: <span data-images-label aria-hidden="true">${STRINGS.sessionImagesHidden}</span></span>
          </button>
          <button type="button" class="ms-session-btn ms-session-btn--light" data-action="exit">${STRINGS.sessionExit}<span class="ms-btn-post">${STRINGS.sessionExitPost}</span></button>
        </div>
      </div>
    </div>
  `;
    _mountChrome(chrome, mount);
    _mountBar(bar, mount);
    chrome.querySelector('[data-action="toggle-simples"]').addEventListener("click", (e) => {
      const on2 = e.currentTarget.getAttribute("aria-checked") !== "true";
      onToggleModoSimples(on2);
    });
    chrome.querySelector('[data-action="open-panel"]').addEventListener("click", () => onOpenPanel());
    const focusIn = (selector) => {
      const el2 = bar.querySelector(selector);
      if (el2 && typeof el2.focus === "function") el2.focus();
    };
    bar.querySelector('[data-action="activate"]').addEventListener("click", () => {
      onToggleModoSimples(true);
      focusIn(".ms-session-on-title");
    });
    bar.querySelector('[data-action="exit"]').addEventListener("click", () => {
      onToggleModoSimples(false);
      focusIn('[data-action="activate"]');
    });
    bar.querySelector('[data-action="speak"]').addEventListener("click", () => onSpeak());
    bar.querySelector('[data-action="lang"]').addEventListener("click", (e) => {
      if (e.currentTarget.getAttribute("aria-disabled") === "true") return;
      const next = e.currentTarget.getAttribute("aria-pressed") !== "true";
      onToggleSimpleLanguage(next);
    });
    bar.querySelector('[data-action="images"]').addEventListener("click", (e) => {
      const showing = e.currentTarget.getAttribute("aria-pressed") === "true";
      const nextShow = !showing;
      if (typeof onToggleHideImages === "function") {
        onToggleHideImages(!nextShow);
      }
    });
    function sync(s, ui = {}) {
      var _a, _b;
      const on2 = !!s.modoSimples;
      const sw = chrome.querySelector('[data-action="toggle-simples"]');
      const wrap = chrome.querySelector(".ms-simples-toggle-wrap");
      const sub = chrome.querySelector("[data-sub]");
      if (sw) {
        sw.setAttribute("aria-checked", String(on2));
        sw.classList.toggle("ms-switch--on", on2);
      }
      if (wrap) wrap.setAttribute("data-active", String(on2));
      if (sub) sub.textContent = on2 ? STRINGS.sessionSubOn : STRINGS.sessionSubOff;
      _placeChrome(chrome, on2, mount);
      const inner = bar.querySelector(".ms-session-bar-inner");
      const off = bar.querySelector(".ms-session-off");
      const onBlock = bar.querySelector(".ms-session-on");
      if (inner) inner.setAttribute("data-state", on2 ? "on" : "off");
      if (off) off.hidden = on2;
      if (onBlock) onBlock.hidden = !on2;
      const langAvailable = hasSimpleLanguagePairs();
      const langOn = langAvailable && !!((_a = s.options) == null ? void 0 : _a.simpleLanguage);
      const langBtn = bar.querySelector('[data-action="lang"]');
      const langLabel = bar.querySelector("[data-lang-label]");
      const desc = bar.querySelector("[data-session-desc]");
      if (langBtn) {
        langBtn.setAttribute("aria-pressed", String(langOn));
        langBtn.setAttribute("aria-disabled", String(!langAvailable));
        langBtn.classList.toggle("ms-session-btn--active", langOn);
      }
      if (langLabel) {
        langLabel.setAttribute("aria-hidden", String(langAvailable));
        langLabel.textContent = !langAvailable ? STRINGS.sessionLangUnavailable : langOn ? STRINGS.sessionLangOn : STRINGS.sessionLangOff;
      }
      if (desc) {
        desc.textContent = langOn ? STRINGS.sessionDescSimple : STRINGS.sessionDescCalm;
      }
      const hideImgs = !!((_b = s.options) == null ? void 0 : _b.hideImages);
      const imgBtn = bar.querySelector('[data-action="images"]');
      const imgLabel = bar.querySelector("[data-images-label]");
      if (imgBtn) {
        imgBtn.setAttribute("aria-pressed", String(!hideImgs));
        imgBtn.classList.toggle("ms-session-btn--active", !hideImgs);
      }
      if (imgLabel)
        imgLabel.textContent = hideImgs ? STRINGS.sessionImagesHidden : STRINGS.sessionImagesVisible;
      if (ui.speaking !== void 0) {
        const speakBtn = bar.querySelector('[data-action="speak"]');
        const speakLabel = bar.querySelector("[data-speak-label]");
        if (speakBtn) {
          speakBtn.classList.toggle("ms-session-btn--speaking", ui.speaking);
          speakBtn.setAttribute(
            "aria-label",
            ui.speaking ? STRINGS.sessionStopLabel : STRINGS.sessionSpeakLabel
          );
        }
        if (speakLabel)
          speakLabel.textContent = ui.speaking ? STRINGS.sessionStopText : STRINGS.sessionSpeakText;
      }
    }
    function destroy() {
      chrome.remove();
      bar.remove();
    }
    return { sync, destroy };
  }
  function _resolve(selectors) {
    const list = Array.isArray(selectors) ? selectors : selectors ? [selectors] : [];
    for (const sel of list) {
      try {
        const el2 = document.querySelector(sel);
        if (el2) return el2;
      } catch (_) {
      }
    }
    return null;
  }
  function _moveChrome(chrome, parent, first = false) {
    if (chrome.parentElement === parent && (!first || parent.children[0] === chrome)) {
      return;
    }
    const focused = chrome.contains(document.activeElement) ? document.activeElement : null;
    if (first) parent.prepend(chrome);
    else parent.appendChild(chrome);
    if (!focused) return;
    focused.focus();
    if (document.activeElement !== focused && typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => focused.focus());
    }
  }
  function _mountChrome(chrome, mount) {
    chrome.classList.remove(
      "ms-simples-chrome--ms-nav",
      "ms-simples-chrome--fixed"
    );
    const host = _resolve(mount == null ? void 0 : mount.chrome);
    if (host) {
      _moveChrome(chrome, host);
    } else {
      chrome.classList.add("ms-simples-chrome--fixed");
      _moveChrome(chrome, document.body);
    }
  }
  function _placeChrome(chrome, modoOn, mount) {
    if (!modoOn) {
      _mountChrome(chrome, mount);
      return;
    }
    chrome.classList.remove("ms-simples-chrome--fixed");
    chrome.classList.add("ms-simples-chrome--ms-nav");
    const pillsNav = document.querySelector("[data-ms-pills]");
    if (pillsNav) {
      _moveChrome(chrome, pillsNav, true);
      return;
    }
    const barOnActions = document.querySelector(
      "#ms-session-bar .ms-session-actions"
    );
    if (barOnActions) {
      _moveChrome(chrome, barOnActions);
      return;
    }
    const barInner = document.querySelector(
      "#ms-session-bar .ms-session-bar-inner"
    );
    if (barInner) {
      _moveChrome(chrome, barInner);
      return;
    }
    chrome.classList.add("ms-simples-chrome--fixed");
    _moveChrome(chrome, document.body);
  }
  function _mountBar(bar, mount) {
    const anchor = _resolve(mount == null ? void 0 : mount.bar);
    if (anchor) {
      anchor.insertAdjacentElement("afterend", bar);
      const pills = document.querySelector("[data-ms-pills]");
      if (pills && bar.nextElementSibling !== pills) {
        bar.insertAdjacentElement("afterend", pills);
      }
      return;
    }
    document.body.prepend(bar);
  }

  // src/features/simpleNav.js
  var SAFE_SCHEMES = ["http", "https", "mailto", "tel"];
  function isSafeHref(href) {
    const compact = String(href).replace(/[\u0000- \u007f-\u009f]/g, "");
    const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(compact);
    return !scheme || SAFE_SCHEMES.includes(scheme[1].toLowerCase());
  }
  function normalizeSimpleNav(items) {
    if (!Array.isArray(items)) return [];
    return items.map((item) => {
      var _a, _b;
      if (!item || typeof item !== "object") return null;
      const label = String((_a = item.label) != null ? _a : "").trim();
      const href = String((_b = item.href) != null ? _b : "").trim();
      if (!label || !href || !isSafeHref(href)) return null;
      const short = item.short != null && String(item.short).trim() ? String(item.short).trim() : void 0;
      return short ? { label, href, short } : { label, href };
    }).filter(Boolean);
  }
  function findHostAuthoredPills() {
    const all = document.querySelectorAll("[data-ms-pills]");
    for (const el2 of all) {
      if (!el2.hasAttribute("data-ms-injected")) return el2;
    }
    return null;
  }
  function createSimpleNav() {
    let nav = null;
    function sync(items) {
      const list = normalizeSimpleNav(items);
      if (findHostAuthoredPills()) {
        destroy();
        return;
      }
      if (!list.length) {
        destroy();
        return;
      }
      if (!nav) {
        nav = document.createElement("nav");
        nav.className = "ms-pills-nav ms-simple-only";
        nav.setAttribute("data-ms-pills", "");
        nav.setAttribute("data-ms-injected", "");
        nav.setAttribute("aria-label", "Navega\xE7\xE3o do Modo Simples");
        const inner2 = document.createElement("div");
        inner2.className = "ms-pills-nav__inner";
        nav.appendChild(inner2);
        _mount(nav);
      }
      const inner = nav.querySelector(".ms-pills-nav__inner");
      if (!inner) return;
      const chrome = inner.querySelector("#ms-simples-chrome");
      if (chrome) chrome.remove();
      inner.innerHTML = "";
      for (const item of list) {
        const a = document.createElement("a");
        a.className = "ms-pill";
        a.setAttribute("href", item.href);
        a.href = item.href;
        if (item.short) {
          const full = document.createElement("span");
          full.className = "ms-pill__full";
          full.textContent = item.label;
          const short = document.createElement("span");
          short.className = "ms-pill__short";
          short.textContent = item.short;
          a.appendChild(full);
          a.appendChild(short);
        } else {
          a.textContent = item.label;
        }
        inner.appendChild(a);
      }
      if (chrome) inner.appendChild(chrome);
      _markCurrent(nav);
    }
    function destroy() {
      if (!nav) return;
      nav.remove();
      nav = null;
    }
    return { sync, destroy };
  }
  function _mount(nav) {
    const bar = document.getElementById("ms-session-bar");
    if (bar) {
      bar.insertAdjacentElement("afterend", nav);
      return;
    }
    const header = document.querySelector("header");
    if (header) {
      header.insertAdjacentElement("afterend", nav);
      return;
    }
    const chrome = document.getElementById("ms-simples-chrome");
    if (chrome) {
      chrome.insertAdjacentElement("afterend", nav);
      return;
    }
    document.body.prepend(nav);
  }
  function _markCurrent(nav) {
    const path = typeof location !== "undefined" && location.pathname || "";
    const file = path.split("/").pop() || "";
    const hrefFull = typeof location !== "undefined" && location.href || "";
    nav.querySelectorAll("a.ms-pill").forEach((a) => {
      a.removeAttribute("aria-current");
      const href = a.getAttribute("href") || "";
      if (!href || href === "#") return;
      try {
        const resolved = typeof location !== "undefined" ? new URL(href, location.href) : null;
        const match2 = resolved && resolved.href === hrefFull || href === file || href.endsWith("/" + file) || file && href.split("/").pop() === file;
        if (match2) a.setAttribute("aria-current", "page");
      } catch (_) {
        if (href === file) a.setAttribute("aria-current", "page");
      }
    });
  }

  // src/features/manualSelect.js
  var BANNER_ID = "ms-manual-select-banner";
  var HIGHLIGHT_ID = "ms-manual-select-highlight";
  var OVERLAY_CLASS = "ms-manual-select-active";
  var NOTICE_ID = "ms-low-confidence-notice";
  var CANDIDATE_SELECTOR = 'main, [role="main"], article, section, aside, div';
  var MIN_W = 120;
  var MIN_H = 60;
  var _noticePrev = null;
  var _banner = null;
  var _status = null;
  var _highlight = null;
  var _current = null;
  var _prevFocus = null;
  var _cancel = null;
  var _onClick = null;
  var _onKey = null;
  var _onPointer = null;
  var _onTouch = null;
  var _onOver = null;
  var _callbacks = null;
  var POINTER_EVENTS = [
    "pointerdown",
    "pointerup",
    "mousedown",
    "mouseup",
    "contextmenu"
  ];
  var TOUCH_EVENTS = ["touchstart", "touchend"];
  function escapeIdent(value) {
    if (typeof CSS !== "undefined" && CSS.escape) return CSS.escape(value);
    return String(value).replace(/([^\w-])/g, "\\$1");
  }
  function buildCssPath(el2) {
    if (!el2 || el2.nodeType !== 1) return "";
    if (el2.id) {
      return `#${escapeIdent(el2.id)}`;
    }
    const parts = [];
    let current = el2;
    const root = typeof document !== "undefined" ? document.documentElement : null;
    while (current && current.nodeType === 1 && current !== root) {
      let part = current.tagName.toLowerCase();
      if (current.id) {
        parts.unshift(`#${escapeIdent(current.id)}`);
        break;
      }
      const parent = current.parentElement;
      if (parent && parent.children) {
        const siblings = Array.from(parent.children).filter(
          (c) => c.tagName === current.tagName
        );
        if (siblings.length > 1) {
          const index = siblings.indexOf(current) + 1;
          part += `:nth-of-type(${index})`;
        }
      }
      parts.unshift(part);
      current = parent;
    }
    return parts.join(" > ");
  }
  function deepActiveElement() {
    var _a;
    let active = document.activeElement;
    while ((_a = active == null ? void 0 : active.shadowRoot) == null ? void 0 : _a.activeElement) {
      active = active.shadowRoot.activeElement;
    }
    return active;
  }
  function isOwnUi(el2) {
    var _a, _b, _c, _d, _e;
    return !!(((_a = el2 == null ? void 0 : el2.closest) == null ? void 0 : _a.call(el2, "#ms-container")) || ((_b = el2 == null ? void 0 : el2.closest) == null ? void 0 : _b.call(el2, `#${BANNER_ID}`)) || ((_c = el2 == null ? void 0 : el2.closest) == null ? void 0 : _c.call(el2, `#${NOTICE_ID}`)) || ((_d = el2 == null ? void 0 : el2.closest) == null ? void 0 : _d.call(el2, `#${HIGHLIGHT_ID}`)) || // chrome da lib no light DOM: barra de sessão, switch SIMPLES e pills (QA R34 MED-2)
    ((_e = el2 == null ? void 0 : el2.closest) == null ? void 0 : _e.call(
      el2,
      "#ms-session-bar, #ms-simples-chrome, .ms-pills-nav, [data-ms-pills]"
    )));
  }
  function isCandidate(el2) {
    if (!el2 || el2 === document.documentElement || el2 === document.body) {
      return false;
    }
    if (isOwnUi(el2)) return false;
    const r = el2.getBoundingClientRect();
    return r.width >= MIN_W && r.height >= MIN_H;
  }
  function describe(el2) {
    const tag = el2.tagName.toLowerCase();
    const name = el2.getAttribute("aria-label") || el2.id || (el2.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40);
    return name ? `${tag}: ${name}` : tag;
  }
  function setCurrent(el2) {
    _current = el2;
    if (!_highlight || !_status) return;
    if (!el2) {
      _highlight.style.display = "none";
      _status.textContent = "";
      return;
    }
    const r = el2.getBoundingClientRect();
    Object.assign(_highlight.style, {
      display: "block",
      top: `${r.top + window.scrollY}px`,
      left: `${r.left + window.scrollX}px`,
      width: `${r.width}px`,
      height: `${r.height}px`
    });
    _status.textContent = ` ${STRINGS.manualCurrent} ${describe(el2)}.`;
  }
  function cycleCandidate(step) {
    var _a;
    const list = Array.from(document.querySelectorAll(CANDIDATE_SELECTOR)).filter(
      isCandidate
    );
    const onCancel = document.activeElement === _cancel;
    const i = _current ? list.indexOf(_current) : -1;
    const goCancel = !list.length || !onCancel && step > 0 && i === list.length - 1 || !onCancel && step < 0 && i <= 0;
    if (goCancel) {
      setCurrent(null);
      _cancel == null ? void 0 : _cancel.focus();
      return;
    }
    const next = i < 0 ? step > 0 ? list[0] : list[list.length - 1] : list[(i + step + list.length) % list.length];
    (_a = next.scrollIntoView) == null ? void 0 : _a.call(next, { block: "nearest" });
    setCurrent(next);
    _banner == null ? void 0 : _banner.focus();
  }
  function confirmSelect(el2) {
    document.querySelectorAll("[data-ms-principal]").forEach((node) => {
      node.removeAttribute("data-ms-principal");
    });
    el2.setAttribute("data-ms-principal", "");
    const path = buildCssPath(el2);
    const cb = _callbacks == null ? void 0 : _callbacks.onSelect;
    stopManualSelect();
    if (cb) cb(el2, path);
  }
  function startManualSelect(opts = {}) {
    stopManualSelect();
    _callbacks = opts;
    let active = deepActiveElement();
    if ((!active || active === document.body) && (_noticePrev == null ? void 0 : _noticePrev.isConnected)) {
      active = _noticePrev;
    }
    _noticePrev = null;
    _prevFocus = active;
    _banner = document.createElement("div");
    _banner.id = BANNER_ID;
    _banner.setAttribute("role", "status");
    _banner.setAttribute("aria-live", "polite");
    _banner.tabIndex = -1;
    Object.assign(_banner.style, {
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      zIndex: "2147483646",
      padding: "0.85rem 1.25rem",
      background: "#0B2C5F",
      color: "#fff",
      fontFamily: "system-ui, sans-serif",
      fontSize: "0.95rem",
      fontWeight: "600",
      textAlign: "center",
      boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
      cursor: "default"
    });
    _banner.append(STRINGS.manualInstruction);
    _status = document.createElement("span");
    _banner.appendChild(_status);
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.textContent = STRINGS.manualCancel;
    cancelBtn.setAttribute("aria-label", STRINGS.manualCancelLabel);
    Object.assign(cancelBtn.style, {
      marginLeft: "1rem",
      padding: "0.3rem 0.75rem",
      minHeight: "44px",
      border: "1px solid rgba(255,255,255,0.5)",
      borderRadius: "6px",
      background: "transparent",
      color: "#fff",
      cursor: "pointer",
      font: "inherit",
      fontSize: "0.85rem"
    });
    cancelBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const cb = _callbacks == null ? void 0 : _callbacks.onCancel;
      stopManualSelect();
      if (cb) cb();
    });
    _banner.appendChild(cancelBtn);
    _cancel = cancelBtn;
    document.body.appendChild(_banner);
    _highlight = document.createElement("div");
    _highlight.id = HIGHLIGHT_ID;
    _highlight.setAttribute("aria-hidden", "true");
    Object.assign(_highlight.style, {
      display: "none",
      position: "absolute",
      zIndex: "2147483645",
      pointerEvents: "none",
      outline: "3px solid #F39200",
      outlineOffset: "-3px",
      background: "rgba(243, 146, 0, 0.12)"
    });
    document.documentElement.appendChild(_highlight);
    document.documentElement.classList.add(OVERLAY_CLASS);
    _banner.focus();
    _onClick = (e) => {
      if (isOwnUi(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const el2 = e.target;
      if (!el2 || el2 === document.documentElement || el2 === document.body) return;
      confirmSelect(el2);
    };
    _onKey = (e) => {
      var _a, _b, _c, _d;
      const inBanner = (_b = (_a = e.target) == null ? void 0 : _a.closest) == null ? void 0 : _b.call(_a, `#${BANNER_ID}`);
      const consume = () => {
        e.preventDefault();
        e.stopImmediatePropagation();
      };
      if (e.key === "Escape") {
        consume();
        const cb = _callbacks == null ? void 0 : _callbacks.onCancel;
        stopManualSelect();
        if (cb) cb();
        return;
      }
      if ((_d = (_c = e.target) == null ? void 0 : _c.closest) == null ? void 0 : _d.call(_c, "#ms-container")) return;
      if (e.key === "Tab") {
        consume();
        cycleCandidate(e.shiftKey ? -1 : 1);
      } else if (inBanner && e.target !== _banner) {
        return;
      } else if (e.key === "ArrowUp") {
        consume();
        const parent = _current == null ? void 0 : _current.parentElement;
        if (!_current) cycleCandidate(1);
        else if (parent && isCandidate(parent)) setCurrent(parent);
      } else if (e.key === "ArrowDown") {
        consume();
        if (!_current) cycleCandidate(1);
        else {
          const child = Array.from(_current.children).find(isCandidate);
          if (child) setCurrent(child);
        }
      } else if (e.key === "Enter") {
        consume();
        if (_current) confirmSelect(_current);
      }
    };
    _onPointer = (e) => {
      if (isOwnUi(e.target)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    _onTouch = (e) => {
      if (isOwnUi(e.target)) return;
      e.stopImmediatePropagation();
    };
    _onOver = (e) => {
      const el2 = e.target;
      if (el2 && !isOwnUi(el2) && el2 !== document.documentElement) setCurrent(el2);
    };
    document.addEventListener("click", _onClick, true);
    document.addEventListener("keydown", _onKey, true);
    document.addEventListener("mouseover", _onOver, true);
    for (const type of POINTER_EVENTS) {
      document.addEventListener(type, _onPointer, true);
    }
    for (const type of TOUCH_EVENTS) {
      document.addEventListener(type, _onTouch, { capture: true, passive: true });
    }
  }
  function showLowConfidenceNotice(opts = {}) {
    hideLowConfidenceNotice();
    queueMicrotask(() => {
      if (document.getElementById(NOTICE_ID)) _noticePrev = deepActiveElement();
    });
    const box = document.createElement("div");
    box.id = NOTICE_ID;
    box.setAttribute("data-ms-live", "");
    Object.assign(box.style, {
      position: "fixed",
      left: "0",
      right: "0",
      top: "0",
      // embaixo ficam o botão flutuante e a dica dele (QA T144 M1)
      zIndex: "2147483646",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.75rem",
      padding: "0.85rem 1.25rem",
      background: "#0B2C5F",
      color: "#fff",
      fontFamily: "system-ui, sans-serif",
      fontSize: "1rem",
      boxShadow: "0 4px 16px rgba(0,0,0,0.25)"
    });
    const msg = document.createElement("span");
    msg.setAttribute("role", "status");
    msg.setAttribute("aria-live", "polite");
    box.appendChild(msg);
    setTimeout(() => {
      msg.textContent = STRINGS.lowConfNotice;
    }, 50);
    const mk = (text, onClick) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = text;
      Object.assign(b.style, {
        minHeight: "44px",
        minWidth: "44px",
        padding: "0.5rem 1rem",
        border: "1px solid rgba(255,255,255,0.7)",
        borderRadius: "6px",
        background: "transparent",
        color: "#fff",
        cursor: "pointer",
        font: "inherit"
      });
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        onClick();
      });
      box.appendChild(b);
    };
    mk(STRINGS.lowConfChoose, () => {
      var _a;
      return (_a = opts.onChoose) == null ? void 0 : _a.call(opts);
    });
    mk(STRINGS.lowConfClose, hideLowConfidenceNotice);
    document.body.appendChild(box);
  }
  function hideLowConfidenceNotice() {
    var _a;
    (_a = document.getElementById(NOTICE_ID)) == null ? void 0 : _a.remove();
  }
  function isManualSelectActive() {
    return _onClick !== null;
  }
  function stopManualSelect() {
    var _a;
    hideLowConfidenceNotice();
    const wasActive = _onClick !== null;
    if (_onClick) {
      document.removeEventListener("click", _onClick, true);
      _onClick = null;
    }
    if (_onKey) {
      document.removeEventListener("keydown", _onKey, true);
      _onKey = null;
    }
    if (_onOver) {
      document.removeEventListener("mouseover", _onOver, true);
      _onOver = null;
    }
    if (_onPointer) {
      for (const type of POINTER_EVENTS) {
        document.removeEventListener(type, _onPointer, true);
      }
      _onPointer = null;
    }
    if (_onTouch) {
      for (const type of TOUCH_EVENTS) {
        document.removeEventListener(type, _onTouch, true);
      }
      _onTouch = null;
    }
    if (_banner == null ? void 0 : _banner.parentNode) {
      _banner.parentNode.removeChild(_banner);
    }
    if (_highlight == null ? void 0 : _highlight.parentNode) {
      _highlight.parentNode.removeChild(_highlight);
    }
    _banner = null;
    _status = null;
    _highlight = null;
    _cancel = null;
    _current = null;
    document.documentElement.classList.remove(OVERLAY_CLASS);
    _callbacks = null;
    if (wasActive && (_prevFocus == null ? void 0 : _prevFocus.isConnected)) (_a = _prevFocus.focus) == null ? void 0 : _a.call(_prevFocus);
    _prevFocus = null;
  }

  // src/features/shortcutsCard.js
  var CARD_ID = "ms-shortcuts-card";
  var DISMISS_KEY = "ms-shortcuts-dismissed";
  var _card = null;
  function dismissed() {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch (_) {
      return false;
    }
  }
  function setDismissed(on2) {
    try {
      if (on2) sessionStorage.setItem(DISMISS_KEY, "1");
      else sessionStorage.removeItem(DISMISS_KEY);
    } catch (_) {
    }
  }
  function pageAccessKeys() {
    const out = [];
    for (const el2 of document.querySelectorAll("[accesskey]")) {
      if (el2.closest("#ms-container, #" + CARD_ID)) continue;
      const key = (el2.getAttribute("accesskey") || "").trim();
      if (!key) continue;
      const name = (el2.getAttribute("aria-label") || el2.textContent || el2.getAttribute("title") || "").trim().replace(/\s+/g, " ").slice(0, 40);
      out.push({
        keys: `${STRINGS.shortcutAccessKeyPrefix}${key.toUpperCase()}`,
        text: name || key
      });
    }
    return out;
  }
  function el(tag, text, style) {
    const n = document.createElement(tag);
    if (text) n.textContent = text;
    if (style) {
      for (const [k, v] of Object.entries(style)) {
        n.style.setProperty(k, v, "important");
      }
    }
    return n;
  }
  function build(side) {
    const card = el("section", "", {
      position: "fixed",
      bottom: "16px",
      [side]: "16px",
      width: "280px",
      "max-width": "calc(100vw - 120px)",
      // não cobre o botão flutuante (56px + folgas) a 390px
      "box-sizing": "border-box",
      padding: "12px 14px",
      background: "#0B2C5F",
      color: "#fff",
      font: "400 15px/1.4 system-ui, sans-serif",
      "border-radius": "10px",
      "box-shadow": "0 4px 16px rgba(0,0,0,0.35)",
      "z-index": "2147483640"
    });
    card.id = CARD_ID;
    card.setAttribute("role", "region");
    card.setAttribute("aria-label", STRINGS.shortcutsTitle);
    card.append(
      el("h2", STRINGS.shortcutsTitle, {
        margin: "0 0 8px",
        font: "700 16px/1.3 system-ui, sans-serif",
        color: "#fff"
      })
    );
    const list = el("ul", "", {
      margin: "0 0 10px",
      padding: "0",
      "list-style": "none"
    });
    for (const s of [...SHORTCUTS, ...pageAccessKeys()]) {
      const li = el("li", "", { margin: "0 0 6px", color: "#fff" });
      li.append(
        el("kbd", s.keys, {
          display: "inline-block",
          padding: "1px 6px",
          margin: "0 6px 0 0",
          background: "#fff",
          color: "#0B2C5F",
          "border-radius": "4px",
          font: "700 14px/1.4 system-ui, sans-serif"
        }),
        document.createTextNode(s.text)
      );
      list.append(li);
    }
    const close = el("button", STRINGS.shortcutsClose, {
      "min-width": "44px",
      "min-height": "44px",
      padding: "0 16px",
      background: "#fff",
      color: "#0B2C5F",
      border: "0",
      "border-radius": "8px",
      font: "700 15px/1 system-ui, sans-serif",
      cursor: "pointer"
    });
    close.type = "button";
    close.addEventListener("click", () => {
      setDismissed(true);
      hide();
    });
    card.append(list, close);
    return card;
  }
  function hide() {
    _card == null ? void 0 : _card.remove();
    _card = null;
  }
  function startShortcutsCard({ side = "left" } = {}) {
    if (_card || dismissed()) return;
    _card = build(side);
    document.body.appendChild(_card);
  }
  function placeShortcutsCard(side) {
    if (!_card) return;
    _card.style.setProperty(
      side === "left" ? "right" : "left",
      "auto",
      "important"
    );
    _card.style.setProperty(side, "16px", "important");
  }
  function hideShortcutsCard() {
    hide();
  }
  function stopShortcutsCard() {
    setDismissed(false);
    hide();
  }

  // src/ui/binding.js
  var RESET_OPTIONS = {
    textScale: "100",
    colorTheme: "senac",
    colorSaturation: "normal",
    customText: "",
    customHeading: "",
    customBg: "",
    dyslexiaFont: false,
    readingRuler: false,
    highlightLinks: false,
    highlightHeadings: false,
    highlightControls: false,
    enlargeTargets: false,
    textMagnifier: false,
    textSpacing: false,
    lineHeight: 0,
    wordSpacing: 0,
    letterSpacing: 0,
    cursorStyle: "default",
    reducedMotion: false,
    hideImages: false,
    simpleLanguage: false,
    readFocus: false,
    blockFlashing: false,
    strongFocus: false,
    showShortcuts: false,
    muteMedia: false
  };
  var FONT_KEYS = [
    "textScale",
    "dyslexiaFont",
    "textSpacing",
    "lineHeight",
    "wordSpacing",
    "letterSpacing"
  ];
  function isEditableTarget(e) {
    const t = typeof e.composedPath === "function" ? e.composedPath()[0] : e.target;
    return !!(t && (t.isContentEditable || t.matches && t.matches(
      'input, select, textarea, [contenteditable]:not([contenteditable="false"])'
    )));
  }
  function buildUI(ms) {
    ms._host = document.createElement("div");
    ms._host.id = "ms-container";
    document.body.appendChild(ms._host);
    ms._shadow = ms._host.attachShadow({ mode: "open" });
    const styleEl = document.createElement("style");
    styleEl.textContent = getUIStyles(ms._config.position);
    ms._shadow.appendChild(styleEl);
    ms._styleEl = styleEl;
    const s = state_default.get();
    ms._panel = createA11yPanel({
      state: s,
      onClose: () => ms._closePanel(),
      onToggleModoSimples: (value) => ms._setModoSimples(value),
      onSetOption: (key, value) => {
        if (key === "reducedMotion") ms._reducedMotionUser = !!value;
        state_default.set({ options: { [key]: value } });
        if (key === "hideImages" && state_default.get().modoSimples) {
          ms._savePreferShowImages(!value);
        }
      },
      onSpeak: () => ms._toggleSpeak(),
      onResetAll: () => ms._resetAll(),
      onSelectProfile: (id) => ms._applyProfile(id),
      onResetFont: () => {
        state_default.set({
          options: Object.fromEntries(
            FONT_KEYS.map((k) => [k, RESET_OPTIONS[k]])
          )
        });
        announce(STRINGS.announceResetFont);
      },
      onMoveSide: () => ms._movePanelSide(),
      // F9c: o painel é modal (página inert): fecha o painel antes de mover o foco para o alvo
      onOutlineJump: (el2) => {
        ms._closePanel();
        jumpToElement(el2);
      },
      brand: ms._config.brand
    });
    ms._shadow.appendChild(ms._panel.element);
    ms._fab = createFab({
      onClick: () => ms._togglePanel(),
      onHide: () => ms._hideWidget()
    });
    ms._shadow.appendChild(ms._fab.element);
    ms._side = ms._loadPanelSide();
    ms._fab.setSide(ms._side);
    ms._panel.setSide(ms._side);
    ms._fab.sync({ panelOpen: s.panelOpen });
    ms._panel.sync(s);
    if (s.panelOpen) {
      ms._panel.open();
      ms._setPageInert(true);
    }
    ms._syncSessionChrome();
    ms._simpleNav = createSimpleNav();
    ms._syncSimpleNav();
    if (ms._chrome) ms._chrome.sync(s);
  }
  function syncSessionChrome(ms) {
    if (ms._config.sessionBar && !ms._chrome) {
      ms._chrome = createSessionChrome({
        mount: ms._config.mount || {},
        onToggleModoSimples: (value) => ms._setModoSimples(value),
        onOpenPanel: () => ms._openPanel(),
        onSpeak: () => ms._toggleSpeak(),
        onToggleSimpleLanguage: (value) => state_default.set({ options: { simpleLanguage: value } }),
        onToggleHideImages: (hide3) => {
          state_default.set({ options: { hideImages: hide3 } });
          if (state_default.get().modoSimples) ms._savePreferShowImages(!hide3);
        }
      });
      ms._chrome.sync(state_default.get());
    } else if (!ms._config.sessionBar && ms._chrome) {
      ms._chrome.destroy();
      ms._chrome = null;
    }
  }
  function syncSimpleNav(ms) {
    if (!ms._simpleNav) return;
    ms._simpleNav.sync(ms._config.simpleNav);
    if (ms._chrome) ms._chrome.sync(state_default.get());
  }
  function bindEvents(ms) {
    ms._onDocKeydown = (e) => {
      if (e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey && !e.repeat && e.code === "KeyA" && !isEditableTarget(e)) {
        e.preventDefault();
        ms._showWidget();
        return;
      }
      if (e.key === "Escape" && state_default.get().panelOpen) {
        ms._closePanel();
      }
    };
    document.addEventListener("keydown", ms._onDocKeydown);
    ms._onDocClick = (e) => {
      var _a, _b, _c, _d, _e;
      if (!state_default.get().panelOpen) return;
      if (isManualSelectActive()) return;
      if ((_b = (_a = e.target) == null ? void 0 : _a.closest) == null ? void 0 : _b.call(_a, "#ms-low-confidence-notice")) return;
      const path = typeof e.composedPath === "function" ? e.composedPath() : [];
      if (path.includes(ms._host) || path.includes((_c = ms._panel) == null ? void 0 : _c.element) || path.includes((_d = ms._fab) == null ? void 0 : _d.element)) {
        return;
      }
      if (e.target === ms._host) return;
      if (!((_e = ms._host) == null ? void 0 : _e.contains(e.target)) && e.target !== ms._host) {
        const { clientX, clientY } = e;
        const retargeted = e.target === document.body || e.target === document.documentElement;
        ms._closePanel();
        if (retargeted && e.isTrusted && e.detail > 0) {
          const alvo = document.elementFromPoint(clientX, clientY);
          if (alvo && alvo !== document.body && alvo !== document.documentElement) {
            alvo.click();
            if (alvo.matches(
              'input, select, textarea, [contenteditable]:not([contenteditable="false"])'
            )) {
              alvo.focus();
            }
          }
        }
      }
    };
    document.addEventListener("click", ms._onDocClick, true);
    ms._removeStateListener = eventBus_default.on("stateChange", ({ prev, next }) => {
      ms._onStateChange(prev, next);
    });
    ms._removeSpeakListener = onSpeakingChange(
      (speaking) => ms._syncSpeaking(speaking)
    );
  }
  function togglePanel(ms) {
    state_default.get().panelOpen ? ms._closePanel() : ms._openPanel();
  }
  function openPanel(ms) {
    var _a;
    let opener = document.activeElement;
    while ((_a = opener == null ? void 0 : opener.shadowRoot) == null ? void 0 : _a.activeElement) {
      opener = opener.shadowRoot.activeElement;
    }
    if (opener !== document.body && !ms._panel.element.contains(opener)) {
      ms._panelOpener = opener;
    }
    state_default.set({ panelOpen: true });
    ms._panel.open();
    ms._setPageInert(true);
    ms._fab.sync({ panelOpen: true });
    announce("Painel de acessibilidade aberto");
  }
  function setPageInert(ms, on2) {
    var _a;
    (_a = ms._inertObserver) == null ? void 0 : _a.disconnect();
    ms._inertObserver = null;
    for (const el2 of ms._inerted || []) el2.removeAttribute("inert");
    ms._inerted = [];
    if (!on2) return;
    for (const el2 of document.body.children) ms._inertSibling(el2);
    ms._inertObserver = new MutationObserver((records) => {
      for (const r of records) {
        for (const n of r.addedNodes) {
          if (n.nodeType === 1) ms._inertSibling(n);
        }
      }
    });
    ms._inertObserver.observe(document.body, { childList: true });
  }
  function inertSibling(ms, el2) {
    if (el2 === ms._host || el2.hasAttribute("inert") || el2.hasAttribute("aria-live") || el2.hasAttribute("data-ms-live") || el2.id === "ms-manual-select-banner" || el2.id === "ms-manual-select-highlight") {
      return;
    }
    el2.setAttribute("inert", "");
    ms._inerted.push(el2);
  }
  function closePanel(ms) {
    var _a, _b, _c;
    state_default.set({ panelOpen: false });
    ms._panel.close();
    ms._setPageInert(false);
    ms._fab.sync({ panelOpen: false });
    if (!isManualSelectActive()) {
      const opener = ((_a = ms._panelOpener) == null ? void 0 : _a.isConnected) ? ms._panelOpener : (_b = ms._fab) == null ? void 0 : _b.button;
      (_c = opener == null ? void 0 : opener.focus) == null ? void 0 : _c.call(opener);
    }
    ms._panelOpener = null;
  }
  function toggleSpeak() {
    if (isSpeaking()) {
      stopSpeaking();
      announce("Leitura interrompida");
    } else {
      speakMainContent();
      announce("Lendo conte\xFAdo principal");
    }
  }
  function syncSpeaking(ms, speaking) {
    const s = state_default.get();
    if (ms._panel) ms._panel.sync(s, { speaking });
    if (ms._chrome) ms._chrome.sync(s, { speaking });
  }
  function resetAll(ms) {
    var _a, _b;
    (_b = (_a = ms._panel) == null ? void 0 : _a.closeOutline) == null ? void 0 : _b.call(_a);
    ms._reducedMotionUser = null;
    ms._applyingProfile = true;
    try {
      if (state_default.get().modoSimples) ms._setModoSimples(false);
      state_default.set({
        activeProfile: null,
        profileCustom: false,
        options: { ...RESET_OPTIONS }
      });
      ms._syncReducedMotion();
    } finally {
      ms._applyingProfile = false;
    }
    if (ms._config.persistence) {
      if (ms._config.hostnamePersistence) {
        persistence_default.removeForHost("preferShowImagesInMs");
      } else {
        persistence_default.remove("preferShowImagesInMs");
      }
    }
    announce(STRINGS.announceResetAll);
  }
  function applyProfile(ms, id) {
    const turnOff = state_default.get().activeProfile === id;
    const prof = turnOff ? null : getProfile(id);
    if (!turnOff && !prof) return;
    ms._applyingProfile = true;
    try {
      ms._reducedMotionUser = (prof == null ? void 0 : prof.options.reducedMotion) ? true : null;
      if (state_default.get().modoSimples) ms._setModoSimples(false);
      state_default.set({
        activeProfile: prof ? prof.id : null,
        profileCustom: false,
        options: { ...RESET_OPTIONS, ...prof ? prof.options : {} }
      });
      ms._syncReducedMotion();
      if (prof == null ? void 0 : prof.modoSimples) ms._setModoSimples(true);
    } finally {
      ms._applyingProfile = false;
    }
    ms._profileBaseline = state_default.get();
    announce(
      prof ? `${STRINGS.profileOnPre}${STRINGS[`profile${prof.key}Name`]}${STRINGS.profileOnPost}` : STRINGS.profileOff
    );
  }
  function movePanelSide(ms) {
    ms._side = ms._side === "left" ? "right" : "left";
    ms._fab.setSide(ms._side);
    ms._panel.setSide(ms._side);
    ms._savePanelSide(ms._side);
    placeShortcutsCard(ms._shortcutsSide());
    announce(ms._side === "left" ? STRINGS.announceSideLeft : STRINGS.announceSideRight);
  }
  function hideWidget(ms) {
    var _a, _b;
    if (state_default.get().panelOpen) ms._closePanel();
    ms._fab.setHidden(true);
    const main = document.querySelector('main, [role="main"]');
    if (main) {
      const had = main.hasAttribute("tabindex");
      if (!had) main.setAttribute("tabindex", "-1");
      main.addEventListener(
        "blur",
        () => {
          if (!had) main.removeAttribute("tabindex");
        },
        { once: true }
      );
      main.focus({ preventScroll: true });
    } else {
      (_b = (_a = document.activeElement) == null ? void 0 : _a.blur) == null ? void 0 : _b.call(_a);
    }
    announce(STRINGS.announceWidgetHidden);
  }
  function showWidget(ms) {
    ms._fab.setHidden(false);
    if (!state_default.get().panelOpen) ms._openPanel();
  }

  // src/heuristics/distractionDetector.js
  function detectDistractions(mainElement, config = defaults_default) {
    const distractions = [];
    const isMsChrome = (el2) => {
      var _a, _b;
      if (!el2 || !el2.id && !el2.getAttribute) return false;
      if (el2.id === "ms-container" || el2.id === "ms-session-bar" || el2.id === "ms-simples-chrome") {
        return true;
      }
      if ((_a = el2.hasAttribute) == null ? void 0 : _a.call(el2, "data-ms-pills")) return true;
      if ((_b = el2.closest) == null ? void 0 : _b.call(
        el2,
        "#ms-container, #ms-session-bar, #ms-simples-chrome, [data-ms-pills]"
      )) {
        return true;
      }
      return false;
    };
    const seen = /* @__PURE__ */ new Set();
    for (const el2 of queryAll(config.distractionSelectors)) {
      if (isMsChrome(el2)) continue;
      if (mainElement && el2.contains(mainElement)) continue;
      if (mainElement && mainElement.contains(el2)) continue;
      if (!seen.has(el2)) {
        seen.add(el2);
        distractions.push(el2);
      }
    }
    return distractions;
  }

  // src/mutator/domMutator.js
  var PAGE_STYLE_ID = "ms-page-styles";
  var LEXEND_LINK_ID = "ms-lexend-font";
  var TEXT_SCALE_CLASSES = [
    "ms-text-scale-100",
    "ms-text-scale-125",
    "ms-text-scale-150",
    "ms-text-scale-175"
  ];
  var THEME_CLASSES = [
    "ms-theme-senac",
    "ms-theme-yellowBlack",
    "ms-theme-darkHigh",
    "ms-theme-soft",
    "ms-theme-mono",
    "ms-theme-lightHigh"
  ];
  var CUSTOM_COLORS2 = {
    text: ["ms-custom-text", "--ms-custom-text"],
    heading: ["ms-custom-heading", "--ms-custom-heading"],
    bg: ["ms-custom-bg", "--ms-custom-bg"],
    link: ["ms-custom-link", "--ms-custom-link"]
  };
  var TYPO_VARS = {
    lineHeight: ["ms-lh", "--ms-lh", ""],
    wordSpacing: ["ms-ws", "--ms-ws", "em"],
    letterSpacing: ["ms-ls", "--ms-ls", "em"]
  };
  var OPTION_FLAG_CLASSES = [
    "ms-sat-low",
    "ms-sat-high",
    "ms-cursor-white",
    "ms-cursor-black",
    ...Object.values(CUSTOM_COLORS2).map(([cls]) => cls),
    ...Object.values(TYPO_VARS).map(([cls]) => cls),
    "ms-dyslexia-font",
    "ms-highlight-links",
    "ms-highlight-headings",
    "ms-highlight-controls",
    "ms-enlarge-targets",
    "ms-text-spacing",
    "ms-reduced-motion",
    "ms-block-flashing",
    "ms-strong-focus",
    "ms-hide-images",
    "ms-reading-ruler",
    "ms-simple-language"
  ];
  var _mainElement = null;
  var _distractionElements = [];
  var _manualPrincipal = null;
  var _manualPath = "";
  var _holdPrincipal = false;
  function holdPrincipal(on2) {
    _holdPrincipal = !!on2;
  }
  function injectPageStyles(css = "") {
    if (!css || document.getElementById(PAGE_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = PAGE_STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }
  var DEFAULT_LEXEND_URL = "https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap";
  var _fontUrl = null;
  function setLexendFontUrl(url) {
    _fontUrl = url === void 0 ? null : url;
  }
  function ensureLexendFont() {
    if (typeof document === "undefined") return;
    if (_fontUrl === false) return;
    if (document.getElementById(LEXEND_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = LEXEND_LINK_ID;
    link.rel = "stylesheet";
    link.crossOrigin = "anonymous";
    link.referrerPolicy = "no-referrer";
    link.href = _fontUrl || DEFAULT_LEXEND_URL;
    document.head.appendChild(link);
  }
  function scan(config) {
    const result = detectMainContent(config);
    _mainElement = result.element;
    _distractionElements = detectDistractions(_mainElement, config);
    return { mainElement: _mainElement, confidence: result.confidence };
  }
  function setHostCursor(on2) {
    var _a;
    const host = (_a = document.querySelector) == null ? void 0 : _a.call(document, "#ms-container");
    if (!host) return;
    if (on2) host.setAttribute("data-ms-cursor", "");
    else host.removeAttribute("data-ms-cursor");
  }
  function setHostFlag(name, on2) {
    var _a;
    const host = (_a = document.querySelector) == null ? void 0 : _a.call(document, "#ms-container");
    if (!host) return;
    if (on2) host.setAttribute(name, "");
    else host.removeAttribute(name);
  }
  function applyOptions(state2) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const html = document.documentElement;
    const opts = state2.options || {};
    html.classList.remove(...TEXT_SCALE_CLASSES);
    const scale = opts.textScale || "100";
    if (scale !== "100") html.classList.add(`ms-text-scale-${scale}`);
    html.classList.remove(...THEME_CLASSES);
    const theme = opts.colorTheme || "senac";
    html.classList.add(`ms-theme-${theme}`);
    html.classList.toggle("ms-sat-low", opts.colorSaturation === "low");
    html.classList.toggle("ms-sat-high", opts.colorSaturation === "high");
    html.classList.toggle("ms-cursor-white", opts.cursorStyle === "bigWhite");
    html.classList.toggle("ms-cursor-black", opts.cursorStyle === "bigBlack");
    setHostCursor(
      opts.cursorStyle === "bigWhite" || opts.cursorStyle === "bigBlack"
    );
    const eff = effectiveColors(opts);
    for (const [key, [cls, prop]] of Object.entries(CUSTOM_COLORS2)) {
      const on2 = !!eff[key];
      html.classList.toggle(cls, on2);
      if (on2) (_b = (_a = html.style) == null ? void 0 : _a.setProperty) == null ? void 0 : _b.call(_a, prop, eff[key]);
      else (_d = (_c = html.style) == null ? void 0 : _c.removeProperty) == null ? void 0 : _d.call(_c, prop);
    }
    html.classList.toggle("ms-dyslexia-font", !!opts.dyslexiaFont);
    if (opts.dyslexiaFont) ensureLexendFont();
    html.classList.toggle("ms-highlight-links", !!opts.highlightLinks);
    html.classList.toggle("ms-highlight-headings", !!opts.highlightHeadings);
    html.classList.toggle("ms-highlight-controls", !!opts.highlightControls);
    html.classList.toggle("ms-enlarge-targets", !!opts.enlargeTargets);
    html.classList.toggle("ms-text-spacing", !!opts.textSpacing);
    for (const [key, [cls, prop, unit]] of Object.entries(TYPO_VARS)) {
      const v = clampTypo(key, opts[key]);
      html.classList.toggle(cls, v > 0);
      if (v > 0) (_f = (_e = html.style) == null ? void 0 : _e.setProperty) == null ? void 0 : _f.call(_e, prop, `${v}${unit}`);
      else (_h = (_g = html.style) == null ? void 0 : _g.removeProperty) == null ? void 0 : _h.call(_g, prop);
    }
    html.classList.toggle("ms-reduced-motion", !!opts.reducedMotion);
    html.classList.toggle("ms-block-flashing", !!opts.blockFlashing);
    html.classList.toggle("ms-strong-focus", !!opts.strongFocus);
    setHostFlag("data-ms-noflash", !!opts.blockFlashing);
    html.classList.toggle("ms-hide-images", !!opts.hideImages);
    html.classList.toggle("ms-reading-ruler", !!opts.readingRuler);
    html.classList.toggle("ms-simple-language", !!opts.simpleLanguage);
  }
  function applyModoSimples(state2, config) {
    if (!_mainElement) scan(config);
    if (_mainElement) _mainElement.setAttribute("data-ms-principal", "");
    _distractionElements.forEach(
      (el2) => el2.setAttribute("data-ms-hidden", "true")
    );
    document.documentElement.classList.add("ms-ativo");
    applyOptions(state2);
  }
  function revertModoSimples() {
    document.querySelectorAll('[data-ms-hidden="true"]').forEach((el2) => {
      el2.removeAttribute("data-ms-hidden");
    });
    document.querySelectorAll("[data-ms-principal]").forEach((el2) => {
      el2.removeAttribute("data-ms-principal");
    });
    document.documentElement.classList.remove("ms-ativo");
    _mainElement = null;
    _distractionElements = [];
    _manualPrincipal = null;
    _manualPath = "";
    _holdPrincipal = false;
  }
  function revert() {
    var _a, _b;
    revertModoSimples();
    setHostCursor(false);
    setHostFlag("data-ms-noflash", false);
    document.documentElement.classList.remove(
      ...TEXT_SCALE_CLASSES,
      ...THEME_CLASSES,
      ...OPTION_FLAG_CLASSES
    );
    for (const [, prop] of [
      ...Object.values(CUSTOM_COLORS2),
      ...Object.values(TYPO_VARS)
    ]) {
      (_b = (_a = document.documentElement.style) == null ? void 0 : _a.removeProperty) == null ? void 0 : _b.call(_a, prop);
    }
  }
  function setPrincipal(el2, config) {
    document.querySelectorAll("[data-ms-principal]").forEach((node) => {
      node.removeAttribute("data-ms-principal");
    });
    _mainElement = el2;
    _manualPrincipal = el2;
    _manualPath = buildCssPath(el2);
    _holdPrincipal = false;
    el2.setAttribute("data-ms-principal", "");
    _distractionElements = detectDistractions(_mainElement, config);
    document.querySelectorAll('[data-ms-hidden="true"]').forEach((node) => {
      node.removeAttribute("data-ms-hidden");
    });
    _distractionElements.forEach(
      (node) => node.setAttribute("data-ms-hidden", "true")
    );
  }
  function reprocess(state2, config) {
    if (!state2.modoSimples) {
      applyOptions(state2);
      return;
    }
    if (_holdPrincipal || isManualSelectActive()) {
      applyOptions(state2);
      return;
    }
    const manual = findManualPrincipal();
    revertModoSimples();
    if (manual) {
      setPrincipal(manual, config);
      document.documentElement.classList.add("ms-ativo");
      applyOptions(state2);
      return;
    }
    scan(config);
    applyModoSimples(state2, config);
  }
  function findManualPrincipal() {
    if (!_manualPrincipal) return null;
    if (document.contains(_manualPrincipal)) return _manualPrincipal;
    if (!_manualPath) return null;
    try {
      return document.querySelector(_manualPath);
    } catch (_) {
      return null;
    }
  }

  // src/mutator/domObserver.js
  var OWN_SELECTOR = [
    "#ms-container",
    "#ms-session-bar",
    "#ms-simples-chrome",
    "#ms-manual-select-banner",
    "#ms-reading-ruler",
    "#ms-text-magnifier",
    "[data-ms-media-badge]",
    "#ms-shortcuts-card",
    "[data-ms-pills][data-ms-injected]",
    "[data-ms-live]"
  ].join(",");
  function isOwnNode(node) {
    return !!node && node.nodeType === 1 && typeof node.closest === "function" && !!node.closest(OWN_SELECTOR);
  }
  function isRelevantMutation(m) {
    if (m.type !== "childList" || m.addedNodes.length === 0) return false;
    if (isOwnNode(m.target)) return false;
    for (const node of m.addedNodes) {
      if (!isOwnNode(node)) return true;
    }
    return false;
  }
  var _observer = null;
  var _debounceTimer = null;
  var _pendingSince = 0;
  var _idleHandle = null;
  var DEFAULT_DEBOUNCE = 300;
  var DEFAULT_MAX_WAIT = 1500;
  function schedule(run, debounce, maxWait) {
    const now = Date.now();
    if (_debounceTimer === null) _pendingSince = now;
    clearTimeout(_debounceTimer);
    const remaining = Math.max(0, maxWait - (now - _pendingSince));
    _debounceTimer = setTimeout(
      () => {
        _debounceTimer = null;
        runWhenIdle(run);
      },
      Math.min(debounce, remaining)
    );
  }
  function runWhenIdle(fn) {
    if (typeof requestIdleCallback === "function") {
      _idleHandle = requestIdleCallback(
        () => {
          _idleHandle = null;
          fn();
        },
        { timeout: 500 }
      );
    } else {
      fn();
    }
  }
  function startObserving(getState, config) {
    if (_observer) return;
    const getConfig = () => typeof config === "function" ? config() : config;
    _observer = new MutationObserver((mutations) => {
      var _a, _b;
      if (!mutations.some(isRelevantMutation)) return;
      const state2 = getState();
      if (!state2.modoSimples) return;
      const cfg = getConfig();
      schedule(
        () => {
          if (_observer) reprocess(getState(), getConfig());
        },
        (_a = cfg.reprocessDebounce) != null ? _a : DEFAULT_DEBOUNCE,
        (_b = cfg.reprocessMaxWait) != null ? _b : DEFAULT_MAX_WAIT
      );
    });
    _observer.observe(document.body, { childList: true, subtree: true });
  }
  function stopObserving() {
    if (_observer) {
      _observer.disconnect();
      _observer = null;
    }
    clearTimeout(_debounceTimer);
    _debounceTimer = null;
    if (_idleHandle !== null && typeof cancelIdleCallback === "function") {
      cancelIdleCallback(_idleHandle);
    }
    _idleHandle = null;
  }

  // src/features/readingRuler.js
  var RULER_ID = "ms-reading-ruler";
  var RULER_HEIGHT = 48;
  var _ruler = null;
  var _raf = null;
  var _pendingY = 0;
  var _onPointer2 = null;
  var _onTouch2 = null;
  var _onFocus = null;
  function moveTo(clientY) {
    _pendingY = clientY;
    if (_raf !== null) return;
    _raf = requestAnimationFrame(() => {
      _raf = null;
      if (!_ruler) return;
      const y = _pendingY - RULER_HEIGHT / 2;
      _ruler.style.transform = `translateY(${Math.max(0, y)}px)`;
      _ruler.style.visibility = "visible";
    });
  }
  function startReadingRuler() {
    if (_ruler) return;
    _ruler = document.createElement("div");
    _ruler.id = RULER_ID;
    _ruler.setAttribute("aria-hidden", "true");
    Object.assign(_ruler.style, {
      position: "fixed",
      left: "0",
      right: "0",
      top: "0",
      height: `${RULER_HEIGHT}px`,
      pointerEvents: "none",
      zIndex: "2147483646",
      background: "rgba(245, 166, 35, 0.22)",
      borderTop: "2px solid #F5A623",
      borderBottom: "2px solid #F5A623",
      boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.35)",
      transform: "translateY(-100%)",
      transition: "none",
      // sem posição conhecida não há janela: não escurece a página (IMP-08)
      visibility: "hidden"
    });
    document.documentElement.appendChild(_ruler);
    _onPointer2 = (e) => moveTo(e.clientY);
    _onTouch2 = (e) => {
      var _a;
      const t = (_a = e.touches) == null ? void 0 : _a[0];
      if (t) moveTo(t.clientY);
    };
    _onFocus = (e) => {
      const el2 = e.target;
      if (!(el2 == null ? void 0 : el2.getBoundingClientRect) || el2 === document.body) return;
      const r = el2.getBoundingClientRect();
      moveTo(r.top + r.height / 2);
    };
    document.addEventListener("pointermove", _onPointer2, { passive: true });
    document.addEventListener("touchstart", _onTouch2, { passive: true });
    document.addEventListener("touchmove", _onTouch2, { passive: true });
    document.addEventListener("focusin", _onFocus);
  }
  function stopReadingRuler() {
    if (_onPointer2) {
      document.removeEventListener("pointermove", _onPointer2);
      _onPointer2 = null;
    }
    if (_onTouch2) {
      document.removeEventListener("touchstart", _onTouch2);
      document.removeEventListener("touchmove", _onTouch2);
      _onTouch2 = null;
    }
    if (_onFocus) {
      document.removeEventListener("focusin", _onFocus);
      _onFocus = null;
    }
    if (_raf !== null) {
      cancelAnimationFrame(_raf);
      _raf = null;
    }
    if (_ruler == null ? void 0 : _ruler.parentNode) {
      _ruler.parentNode.removeChild(_ruler);
    }
    _ruler = null;
  }

  // src/features/mediaMute.js
  var OWN_HOST = "#ms-container";
  var BADGE_ATTR = "data-ms-media-badge";
  var MEDIA_SELECTOR = "video, audio";
  var VIDEO_HOSTS = /(^|\.)(youtube\.com|youtube-nocookie\.com|youtu\.be|vimeo\.com|dailymotion\.com|twitch\.tv|tiktok\.com|wistia\.com|wistia\.net|jwplatform\.com|brightcove\.net)$/i;
  var _prior = /* @__PURE__ */ new WeakMap();
  var _tracked = /* @__PURE__ */ new Set();
  var _badges = /* @__PURE__ */ new Map();
  var _observer2 = null;
  var _on2 = false;
  var _roots = /* @__PURE__ */ new Set();
  var userActive = () => {
    var _a;
    return !!((_a = navigator.userActivation) == null ? void 0 : _a.isActive);
  };
  function isOwn(el2) {
    var _a;
    return !!((_a = el2.closest) == null ? void 0 : _a.call(el2, `${OWN_HOST}, [${BADGE_ATTR}]`));
  }
  function walk(root, visit) {
    const els = root.nodeType === 1 ? [root, ...root.querySelectorAll("*")] : Array.from(root.querySelectorAll("*"));
    for (const el2 of els) {
      if (el2.id === "ms-container" || isOwn(el2)) continue;
      visit(el2);
      if (el2.shadowRoot) {
        if (_on2) watchRoot(el2.shadowRoot);
        walk(el2.shadowRoot, visit);
      }
    }
  }
  function watchRoot(sr) {
    if (_roots.has(sr)) return;
    _roots.add(sr);
    _observer2 == null ? void 0 : _observer2.observe(sr, { childList: true, subtree: true });
    sr.addEventListener("play", onPlay, true);
    sr.addEventListener("volumechange", onVolume, true);
  }
  function muteOne(el2) {
    if (!_prior.has(el2)) {
      _prior.set(el2, el2.muted);
      _tracked.add(new WeakRef(el2));
    }
    el2.muted = true;
    el2.removeAttribute("autoplay");
    el2.autoplay = false;
    if (!el2.paused) el2.pause();
  }
  function restoreMedia() {
    for (const ref of _tracked) {
      const el2 = ref.deref();
      if (el2 && _prior.has(el2)) {
        el2.muted = _prior.get(el2);
        _prior.delete(el2);
      }
    }
    _tracked.clear();
  }
  function isForeignVideoFrame(el2) {
    if (el2.tagName !== "IFRAME") return false;
    let u;
    try {
      u = new URL(el2.getAttribute("src") || "", location.href);
    } catch (_) {
      return false;
    }
    if (u.origin === location.origin) return false;
    return VIDEO_HOSTS.test(u.hostname) || /autoplay/i.test(el2.getAttribute("allow") || "");
  }
  function placeBadge(frame, badge) {
    const r = frame.getBoundingClientRect();
    Object.assign(badge.style, {
      top: `${r.top + window.scrollY + 8}px`,
      left: `${r.left + window.scrollX + 8}px`,
      maxWidth: `${Math.max(120, r.width - 16)}px`
    });
  }
  function badgeFor(frame) {
    if (_badges.has(frame)) return;
    const r = frame.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const badge = document.createElement("div");
    badge.setAttribute(BADGE_ATTR, "");
    badge.setAttribute("role", "note");
    badge.textContent = STRINGS.mediaOtherSiteNotice;
    Object.assign(badge.style, {
      position: "absolute",
      zIndex: "2147483644",
      pointerEvents: "none",
      // não bloqueia cliques no vídeo
      padding: "0.5rem 0.75rem",
      background: "#0B2C5F",
      color: "#fff",
      font: "600 0.9rem/1.3 system-ui, sans-serif",
      borderRadius: "6px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
    });
    document.body.appendChild(badge);
    placeBadge(frame, badge);
    _badges.set(frame, badge);
  }
  function scan2(root) {
    walk(root, (el2) => {
      var _a;
      if ((_a = el2.matches) == null ? void 0 : _a.call(el2, MEDIA_SELECTOR)) muteOne(el2);
      else if (isForeignVideoFrame(el2)) badgeFor(el2);
    });
  }
  function relayout() {
    for (const [frame, badge] of _badges) {
      if (frame.isConnected) placeBadge(frame, badge);
      else {
        badge.remove();
        _badges.delete(frame);
      }
    }
  }
  function onPlay(e) {
    var _a;
    const el2 = e.target;
    if (!((_a = el2 == null ? void 0 : el2.matches) == null ? void 0 : _a.call(el2, MEDIA_SELECTOR)) || isOwn(el2)) return;
    if (!_prior.has(el2)) {
      _prior.set(el2, el2.muted);
      _tracked.add(new WeakRef(el2));
    }
    el2.muted = true;
    if (!userActive()) el2.pause();
  }
  function onVolume(e) {
    var _a;
    const el2 = e.target;
    if (!((_a = el2 == null ? void 0 : el2.matches) == null ? void 0 : _a.call(el2, MEDIA_SELECTOR)) || isOwn(el2)) return;
    if (!el2.muted && !userActive()) el2.muted = true;
    else if (!el2.muted) _prior.delete(el2);
  }
  function startMediaMute() {
    if (_on2) return;
    _on2 = true;
    document.addEventListener("play", onPlay, true);
    document.addEventListener("volumechange", onVolume, true);
    window.addEventListener("resize", relayout);
    _observer2 = new MutationObserver((records) => {
      for (const r of records) {
        for (const n of r.addedNodes) {
          if (n.nodeType === 1 && !isOwn(n)) scan2(n);
        }
      }
      relayout();
    });
    _observer2.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
    scan2(document);
  }
  function stopMediaMute() {
    if (!_on2) return;
    _on2 = false;
    _observer2 == null ? void 0 : _observer2.disconnect();
    _observer2 = null;
    document.removeEventListener("play", onPlay, true);
    document.removeEventListener("volumechange", onVolume, true);
    for (const sr of _roots) {
      sr.removeEventListener("play", onPlay, true);
      sr.removeEventListener("volumechange", onVolume, true);
    }
    _roots.clear();
    window.removeEventListener("resize", relayout);
    for (const badge of _badges.values()) badge.remove();
    _badges.clear();
    restoreMedia();
  }

  // src/features/flashBlock.js
  var OWN_HOST2 = "#ms-container";
  var STILL_ATTR = "data-ms-gif-still";
  var MEDIA_SELECTOR2 = "video";
  var COPY_STYLE = [
    "margin",
    "float",
    "borderRadius",
    "border",
    "boxSizing",
    "verticalAlign",
    "top",
    "left",
    "right",
    "bottom"
  ];
  var _stills = /* @__PURE__ */ new Map();
  var _revealed = /* @__PURE__ */ new WeakSet();
  var _marquees = /* @__PURE__ */ new Set();
  var _autoplayed = /* @__PURE__ */ new Set();
  var _observer3 = null;
  var _on3 = false;
  var isOwn2 = (el2) => {
    var _a;
    return !!((_a = el2.closest) == null ? void 0 : _a.call(el2, OWN_HOST2));
  };
  var userActive2 = () => {
    var _a;
    return !!((_a = navigator.userActivation) == null ? void 0 : _a.isActive);
  };
  function isGif(img) {
    const src = img.currentSrc || img.getAttribute("src") || "";
    if (/^data:image\/gif/i.test(src)) return true;
    try {
      return /\.gif$/i.test(new URL(src, location.href).pathname);
    } catch (_) {
      return false;
    }
  }
  function reveal(btn) {
    var _a;
    const img = _stills.get(btn);
    if (!img) return;
    _revealed.add(img);
    _stills.delete(btn);
    btn.replaceWith(img);
    if (!img.hasAttribute("tabindex")) {
      img.setAttribute("tabindex", "-1");
      img.addEventListener("blur", () => img.removeAttribute("tabindex"), {
        once: true
      });
    }
    (_a = img.focus) == null ? void 0 : _a.call(img, { preventScroll: true });
  }
  function freeze2(img) {
    if (!_on3 || _revealed.has(img) || !img.isConnected || isOwn2(img)) return;
    if (!img.complete || !img.naturalWidth) return;
    const rect = img.getBoundingClientRect();
    const w = Math.round(rect.width || img.naturalWidth);
    const h = Math.round(rect.height || img.naturalHeight);
    const cs = getComputedStyle(img);
    const interactive = !img.closest('a, button, [role="button"], [role="link"]');
    const alt = img.getAttribute("alt") || "";
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, {
      width: "100%",
      height: "100%",
      display: "block"
    });
    const first = document.createElement("img");
    first.onload = () => {
      var _a;
      return (_a = canvas.getContext("2d")) == null ? void 0 : _a.drawImage(first, 0, 0);
    };
    first.src = img.currentSrc || img.src;
    const still = document.createElement(interactive ? "button" : "span");
    still.className = img.className;
    still.setAttribute(STILL_ATTR, "");
    if (interactive) {
      still.type = "button";
      still.setAttribute(
        "aria-label",
        alt ? `${STRINGS.gifShowLabel}: ${alt}` : STRINGS.gifShowLabel
      );
    } else if (alt) {
      still.setAttribute("role", "img");
      still.setAttribute("aria-label", alt);
    } else {
      still.setAttribute("aria-hidden", "true");
    }
    for (const p of COPY_STYLE) still.style[p] = cs[p];
    Object.assign(still.style, {
      position: cs.position === "static" ? "relative" : cs.position,
      display: cs.display === "inline" ? "inline-block" : cs.display,
      width: `${w}px`,
      height: "auto",
      aspectRatio: `${w} / ${h}`,
      // redimensionar não distorce
      maxWidth: "100%",
      padding: "0",
      background: "none",
      cursor: interactive ? "pointer" : "inherit"
    });
    if (cs.borderStyle === "none") still.style.border = "0";
    still.append(canvas);
    if (interactive) {
      const tag = document.createElement("span");
      tag.setAttribute("aria-hidden", "true");
      tag.textContent = `\u25B6 ${STRINGS.gifShowLabel}`;
      Object.assign(tag.style, {
        position: "absolute",
        left: "6px",
        bottom: "6px",
        padding: "0.2rem 0.5rem",
        background: "#0B2C5F",
        color: "#fff",
        font: "600 0.85rem/1.2 system-ui, sans-serif",
        borderRadius: "4px"
      });
      still.append(tag);
      still.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        reveal(still);
      });
    }
    _stills.set(still, img);
    img.replaceWith(still);
  }
  function handleImg(img) {
    if (!isGif(img) || _revealed.has(img)) return;
    if (img.complete && img.naturalWidth) freeze2(img);
    else img.addEventListener("load", () => freeze2(img), { once: true });
  }
  function handleMarquee(m) {
    if (typeof m.stop !== "function" || _marquees.has(m)) return;
    m.stop();
    _marquees.add(m);
  }
  function handleMedia(el2) {
    if (!el2.hasAttribute("autoplay") && !el2.autoplay) return;
    el2.removeAttribute("autoplay");
    el2.autoplay = false;
    _autoplayed.add(el2);
    if (!el2.paused) el2.pause();
  }
  function onPlay2(e) {
    var _a;
    const el2 = e.target;
    if (!((_a = el2 == null ? void 0 : el2.matches) == null ? void 0 : _a.call(el2, MEDIA_SELECTOR2)) || isOwn2(el2)) return;
    if (!userActive2()) el2.pause();
  }
  function scan3(root) {
    var _a;
    if (root.nodeType !== 1 && root.nodeType !== 9) return;
    const all = root.nodeType === 1 ? [root, ...root.querySelectorAll("*")] : root.querySelectorAll("*");
    for (const el2 of all) {
      if (el2.id === "ms-container" || isOwn2(el2)) continue;
      if (el2.tagName === "IMG") handleImg(el2);
      else if (el2.tagName === "MARQUEE") handleMarquee(el2);
      else if ((_a = el2.matches) == null ? void 0 : _a.call(el2, MEDIA_SELECTOR2)) handleMedia(el2);
    }
  }
  function startFlashBlock() {
    if (_on3) return;
    _on3 = true;
    document.addEventListener("play", onPlay2, true);
    _observer3 = new MutationObserver((records) => {
      var _a;
      for (const r of records) {
        for (const n of r.addedNodes) {
          if (n.nodeType === 1 && !isOwn2(n) && !((_a = n.hasAttribute) == null ? void 0 : _a.call(n, STILL_ATTR))) {
            scan3(n);
          }
        }
      }
    });
    _observer3.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
    scan3(document);
  }
  function stopFlashBlock() {
    var _a;
    if (!_on3) return;
    _on3 = false;
    _observer3 == null ? void 0 : _observer3.disconnect();
    _observer3 = null;
    document.removeEventListener("play", onPlay2, true);
    for (const [still, img] of _stills) still.replaceWith(img);
    _stills.clear();
    _revealed = /* @__PURE__ */ new WeakSet();
    for (const m of _marquees) (_a = m.start) == null ? void 0 : _a.call(m);
    _marquees.clear();
    for (const el2 of _autoplayed) el2.setAttribute("autoplay", "");
    _autoplayed.clear();
  }

  // src/features/textMagnifier.js
  var MAGNIFIER_ID = "ms-text-magnifier";
  var MIN_FONT_PX = 32;
  var GAP = 12;
  var MAX_CHARS = 280;
  var OWN2 = "#ms-container, #ms-shortcuts-card, #ms-simples-chrome, #ms-session-bar, #" + MAGNIFIER_ID;
  var BLOCK = "p, li, h1, h2, h3, h4, h5, h6, td, th, dt, dd, blockquote, figcaption, label, legend, caption, summary, button, a, pre";
  var _box = null;
  var _raf2 = null;
  var _pending = null;
  var _escaped = false;
  var _last = "";
  var _listeners2 = [];
  var clean3 = (s) => (s || "").replace(/\s+/g, " ").trim();
  function fieldText(el2) {
    var _a;
    const tag = el2.tagName;
    if (tag === "INPUT") {
      const type = (el2.getAttribute("type") || "text").toLowerCase();
      if (type === "password" || type === "hidden") return "";
      if (["checkbox", "radio", "file", "range", "color"].includes(type)) {
        return clean3(labelOf(el2));
      }
      if (["button", "submit", "reset"].includes(type)) return clean3(el2.value);
      return clean3(`${labelOf(el2)} ${el2.value || ""}`);
    }
    if (tag === "TEXTAREA") return clean3(`${labelOf(el2)} ${el2.value || ""}`);
    if (tag === "SELECT") {
      const opt = (_a = el2.selectedOptions) == null ? void 0 : _a[0];
      return clean3(`${labelOf(el2)} ${opt ? opt.textContent : ""}`);
    }
    return "";
  }
  function labelOf(el2) {
    const aria = el2.getAttribute("aria-label");
    if (aria) return aria;
    const labels = el2.labels ? [...el2.labels].map((l) => l.textContent).join(" ") : "";
    return labels || el2.getAttribute("placeholder") || "";
  }
  function magnifierTextFor(el2) {
    var _a, _b, _c;
    if (!el2 || el2.nodeType !== 1) return "";
    if ((_a = el2.closest) == null ? void 0 : _a.call(el2, OWN2)) return "";
    const tag = el2.tagName;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(tag))
      return fieldText(el2).slice(0, MAX_CHARS);
    if (tag === "IMG") return clean3(el2.getAttribute("alt")).slice(0, MAX_CHARS);
    for (let n = el2; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
      if ((_b = n.closest) == null ? void 0 : _b.call(n, OWN2)) return "";
      if ((_c = n.matches) == null ? void 0 : _c.call(n, BLOCK)) {
        const t = clean3(n.textContent);
        if (t) return t.slice(0, MAX_CHARS);
      }
    }
    const own = [...el2.childNodes].filter((c) => c.nodeType === 3).map((c) => c.textContent).join(" ");
    return clean3(own).slice(0, MAX_CHARS);
  }
  function rgb(c) {
    const m = /rgba?\(([^)]+)\)/.exec(c || "");
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r, g, b, a };
  }
  var lum = ({ r, g, b }) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  function themeColors() {
    const cs = getComputedStyle(document.body);
    const fg = rgb(cs.color) || { r: 0, g: 0, b: 0, a: 1 };
    let bg = rgb(cs.backgroundColor);
    if (!bg || bg.a < 0.5) {
      const html = rgb(
        getComputedStyle(document.documentElement).backgroundColor
      );
      bg = html && html.a >= 0.5 ? html : lum(fg) > 0.5 ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
    }
    const css = ({ r, g, b }) => `rgb(${r}, ${g}, ${b})`;
    return { color: css(fg), background: css(bg) };
  }
  function ensureBox() {
    if (_box) return _box;
    _box = document.createElement("div");
    _box.id = MAGNIFIER_ID;
    _box.setAttribute("aria-hidden", "true");
    const set = (k, v) => _box.style.setProperty(k, v, "important");
    set("position", "fixed");
    set("left", "0");
    set("top", "0");
    set("display", "none");
    set("box-sizing", "border-box");
    set("width", "min(720px, calc(100vw - 32px))");
    set("max-height", "40vh");
    set("overflow", "hidden");
    set("padding", "14px 18px");
    set("font", `600 ${MIN_FONT_PX}px/1.35 system-ui, sans-serif`);
    set("border-radius", "12px");
    set("border", "3px solid");
    set("box-shadow", "0 6px 24px rgba(0,0,0,0.4)");
    set("pointer-events", "none");
    set("z-index", "2147483645");
    set("word-break", "break-word");
    document.documentElement.appendChild(_box);
    return _box;
  }
  function hide2() {
    _last = "";
    if (_box) _box.style.setProperty("display", "none", "important");
  }
  function place(rect) {
    const vw = window.innerWidth || document.documentElement.clientWidth;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const w = _box.offsetWidth;
    const h = _box.offsetHeight;
    let top;
    if (rect.bottom + GAP + h <= vh) top = rect.bottom + GAP;
    else if (rect.top - GAP - h >= 0) top = rect.top - GAP - h;
    else top = rect.top > vh - rect.bottom ? 8 : vh - h - 8;
    const left = Math.min(Math.max(8, rect.left), Math.max(8, vw - w - 8));
    _box.style.setProperty("left", `${Math.round(left)}px`, "important");
    _box.style.setProperty(
      "top",
      `${Math.round(Math.max(0, top))}px`,
      "important"
    );
  }
  function show(el2, pointer) {
    const text = magnifierTextFor(el2);
    if (!text) return hide2();
    const box = ensureBox();
    if (text !== _last || box.style.display === "none") {
      const { color, background } = themeColors();
      box.style.setProperty("color", color, "important");
      box.style.setProperty("background", background, "important");
      box.style.setProperty("border-color", color, "important");
      box.textContent = text;
      _last = text;
    }
    box.style.setProperty("display", "block", "important");
    let rect = el2.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (pointer && rect.height > vh / 2) {
      rect = {
        top: pointer.y - 12,
        bottom: pointer.y + 12,
        left: rect.left,
        right: rect.right
      };
    }
    place(rect);
  }
  function schedule2(el2, pointer) {
    _pending = { el: el2, pointer };
    if (_raf2 !== null) return;
    _raf2 = requestAnimationFrame(() => {
      _raf2 = null;
      const p = _pending;
      _pending = null;
      if (p && !_escaped && _listeners2.length) show(p.el, p.pointer);
    });
  }
  function on(target, type, fn, opts) {
    target.addEventListener(type, fn, opts);
    _listeners2.push([target, type, fn, opts]);
  }
  function startTextMagnifier() {
    if (_listeners2.length) return;
    const move = (e) => {
      var _a, _b;
      if (e.pointerType === "touch") return;
      _escaped = false;
      if ((_b = (_a = e.target) == null ? void 0 : _a.closest) == null ? void 0 : _b.call(_a, "#ms-container")) return hide2();
      schedule2(e.target, { x: e.clientX, y: e.clientY });
    };
    const tap = (e) => {
      var _a, _b;
      if (e.pointerType !== "touch") return;
      _escaped = false;
      if ((_b = (_a = e.target) == null ? void 0 : _a.closest) == null ? void 0 : _b.call(_a, "#ms-container")) return hide2();
      schedule2(e.target, { x: e.clientX, y: e.clientY });
    };
    const focus = (e) => {
      var _a, _b;
      _escaped = false;
      if (!e.target || e.target === document.body || ((_b = (_a = e.target).closest) == null ? void 0 : _b.call(_a, "#ms-container")))
        return hide2();
      schedule2(e.target, null);
    };
    on(document, "pointermove", move, { passive: true });
    on(document, "pointerdown", tap, { passive: true });
    on(
      document,
      "pointerout",
      (e) => {
        if (!e.relatedTarget && e.pointerType !== "touch") hide2();
      },
      { passive: true }
    );
    on(document, "focusin", focus);
    on(document, "focusout", () => hide2());
    on(document, "keydown", (e) => {
      if (e.key === "Escape") {
        _escaped = true;
        hide2();
      }
    });
    on(document, "wheel", () => hide2(), { passive: true });
    let width = window.innerWidth;
    on(window, "resize", () => {
      if (window.innerWidth !== width) hide2();
      width = window.innerWidth;
    });
  }
  function stopTextMagnifier() {
    for (const [t, type, fn, opts] of _listeners2)
      t.removeEventListener(type, fn, opts);
    _listeners2 = [];
    if (_raf2 !== null) {
      cancelAnimationFrame(_raf2);
      _raf2 = null;
    }
    _pending = null;
    _escaped = false;
    _last = "";
    _box == null ? void 0 : _box.remove();
    _box = null;
  }

  // src/modo-simples.js
  var ModoSimples = class {
    constructor(userConfig = {}) {
      this._config = mergeConfig(defaults_default, userConfig);
      this._host = null;
      this._shadow = null;
      this._fab = null;
      this._panel = null;
      this._chrome = null;
      this._simpleNav = null;
      this._removeMotionListener = null;
      this._removeStateListener = null;
      this._onDocKeydown = null;
      this._onDocClick = null;
      this._removeSpeakListener = null;
      this._styleEl = null;
      this._reducedMotionUser = null;
      this._hideImagesBeforeMs = null;
      this._lastPersisted = null;
      this._initialized = false;
    }
    // ── Lifecycle ──────────────────────────────────────────────────────────────
    init() {
      if (this._initialized) return;
      this._initialized = true;
      this._loadPersistedState();
      injectPageStyles(getPageStyles());
      setLexendFontUrl(this._config.fontUrl);
      this._buildUI();
      this._bindEvents();
      startObserving(
        () => state_default.get(),
        () => this._config
        // getter: configure() troca o objeto de config (IMP-16)
      );
      this._syncReducedMotion();
      this._removeMotionListener = onReducedMotionChange(
        () => this._syncReducedMotion()
      );
      const currentState = state_default.get();
      applyOptions(currentState);
      if (currentState.options.readingRuler) {
        startReadingRuler();
      }
      if (currentState.options.readFocus) startFocusReader();
      if (currentState.options.muteMedia) startMediaMute();
      if (currentState.options.blockFlashing) startFlashBlock();
      if (currentState.options.textMagnifier) startTextMagnifier();
      if (currentState.options.showShortcuts) {
        startShortcutsCard({ side: this._shortcutsSide() });
      }
      if (currentState.modoSimples) {
        this._activateModoSimples(currentState, { announce: false });
        this._announceRestoredOnce();
      }
      this._profileBaseline = state_default.get();
    }
    /** Delegate: ver applyProfile() em src/ui/binding.js. */
    _applyProfile(id) {
      applyProfile(this, id);
    }
    /** Cartão de atalhos fica do lado oposto ao botão flutuante. */
    _shortcutsSide() {
      var _a;
      const fab = (_a = this._side) != null ? _a : String(this._config.position || "").endsWith("left") ? "left" : "right";
      return fab === "left" ? "right" : "left";
    }
    /**
     * Modo restaurado em outra página: silêncio a cada navegação, mas uma única vez por sessão
     * avisa que continua ligado (UX-19). Sem sessionStorage, fica em silêncio.
     */
    _announceRestoredOnce() {
      try {
        if (sessionStorage.getItem("ms_restoreAnnounced")) return;
        sessionStorage.setItem("ms_restoreAnnounced", "1");
      } catch (_) {
        return;
      }
      announce("Modo Simples continua ligado");
    }
    destroy() {
      var _a, _b, _c;
      if (!this._initialized) return;
      if (this._removeSpeakListener) {
        this._removeSpeakListener();
        this._removeSpeakListener = null;
      }
      stopReadingRuler();
      stopFocusReader();
      stopMediaMute();
      stopFlashBlock();
      stopTextMagnifier();
      hideShortcutsCard();
      stopSpeaking();
      stopManualSelect();
      (_b = (_a = this._panel) == null ? void 0 : _a.closeOutline) == null ? void 0 : _b.call(_a);
      this._setPageInert(false);
      revert();
      stopObserving();
      if (this._removeMotionListener) {
        this._removeMotionListener();
        this._removeMotionListener = null;
      }
      if (this._removeStateListener) {
        this._removeStateListener();
        this._removeStateListener = null;
      }
      if (this._onDocKeydown) {
        document.removeEventListener("keydown", this._onDocKeydown);
        this._onDocKeydown = null;
      }
      if (this._onDocClick) {
        document.removeEventListener("click", this._onDocClick, true);
        this._onDocClick = null;
      }
      if (this._simpleNav) {
        this._simpleNav.destroy();
        this._simpleNav = null;
      }
      if (this._chrome) {
        this._chrome.destroy();
        this._chrome = null;
      }
      if ((_c = this._host) == null ? void 0 : _c.parentNode) this._host.parentNode.removeChild(this._host);
      const pageStyle = document.getElementById("ms-page-styles");
      if (pageStyle == null ? void 0 : pageStyle.parentNode) pageStyle.parentNode.removeChild(pageStyle);
      const lexend = document.getElementById("ms-lexend-font");
      if (lexend == null ? void 0 : lexend.parentNode) lexend.parentNode.removeChild(lexend);
      state_default.reset();
      this._initialized = false;
    }
    // ── API pública ────────────────────────────────────────────────────────────
    enable() {
      this._setModoSimples(true);
    }
    disable() {
      this._setModoSimples(false);
    }
    toggle() {
      this._setModoSimples(!state_default.get().modoSimples);
    }
    /**
     * Ativa/desativa Modo Simples.
     * Ao ativar: linguagem simples + ocultar imagens (respeita preferência salva de “mostrar imagens”).
     * Ao desativar: desliga linguagem simples; imagens voltam (MS não deixa “órfã” a flag).
     * Preferências do painel (tema, escala, Lexend, etc.) permanecem.
     * @param {boolean} on
     */
    _setModoSimples(on2) {
      if (on2) {
        const preferShow = this._loadPreferShowImages();
        if (!state_default.get().modoSimples) {
          this._saveHideImagesBeforeMs(state_default.get().options.hideImages);
        }
        state_default.set({
          modoSimples: true,
          options: {
            // só liga se a página tem pares data-ms-plain/simple (senão não há o que simplificar)
            simpleLanguage: hasSimpleLanguagePairs(),
            hideImages: !preferShow
          }
        });
      } else {
        state_default.set({
          modoSimples: false,
          options: {
            simpleLanguage: false,
            hideImages: this._takeHideImagesBeforeMs()
          }
        });
      }
    }
    /** Guarda (memória + storage) se as imagens estavam ocultas antes de ligar o MS. */
    _saveHideImagesBeforeMs(hide3) {
      saveHideImagesBeforeMs(this, hide3);
    }
    /** Lê e esquece o valor guardado; sem registro (ex.: MS já estava ligado) = imagens visíveis. */
    _takeHideImagesBeforeMs() {
      return takeHideImagesBeforeMs(this);
    }
    /** Delegate: ver loadPreferShowImages() em src/core/instancePersistence.js. */
    _loadPreferShowImages() {
      return loadPreferShowImages(this);
    }
    /** Delegate: ver savePreferShowImages() em src/core/instancePersistence.js. */
    _savePreferShowImages(show2) {
      savePreferShowImages(this, show2);
    }
    configure(patch) {
      this._config = mergeConfig(this._config, patch);
      if (Object.prototype.hasOwnProperty.call(patch, "fontUrl")) {
        setLexendFontUrl(this._config.fontUrl);
      }
      if (this._initialized && this._styleEl && Object.prototype.hasOwnProperty.call(patch, "position")) {
        this._styleEl.textContent = getUIStyles(this._config.position);
      }
      if (this._initialized && Object.prototype.hasOwnProperty.call(patch, "sessionBar")) {
        this._syncSessionChrome();
      }
      if (this._initialized && Object.prototype.hasOwnProperty.call(patch, "simpleNav")) {
        this._syncSimpleNav();
      }
    }
    // ── UI Construction ────────────────────────────────────────────────────────
    /** Delegate: ver buildUI() em src/ui/binding.js. */
    _buildUI() {
      buildUI(this);
    }
    /** Delegate: ver syncSessionChrome() em src/ui/binding.js. */
    _syncSessionChrome() {
      syncSessionChrome(this);
    }
    /** Delegate: ver syncSimpleNav() em src/ui/binding.js. */
    _syncSimpleNav() {
      syncSimpleNav(this);
    }
    // ── Events ─────────────────────────────────────────────────────────────────
    /** Delegate: ver bindEvents() em src/ui/binding.js. */
    _bindEvents() {
      bindEvents(this);
    }
    // ── Panel management ───────────────────────────────────────────────────────
    /** Delegate: ver togglePanel() em src/ui/binding.js. */
    _togglePanel() {
      togglePanel(this);
    }
    /** Delegate: ver openPanel() em src/ui/binding.js. */
    _openPanel() {
      openPanel(this);
    }
    /** Delegate: ver setPageInert() em src/ui/binding.js. */
    _setPageInert(on2) {
      setPageInert(this, on2);
    }
    /** Delegate: ver inertSibling() em src/ui/binding.js. */
    _inertSibling(el2) {
      inertSibling(this, el2);
    }
    /** Delegate: ver closePanel() em src/ui/binding.js. */
    _closePanel() {
      closePanel(this);
    }
    /** Delegate: ver resetAll() em src/ui/binding.js. */
    _resetAll() {
      resetAll(this);
    }
    /** Delegate: ver movePanelSide() em src/ui/binding.js. */
    _movePanelSide() {
      movePanelSide(this);
    }
    /** Delegate: ver hideWidget() em src/ui/binding.js. */
    _hideWidget() {
      hideWidget(this);
    }
    /** Delegate: ver showWidget() em src/ui/binding.js. */
    _showWidget() {
      showWidget(this);
    }
    /** Delegate: ver loadPanelSide() em src/core/instancePersistence.js. */
    _loadPanelSide() {
      return loadPanelSide(this);
    }
    /** Delegate: ver savePanelSide() em src/core/instancePersistence.js. */
    _savePanelSide(side) {
      savePanelSide(this, side);
    }
    _toggleSpeak() {
      toggleSpeak();
    }
    /** Delegate: ver syncSpeaking() em src/ui/binding.js. */
    _syncSpeaking(speaking) {
      syncSpeaking(this, speaking);
    }
    // ── Modo Simples activation ────────────────────────────────────────────────
    _activateModoSimples(currentState, { announce: doAnnounce = true } = {}) {
      const saved = this._loadPrincipal();
      if (saved) {
        let el2 = null;
        try {
          el2 = document.querySelector(saved.path);
        } catch (_) {
        }
        if (el2 && this._isPlausiblePrincipal(el2, saved)) {
          this._savePrincipalPath(saved.path, el2);
          setPrincipal(el2, this._config);
          document.documentElement.classList.add("ms-ativo");
          applyOptions(currentState);
          if (doAnnounce) announce("Modo Simples ativado");
          return;
        }
        if (!saved.legacy) this._discardPrincipal();
      }
      const { confidence } = scan(this._config);
      if (confidence < this._config.confidenceThreshold) {
        document.documentElement.classList.add("ms-ativo");
        applyOptions(currentState);
        holdPrincipal(true);
        showLowConfidenceNotice({ onChoose: () => this._startManualChoice() });
      } else {
        applyModoSimples(currentState, this._config);
      }
      if (doAnnounce) announce("Modo Simples ativado");
    }
    /** Seleção manual opcional (IMP-22 vale aqui: nada oculto antes de confirmar; cancelar mantém a página). */
    _startManualChoice() {
      this._setPageInert(false);
      startManualSelect({
        onSelect: (el2, path) => {
          this._setPageInert(state_default.get().panelOpen);
          setPrincipal(el2, this._config);
          this._savePrincipalPath(path, el2);
          applyModoSimples(state_default.get(), this._config);
          announce(STRINGS.manualChosen);
        },
        onCancel: () => {
          this._setPageInert(state_default.get().panelOpen);
          announce(STRINGS.manualCancelled);
        }
      });
    }
    // ── State reactions ────────────────────────────────────────────────────────
    _onStateChange(prev, next) {
      if (this._fab) this._fab.sync({ panelOpen: next.panelOpen });
      if (this._panel) this._panel.sync(next, { speaking: isSpeaking() });
      if (this._chrome) this._chrome.sync(next, { speaking: isSpeaking() });
      if (prev.modoSimples !== next.modoSimples) {
        if (next.modoSimples) {
          this._activateModoSimples(next, { announce: !this._applyingProfile });
        } else {
          stopManualSelect();
          revertModoSimples();
          applyOptions(next);
          if (!this._applyingProfile) announce("Modo Simples desativado");
        }
      }
      const optionKeys = [
        "textScale",
        "colorTheme",
        "colorSaturation",
        "customText",
        "customHeading",
        "customBg",
        "dyslexiaFont",
        "readingRuler",
        "highlightLinks",
        "highlightHeadings",
        "highlightControls",
        "enlargeTargets",
        "textMagnifier",
        "textSpacing",
        "lineHeight",
        "wordSpacing",
        "letterSpacing",
        "cursorStyle",
        "reducedMotion",
        "hideImages",
        "simpleLanguage",
        "readFocus",
        "muteMedia",
        "blockFlashing",
        "strongFocus",
        "showShortcuts"
      ];
      const optionChanged = optionKeys.some(
        (k) => prev.options[k] !== next.options[k]
      );
      if (optionChanged) {
        applyOptions(next);
      }
      if (prev.options.readingRuler !== next.options.readingRuler) {
        if (next.options.readingRuler) startReadingRuler();
        else stopReadingRuler();
      }
      if (prev.options.muteMedia !== next.options.muteMedia) {
        if (next.options.muteMedia) startMediaMute();
        else stopMediaMute();
      }
      if (prev.options.blockFlashing !== next.options.blockFlashing) {
        if (next.options.blockFlashing) startFlashBlock();
        else stopFlashBlock();
      }
      if (prev.options.textMagnifier !== next.options.textMagnifier) {
        if (next.options.textMagnifier) startTextMagnifier();
        else stopTextMagnifier();
      }
      if (prev.options.showShortcuts !== next.options.showShortcuts) {
        if (next.options.showShortcuts) {
          startShortcutsCard({ side: this._shortcutsSide() });
        } else stopShortcutsCard();
      }
      if (prev.options.readFocus !== next.options.readFocus) {
        if (next.options.readFocus) startFocusReader();
        else stopFocusReader();
      }
      if (!this._applyingProfile) {
        diffStateAnnouncements(prev, next).forEach((msg) => announce(msg));
      }
      this._persistState(next);
      if (!this._applyingProfile && next.activeProfile && !next.profileCustom && this._profileBaseline && profileDiffers(
        this._profileBaseline,
        next,
        this._reducedMotionUser !== null
      )) {
        const vazio = !profileDiffers(
          { modoSimples: false, options: RESET_OPTIONS },
          next,
          this._reducedMotionUser !== null
        );
        state_default.set(
          vazio ? { activeProfile: null, profileCustom: false } : { profileCustom: true }
        );
      }
    }
    // ── Persistence ────────────────────────────────────────────────────────────
    /** Delegate: ver persistState() em src/core/instancePersistence.js. */
    _persistState(next) {
      persistState(this, next);
    }
    /** Delegate: ver loadPersistedState() em src/core/instancePersistence.js. */
    _loadPersistedState() {
      loadPersistedState(this);
    }
    /** Grava o principal escolhido POR PÁGINA, com o tamanho do texto para validar depois. */
    _savePrincipalPath(path, el2) {
      savePrincipalPath(this, path, el2);
    }
    /**
     * Principal salvo para ESTA página. Sem registro de página, aceita o registro antigo (por host,
     * string) — ele só vale se passar na validação, e é migrado para a página (IMP-06).
     * @returns {{ path: string, textLen: number|null, legacy: boolean } | null}
     */
    _loadPrincipal() {
      return loadPrincipal(this);
    }
    /**
     * Esquece o principal salvo DESTA página. O registro antigo por host nunca é apagado aqui:
     * ele é só uma dica, e falhar numa página não diz nada sobre as outras.
     */
    _discardPrincipal() {
      discardPrincipal(this);
    }
    /**
     * O elemento achado pelo caminho salvo ainda parece a área de conteúdo? Exige o mínimo de
     * texto da heurística (scoring.minTextLength) e, quando conhecido, não menos que metade do
     * tamanho de quando foi escolhido.
     */
    _isPlausiblePrincipal(el2, saved) {
      return isPlausiblePrincipal(this, el2, saved);
    }
    /**
     * Registro antigo (por host, sem tamanho gravado) é só uma dica: além do mínimo de texto, quando
     * a heurística tem confiança nesta página o elemento da dica não pode ser bem menor que o
     * candidato dela (< 50% do texto) — outra página do host com a mesma estrutura de caminho.
     */
    _legacyHintFits(el2, len) {
      return legacyHintFits(this, el2, len);
    }
    // ── System preferences ─────────────────────────────────────────────────────
    /**
     * reducedMotion segue a preferência do SO enquanto o usuário não escolher (IMP-14):
     * o valor derivado nunca é gravado como escolha, e acompanha o SO nos dois sentidos.
     */
    _syncReducedMotion() {
      if (this._reducedMotionUser !== null) return;
      state_default.set({ options: { reducedMotion: prefersReducedMotion() } });
    }
  };
  function readPreBootConfig(win) {
    const cfg = win && win.ModoSimplesConfig;
    return cfg && typeof cfg === "object" ? cfg : {};
  }
  function bootModoSimples(win) {
    if (win.ModoSimples && win.ModoSimples._initialized) return win.ModoSimples;
    const instance = new ModoSimples(readPreBootConfig(win));
    instance.init();
    win.ModoSimples = instance;
    return instance;
  }
  function shouldAutoBoot(win, script) {
    if (script && script.getAttribute("data-ms-autoboot") === "false") {
      return false;
    }
    return readPreBootConfig(win).autoboot !== false;
  }
  if (typeof window !== "undefined") {
    const script = document.currentScript;
    if (shouldAutoBoot(window, script)) {
      const boot = () => bootModoSimples(window);
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
      } else {
        boot();
      }
    } else {
      window.ModoSimplesClass = ModoSimples;
      window.ModoSimplesBoot = () => bootModoSimples(window);
    }
  }
  var modo_simples_default = ModoSimples;
})();
