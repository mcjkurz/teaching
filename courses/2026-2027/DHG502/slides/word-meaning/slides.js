/* Slide-specific logic for the word-vectors deck (loaded before deck.js). */
window.HOOKS = {};
window.SECTIONS = [
  { id: 'meaning',    zh: '詞義是什麼',   en: 'What is meaning?' },
  { id: 'relations',  zh: '分布假說',     en: 'The distributional hypothesis' },
  { id: 'vectors',    zh: '向量與餘弦',   en: 'Vectors and cosine similarity' },
  { id: 'counts',     zh: '共現向量',     en: 'Co-occurrence vectors' },
  { id: 'embeddings', zh: '稠密詞向量',   en: 'Dense word vectors' },
  { id: 'change',     zh: '語義變遷',     en: 'Meaning change over time' },
  { id: 'directions', zh: '方向與偏見',   en: 'Directions: measuring associations' },
  { id: 'context',    zh: '一詞多義',     en: 'Limits: polysemy' },
  { id: 'summary',    zh: '總結、練習、作業', en: 'Summary, exercises, homework' }
];
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const BAD_C = '#b42318', BLUE = '#1f5fd6', ORG = '#e0570f', GRN = '#157a3c', PUR = '#7c3aed', GLD = '#d99a00', MUTE = '#6a7386', LINE = '#dde1e8', INK = '#1b2333';
const fmt = n => (Math.round(n * 100) / 100).toString().replace('-', '−');

/* ---------- LaTeX: write \( inline \) anywhere in the text ---------- */
function texify(root) {
  const re = /\\\((.+?)\\\)/gs;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) if (/\\\(/.test(walker.currentNode.nodeValue)) nodes.push(walker.currentNode);
  nodes.forEach(n => {
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
}
texify(document.getElementById('stage'));

/* ---------- tiny SVG plotting helper: data coordinates → SVG, uniform scale, centred ---------- */
const NS = 'http://www.w3.org/2000/svg';
function el(tag, attrs, parent, text) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  if (parent) parent.appendChild(e);
  return e;
}
function Plot(svg, { xmin, xmax, ymin, ymax, pad = 22 }) {
  const vb = svg.viewBox.baseVal, W = vb.width, H = vb.height;
  const s = Math.min((W - 2 * pad) / (xmax - xmin), (H - 2 * pad) / (ymax - ymin));
  const ox = (W - s * (xmax - xmin)) / 2, oy = (H - s * (ymax - ymin)) / 2;
  const X = x => ox + (x - xmin) * s, Y = y => H - oy - (y - ymin) * s;
  const P = {
    svg, X, Y, s, W, H,
    clear() { while (svg.firstChild) svg.removeChild(svg.firstChild); },
    grid(step = 1, axes = true, labels = false) {
      for (let x = Math.ceil(xmin / step) * step; x <= xmax + 1e-9; x += step) el('line', { x1: X(x), y1: Y(ymin), x2: X(x), y2: Y(ymax), stroke: LINE, 'stroke-width': 1 }, svg);
      for (let y = Math.ceil(ymin / step) * step; y <= ymax + 1e-9; y += step) el('line', { x1: X(xmin), y1: Y(y), x2: X(xmax), y2: Y(y), stroke: LINE, 'stroke-width': 1 }, svg);
      if (axes) {
        el('line', { x1: X(xmin), y1: Y(0), x2: X(xmax), y2: Y(0), stroke: '#9aa3b2', 'stroke-width': 2 }, svg);
        el('line', { x1: X(0), y1: Y(ymin), x2: X(0), y2: Y(ymax), stroke: '#9aa3b2', 'stroke-width': 2 }, svg);
      }
      if (labels) {
        for (let x = Math.ceil(xmin / step) * step; x <= xmax + 1e-9; x += step) if (x) el('text', { x: X(x), y: Y(0) + 17, 'text-anchor': 'middle', fill: MUTE, 'font-size': 13 }, svg, fmt(x));
        for (let y = Math.ceil(ymin / step) * step; y <= ymax + 1e-9; y += step) if (y) el('text', { x: X(0) - 7, y: Y(y) + 5, 'text-anchor': 'end', fill: MUTE, 'font-size': 13 }, svg, fmt(y));
      }
      return P;
    },
    arrow(x1, y1, x2, y2, o = {}) {
      const c = o.color || BLUE, w = o.w || 4, hl = o.head || 15, hw = hl * 0.42;
      const a = [X(x1), Y(y1)], b = [X(x2), Y(y2)];
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      const bx = b[0] - Math.cos(ang) * hl * 0.8, by = b[1] - Math.sin(ang) * hl * 0.8;
      const g = el('g', o.cls ? { class: o.cls } : {}, svg);
      el('line', { x1: a[0], y1: a[1], x2: bx, y2: by, stroke: c, 'stroke-width': w, 'stroke-linecap': 'round', ...(o.dash ? { 'stroke-dasharray': o.dash } : {}) }, g);
      const px = -Math.sin(ang), py = Math.cos(ang);
      el('polygon', { points: `${b[0]},${b[1]} ${b[0] - Math.cos(ang) * hl + px * hw},${b[1] - Math.sin(ang) * hl + py * hw} ${b[0] - Math.cos(ang) * hl - px * hw},${b[1] - Math.sin(ang) * hl - py * hw}`, fill: c }, g);
      return g;
    },
    line(x1, y1, x2, y2, o = {}) { return el('line', { x1: X(x1), y1: Y(y1), x2: X(x2), y2: Y(y2), stroke: o.color || '#9aa3b2', 'stroke-width': o.w || 2, ...(o.dash ? { 'stroke-dasharray': o.dash } : {}) }, svg); },
    dot(x, y, o = {}) { return el('circle', { cx: X(x), cy: Y(y), r: o.r || 7, fill: o.color || BLUE, ...(o.stroke ? { stroke: o.stroke, 'stroke-width': 2.5 } : {}) }, svg); },
    text(x, y, t, o = {}) { return el('text', { x: X(x) + (o.dx || 0), y: Y(y) + (o.dy || 0), 'text-anchor': o.anchor || 'start', fill: o.color || INK, 'font-size': o.size || 20, 'font-weight': o.weight || 500 }, svg, t); },
    arc(r, a1, a2, o = {}) {   // angles in radians, counter-clockwise in data space
      const p1 = [X(r * Math.cos(a1)), Y(r * Math.sin(a1))], p2 = [X(r * Math.cos(a2)), Y(r * Math.sin(a2))];
      const large = Math.abs(a2 - a1) > Math.PI ? 1 : 0, sweep = a2 > a1 ? 0 : 1;
      return el('path', { d: `M${p1[0]},${p1[1]} A${r * s},${r * s} 0 ${large} ${sweep} ${p2[0]},${p2[1]}`, fill: 'none', stroke: o.color || GLD, 'stroke-width': o.w || 3 }, svg);
    }
  };
  return P;
}
const rad = d => d * Math.PI / 180;
const dotp = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const norm = a => Math.sqrt(dotp(a, a));
const cosine = (a, b) => dotp(a, b) / (norm(a) * norm(b));

/* ---------- 1. title: a slowly rotating 3-D word space ----------
   Performance: every SVG element is created ONCE; each frame only updates attributes.
   The animation runs at ~30 fps, only while the title slide is visible and the tab is in front. */
(function () {
  const svg = $('#title-plot'), slide = $('#s-title');
  const W = 560, H = 560, cx = W / 2 - 10, cy = H / 2 + 20, S = 80;
  const words = [
    ['幸福', [1.9, 1.3, 1.2], BLUE], ['快樂', [1.6, 1.7, 0.9], BLUE], ['開心', [2.0, 1.5, 0.6], BLUE],
    ['悲傷', [-1.7, 1.2, 1.4], PUR], ['痛苦', [-1.9, 0.9, 1.0], PUR],
    ['牙刷', [0.6, -1.8, 1.6], ORG], ['香蕉', [1.1, -1.6, 2.0], ORG],
    ['皇帝', [-0.9, -1.2, -1.6], GRN], ['皇后', [-0.3, -1.6, -1.7], GRN]
  ];
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const dust = Array.from({ length: 90 }, () => [(rnd() * 2 - 1) * 2.4, (rnd() * 2 - 1) * 2.4, (rnd() * 2 - 1) * 2.4]);
  const L = 2.5, pitch = 0.42, cp = Math.cos(pitch), sp = Math.sin(pitch);
  let yaw = 0.6;
  function proj([x, y, z]) {
    const c = Math.cos(yaw), s = Math.sin(yaw);
    const xr = x * c - y * s, yr = x * s + y * c;
    const yt = yr * cp - z * sp, zt = yr * sp + z * cp;
    const f = 6 / (6 + yt);
    return { x: cx + xr * S * f, y: cy - zt * S * f, d: yt, f };
  }
  const set = (e, o) => { for (const k in o) e.setAttribute(k, o[k]); };

  // ---- build the scene once ----
  const gGrid = el('g', {}, svg), gAxes = el('g', {}, svg), gDust = el('g', {}, svg), gWords = el('g', {}, svg);
  const grid = [];
  for (let i = -2; i <= 2; i++) {
    grid.push([[i, -2, 0], [i, 2, 0], el('line', { stroke: '#dfe4ec', 'stroke-width': 1 }, gGrid)]);
    grid.push([[-2, i, 0], [2, i, 0], el('line', { stroke: '#dfe4ec', 'stroke-width': 1 }, gGrid)]);
  }
  const axes = [[[L, 0, 0], 'x₁'], [[0, L, 0], 'x₂'], [[0, 0, L], 'x₃']].map(([v, n]) => ({
    v, line: el('line', { stroke: '#a3acbb', 'stroke-width': 1.6 }, gAxes),
    label: el('text', { fill: '#8a93a3', 'font-size': 16, 'font-style': 'italic' }, gAxes, n)
  }));
  const dots = dust.map(v => ({ v, c: el('circle', { fill: '#9aa6bb' }, gDust) }));
  const items = words.map(([w, v, c]) => {
    const g = el('g', {}, gWords);
    return {
      v, g,
      line: el('line', { stroke: c, 'stroke-linecap': 'round' }, g),
      head: el('polygon', { fill: c }, g),
      dot: el('circle', { fill: c }, g),
      text: el('text', { fill: c, 'font-weight': 700, stroke: '#fff', 'stroke-width': 4, 'paint-order': 'stroke' }, g, w)
    };
  });
  const origin = el('circle', { r: 4.5, fill: INK }, svg);
  let order = '';

  function draw() {
    const O = proj([0, 0, 0]);
    grid.forEach(([p, q, e]) => { const a = proj(p), b = proj(q); set(e, { x1: a.x, y1: a.y, x2: b.x, y2: b.y }); });
    axes.forEach(({ v, line, label }) => {
      const n = proj(v.map(c => -c * 0.8)), p = proj(v);
      set(line, { x1: n.x, y1: n.y, x2: p.x, y2: p.y }); set(label, { x: p.x + 6, y: p.y - 4 });
    });
    dots.forEach(({ v, c }) => { const p = proj(v); set(c, { cx: p.x, cy: p.y, r: 2.6 * p.f, opacity: 0.18 + 0.3 * (1 - (p.d + 3) / 6) }); });
    items.forEach(it => {
      const p = it.p = proj(it.v);
      const near = Math.max(0, Math.min(1, 1 - (p.d + 2.5) / 5)), op = 0.45 + 0.55 * near;
      const ang = Math.atan2(p.y - O.y, p.x - O.x), hl = 14 * p.f, hw = 5.5 * p.f, ca = Math.cos(ang), sa = Math.sin(ang);
      set(it.g, { opacity: op });
      set(it.line, { x1: O.x, y1: O.y, x2: p.x - ca * hl * 0.8, y2: p.y - sa * hl * 0.8, 'stroke-width': 3.2 * p.f });
      set(it.head, { points: `${p.x},${p.y} ${p.x - ca * hl - sa * hw},${p.y - sa * hl + ca * hw} ${p.x - ca * hl + sa * hw},${p.y - sa * hl - ca * hw}` });
      set(it.dot, { cx: p.x, cy: p.y, r: 5 * p.f });
      set(it.text, { x: p.x + 9, y: p.y - 8, 'font-size': 23 * p.f });
    });
    // paint far words first: re-append only when the depth order actually changes
    const sorted = items.slice().sort((a, b) => b.p.d - a.p.d), key = sorted.map(it => it.v.join()).join('|');
    if (key !== order) { sorted.forEach(it => gWords.appendChild(it.g)); order = key; }
    set(origin, { cx: O.x, cy: O.y });
  }

  // ---- animation loop: ~30 fps, only while visible ----
  const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let running = false, last = 0;
  function tick(ts) {
    if (!slide.classList.contains('active') || document.hidden) { running = false; return; }
    if (ts - last >= 33) { yaw += Math.min(100, ts - (last || ts)) * 0.00018; last = ts; draw(); }
    requestAnimationFrame(tick);
  }
  function start() { if (running || still) return; running = true; last = 0; requestAnimationFrame(tick); }
  HOOKS['s-title'] = { render() { start(); } };
  document.addEventListener('visibilitychange', () => { if (!document.hidden && slide.classList.contains('active')) start(); });
  draw();
})();

/* ---------- vectors: 2D ---------- */
(function () {
  const p = Plot($('#vec2d-plot'), { xmin: -4, xmax: 5, ymin: -2, ymax: 5, pad: 14 });
  p.grid(1, true, true);
  p.line(3, 0, 3, 2, { color: BLUE, dash: '6 5', w: 2 }); p.line(0, 2, 3, 2, { color: BLUE, dash: '6 5', w: 2 });
  p.arrow(0, 0, 3, 2, { color: BLUE, w: 5 }); p.arrow(0, 0, -2, 3, { color: GRN, w: 5 });
  p.text(3, 2, 'a = [3, 2]', { color: BLUE, size: 21, weight: 700, dx: 12, dy: -8 });
  p.text(-2, 3, 'b = [−2, 3]', { color: GRN, size: 21, weight: 700, dx: -6, dy: -12, anchor: 'middle' });
  p.dot(0, 0, { r: 5, color: INK });
})();

/* ---------- vectors: 3D (oblique projection) ---------- */
(function () {
  const svg = $('#vec3d-plot'), s = 42, o = [240, 262];
  const pr = (x, y, z) => [o[0] + s * (-0.35 * x + y), o[1] + s * (0.5 * x - z)];
  const L = (a, b, attrs) => el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], ...attrs }, svg);
  // floor grid
  for (let i = -4; i <= 4; i++) {
    L(pr(i, -4, 0), pr(i, 4, 0), { stroke: LINE, 'stroke-width': 1 });
    L(pr(-4, i, 0), pr(4, i, 0), { stroke: LINE, 'stroke-width': 1 });
  }
  [['x₁', pr(4.9, 0, 0)], ['x₂', pr(0, 4.7, 0)], ['x₃', pr(0, 0, 4.2)]].forEach(([t, p]) => el('text', { x: p[0] + 8, y: p[1] + 6, fill: MUTE, 'font-size': 18, 'font-style': 'italic' }, svg, t));
  L(pr(-4, 0, 0), pr(4.4, 0, 0), { stroke: '#9aa3b2', 'stroke-width': 2 });
  L(pr(0, -4, 0), pr(0, 4.4, 0), { stroke: '#9aa3b2', 'stroke-width': 2 });
  L(pr(0, 0, -3), pr(0, 0, 4), { stroke: '#9aa3b2', 'stroke-width': 2 });
  const vec = (v, c, name, dx, dy) => {
    const t = pr(...v), f = pr(v[0], v[1], 0), fx = pr(v[0], 0, 0);
    L(t, f, { stroke: c, 'stroke-width': 2, 'stroke-dasharray': '5 5' });
    L(f, fx, { stroke: c, 'stroke-width': 2, 'stroke-dasharray': '5 5' });
    L(fx, pr(0, 0, 0), { stroke: c, 'stroke-width': 2, 'stroke-dasharray': '5 5' });
    const ang = Math.atan2(t[1] - o[1], t[0] - o[0]), hl = 15;
    L(o, [t[0] - Math.cos(ang) * hl * 0.8, t[1] - Math.sin(ang) * hl * 0.8], { stroke: c, 'stroke-width': 5, 'stroke-linecap': 'round' });
    const px = -Math.sin(ang), py = Math.cos(ang);
    el('polygon', { points: `${t[0]},${t[1]} ${t[0] - Math.cos(ang) * hl + px * 6},${t[1] - Math.sin(ang) * hl + py * 6} ${t[0] - Math.cos(ang) * hl - px * 6},${t[1] - Math.sin(ang) * hl - py * 6}`, fill: c }, svg);
    el('text', { x: t[0] + dx, y: t[1] + dy, fill: c, 'font-size': 22, 'font-weight': 700 }, svg, name);
  };
  vec([3, 2, 1], BLUE, 'a', 10, 22);
  vec([-4, 2, 2], GRN, 'b', 10, -8);
})();

