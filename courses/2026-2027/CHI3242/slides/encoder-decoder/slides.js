/* Slide-specific logic for the encoder-decoder review deck (loaded before deck.js). */
window.HOOKS = {};
window.SECTIONS = [
  { id: 'circle',   zh: '詮釋循環',       en: 'The hermeneutic circle' },
  { id: 'count',    zh: '回顧：數詞語',   en: 'Review: counting words' },
  { id: 'models',   zh: '回顧：建模型',   en: 'Review: models' },
  { id: 'vectors',  zh: '回顧：學向量',   en: 'Review: vectors' },
  { id: 'tables',   zh: '結構化數據（一）：CSV 與 TSV', en: 'Structured data (1): CSV and TSV' },
  { id: 'json',     zh: '結構化數據（二）：JSON', en: 'Structured data (2): JSON' },
  { id: 'examples', zh: '結構化數據（三）：實例', en: 'Structured data (3): examples' },
  { id: 'summary',  zh: '總結',           en: 'Summary' }
];
// a title slide at the start of every section (as in the other CHI3242 decks)
window.SECTIONS.forEach((sec, i) => {
  if (sec.id === 'summary') return;
  const first = document.querySelector(`.slide[data-sec="${sec.id}"]`);
  if (!first) return;
  const s = document.createElement('section');
  s.className = 'slide full title-slide sec-open'; s.id = 's-open-' + sec.id; s.dataset.sec = sec.id;
  s.innerHTML = `<div class="sec-num">${String(i + 1).padStart(2, '0')}</div><div class="big-zh">${sec.zh}</div><div class="big-en">${sec.en}</div><div class="rule"></div>`;
  first.parentNode.insertBefore(s, first);
});

const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const C = { ink: css('--ink'), mute: css('--mute'), faint: css('--faint'), line: css('--line'), enc: css('--tgt'), dec: css('--seal'), amb: css('--amber'), paper: css('--paper') };

/* ---------- LaTeX: write \( inline \) anywhere in the text ---------- */
(function texify(root) {
  const re = /\\\((.+?)\\\)/gs;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) if (/\\\(/.test(walker.currentNode.nodeValue)) nodes.push(walker.currentNode);
  nodes.forEach(n => {
    if (n.parentNode.closest('pre')) return;
    const txt = n.nodeValue, frag = document.createDocumentFragment();
    let last = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(txt))) {
      if (m.index > last) frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
      const span = document.createElement('span');
      span.className = 'tex';
      try { katex.render(m[1].trim(), span, { throwOnError: false, strict: false }); } catch (e) { span.textContent = m[0]; }
      frag.appendChild(span);
      last = re.lastIndex;
    }
    if (last < txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
    n.parentNode.replaceChild(frag, n);
  });
})(document.getElementById('stage'));

/* ---------- <pre class="code" data-lang="json|py"> is coloured on load; data-hi="a|b" marks phrases ---------- */
(function () {
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const span = (c, t) => `<span class="${c}">${esc(t)}</span>`;
  const RULES = {
    json: [/("(?:[^"\\]|\\.)*")(\s*:)|("(?:[^"\\]|\\.)*")|(-?\b\d+(?:\.\d+)?\b)|\b(null|true|false)\b/g,
      m => m[1] ? span('k', m[1]) + esc(m[2]) : m[3] ? span('s', m[3]) : m[4] ? span('n', m[4]) : span('x', m[5])],
    py: [/(#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|\b(\d+)\b|\b(import|from|def|return|for|in|with|as|if|else|True|False|None)\b/gm,
      m => m[1] ? span('c', m[1]) : m[2] ? span('s', m[2]) : m[3] ? span('n', m[3]) : span('x', m[4])]
  };
  document.querySelectorAll('pre.code[data-lang]').forEach(pre => {
    const rule = RULES[pre.dataset.lang];
    if (!rule) return;
    const [re, fn] = rule, src = pre.textContent;
    let out = '', last = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(src))) { out += esc(src.slice(last, m.index)) + fn(m); last = re.lastIndex; }
    out += esc(src.slice(last));
    (pre.dataset.hi || '').split('|').filter(Boolean).forEach(h => { out = out.split(h).join(`<span class="hi">${h}</span>`); });
    pre.innerHTML = out;
  });
})();

