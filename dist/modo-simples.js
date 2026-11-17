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
    /** Scoring weights used by the heuristic engine. */
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
     * Below this threshold, a manual-selection fallback is shown instead.
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
          document.querySelectorAll(selector).forEach((el) => found.add(el));
        } catch (_2) {
        }
      }
      return [...found];
    }
  }

  // src/heuristics/contentDetector.js
  function detectMainContent(config = defaults_default) {
    const scored = [];
    const rank = (el) => {
      if (typeof el.matches !== "function") return 0;
      const i = config.mainSelectors.findIndex((sel) => {
        try {
          return el.matches(sel);
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
  var initialState = {
    modoSimples: false,
    panelOpen: false,
    options: {
      textScale: "100",
      colorTheme: "senac",
      dyslexiaFont: false,
      readingRuler: false,
      highlightLinks: false,
      textSpacing: false,
      reducedMotion: false,
      hideImages: false,
      simpleLanguage: false
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

  // src/core/persistedState.js
  var SCHEMA_VERSION = 1;
  function hydratePersistedState(saved) {
    if (!saved || typeof saved !== "object") return null;
    const opts = saved.options || {};
    let textScale = opts.textScale || "100";
    if (!opts.textScale && opts.largerText) textScale = "125";
    let colorTheme = opts.colorTheme || "senac";
    if (!opts.colorTheme && opts.highContrast) colorTheme = "yellowBlack";
    const modoSimples = Boolean(saved.modoSimples);
    return {
      modoSimples,
      options: {
        textScale: ["100", "125", "150", "175"].includes(textScale) ? textScale : "100",
        colorTheme: ["senac", "yellowBlack", "darkHigh", "soft"].includes(
          colorTheme
        ) ? colorTheme : "senac",
        dyslexiaFont: Boolean(opts.dyslexiaFont),
        readingRuler: Boolean(opts.readingRuler),
        highlightLinks: Boolean(opts.highlightLinks),
        textSpacing: Boolean(opts.textSpacing),
        reducedMotion: Boolean(opts.reducedMotion),
        hideImages: Boolean(opts.hideImages),
        // Linguagem simples é acoplada ao MS; sem MS não reativa “órfã”
        simpleLanguage: modoSimples ? Boolean(opts.simpleLanguage) : false
      }
    };
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

  // src/ui/styles.js
  function getUIStyles(position = "bottom-right") {
    const isBottom = position.startsWith("bottom");
    const isRight = position.endsWith("right");
    const fabCorner = [
      isBottom ? "bottom: 1.5rem;" : "top: 1.5rem;",
      isRight ? "right: 1.5rem;" : "left: 1.5rem;"
    ].join("");
    const panelCorner = [
      isBottom ? "bottom: calc(1.5rem + 100px);" : "top: calc(1.5rem + 100px);",
      isRight ? "right: 1.5rem;" : "left: 1.5rem;"
    ].join("");
    const panelOrigin = `${isBottom ? "bottom" : "top"} ${isRight ? "right" : "left"}`;
    return `
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
      ${fabCorner}
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.45rem;
      pointer-events: none;
      z-index: 2;
    }
    .ms-fab-tip {
      pointer-events: none;
      position: relative;
      background: #0B2C5F;
      color: #fff;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.45rem 0.8rem;
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
      right: 1.15rem;
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

    /* \u2500\u2500 Panel \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    #ms-a11y-panel,
    .ms-a11y-panel {
      position: absolute;
      ${panelCorner}
      width: min(380px, calc(100vw - 2rem));
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
      transform-origin: ${panelOrigin};
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
      gap: 0.75rem;
      padding: 1rem 1rem 0.9rem;
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
      font-size: 1.05rem;
      font-weight: 700;
      line-height: 1.25;
      color: #fff;
    }
    .ms-a11y-subtitle {
      margin: 0.2rem 0 0;
      font-size: 0.8125rem;
      opacity: 0.85;
      color: #fff;
    }

    .ms-a11y-close {
      flex-shrink: 0;
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.85);
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ms-a11y-close:hover { background: rgba(255, 255, 255, 0.12); color: #fff; }
    .ms-a11y-close:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }

    .ms-a11y-body {
      overflow-y: auto;
      padding: 0.85rem 1rem 1.1rem;
      flex: 1;
      background: #f7f8fa;
    }

    /* \u2500\u2500 Modo Simples card \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .ms-a11y-card--simple {
      background: var(--ms-simple-bg);
      border: 2px solid var(--ms-simple-border);
      border-radius: 12px;
      padding: 0.85rem 0.9rem;
      margin-bottom: 1rem;
    }
    .ms-a11y-card-row {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }
    .ms-a11y-card-text { flex: 1; min-width: 0; }
    .ms-a11y-card-star {
      color: var(--ms-orange);
      margin-right: 0.2rem;
      font-size: 1rem;
    }
    .ms-a11y-card-text strong {
      font-size: 0.95rem;
      color: var(--ms-blue);
    }
    .ms-a11y-card-text p {
      margin: 0.35rem 0 0;
      font-size: 0.78rem;
      color: #4a5568;
      line-height: 1.4;
    }

    .ms-a11y-card--simple .ms-switch--on,
    .ms-a11y-card--simple .ms-switch[aria-checked="true"] {
      background: #8a5500;
    }

    /* \u2500\u2500 Sections \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .ms-a11y-section {
      background: #fff;
      border-radius: 10px;
      padding: 0.75rem 0.85rem;
      margin-bottom: 0.75rem;
      border: 1px solid #e8eaef;
    }
    .ms-a11y-section-title {
      margin: 0 0 0.65rem;
      font-size: 0.8125rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--ms-blue);
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    /* \u2500\u2500 Segmented text scale \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .ms-segmented {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.35rem;
    }
    .ms-segment {
      border: none;
      border-radius: 8px;
      padding: 0.55rem 0.25rem;
      min-height: 44px;
      font: inherit;
      font-size: 0.8rem;
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
      gap: 0.5rem;
    }
    .ms-theme-btn {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.15rem;
      text-align: left;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      padding: 0.55rem 0.6rem;
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
      margin-bottom: 0.25rem;
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
    .ms-theme-label {
      font-size: 0.8125rem;
      font-weight: 700;
      line-height: 1.2;
    }
    .ms-theme-sub {
      font-size: 0.8125rem;
      color: #64748b;
    }

    /* \u2500\u2500 Option rows + switches \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .ms-a11y-option-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }
    .ms-a11y-option-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .ms-a11y-option-text { flex: 1; min-width: 0; }
    .ms-a11y-option-text strong {
      font-size: 0.85rem;
      color: #1e293b;
      display: block;
    }
    .ms-a11y-option-hint {
      display: block;
      margin-top: 0.2rem;
      font-size: 0.8125rem;
      font-weight: 500;
      color: #64748b;
      line-height: 1.35;
    }
    .ms-a11y-option-text p {
      margin: 0.15rem 0 0;
      font-size: 0.8125rem;
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

    .ms-btn-ouvir {
      flex-shrink: 0;
      border: none;
      border-radius: 8px;
      padding: 0.45rem 0.9rem;
      background: var(--ms-orange);
      color: #1a1205;
      font: inherit;
      font-size: 0.82rem;
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
      margin: 0.35rem 0 0;
      text-align: center;
      font-size: 0.8125rem;
      color: #475569;
      line-height: 1.35;
    }

    @media (max-width: 480px) {
      #ms-a11y-panel {
        width: calc(100vw - 1rem);
        max-height: calc(100vh - 124px - 2.5rem);
        max-height: calc(100dvh - 124px - 2.5rem);
        right: 0.5rem !important;
        left: 0.5rem !important;
        transform-origin: bottom center;
      }
      .ms-fab-tip {
        max-width: min(180px, 62vw);
        white-space: normal;
        text-align: center;
        border-radius: 14px;
        font-size: 0.75rem;
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
  `;
  }
  function getPageStyles() {
    return `
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
    html.ms-text-scale-125 { font-size: 125%; }
    html.ms-text-scale-150 { font-size: 150%; }
    html.ms-text-scale-175 { font-size: 175%; }

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

    /* Session bar: opaque amber over page content under any theme */
    html.ms-theme-yellowBlack #ms-session-bar,
    html.ms-theme-darkHigh #ms-session-bar,
    html.ms-theme-soft #ms-session-bar {
      position: relative;
      z-index: 40;
      background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%) !important;
      color: #1a1205 !important;
      border-bottom-color: #d97706 !important;
    }

    /* ms-theme-senac is a noop (default site look) */

    /* \u2500\u2500 Reduced motion \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    html.ms-reduced-motion *,
    html.ms-reduced-motion *::before,
    html.ms-reduced-motion *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
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

    /* \u2500\u2500 Lexend / dyslexia font \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    html.ms-dyslexia-font,
    html.ms-dyslexia-font body,
    html.ms-dyslexia-font body *:not(#ms-container):not(#ms-container *):not([class*="icon"]):not([class*="fa-"]):not(.fa):not(.fas):not(.far):not(.fab):not(.material-icons):not(code):not(pre):not(kbd):not(samp) {
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

    /* \u2500\u2500 Session chrome (SIMPLES header) + barra sob o nav \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    #ms-simples-chrome {
      display: flex;
      align-items: center;
      margin-left: auto;
      z-index: 50;
      flex-shrink: 0;
    }
    #ms-simples-chrome.ms-simples-chrome--fixed {
      position: fixed;
      top: 0.75rem;
      right: 5.5rem;
      z-index: 2147483646;
    }
    /* Same SIMPLES control, parked in MS pills nav while site header is hidden */
    #ms-simples-chrome.ms-simples-chrome--ms-nav {
      margin-left: auto;
      align-self: center;
      position: sticky;
      right: 0;
      z-index: 2;
    }
    #ms-simples-chrome.ms-simples-chrome--ms-nav .ms-chrome-icon {
      display: none;
    }
    .ms-simples-chrome-inner {
      display: flex;
      align-items: center;
      gap: 0.55rem;
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
      align-items: center;
      gap: 0.55rem;
      padding: 0.4rem 0.7rem 0.4rem 0.75rem;
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
    .ms-simples-spark { color: #f39200; font-size: 1rem; }
    .ms-simples-toggle-text {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }
    .ms-simples-toggle-text strong {
      font-size: 0.8rem;
      letter-spacing: 0.05em;
      color: #0b2c5f;
    }
    .ms-simples-sub {
      font-size: 0.75rem;
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
      width: min(72rem, calc(100% - 2rem));
      margin: 0 auto;
      padding: 0.9rem 0;
    }
    .ms-session-off {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem 1rem;
    }
    .ms-session-off[hidden],
    .ms-session-on[hidden] {
      display: none !important;
    }
    .ms-session-off p {
      margin: 0;
      font-weight: 600;
      max-width: 52rem;
      font-size: 0.95rem;
    }
    .ms-chrome-icon:focus-visible,
    .ms-chrome-switch:focus-visible,
    .ms-session-btn:focus-visible {
      outline: 3px solid #0b2c5f;
      outline-offset: 2px;
    }
    .ms-session-on-top { margin-bottom: 0.7rem; }
    .ms-session-on-title {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.05rem;
    }
    .ms-session-badge {
      background: #1a1205;
      color: #fff;
      border-radius: 999px;
      padding: 0.22rem 0.7rem;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .ms-session-desc {
      margin: 0.35rem 0 0;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .ms-session-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .ms-session-btn {
      border: none;
      border-radius: 12px;
      padding: 0.55rem 0.95rem;
      min-height: 44px;
      font-weight: 700;
      cursor: pointer;
      font-size: 0.85rem;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
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

    /* Pills injet\xE1veis (F5-T11 \u2014 simpleNav) */
    .ms-pills-nav[data-ms-injected] {
      background: #fff;
      border-bottom: 1px solid #e2e8f0;
      box-shadow: 0 1px 0 rgb(0 0 0 / 4%);
    }
    .ms-pills-nav[data-ms-injected] .ms-pills-nav__inner {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      padding: 0.65rem 1rem;
      scrollbar-width: thin;
    }
    .ms-pills-nav[data-ms-injected] .ms-pill {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.55rem 0.95rem;
      border-radius: 10px;
      background: #eef2f7;
      color: #0b2c5f;
      font-weight: 700;
      font-size: 0.82rem;
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
      .ms-session-btn:hover,
      .ms-pills-nav[data-ms-injected] .ms-pill:hover {
        transform: none;
      }
    }
  `;
  }

  // src/ui/fab.js
  var TIP_SEEN_KEY = "fabTipSeen";
  function createFab({ onClick }) {
    const wrap = document.createElement("div");
    wrap.className = "ms-fab-wrap";
    wrap.setAttribute("data-ms-fab-wrap", "");
    const tip = document.createElement("span");
    tip.className = "ms-fab-tip";
    tip.id = "ms-fab-tip";
    tip.textContent = "Acessibilidade & Modo Simples";
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
    btn.setAttribute("aria-label", "Abrir painel de acessibilidade");
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
    wrap.appendChild(tip);
    wrap.appendChild(btn);
    function sync({ panelOpen }) {
      btn.setAttribute("aria-expanded", String(panelOpen));
      btn.setAttribute(
        "aria-label",
        panelOpen ? "Fechar painel de acessibilidade" : "Abrir painel de acessibilidade"
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
    return { element: wrap, button: btn, sync };
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
      (el) => !el.closest("[hidden]") && el.getBoundingClientRect().width > 0
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

  // src/ui/a11yPanel.js
  var TEXT_SCALES = [
    { value: "100", label: "100%", title: "Padr\xE3o" },
    { value: "125", label: "125%", title: "Grande" },
    { value: "150", label: "150%", title: "Maior" },
    { value: "175", label: "175%", title: "M\xE1ximo" }
  ];
  var DEFAULT_BRAND = {
    title: "Acessibilidade Digital",
    subtitle: "",
    footer: "Prefer\xEAncias salvas neste navegador"
  };
  var COLOR_THEMES = [
    { value: "senac", label: "Cores do site", sub: "Padr\xE3o" },
    { value: "yellowBlack", label: "Amarelo e Preto", sub: "Alto contraste" },
    { value: "darkHigh", label: "Modo Escuro Alto", sub: "Fundo escuro" },
    { value: "soft", label: "Descanso / Suave", sub: "Baixa intensidade" }
  ];
  function createA11yPanel({
    state: state2,
    onClose,
    onToggleModoSimples,
    onSetOption,
    onSpeak,
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
      <button type="button" class="ms-a11y-close" aria-label="Fechar painel de acessibilidade">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
          <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </header>

    <div class="ms-a11y-body">
      <div class="ms-a11y-card ms-a11y-card--simple" data-section="modo-simples">
        <div class="ms-a11y-card-row">
          <div class="ms-a11y-card-text">
            <span class="ms-a11y-card-star" aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3.5l2.5 5.6 6 .6-4.5 4 1.3 6-5.3-3.1-5.3 3.1 1.3-6-4.5-4 6-.6z" fill="currentColor"/></svg></span>
            <strong>Modo Simples (Recomendado)</strong>
            <p>Oculta distra\xE7\xF5es visuais, aumenta bot\xF5es e resume conte\xFAdos essenciais.</p>
          </div>
          <button type="button" class="ms-switch" role="switch" aria-checked="false"
            data-action="modo-simples" aria-label="Modo Simples">
            <span class="ms-switch-thumb"></span>
          </button>
        </div>
      </div>

      <section class="ms-a11y-section" aria-labelledby="ms-label-text">
        <h3 id="ms-label-text" class="ms-a11y-section-title">
          <span aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 7V5h14v2"/><path d="M12 5v14"/><path d="M9 19h6"/></svg></span> Tamanho do texto
        </h3>
        <div class="ms-segmented" role="radiogroup" aria-labelledby="ms-label-text" data-option="textScale">
          ${TEXT_SCALES.map(
      (s) => `
            <button type="button" role="radio" class="ms-segment"
              data-value="${s.value}" aria-checked="false"
              aria-label="Tamanho do texto ${s.label} \u2014 ${s.title}" title="${s.title}">
              ${s.label}
            </button>`
    ).join("")}
        </div>
      </section>

      <section class="ms-a11y-section" aria-labelledby="ms-label-theme">
        <h3 id="ms-label-theme" class="ms-a11y-section-title">
          <span aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor"/></svg></span> Contraste e cores
        </h3>
        <div class="ms-theme-grid" role="radiogroup" aria-labelledby="ms-label-theme" data-option="colorTheme">
          ${COLOR_THEMES.map(
      (t) => `
            <button type="button" role="radio" class="ms-theme-btn ms-theme-btn--${t.value}"
              data-value="${t.value}" aria-checked="false"
              aria-label="Tema ${t.label} \u2014 ${t.sub}">
              <span class="ms-theme-swatch" aria-hidden="true"></span>
              <span class="ms-theme-label">${t.label}</span>
              <span class="ms-theme-sub">${t.sub}</span>
            </button>`
    ).join("")}
        </div>
      </section>

      <section class="ms-a11y-section" aria-labelledby="ms-label-cognitive">
        <h3 id="ms-label-cognitive" class="ms-a11y-section-title">
          <span aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M4 10h16"/><path d="M10 10v10"/></svg></span> Aux\xEDlio cognitivo &amp; TDAH
        </h3>
        <ul class="ms-a11y-option-list">
          <li class="ms-a11y-option-row">
            <div class="ms-a11y-option-text">
              <strong>Fonte Acess\xEDvel (Lexend)</strong>
              <p>Desenvolvida para dislexia e agilidade visual</p>
            </div>
            <button type="button" class="ms-switch" role="switch" aria-checked="false"
              data-option="dyslexiaFont" aria-label="Fonte Acess\xEDvel Lexend">
              <span class="ms-switch-thumb"></span>
            </button>
          </li>
          <li class="ms-a11y-option-row">
            <div class="ms-a11y-option-text">
              <strong>R\xE9gua de Foco de Leitura</strong>
              <p>Destaque linha a linha para guiar a aten\xE7\xE3o</p>
            </div>
            <button type="button" class="ms-switch" role="switch" aria-checked="false"
              data-option="readingRuler" aria-label="R\xE9gua de Foco de Leitura">
              <span class="ms-switch-thumb"></span>
            </button>
          </li>
          <li class="ms-a11y-option-row">
            <div class="ms-a11y-option-text">
              <strong>Leitor de Tela por Voz</strong>
              <p>L\xEA os t\xEDtulos e textos em portugu\xEAs</p>
            </div>
            <button type="button" class="ms-btn-ouvir" data-action="speak" aria-label="Ouvir conte\xFAdo principal">
              Ouvir
            </button>
          </li>
        </ul>
      </section>

      <section class="ms-a11y-section" aria-labelledby="ms-label-more">
        <h3 id="ms-label-more" class="ms-a11y-section-title">Mais op\xE7\xF5es</h3>
        <ul class="ms-a11y-option-list">
          <li class="ms-a11y-option-row">
            <div class="ms-a11y-option-text"><strong>Destacar links</strong></div>
            <button type="button" class="ms-switch" role="switch" aria-checked="false"
              data-option="highlightLinks" aria-label="Destacar links">
              <span class="ms-switch-thumb"></span>
            </button>
          </li>
          <li class="ms-a11y-option-row">
            <div class="ms-a11y-option-text"><strong>Espa\xE7amento de texto</strong></div>
            <button type="button" class="ms-switch" role="switch" aria-checked="false"
              data-option="textSpacing" aria-label="Espa\xE7amento de texto">
              <span class="ms-switch-thumb"></span>
            </button>
          </li>
          <li class="ms-a11y-option-row">
            <div class="ms-a11y-option-text"><strong>Reduzir movimento</strong></div>
            <button type="button" class="ms-switch" role="switch" aria-checked="false"
              data-option="reducedMotion" aria-label="Reduzir movimento">
              <span class="ms-switch-thumb"></span>
            </button>
          </li>
          <li class="ms-a11y-option-row">
            <div class="ms-a11y-option-text">
              <strong>Ocultar imagens</strong>
              <span class="ms-a11y-option-hint">No Modo Simples, imagens somem por padr\xE3o \u2014 desligue para manter</span>
            </div>
            <button type="button" class="ms-switch" role="switch" aria-checked="false"
              data-option="hideImages" aria-label="Ocultar imagens">
              <span class="ms-switch-thumb"></span>
            </button>
          </li>
        </ul>
      </section>

      <div class="ms-a11y-live" aria-live="polite" aria-atomic="true"></div>
      <p class="ms-a11y-footer-note"></p>
    </div>
  `;
    const setText = (selector, text) => {
      const el = panel.querySelector(selector);
      el.textContent = text;
      el.hidden = !text;
    };
    setText("#ms-a11y-title", texts.title || DEFAULT_BRAND.title);
    setText(".ms-a11y-subtitle", texts.subtitle);
    setText(".ms-a11y-footer-note", texts.footer);
    let _releaseFocus = null;
    panel.querySelector(".ms-a11y-close").addEventListener("click", () => onClose());
    panel.querySelector('[data-action="modo-simples"]').addEventListener("click", (e) => {
      const btn = e.currentTarget;
      const next = btn.getAttribute("aria-checked") !== "true";
      onToggleModoSimples(next);
    });
    panel.querySelectorAll(".ms-segmented .ms-segment").forEach((btn) => {
      btn.addEventListener("click", () => {
        onSetOption("textScale", btn.getAttribute("data-value"));
      });
    });
    panel.querySelectorAll(".ms-theme-grid .ms-theme-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        onSetOption("colorTheme", btn.getAttribute("data-value"));
      });
    });
    panel.querySelectorAll('[role="radiogroup"]').forEach((group) => {
      group.addEventListener("keydown", (e) => {
        const radios = [...group.querySelectorAll('[role="radio"]')];
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
      var _a, _b;
      const modoBtn = panel.querySelector('[data-action="modo-simples"]');
      if (modoBtn) {
        modoBtn.setAttribute("aria-checked", String(!!s.modoSimples));
        modoBtn.classList.toggle("ms-switch--on", !!s.modoSimples);
      }
      const scale = ((_a = s.options) == null ? void 0 : _a.textScale) || "100";
      panel.querySelectorAll('[data-option="textScale"] .ms-segment').forEach((btn) => {
        const on = btn.getAttribute("data-value") === scale;
        btn.setAttribute("aria-checked", String(on));
        btn.setAttribute("tabindex", on ? "0" : "-1");
        btn.classList.toggle("ms-segment--on", on);
      });
      const theme = ((_b = s.options) == null ? void 0 : _b.colorTheme) || "senac";
      panel.querySelectorAll('[data-option="colorTheme"] .ms-theme-btn').forEach((btn) => {
        const on = btn.getAttribute("data-value") === theme;
        btn.setAttribute("aria-checked", String(on));
        btn.setAttribute("tabindex", on ? "0" : "-1");
        btn.classList.toggle("ms-theme-btn--on", on);
      });
      [
        "dyslexiaFont",
        "readingRuler",
        "highlightLinks",
        "textSpacing",
        "reducedMotion",
        "hideImages"
      ].forEach((key) => {
        var _a2;
        const btn = panel.querySelector(`.ms-switch[data-option="${key}"]`);
        if (!btn) return;
        const on = !!((_a2 = s.options) == null ? void 0 : _a2[key]);
        btn.setAttribute("aria-checked", String(on));
        btn.classList.toggle("ms-switch--on", on);
      });
      const speakBtn = panel.querySelector('[data-action="speak"]');
      if (speakBtn && ui.speaking !== void 0) {
        speakBtn.textContent = ui.speaking ? "Parar" : "Ouvir";
        speakBtn.setAttribute(
          "aria-label",
          ui.speaking ? "Parar leitura" : "Ouvir conte\xFAdo principal"
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
      panel.hidden = true;
      if (_releaseFocus) {
        _releaseFocus();
        _releaseFocus = null;
      }
    }
    sync(state2);
    return { element: panel, open, close, sync };
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
        aria-label="Abrir painel de acessibilidade" title="Acessibilidade">
        ${SLIDERS_ICON}
      </button>
      <div class="ms-simples-toggle-wrap" data-active="false">
        <span class="ms-simples-spark" aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3.5l2.5 5.6 6 .6-4.5 4 1.3 6-5.3-3.1-5.3 3.1 1.3-6-4.5-4 6-.6z" fill="currentColor"/></svg></span>
        <div class="ms-simples-toggle-text">
          <strong>SIMPLES</strong>
          <span class="ms-simples-sub" data-sub>Acessibilidade Cognitiva</span>
        </div>
        <button type="button" class="ms-switch ms-chrome-switch" role="switch" aria-checked="false"
          data-action="toggle-simples" aria-label="Modo Simples">
          <span class="ms-switch-thumb"></span>
        </button>
      </div>
    </div>
  `;
    const bar = document.createElement("div");
    bar.id = "ms-session-bar";
    bar.className = "ms-session-bar";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Modo Simples");
    bar.innerHTML = `
    <div class="ms-session-bar-inner" data-state="off">
      <div class="ms-session-off">
        <p><span aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3.5l2.5 5.6 6 .6-4.5 4 1.3 6-5.3-3.1-5.3 3.1 1.3-6-4.5-4 6-.6z" fill="currentColor"/></svg></span> Quer uma navega\xE7\xE3o mais calma, direta e sem excesso de informa\xE7\xE3o?</p>
        <button type="button" class="ms-session-btn ms-session-btn--dark" data-action="activate">Ativar Modo Simples</button>
      </div>
      <div class="ms-session-on" hidden>
        <div class="ms-session-on-top">
          <div class="ms-session-on-title" tabindex="-1">
            <span aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3.5l2.5 5.6 6 .6-4.5 4 1.3 6-5.3-3.1-5.3 3.1 1.3-6-4.5-4 6-.6z" fill="currentColor"/></svg></span>
            <strong>Modo Simples Ativado</strong>
            <span class="ms-session-badge">Foco na Navega\xE7\xE3o</span>
          </div>
          <p class="ms-session-desc" data-session-desc>
            Exibindo explica\xE7\xF5es em palavras f\xE1ceis, sem termos complicados.
          </p>
        </div>
        <div class="ms-session-actions">
          <button type="button" class="ms-session-btn ms-session-btn--light" data-action="speak" aria-label="Ouvir p\xE1gina">
            <span aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg></span> <span data-speak-label>Ouvir P\xE1gina</span>
          </button>
          <button type="button" class="ms-session-btn ms-session-btn--dark" data-action="lang" aria-pressed="false">
            <span aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6"/><path d="M9 17h6"/></svg></span> Linguagem Simples: <span data-lang-label aria-hidden="true">DESLIGADA</span>
          </button>
          <button type="button" class="ms-session-btn ms-session-btn--dark" data-action="images" aria-pressed="false">
            <span aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m21 16-5-5-8 9"/></svg></span> Imagens: <span data-images-label aria-hidden="true">OCULTAS</span>
          </button>
          <button type="button" class="ms-session-btn ms-session-btn--light" data-action="exit">Voltar ao site normal</button>
        </div>
      </div>
    </div>
  `;
    _mountChrome(chrome, mount);
    _mountBar(bar, mount);
    chrome.querySelector('[data-action="toggle-simples"]').addEventListener("click", (e) => {
      const on = e.currentTarget.getAttribute("aria-checked") !== "true";
      onToggleModoSimples(on);
    });
    chrome.querySelector('[data-action="open-panel"]').addEventListener("click", () => onOpenPanel());
    const focusIn = (selector) => {
      const el = bar.querySelector(selector);
      if (el && typeof el.focus === "function") el.focus();
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
      const on = !!s.modoSimples;
      const sw = chrome.querySelector('[data-action="toggle-simples"]');
      const wrap = chrome.querySelector(".ms-simples-toggle-wrap");
      const sub = chrome.querySelector("[data-sub]");
      if (sw) {
        sw.setAttribute("aria-checked", String(on));
        sw.classList.toggle("ms-switch--on", on);
      }
      if (wrap) wrap.setAttribute("data-active", String(on));
      if (sub)
        sub.textContent = on ? "Interface Simplificada" : "Acessibilidade Cognitiva";
      _placeChrome(chrome, on, mount);
      const inner = bar.querySelector(".ms-session-bar-inner");
      const off = bar.querySelector(".ms-session-off");
      const onBlock = bar.querySelector(".ms-session-on");
      if (inner) inner.setAttribute("data-state", on ? "on" : "off");
      if (off) off.hidden = on;
      if (onBlock) onBlock.hidden = !on;
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
        langLabel.textContent = !langAvailable ? "Indispon\xEDvel nesta p\xE1gina" : langOn ? "LIGADA" : "DESLIGADA";
      }
      if (desc) {
        desc.textContent = langOn ? "Exibindo explica\xE7\xF5es em palavras f\xE1ceis, sem termos complicados." : "Navega\xE7\xE3o mais calma, com bot\xF5es claros e menos distra\xE7\xF5es.";
      }
      const hideImgs = !!((_b = s.options) == null ? void 0 : _b.hideImages);
      const imgBtn = bar.querySelector('[data-action="images"]');
      const imgLabel = bar.querySelector("[data-images-label]");
      if (imgBtn) {
        imgBtn.setAttribute("aria-pressed", String(!hideImgs));
        imgBtn.classList.toggle("ms-session-btn--active", !hideImgs);
      }
      if (imgLabel) imgLabel.textContent = hideImgs ? "OCULTAS" : "VIS\xCDVEIS";
      if (ui.speaking !== void 0) {
        const speakBtn = bar.querySelector('[data-action="speak"]');
        const speakLabel = bar.querySelector("[data-speak-label]");
        if (speakBtn) {
          speakBtn.classList.toggle("ms-session-btn--speaking", ui.speaking);
          speakBtn.setAttribute(
            "aria-label",
            ui.speaking ? "Parar leitura da p\xE1gina" : "Ouvir p\xE1gina"
          );
        }
        if (speakLabel)
          speakLabel.textContent = ui.speaking ? "Parar Voz" : "Ouvir P\xE1gina";
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
        const el = document.querySelector(sel);
        if (el) return el;
      } catch (_) {
      }
    }
    return null;
  }
  function _moveChrome(chrome, parent) {
    if (chrome.parentElement === parent) return;
    const focused = chrome.contains(document.activeElement) ? document.activeElement : null;
    parent.appendChild(chrome);
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
    const pillsInner = document.querySelector("[data-ms-pills] .ms-pills-nav__inner") || document.querySelector("[data-ms-pills]");
    if (pillsInner) {
      _moveChrome(chrome, pillsInner);
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

  // src/heuristics/distractionDetector.js
  function detectDistractions(mainElement, config = defaults_default) {
    const distractions = [];
    const isMsChrome = (el) => {
      var _a, _b;
      if (!el || !el.id && !el.getAttribute) return false;
      if (el.id === "ms-container" || el.id === "ms-session-bar" || el.id === "ms-simples-chrome") {
        return true;
      }
      if ((_a = el.hasAttribute) == null ? void 0 : _a.call(el, "data-ms-pills")) return true;
      if ((_b = el.closest) == null ? void 0 : _b.call(
        el,
        "#ms-container, #ms-session-bar, #ms-simples-chrome, [data-ms-pills]"
      )) {
        return true;
      }
      return false;
    };
    const seen = /* @__PURE__ */ new Set();
    for (const el of queryAll(config.distractionSelectors)) {
      if (isMsChrome(el)) continue;
      if (mainElement && el.contains(mainElement)) continue;
      if (mainElement && mainElement.contains(el)) continue;
      if (!seen.has(el)) {
        seen.add(el);
        distractions.push(el);
      }
    }
    return distractions;
  }

  // src/features/manualSelect.js
  var BANNER_ID = "ms-manual-select-banner";
  var HIGHLIGHT_ID = "ms-manual-select-highlight";
  var OVERLAY_CLASS = "ms-manual-select-active";
  var INSTRUCTION = "Clique ou toque no conte\xFAdo principal. Teclado: Tab escolhe, \u2191 \u2193 ampliam ou reduzem, Enter confirma, Esc cancela.";
  var CANDIDATE_SELECTOR = 'main, [role="main"], article, section, aside, div';
  var MIN_W = 120;
  var MIN_H = 60;
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
  function buildCssPath(el) {
    if (!el || el.nodeType !== 1) return "";
    if (el.id) {
      return `#${escapeIdent(el.id)}`;
    }
    const parts = [];
    let current = el;
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
  function isOwnUi(el) {
    var _a, _b, _c, _d;
    return !!(((_a = el == null ? void 0 : el.closest) == null ? void 0 : _a.call(el, "#ms-container")) || ((_b = el == null ? void 0 : el.closest) == null ? void 0 : _b.call(el, `#${BANNER_ID}`)) || ((_c = el == null ? void 0 : el.closest) == null ? void 0 : _c.call(el, `#${HIGHLIGHT_ID}`)) || // chrome da lib no light DOM: barra de sessão, switch SIMPLES e pills (QA R34 MED-2)
    ((_d = el == null ? void 0 : el.closest) == null ? void 0 : _d.call(
      el,
      "#ms-session-bar, #ms-simples-chrome, .ms-pills-nav, [data-ms-pills]"
    )));
  }
  function isCandidate(el) {
    if (!el || el === document.documentElement || el === document.body) {
      return false;
    }
    if (isOwnUi(el)) return false;
    const r = el.getBoundingClientRect();
    return r.width >= MIN_W && r.height >= MIN_H;
  }
  function describe(el) {
    const tag = el.tagName.toLowerCase();
    const name = el.getAttribute("aria-label") || el.id || (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40);
    return name ? `${tag}: ${name}` : tag;
  }
  function setCurrent(el) {
    _current = el;
    if (!_highlight || !_status) return;
    if (!el) {
      _highlight.style.display = "none";
      _status.textContent = "";
      return;
    }
    const r = el.getBoundingClientRect();
    Object.assign(_highlight.style, {
      display: "block",
      top: `${r.top + window.scrollY}px`,
      left: `${r.left + window.scrollX}px`,
      width: `${r.width}px`,
      height: `${r.height}px`
    });
    _status.textContent = ` Escolha atual: ${describe(el)}.`;
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
  function confirmSelect(el) {
    document.querySelectorAll("[data-ms-principal]").forEach((node) => {
      node.removeAttribute("data-ms-principal");
    });
    el.setAttribute("data-ms-principal", "");
    const path = buildCssPath(el);
    const cb = _callbacks == null ? void 0 : _callbacks.onSelect;
    stopManualSelect();
    if (cb) cb(el, path);
  }
  function startManualSelect(opts = {}) {
    var _a;
    stopManualSelect();
    _callbacks = opts;
    let active = document.activeElement;
    while ((_a = active == null ? void 0 : active.shadowRoot) == null ? void 0 : _a.activeElement) {
      active = active.shadowRoot.activeElement;
    }
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
    _banner.append(INSTRUCTION);
    _status = document.createElement("span");
    _banner.appendChild(_status);
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.textContent = "Cancelar";
    cancelBtn.setAttribute("aria-label", "Cancelar sele\xE7\xE3o manual");
    Object.assign(cancelBtn.style, {
      marginLeft: "1rem",
      padding: "0.3rem 0.75rem",
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
      const el = e.target;
      if (!el || el === document.documentElement || el === document.body) return;
      confirmSelect(el);
    };
    _onKey = (e) => {
      var _a2, _b, _c, _d;
      const inBanner = (_b = (_a2 = e.target) == null ? void 0 : _a2.closest) == null ? void 0 : _b.call(_a2, `#${BANNER_ID}`);
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
      const el = e.target;
      if (el && !isOwnUi(el) && el !== document.documentElement) setCurrent(el);
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
  function isManualSelectActive() {
    return _onClick !== null;
  }
  function stopManualSelect() {
    var _a;
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
    "ms-theme-soft"
  ];
  var OPTION_FLAG_CLASSES = [
    "ms-dyslexia-font",
    "ms-highlight-links",
    "ms-text-spacing",
    "ms-reduced-motion",
    "ms-hide-images",
    "ms-reading-ruler",
    "ms-simple-language"
  ];
  var _mainElement = null;
  var _distractionElements = [];
  var _manualPrincipal = null;
  var _manualPath = "";
  var _holdPrincipal = false;
  function holdPrincipal(on) {
    _holdPrincipal = !!on;
  }
  function injectPageStyles() {
    if (document.getElementById(PAGE_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = PAGE_STYLE_ID;
    style.textContent = getPageStyles();
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
  function applyOptions(state2) {
    const html = document.documentElement;
    const opts = state2.options || {};
    html.classList.remove(...TEXT_SCALE_CLASSES);
    const scale = opts.textScale || "100";
    if (scale !== "100") html.classList.add(`ms-text-scale-${scale}`);
    html.classList.remove(...THEME_CLASSES);
    const theme = opts.colorTheme || "senac";
    html.classList.add(`ms-theme-${theme}`);
    html.classList.toggle("ms-dyslexia-font", !!opts.dyslexiaFont);
    if (opts.dyslexiaFont) ensureLexendFont();
    html.classList.toggle("ms-highlight-links", !!opts.highlightLinks);
    html.classList.toggle("ms-text-spacing", !!opts.textSpacing);
    html.classList.toggle("ms-reduced-motion", !!opts.reducedMotion);
    html.classList.toggle("ms-hide-images", !!opts.hideImages);
    html.classList.toggle("ms-reading-ruler", !!opts.readingRuler);
    html.classList.toggle("ms-simple-language", !!opts.simpleLanguage);
  }
  function applyModoSimples(state2, config) {
    if (!_mainElement) scan(config);
    if (_mainElement) _mainElement.setAttribute("data-ms-principal", "");
    _distractionElements.forEach(
      (el) => el.setAttribute("data-ms-hidden", "true")
    );
    document.documentElement.classList.add("ms-ativo");
    applyOptions(state2);
  }
  function revertModoSimples() {
    document.querySelectorAll('[data-ms-hidden="true"]').forEach((el) => {
      el.removeAttribute("data-ms-hidden");
    });
    document.querySelectorAll("[data-ms-principal]").forEach((el) => {
      el.removeAttribute("data-ms-principal");
    });
    document.documentElement.classList.remove("ms-ativo");
    _mainElement = null;
    _distractionElements = [];
    _manualPrincipal = null;
    _manualPath = "";
    _holdPrincipal = false;
  }
  function revert() {
    revertModoSimples();
    document.documentElement.classList.remove(
      ...TEXT_SCALE_CLASSES,
      ...THEME_CLASSES,
      ...OPTION_FLAG_CLASSES
    );
  }
  function setPrincipal(el, config) {
    document.querySelectorAll("[data-ms-principal]").forEach((node) => {
      node.removeAttribute("data-ms-principal");
    });
    _mainElement = el;
    _manualPrincipal = el;
    _manualPath = buildCssPath(el);
    _holdPrincipal = false;
    el.setAttribute("data-ms-principal", "");
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
      const el = e.target;
      if (!(el == null ? void 0 : el.getBoundingClientRect) || el === document.body) return;
      const r = el.getBoundingClientRect();
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
  function closestSafe(el, selector) {
    var _a, _b, _c;
    if (!el) return null;
    if (typeof el.closest === "function") return el.closest(selector);
    let node = el;
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
  function isVisiblyReadable(el) {
    if (!el || closestSafe(el, "#ms-container") || closestSafe(el, "#ms-simples-chrome") || closestSafe(el, "#ms-session-bar")) {
      return false;
    }
    if (closestSafe(el, "[data-ms-hidden]")) return false;
    const html = document.documentElement;
    const msOn = html.classList.contains("ms-ativo");
    const simpleLang = html.classList.contains("ms-simple-language");
    if (msOn && closestSafe(el, ".ms-simple-hide")) return false;
    if (!msOn && closestSafe(el, ".ms-simple-only")) return false;
    if (simpleLang && closestSafe(el, "[data-ms-plain]")) return false;
    if (!simpleLang && closestSafe(el, "[data-ms-simple]")) return false;
    return (el.textContent || "").trim().length > 0;
  }
  function collectBlocks() {
    const root = getRoot();
    if (!root) return [];
    const nodes = Array.from(root.querySelectorAll(BLOCK_TAGS.join(",")));
    const readable = new Set(nodes.filter(isVisiblyReadable));
    return nodes.filter((el) => {
      if (!readable.has(el)) return false;
      let parent = el.parentElement;
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
  function highlightAndScroll(el) {
    clearHighlight();
    el.setAttribute("data-ms-tts-active", "");
    _activeEl = el;
    const reduceMotion = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (typeof el.scrollIntoView === "function") {
      try {
        el.scrollIntoView({
          block: "center",
          behavior: reduceMotion ? "auto" : "smooth"
        });
      } catch (_) {
        el.scrollIntoView(true);
      }
    }
  }
  function speakBlockAt(index, run) {
    if (!_speaking || run !== _runId) return;
    if (index >= _blocks.length) {
      stopSpeaking();
      return;
    }
    const el = _blocks[index];
    _blockIndex = index;
    highlightAndScroll(el);
    const text = (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
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
  function isSpeaking() {
    if (typeof speechSynthesis !== "undefined" && speechSynthesis.speaking) {
      return true;
    }
    return _speaking;
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
    for (const el of all) {
      if (!el.hasAttribute("data-ms-injected")) return el;
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

  // src/modo-simples.js
  var textLength = (el) => (el && el.textContent || "").trim().length;
  var STATE_KEY = "state";
  var PRINCIPAL_KEY = "principal";
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
      injectPageStyles();
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
      if (currentState.modoSimples) {
        this._activateModoSimples(currentState, { announce: false });
        this._announceRestoredOnce();
      }
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
      var _a;
      if (!this._initialized) return;
      if (this._removeSpeakListener) {
        this._removeSpeakListener();
        this._removeSpeakListener = null;
      }
      stopReadingRuler();
      stopSpeaking();
      stopManualSelect();
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
      if ((_a = this._host) == null ? void 0 : _a.parentNode) this._host.parentNode.removeChild(this._host);
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
    _setModoSimples(on) {
      if (on) {
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
    _saveHideImagesBeforeMs(hide) {
      this._hideImagesBeforeMs = !!hide;
      if (!this._config.persistence) return;
      const key = "hideImagesBeforeMs";
      if (this._config.hostnamePersistence) {
        persistence_default.saveForHost(key, !!hide);
      } else {
        persistence_default.save(key, !!hide);
      }
    }
    /** Lê e esquece o valor guardado; sem registro (ex.: MS já estava ligado) = imagens visíveis. */
    _takeHideImagesBeforeMs() {
      let hide = this._hideImagesBeforeMs;
      if (hide === null && this._config.persistence) {
        const key = "hideImagesBeforeMs";
        hide = this._config.hostnamePersistence ? persistence_default.loadForHost(key, null) : persistence_default.load(key, null);
      }
      this._hideImagesBeforeMs = null;
      if (this._config.persistence) {
        const key = "hideImagesBeforeMs";
        if (this._config.hostnamePersistence) {
          persistence_default.removeForHost(key);
        } else {
          persistence_default.remove(key);
        }
      }
      return !!hide;
    }
    _loadPreferShowImages() {
      if (!this._config.persistence) return false;
      const key = "preferShowImagesInMs";
      const v = this._config.hostnamePersistence ? persistence_default.loadForHost(key, false) : persistence_default.load(key, false);
      return !!v;
    }
    _savePreferShowImages(show) {
      if (!this._config.persistence) return;
      const key = "preferShowImagesInMs";
      if (this._config.hostnamePersistence) {
        persistence_default.saveForHost(key, !!show);
      } else {
        persistence_default.save(key, !!show);
      }
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
    _buildUI() {
      this._host = document.createElement("div");
      this._host.id = "ms-container";
      document.body.appendChild(this._host);
      this._shadow = this._host.attachShadow({ mode: "open" });
      const styleEl = document.createElement("style");
      styleEl.textContent = getUIStyles(this._config.position);
      this._shadow.appendChild(styleEl);
      this._styleEl = styleEl;
      const s = state_default.get();
      this._panel = createA11yPanel({
        state: s,
        onClose: () => this._closePanel(),
        onToggleModoSimples: (value) => this._setModoSimples(value),
        onSetOption: (key, value) => {
          if (key === "reducedMotion") this._reducedMotionUser = !!value;
          state_default.set({ options: { [key]: value } });
          if (key === "hideImages" && state_default.get().modoSimples) {
            this._savePreferShowImages(!value);
          }
        },
        onSpeak: () => this._toggleSpeak(),
        brand: this._config.brand
      });
      this._shadow.appendChild(this._panel.element);
      this._fab = createFab({
        onClick: () => this._togglePanel()
      });
      this._shadow.appendChild(this._fab.element);
      this._fab.sync({ panelOpen: s.panelOpen });
      this._panel.sync(s);
      if (s.panelOpen) {
        this._panel.open();
        this._setPageInert(true);
      }
      this._syncSessionChrome();
      this._simpleNav = createSimpleNav();
      this._syncSimpleNav();
      if (this._chrome) this._chrome.sync(s);
    }
    /** Cria/destrói a barra de sessão conforme config.sessionBar (default: desligada). */
    _syncSessionChrome() {
      if (this._config.sessionBar && !this._chrome) {
        this._chrome = createSessionChrome({
          mount: this._config.mount || {},
          onToggleModoSimples: (value) => this._setModoSimples(value),
          onOpenPanel: () => this._openPanel(),
          onSpeak: () => this._toggleSpeak(),
          onToggleSimpleLanguage: (value) => state_default.set({ options: { simpleLanguage: value } }),
          onToggleHideImages: (hide) => {
            state_default.set({ options: { hideImages: hide } });
            if (state_default.get().modoSimples) this._savePreferShowImages(!hide);
          }
        });
        this._chrome.sync(state_default.get());
      } else if (!this._config.sessionBar && this._chrome) {
        this._chrome.destroy();
        this._chrome = null;
      }
    }
    _syncSimpleNav() {
      if (!this._simpleNav) return;
      this._simpleNav.sync(this._config.simpleNav);
      if (this._chrome) this._chrome.sync(state_default.get());
    }
    // ── Events ─────────────────────────────────────────────────────────────────
    _bindEvents() {
      this._onDocKeydown = (e) => {
        if (e.key === "Escape" && state_default.get().panelOpen) {
          this._closePanel();
        }
      };
      document.addEventListener("keydown", this._onDocKeydown);
      this._onDocClick = (e) => {
        var _a, _b, _c;
        if (!state_default.get().panelOpen) return;
        if (isManualSelectActive()) return;
        const path = typeof e.composedPath === "function" ? e.composedPath() : [];
        if (path.includes(this._host) || path.includes((_a = this._panel) == null ? void 0 : _a.element) || path.includes((_b = this._fab) == null ? void 0 : _b.element)) {
          return;
        }
        if (e.target === this._host) return;
        if (!((_c = this._host) == null ? void 0 : _c.contains(e.target)) && e.target !== this._host) {
          this._closePanel();
        }
      };
      document.addEventListener("click", this._onDocClick, true);
      this._removeStateListener = eventBus_default.on("stateChange", ({ prev, next }) => {
        this._onStateChange(prev, next);
      });
      this._removeSpeakListener = onSpeakingChange(
        (speaking) => this._syncSpeaking(speaking)
      );
    }
    // ── Panel management ───────────────────────────────────────────────────────
    _togglePanel() {
      state_default.get().panelOpen ? this._closePanel() : this._openPanel();
    }
    _openPanel() {
      var _a;
      let opener = document.activeElement;
      while ((_a = opener == null ? void 0 : opener.shadowRoot) == null ? void 0 : _a.activeElement) {
        opener = opener.shadowRoot.activeElement;
      }
      if (opener !== document.body && !this._panel.element.contains(opener)) {
        this._panelOpener = opener;
      }
      state_default.set({ panelOpen: true });
      this._panel.open();
      this._setPageInert(true);
      this._fab.sync({ panelOpen: true });
      announce("Painel de acessibilidade aberto");
    }
    /**
     * aria-modal não esconde a página de ninguém: enquanto o painel está aberto, os irmãos do
     * host no <body> ficam `inert` (sem foco, clique ou leitura). Só desfaz o que ela mesma fez.
     * @param {boolean} on
     */
    _setPageInert(on) {
      for (const el of this._inerted || []) el.removeAttribute("inert");
      this._inerted = [];
      if (!on) return;
      for (const el of document.body.children) {
        if (el === this._host || el.hasAttribute("inert") || el.hasAttribute("data-ms-live") || el.id === "ms-manual-select-banner" || el.id === "ms-manual-select-highlight") {
          continue;
        }
        el.setAttribute("inert", "");
        this._inerted.push(el);
      }
    }
    _closePanel() {
      var _a, _b, _c;
      state_default.set({ panelOpen: false });
      this._panel.close();
      this._setPageInert(false);
      this._fab.sync({ panelOpen: false });
      if (!isManualSelectActive()) {
        const opener = ((_a = this._panelOpener) == null ? void 0 : _a.isConnected) ? this._panelOpener : (_b = this._fab) == null ? void 0 : _b.button;
        (_c = opener == null ? void 0 : opener.focus) == null ? void 0 : _c.call(opener);
      }
      this._panelOpener = null;
    }
    _toggleSpeak() {
      if (isSpeaking()) {
        stopSpeaking();
        announce("Leitura interrompida");
      } else {
        speakMainContent();
        announce("Lendo conte\xFAdo principal");
      }
    }
    _syncSpeaking(speaking) {
      const s = state_default.get();
      if (this._panel) this._panel.sync(s, { speaking });
      if (this._chrome) this._chrome.sync(s, { speaking });
    }
    // ── Modo Simples activation ────────────────────────────────────────────────
    _activateModoSimples(currentState, { announce: doAnnounce = true } = {}) {
      const saved = this._loadPrincipal();
      if (saved) {
        let el = null;
        try {
          el = document.querySelector(saved.path);
        } catch (_) {
        }
        if (el && this._isPlausiblePrincipal(el, saved)) {
          this._savePrincipalPath(saved.path, el);
          setPrincipal(el, this._config);
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
        this._setPageInert(false);
        startManualSelect({
          onSelect: (el, path) => {
            this._setPageInert(state_default.get().panelOpen);
            setPrincipal(el, this._config);
            this._savePrincipalPath(path, el);
            applyModoSimples(state_default.get(), this._config);
            announce("Conte\xFAdo principal definido");
          },
          onCancel: () => {
            this._setPageInert(state_default.get().panelOpen);
            announce("Sele\xE7\xE3o manual cancelada");
          }
        });
      } else {
        applyModoSimples(currentState, this._config);
      }
      if (doAnnounce) announce("Modo Simples ativado");
    }
    // ── State reactions ────────────────────────────────────────────────────────
    _onStateChange(prev, next) {
      if (this._fab) this._fab.sync({ panelOpen: next.panelOpen });
      if (this._panel) this._panel.sync(next, { speaking: isSpeaking() });
      if (this._chrome) this._chrome.sync(next, { speaking: isSpeaking() });
      if (prev.modoSimples !== next.modoSimples) {
        if (next.modoSimples) {
          this._activateModoSimples(next);
        } else {
          stopManualSelect();
          revertModoSimples();
          applyOptions(next);
          announce("Modo Simples desativado");
        }
      }
      const optionKeys = [
        "textScale",
        "colorTheme",
        "dyslexiaFont",
        "readingRuler",
        "highlightLinks",
        "textSpacing",
        "reducedMotion",
        "hideImages",
        "simpleLanguage"
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
        announce(
          next.options.readingRuler ? "R\xE9gua de leitura ativada" : "R\xE9gua de leitura desativada"
        );
      }
      const announcements = {
        dyslexiaFont: ["Fonte Lexend ativada", "Fonte Lexend desativada"],
        highlightLinks: [
          "Destaque de links ativado",
          "Destaque de links desativado"
        ],
        textSpacing: [
          "Espa\xE7amento de texto ativado",
          "Espa\xE7amento de texto desativado"
        ],
        hideImages: ["Imagens ocultadas", "Imagens vis\xEDveis"],
        reducedMotion: [
          "Movimento reduzido ativado",
          "Movimento reduzido desativado"
        ],
        simpleLanguage: [
          "Linguagem simples ligada",
          "Linguagem simples desligada"
        ]
      };
      Object.entries(announcements).forEach(([k, [on, off]]) => {
        if (prev.options[k] !== next.options[k])
          announce(next.options[k] ? on : off);
      });
      if (prev.options.textScale !== next.options.textScale) {
        announce(`Tamanho do texto ${next.options.textScale}%`);
      }
      if (prev.options.colorTheme !== next.options.colorTheme) {
        const labels = {
          senac: "Cores do site",
          yellowBlack: "Amarelo e Preto",
          darkHigh: "Modo Escuro Alto",
          soft: "Descanso Suave"
        };
        announce(
          `Tema ${labels[next.options.colorTheme] || next.options.colorTheme}`
        );
      }
      this._persistState(next);
    }
    // ── Persistence ────────────────────────────────────────────────────────────
    _persistState(next) {
      if (!this._config.persistence) return;
      const payload = {
        v: SCHEMA_VERSION,
        modoSimples: next.modoSimples,
        // reducedMotion só é gravado quando o usuário escolheu (null = derivado do SO)
        options: { ...next.options, reducedMotion: this._reducedMotionUser }
      };
      const json = JSON.stringify(payload);
      if (json === this._lastPersisted) return;
      this._lastPersisted = json;
      if (this._config.hostnamePersistence) {
        persistence_default.saveForHost(STATE_KEY, payload);
      } else {
        persistence_default.save(STATE_KEY, payload);
      }
    }
    _loadPersistedState() {
      if (!this._config.persistence) return;
      const saved = this._config.hostnamePersistence ? persistence_default.loadForHost(STATE_KEY) : persistence_default.load(STATE_KEY);
      if (!saved) return;
      const patch = hydratePersistedState(saved);
      if (patch) state_default.set(patch);
      const rm = saved.options && saved.options.reducedMotion;
      const isUserChoice = saved.v >= 1 && typeof rm === "boolean";
      this._reducedMotionUser = isUserChoice ? rm : null;
    }
    /** Grava o principal escolhido POR PÁGINA, com o tamanho do texto para validar depois. */
    _savePrincipalPath(path, el) {
      if (!this._config.persistence || !path) return;
      persistence_default.saveForPath(PRINCIPAL_KEY, {
        path,
        textLen: textLength(el)
      });
    }
    /**
     * Principal salvo para ESTA página. Sem registro de página, aceita o registro antigo (por host,
     * string) — ele só vale se passar na validação, e é migrado para a página (IMP-06).
     * @returns {{ path: string, textLen: number|null, legacy: boolean } | null}
     */
    _loadPrincipal() {
      if (!this._config.persistence) return null;
      let v = persistence_default.loadForPath(PRINCIPAL_KEY);
      const viaHost = v == null;
      if (viaHost) {
        v = this._config.hostnamePersistence ? persistence_default.loadForHost(PRINCIPAL_KEY) : persistence_default.load(PRINCIPAL_KEY);
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
    /**
     * Esquece o principal salvo DESTA página. O registro antigo por host nunca é apagado aqui:
     * ele é só uma dica, e falhar numa página não diz nada sobre as outras.
     */
    _discardPrincipal() {
      if (!this._config.persistence) return;
      persistence_default.removeForPath(PRINCIPAL_KEY);
    }
    /**
     * O elemento achado pelo caminho salvo ainda parece a área de conteúdo? Exige o mínimo de
     * texto da heurística (scoring.minTextLength) e, quando conhecido, não menos que metade do
     * tamanho de quando foi escolhido.
     */
    _isPlausiblePrincipal(el, saved) {
      const len = textLength(el);
      if (len < this._config.scoring.minTextLength) return false;
      if (saved.textLen && len < saved.textLen * 0.5) return false;
      if (saved.legacy) return this._legacyHintFits(el, len);
      return true;
    }
    /**
     * Registro antigo (por host, sem tamanho gravado) é só uma dica: além do mínimo de texto, quando
     * a heurística tem confiança nesta página o elemento da dica não pode ser bem menor que o
     * candidato dela (< 50% do texto) — outra página do host com a mesma estrutura de caminho.
     */
    _legacyHintFits(el, len) {
      const { element, confidence } = detectMainContent(this._config);
      if (confidence < this._config.confidenceThreshold || element === el) {
        return true;
      }
      return len >= textLength(element) * 0.5;
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