/* ---------- dot-product tables ---------- */
function dotviz(root, a, b, o = {}) {
  const n = a.length, vs = o.vecStep != null ? ` data-step="${o.vecStep}"` : '';
  const cell = (v, cls = '') => `<div class="dc ${cls}">${fmt(v)}</div>`;
  const prods = a.map((x, i) => x * b[i]), sum = prods.reduce((s, v) => s + v, 0);
  const cols = o.compact ? `grid-template-columns: ${o.lw || 44}px repeat(${n}, 1fr)` : `grid-template-columns: 64px repeat(${n}, 1fr) 190px`;
  const tail = o.compact ? '' : '<div></div>';
  root.innerHTML =
    `<div class="drow" style="${cols}"${vs}><div class="dl">${o.names ? o.names[0] : 'a'}</div>${a.map(v => cell(v)).join('')}${tail}</div>` +
    `<div class="drow" style="${cols}"${vs}><div class="dl">${o.names ? o.names[1] : 'b'}</div>${b.map(v => cell(v)).join('')}${tail}</div>` +
    `<div class="drow prod" style="${cols}" data-step="${o.prodStep || 2}"><div class="dl">×</div>${prods.map(v => cell(v, v >= 0 ? 'pos' : 'neg')).join('')}${tail}</div>` +
    (o.compact
      ? `<div class="dsum ${sum >= 0 ? 'pos' : 'neg'}" data-step="${o.sumStep || 3}">Σ = ${fmt(sum)}</div>`
      : `<div class="drow sum" style="${cols}" data-step="${o.sumStep || 3}"><div class="dl">Σ</div>${prods.map(() => '<div></div>').join('')}<div class="dsum ${sum >= 0 ? 'pos' : 'neg'}">= ${fmt(sum)}</div></div>`);
}
dotviz($('#dot-a'), [3, 2, 0.5], [-1, 3.5, 2], { vecStep: 1 });
dotviz($('#dot-q1'), [2, -5, -2, 3], [3, -3, -4, 4], { names: ['a', 'b'], compact: true });
dotviz($('#dot-q2'), [-1, 6, -2, -2], [2, -5, 4, 4], { names: ['c', 'd'], compact: true });
/* ---------- magnitude ‖a‖: the 3-4-5 triangle ---------- */
// The 3-4-5 picture. Both the length slide and the worked-normalization slide draw it with exactly the same
// geometry, so moving from one slide to the next keeps the triangle in place.
function draw345(svg, o) {
  const p = Plot(svg, { xmin: -0.8, xmax: 4.8, ymin: -0.8, ymax: 4.8, pad: 10 });
  p.clear(); p.grid(1, true, true);
  if (o.legs) {
    el('polygon', { points: `${p.X(0)},${p.Y(0)} ${p.X(3)},${p.Y(0)} ${p.X(3)},${p.Y(4)}`, fill: '#fff6d6', stroke: 'none' }, svg);
    p.line(0, 0, 3, 0, { color: GLD, w: 6 }); p.line(3, 0, 3, 4, { color: GLD, w: 6 });
    el('rect', { x: p.X(3) - 18, y: p.Y(0) - 18, width: 18, height: 18, fill: 'none', stroke: GLD, 'stroke-width': 2.5 }, svg);
    p.text(1.5, 0, '3', { color: '#8a6400', size: 30, weight: 700, dy: 36, anchor: 'middle' });
    p.text(3, 2, '4', { color: '#8a6400', size: 30, weight: 700, dx: 14, dy: 10 });
  }
  p.arrow(0, 0, 3, 4, { color: BLUE, w: 6 });
  p.text(3, 4, 'a = [3, 4]', { color: BLUE, size: 26, weight: 700, dx: 10, dy: -10 });
  if (o.len) p.text(1.5, 2, '‖a‖ = 5', { color: BLUE, size: 32, weight: 700, dx: -18, dy: -10, anchor: 'end' }).setAttribute('style', 'font-family: "Times New Roman", STIXGeneral, serif');
  if (o.unit) {   // â = a / 5 on the unit circle, with its shadows 3/5 and 4/5
    el('path', { d: `M${p.X(1)},${p.Y(0)} A${p.s},${p.s} 0 0 0 ${p.X(0)},${p.Y(1)}`, fill: 'none', stroke: ORG, 'stroke-width': 2.5, 'stroke-dasharray': '4 5', opacity: 0.8 }, svg);
    p.line(0.6, 0.8, 0.6, 0, { color: ORG, w: 2, dash: '4 4' }); p.line(0.6, 0.8, 0, 0.8, { color: ORG, w: 2, dash: '4 4' });
    p.line(0, 0, 0.6, 0, { color: ORG, w: 10 }).setAttribute('opacity', 0.45); p.line(0, 0, 0, 0.8, { color: ORG, w: 10 }).setAttribute('opacity', 0.45);
    p.text(0.6, 0, '3/5', { color: ORG, size: 20, weight: 700, dy: 58, anchor: 'middle' });
    p.text(0, 0.8, '4/5', { color: ORG, size: 20, weight: 700, dx: -24, dy: 7, anchor: 'end' });
    p.arrow(0, 0, 0.6, 0.8, { color: ORG, w: 8, head: 16 });
    p.text(0.6, 0.8, 'â = [3/5, 4/5]', { color: ORG, size: 22, weight: 700, dx: 16, dy: 10 });
  }
  if (o.theta) {   // the angle θ between a and the x-axis
    p.arc(0.55, 0, Math.atan2(4, 3), { color: PUR, w: 3 });
    p.text(0.62, 0.32, 'θ', { color: PUR, size: 28, weight: 700, dx: 4, dy: 6 });
  }
  if (o.names) {   // name the sides of the big triangle
    p.text(1.5, 0, 'adjacent b', { color: '#8a6400', size: 20, weight: 700, dx: 22, dy: 36 });
    p.text(2.25, 3, 'hypotenuse c', { color: BLUE, size: 20, weight: 700, dx: -14, dy: -2, anchor: 'end' });
    p.text(3, 2, 'opposite', { color: '#8a6400', size: 20, weight: 700, dx: 14, dy: 36 });
  }
  if (o.cosHL) {   // after normalizing, the x-shadow IS cos θ
    p.line(0, 0, 0.6, 0, { color: PUR, w: 12 });
    p.line(0.6, 0.8, 0.6, 0, { color: PUR, w: 3, dash: '5 4' });
    const t = p.text(0.3, 0, 'cos θ', { color: PUR, size: 22, weight: 700, dy: -14, anchor: 'middle' });
    t.setAttribute('stroke', '#fff'); t.setAttribute('stroke-width', 5); t.setAttribute('paint-order', 'stroke');
  }
  p.dot(0, 0, { r: 5, color: INK });
}
// zoomed view of the unit triangle: hypotenuse 1, adjacent 3/5 (= cos θ), opposite 4/5
function drawUnitZoom(svg, hl) {
  const p = Plot(svg, { xmin: -0.22, xmax: 1.18, ymin: -0.22, ymax: 1.18, pad: 10 });
  p.clear(); p.grid(0.2, true, false);
  [1].forEach(v => { { p.text(v, 0, String(v), { color: MUTE, size: 16, dy: 22, anchor: 'middle' }); p.text(0, v, String(v), { color: MUTE, size: 16, dx: -8, dy: 5, anchor: 'end' }); } });
  // unit circle arc
  el('path', { d: `M${p.X(1)},${p.Y(0)} A${p.s},${p.s} 0 0 0 ${p.X(0)},${p.Y(1)}`, fill: 'none', stroke: ORG, 'stroke-width': 2.5, 'stroke-dasharray': '6 6', opacity: 0.7 }, svg);
  // the big vector a continues beyond the view (faint)
  p.line(0, 0, 3 / 5 * 1.42, 4 / 5 * 1.42, { color: BLUE, w: 4 }).setAttribute('opacity', 0.25);
  // unit triangle
  el('polygon', { points: `${p.X(0)},${p.Y(0)} ${p.X(0.6)},${p.Y(0)} ${p.X(0.6)},${p.Y(0.8)}`, fill: '#f1e9ff', stroke: 'none' }, svg);
  p.line(0.6, 0, 0.6, 0.8, { color: GLD, w: 4, dash: '7 5' });
  el('rect', { x: p.X(0.6) - 16, y: p.Y(0) - 16, width: 16, height: 16, fill: 'none', stroke: GLD, 'stroke-width': 2.5 }, svg);
  p.line(0, 0, 0.6, 0, { color: PUR, w: hl ? 12 : 6 });
  p.arrow(0, 0, 0.6, 0.8, { color: ORG, w: 7, head: 20 });
  p.arc(0.18, 0, Math.atan2(4, 3), { color: PUR, w: 3 });
  p.text(0.2, 0.08, 'θ', { color: PUR, size: 28, weight: 700, dx: 6, dy: 4 });
  const lab = (x, y, t, c, o) => { const e = p.text(x, y, t, { color: c, size: 24, weight: 700, ...o }); e.setAttribute('stroke', '#fff'); e.setAttribute('stroke-width', 6); e.setAttribute('paint-order', 'stroke'); };
  lab(0.3, 0.4, 'hypotenuse', ORG, { dx: -14, dy: -14, anchor: 'end' });
  lab(0.3, 0.4, 'c = 1', ORG, { dx: -14, dy: 14, anchor: 'end' });
  lab(0.6, 0.4, 'opposite 4/5', '#8a6400', { dx: 12, dy: 8 });
  lab(0.3, 0, hl ? 'adjacent b = cos θ = 3/5' : 'adjacent b = 3/5', PUR, { dy: 36, anchor: 'middle' });
  lab(0.6, 0.8, 'â = [3/5, 4/5]', ORG, { dx: 14, dy: -6 });
  p.dot(0, 0, { r: 5, color: INK });
}
// one frame of the zoom between the full 3-4-5 view (t = 0) and the unit-triangle view (t = 1)
function drawZoomFrame(svg, t) {
  const lerp = (a, b) => a + (b - a) * t;
  const p = Plot(svg, { xmin: lerp(-0.8, -0.22), xmax: lerp(4.8, 1.18), ymin: lerp(-0.8, -0.22), ymax: lerp(4.8, 1.18), pad: 10 });
  p.clear(); p.grid(t > 0.6 ? 0.2 : 1, true, false);
  el('polygon', { points: `${p.X(0)},${p.Y(0)} ${p.X(3)},${p.Y(0)} ${p.X(3)},${p.Y(4)}`, fill: '#fff6d6', opacity: 1 - t }, svg);
  p.line(0, 0, 3, 0, { color: GLD, w: 6 }).setAttribute('opacity', 1 - 0.7 * t);
  p.line(3, 0, 3, 4, { color: GLD, w: 6 }).setAttribute('opacity', 1 - 0.7 * t);
  p.arrow(0, 0, 3, 4, { color: BLUE, w: 6 }).setAttribute('opacity', 1 - 0.75 * t);
  el('path', { d: `M${p.X(1)},${p.Y(0)} A${p.s},${p.s} 0 0 0 ${p.X(0)},${p.Y(1)}`, fill: 'none', stroke: ORG, 'stroke-width': 2.5, 'stroke-dasharray': '6 6', opacity: 0.75 }, svg);
  el('polygon', { points: `${p.X(0)},${p.Y(0)} ${p.X(0.6)},${p.Y(0)} ${p.X(0.6)},${p.Y(0.8)}`, fill: '#f1e9ff', opacity: t }, svg);
  p.line(0.6, 0, 0.6, 0.8, { color: GLD, w: 3, dash: '6 5' });
  p.line(0, 0, 0.6, 0, { color: PUR, w: 3 + 3 * t });
  p.arrow(0, 0, 0.6, 0.8, { color: ORG, w: 4 + 3 * t, head: 12 + 8 * t });
  p.dot(0, 0, { r: 5, color: INK });
}
(function () {
  const svg = $('#cosproj-plot');
  let t = 0, anim = null;
  const ease = x => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  const settle = step => { if (t >= 1) drawUnitZoom(svg, step >= 3); else draw345(svg, { legs: true, len: true, unit: true, theta: step >= 1, names: step >= 1 }); };
  function zoom(target, step) {
    if (anim) cancelAnimationFrame(anim);
    const t0 = t, start = performance.now(), dur = 1000;
    const f = now => {
      const u = Math.min(1, (now - start) / dur);
      t = t0 + (target - t0) * ease(u);
      if (u < 1) { drawZoomFrame(svg, t); anim = requestAnimationFrame(f); } else { t = target; anim = null; settle(step); }
    };
    anim = requestAnimationFrame(f);
  }
  HOOKS['s-cosproj'] = {
    render(step) {
      const target = step >= 2 ? 1 : 0;
      if (target !== t && !anim) zoom(target, step);
      else if (anim) { /* a zoom is running; it settles on the current step when done */ zoom(target, step); }
      else settle(step);
    }
  };
})();
HOOKS['s-mag'] = { render(step) { draw345($('#mag-plot'), { legs: step >= 2, len: step >= 3 }); } };
HOOKS['s-norm'] = { render(step) { draw345($('#norm-plot'), { legs: true, len: true, unit: step >= 3 }); } };