/* ---------- tiny SVG helper: el('circle', {cx, cy, r, text}, parent) ---------- */
const NS = 'http://www.w3.org/2000/svg';
function el(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) { if (k === 'text') e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]); }
  if (parent) parent.appendChild(e);
  return e;
}
const show = (node, on) => { node.style.transition = 'opacity .5s'; node.style.opacity = on ? 1 : 0; };

/* ---------- the hermeneutic circle (ported from the HKU talk, Chinese labels) ---------- */
(function () {
  const H = window.HOOKS;
  let built = false; const parts = {};
  function stack(svg, x, y, dir, col) {
    const G = el('g', {}, svg);
    for (let b = 0; b < 4; b++) {
      const by = y + b * 78;
      el('rect', { x, y: by, width: 200, height: 66, rx: 8, fill: C.paper, stroke: C.faint }, G);
      for (let r = 0; r < 3; r++) {
        const ry = by + 9 + r * 17, n = [10, 5, 2][dir > 0 ? r : 2 - r];
        for (let c = 0; c < n; c++) el('rect', { x: x + 10 + c * (180 / n), y: ry, width: 180 / n - 4, height: 11, rx: 2, fill: col, opacity: .25 + .15 * ((b + c) % 3) }, G);
      }
    }
    for (let i = 0; i < 4; i++) {   // flow particles
      const c = el('circle', { cx: x + 30 + i * 46, cy: y, r: 3, fill: col }, G);
      el('animate', { attributeName: 'cy', from: dir > 0 ? y : y + 306, to: dir > 0 ? y + 306 : y, dur: `${2.4 + i * .3}s`, repeatCount: 'indefinite' }, c);
    }
    return G;
  }
  function arrow(svg, d, col, id, label, sub, lx, ly) {
    const G = el('g', {}, svg);
    el('path', { d, fill: 'none', stroke: col, 'stroke-width': 3, 'marker-end': `url(#ah-${id})`, class: 'flow' }, G);
    el('text', { x: lx, y: ly, 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 700, fill: col, text: label }, G);
    return G;
  }
  function build() {
    const svg = document.getElementById('circle');
    const defs = el('defs', {}, svg);
    [['e', C.enc], ['d', C.dec], ['a', C.amb]].forEach(([id, col]) => {
      const m = el('marker', { id: 'ah-' + id, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
      el('path', { d: 'M0 0 L10 5 L0 10 z', fill: col }, m);
    });
    el('style', { text: '.flow{stroke-dasharray:6 7;animation:dash 1.2s linear infinite}@keyframes dash{to{stroke-dashoffset:-26}}' }, svg);
    const box = (cx, cy, t, e) => {
      const G = el('g', {}, svg);
      el('rect', { x: cx - 130, y: cy - 30, width: 260, height: 60, rx: 30, fill: '#fff', stroke: C.ink }, G);
      el('text', { x: cx - 8, y: cy + 10, 'text-anchor': 'end', 'font-size': 30, 'font-weight': 600, fill: C.ink, text: t }, G);
      el('text', { x: cx + 2, y: cy + 8, 'text-anchor': 'start', 'font-size': 17, fill: C.mute, text: e }, G);
      return G;
    };
    parts.axes = el('g', {}, svg);
    el('line', { x1: 552, x2: 552, y1: 102, y2: 478, stroke: C.faint, 'stroke-width': 1.5 }, parts.axes);
    el('line', { x1: 290, x2: 814, y1: 290, y2: 290, stroke: C.faint, 'stroke-width': 1.5 }, parts.axes);
    el('text', { x: 566, y: 164, 'font-size': 22, 'font-weight': 700, fill: C.ink, text: '互文性 intertextuality' }, parts.axes);
    el('text', { x: 566, y: 190, 'font-size': 17, fill: C.mute, text: '符號序列：說出口、寫下來的' }, parts.axes);
    el('text', { x: 300, y: 276, 'font-size': 22, 'font-weight': 700, fill: C.ink, text: '潛文性 infratextuality' }, parts.axes);
    el('text', { x: 300, y: 316, 'font-size': 17, fill: C.mute, text: '激活模式：沒有說出口的' }, parts.axes);
    parts.narr = box(552, 56, '敘事', 'narrative');
    parts.right = stack(svg, 855, 136, 1, C.enc);
    parts.a1 = arrow(svg, 'M686 56 C 860 56, 955 66, 955 128', C.enc, 'e', '整合 · 編碼器', 'integration', 850, 30);
    parts.a2 = arrow(svg, 'M955 450 C 955 515, 860 520, 690 520', C.dec, 'd', '線性化 · 解碼器', 'linearization', 850, 560);
    parts.interp = box(552, 520, '詮釋', 'interpretation');
    parts.left = stack(svg, 49, 136, -1, C.enc);
    parts.a3 = arrow(svg, 'M418 520 C 244 520, 149 515, 149 452', C.enc, 'e', '整合 · 編碼器', 'integration', 254, 560);
    parts.a4 = arrow(svg, 'M149 128 C 149 66, 244 56, 414 56', C.dec, 'd', '線性化 · 解碼器', 'linearization', 254, 30);
    // feedback: top-down signals against the feed-forward flow of each stack
    const fb = (x, y0, y1, side) => {
      const G = el('g', {}, svg);
      el('path', { d: `M${x} ${y0} L${x} ${y1}`, fill: 'none', stroke: C.amb, 'stroke-width': 3, 'marker-end': 'url(#ah-a)', class: 'flow' }, G);
      for (let i = 0; i < 3; i++) {
        const c = el('circle', { cx: x, cy: y0, r: 3.4, fill: C.amb }, G);
        el('animate', { attributeName: 'cy', from: y0, to: y1, dur: `${2.6 + i * .35}s`, begin: `${-i * .9}s`, repeatCount: 'indefinite' }, c);
      }
      const ty = (y0 + y1) / 2, tx = x + side * 18;
      el('text', { x: tx, y: ty, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 600, fill: C.amb, transform: `rotate(${side * 90} ${tx} ${ty})`, text: '回饋 feedback' }, G);
      return G;
    };
    parts.fb = el('g', {}, svg);
    parts.fb.appendChild(fb(1080, 442, 140, 1));
    parts.fb.appendChild(fb(24, 140, 442, -1));
    built = true;
  }
  H['s-circle'] = {
    render(step) {
      if (!built) build();
      show(parts.narr, true);
      show(parts.a1, step >= 1); show(parts.right, step >= 1);
      show(parts.a2, step >= 2); show(parts.interp, step >= 2);
      show(parts.a3, step >= 3); show(parts.left, step >= 3); show(parts.a4, step >= 3);
      show(parts.fb, step >= 4);
      show(parts.axes, step >= 5);
    },
  };

  /* heatmap focus and passage layers */
  H['s-heat'] = {
    render(step) {
      document.getElementById('shade-bot').classList.toggle('on', step === 2);
      document.getElementById('shade-top').classList.toggle('on', step === 3);
    },
  };
  H['s-passage'] = {
    render(step) {
      const p = document.getElementById('passage');
      for (let i = 1; i <= 5; i++) p.classList.toggle('l' + i, step >= i);
      p.classList.toggle('focus', step >= 1);
    },
  };
  document.getElementById('s-circle').dataset.steps = 5;
  document.getElementById('s-passage').dataset.steps = 5;
})();

/* ---------- regex: light up the matches ---------- */
window.HOOKS['s-r-regex'] = {
  render(step) {
    const box = document.getElementById('rx');
    if (!box.dataset.txt) { const src = box.querySelector('.rxsrc'); box.dataset.src = src.outerHTML; src.remove(); box.dataset.txt = box.textContent; }
    const pats = [null, /「.*」/g, /「.*?」/g, /(我|她)說/g];
    const re = pats[Math.min(step, 3)], txt = box.dataset.txt;
    const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    let html = esc(txt);
    if (re) { html = ''; let last = 0, m; re.lastIndex = 0;
      while ((m = re.exec(txt))) { html += esc(txt.slice(last, m.index)) + `<mark class="on${step}">${esc(m[0])}</mark>`; last = re.lastIndex; }
      html += esc(txt.slice(last)); }
    box.innerHTML = html + box.dataset.src;
  },
};

/* ---------- the sigmoid ---------- */
(function () {
  const svg = document.getElementById('sig-svg');
  const W = 440, H = 330, L = 50, R = 20, T = 20, B = 50;
  const X = z => L + (z + 6) / 12 * (W - L - R), Y = p => T + (1 - p) * (H - T - B);
  el('line', { x1: L, x2: W - R, y1: Y(0), y2: Y(0), stroke: C.mute }, svg);
  el('line', { x1: X(0), x2: X(0), y1: T, y2: Y(0), stroke: C.faint }, svg);
  [0, .5, 1].forEach(p => {
    el('line', { x1: L, x2: W - R, y1: Y(p), y2: Y(p), stroke: C.line, 'stroke-dasharray': p === .5 ? '5 5' : '' }, svg);
    el('text', { x: L - 8, y: Y(p) + 5, 'text-anchor': 'end', 'font-size': 15, fill: C.mute, text: p }, svg);
  });
  [-6, -3, 0, 3, 6].forEach(z => el('text', { x: X(z), y: Y(0) + 22, 'text-anchor': 'middle', 'font-size': 15, fill: C.mute, text: z }, svg));
  el('text', { x: W - R, y: Y(0) + 42, 'text-anchor': 'end', 'font-size': 16, fill: C.ink, text: 'z = w · x + b' }, svg);
  el('text', { x: L + 6, y: T + 4, 'font-size': 16, fill: C.ink, text: 'p（正面）' }, svg);
  let d = '';
  for (let z = -6; z <= 6.001; z += .1) d += (d ? 'L' : 'M') + X(z).toFixed(1) + ' ' + Y(1 / (1 + Math.exp(-z))).toFixed(1);
  el('path', { d, fill: 'none', stroke: C.dec, 'stroke-width': 4 }, svg);
  el('circle', { cx: X(.99), cy: Y(1 / (1 + Math.exp(-.99))), r: 7, fill: C.enc }, svg);
  el('text', { x: X(.99) + 12, y: Y(.73) + 22, 'font-size': 16, fill: C.enc, text: 'σ(0.99) ≈ 0.73' }, svg);
})();

/* ---------- character network: six characters, edges weighted by shared paragraphs ---------- */
(function () {
  const svg = document.getElementById('net-svg');
  const N = { '少平': [260, 205], '曉霞': [110, 90], '潤葉': [410, 90], '玉厚': [95, 330], '秀蓮': [425, 330], '少安': [260, 385] };
  const E = [['少平','曉霞',188],['少安','秀蓮',177],['少平','少安',110],['少安','潤葉',95],['少安','玉厚',88],['少平','潤葉',46],['少平','玉厚',27],['潤葉','曉霞',26],['少平','秀蓮',21],['秀蓮','玉厚',20],['潤葉','秀蓮',12],['潤葉','玉厚',9],['少安','曉霞',8],['曉霞','玉厚',3],['曉霞','秀蓮',1]];
  E.forEach(([a, b, w]) => {
    const [x1, y1] = N[a], [x2, y2] = N[b];
    el('line', { x1, y1, x2, y2, stroke: w >= 150 ? C.dec : C.faint, 'stroke-width': Math.max(1.5, w / 14), 'stroke-linecap': 'round', opacity: w >= 150 ? .85 : .7 }, svg);
  });
  [['少平','曉霞', 150, 160],['少安','秀蓮', 380, 375]].forEach(([a, b, x, y]) => {
    const w = E.find(e => e[0] === a && e[1] === b)[2];
    el('text', { x, y, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 700, fill: C.dec, text: w }, svg);
  });
  Object.entries(N).forEach(([n, [x, y]]) => {
    el('circle', { cx: x, cy: y, r: 36, fill: '#fff', stroke: C.ink, 'stroke-width': 2 }, svg);
    el('text', { x, y: y + 9, 'text-anchor': 'middle', 'font-size': 25, 'font-weight': 600, fill: C.ink, text: n }, svg);
  });
})();

/* ---------- title: a futuristic yin-yang, encoder (blue) and decoder (violet) made of particles ---------- */
(function () {
  const cv = document.getElementById('globe'); if (!cv) return;
  const g = cv.getContext('2d'), W = cv.width, C0 = W / 2, R = W * 0.33;
  // which half a point (unit disk, y up) belongs to: true = encoder (blue)
  const inC = (x, y, cy, r) => x * x + (y - cy) ** 2 < r * r;
  function enc(x, y) {
    if (inC(x, y, .5, .13)) return false;      // eye of the decoder half
    if (inC(x, y, -.5, .13)) return true;      // eye of the encoder half
    if (inC(x, y, .5, .5)) return true;
    if (inC(x, y, -.5, .5)) return false;
    return x < 0;
  }
  const P = [];
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  while (P.length < 900) {
    const x = rnd() * 2 - 1, y = rnd() * 2 - 1;
    if (x * x + y * y < .98) P.push([x, y, enc(x, y), rnd() * 6.283, .6 + rnd() * .8]);
  }
  const slide = document.getElementById('s-title');
  function frame(t) {
    const a = t / 7000, ca = Math.cos(a), sa = Math.sin(a);
    g.clearRect(0, 0, W, W);
    const halo = g.createRadialGradient(C0, C0, R * .3, C0, C0, R * 1.5);
    halo.addColorStop(0, 'rgba(99,102,241,.25)'); halo.addColorStop(1, 'rgba(99,102,241,0)');
    g.fillStyle = halo; g.fillRect(0, 0, W, W);
    const T = (x, y) => [C0 + (x * ca - y * sa) * R, C0 - (x * sa + y * ca) * R];
    // faint fills of the two halves (canvas coordinates: y down; rotate with the symbol)
    g.save(); g.translate(C0, C0); g.rotate(-a);
    g.fillStyle = 'rgba(168,85,247,.14)'; g.beginPath(); g.arc(0, 0, R, 0, 6.283); g.fill();
    g.fillStyle = 'rgba(59,130,246,.2)'; g.beginPath();
    g.arc(0, 0, R, -Math.PI / 2, Math.PI / 2, true);
    g.arc(0, R / 2, R / 2, Math.PI / 2, 3 * Math.PI / 2, false);
    g.arc(0, -R / 2, R / 2, Math.PI / 2, -Math.PI / 2, true);
    g.fill(); g.restore();
    // particles
    P.forEach(([x, y, e, ph, sz]) => {
      const [X, Y] = T(x, y), tw = .55 + .45 * Math.sin(t / 600 + ph);
      g.fillStyle = e ? `rgba(96,165,250,${.35 + .6 * tw})` : `rgba(192,132,252,${.35 + .6 * tw})`;
      g.beginPath(); g.arc(X, Y, 2.2 * sz + 1.2 * tw, 0, 6.283); g.fill();
    });
    // neon S-curve and outer circle
    g.save(); g.shadowBlur = 24; g.lineWidth = 4;
    const grad = g.createLinearGradient(C0 - R, C0, C0 + R, C0);
    grad.addColorStop(0, '#60a5fa'); grad.addColorStop(1, '#c084fc');
    g.strokeStyle = grad; g.shadowColor = '#a78bfa';
    g.beginPath(); g.arc(C0, C0, R, 0, 6.283); g.stroke();
    g.beginPath();
    for (let k = 0; k <= 60; k++) {   // S-curve: upper half-circle then lower
      const u = k / 60 * Math.PI, [X, Y] = k <= 30 ? T(.5 * Math.sin(u * 2), .5 + .5 * Math.cos(u * 2)) : T(-.5 * Math.sin(u * 2 - Math.PI), -.5 + .5 * Math.cos(u * 2 - Math.PI));
      k ? g.lineTo(X, Y) : g.moveTo(X, Y);
    }
    g.stroke();
    // the two eyes as glowing rings
    [[0, .5, '#c084fc'], [0, -.5, '#60a5fa']].forEach(([x, y, col]) => {
      const [X, Y] = T(x, y); g.strokeStyle = col; g.shadowColor = col; g.lineWidth = 3;
      g.beginPath(); g.arc(X, Y, .13 * R, 0, 6.283); g.stroke();
    });
    g.restore();
    // labels inside the halves
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '700 40px "PingFang TC", sans-serif';
    let [X, Y] = T(-.5, .05); g.fillStyle = '#dbeafe'; g.fillText('編碼', X, Y);
    [X, Y] = T(.5, -.05); g.fillStyle = '#f3e8ff'; g.fillText('解碼', X, Y);
  }
  let on = false;
  function loop(t) { frame(t); if (slide.classList.contains('active')) requestAnimationFrame(loop); else on = false; }
  window.HOOKS['s-title'] = { render() { if (!on) { on = true; requestAnimationFrame(loop); } } };
  frame(0);
})();

/* ---------- reality vs. model (from the topic-modeling deck): the octagon slides over the circle, never covering it exactly ---------- */
(function () {
  const CY = 260, R = 150, X0 = 205;
  const OCT = Array.from({ length: 8 }, (_, k) => { const a = Math.PI / 8 + k * Math.PI / 4, r = 151.5; return `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`; }).join(' ');
  const POS = [700, 400, 300, 215];
  const GREEN = '#059669', BLUE = '#2563eb', ORANGE = '#d97706';
  let sl;
  function build() {
    const svg = sl.querySelector('#rm-svg');
    svg.innerHTML = `
      <defs>
        <pattern id="hg" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="9" stroke="${GREEN}" stroke-width="1.6" opacity=".55"/></pattern>
        <pattern id="hb" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="9" stroke="${BLUE}" stroke-width="1.6" opacity=".55"/></pattern>
        <mask id="m-notmodel" maskUnits="userSpaceOnUse" x="-200" y="-200" width="960" height="900"><rect x="-200" y="-200" width="960" height="900" fill="#fff"/><polygon class="mv" points="${OCT}" fill="#000"/></mask>
        <mask id="m-notreal" maskUnits="userSpaceOnUse" x="-200" y="-200" width="960" height="900"><rect x="-200" y="-200" width="960" height="900" fill="#fff"/><circle cx="${X0}" cy="${CY}" r="${R}" fill="#000"/></mask>
      </defs>
      <circle cx="${X0}" cy="${CY}" r="${R}" fill="url(#hg)" stroke="${GREEN}" stroke-width="3"/>
      <g class="rm-gap"><g mask="url(#m-notmodel)"><circle cx="${X0}" cy="${CY}" r="${R}" fill="${GREEN}" opacity=".45"/></g></g>
      <polygon class="mv" points="${OCT}" fill="url(#hb)" stroke="${BLUE}" stroke-width="3"/>
      <g class="rm-gap"><g mask="url(#m-notreal)"><polygon class="mv" points="${OCT}" fill="${ORANGE}" opacity=".45"/></g></g>
      <text x="${X0 - 120}" y="88" font-size="26" font-weight="700" fill="${GREEN}">現實 <tspan font-size="18" font-weight="400">reality</tspan></text>
      <g class="mv"><text x="10" y="-172" font-size="26" font-weight="700" fill="${BLUE}">模型 <tspan font-size="18" font-weight="400">our model</tspan></text></g>
      <g class="rm-gap" font-size="20">
        <rect x="20" y="440" width="22" height="22" rx="4" fill="${GREEN}" opacity=".6"/><text x="52" y="458">模型沒抓到的現實 <tspan fill="#64748b" font-size="16">reality the model misses</tspan></text>
        <rect x="20" y="472" width="22" height="22" rx="4" fill="${ORANGE}" opacity=".6"/><text x="52" y="490">現實中不存在的值 <tspan fill="#64748b" font-size="16">invalid values</tspan></text>
      </g>`;
  }
  function place(v, animate) {
    sl.querySelectorAll('#rm-svg .mv').forEach(n => {
      n.style.transition = animate ? 'transform 1.1s ease-in-out' : 'none';
      n.style.transform = `translate(${v}px, ${CY}px)`;
    });
  }
  window.HOOKS['s-model'] = {
    render(step, slide) {
      if (!sl) { sl = slide; build(); place(POS[0], false); }
      sl.querySelectorAll('.rm-gap').forEach(g => { g.style.transition = 'opacity .5s .6s'; g.style.opacity = step >= 2 ? 1 : 0; });
      requestAnimationFrame(() => place(POS[Math.min(step, 3)], true));
    }
  };
})();

/* ---------- 紅樓夢 chrono-divide, redrawn from Hu, Wang & Wu (2014), Fig. 1(b) (as in the stylometry deck; values approximate) ---------- */
(function () {
  const svg = document.getElementById('res-svg'); if (!svg) return;
  const A = '#2563eb', B = '#7c3aed', GOLD = '#d97706', INK = '#0f172a';
  const V = { 61: 1.75, 62: 1.85, 63: 1.5, 64: 0.9, 65: 1.5, 66: 0.1, 67: -1.35, 68: 1.05, 69: 0.6, 70: 1.55, 71: 1.35, 72: 1.3, 73: 1.45, 74: 1.9, 75: 2.6, 76: 2.25, 77: 1.65, 78: 0.9, 79: 1.65, 80: 1.9,
    81: -0.55, 82: -0.6, 83: -0.8, 84: -1.45, 85: -0.9, 86: -3.95, 87: -0.45, 88: -0.75, 89: -0.25, 90: -0.25 };
  const X = n => 90 + (n - 60) * 18.5, Y = v => 30 + (3 - v) / 7 * 360;
  let h = `<rect x="${X(80.5)}" y="${Y(3)}" width="${X(90.5) - X(80.5)}" height="${Y(-4) - Y(3)}" fill="${B}" opacity=".07"/>`;
  for (let v = -4; v <= 3; v++) h += `<line x1="${X(60)}" y1="${Y(v)}" x2="${X(90.5)}" y2="${Y(v)}" stroke="${v ? '#eef0f4' : INK}" stroke-width="${v ? 1 : 2}"/><text x="${X(60) - 10}" y="${Y(v) + 6}" text-anchor="end">${v}</text>`;
  for (let n = 60; n <= 90; n += 5) h += `<text x="${X(n)}" y="${Y(-4) + 26}" text-anchor="middle">${n}</text>`;
  h += `<text x="${X(75)}" y="${Y(-4) + 54}" text-anchor="middle" fill="${INK}">回 chapter</text>`;
  h += `<text x="${X(60) - 50}" y="${Y(-0.5)}" text-anchor="middle" transform="rotate(-90 ${X(60) - 50} ${Y(-0.5)})" fill="${INK}">SVM 分數</text>`;
  h += `<line x1="${X(80.5)}" y1="${Y(3)}" x2="${X(80.5)}" y2="${Y(-4)}" stroke="${GOLD}" stroke-width="3" stroke-dasharray="7 5"/><text x="${X(80.5) + 8}" y="${Y(3) + 20}" font-size="20" font-weight="700" fill="#b45309">第 80 回</text>`;
  Object.entries(V).forEach(([n, v]) => { n = +n;
    h += n <= 80 ? `<text x="${X(n)}" y="${Y(v) + 10}" text-anchor="middle" font-size="30" fill="${A}">*</text>` : `<circle cx="${X(n)}" cy="${Y(v)}" r="7" fill="none" stroke="${B}" stroke-width="3"/>`; });
  h += `<circle cx="${X(67)}" cy="${Y(-1.35)}" r="18" fill="none" stroke="${GOLD}" stroke-width="3.5"/><text x="${X(67) + 24}" y="${Y(-1.35) + 32}" font-size="20" font-weight="700" fill="#b45309">第 67 回</text>`;
  svg.innerHTML = h;
  svg.style.fontFamily = 'var(--cjk)'; svg.style.fontSize = '18px'; svg.style.fill = '#64748b';
})();
