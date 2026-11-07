// A small Markdown renderer: headings, paragraphs, fenced code, inline code,
// bold, italic, links, images, lists (one level), blockquotes, rules.
// Everything is escaped first, so a post cannot inject HTML.

export function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function parseFrontMatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: src };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i < 1) continue;
    const key = line.slice(0, i).trim();
    const value = line.slice(i + 1).trim().replace(/^(["'])(.*)\1$/, '$2');
    data[key] = value;
  }
  return { data, body: m[2] };
}

// Only web links, mail links, and local paths. No javascript: or data: URLs.
function safeUrl(url, { image = false } = {}) {
  const scheme = url.match(/^([a-z][a-z0-9+.-]*):/i);
  if (scheme) {
    const s = scheme[1].toLowerCase();
    const ok = image ? ['http', 'https'] : ['http', 'https', 'mailto'];
    if (!ok.includes(s)) return '#';
  }
  return url.replace(/"/g, '%22');
}

export function inline(text) {
  const codes = [];
  let s = text.replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c);
    return `\u0000${codes.length - 1}\u0000`;
  });
  s = esc(s);
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, url) => `<img src="${safeUrl(url, { image: true })}" alt="${alt}">`);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => `<a href="${safeUrl(url)}">${label}</a>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[Number(i)])}</code>`);
  return s;
}

const FENCE = /^```\s*([\w-]*)\s*$/;
const HEADING = /^(#{1,4})\s+(.*?)\s*#*\s*$/;
const RULE = /^(-{3,}|\*{3,})\s*$/;
const ITEM = /^\s*([-*]|\d+\.)\s+(.*)$/;

function startsBlock(line) {
  return FENCE.test(line) || HEADING.test(line) || RULE.test(line) || /^>/.test(line) || ITEM.test(line);
}

export function render(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^\s*$/.test(line)) { i++; continue; }

    let m = line.match(FENCE);
    if (m) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++;
      out.push(`<pre><code${m[1] ? ` class="lang-${esc(m[1])}"` : ''}>${esc(buf.join('\n'))}</code></pre>`);
      continue;
    }

    m = line.match(HEADING);
    if (m) {
      const n = m[1].length;
      out.push(`<h${n} id="${slugify(m[2])}">${inline(m[2])}</h${n}>`);
      i++;
      continue;
    }

    if (RULE.test(line)) { out.push('<hr>'); i++; continue; }

    if (/^>/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
      out.push(`<blockquote>${render(buf.join('\n'))}</blockquote>`);
      continue;
    }

    m = line.match(ITEM);
    if (m) {
      const tag = /\d/.test(m[1]) ? 'ol' : 'ul';
      const items = [];
      while (i < lines.length && ITEM.test(lines[i])) { items.push(lines[i].match(ITEM)[2]); i++; }
      out.push(`<${tag}>${items.map((t) => `<li>${inline(t)}</li>`).join('')}</${tag}>`);
      continue;
    }

    const buf = [];
    while (i < lines.length && !/^\s*$/.test(lines[i]) && (buf.length === 0 || !startsBlock(lines[i]))) {
      buf.push(lines[i]);
      i++;
    }
    out.push(`<p>${inline(buf.join('\n'))}</p>`);
  }
  return out.join('\n');
}