/* ---------- ③ normalization picture: vectors of many lengths → all on the unit circle (animated) ---------- */
(function () {
  const svg = $('#normviz-plot');
  // eight directions spread ~45° apart, lengths from 0.55 to 2.8, eight different colours
  const V = [[15, 2.8, BLUE], [60, 1.5, GRN], [105, 2.4, PUR], [150, 0.6, ORG], [195, 2.2, '#0e9aa7'], [240, 1.1, '#d63384'], [285, 2.7, GLD], [330, 0.55, '#7a5230']]
    .map(([d, L, c]) => [L * Math.cos(rad(d)), L * Math.sin(rad(d)), c]);
  let t = 0, anim = null;
  const ease = x => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  function draw(t) {
    const R = 3.0 - 1.55 * t;                        // zoom in as the vectors settle on the circle
    const p = Plot(svg, { xmin: -R * 1.15, xmax: R * 1.15, ymin: -R, ymax: R, pad: 8 });
    p.clear(); p.grid(R > 2 ? 1 : 0.5, true);
    // unit circle
    el('circle', { cx: p.X(0), cy: p.Y(0), r: p.s, fill: t > 0 ? '#fff6d6' : 'none', 'fill-opacity': t, stroke: GLD, 'stroke-width': 2 + 2 * t, 'stroke-dasharray': t > 0.98 ? '' : '6 6' }, svg);
    if (t > 0.98) p.text(0.72, -0.72, 'radius 1', { color: '#8a6400', size: 20, weight: 700, dx: 6, dy: 18 });
    V.forEach(([x, y, c]) => {
      const L = Math.hypot(x, y), k = (1 - t) + t / L;   // length goes from L to 1
      if (t > 0) p.arrow(0, 0, x, y, { color: c, w: 3, dash: '3 6' }).setAttribute('opacity', 0.25);
      p.arrow(0, 0, x * k, y * k, { color: c, w: 5, head: 15 });
    });
    p.dot(0, 0, { r: 5, color: INK });
  }
  function go(target) {
    if (anim) cancelAnimationFrame(anim);
    const t0 = t, start = performance.now(), dur = 900;
    const f = now => {
      const u = Math.min(1, (now - start) / dur);
      t = t0 + (target - t0) * ease(u); draw(t);
      if (u < 1) anim = requestAnimationFrame(f); else anim = null;
    };
    anim = requestAnimationFrame(f);
  }
  HOOKS['s-normviz'] = { render(step) { const target = step >= 1 ? 1 : 0; if (target !== t) go(target); else draw(t); } };
  draw(0);
})();

/* ---------- the cosine curve (shared by the cosine-function slide and the drag slide) ---------- */
function cosCurve(svg, o = {}) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  const vb = svg.viewBox.baseVal, W = vb.width, H = vb.height;
  const fs = o.fs || 14, pl = o.pl || 46, pr = o.pr || 14, pt = o.pt || 14, pb = fs + 16;
  const X = d => pl + d / 360 * (W - pl - pr), Y = v => pt + (1 - v) / 2 * (H - pt - pb);
  [1, 0.5, -0.5, -1].forEach(v => el('line', { x1: X(0), y1: Y(v), x2: X(360), y2: Y(v), stroke: LINE }, svg));
  [90, 180, 270, 360].forEach(d => el('line', { x1: X(d), y1: Y(1), x2: X(d), y2: Y(-1), stroke: LINE }, svg));
  if (o.shade) el('rect', { x: X(180), y: Y(1), width: X(360) - X(180), height: Y(-1) - Y(1), fill: '#f5f7fa' }, svg);
  el('line', { x1: X(0), y1: Y(0), x2: X(360) + 6, y2: Y(0), stroke: '#9aa3b2', 'stroke-width': 2 }, svg);
  el('line', { x1: X(0), y1: Y(1) - 4, x2: X(0), y2: Y(-1) + 4, stroke: '#9aa3b2', 'stroke-width': 2 }, svg);
  [1, 0, -1].concat(o.halves ? [0.5, -0.5] : []).forEach(v => el('text', { x: X(0) - 8, y: Y(v) + fs * 0.35, 'text-anchor': 'end', fill: MUTE, 'font-size': fs }, svg, fmt(v)));
  [0, 90, 180, 270, 360].forEach(d => el('text', { x: X(d), y: Y(-1) + fs + 8, 'text-anchor': 'middle', fill: MUTE, 'font-size': fs }, svg, d + '°'));
  const path = (a, b) => { let s = ''; for (let d = a; d <= b; d++) s += (d === a ? 'M' : 'L') + X(d).toFixed(1) + ',' + Y(Math.cos(rad(d))).toFixed(1); return s; };
  el('path', { d: path(180, 360), fill: 'none', stroke: BLUE, 'stroke-width': o.w || 3, 'stroke-dasharray': '7 6', opacity: 0.3 }, svg);
  el('path', { d: path(0, 180), fill: 'none', stroke: BLUE, 'stroke-width': (o.w || 3) + 1 }, svg);
  if (o.theta != null) {
    const t = o.theta, c = Math.cos(rad(t));
    el('line', { x1: X(t), y1: Y(0), x2: X(t), y2: Y(c), stroke: ORG, 'stroke-width': 3, 'stroke-dasharray': '5 4' }, svg);
    el('line', { x1: X(0), y1: Y(c), x2: X(t), y2: Y(c), stroke: ORG, 'stroke-width': 2, 'stroke-dasharray': '3 5', opacity: 0.7 }, svg);
    el('circle', { cx: X(t), cy: Y(c), r: o.r || 8, fill: ORG, stroke: '#fff', 'stroke-width': 2.5 }, svg);
  }
  return { X, Y };
}

