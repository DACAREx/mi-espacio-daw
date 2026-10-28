/* =========================================================
   Mi espacio DAW · aplicación
   Web estática: lee los JSON de /data y pinta las páginas.
   Rutas (con #):  #/                       portada
                   #/dwes                   asignatura
                   #/dwes/tema-01           tema
                   #/dwes/tema-01/ejercicios         listado
                   #/dwes/tema-01/ejercicios/ej-01   ejercicio
                   #/buscar   #/info
   ========================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     Utilidades
     --------------------------------------------------------- */
  const $ = (sel, el) => (el || document).querySelector(sel);

  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    add(el, children);
    return el;
  }
  function add(el, children) {
    for (const c of children.flat(Infinity)) {
      if (c == null || c === false) continue;
      el.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return el;
  }

  const ICONS = {
    book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    check: '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    done: '<polyline points="20 6 9 17 4 12"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    github: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
    play: '<polygon points="5 3 19 12 5 21 5 3"/>',
    stop: '<rect x="5" y="5" width="14" height="14" rx="1"/>',
    refresh: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
    terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
    server: '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>',
    cloud: '<polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    school: '<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'
  };
  function icon(name) {
    return h('span', { class: 'icon', 'aria-hidden': 'true', html: '<svg viewBox="0 0 24 24" focusable="false">' + (ICONS[name] || ICONS.file) + '</svg>' });
  }

  const TIPOS = {
    teoria: { label: 'Teoría', singular: 'Teoría', desc: 'Apuntes, explicaciones y documentos.', icon: 'book' },
    ejemplos: { label: 'Ejemplos', singular: 'Ejemplo', desc: 'Ejemplos prácticos, código comentado y demostraciones.', icon: 'code' },
    ejercicios: { label: 'Ejercicios', singular: 'Ejercicio', desc: 'Enunciados, soluciones y archivos de código.', icon: 'check' }
  };
  const TIPO_KEYS = Object.keys(TIPOS);

  const norm = (s) => String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const plural = (n, uno, varios) => n + ' ' + (n === 1 ? uno : varios);
  const link = (...seg) => '#/' + seg.map(encodeURIComponent).join('/');

  async function fetchJSON(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error('No se pudo cargar ' + url + ' (HTTP ' + r.status + ')');
    return r.json();
  }
  const textCache = new Map();
  async function fetchText(url) {
    if (textCache.has(url)) return textCache.get(url);
    const r = await fetch(url);
    if (!r.ok) throw new Error('No se pudo cargar ' + url + ' (HTTP ' + r.status + ')');
    const t = await r.text();
    textCache.set(url, t);
    return t;
  }

  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
  }
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      const ta = h('textarea', { 'aria-hidden': 'true', style: 'position:fixed;opacity:0;top:0;left:0' });
      ta.value = text;
      document.body.append(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
      ta.remove();
      return ok;
    }
  }

  /* ---------------------------------------------------------
     Datos
     --------------------------------------------------------- */
  const store = { site: null, asigs: [], index: null };

  async function loadData() {
    const site = await fetchJSON('data/site.json');
    await Promise.all(site.asignaturas.map(async (a) => {
      const data = await fetchJSON(a.datos);
      a.temas = data.temas || [];
    }));
    for (const a of site.asignaturas) {
      a.id = String(a.id).toLowerCase();
      a.tipos = (a.apartados || ['teoria', 'ejercicios']).filter((k) => TIPOS[k]);
      a.temas.forEach((t, ti) => {
        t.asig = a;
        t.num = t.numero != null ? t.numero : null;
        t.etiquetas = t.etiquetas || [];
        for (const tipo of TIPO_KEYS) {
          t[tipo] = t[tipo] || [];
          t[tipo].forEach((it, i) => {
            it.tipo = tipo;
            it.tema = t;
            it.id = String(it.id != null ? it.id : tipo.slice(0, 2) + '-' + (i + 1));
            it.num = it.numero != null ? it.numero : i + 1;
            it.etiquetas = it.etiquetas || [];
            it.archivos = it.archivos || [];
          });
        }
      });
    }
    store.site = site;
    store.asigs = site.asignaturas;
  }

  const findAsig = (id) => store.asigs.find((a) => a.id === String(id).toLowerCase());
  const findTema = (a, id) => a.temas.find((t) => t.id === id);
  const itemLabel = (it) => TIPOS[it.tipo].singular + ' ' + it.num;
  const temaLabel = (t) => (t.num != null ? 'Tema ' + t.num : t.titulo);
  const temaFullTitle = (t) => (t.num != null ? 'Tema ' + t.num + ': ' + t.titulo : t.titulo);

  function allItems(scope) {
    const temas = scope.temas || [scope];
    const out = [];
    for (const t of temas) for (const tipo of TIPO_KEYS) out.push(...t[tipo]);
    return out;
  }
  const realTemas = (a) => a.temas.filter((t) => !t.ejemplo);

  /* ---------------------------------------------------------
     Texto con formato mínimo (Markdown reducido)
     Admite: párrafos, ## títulos, listas, `código`, **negrita**,
     [enlaces](https://...) y bloques ```lenguaje
     --------------------------------------------------------- */
  function inline(s) {
    const out = [];
    const re = /`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
    let last = 0, m;
    while ((m = re.exec(s))) {
      if (m.index > last) out.push(s.slice(last, m.index));
      if (m[1]) out.push(h('code', null, m[1]));
      else if (m[2]) out.push(h('strong', null, m[2]));
      else out.push(h('a', { href: m[4], target: '_blank', rel: 'noopener noreferrer' }, m[3]));
      last = re.lastIndex;
    }
    if (last < s.length) out.push(s.slice(last));
    return out;
  }

  function codeBlock(code, lang) {
    return h('pre', { class: 'code-block', tabindex: '0' }, h('code', { html: DAWHighlight.render(code, lang || 'text') }));
  }

  function renderText(src) {
    const root = h('div', { class: 'prose' });
    const lines = String(src).replace(/\r\n?/g, '\n').split('\n');
    const ulRe = /^\s*[-*]\s+/, olRe = /^\s*\d+[.)]\s+/;
    let para = [], i = 0, m;
    const flush = () => { if (para.length) { root.append(h('p', null, inline(para.join(' ')))); para = []; } };
    while (i < lines.length) {
      const line = lines[i];
      if ((m = line.match(/^```\s*([\w+-]*)\s*$/))) {
        flush();
        const buf = [];
        i++;
        while (i < lines.length && !/^```\s*$/.test(lines[i])) buf.push(lines[i++]);
        i++;
        root.append(codeBlock(buf.join('\n'), m[1]));
      } else if ((m = line.match(/^(#{2,3})\s+(.*)$/))) {
        flush();
        root.append(h(m[1].length === 2 ? 'h3' : 'h4', null, inline(m[2])));
        i++;
      } else if (ulRe.test(line) || olRe.test(line)) {
        flush();
        const re = ulRe.test(line) ? ulRe : olRe;
        const list = h(re === ulRe ? 'ul' : 'ol');
        while (i < lines.length && re.test(lines[i])) list.append(h('li', null, inline(lines[i++].replace(re, ''))));
        root.append(list);
      } else if (line.trim() === '') {
        flush();
        i++;
      } else {
        para.push(line.trim());
        i++;
      }
    }
    flush();
    return root;
  }

  // Un campo de texto puede ser: cadena, lista de líneas o { "archivo": "ruta.md" }
  async function resolveText(item, value) {
    if (value == null) return null;
    if (Array.isArray(value)) return value.join('\n');
    if (typeof value === 'object' && value.archivo) return fetchText(fileUrl(item, value.archivo));
    return String(value);
  }

  /* ---------------------------------------------------------
     Archivos de un elemento
     --------------------------------------------------------- */
  const IMG_EXT = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'];

  function fileUrl(item, ruta) {
    if (/^(https?:)?\/\//.test(ruta) || !item.carpeta) return encodeURI(ruta);
    return encodeURI(item.carpeta.replace(/\/?$/, '/') + ruta);
  }

  function normFile(item, f) {
    const o = typeof f === 'string' ? { ruta: f } : Object.assign({}, f);
    const nombre = o.nombre || o.ruta.split('/').pop();
    const ext = (nombre.includes('.') ? nombre.split('.').pop() : '').toLowerCase();
    let kind = 'binary', lang = o.lenguaje || DAWHighlight.fromExtension(ext);
    if (ext === 'pdf') kind = 'pdf';
    else if (IMG_EXT.includes(ext)) kind = 'image';
    else if (o.lenguaje || lang) kind = 'text';
    return { nombre, ext, kind, lang: lang || 'text', url: fileUrl(item, o.ruta), etiqueta: o.etiqueta };
  }

  const kindLabel = (f) => (f.kind === 'text' ? DAWHighlight.label(f.lang) : f.kind === 'pdf' ? 'PDF' : f.kind === 'image' ? 'Imagen' : f.ext ? f.ext.toUpperCase() : 'Archivo');

  /* ---------------------------------------------------------
     Visor de archivos (pestañas, copiar, descargar, PDF)
     --------------------------------------------------------- */
  function showFile(f, panel) {
    const actions = h('div', { class: 'file-actions' });
    const body = h('div');
    panel.replaceChildren(
      h('div', { class: 'file-bar' },
        h('div', { class: 'file-meta' }, icon('file'), h('span', { class: 'fname' }, f.nombre), h('span', { class: 'chip' }, kindLabel(f)), f.etiqueta && f.kind !== 'image' ? h('span', null, f.etiqueta) : null),
        actions),
      body);

    let copyBtn = null;
    if (f.kind === 'text') {
      copyBtn = h('button', { type: 'button', class: 'btn btn-sm', disabled: true }, icon('copy'), 'Copiar código');
      actions.append(copyBtn);
    }
    if (f.kind === 'pdf') {
      actions.append(h('a', { class: 'btn btn-sm', href: f.url, target: '_blank', rel: 'noopener' }, icon('external'), 'Abrir en otra pestaña'));
    }
    actions.append(h('a', { class: 'btn btn-sm', href: f.url, download: f.nombre }, icon('download'), f.kind === 'text' ? 'Descargar código' : f.kind === 'pdf' ? 'Descargar PDF' : 'Descargar'));

    if (f.kind === 'text') {
      body.append(h('div', { class: 'viewer-state' }, 'Cargando…'));
      fetchText(f.url).then((txt) => {
        body.replaceChildren(h('pre', { tabindex: '0', 'aria-label': 'Código de ' + f.nombre }, h('code', { html: DAWHighlight.render(txt, f.lang) })));
        copyBtn.disabled = false;
        copyBtn.addEventListener('click', async () => toast((await copyText(txt)) ? 'Código copiado al portapapeles' : 'No se pudo copiar: selecciona el código y usa Ctrl+C'));
      }).catch(() => {
        body.replaceChildren(h('div', { class: 'viewer-state', role: 'alert' }, 'No se pudo cargar «' + f.url + '». Comprueba que el archivo existe y que la ruta del JSON es correcta.'));
      });
    } else if (f.kind === 'pdf') {
      body.append(h('object', { class: 'pdf-frame', data: f.url, type: 'application/pdf', 'aria-label': 'Documento PDF ' + f.nombre },
        h('div', { class: 'viewer-state' }, 'Tu navegador no puede mostrar el PDF aquí. ',
          h('a', { href: f.url, target: '_blank', rel: 'noopener' }, 'Ábrelo en otra pestaña'), ' o descárgalo con el botón de arriba.')));
    } else if (f.kind === 'image') {
      body.append(h('div', { class: 'img-frame' }, h('img', { src: f.url, alt: f.etiqueta || f.nombre })));
    } else {
      body.append(h('div', { class: 'viewer-state' }, 'Este tipo de archivo no se puede mostrar en el navegador. Usa el botón «Descargar».'));
    }
  }

  function buildViewer(files) {
    const panel = h('div', { id: 'viewer-panel' });
    const head = h('div', { class: 'viewer-head' });
    const tabs = [];
    let current = 0;

    function select(i) {
      current = i;
      tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(j === i)); t.tabIndex = j === i ? 0 : -1; });
      if (tabs.length) panel.setAttribute('aria-labelledby', 'tab-' + i);
      showFile(files[i], panel);
    }

    if (files.length > 1) {
      const list = h('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Archivos' });
      files.forEach((f, i) => {
        const b = h('button', { type: 'button', class: 'tab', role: 'tab', id: 'tab-' + i, 'aria-controls': 'viewer-panel', 'aria-selected': 'false', tabindex: '-1', onclick: () => select(i) }, f.nombre);
        tabs.push(b);
        list.append(b);
      });
      list.addEventListener('keydown', (e) => {
        let n = current;
        if (e.key === 'ArrowRight') n = (current + 1) % files.length;
        else if (e.key === 'ArrowLeft') n = (current - 1 + files.length) % files.length;
        else if (e.key === 'Home') n = 0;
        else if (e.key === 'End') n = files.length - 1;
        else return;
        e.preventDefault();
        select(n);
        tabs[n].focus();
      });
      panel.setAttribute('role', 'tabpanel');
      head.append(list);
    }
    const wrap = h('div', { class: 'viewer' }, head.childNodes.length ? head : null, panel);
    select(0);
    return wrap;
  }

  /* ---------------------------------------------------------
     Demostración aislada (iframe con sandbox)
     Une el HTML con los CSS y JS del mismo ejercicio en un solo
     documento. El iframe no tiene acceso a esta web.
     --------------------------------------------------------- */

  // Se añade al final de cada demostración: evita que enlaces o formularios saquen al marco de su página
  const DEMO_GUARD = '<script>(function(){' +
    'function aviso(){var d=document.getElementById("__demo_aviso");if(!d){d=document.createElement("div");d.id="__demo_aviso";' +
    'd.setAttribute("role","status");d.style.cssText="position:fixed;left:50%;bottom:12px;transform:translateX(-50%);background:#171b22;color:#fff;font:14px system-ui,sans-serif;padding:8px 14px;border-radius:6px;z-index:2147483647";' +
    'd.textContent="Demostración: los enlaces a otras páginas y el envío de formularios están desactivados.";document.body.appendChild(d);setTimeout(function(){d.remove()},2600);}}' +
    'document.addEventListener("click",function(e){var bt=e.target.closest&&e.target.closest("button,input");' +
    'if(bt&&bt.form&&(bt.type==="submit"||bt.type==="image")){aviso();}' +
    'var a=e.target.closest&&e.target.closest("a[href]");if(!a)return;' +
    'var h=a.getAttribute("href");e.preventDefault();' +
    'if(h.charAt(0)==="#"){var t=h.length>1?document.getElementById(decodeURIComponent(h.slice(1))):null;if(t)t.scrollIntoView();}else{aviso();}},true);' +
    'document.addEventListener("submit",function(e){e.preventDefault();aviso();},true);' +
    '})();<\/script>';

  async function buildDemoDoc(files) {
    const htmlFile = files.find((f) => f.ext === 'html' || f.ext === 'htm');
    if (!htmlFile) throw new Error('El ejercicio no incluye ningún archivo HTML.');
    const byName = {};
    await Promise.all(files.filter((f) => f.ext === 'css' || f.ext === 'js').map(async (f) => { byName[f.nombre] = await fetchText(f.url); }));
    const local = (ref) => byName[ref.split(/[?#]/)[0].split('/').pop()];
    let doc = await fetchText(htmlFile.url);
    doc = doc.replace(/<link\b[^>]*>/gi, (tag) => {
      if (!/rel\s*=\s*["']?stylesheet/i.test(tag)) return tag;
      const href = (tag.match(/href\s*=\s*["']([^"']+)["']/i) || [])[1];
      const css = href && local(href);
      return css != null ? '<style>' + css.replace(/<\/style/gi, '<\\/style') + '</style>' : tag;
    });
    doc = doc.replace(/<script\b([^>]*?)\bsrc\s*=\s*["']([^"']+)["']([^>]*)>\s*<\/script>/gi, (tag, a, src, b) => {
      const js = local(src);
      return js != null ? '<script' + a + b + '>' + js.replace(/<\/script/gi, '<\\/script') + '</script>' : tag;
    });
    return doc + DEMO_GUARD;
  }

  function demoSection(item, files) {
    if (!files.some((f) => f.ext === 'html' || f.ext === 'htm')) return null;
    const frameBox = h('div', { class: 'demo-frame', hidden: true });
    const runBtn = h('button', { type: 'button', class: 'btn btn-primary' }, icon('play'), 'Ejecutar demostración');
    const closeBtn = h('button', { type: 'button', class: 'btn', hidden: true }, icon('stop'), 'Cerrar');
    const reloadBtn = h('button', { type: 'button', class: 'btn', hidden: true }, icon('refresh'), 'Reiniciar');

    function cerrarMarco(mensaje) {
      frameBox.replaceChildren(mensaje ? h('div', { class: 'viewer-state', role: 'alert', style: 'color:#171b22' }, mensaje) : null);
      frameBox.hidden = !mensaje;
    }

    async function run() {
      runBtn.disabled = true;
      try {
        const doc = await buildDemoDoc(files);
        // Sin allow-forms y sin allow-same-origin: no puede enviar formularios ni tocar esta web
        const iframe = h('iframe', {
          title: 'Demostración: ' + item.titulo,
          sandbox: 'allow-scripts allow-modals',
          referrerpolicy: 'no-referrer'
        });
        // La primera carga es la demo. Si carga otra vez, el código intentó ir a otra página
        // (por ejemplo, a la portada de esta web): se corta de inmediato.
        let cargas = 0;
        iframe.addEventListener('load', () => {
          cargas++;
          if (cargas > 1) {
            cerrarMarco('La demostración ha intentado abrir otra página y se ha detenido. Pulsa «Reiniciar» para volver a empezar.');
            closeBtn.hidden = false;
            reloadBtn.hidden = false;
            runBtn.hidden = true;
          }
        });
        iframe.srcdoc = doc;
        frameBox.replaceChildren(iframe);
        frameBox.hidden = false;
        runBtn.hidden = true;
        closeBtn.hidden = false;
        reloadBtn.hidden = false;
      } catch (e) {
        toast('No se pudo preparar la demostración');
      } finally {
        runBtn.disabled = false;
      }
    }
    runBtn.addEventListener('click', run);
    reloadBtn.addEventListener('click', run);
    closeBtn.addEventListener('click', () => {
      frameBox.replaceChildren();
      frameBox.hidden = true;
      closeBtn.hidden = true;
      reloadBtn.hidden = true;
      runBtn.hidden = false;
      runBtn.focus();
    });

    return h('section', { class: 'card demo', 'aria-labelledby': 'demo-title' },
      h('div', { class: 'demo-head' },
        h('div', null,
          h('h2', { id: 'demo-title' }, 'Demostración'),
          h('p', null, 'Se ejecuta en un marco aislado, sin acceso a esta web, y no puede abrir otras páginas ni enviar formularios. Solo se inicia cuando pulsas el botón.')),
        h('div', { class: 'btn-row' }, runBtn, reloadBtn, closeBtn)),
      frameBox);
  }

  /* ---------------------------------------------------------
     Componentes de página
     --------------------------------------------------------- */
  function crumbs(list) {
    return h('nav', { class: 'crumbs', 'aria-label': 'Ruta de navegación' },
      h('ol', null, list.map((c, i) => h('li', null,
        i === list.length - 1 ? h('span', { 'aria-current': 'page' }, c.t) : h('a', { href: c.href }, c.t)))));
  }

  function pageHead({ crumb, kicker, title, lead, chips, actions }) {
    return h('header', { class: 'page-head' },
      crumb ? crumbs(crumb) : null,
      kicker ? h('div', { class: 'kicker' }, kicker) : null,
      h('h1', null, title),
      lead ? h('p', { class: 'lead' }, lead) : null,
      chips && chips.length ? tagChips(chips) : null,
      actions ? h('div', { class: 'btn-row' }, actions) : null);
  }

  function tagChips(tags) {
    return h('div', { class: 'chips' }, tags.map((t) => h('a', { class: 'chip chip-tag', href: '#/buscar?e=' + encodeURIComponent(t) }, t)));
  }

  function tipoChip(tipo, text) {
    return h('span', { class: 'chip chip-tipo t-' + tipo }, icon(TIPOS[tipo].icon), text || TIPOS[tipo].singular);
  }

  function ExternalBtn(href, text) {
    return h('a', { class: 'btn', href, target: '_blank', rel: 'noopener noreferrer' }, icon('external'), text);
  }

  function emptyState(msg, hint) {
    return h('div', { class: 'empty' }, h('strong', null, msg), hint ? h('p', { style: 'margin:.4rem 0 0' }, hint) : null);
  }

  function fileChips(it) {
    const seen = new Set();
    const files = it.archivos.map((f) => normFile(it, f));
    const chips = [];
    files.forEach((f) => { const l = kindLabel(f); if (!seen.has(l)) { seen.add(l); chips.push(h('span', { class: 'chip' }, l)); } });
    return chips;
  }

  /* ---------------------------------------------------------
     Vistas
     --------------------------------------------------------- */
  function viewHome() {
    const s = store.site;
    const hero = h('section', { class: 'hero' },
      h('div', { class: 'kicker' }, '2.º DAW · Curso ' + s.curso),
      h('h1', null, s.titulo),
      h('p', { class: 'lead' }, 'Apuntes y ejercicios de cada asignatura, en un solo sitio.'),
      h('div', { class: 'hero-meta' },
        h('span', null, icon('user'), s.autor),
        h('span', null, icon('school'), s.centro),
        h('span', null, icon('calendar'), s.curso)));

    const cards = store.asigs.map((a) => {
      const reales = realTemas(a);
      const ej = reales.reduce((n, t) => n + t.ejercicios.length, 0);
      return h('article', { class: 'card subject-card' },
        h('div', { class: 'subject-top' },
          h('div', { class: 'subject-icon' }, icon(a.icono || 'code')),
          h('div', null, h('div', { class: 'subject-siglas' }, a.siglas), h('div', { class: 'subject-name' }, a.nombre))),
        h('p', { class: 'subject-desc' }, a.descripcion),
        reales.length
          ? [h('div', { class: 'subject-stats' }, h('span', null, plural(reales.length, 'tema', 'temas')), h('span', null, plural(ej, 'ejercicio', 'ejercicios')))]
          : h('div', { class: 'subject-stats' }, h('span', null, a.temas.length ? 'Aún sin temas propios. Incluye un tema de demostración.' : 'Aún sin temas.')),
        h('div', { class: 'btn-row' },
          h('a', { class: 'btn btn-primary', href: link(a.id), 'aria-label': 'Entrar en ' + a.siglas }, 'Entrar'),
          a.moodle ? ExternalBtn(a.moodle, 'Material original') : null));
    });

    return {
      title: s.titulo,
      node: h('div', null, hero,
        h('div', { class: 'section-title' }, h('h2', null, 'Asignaturas')),
        h('div', { class: 'grid' }, cards))
    };
  }

  function viewAsig(a) {
    const head = pageHead({
      crumb: [{ t: 'Inicio', href: '#/' }, { t: a.siglas }],
      kicker: a.nombre,
      title: a.siglas,
      lead: a.descripcion,
      actions: a.moodle ? [ExternalBtn(a.moodle, 'Material original del centro')] : null
    });

    const list = a.temas.length
      ? h('ul', { class: 'rows' }, a.temas.map((t) => {
        return h('li', { class: 'card row' },
          h('div', { class: 'row-num' }, t.num != null ? t.num : icon('layout')),
          h('div', { class: 'row-main' },
            h('h3', null, h('a', { href: link(a.id, t.id) }, t.titulo)),
            t.descripcion ? h('p', { class: 'row-desc' }, t.descripcion) : null,
            t.etiquetas.length || t.ejemplo ? h('div', { class: 'chips' },
              t.ejemplo ? h('span', { class: 'chip chip-demo' }, 'Demostración') : null,
              t.etiquetas.map((x) => h('span', { class: 'chip chip-tag' }, x))) : null),
          h('div', { class: 'row-side' },
            h('div', { class: 'chips' }, a.tipos.map((k) => h('a', { class: 'chip chip-tipo t-' + k, href: link(a.id, t.id, k) }, icon(TIPOS[k].icon), TIPOS[k].label + ' ' + t[k].length)))));
      }))
      : emptyState('Todavía no hay temas en esta asignatura.', h('span', null, 'Añádelos en ', h('code', null, a.datos), '.'));

    return {
      title: a.siglas,
      node: h('div', null, head, h('div', { class: 'section-title' }, h('h2', null, 'Temas'), h('small', null, plural(a.temas.length, 'tema', 'temas'))), list)
    };
  }

  function viewTema(a, t) {
    const head = pageHead({
      crumb: [{ t: 'Inicio', href: '#/' }, { t: a.siglas, href: link(a.id) }, { t: temaLabel(t) }],
      kicker: t.ejemplo ? 'Demostración · ' + a.siglas : (t.num != null ? 'Tema ' + t.num + ' · ' : '') + a.siglas,
      title: t.titulo,
      lead: t.descripcion,
      chips: t.etiquetas
    });
    const cards = a.tipos.map((k) => h('a', { class: 'card section-card t-' + k, href: link(a.id, t.id, k) },
      h('div', { class: 's-icon' }, icon(TIPOS[k].icon)),
      h('h2', null, TIPOS[k].label),
      h('p', null, TIPOS[k].desc),
      h('span', { class: 'count' }, t[k].length ? plural(t[k].length, 'elemento', 'elementos') : 'Vacío por ahora')));
    return {
      title: t.titulo + ' · ' + a.siglas,
      node: h('div', null, head,
        h('div', { class: 'sections' }, cards))
    };
  }

  function viewLista(a, t, tipo) {
    const T = TIPOS[tipo];
    const head = pageHead({
      crumb: [{ t: 'Inicio', href: '#/' }, { t: a.siglas, href: link(a.id) }, { t: temaLabel(t), href: link(a.id, t.id) }, { t: T.label }],
      kicker: temaFullTitle(t),
      title: T.label,
      lead: T.desc,
      actions: [h('a', { class: 'btn', href: link(a.id, t.id) }, 'Volver al tema')]
    });
    const items = t[tipo];
    const list = items.length
      ? h('ul', { class: 'rows' }, items.map((it) => h('li', { class: 'card row t-' + tipo },
        h('div', { class: 'row-num is-tipo' }, it.num),
        h('div', { class: 'row-main' },
          h('h3', null, h('a', { href: link(a.id, t.id, tipo, it.id) }, it.titulo)),
          it.descripcion ? h('p', { class: 'row-desc' }, it.descripcion) : null,
          it.etiquetas.length ? h('div', { class: 'chips' }, it.etiquetas.map((x) => h('span', { class: 'chip chip-tag' }, x))) : null),
        h('div', { class: 'row-side' },
          h('div', { class: 'chips' }, it.demo ? h('span', { class: 'chip chip-demo' }, 'Demo') : null, fileChips(it))))))
      : emptyState('Aún no hay ' + T.label.toLowerCase() + ' en este tema.', h('span', null, 'Añade elementos a ', h('code', null, tipo), ' en ', h('code', null, a.datos), '.'));
    return { title: T.label + ' · ' + t.titulo, node: h('div', null, head, list) };
  }

  async function viewItem(a, t, tipo, it) {
    const T = TIPOS[tipo];
    const files = it.archivos.map((f) => normFile(it, f));
    const [enunciado, notas, solucion] = await Promise.all([
      resolveText(it, it.enunciado != null ? it.enunciado : it.contenido).catch(() => '*No se pudo cargar el texto.*'),
      resolveText(it, it.notas).catch(() => null),
      resolveText(it, it.solucion).catch(() => null)
    ]);

    const head = pageHead({
      crumb: [{ t: 'Inicio', href: '#/' }, { t: a.siglas, href: link(a.id) }, { t: temaLabel(t), href: link(a.id, t.id) }, { t: T.label, href: link(a.id, t.id, tipo) }, { t: itemLabel(it) }],
      kicker: itemLabel(it) + ' · ' + temaFullTitle(t),
      title: it.titulo,
      lead: it.descripcion,
      chips: it.etiquetas
    });

    const blocks = [];
    if (enunciado) blocks.push(h('section', { class: 'card panel', 'aria-labelledby': 'h-enun' }, h('h2', { id: 'h-enun' }, tipo === 'ejercicios' ? 'Enunciado' : tipo === 'ejemplos' ? 'Explicación' : 'Contenido'), renderText(enunciado)));
    if (notas) blocks.push(h('aside', { class: 'note', 'aria-labelledby': 'h-notas' }, h('h2', { id: 'h-notas' }, 'Notas'), renderText(notas)));
    if (files.length) blocks.push(h('section', { 'aria-labelledby': 'h-codigo' },
      h('h2', { id: 'h-codigo', style: 'margin-bottom:.8rem' }, files.every((f) => f.kind === 'text') ? (files.length > 1 ? 'Código (' + files.length + ' archivos)' : 'Código') : 'Archivos'),
      buildViewer(files)));
    if (it.demo) { const d = demoSection(it, files); if (d) blocks.push(d); }
    if (solucion) {
      const det = h('details', { class: 'card solution' }, h('summary', null, 'Ver solución comentada'), renderText(solucion));
      blocks.push(det);
    }

    blocks.push(h('div', { class: 'item-actions' },
      h('div', { class: 'btn-row' }, h('a', { class: 'btn', href: link(a.id, t.id, tipo) }, 'Volver al listado'), h('a', { class: 'btn', href: link(a.id, t.id) }, 'Volver al tema'))));

    const siblings = t[tipo];
    const pos = siblings.indexOf(it);
    const prev = siblings[pos - 1], next = siblings[pos + 1];
    if (prev || next) {
      blocks.push(h('nav', { class: 'pager', 'aria-label': 'Navegación entre elementos' },
        prev ? h('a', { class: 'card prev', href: link(a.id, t.id, tipo, prev.id), rel: 'prev' }, h('small', null, 'Anterior'), h('strong', null, prev.titulo)) : h('span'),
        next ? h('a', { class: 'card next', href: link(a.id, t.id, tipo, next.id), rel: 'next' }, h('small', null, 'Siguiente'), h('strong', null, next.titulo)) : null));
    }

    return { title: it.titulo + ' · ' + a.siglas, node: h('div', null, head, h('div', { class: 'item-layout' }, blocks)) };
  }

  /* ---------- Búsqueda ---------- */
  function buildIndex() {
    if (store.index) return store.index;
    const out = [];
    for (const a of store.asigs) {
      for (const t of a.temas) {
        out.push({ tipo: 'tema', a, t, titulo: temaFullTitle(t), tags: t.etiquetas, text: norm([a.siglas, a.nombre, t.titulo, t.descripcion, t.etiquetas.join(' '), 'tema'].join(' ')) });
        for (const tipo of a.tipos) {
          for (const it of t[tipo]) {
            const nombres = it.archivos.map((f) => (typeof f === 'string' ? f : f.nombre || f.ruta)).join(' ');
            const body = typeof it.enunciado === 'string' ? it.enunciado : Array.isArray(it.enunciado) ? it.enunciado.join(' ') : typeof it.contenido === 'string' ? it.contenido : '';
            out.push({ tipo, a, t, it, titulo: it.titulo, tags: it.etiquetas, text: norm([a.siglas, a.nombre, t.titulo, it.titulo, it.descripcion, it.etiquetas.join(' '), nombres, TIPOS[tipo].label, body].join(' ')) });
          }
        }
      }
    }
    store.index = out;
    return out;
  }

  function viewSearch(query) {
    const idx = buildIndex();
    const tags = [...new Set(idx.flatMap((r) => r.tags))].sort((x, y) => x.localeCompare(y, 'es'));
    const state = { q: query.get('q') || '', a: query.get('a') || '', t: query.get('t') || '', e: query.get('e') || '' };

    const qInput = h('input', { class: 'input', id: 's-q', type: 'search', placeholder: 'Busca un tema, un ejercicio, un archivo…', value: state.q, autocomplete: 'off' });
    const aSel = h('select', { class: 'select', id: 's-a' }, h('option', { value: '' }, 'Todas'), store.asigs.map((a) => h('option', { value: a.id }, a.siglas)));
    const tSel = h('select', { class: 'select', id: 's-t' }, h('option', { value: '' }, 'Todo'), h('option', { value: 'tema' }, 'Temas'), TIPO_KEYS.map((k) => h('option', { value: k }, TIPOS[k].label)));
    const eSel = h('select', { class: 'select', id: 's-e' }, h('option', { value: '' }, 'Todas'), tags.map((x) => h('option', { value: x }, '#' + x)));
    aSel.value = state.a; tSel.value = state.t; eSel.value = state.e;
    if (aSel.value !== state.a) state.a = '';
    if (tSel.value !== state.t) state.t = '';
    if (eSel.value !== state.e) state.e = '';

    const count = h('p', { class: 'result-count', 'aria-live': 'polite' });
    const results = h('div');

    function run() {
      state.q = qInput.value; state.a = aSel.value; state.t = tSel.value; state.e = eSel.value;
      const terms = norm(state.q).split(/\s+/).filter(Boolean);
      const hits = idx.filter((r) =>
        (!state.a || r.a.id === state.a) &&
        (!state.t || r.tipo === state.t) &&
        (!state.e || r.tags.includes(state.e)) &&
        terms.every((w) => r.text.includes(w)));

      const p = new URLSearchParams();
      Object.entries(state).forEach(([k, v]) => { if (v) p.set(k, v); });
      history.replaceState(null, '', '#/buscar' + (p.toString() ? '?' + p : ''));

      const filtering = state.q || state.a || state.t || state.e;
      count.textContent = filtering ? plural(hits.length, 'resultado', 'resultados') : 'Escribe algo o usa los filtros. Ahora se muestran todos los contenidos (' + hits.length + ').';
      results.replaceChildren(hits.length
        ? h('ul', { class: 'rows' }, hits.slice(0, 100).map((r) => {
          const isTema = r.tipo === 'tema';
          const href = isTema ? link(r.a.id, r.t.id) : link(r.a.id, r.t.id, r.tipo, r.it.id);
          return h('li', { class: 'card row' + (isTema ? '' : ' t-' + r.tipo) },
            isTema ? h('div', { class: 'row-num' }, icon('layout')) : h('div', { class: 'row-num is-tipo' }, icon(TIPOS[r.tipo].icon)),
            h('div', { class: 'row-main' },
              h('h3', null, h('a', { href }, r.titulo)),
              h('span', { class: 'row-path' }, r.a.siglas + ' › ' + (isTema ? 'Tema' : temaFullTitle(r.t) + ' › ' + itemLabel(r.it))),
              r.tags.length ? h('div', { class: 'chips' }, r.tags.map((x) => h('span', { class: 'chip chip-tag' }, x))) : null),
            h('div', { class: 'row-side' }, isTema ? h('span', { class: 'chip' }, 'Tema') : tipoChip(r.tipo)));
        }))
        : emptyState('No hay resultados.', 'Prueba con otras palabras o quita algún filtro.'));
    }
    [qInput, aSel, tSel, eSel].forEach((el) => el.addEventListener(el === qInput ? 'input' : 'change', run));

    const node = h('div', null,
      pageHead({ crumb: [{ t: 'Inicio', href: '#/' }, { t: 'Buscar' }], title: 'Buscar', lead: 'Encuentra temas, teoría, ejemplos y ejercicios por título, etiqueta o nombre de archivo.' }),
      h('div', { class: 'card search-box', role: 'search' },
        h('div', { class: 'field' }, h('label', { for: 's-q' }, 'Texto'), qInput),
        h('div', { class: 'filters' },
          h('div', { class: 'field' }, h('label', { for: 's-a' }, 'Asignatura'), aSel),
          h('div', { class: 'field' }, h('label', { for: 's-t' }, 'Tipo'), tSel),
          h('div', { class: 'field' }, h('label', { for: 's-e' }, 'Etiqueta'), eSel))),
      count, results);
    run();
    return { title: 'Buscar', node, focus: qInput };
  }

  /* ---------- Información ---------- */
  function viewInfo() {
    const s = store.site;
    const node = h('div', null,
      pageHead({ crumb: [{ t: 'Inicio', href: '#/' }, { t: 'Información' }], title: 'Información del proyecto', lead: 'Una web estática para consultar mis apuntes y ejercicios de 2.º DAW.' }),
      h('div', { class: 'info-grid' },
        h('section', { class: 'card' }, h('h2', null, 'Autoría'),
          h('dl', { class: 'kv' },
            h('dt', null, 'Nombre'), h('dd', null, s.autor),
            h('dt', null, 'Estudios'), h('dd', null, s.estudios),
            h('dt', null, 'Centro'), h('dd', null, s.centro),
            h('dt', null, 'Curso'), h('dd', null, s.curso),
            h('dt', null, 'GitHub'), h('dd', null, h('a', { href: s.repositorio, target: '_blank', rel: 'noopener noreferrer' }, s.githubUsuario + ' / repositorio')))),
        h('section', { class: 'card' }, h('h2', null, 'Material original'),
          h('ul', null, store.asigs.map((a) => h('li', null, a.moodle ? h('a', { href: a.moodle, target: '_blank', rel: 'noopener noreferrer' }, a.siglas + ' · ' + a.nombre) : a.siglas + ' · ' + a.nombre + ' (sin enlace todavía)')))),
        h('section', { class: 'card' }, h('h2', null, 'Cómo está hecha'),
          h('p', null, 'HTML, CSS y JavaScript sin frameworks ni servidor. El contenido se define en archivos JSON dentro de ', h('code', null, 'data/'), ' y los archivos de código en ', h('code', null, 'archivos/'), '.'),
          h('p', null, 'El resaltado de sintaxis es propio, así que no se carga ninguna librería externa.'))));
    return { title: 'Información', node };
  }

  function viewNotFound(msg) {
    return {
      title: 'No encontrado',
      node: h('div', null,
        pageHead({ crumb: [{ t: 'Inicio', href: '#/' }, { t: 'No encontrado' }], title: 'No hemos encontrado esa página', lead: msg || 'La dirección no existe o el contenido se ha movido.' }),
        h('div', { class: 'btn-row' }, h('a', { class: 'btn btn-primary', href: '#/' }, 'Ir a la portada'), h('a', { class: 'btn', href: '#/buscar' }, 'Buscar contenido')))
    };
  }

  /* ---------------------------------------------------------
     Enrutador
     --------------------------------------------------------- */
  let routeToken = 0;

  function parseHash() {
    const raw = location.hash.replace(/^#/, '') || '/';
    const [path, query = ''] = raw.split('?');
    let seg = [];
    try { seg = path.split('/').filter(Boolean).map(decodeURIComponent); } catch (e) { seg = ['?']; }
    return { seg, query: new URLSearchParams(query) };
  }

  async function route() {
    const token = ++routeToken;
    const { seg, query } = parseHash();
    let view;
    try {
      if (seg.length === 0) view = viewHome();
      else if (seg[0] === 'buscar') view = viewSearch(query);
      else if (seg[0] === 'info') view = viewInfo();
      else {
        const a = findAsig(seg[0]);
        if (!a) view = viewNotFound('No existe la asignatura «' + seg[0] + '».');
        else if (seg.length === 1) view = viewAsig(a);
        else {
          const t = findTema(a, seg[1]);
          if (!t) view = viewNotFound('No existe el tema «' + seg[1] + '» en ' + a.siglas + '.');
          else if (seg.length === 2) view = viewTema(a, t);
          else if (!a.tipos.includes(seg[2])) view = viewNotFound('El apartado «' + seg[2] + '» no existe en ' + a.siglas + '.');
          else if (seg.length === 3) view = viewLista(a, t, seg[2]);
          else {
            const it = t[seg[2]].find((x) => x.id === seg[3]);
            view = it ? await viewItem(a, t, seg[2], it) : viewNotFound('No existe el elemento «' + seg[3] + '».');
          }
        }
      }
    } catch (e) {
      console.error(e);
      view = viewNotFound('Se produjo un error al preparar la página.');
    }
    if (token !== routeToken) return;

    const app = $('#app');
    app.replaceChildren(view.node);
    document.title = view.title + (view.title === store.site.titulo ? '' : ' · ' + store.site.titulo);
    updateNav(seg);
    window.scrollTo(0, 0);
    const main = $('#contenido');
    if (view.focus) view.focus.focus({ preventScroll: true });
    else main.focus({ preventScroll: true });
  }

  function updateNav(seg) {
    document.querySelectorAll('.main-nav a').forEach((a) => {
      const on = a.dataset.route === (seg[0] || 'inicio');
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  /* ---------------------------------------------------------
     Cabecera, tema claro/oscuro y arranque
     --------------------------------------------------------- */
  function buildChrome() {
    const s = store.site;
    $('.brand-name').textContent = s.titulo;
    const nav = $('.main-nav');
    nav.replaceChildren(
      h('a', { href: '#/', 'data-route': 'inicio' }, 'Inicio'),
      ...store.asigs.map((a) => h('a', { href: link(a.id), 'data-route': a.id }, a.siglas)),
      h('a', { href: '#/buscar', 'data-route': 'buscar' }, 'Buscar'),
      h('a', { href: '#/info', 'data-route': 'info' }, 'Información'));

    const tools = $('.header-tools');
    const themeBtn = h('button', { type: 'button', class: 'icon-btn' });
    const paint = () => {
      const dark = document.documentElement.dataset.theme === 'dark';
      themeBtn.replaceChildren(icon(dark ? 'sun' : 'moon'));
      themeBtn.setAttribute('aria-label', dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
      themeBtn.title = themeBtn.getAttribute('aria-label');
    };
    themeBtn.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('daw:tema', next); } catch (e) { /* sin almacenamiento */ }
      paint();
    });
    paint();
    tools.replaceChildren(
      h('a', { class: 'icon-btn', href: '#/buscar', 'aria-label': 'Buscar (atajo: /)', title: 'Buscar (atajo: /)' }, icon('search')),
      h('a', { class: 'icon-btn', href: s.repositorio, target: '_blank', rel: 'noopener noreferrer', 'aria-label': 'Repositorio en GitHub (se abre en otra pestaña)', title: 'Repositorio en GitHub' }, icon('github')),
      themeBtn);

    $('#footer-info').textContent = s.autor + ' · ' + s.centro + ' · Curso ' + s.curso;
    $('#footer-repo').href = s.repositorio;

    document.addEventListener('keydown', (e) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = (document.activeElement || {}).tagName;
      if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
      e.preventDefault();
      if (parseHash().seg[0] === 'buscar') { const q = $('#s-q'); if (q) q.focus(); } else location.hash = '#/buscar';
    });
  }

  function showFatal(err) {
    const local = location.protocol === 'file:';
    $('#app').replaceChildren(h('div', { class: 'card fatal' },
      h('h1', null, 'No se pudieron cargar los datos'),
      local
        ? h('p', null, 'Estás abriendo la web directamente desde un archivo (file://) y el navegador bloquea la lectura de los JSON. Arráncala con un servidor local, por ejemplo la extensión Live Server de VS Code, o ejecuta en esta carpeta:')
        : h('p', null, 'Revisa que existan los archivos de la carpeta data/ y que sean JSON válidos.'),
      local ? h('pre', null, 'python -m http.server 8000\n# y abre http://localhost:8000') : null,
      h('p', null, h('small', null, String(err && err.message || err)))));
  }

  async function init() {
    try {
      await loadData();
    } catch (e) {
      console.error(e);
      showFatal(e);
      return;
    }
    buildChrome();
    window.addEventListener('hashchange', route);
    route();
  }

  init();
})();
