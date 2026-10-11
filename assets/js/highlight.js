/* =========================================================
   Resaltador de sintaxis ligero (sin dependencias).
   Uso: DAWHighlight.render(codigo, 'php') -> cadena HTML segura
   ========================================================= */
(function (global) {
  'use strict';

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const span = (cls, s) => '<span class="tk-' + cls + '">' + esc(s) + '</span>';
  const words = (s) => new Set(s.split(/\s+/).filter(Boolean));

  // Piezas reutilizables de expresiones regulares
  const R = {
    dq: /"(?:\\.|[^"\\\n])*"/,
    sq: /'(?:\\.|[^'\\\n])*'/,
    bt: /`(?:\\.|[^`\\])*`/,
    tdq: /"""[\s\S]*?"""/,
    tsq: /'''[\s\S]*?'''/,
    line: /\/\/[^\n]*/,
    block: /\/\*[\s\S]*?\*\//,
    hash: /#[^\n]*/,
    dash: /--[^\n]*/
  };

  /* ---------- Lenguajes "tipo C" y similares ---------- */
  function makeGeneric(cfg) {
    const re = new RegExp(
      '(' + (cfg.comments.length ? cfg.comments.map((r) => r.source).join('|') : '(?!)') + ')' +
      '|(' + cfg.strings.map((r) => r.source).join('|') + ')' +
      '|(\\b\\d[\\d_]*(?:\\.\\d+)?\\b)' +
      '|([A-Za-z_$][\\w$]*)', 'g');
    const kw = words(cfg.kw || '');
    const lit = words(cfg.lit || '');

    return function (code) {
      let out = '', last = 0, m;
      re.lastIndex = 0;
      while ((m = re.exec(code))) {
        out += esc(code.slice(last, m.index));
        const t = m[0];
        if (m[1]) {
          out += span('com', t);
        } else if (m[2]) {
          let cls = 'str';
          if (cfg.keys && /^\s*:/.test(code.slice(re.lastIndex, re.lastIndex + 20))) cls = 'prop';
          out += span(cls, t);
        } else if (m[3]) {
          out += span('num', t);
        } else {
          const k = cfg.ci ? t.toLowerCase() : t;
          let cls = '';
          if (kw.has(k)) cls = 'kw';
          else if (lit.has(k)) cls = 'lit';
          else if (cfg.dollar && t[0] === '$') cls = 'var';
          else if (code[re.lastIndex] === '(') cls = 'fn';
          else if (cfg.types && /^[A-Z][a-z]/.test(t)) cls = 'type';
          out += cls ? span(cls, t) : esc(t);
        }
        last = re.lastIndex;
      }
      return out + esc(code.slice(last));
    };
  }

  const JS_KW = 'async await break case catch class const continue debugger default delete do else export extends finally for from function get if import in instanceof let new of return set static super switch this throw try typeof var void while with yield';

  const js = makeGeneric({
    kw: JS_KW, lit: 'true false null undefined NaN Infinity',
    comments: [R.line, R.block], strings: [R.dq, R.sq, R.bt], types: true
  });
  const ts = makeGeneric({
    kw: JS_KW + ' abstract as declare enum implements interface namespace private protected public readonly type',
    lit: 'true false null undefined NaN Infinity',
    comments: [R.line, R.block], strings: [R.dq, R.sq, R.bt], types: true
  });
  const java = makeGeneric({
    kw: 'abstract assert boolean break byte case catch char class const continue default do double else enum extends final finally float for goto if implements import instanceof int interface long native new package private protected public record return short static strictfp super switch synchronized this throw throws transient try var void volatile while',
    lit: 'true false null', comments: [R.line, R.block], strings: [R.dq, R.sq], types: true
  });
  const phpCode = makeGeneric({
    kw: 'abstract and array as break callable case catch class clone const continue declare default do echo else elseif empty enddeclare endfor endforeach endif endswitch endwhile extends final finally fn for foreach function global if implements include include_once instanceof insteadof interface isset list match namespace new or print private protected public readonly require require_once return static switch throw trait try unset use var while xor yield',
    lit: 'true false null', ci: true, dollar: true,
    comments: [R.line, R.block, R.hash], strings: [R.dq, R.sq], types: true
  });
  const python = makeGeneric({
    kw: 'and as assert async await break case class continue def del elif else except finally for from global if import in is lambda match nonlocal not or pass raise return try while with yield',
    lit: 'True False None self', comments: [R.hash], strings: [R.tdq, R.tsq, R.dq, R.sq], types: true
  });
  const shell = makeGeneric({
    kw: 'if then else elif fi for while do done case esac in function select until return exit export local echo cd source sudo set unset',
    lit: 'true false', dollar: true, comments: [R.hash], strings: [R.dq, R.sq]
  });
  const sql = makeGeneric({
    kw: 'select from where insert into values update set delete create table alter drop primary key foreign references not null and or order by group having join inner left right outer on as distinct limit offset union all in like between is exists default auto_increment unique index database use view',
    lit: 'true false', ci: true, comments: [R.dash, R.block], strings: [R.sq, R.dq]
  });
  const json = makeGeneric({
    lit: 'true false null', keys: true, comments: [], strings: [R.dq]
  });
  const config = makeGeneric({
    lit: 'true false null yes no on off', comments: [R.hash], strings: [R.dq, R.sq]
  });

  /* ---------- CSS ---------- */
  function css(code) {
    const re = /(\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(@[\w-]+)([^{};]*)|([{}])|(#[0-9a-fA-F]{3,8}\b)|(-?\d*\.?\d+(?:px|r?em|%|vh|vw|vmin|vmax|ms|s|deg|fr|ch)?)|([\w-]+)(?=\s*:)|([^{}\/@"';:]+?)(?=\s*\{)/g;
    let out = '', last = 0, depth = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      if (m[1]) out += span('com', m[1]);
      else if (m[2]) out += span('str', m[2]);
      else if (m[3]) out += span('kw', m[3]) + esc(m[4]);
      else if (m[5]) { depth += m[5] === '{' ? 1 : -1; if (depth < 0) depth = 0; out += esc(m[5]); }
      else if (m[6]) out += span(depth > 0 ? 'num' : 'sel', m[6]);
      else if (m[7]) out += span('num', m[7]);
      else if (m[8]) out += span(depth > 0 ? 'prop' : 'sel', m[8]);
      else out += span('sel', m[9]);
      last = re.lastIndex;
    }
    return out + esc(code.slice(last));
  }

  /* ---------- HTML / XML ---------- */
  function attrs(s) {
    const re = /([^\s=]+)(\s*=\s*)?("[^"]*"|'[^']*'|[^\s"'>]+)?/g;
    let out = '', last = 0, m;
    while ((m = re.exec(s))) {
      out += esc(s.slice(last, m.index)) + span('attr', m[1]);
      if (m[2]) out += esc(m[2]);
      if (m[3]) out += span('str', m[3]);
      last = re.lastIndex;
    }
    return out + esc(s.slice(last));
  }

  function markup(code) {
    const re = /(<!--[\s\S]*?-->)|(<!DOCTYPE[^>]*>|<\?xml[\s\S]*?\?>)|(<\/?)([A-Za-z][\w:.-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?>)/gi;
    let out = '', last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      if (m[1]) out += span('com', m[1]);
      else if (m[2]) out += span('kw', m[2]);
      else {
        out += span('punc', m[3]) + span('tag', m[4]) + attrs(m[5]) + span('punc', m[6]);
        const name = m[4].toLowerCase();
        if (m[3] === '<' && m[6] === '>' && (name === 'script' || name === 'style')) {
          const close = code.toLowerCase().indexOf('</' + name, re.lastIndex);
          const end = close === -1 ? code.length : close;
          out += (name === 'script' ? js : css)(code.slice(re.lastIndex, end));
          re.lastIndex = end;
        }
      }
      last = re.lastIndex;
    }
    return out + esc(code.slice(last));
  }

  /* ---------- PHP (mezcla de HTML y código PHP) ---------- */
  function php(code) {
    const parts = code.split(/(<\?(?:php|=)?[\s\S]*?(?:\?>|$))/);
    return parts.map((p, i) => {
      if (i % 2 === 0) return p ? markup(p) : '';
      const head = p.match(/^<\?(?:php|=)?/)[0];
      let body = p.slice(head.length), tail = '';
      if (body.endsWith('?>')) { body = body.slice(0, -2); tail = '?>'; }
      return span('kw', head) + phpCode(body) + (tail ? span('kw', tail) : '');
    }).join('');
  }

  /* ---------- Registro de lenguajes ---------- */
  const LANGS = {
    html: { label: 'HTML', fn: markup },
    xml: { label: 'XML', fn: markup },
    css: { label: 'CSS', fn: css },
    javascript: { label: 'JavaScript', fn: js },
    typescript: { label: 'TypeScript', fn: ts },
    json: { label: 'JSON', fn: json },
    php: { label: 'PHP', fn: php },
    java: { label: 'Java', fn: java },
    python: { label: 'Python', fn: python },
    shell: { label: 'Shell', fn: shell },
    sql: { label: 'SQL', fn: sql },
    config: { label: 'Config', fn: config },
    markdown: { label: 'Markdown', fn: null },
    text: { label: 'Texto', fn: null }
  };

  const EXT = {
    html: 'html', htm: 'html', xml: 'xml', xsd: 'xml', xsl: 'xml', svg: 'xml',
    css: 'css', js: 'javascript', mjs: 'javascript', ts: 'typescript', json: 'json',
    php: 'php', java: 'java', py: 'python', sh: 'shell', bash: 'shell', sql: 'sql',
    yml: 'config', yaml: 'config', conf: 'config', ini: 'config', env: 'config', properties: 'config',
    md: 'markdown', txt: 'text', csv: 'text', log: 'text'
  };

  const ALIAS = { js: 'javascript', ts: 'typescript', py: 'python', sh: 'shell', bash: 'shell', yml: 'config', yaml: 'config', htm: 'html', txt: 'text', md: 'markdown' };

  function normalize(lang) {
    lang = String(lang || '').toLowerCase();
    lang = ALIAS[lang] || lang;
    return LANGS[lang] ? lang : 'text';
  }

  global.DAWHighlight = {
    fromExtension: (ext) => EXT[String(ext || '').toLowerCase()] || null,
    label: (lang) => LANGS[normalize(lang)].label,
    normalize,
    render(code, lang) {
      const l = LANGS[normalize(lang)];
      if (!l.fn || code.length > 300000) return esc(code);
      try { return l.fn(code); } catch (e) { return esc(code); }
    }
  };
})(window);