/* ---------- ② angle slide: three panels → arrows → points on the cosine curve ---------- */
(function () {
  const svg = $('#angle-plot');
  const cases = [[25, 'Similar', GRN, '+0.91'], [90, 'Unrelated', MUTE, '0'], [180, 'Opposite', BAD_C, '−1']];
  const PW = 300, PH = 180, PY = 0, gap = (1108 - 3 * PW) / 2;           // panel geometry (outer coordinates)
  const CY = 228, CH = 262;                                             // curve area (outer coordinates)
  const nest = (x, y, w, hh, vb) => el('svg', { x, y, width: w, height: hh, viewBox: vb, overflow: 'visible' }, svg);
  function arrowOuter(x1, y1, x2, y2, c) {
    const ang = Math.atan2(y2 - y1, x2 - x1), hl = 16, hw = 7;
    el('line', { x1, y1, x2: x2 - Math.cos(ang) * hl * 0.8, y2: y2 - Math.sin(ang) * hl * 0.8, stroke: c, 'stroke-width': 3, 'stroke-dasharray': '7 6' }, svg);
    el('polygon', { points: `${x2},${y2} ${x2 - Math.cos(ang) * hl - Math.sin(ang) * hw},${y2 - Math.sin(ang) * hl + Math.cos(ang) * hw} ${x2 - Math.cos(ang) * hl + Math.sin(ang) * hw},${y2 - Math.sin(ang) * hl - Math.cos(ang) * hw}`, fill: c }, svg);
  }
  HOOKS['s-angle'] = {
    render(step) {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      // the curve (always visible), half shaded beyond 180° from step 5
      const cs = nest(0, CY, 1108, CH, `0 0 1108 ${CH}`);
      const { X, Y } = cosCurve(cs, { fs: 18, pl: 60, pr: 30, pt: 26, w: 4, halves: true, shade: step >= 5 });
      el('text', { x: 6, y: 12, fill: MUTE, 'font-size': 18, 'font-style': 'italic' }, cs, 'cos θ');
      if (step >= 5) el('text', { x: (X(180) + X(360)) / 2, y: Y(0) - 14, 'text-anchor': 'middle', fill: MUTE, 'font-size': 19 }, cs, 'the angle between two vectors never exceeds 180°');
      cases.forEach(([th, lab, c, val], i) => {
        if (step < i + 1) return;
        const px = i * (PW + gap);
        // panel
        el('rect', { x: px, y: PY, width: PW, height: PH, rx: 14, fill: '#fff', stroke: '#e3e6ec', 'stroke-width': 1.5 }, svg);
        const ps = nest(px, PY, PW, PH - 34, `0 0 ${PW} ${PH - 34}`);
        const p = Plot(ps, { xmin: -1.45, xmax: 1.45, ymin: -0.5, ymax: 1.35, pad: 6 });
        p.grid(1, true);
        const a0 = rad(0), a1 = rad(th);
        p.arrow(0, 0, 1.2, 0, { color: BLUE, w: 5 });
        p.arrow(0, 0, 1.2 * Math.cos(a1), 1.2 * Math.sin(a1), { color: ORG, w: 5 });
        p.arc(0.38, a0, a1);
        el('text', { x: px + PW / 2, y: PY + PH - 12, 'text-anchor': 'middle', fill: c, 'font-size': 22, 'font-weight': 700 }, svg, `${lab} · θ = ${th}°`);
        // arrow from the panel to the point on the curve
        const tx = X(th), ty = CY + Y(Math.cos(a1));
        arrowOuter(px + PW / 2, PY + PH + 4, tx, ty - 14, c);
        el('circle', { cx: tx, cy: ty, r: 11, fill: c, stroke: '#fff', 'stroke-width': 3 }, svg);
        el('text', { x: tx + 18, y: ty + (th === 25 ? -10 : th === 180 ? 6 : -14), fill: c, 'font-size': 22, 'font-weight': 700, stroke: '#fff', 'stroke-width': 5, 'paint-order': 'stroke' }, svg, `cos = ${val}`);
      });
    }
  };
})();

/* ---------- interactive cosine ---------- */
(function () {
  const svg = $('#cos-plot'), p = Plot(svg, { xmin: -2.1, xmax: 2.1, ymin: -1.8, ymax: 1.8, pad: 8 });
  const A = [1.5 * Math.cos(rad(20)), 1.5 * Math.sin(rad(20))];
  let B = [1.3 * Math.cos(rad(60)), 1.3 * Math.sin(rad(60))];
  const dyn = el('g', {}, svg);
  function draw() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    p.grid(1, true);
    const la = norm(A), lb = norm(B), c = dotp(A, B) / (la * lb);
    let ta = Math.atan2(B[1], B[0]) - Math.atan2(A[1], A[0]);
    while (ta > Math.PI) ta -= 2 * Math.PI; while (ta < -Math.PI) ta += 2 * Math.PI;
    const k = dotp(A, B) / (la * la), proj = [A[0] * k, A[1] * k];
    p.line(B[0], B[1], proj[0], proj[1], { color: ORG, dash: '6 5', w: 2 });
    p.arrow(0, 0, A[0], A[1], { color: BLUE, w: 5 });
    p.arrow(0, 0, B[0], B[1], { color: PUR, w: 5 });
    p.arrow(0, 0, proj[0], proj[1], { color: ORG, w: 9, head: 0.1 });   // projection on top of A
    p.arc(0.55, Math.atan2(A[1], A[0]), Math.atan2(A[1], A[0]) + ta);
    p.dot(B[0], B[1], { r: 11, color: PUR, stroke: '#fff' });
    p.text(A[0], A[1], 'A', { color: BLUE, size: 26, weight: 700, dx: 10, dy: -8 });
    p.text(B[0], B[1], 'B', { color: PUR, size: 26, weight: 700, dx: 14, dy: -10 });
    $('#cos-val').textContent = fmt(c); $('#cos-th').textContent = Math.round(Math.abs(ta) * 180 / Math.PI) + '°';
    $('#cos-dot').textContent = fmt(dotp(A, B)); $('#cos-len').textContent = fmt(la * lb);
    cosCurve($('#cos-curve'), { theta: Math.abs(ta) * 180 / Math.PI, fs: 13, pl: 34, w: 2.5 });
  }
  const setB = (angDeg, len) => { const a = rad(20 + angDeg); B = [len * Math.cos(a), len * Math.sin(a)]; draw(); };
  let drag = false;
  const pos = e => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const q = pt.matrixTransform(svg.getScreenCTM().inverse()); return [(q.x - p.X(0)) / p.s, (p.Y(0) - q.y) / p.s]; };
  svg.addEventListener('pointerdown', e => { drag = true; svg.setPointerCapture(e.pointerId); move(e); });
  svg.addEventListener('pointermove', e => { if (drag) move(e); });
  svg.addEventListener('pointerup', () => { drag = false; });
  const MAXLEN = 1.8;   // = the shorter positive axis (y runs −1.8 … 1.8), so B never leaves the canvas
  function move(e) { let [x, y] = pos(e); const l = Math.hypot(x, y); if (l < 0.2) return; if (l > MAXLEN) { x *= MAXLEN / l; y *= MAXLEN / l; } B = [x, y]; draw(); }
  HOOKS['s-cos'] = { render(step) { if (step <= 1) setB(40, 1.3); else if (step === 2) setB(90, 1.3); else if (step === 3) setB(180, 1.0); } };
  draw();
})();

/* ---------- excerpts and window counts ---------- */
(function () {
  const lines = [
    ['要', '擁護', '那', '德先生', '便', '不得不', '反對', '孔教', '禮法', '貞節', '舊倫理', '舊政治'],
    ['要', '擁護', '那', '賽先生', '便', '不得不', '反對', '舊藝術', '舊宗教'],
    ['要', '擁護', '德先生', '又', '要', '擁護', '賽先生', '便', '不得不', '反對', '國粹', '和', '舊文學']
  ];
  const W = 3, TGT = '反對', box = $('#ex-lines'), counts = {};
  lines.forEach(t => {
    const d = document.createElement('div'); d.className = 'toks exl';
    t.forEach((w, i) => {
      const s = document.createElement('span'); s.className = 'tok'; s.textContent = w; s.dataset.i = i;
      if (w === TGT) s.dataset.t = 1;
      d.appendChild(s);
    });
    t.forEach((w, i) => { if (w === TGT) for (let j = Math.max(0, i - W); j <= Math.min(t.length - 1, i + W); j++) if (j !== i) { d.children[j].dataset.w = 1; counts[t[j]] = (counts[t[j]] || 0) + 1; } });
    box.appendChild(d);
  });
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  $('#ex-counts').innerHTML = `<thead><tr>${entries.map(([w]) => `<th>${w}</th>`).join('')}</tr></thead><tbody><tr>${entries.map(([, c]) => `<td${c > 1 ? ' class="multi"' : ''}>${c}</td>`).join('')}</tr></tbody>`;
  HOOKS['s-excerpt'] = {
    render(step, el) {
      $$('.tok', el).forEach(t => { t.classList.toggle('tgt', step >= 2 && !!t.dataset.t); t.classList.toggle('win', step >= 2 && !!t.dataset.w && !t.dataset.t); });
    }
  };
})();

/* ---------- sparse-matrix picture ---------- */
(function () {
  const svg = $('#sparse-plot'), n = 14, c = 18, off = 14;
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const on = rnd() < 0.09;
    el('rect', { x: off + j * c, y: off + i * c, width: c - 2, height: c - 2, rx: 3, fill: on ? BLUE : '#eef0f4' }, svg);
  }
  el('text', { x: 140, y: 276, 'text-anchor': 'middle', fill: MUTE, 'font-size': 14 }, svg, 'blue = non-zero, grey = 0');
})();

/* ---------- movie vectors ---------- */
(function () {
  const feats = [['劇情 drama', [0.82, -0.5, 0.44, 0.92]], ['恐怖 horror', [0.05, 0.93, 0.02, 0.21]], ['愛情 romance', [0.53, 0.02, 0.95, 0.30]], ['科幻 sci-fi', [0.97, 0.34, 0.02, 0.04]], ['歷史 historical', [0.07, 0.11, 0.05, 0.76]]];
  const names = ['星際效應', '詭屋驚凶實錄', '後來的我們', '刺激 1995'];
  const tb = $('#movie-table tbody');
  tb.innerHTML = feats.map(([f, v]) => `<tr><th>${f}</th>${v.map((x, i) => `<td class="num" data-c="${i}">${fmt(x)}</td>`).join('')}</tr>`).join('');
  const vecs = names.map((_, i) => feats.map(f => f[1][i]));
  let best = null, worst = null;
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) { const c = cosine(vecs[i], vecs[j]); if (!best || c > best.c) best = { i, j, c }; if (!worst || c < worst.c) worst = { i, j, c }; }
  HOOKS['s-dense'] = {
    render(step, root) {
      const pick = step === 2 ? best : step >= 3 ? worst : null;
      $$('[data-c]', root).forEach(e => { const c = +e.dataset.c; e.classList.toggle('hl', !!pick && (c === pick.i || c === pick.j)); });
      const box = $('#movie-cos');
      box.classList.toggle('on', step >= 2);
      box.innerHTML = pick ? `<span>${names[pick.i]}</span> ↔ <span>${names[pick.j]}</span> <b>cos = ${fmt(pick.c)}</b> <em>${pick === best ? 'most similar' : 'least similar'}</em>` : '';
    }
  };
  $('#movie-cos').dataset.step = 2;
})();

