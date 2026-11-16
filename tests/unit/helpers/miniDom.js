/**
 * Mini DOM para testes unitários da UI/mutator (sem jsdom).
 * Suficiente para createElement, innerHTML simples, querySelector e classList.
 */

function createClassList(el) {
  const set = new Set();
  const syncClassAttr = () => {
    const v = [...set].join(' ');
    if (v) el._attrs.set('class', v);
    else el._attrs.delete('class');
  };
  return {
    add(...tokens) {
      for (const t of tokens) {
        if (t) set.add(String(t));
      }
      syncClassAttr();
    },
    remove(...tokens) {
      for (const t of tokens) set.delete(String(t));
      syncClassAttr();
    },
    toggle(token, force) {
      const t = String(token);
      const should = force === undefined ? !set.has(t) : !!force;
      if (should) set.add(t);
      else set.delete(t);
      syncClassAttr();
      return should;
    },
    contains(token) {
      return set.has(String(token));
    },
    _set: set,
  };
}

function parseAttrs(attrStr, el) {
  if (!attrStr) return;
  const re =
    /([a-zA-Z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let m;
  while ((m = re.exec(attrStr))) {
    const name = m[1];
    if (name === '/' || name.toLowerCase() === 'hidden') {
      if (name.toLowerCase() === 'hidden') el.hidden = true;
      continue;
    }
    const value = m[2] ?? m[3] ?? m[4] ?? '';
    if (name === 'class') el.className = value;
    else if (name === 'id') el.id = value;
    else el.setAttribute(name, value);
  }
  if (/\bhidden\b/i.test(attrStr) && !/hidden\s*=/.test(attrStr)) {
    el.hidden = true;
  }
}

function matchesSimple(el, selector) {
  const s = selector.trim();
  if (!s) return false;

  // Compound: tag.class or tag[attr]
  const attrMatch = s.match(
    /^([a-z0-9]*)\[([a-zA-Z_:][\w:.-]*)(?:=["']?([^"'\]]*)["']?)?\]$/i,
  );
  if (attrMatch) {
    const [, tag, attr, val] = attrMatch;
    if (tag && el.tagName.toLowerCase() !== tag.toLowerCase()) return false;
    if (val === undefined) return el.hasAttribute(attr);
    return el.getAttribute(attr) === val;
  }

  const classMatch = s.match(/^([a-z0-9]+)?\.([a-zA-Z0-9_-]+)$/i);
  if (classMatch) {
    const [, tag, cls] = classMatch;
    if (tag && el.tagName.toLowerCase() !== tag.toLowerCase()) return false;
    return el.classList.contains(cls);
  }

  if (s.startsWith('#')) return el.id === s.slice(1);
  if (s.startsWith('.')) return el.classList.contains(s.slice(1));
  if (/^[a-z][a-z0-9]*$/i.test(s))
    return el.tagName.toLowerCase() === s.toLowerCase();
  return false;
}

function matchesSelector(el, selector) {
  const parts = selector.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return matchesSimple(el, parts[0]);

  // Descendant: A B C — walk ancestors for each prior part
  let node = el;
  for (let i = parts.length - 1; i >= 0; i--) {
    let found = null;
    while (node) {
      if (matchesSimple(node, parts[i])) {
        found = node;
        break;
      }
      node = node.parentElement;
    }
    if (!found) return false;
    node = found.parentElement;
  }
  return true;
}

function walk(el, fn) {
  fn(el);
  for (const child of el.children) walk(child, fn);
}

export function createElement(tagName) {
  const tag = String(tagName).toLowerCase();
  const el = {
    nodeType: 1,
    tagName: tag.toUpperCase(),
    children: [],
    parentElement: null,
    _attrs: new Map(),
    _listeners: Object.create(null),
    hidden: false,
    style: {},
    id: '',
    classList: null,
    get className() {
      return [...this.classList._set].join(' ');
    },
    set className(v) {
      this.classList._set.clear();
      String(v || '')
        .split(/\s+/)
        .filter(Boolean)
        .forEach((c) => this.classList._set.add(c));
      const joined = [...this.classList._set].join(' ');
      if (joined) this._attrs.set('class', joined);
      else this._attrs.delete('class');
    },
    get textContent() {
      let t = this._text || '';
      for (const c of this.children) t += c.textContent || '';
      return t;
    },
    set textContent(v) {
      this.children.length = 0;
      this._text = v == null ? '' : String(v);
    },
    setAttribute(name, value) {
      const n = String(name);
      const val = String(value);
      this._attrs.set(n, val);
      if (n === 'class') this.className = val;
      if (n === 'id') this.id = val;
      if (n === 'hidden') this.hidden = val !== 'false';
    },
    getAttribute(name) {
      const n = String(name);
      if (n === 'id') return this.id || null;
      if (n === 'class') return this.className || null;
      return this._attrs.has(n) ? this._attrs.get(n) : null;
    },
    hasAttribute(name) {
      const n = String(name);
      if (n === 'id') return !!this.id;
      if (n === 'class') return this.classList._set.size > 0;
      return this._attrs.has(n);
    },
    removeAttribute(name) {
      const n = String(name);
      this._attrs.delete(n);
      if (n === 'id') this.id = '';
      if (n === 'class') this.className = '';
      if (n === 'hidden') this.hidden = false;
    },
    appendChild(child) {
      if (child.parentElement) {
        const sibs = child.parentElement.children;
        const i = sibs.indexOf(child);
        if (i >= 0) sibs.splice(i, 1);
      }
      child.parentElement = this;
      this.children.push(child);
      return child;
    },
    prepend(child) {
      if (child.parentElement) {
        const sibs = child.parentElement.children;
        const i = sibs.indexOf(child);
        if (i >= 0) sibs.splice(i, 1);
      }
      child.parentElement = this;
      this.children.unshift(child);
      return child;
    },
    remove() {
      if (!this.parentElement) return;
      const sibs = this.parentElement.children;
      const i = sibs.indexOf(this);
      if (i >= 0) sibs.splice(i, 1);
      this.parentElement = null;
    },
    insertAdjacentElement(position, element) {
      const parent = this.parentElement;
      if (position === 'afterend') {
        if (!parent) return null;
        const i = parent.children.indexOf(this);
        if (element.parentElement) {
          const sibs = element.parentElement.children;
          const j = sibs.indexOf(element);
          if (j >= 0) sibs.splice(j, 1);
        }
        element.parentElement = parent;
        parent.children.splice(i + 1, 0, element);
        return element;
      }
      if (position === 'beforebegin') {
        if (!parent) return null;
        const i = parent.children.indexOf(this);
        if (element.parentElement) {
          const sibs = element.parentElement.children;
          const j = sibs.indexOf(element);
          if (j >= 0) sibs.splice(j, 1);
        }
        element.parentElement = parent;
        parent.children.splice(i, 0, element);
        return element;
      }
      if (position === 'beforeend') return this.appendChild(element);
      if (position === 'afterbegin') return this.prepend(element);
      return null;
    },
    get nextElementSibling() {
      if (!this.parentElement) return null;
      const sibs = this.parentElement.children;
      const i = sibs.indexOf(this);
      return i >= 0 && i < sibs.length - 1 ? sibs[i + 1] : null;
    },
    querySelector(sel) {
      const all = this.querySelectorAll(sel);
      return all[0] || null;
    },
    querySelectorAll(sel) {
      const out = [];
      for (const child of this.children) {
        walk(child, (node) => {
          if (matchesSelector(node, sel)) out.push(node);
        });
      }
      return out;
    },
    contains(other) {
      if (other === this) return true;
      let n = other;
      while (n) {
        if (n === this) return true;
        n = n.parentElement;
      }
      return false;
    },
    addEventListener(type, fn) {
      if (!this._listeners[type]) this._listeners[type] = [];
      this._listeners[type].push(fn);
    },
    set innerHTML(html) {
      this.children.length = 0;
      this._text = '';
      const cleaned = String(html || '').replace(/<svg[\s\S]*?<\/svg>/gi, '');
      const stack = [this];
      const re = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>|([^<]+)/g;
      let m;
      while ((m = re.exec(cleaned))) {
        if (m[3] != null) {
          const text = m[3];
          if (!text.trim()) continue;
          const parent = stack[stack.length - 1];
          parent._text = (parent._text || '') + text;
          continue;
        }
        const name = m[1];
        const isClose = cleaned[m.index + 1] === '/';
        if (isClose) {
          if (stack.length > 1) stack.pop();
          continue;
        }
        const child = createElement(name);
        parseAttrs(m[2] || '', child);
        stack[stack.length - 1].appendChild(child);
        const selfClosing =
          /\/\s*$/.test(m[2] || '') ||
          ['br', 'img', 'input', 'hr', 'meta', 'link'].includes(
            name.toLowerCase(),
          );
        if (!selfClosing) stack.push(child);
      }
    },
    get innerHTML() {
      return '';
    },
  };
  el.classList = createClassList(el);
  return el;
}

/**
 * Instala document + documentElement/body mínimos no global.
 * @returns {{ html: Element, body: Element, restore: () => void }}
 */
export function installDocument(extraSetup) {
  const previous = global.document;
  const html = createElement('html');
  const body = createElement('body');
  html.appendChild(body);
  const head = createElement('head');
  html.appendChild(head);

  const doc = {
    documentElement: html,
    head,
    body,
    createElement,
    getElementById(id) {
      const want = String(id);
      let found = null;
      walk(html, (node) => {
        if (node.id === want) found = node;
      });
      return found;
    },
    querySelector(sel) {
      if (matchesSelector(html, sel)) return html;
      return html.querySelector(sel);
    },
    querySelectorAll(sel) {
      const out = [];
      if (matchesSelector(html, sel)) out.push(html);
      walk(html, (node) => {
        if (node !== html && matchesSelector(node, sel)) out.push(node);
      });
      return out;
    },
  };

  global.document = doc;
  if (typeof extraSetup === 'function') extraSetup(doc, html, body);

  return {
    html,
    body,
    document: doc,
    restore() {
      if (previous === undefined) delete global.document;
      else global.document = previous;
    },
  };
}