/* ---------- gender / royalty: build up one pair at a time; one dimension overlaps, two separate ---------- */
(function () {
  const svg = $('#gx-plot'), P = { 男: [-1, 0.02], 女: [1, 0.01], 皇帝: [-0.97, 1], 皇后: [0.99, 1] };
  const RED = '#d92d20';
  const notes = [
    ['', 'Start with one pair and one dimension, gender: 男 = −1, 女 = 1.'],
    ['', 'Add a second pair on the same axis: 皇帝 ≈ −1, 皇后 ≈ 1.'],
    ['', 'Problem: 男 and 皇帝 <b>overlap</b>, and so do 女 and 皇后. One dimension cannot separate them.'],
    ['', 'Add a second dimension, royalty: 皇帝 and 皇后 move up and <b>separate</b>. More dimensions, more room.'],
    ['', 'Each word is an arrow from the origin.'],
    ['', 'From 女 to 男: first <b>− 女</b>. 女 sits at +1, so subtracting it takes one step left, back to the origin.'],
    ['', 'Then <b>+ 男</b>: one more step left, arriving at 男. Together: <b>− 女 + 男</b>.'],
    ['', 'Start at 皇后 and follow the same arrow, − 女 + 男: you arrive at 皇帝.']
  ];
  const col = w => (w === '男' || w === '皇帝') ? BLUE : ORG;
  const renderMain = (step, root) => {
      const p = Plot(svg, { xmin: -1.45, xmax: 1.45, ymin: -0.55, ymax: 1.45, pad: 12 });
      p.clear();
      if (step <= 2) {
        // one dimension: a single gender axis
        p.arrow(-1.4, 0, 1.4, 0, { color: '#9aa3b2', w: 3 });
        p.text(0, 0, '性別 gender →', { color: MUTE, size: 20, dy: 32, anchor: 'middle' });
        const words = step === 0 ? ['男', '女'] : ['男', '女', '皇帝', '皇后'];
        words.forEach(w => {
          const royal = w === '皇帝' || w === '皇后';
          p.dot(P[w][0], 0, { color: col(w), r: 11 }).setAttribute('opacity', royal ? 0.75 : 1);
          p.text(P[w][0], 0, w, { color: col(w), size: 26, weight: 700, dy: royal ? -22 : 38, anchor: 'middle' });
        });
        if (step === 2) {
          [-0.985, 0.995].forEach(x => el('ellipse', { cx: p.X(x), cy: p.Y(0) - 4, rx: 52, ry: 70, fill: 'none', stroke: RED, 'stroke-width': 3.5, 'stroke-dasharray': '7 6' }, svg));
          p.text(0, 0, 'overlap!', { color: RED, size: 28, weight: 700, dy: -62, anchor: 'middle' });
        }
      } else {
        // two dimensions: gender × royalty
        p.grid(0.5, true);
        p.text(1.4, 0, 'gender', { color: MUTE, size: 18, dy: 26, anchor: 'end' });
        p.text(0, 1.45, 'royalty', { color: MUTE, size: 18, dx: 8, dy: 6 });
        if (step === 3) ['皇帝', '皇后'].forEach(w => {
          p.dot(P[w][0], 0, { color: col(w), r: 8 }).setAttribute('opacity', 0.3);
          p.arrow(P[w][0], 0.06, P[w][0], 0.9, { color: col(w), w: 3, dash: '5 6', head: 14 });
        });
        // bottom row: man → woman, built as  − 男  then  + 女
        // bottom row: woman → man, built as  − 女  then  + 男
        if (step >= 5) { p.arrow(1, 0.015, 0.06, 0.015, { color: RED, w: 10, head: 24 }); p.text(0.5, 0.015, '− 女', { color: RED, size: 26, weight: 700, dy: -18, anchor: 'middle' }); }
        if (step >= 6) {
          p.arrow(-0.02, 0.015, -0.9, 0.015, { color: RED, w: 10, head: 24 }); p.text(-0.48, 0.015, '+ 男', { color: RED, size: 26, weight: 700, dy: -18, anchor: 'middle' });
          // bracket under the two halves: together = − 女 + 男
          el('path', { d: `M${p.X(-1)},${p.Y(0) + 46} L${p.X(-1)},${p.Y(0) + 58} L${p.X(1)},${p.Y(0) + 58} L${p.X(1)},${p.Y(0) + 46}`, fill: 'none', stroke: RED, 'stroke-width': 2.5 }, svg);
          const lb = p.text(0, 0, '＝ − 女 + 男', { color: RED, size: 24, weight: 700, dy: 86, anchor: 'middle' }); lb.setAttribute('stroke', '#fff'); lb.setAttribute('stroke-width', 6); lb.setAttribute('paint-order', 'stroke');
        }
        // top row: the same arrow takes empress to emperor
        if (step >= 7) { p.arrow(0.99, 1, -0.88, 1, { color: RED, w: 10, head: 24 }); { const t = p.text(0, 1, '− 女 + 男', { color: RED, size: 24, weight: 700, dy: -20, anchor: 'middle' }); t.setAttribute('stroke', '#fff'); t.setAttribute('stroke-width', 6); t.setAttribute('paint-order', 'stroke'); } }
        Object.keys(P).forEach(w => { p.dot(...P[w], { color: col(w), r: 10 }); p.text(...P[w], w, { color: col(w), size: 26, weight: 700, dy: P[w][1] > 0.5 ? -20 : 38, anchor: 'middle' }); });
        // black origin arrows drawn last, so they sit on top of the word dots
        if (step >= 4) Object.keys(P).forEach(w => { const g = p.arrow(0, 0, ...P[w], { color: INK, w: 2.2, head: 12 }); if (step >= 5) g.setAttribute('opacity', 0.25); });
      }
      const t = $('#gx-table', root);
      t.classList.toggle('c3on', step >= 1);
      t.classList.toggle('r2on', step >= 3);
      $('#gx-eq', root).style.visibility = step >= 7 ? 'visible' : 'hidden';
      $('#gx-note', root).innerHTML = `<span class="en">${notes[step][1]}</span>`;
  };
  // two pre-steps: an empty space, then the gender axis alone; the main build follows
  const pre = [
    ['', 'An empty space: no dimensions yet, no words yet.'],
    ['', 'First, one dimension: a gender axis.']
  ];
  HOOKS['s-gender'] = {
    render(step, root) {
      const t = $('#gx-table', root);
      t.style.visibility = step >= 2 ? 'visible' : 'hidden';
      if (step >= 2) return renderMain(step - 2, root);
      const p = Plot(svg, { xmin: -1.45, xmax: 1.45, ymin: -0.55, ymax: 1.45, pad: 12 });
      p.clear();
      if (step === 1) {
        p.arrow(-1.4, 0, 1.4, 0, { color: '#9aa3b2', w: 3 });
        p.text(0, 0, '性別 gender →', { color: MUTE, size: 20, dy: 32, anchor: 'middle' });
        [-1, 1].forEach(x => { p.line(x, -0.04, x, 0.04, { color: '#9aa3b2', w: 2 }); p.text(x, 0, x > 0 ? '+1' : '−1', { color: MUTE, size: 16, dy: -12, anchor: 'middle' }); });
      }
      t.classList.remove('c3on', 'r2on');
      $('#gx-eq', root).style.visibility = 'hidden';
      $('#gx-note', root).innerHTML = `<span class="en">${pre[step][1]}</span>`;
    }
  };
  const i = document.createElement('i'); i.className = 'stepper'; i.dataset.step = 9; $('#s-gender').appendChild(i);
})();

/* ---------- more dimensions ---------- */
HOOKS['s-dims'] = { render(step, root) { $('#dx-table', root).classList.toggle('full', step >= 2); } };
(function () { const i = document.createElement('i'); i.className = 'stepper'; i.dataset.step = 2; $('#s-dims').appendChild(i); })();

/* ---------- words in space ---------- */
(function () {
  const W = [['山', 3.0, 2.3, BLUE], ['丘', 3.5, 1.3, BLUE], ['火山', 1.9, 3.5, BLUE], ['巧克力', -2.7, 2.0, ORG], ['糖果', -3.3, 0.8, ORG]];
  const p = Plot($('#space-plot'), { xmin: -4.2, xmax: 4.6, ymin: -0.5, ymax: 4.4, pad: 8 });
  p.grid(1, true);
  W.forEach(([w, x, y, c]) => { p.arrow(0, 0, x, y, { color: c, w: 4 }); p.text(x, y, w, { color: c, size: 24, weight: 700, dx: x > 0 ? 12 : -12, dy: -6, anchor: x > 0 ? 'start' : 'end' }); });
  const v = Object.fromEntries(W.map(([w, x, y]) => [w, [x, y]]));
  const pairs = [['山', '丘'], ['山', '火山'], ['巧克力', '糖果'], ['山', '巧克力']];
  $('#space-cos').innerHTML = pairs.map(([a, b]) => { const c = cosine(v[a], v[b]); return `<div class="cl2"><span>${a} ↔ ${b}</span><b class="${c > 0.5 ? 'ok-c' : ''}">${c >= 0 ? '+' : ''}${fmt(c)}</b></div>`; }).join('');
})();

/* ---------- word2vec windows: slide over the whole text, one target at a time ---------- */
(function () {
  const toks = ['學', '而', '不', '思', '則', '罔', '思', '而', '不', '學', '則', '殆'];
  const box = $('#w2v-toks'), R = 2, N = toks.length;
  toks.forEach(t => { const s = document.createElement('span'); s.className = 'tok'; s.textContent = t; box.appendChild(s); });
  const ctxOf = c => toks.map((t, i) => [t, i]).filter(([, i]) => i !== c && Math.abs(i - c) <= R).map(([t]) => t);
  HOOKS['s-w2v'] = {
    render(step) {
      const c = step >= 1 && step <= N ? step - 1 : null;
      $$('.tok', box).forEach((t, i) => {
        t.classList.toggle('tgt', c === i); t.classList.toggle('win', c != null && Math.abs(i - c) <= R && i !== c);
        t.classList.toggle('done', c != null && i < c && Math.abs(i - c) > R);
      });
      const pl = $('#w2v-pairs');
      let total = 0; for (let k = 0; k < Math.min(step, N); k++) total += ctxOf(k).length;
      if (c == null) {
        pl.innerHTML = step > N ? `<span class="tot"><b>${total}</b> training pairs in total</span>` : '';
        $('#w2v-note').innerHTML = step > N
          ? '<span class="en">One sentence yields dozens of (target → context) pairs; a real corpus yields billions.</span>'
          : '<span class="en">A window (2 characters on each side) slides over the text: blue is the <b>target</b>, yellow its <b>context</b>.</span>';
        return;
      }
      pl.innerHTML = ctxOf(c).map(t => `<span><b>${toks[c]}</b> → ${t}</span>`).join('') + `<span class="tot"><b>${total}</b> pairs so far</span>`;
      $('#w2v-note').innerHTML = `<span class="en">Character ${c + 1} of ${N}: the target is <b>${toks[c]}</b>; predict its neighbours.</span>`;
    }
  };
})();

/* ---------- polysemy plots ---------- */
(function () {
  const mk = (id, items, arrows) => {
    const p = Plot($('#' + id), { xmin: -0.4, xmax: 3.6, ymin: -0.2, ymax: 3.1, pad: 10 });
    p.grid(1, true);
    items.forEach(([w, x, y, c]) => { p.dot(x, y, { color: c, r: 7 }); p.text(x, y, w, { color: c, size: 22, weight: 600, dx: 12, dy: -8 }); });
    arrows.forEach(([w, x, y, c, dx, dy]) => { p.arrow(0, 0, x, y, { color: c, w: 5 }); p.text(x, y, w, { color: c, size: 26, weight: 700, dx, dy }); });
  };
  mk('poly-1', [['液體', 2.7, 0.55, MUTE], ['空洞', 0.8, 2.8, MUTE]], [['水', 1.9, 1.9, BLUE, 10, 28]]);
  mk('poly-2', [['液體', 2.7, 0.55, MUTE], ['空洞', 0.8, 2.8, MUTE]], [['水 (liquid)', 2.4, 0.9, GRN, -20, -14], ['水 (shallow)', 0.55, 2.35, ORG, 14, 18]]);
})();

/* ---------- word2vec ①: dot-product scores with random starting vectors ---------- */
dotviz($('#w2v-pos'), [0.2, -0.4, 0.1, 0.3], [0.1, 0.3, -0.2, 0.1], { names: ['思', '學'], lw: 66, compact: true, prodStep: 2, sumStep: 2 });
dotviz($('#w2v-neg'), [0.2, -0.4, 0.1, 0.3], [0.3, -0.1, 0.2, 0.2], { names: ['思', '香蕉'], lw: 66, compact: true, prodStep: 3, sumStep: 3 });

const sig = z => 1 / (1 + Math.exp(-z));
const addStepper = (id, n) => { const i = document.createElement('i'); i.className = 'stepper'; i.dataset.step = n; $('#' + id).appendChild(i); };

/* ---------- word2vec ②: the update is a vector addition (tip-to-tail) ---------- */
(function () {
  const eta = 0.5, states = [];
  let s = [1.3, 0.2], x = [-0.3, 1.2], n = [1.0, -0.7];
  for (let st = 0; st <= 4; st++) {
    const gp = 1 - sig(dotp(s, x)), gn = sig(dotp(s, n));
    const addX = [0, 1].map(i => eta * gp * x[i]), subN = [0, 1].map(i => -eta * gn * n[i]);
    states.push({ s: [...s], x: [...x], n: [...n], addX, subN });
    const s2 = [0, 1].map(i => s[i] + addX[i] + subN[i]);
    x = [0, 1].map(i => x[i] + eta * gp * s[i]);
    n = [0, 1].map(i => n[i] - eta * gn * s[i]);
    s = s2;
  }
  const svg = $('#upd-plot');
  HOOKS['s-w2v-upd'] = {
    render(step) {
      const p = Plot(svg, { xmin: -0.9, xmax: 2.1, ymin: -1.5, ymax: 2.0, pad: 10 });
      p.clear(); p.grid(0.5, true);
      const cur = states[step], prev = states[Math.max(0, step - 1)];
      const lab = (v, w, c, left) => p.text(...v, w, { color: c, size: 26, weight: 700, dx: left ? -12 : 12, dy: v[1] >= 0 ? 4 : 26, anchor: left ? 'end' : 'start' });
      if (step === 0) {
        p.arrow(0, 0, ...cur.s, { color: BLUE, w: 6 }); lab(cur.s, '思', BLUE);
        p.arrow(0, 0, ...cur.x, { color: GRN, w: 6 }); lab(cur.x, '學', GRN, true);
        p.arrow(0, 0, ...cur.n, { color: ORG, w: 6 }); lab(cur.n, '香蕉', ORG);
      } else {
        // previous vectors, faded
        [['s', BLUE], ['x', GRN], ['n', ORG]].forEach(([k, c]) => p.arrow(0, 0, ...prev[k], { color: c, w: 3, dash: '4 6' }).setAttribute('opacity', 0.35));
        // tip-to-tail: old 思  + (η × 學)  − (η × 香蕉)  = new 思
        const t1 = [prev.s[0] + prev.addX[0], prev.s[1] + prev.addX[1]];
        p.arrow(...prev.s, ...t1, { color: GRN, w: 7, head: 16 });
        p.arrow(...t1, ...cur.s, { color: ORG, w: 7, head: 16 });
        if (step === 1) {   // label the two added pieces once, at their midpoints
          const m1 = [(prev.s[0] + t1[0]) / 2, (prev.s[1] + t1[1]) / 2], m2 = [(t1[0] + cur.s[0]) / 2, (t1[1] + cur.s[1]) / 2];
          p.text(...m1, '+ η·學', { color: GRN, size: 22, weight: 700, dx: 16, dy: 8 });
          p.text(...m2, '− η·香蕉', { color: ORG, size: 22, weight: 700, dx: 18, dy: -4 });
        }
        p.arrow(0, 0, ...cur.s, { color: BLUE, w: 6 }); p.text(...cur.s, '思', { color: BLUE, size: 26, weight: 700, dx: -8, dy: -14, anchor: 'end' });
        p.arrow(0, 0, ...cur.x, { color: GRN, w: 5 }); lab(cur.x, '學', GRN, true);
        p.arrow(0, 0, ...cur.n, { color: ORG, w: 5 }); lab(cur.n, '香蕉', ORG);
      }
      const sp = dotp(cur.s, cur.x), sn = dotp(cur.s, cur.n);
      $('#upd-scores').innerHTML =
        `<div class="ustep">${step === 0 ? 'start: random vectors' : `update round ${step}`}</div>` +
        `<div><span>思 · 學 <small>neighbour</small></span><b class="ok-c">${fmt(sp)}</b></div>` +
        `<div><span>思 · 香蕉 <small>random</small></span><b class="bad-c">${fmt(sn)}</b></div>`;
    }
  };
  addStepper('s-w2v-upd', 4);
})();

/* ---------- word2vec ③: shared neighbours pull 開心 and 愉快 together ---------- */
(function () {
  const C = { 感到: [1.75, 1.35], 非常: [1.35, 1.9], 旅程: [2.0, 0.8], 刷牙: [-1.35, -1.6], 牙膏: [-1.9, -0.95] };
  const ctx = { 開心: ['感到', '非常', '旅程'], 愉快: ['感到', '非常', '旅程'], 牙刷: ['刷牙', '牙膏'] };
  const col = { 開心: BLUE, 愉快: GRN, 牙刷: ORG };
  let W = { 開心: [-1.0, 0.75], 愉快: [0.45, -1.15], 牙刷: [1.05, -0.65] };
  const states = [];
  for (let st = 0; st <= 4; st++) {
    states.push(JSON.parse(JSON.stringify(W)));
    for (let k = 0; k < 2; k++) for (const w in W) {
      let v = W[w];
      for (const c of ctx[w]) { const g = 1 - sig(dotp(v, C[c])); v = [v[0] + 0.8 * g * C[c][0], v[1] + 0.8 * g * C[c][1]]; }
      const L = norm(v); W[w] = v.map(z => z * 1.25 / L);
    }
  }
  const notes = [
    ['', 'Start: all three directions are random.'],
    ['', 'Each round, every word is pulled towards its neighbours.'],
    ['', '開心 and 愉快 are pulled towards the same neighbours …'],
    ['', '… while 牙刷 is pulled somewhere else entirely.'],
    ['', 'Result: 開心 ≈ 愉快, both far from 牙刷.']
  ];
  const svg = $('#why-plot');
  HOOKS['s-w2v-why'] = {
    render(step) {
      const k = Math.min(step, 4), p = Plot(svg, { xmin: -2.5, xmax: 2.7, ymin: -2.2, ymax: 2.4, pad: 10 });
      p.clear(); p.grid(1, true);
      for (const c in C) { p.dot(...C[c], { color: '#9aa3b2', r: 7 }); p.text(...C[c], c, { color: MUTE, size: 19, dx: 10, dy: 6 }); }
      for (const w in W) {
        for (let t = 0; t < k; t++) p.dot(...states[t][w], { color: col[w], r: 4 }).setAttribute('opacity', 0.35);
        const v = states[k][w];
        p.arrow(0, 0, ...v, { color: col[w], w: 5 });
        p.text(...v, w, { color: col[w], size: 26, weight: 700, dx: v[0] >= 0 ? 10 : -10, dy: w === '愉快' ? 30 : v[1] >= 0 ? -10 : 26, anchor: v[0] >= 0 ? 'start' : 'end' });
      }
      $('#why-cos').textContent = fmt(cosine(states[k].開心, states[k].愉快));
      $('#why-note').innerHTML = `<span class="en">${notes[k][1]}</span>`;
    }
  };
})();

/* ---------- laser pointer (as in the CHI4335 decks): press L to swap the cursor for a red dot; L again to turn it off.
   G opens the page-number box to jump to a slide. ---------- */
(function () {
  const run = () => {
    const stage = document.getElementById('stage');
    const dot = document.createElement('div');
    dot.id = 'laser';
    stage.appendChild(dot);
    // the stage is scaled with a CSS transform, so convert screen coordinates to stage coordinates
    addEventListener('mousemove', e => {
      const r = stage.getBoundingClientRect(), k = r.width / 1280;
      dot.style.left = (e.clientX - r.left) / k + 'px';
      dot.style.top = (e.clientY - r.top) / k + 'px';
    });
    addEventListener('keydown', e => {
      if (e.metaKey || e.ctrlKey || e.altKey || (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName))) return;
      if (e.key === 'l' || e.key === 'L') { stage.classList.toggle('laser-on'); e.preventDefault(); }
      if (e.key === 'g' || e.key === 'G') { e.preventDefault(); document.getElementById('num').click(); }
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();


/* ---------- directions ②: three noisy pair differences, then their average ---------- */
(function () {
  const rows = [['女 − 男', [0.1, -0.2, 1.8, 0.0, 0.2, -0.1]], ['皇后 − 皇帝', [-0.2, 0.1, 1.6, 0.3, -0.1, 0.2]], ['母親 − 父親', [0.1, 0.1, 1.7, -0.3, -0.1, -0.1]]];
  const avg = [0, 1, 2, 3, 4, 5].map(k => rows.reduce((s, r) => s + r[1][k], 0) / rows.length);
  const cell = (v, k, avgRow) => {
    const big = k === 2, z = Math.abs(v) < 1e-9;
    return `<td class="${big ? 'hot' + (avgRow ? ' big' : '') : (avgRow ? 'z' : 'noise')}">${z ? '0' : fmt(v)}</td>`;
  };
  $('#dir2-table tbody').innerHTML =
    rows.map(([n, v], i) => `<tr data-step="${i + 1}"><th>${n}</th>${v.map((x, k) => cell(x, k, false)).join('')}</tr>`).join('') +
    `<tr class="diff avg" data-step="4"><th>average</th>${avg.map((x, k) => cell(x, k, true)).join('')}</tr>`;
})();

/* ---------- directions ③: projection onto the 女 − 男 direction (2-D picture + ranked bars) ---------- */
(function () {
  const AXIS = '#6d28d9', FEM = '#c27a00', MASC = '#0e7c86';   // neutral colours: no pink / blue stereotype
  const ga = rad(28), g = [Math.cos(ga), Math.sin(ga)], nrm = [-Math.sin(ga), Math.cos(ga)];
  // each word = score along g  +  some offset perpendicular to g (illustrative)
  const W = [['口紅', 1.45, 0.55], ['裙子', 1.0, -0.75], ['桌子', 0.05, 1.25], ['足球', -0.75, -0.9], ['鬍子', -1.35, 0.6]];
  const pos = ([, s, q]) => [s * g[0] + q * nrm[0], s * g[1] + q * nrm[1]];
  const svg = $('#dir3-plot');
  HOOKS['s-dir3'] = {
    render(step) {
      const p = Plot(svg, { xmin: -2.3, xmax: 2.3, ymin: -2.0, ymax: 2.0, pad: 8 });
      p.clear(); p.grid(1, true);
      if (step >= 2) {   // the direction: a long axis through the origin, and the arrow 女 − 男
        p.line(-2.2 * g[0], -2.2 * g[1], 2.2 * g[0], 2.2 * g[1], { color: AXIS, w: 2, dash: '8 6' });
        p.arrow(0, 0, 1.0 * g[0], 1.0 * g[1], { color: AXIS, w: 7, head: 20 });
        p.text(1.0 * g[0], 1.0 * g[1], '女 − 男', { color: AXIS, size: 22, weight: 700, dx: 8, dy: 30 });
      }
      W.forEach(w => {
        const [x, y] = pos(w), s = w[1], pr = [s * g[0], s * g[1]];
        const c = s > 0.3 ? FEM : s < -0.3 ? MASC : MUTE;
        if (step >= 3) {
          p.line(x, y, pr[0], pr[1], { color: c, w: 2, dash: '4 4' });
          p.dot(pr[0], pr[1], { r: 6, color: c });
        }
        p.dot(x, y, { r: 8, color: step >= 3 ? c : INK });
        p.text(x, y, w[0], { color: step >= 3 ? c : INK, size: 23, weight: 700, dx: 12, dy: -8 });
      });
    }
  };
  // ranked bars
  const max = 1.6;
  $('#dir3-bars').innerHTML = W.slice().sort((a, b) => b[1] - a[1]).map(([w, s]) => {
    const c = s > 0.3 ? FEM : s < -0.3 ? MASC : MUTE, wpx = Math.abs(s) / max * 50;
    const bar = s >= 0 ? `left: 50%; width: ${wpx}%` : `right: 50%; width: ${wpx}%`;
    return `<div class="brow"><span>${w}</span><div class="btrack"><i style="${bar}; background: ${c}"></i></div><b style="color:${c}">${s >= 0 ? '+' : '−'}${Math.abs(s).toFixed(2)}</b></div>`;
  }).join('');
})();
(function () { const i = document.createElement('i'); i.className = 'stepper'; i.dataset.step = 2; $('#s-dir3').appendChild(i); })();
/* directions ①: highlight the differing column from step 2 on */
HOOKS['s-dir1'] = { render(step, el) { el.classList.toggle('show-hot', step >= 2); } };

/* ---------- directions: adjectiveness bars (illustrative scores) ---------- */
(function () {
  const W = [['bright', 1.3], ['quick', 1.1], ['green', 0.8], ['running', 0.1], ['table', -0.9], ['idea', -1.1], ['elephant', -1.4]];
  const max = 1.6, A = '#1f8a70', N = '#c25e00';
  $('#adj-bars').innerHTML = W.map(([w, s]) => {
    const c = s > 0.3 ? A : s < -0.3 ? N : MUTE, wpx = Math.abs(s) / max * 50;
    const bar = s >= 0 ? `left: 50%; width: ${wpx}%` : `right: 50%; width: ${wpx}%`;
    return `<div class="brow en"><span>${w}</span><div class="btrack"><i style="${bar}; background: ${c}"></i></div><b style="color:${c}">${s >= 0 ? '+' : '−'}${Math.abs(s).toFixed(2)}</b></div>`;
  }).join('');
})();

/* ---------- directions: the loudness axis (illustrative scores) ---------- */
(function () {
  const svg = $('#loud-plot'), W = 1108, X0 = 90, X1 = W - 90, Y = 200;
  const words = [['🧨', '鞭炮', 1.5], ['⛈️', '雷聲', 1.25], ['🎤', '演唱會', 1.0], ['🛒', '市場', 0.5], ['💼', '會議', -0.05], ['🌙', '月光', -0.7], ['📚', '圖書館', -1.05], ['❄️', '雪', -1.4]];
  const X = s => X0 + (s + 1.7) / 3.4 * (X1 - X0);
  HOOKS['s-loud'] = {
    render(step) {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      if (step < 2) return;
      const defs = el('defs', {}, svg), g = el('linearGradient', { id: 'loud-grad', x1: 0, x2: 1, y1: 0, y2: 0 }, defs);
      el('stop', { offset: '0%', 'stop-color': '#14a3a3' }, g); el('stop', { offset: '50%', 'stop-color': '#e9e4d8' }, g); el('stop', { offset: '100%', 'stop-color': '#d9362b' }, g);
      // the axis: a volume bar that thickens towards the loud end
      el('path', { d: `M${X0},${Y - 4} L${X1},${Y - 16} L${X1},${Y + 16} L${X0},${Y + 4} Z`, fill: 'url(#loud-grad)' }, svg);
      el('text', { x: X0 - 50, y: Y + 14, 'font-size': 40, 'text-anchor': 'middle' }, svg, '🔇');
      el('text', { x: X1 + 50, y: Y + 14, 'font-size': 40, 'text-anchor': 'middle' }, svg, '🔊');
      el('text', { x: X0, y: Y + 52, fill: '#14a3a3', 'font-size': 22, 'font-weight': 700 }, svg, '靜 quiet');
      el('text', { x: X1, y: Y + 52, fill: '#d9362b', 'font-size': 22, 'font-weight': 700, 'text-anchor': 'end' }, svg, '響 loud');
      el('line', { x1: X(0), y1: Y - 26, x2: X(0), y2: Y + 26, stroke: '#9aa3b2', 'stroke-width': 2, 'stroke-dasharray': '4 4' }, svg);
      if (step < 3) return;
      words.forEach(([icon, w, s], i) => {
        const x = X(s), up = i % 2 === 0, ty = up ? Y - 92 : Y - 150;
        const c = s > 0.3 ? '#d9362b' : s < -0.3 ? '#14a3a3' : MUTE;
        el('line', { x1: x, y1: ty + 20, x2: x, y2: Y - 8, stroke: c, 'stroke-width': 2, 'stroke-dasharray': '3 4' }, svg);
        el('circle', { cx: x, cy: Y, r: 8, fill: c, stroke: '#fff', 'stroke-width': 2.5 }, svg);
        el('text', { x, y: ty - 6, 'font-size': 34, 'text-anchor': 'middle' }, svg, icon);
        el('text', { x, y: ty + 18, fill: c, 'font-size': 22, 'font-weight': 700, 'text-anchor': 'middle' }, svg, w);
      });
    }
  };
  const i = document.createElement('i'); i.className = 'stepper'; i.dataset.step = 3; $('#s-loud').appendChild(i);
})();



/* ===================================================================================
   DHG 502 additions: meaning change (alignment, temporal referencing)
   =================================================================================== */

/* ---------- one model per period, then alignment (orthogonal Procrustes in 2-D) ---------- */
(function () {
  const svg = $('#align-plot');
  const ctx = { sea: [2.3, 0.3], harbour: [1.9, 1.5], crew: [1.2, 2.1], clerk: [-1.2, 1.9], arithmetic: [-0.4, 2.4], tables: [-1.9, 1.2], machine: [-2.1, -1.0], electronic: [-1.3, -1.9], program: [-0.3, -2.3] };
  const A = { ...ctx, ship: [2.1, 1.0], computer: [-1.0, 2.0] };
  // the 1950s "truth": same context words with a little noise; computer has moved to the machines
  let seed = 5; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5;
  const Btrue = {};
  for (const k in A) Btrue[k] = [A[k][0] + 0.45 * rnd(), A[k][1] + 0.45 * rnd()];
  Btrue.computer = [-1.8, -1.5];
  const rot = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
  const PHI = rad(128);
  const B = {}; for (const k in Btrue) B[k] = rot(Btrue[k], PHI);   // the 1950s model, as trained: arbitrarily rotated
  // Procrustes in 2-D: the rotation that best maps B onto A, estimated from the context words only
  let sx = 0, sy = 0;
  for (const k in ctx) { sx += B[k][0] * A[k][0] + B[k][1] * A[k][1]; sy += B[k][0] * A[k][1] - B[k][1] * A[k][0]; }
  const BEST = Math.atan2(sy, sx);
  const TGT = { ship: BLUE, computer: ORG };
  let t = 0, anim = null, curStep = 0;
  const ease = x => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  function panel(x0, title, pts, o = {}) {
    const ns = el('svg', { x: x0, y: 0, width: 520, height: 400, viewBox: '0 0 520 400', overflow: 'visible' }, svg);
    el('rect', { x: 0, y: 0, width: 520, height: 400, rx: 14, fill: '#fff', stroke: '#e3e6ec', 'stroke-width': 1.5 }, ns);
    el('text', { x: 18, y: 32, fill: INK, 'font-size': 22, 'font-weight': 700 }, ns, title);
    el('line', { x1: 14, y1: 46, x2: 506, y2: 46, stroke: '#e3e6ec', 'stroke-width': 1 }, ns);
    const inner = el('svg', { x: 0, y: 48, width: 520, height: 352, viewBox: '0 0 520 352', overflow: 'visible' }, ns);
    const p = Plot(inner, { xmin: -3, xmax: 3, ymin: -3, ymax: 3, pad: 12 });
    p.grid(1, true);
    if (o.ghost) for (const k in o.ghost) {
      p.dot(...o.ghost[k], { r: k in TGT ? 8 : 6, color: k in TGT ? TGT[k] : '#9aa3b2' }).setAttribute('opacity', 0.22);
    }
    for (const k in pts) if (!(k in TGT)) { p.dot(...pts[k], { r: 6, color: '#9aa3b2' }); p.text(...pts[k], k, { color: MUTE, size: 15, dx: 8, dy: 5 }); }
    if (o.ghost) for (const k in TGT) {   // the 1920s target vectors, faint, and the angle to their 1950s counterparts
      const g = o.ghost[k], v = pts[k];
      p.arrow(0, 0, ...g, { color: TGT[k], w: 4, dash: '7 6' }).setAttribute('opacity', 0.35);
      const a1 = Math.atan2(g[1], g[0]); let d = Math.atan2(v[1], v[0]) - a1;
      while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      const r = k === 'computer' ? 0.75 : 1.25, deg = Math.abs(d) * 180 / Math.PI;
      p.arc(r, a1, a1 + d, { color: TGT[k], w: 3 });
      const am = a1 + d / 2, rr = k === 'computer' ? r + 0.42 : r;
      const lt = p.text(rr * Math.cos(am), rr * Math.sin(am), `${deg.toFixed(deg < 10 ? 1 : 0)}°`, { color: TGT[k], size: 19, weight: 700, anchor: 'middle', dy: k === 'computer' ? 6 : 30 });
      lt.setAttribute('stroke', '#fff'); lt.setAttribute('stroke-width', 5); lt.setAttribute('paint-order', 'stroke');
    }
    for (const k in TGT) {
      const hot = o.hl && (o.hl === 'all' || o.hl === k);
      p.arrow(0, 0, ...pts[k], { color: TGT[k], w: hot ? 6 : 4 }).setAttribute('opacity', o.hl && !hot ? 0.35 : 1);
      const lbl = p.text(...pts[k], k, { color: TGT[k], size: 22, weight: 700, dx: 10, dy: -8 });
      lbl.setAttribute('stroke', '#fff'); lbl.setAttribute('stroke-width', 5); lbl.setAttribute('paint-order', 'stroke');
    }
    p.dot(0, 0, { r: 4, color: INK });
    return ns;
  }
  function draw() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const Bt = {}; for (const k in B) Bt[k] = rot(B[k], BEST * t);
    const hl = curStep === 1 ? 'ship' : curStep >= 3 ? 'all' : null;
    panel(0, '1920s model', A, { hl });
    panel(588, t > 0 ? (t >= 1 ? '1950s model, aligned' : 'rotating …') : '1950s model', Bt, { hl, ghost: curStep >= 3 ? A : null });
    const lab = (txt, c, y) => { const e = el('text', { x: 554, y, 'text-anchor': 'middle', fill: c, 'font-size': 19, 'font-weight': 700 }, svg, txt); return e; };
    if (curStep === 1) { lab('cos(ship, ship)', BLUE, 186); lab('= ' + fmt(cosine(A.ship, B.ship)), BLUE, 212); lab('meaningless', BAD_C, 240); }
    if (curStep >= 3) {
      lab('ship', BLUE, 150); lab('cos = ' + cosine(A.ship, Bt.ship).toFixed(3), BLUE, 174);
      lab('computer', ORG, 236); lab('cos = ' + cosine(A.computer, Bt.computer).toFixed(3).replace('-', '−'), ORG, 260);
    }
  }
  function go(target) {
    if (anim) cancelAnimationFrame(anim);
    const t0 = t, start = performance.now(), dur = 1400;
    const f = now => { const u = Math.min(1, (now - start) / dur); t = t0 + (target - t0) * ease(u); draw(); anim = u < 1 ? requestAnimationFrame(f) : null; };
    anim = requestAnimationFrame(f);
  }
  HOOKS['s-align'] = { render(step) { curStep = step; const target = step >= 2 ? 1 : 0; if (target !== t) go(target); else draw(); } };
  addStepper('s-align', 3);
  draw();
})();

/* ---------- temporal referencing: rename the target word in each period ---------- */
(function () {
  const S = { a: ['the', 'computer', 'checked', 'the', 'tables', 'of', 'figures'], b: ['the', 'electronic', 'computer', 'ran', 'the', 'program'] };
  const tag = { a: '_1920s', b: '_1950s' };
  for (const k in S) {
    const box = $('#tr-' + k);
    S[k].forEach(w => { const sp = document.createElement('span'); sp.className = 'tok'; sp.dataset.w = w; sp.textContent = w; box.appendChild(sp); });
  }
  const notes = [
    'One corpus, two periods. <small>(Illustrative sentences.)</small>',
    'Before training, we <b>rename the target word</b>: in 1920s texts <i>computer</i> becomes computer_1920s, in 1950s texts computer_1950s.',
    'For the model these are now two different words. All other words (<i>the</i>, <i>tables</i>, <i>program</i> …) stay the same in every period.'
  ];
  HOOKS['s-trtag'] = {
    render(step) {
      for (const k in S) $$('.tok', $('#tr-' + k)).forEach(sp => {
        const on = step >= 1 && sp.dataset.w === 'computer';
        sp.textContent = on ? 'computer' + tag[k] : sp.dataset.w;
        sp.classList.toggle('tagged', on);
      });
      $('#tr-note').innerHTML = `<span class="en">${notes[Math.min(step, 2)]}</span>`;
    }
  };
  const st = document.createElement('i'); st.className = 'stepper'; st.dataset.step = 2; $('#s-trtag').appendChild(st);
})();

/* ---------- temporal referencing: one shared space; time-tagged targets pulled by shared neighbours ---------- */
(function () {
  const C = { clerk: [-1.7, 1.3], arithmetic: [-1.0, 1.9], tables: [-2.0, 0.5], machine: [1.9, -1.2], electronic: [1.2, -1.85], program: [2.15, -0.45], sea: [1.25, 1.85], harbour: [1.95, 1.2], crew: [0.55, 2.1] };
  const ctx = { computer_1920s: ['clerk', 'arithmetic', 'tables'], computer_1950s: ['machine', 'electronic', 'program'], ship_1920s: ['sea', 'harbour', 'crew'], ship_1950s: ['sea', 'harbour', 'crew'] };
  const col = { computer_1920s: '#c2410c', computer_1950s: ORG, ship_1920s: '#1e40af', ship_1950s: BLUE };
  let W = { computer_1920s: [0.6, -1.1], computer_1950s: [-1.0, 0.7], ship_1920s: [-1.1, -0.5], ship_1950s: [0.9, -0.9] };
  const states = [];
  for (let st = 0; st <= 3; st++) {
    states.push(JSON.parse(JSON.stringify(W)));
    for (let k = 0; k < 2; k++) for (const w in W) {
      let v = W[w];
      for (const c of ctx[w]) { const g = 1 - sig(dotp(v, C[c])); v = [v[0] + 0.8 * g * C[c][0], v[1] + 0.8 * g * C[c][1]]; }
      const L = norm(v); W[w] = v.map(z => z * 1.3 / L);
    }
  }
  const notes = [
    'One space for all periods. The grey context words are <b>shared</b>. Each time-tagged target starts at random.',
    'Each round, every target is pulled towards the contexts it occurred with <b>in its own period</b>.',
    'ship_1920s and ship_1950s have the same company, so they end up together.',
    'computer_1920s and computer_1950s are pulled apart: clerks and arithmetic, then machines.'
  ];
  const svg = $('#tr-plot');
  HOOKS['s-trwhy'] = {
    render(step) {
      const k = Math.min(step, 3), p = Plot(svg, { xmin: -2.6, xmax: 2.8, ymin: -2.3, ymax: 2.5, pad: 8 });
      p.clear(); p.grid(1, true);
      for (const c in C) { p.dot(...C[c], { color: '#9aa3b2', r: 7 }); p.text(...C[c], c, { color: MUTE, size: 17, dx: 9, dy: 6 }); }
      for (const w in W) {
        for (let t = 0; t < k; t++) p.dot(...states[t][w], { color: col[w], r: 4 }).setAttribute('opacity', 0.35);
        const v = states[k][w];
        p.arrow(0, 0, ...v, { color: col[w], w: 4 });
        const right = v[0] >= 0, low = w.endsWith('1950s');
        const t = p.text(...v, w, { color: col[w], size: 18, weight: 700, dx: right ? 8 : -8, dy: low ? 22 : -8, anchor: right ? 'start' : 'end' });
        t.setAttribute('stroke', '#fff'); t.setAttribute('stroke-width', 5); t.setAttribute('paint-order', 'stroke');
      }
      p.dot(0, 0, { r: 4, color: INK });
      const cs = cosine(states[k].ship_1920s, states[k].ship_1950s), cc = cosine(states[k].computer_1920s, states[k].computer_1950s);
      $('#tr-scores').innerHTML =
        `<div><span>ship_1920s ↔ ship_1950s</span><b style="color:${BLUE}">cos ${fmt(cs)}</b><em>change ${fmt(1 - cs)}</em></div>` +
        `<div><span>computer_1920s ↔ computer_1950s</span><b style="color:${ORG}">cos ${fmt(cc)}</b><em>change ${fmt(1 - cc)}</em></div>`;
      $('#trw-note').innerHTML = `<span class="en">${notes[k]}</span>`;
    }
  };
})();

/* ---------- validation: average cosine distance, changed vs stable (Dubossarsky et al. 2019, Table 3) ---------- */
(function () {
  const rows = [['separate models + alignment', 0.47, 0.34, '+38%'], ['temporal referencing', 0.31, 0.21, '+50%']];
  const bar = (v, c) => `<div class="tb"><i style="width:${v / 0.5 * 100}%;background:${c}"></i><b>${v.toFixed(2)}</b></div>`;
  $('#tr-bars').innerHTML = rows.map(([n, ch, st, d]) =>
    `<div class="tbrow"><span class="tbn">${n}</span><div class="tbs">${bar(ch, ORG)}${bar(st, '#9aa3b2')}</div><em>${d}</em></div>`).join('') +
    `<div class="tbleg"><span><i style="background:${ORG}"></i>changed words</span><span><i style="background:#9aa3b2"></i>stable words</span><span>right: how much higher the changed words score →</span></div>`;
})();





/* ---------- three distances (ported from the CHI3242 stylometry deck): ↑/↓ stretch B, P moves B ---------- */
(function () {
  const A = [7, 3], PRE = [[3, 6], [5, 7.5], [8.5, 5], [2, 2.5]], A_C = '#2563eb', B_C = '#dc2626';
  let pi = 0, sc = 1, root = null, curStep = 0;
  const X = v => 60 + v * 42, Y = v => 420 - v * 40;
  const B = () => PRE[pi].map(v => v * sc);
  const head = (id, c) => `<marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${c}"/></marker>`;
  function draw(step) {
    const b = B(), svg = $('#dist-svg', root);
    let h = `<defs>${head('da', A_C)}${head('db', B_C)}</defs>`;
    for (let v = 0; v <= 10; v += 2) h += `<line x1="${X(v)}" y1="${Y(0)}" x2="${X(v)}" y2="${Y(10)}" stroke="${LINE}"/><line x1="${X(0)}" y1="${Y(v)}" x2="${X(10)}" y2="${Y(v)}" stroke="${LINE}"/><text x="${X(v)}" y="${Y(0) + 22}" text-anchor="middle" fill="${MUTE}" font-size="15">${v}</text><text x="${X(0) - 8}" y="${Y(v) + 5}" text-anchor="end" fill="${MUTE}" font-size="15">${v}</text>`;
    h += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(10)}" y2="${Y(0)}" stroke="${INK}" stroke-width="2"/><line x1="${X(0)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(10)}" stroke="${INK}" stroke-width="2"/>`;
    if (step >= 4) {
      const r = 70, a1 = Math.atan2(A[1], A[0]), a2 = Math.atan2(b[1], b[0]);
      const p = a => [X(0) + r * Math.cos(a), Y(0) - r * Math.sin(a)];
      const [x1, y1] = p(a1), [x2, y2] = p(a2), sw = a2 > a1 ? 0 : 1;
      h += `<path d="M${X(0)} ${Y(0)} L${x1} ${y1} A${r} ${r} 0 0 ${sw} ${x2} ${y2} Z" fill="#9333ea" opacity=".18"/><path d="M${x1} ${y1} A${r} ${r} 0 0 ${sw} ${x2} ${y2}" fill="none" stroke="#9333ea" stroke-width="3"/>`;
      const am = (a1 + a2) / 2;
      h += `<text x="${X(0) + (r + 16) * Math.cos(am)}" y="${Y(0) - (r + 16) * Math.sin(am) + 6}" font-size="22" fill="#9333ea" font-weight="700">θ</text>`;
    }
    h += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(A[0])}" y2="${Y(A[1])}" stroke="${A_C}" stroke-width="3" marker-end="url(#da)" opacity=".8"/>`;
    h += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(b[0])}" y2="${Y(b[1])}" stroke="${B_C}" stroke-width="3" marker-end="url(#db)" opacity=".8"/>`;
    if (step >= 1) {
      const route = `M${X(A[0])} ${Y(A[1])} H${X(b[0])} V${Y(b[1])}`;
      h += `<path d="${route}" fill="none" stroke="#e0570f" stroke-width="5" stroke-linejoin="round" opacity=".85"/>`;
      if (step === 1) h += `<text font-size="30" text-anchor="middle" dy="10">🚕<animateMotion dur="2.2s" fill="freeze" path="${route}"/></text>`;
    }
    if (step >= 3) h += `<line x1="${X(A[0])}" y1="${Y(A[1])}" x2="${X(b[0])}" y2="${Y(b[1])}" stroke="#16a34a" stroke-width="4" stroke-dasharray="9 6"/>`;
    h += `<circle cx="${X(A[0])}" cy="${Y(A[1])}" r="9" fill="${A_C}"/><text x="${X(A[0]) + 12}" y="${Y(A[1]) + 26}" font-size="20" fill="${A_C}" font-weight="700">A (${A.join(', ')})</text>`;
    h += `<circle cx="${X(b[0])}" cy="${Y(b[1])}" r="9" fill="${B_C}"/><text x="${X(b[0]) + 12}" y="${Y(b[1]) - 12}" font-size="20" fill="${B_C}" font-weight="700">B (${b[0].toFixed(1)}, ${b[1].toFixed(1)})</text>`;
    svg.innerHTML = h;
    const dx = A[0] - b[0], dy = A[1] - b[1];
    $('#d-man', root).textContent = (Math.abs(dx) + Math.abs(dy)).toFixed(2);
    $('#d-euc', root).textContent = Math.hypot(dx, dy).toFixed(2);
    $('#d-cos', root).textContent = (1 - (A[0] * b[0] + A[1] * b[1]) / (Math.hypot(...A) * Math.hypot(...b))).toFixed(3);
  }
  HOOKS['s-dist'] = {
    render(step, el) { root = el; curStep = step; draw(step); },
    key(e) {
      const m = Math.max(...PRE[pi]);
      if (e.key === 'ArrowUp') { sc = Math.min(9.8 / m, sc * 1.2); return true; }
      if (e.key === 'ArrowDown') { sc = Math.max(0.25, sc / 1.2); return true; }
      if (e.key === 'p' || e.key === 'P') { pi = (pi + 1) % PRE.length; sc = 1; return true; }
    }
  };
})();


/* ---------- Hamilton et al. 2016, Fig. 1: conceptual drawing of words moving through time ---------- */
(function () {
  const svg = $('#ham-plot'), PW = 352, GAP = (1108 - 3 * PW) / 2, PH = 390;
  const P = [
    { w: 'gay', cap: '“cheerful” → homosexual',
      ctx: [['daft', .14, .1], ['flaunting', .22, .21], ['tasteful', .1, .3], ['sweet', .64, .17], ['cheerful', .74, .26], ['pleasant', .64, .38],
            ['frolicsome', .3, .46], ['witty', .24, .54], ['bright', .74, .63], ['gays', .1, .74], ['bisexual', .5, .74], ['homosexual', .64, .85], ['lesbian', .3, .97]],
      t: [['1900s', .42, .07], ['1950s', .56, .53], ['1990s', .2, .88]] },
    { w: 'broadcast', cap: '“scattering seeds” → transmitting signals',
      ctx: [['spread', .3, .08], ['sow', .84, .2], ['seed', .9, .3], ['sows', .84, .4], ['scatter', .78, .5], ['circulated', .16, .46],
            ['newspapers', .3, .7], ['television', .66, .76], ['radio', .3, .85], ['bbc', .1, .97]],
      t: [['1850s', .5, .32], ['1900s', .52, .56], ['1990s', .46, .96]] },
    { w: 'awful', cap: '“full of awe” → terrible',
      ctx: [['solemn', .4, .04], ['majestic', .78, .24], ['awe', .2, .28], ['dread', .2, .37], ['pensive', .84, .36], ['gloomy', .8, .43],
            ['horrible', .44, .6], ['appalling', .2, .7], ['terrible', .56, .7], ['wonderful', .86, .72], ['weird', .9, .97], ['awfully', .5, .99]],
      t: [['1850s', .56, .1], ['1900s', .3, .77], ['1990s', .7, .86]] }
  ];
  const BL = '#2f5da8';
  HOOKS['s-hamilton'] = {
    render(step) {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      const defs = el('defs', {}, svg), mk = el('marker', { id: 'ham-ah', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
      el('path', { d: 'M0 0 L10 5 L0 10 z', fill: BL }, mk);
      P.forEach((p, i) => {
        const x0 = i * (PW + GAP), X = u => x0 + 26 + u * (PW - 52), Y = v => 30 + v * (PH - 90);
        const on = step >= i + 1;
        if (i) el('line', { x1: x0 - GAP / 2, y1: 6, x2: x0 - GAP / 2, y2: PH + 30, stroke: '#d8cdb8', 'stroke-width': 1.5 }, svg);
        el('text', { x: x0 + 6, y: 20, fill: '#26221d', 'font-size': 26, 'font-weight': 700, 'font-family': 'Iowan Old Style, Palatino, Georgia, serif' }, svg, p.w);
        const g = el('g', { opacity: on ? 1 : 0.18 }, svg);
        p.ctx.forEach(([w, u, v]) => el('text', { x: X(u), y: Y(v), fill: '#9a9184', 'font-size': 19, 'text-anchor': 'middle' }, g, w));
        for (let k = 0; k + 1 < p.t.length; k++) {
          const [, u1, v1] = p.t[k], [, u2, v2] = p.t[k + 1];
          const dx = X(u2) - X(u1), dy = Y(v2) - Y(v1), L = Math.hypot(dx, dy), s0 = 14 / L, s1 = 1 - 22 / L;
          el('line', { x1: X(u1) + dx * s0, y1: Y(v1) + dy * s0, x2: X(u1) + dx * s1, y2: Y(v1) + dy * s1, stroke: BL, 'stroke-width': 3.5, 'marker-end': 'url(#ham-ah)' }, g);
        }
        p.t.forEach(([yr, u, v]) => {
          const t = el('text', { x: X(u), y: Y(v) + 6, fill: '#26221d', 'font-size': 20, 'font-weight': 700, 'text-anchor': 'middle', stroke: '#fbf8f1', 'stroke-width': 6, 'paint-order': 'stroke' }, g, `${p.w} (${yr})`);
        });
        el('text', { x: x0 + PW / 2, y: PH + 26, fill: on ? '#b03a2e' : '#cfc6b6', 'font-size': 19, 'font-style': 'italic', 'text-anchor': 'middle', 'font-family': 'Iowan Old Style, Palatino, Georgia, serif' }, svg, p.cap);
      });
    }
  };
  const st = document.createElement('i'); st.className = 'stepper'; st.dataset.step = 3; $('#s-hamilton').appendChild(st);
})();
