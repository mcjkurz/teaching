/* Slide-specific logic for the word-vectors deck (loaded before deck.js). */
window.HOOKS = {};
window.SECTIONS = [
  { id: 'meaning',    zh: '詞義是什麼',   en: 'What is meaning?' },
  { id: 'relations',  zh: '語義關係',     en: 'Semantic relations' },
  { id: 'vectors',    zh: '向量與內積',   en: 'Vectors and dot products' },
  { id: 'similarity', zh: '餘弦相似度',   en: 'Cosine similarity' },
  { id: 'counts',     zh: '共現向量',     en: 'Co-occurrence vectors' },
  { id: 'embeddings', zh: '稠密詞向量',   en: 'Dense word vectors' },
  { id: 'limits',     zh: '限制與下一步', en: 'Limits and next steps' },
  { id: 'summary',    zh: '總結',         en: 'Summary' }
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

/* ---------- 1. title: a slowly rotating 3-D word space ---------- */
(function () {
  const svg = $('#title-plot'), slide = $('#s-title');
  const W = 560, H = 560, cx = W / 2 - 10, cy = H / 2 + 20, S = 80;
  // word clusters (illustrative coordinates): emotions, sadness, everyday objects, royalty
  const words = [
    ['幸福', [1.9, 1.3, 1.2], BLUE], ['快樂', [1.6, 1.7, 0.9], BLUE], ['開心', [2.0, 1.5, 0.6], BLUE],
    ['悲傷', [-1.7, 1.2, 1.4], PUR], ['痛苦', [-1.9, 0.9, 1.0], PUR],
    ['牙刷', [0.6, -1.8, 1.6], ORG], ['香蕉', [1.1, -1.6, 2.0], ORG],
    ['皇帝', [-0.9, -1.2, -1.6], GRN], ['皇后', [-0.3, -1.6, -1.7], GRN]
  ];
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const dust = Array.from({ length: 90 }, () => [(rnd() * 2 - 1) * 2.4, (rnd() * 2 - 1) * 2.4, (rnd() * 2 - 1) * 2.4]);
  const L = 2.5;
  let yaw = 0.6, t0 = null;
  const pitch = 0.42;
  function proj([x, y, z]) {
    // rotate around the vertical (z) axis, then tilt; perspective by depth
    const xr = x * Math.cos(yaw) - y * Math.sin(yaw), yr = x * Math.sin(yaw) + y * Math.cos(yaw);
    const yt = yr * Math.cos(pitch) - z * Math.sin(pitch), zt = yr * Math.sin(pitch) + z * Math.cos(pitch);
    const f = 6 / (6 + yt);           // yt = depth (positive = further away)
    return { x: cx + xr * S * f, y: cy - zt * S * f, d: yt, f };
  }
  const line = (p, q, attrs) => el('line', { x1: p.x, y1: p.y, x2: q.x, y2: q.y, ...attrs }, svg);
  function arrow(p, q, c, w, op) {
    const ang = Math.atan2(q.y - p.y, q.x - p.x), hl = 14 * q.f, hw = 5.5 * q.f;
    const g = el('g', { opacity: op }, svg);
    el('line', { x1: p.x, y1: p.y, x2: q.x - Math.cos(ang) * hl * 0.8, y2: q.y - Math.sin(ang) * hl * 0.8, stroke: c, 'stroke-width': w, 'stroke-linecap': 'round' }, g);
    const px = -Math.sin(ang), py = Math.cos(ang);
    el('polygon', { points: `${q.x},${q.y} ${q.x - Math.cos(ang) * hl + px * hw},${q.y - Math.sin(ang) * hl + py * hw} ${q.x - Math.cos(ang) * hl - px * hw},${q.y - Math.sin(ang) * hl - py * hw}`, fill: c }, g);
  }
  function draw() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const O = proj([0, 0, 0]);
    // floor grid
    for (let i = -2; i <= 2; i++) {
      line(proj([i, -2, 0]), proj([i, 2, 0]), { stroke: '#dfe4ec', 'stroke-width': 1 });
      line(proj([-2, i, 0]), proj([2, i, 0]), { stroke: '#dfe4ec', 'stroke-width': 1 });
    }
    // axes
    [[[L, 0, 0], 'x₁'], [[0, L, 0], 'x₂'], [[0, 0, L], 'x₃']].forEach(([v, n]) => {
      const neg = proj(v.map(c => -c * 0.8)), pos = proj(v);
      line(neg, pos, { stroke: '#a3acbb', 'stroke-width': 1.6 });
      el('text', { x: pos.x + 6, y: pos.y - 4, fill: '#8a93a3', 'font-size': 16, 'font-style': 'italic' }, svg, n);
    });
    // dust: other words in the space
    dust.forEach(v => { const p = proj(v); el('circle', { cx: p.x, cy: p.y, r: 2.6 * p.f, fill: '#9aa6bb', opacity: 0.18 + 0.3 * (1 - (p.d + 3) / 6) }, svg); });
    // word arrows, far ones first
    words.map(([w, v, c]) => ({ w, v, c, p: proj(v) })).sort((a, b) => b.p.d - a.p.d).forEach(({ w, c, p }) => {
      const near = Math.max(0, Math.min(1, 1 - (p.d + 2.5) / 5));
      arrow(O, p, c, 3.2 * p.f, 0.45 + 0.55 * near);
      el('circle', { cx: p.x, cy: p.y, r: 5 * p.f, fill: c, opacity: 0.45 + 0.55 * near }, svg);
      el('text', { x: p.x + 9, y: p.y - 8, fill: c, 'font-size': 23 * p.f, 'font-weight': 700, opacity: 0.5 + 0.5 * near, stroke: '#fff', 'stroke-width': 4, 'paint-order': 'stroke' }, svg, w);
    });
    el('circle', { cx: O.x, cy: O.y, r: 4.5, fill: INK }, svg);
  }
  function tick(ts) {
    if (t0 == null) t0 = ts;
    const dt = Math.min(64, ts - t0); t0 = ts;
    if (slide.classList.contains('active')) { yaw += dt * 0.00018; draw(); }
    requestAnimationFrame(tick);
  }
  draw();
  requestAnimationFrame(tick);
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
/* ---------- angle panels ---------- */
(function () {
  [['ang-1', 25], ['ang-2', 90], ['ang-3', 180]].forEach(([id, th]) => {
    const p = Plot($('#' + id), { xmin: -1.5, xmax: 1.5, ymin: -1.3, ymax: 1.5, pad: 8 });
    p.grid(1, true);
    const a0 = rad(20), a1 = rad(20 + th);
    p.arrow(0, 0, 1.2 * Math.cos(a0), 1.2 * Math.sin(a0), { color: BLUE, w: 5 });
    p.arrow(0, 0, 1.2 * Math.cos(a1), 1.2 * Math.sin(a1), { color: ORG, w: 5 });
    p.arc(0.45, a0, a1);
    p.text(1.2 * Math.cos(a0), 1.2 * Math.sin(a0), 'A', { color: BLUE, size: 24, weight: 700, dx: 8, dy: -6 });
    p.text(1.2 * Math.cos(a1), 1.2 * Math.sin(a1), 'B', { color: ORG, size: 24, weight: 700, dx: 8, dy: -6 });
    p.text(-1.4, -1.0, 'cos = ' + ({ 25: '+0.91', 90: '0', 180: '−1' })[th], { color: INK, size: 24, weight: 700 });
  });
})();

/* ---------- magnitude ‖a‖: the 3-4-5 triangle ---------- */
HOOKS['s-mag'] = {
  render(step) {
    const svg = $('#mag-plot'), p = Plot(svg, { xmin: -0.8, xmax: 4.8, ymin: -0.8, ymax: 4.8, pad: 10 });
    p.clear(); p.grid(1, true, true);
    if (step >= 2) {
      el('polygon', { points: `${p.X(0)},${p.Y(0)} ${p.X(3)},${p.Y(0)} ${p.X(3)},${p.Y(4)}`, fill: '#fff6d6', stroke: 'none' }, svg);
      p.line(0, 0, 3, 0, { color: GLD, w: 6 }); p.line(3, 0, 3, 4, { color: GLD, w: 6 });
      el('rect', { x: p.X(3) - 18, y: p.Y(0) - 18, width: 18, height: 18, fill: 'none', stroke: GLD, 'stroke-width': 2.5 }, svg);
      p.text(1.5, 0, '3', { color: '#8a6400', size: 30, weight: 700, dy: 36, anchor: 'middle' });
      p.text(3, 2, '4', { color: '#8a6400', size: 30, weight: 700, dx: 14, dy: 10 });
    }
    p.arrow(0, 0, 3, 4, { color: BLUE, w: 6 });
    p.text(3, 4, 'a = [3, 4]', { color: BLUE, size: 26, weight: 700, dx: 10, dy: -10 });
    if (step >= 3) p.text(1.5, 2, '‖a‖ = 5', { color: BLUE, size: 32, weight: 700, dx: -18, dy: -10, anchor: 'end' }).setAttribute('style', 'font-family: "Times New Roman", STIXGeneral, serif');
    p.dot(0, 0, { r: 5, color: INK });
  }
};

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

/* ---------- cosine-function slide ---------- */
(function () {
  const svg = $('#cosgraph-plot');
  const pts = [[0, '相同方向 similar', GRN], [90, '垂直 unrelated', MUTE], [180, '相反方向 opposite', BAD_C]];
  HOOKS['s-cosgraph'] = {
    render(step) {
      const { X, Y } = cosCurve(svg, { fs: 20, pl: 64, pr: 34, pt: 70, w: 4, halves: true, shade: step >= 3 });
      el('text', { x: 14, y: 40, fill: MUTE, 'font-size': 22, 'font-style': 'italic' }, svg, 'cos θ');
      el('text', { x: X(360), y: Y(-1) - 10, 'text-anchor': 'end', fill: MUTE, 'font-size': 20, 'font-style': 'italic' }, svg, '夾角 θ');
      // annotation anchors (angle, value) placed in empty regions, away from the curve
      const anchor = { 0: [58, 0.92], 90: [122, 0.28], 180: [196, -0.22] };
      if (step >= 1) pts.forEach(([d, lab, c]) => {
        const px = X(d), py = Y(Math.cos(rad(d)));
        if (step >= 2) {
          const [ad, av] = anchor[d], cx = X(ad), cy = Y(av), L = 44;
          el('line', { x1: px, y1: py, x2: cx - 8, y2: cy, stroke: c, 'stroke-width': 1.5, 'stroke-dasharray': '3 4', opacity: 0.7 }, svg);
          const arr = (ang, col) => { const ex = cx + L * Math.cos(rad(ang)), ey = cy - L * Math.sin(rad(ang)); el('line', { x1: cx, y1: cy, x2: ex, y2: ey, stroke: col, 'stroke-width': 5, 'stroke-linecap': 'round' }, svg); el('circle', { cx: ex, cy: ey, r: 6, fill: col }, svg); };
          if (d === 0) { arr(0, BLUE); const ey = cy - 9; el('line', { x1: cx, y1: ey, x2: cx + 40, y2: ey, stroke: ORG, 'stroke-width': 5, 'stroke-linecap': 'round' }, svg); el('circle', { cx: cx + 40, cy: ey, r: 6, fill: ORG }, svg); } else { arr(0, BLUE); arr(d, ORG); }
          el('circle', { cx, cy, r: 4, fill: INK }, svg);
          const tx = cx + (d === 180 ? 62 : 58);
          el('text', { x: tx, y: cy - 4, fill: c, 'font-size': 26, 'font-weight': 700 }, svg, lab);
          el('text', { x: tx, y: cy + 24, fill: MUTE, 'font-size': 20 }, svg, `θ = ${d}°  →  cos = ${d === 0 ? '+1' : d === 90 ? '0' : '−1'}`);
        }
        el('circle', { cx: px, cy: py, r: 11, fill: c, stroke: '#fff', 'stroke-width': 3 }, svg);
      });
      if (step >= 3) el('text', { x: (X(180) + X(360)) / 2 + 60, y: Y(-1) + 0 - 12, 'text-anchor': 'middle', fill: MUTE, 'font-size': 20 }, svg, '兩向量夾角不會超過 180°');
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
    p.arrow(0, 0, proj[0], proj[1], { color: ORG, w: 9, head: 0.1 });
    p.arrow(0, 0, A[0], A[1], { color: BLUE, w: 5 });
    p.arrow(0, 0, B[0], B[1], { color: PUR, w: 5 });
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

/* ---------- normalisation plot ---------- */
(function () {
  const p = Plot($('#norm-plot'), { xmin: -1, xmax: 8, ymin: -1, ymax: 9, pad: 12 });
  p.grid(1, true, true);
  p.arrow(0, 0, 6, 8, { color: BLUE, w: 5 });
  p.arrow(0, 0, 0.6, 0.8, { color: ORG, w: 6, head: 12 });
  p.text(6, 8, 'v = [6, 8]', { color: BLUE, size: 22, weight: 700, dx: 12, dy: 4 });
  p.text(0.6, 0.8, 'u = [0.6, 0.8]', { color: ORG, size: 20, weight: 700, dx: 14, dy: 12 });
})();

/* ---------- excerpts and window counts ---------- */
(function () {
  const lines = [
    ['孩子', '跑', '到', '一邊', '去', '哭', '了', '這', '時', '王婆', '她', '該', '終止', '她', '的', '講說'],
    ['王婆', '半日', '的', '痛苦', '沒有', '代價', '了', '王婆', '一生', '的', '痛苦', '也', '都', '是', '沒有', '代價'],
    ['她', '的', '面孔', '有', '點', '像', '王婆', '腮骨', '很高', '眼睛', '和', '琉璃', '一般']
  ];
  const W = 3, box = $('#ex-lines'), counts = {};
  lines.forEach(t => {
    const d = document.createElement('div'); d.className = 'toks exl';
    t.forEach((w, i) => {
      const s = document.createElement('span'); s.className = 'tok'; s.textContent = w; s.dataset.i = i;
      if (w === '王婆') s.dataset.t = 1;
      d.appendChild(s);
    });
    t.forEach((w, i) => { if (w === '王婆') for (let j = Math.max(0, i - W); j <= Math.min(t.length - 1, i + W); j++) if (j !== i) { d.children[j].dataset.w = 1; counts[t[j]] = (counts[t[j]] || 0) + 1; } });
    box.appendChild(d);
  });
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  $('#ex-counts').innerHTML = entries.map(([w, c]) => `<span${c > 1 ? ' class="two"' : ''}>${w}<sup>${c}</sup></span>`).join('');
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
  el('text', { x: 140, y: 276, 'text-anchor': 'middle', fill: MUTE, 'font-size': 14 }, svg, '示意：藍色 = 非零，灰色 = 0');
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
      const pick = step === 2 ? best : step === 3 ? worst : null;
      $$('[data-c]', root).forEach(e => { const c = +e.dataset.c; e.classList.toggle('hl', !!pick && (c === pick.i || c === pick.j)); });
      const box = $('#movie-cos');
      box.classList.toggle('on', step >= 2);
      box.innerHTML = pick ? `<span>${names[pick.i]}</span> ↔ <span>${names[pick.j]}</span> <b>cos = ${fmt(pick.c)}</b> <em>${step === 2 ? '最相似' : '最不相似'}</em>` : '';
    }
  };
  $('#movie-cos').dataset.step = 2;
})();

/* ---------- gender / royalty construction: 1 dimension overlaps, 2 dimensions separate ---------- */
(function () {
  const svg = $('#gx-plot'), P = { 男: [-1, 0.02], 女: [1, 0.01], 皇帝: [-0.97, 1], 皇后: [0.99, 1] };
  const RED = '#d92d20';
  const notes = [
    ['只有一個維度「性別」：男 和 皇帝 幾乎<b>重疊</b>，女 和 皇后 也是。', 'One dimension only: man and emperor overlap; so do woman and empress.'],
    ['加上第二個維度「皇室」：重疊的詞<b>分開了</b>。更多維度 ＝ 更多空間。', 'Add a second dimension, royalty: the overlapping words separate. More dimensions = more room.'],
    ['每個詞都是一支從原點出發的箭頭。', 'Each word is an arrow from the origin.'],
    ['紅色箭頭：男 → 女 和 皇帝 → 皇后 是<b>同一個方向</b>。', 'Red: man → woman and emperor → empress are the same direction.'],
    ['所以：從皇后減去「女 − 男」，就回到皇帝。', 'So subtracting “woman − man” from empress lands on emperor.']
  ];
  const col = w => (w === '男' || w === '皇帝') ? BLUE : ORG;
  HOOKS['s-gender'] = {
    render(step, root) {
      const p = Plot(svg, { xmin: -1.45, xmax: 1.45, ymin: -0.55, ymax: 1.45, pad: 12 });
      p.clear();
      if (step === 0) {
        p.arrow(-1.4, 0, 1.4, 0, { color: '#9aa3b2', w: 3 });
        p.text(0, 0, '性別 gender →', { color: MUTE, size: 20, dy: 32, anchor: 'middle' });
        [['男', 34], ['皇帝', -22]].forEach(([w, dy]) => { p.dot(P[w][0], 0, { color: col(w), r: 11 }).setAttribute('opacity', 0.7); p.text(P[w][0], 0, w, { color: col(w), size: 26, weight: 700, dy, anchor: 'middle' }); });
        [['女', 34], ['皇后', -22]].forEach(([w, dy]) => { p.dot(P[w][0], 0, { color: col(w), r: 11 }).setAttribute('opacity', 0.7); p.text(P[w][0], 0, w, { color: col(w), size: 26, weight: 700, dy, anchor: 'middle' }); });
        [-0.985, 0.995].forEach(x => el('ellipse', { cx: p.X(x), cy: p.Y(0) - 4, rx: 50, ry: 68, fill: 'none', stroke: RED, 'stroke-width': 3, 'stroke-dasharray': '7 6' }, svg));
        p.text(0, 0, '重疊！overlap', { color: RED, size: 24, weight: 700, dy: -60, anchor: 'middle' });
      } else {
        p.grid(0.5, true);
        p.text(1.4, 0, '性別', { color: MUTE, size: 18, dy: 26, anchor: 'end' });
        p.text(0, 1.45, '皇室', { color: MUTE, size: 18, dx: 8, dy: 6 });
        if (step === 1) ['皇帝', '皇后'].forEach(w => {   // show the move from the overlapping position
          p.dot(P[w][0], 0, { color: col(w), r: 8 }).setAttribute('opacity', 0.3);
          p.arrow(P[w][0], 0.06, P[w][0], 0.9, { color: col(w), w: 2.5, dash: '5 6', head: 12 });
        });
        if (step >= 2) Object.keys(P).forEach(w => { const g = p.arrow(0, 0, ...P[w], { color: col(w), w: 4 }); if (step >= 3) g.setAttribute('opacity', 0.3); });
        if (step >= 3) p.arrow(-1, 0.02, 0.9, 0.012, { color: RED, w: 10, head: 26 });
        if (step === 3) { p.arrow(-0.97, 1, 0.9, 1, { color: RED, w: 10, head: 26 }); p.text(0, 1, '女 − 男', { color: RED, size: 24, weight: 700, dy: -20, anchor: 'middle' }); }
        if (step >= 3) p.text(0, 0.02, '女 − 男', { color: RED, size: 24, weight: 700, dy: -20, anchor: 'middle' });
        if (step >= 4) { p.arrow(0.99, 1, -0.88, 1, { color: RED, w: 10, head: 26 }); p.text(0, 1, '− (女 − 男)', { color: RED, size: 24, weight: 700, dy: -20, anchor: 'middle' }); }
        Object.keys(P).forEach(w => { p.dot(...P[w], { color: col(w), r: 10 }); p.text(...P[w], w, { color: col(w), size: 26, weight: 700, dy: P[w][1] > 0.5 ? -20 : 38, anchor: 'middle' }); });
      }
      $('#gx-table', root).classList.toggle('r2on', step >= 1);
      $('#gx-eq', root).style.visibility = step >= 4 ? 'visible' : 'hidden';
      $('#gx-note', root).innerHTML = `<span class="zh">${notes[step][0]}</span><span class="en">${notes[step][1]}</span>`;
    }
  };
  const i = document.createElement('i'); i.className = 'stepper'; i.dataset.step = 4; $('#s-gender').appendChild(i);
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
        pl.innerHTML = step > N ? `<span class="tot">共 <b>${total}</b> 個訓練樣本 training pairs</span>` : '';
        $('#w2v-note').innerHTML = step > N
          ? '<span class="zh">一句話就產生了幾十個（中心詞 → 語境詞）的配對；真實語料有數十億個。</span><span class="en">One sentence yields dozens of (target → context) pairs; a real corpus yields billions.</span>'
          : '<span class="zh">窗口（左右各 2 個字）滑過整段文本：藍色是<b>中心詞</b>，黃色是它的<b>語境</b>。</span><span class="en">A window (2 on each side) slides over the text: blue = target, yellow = context.</span>';
        return;
      }
      pl.innerHTML = ctxOf(c).map(t => `<span><b>${toks[c]}</b> → ${t}</span>`).join('') + `<span class="tot">累計 <b>${total}</b> 個樣本 pairs so far</span>`;
      $('#w2v-note').innerHTML = `<span class="zh">第 ${c + 1} / ${N} 個字：中心詞「<b>${toks[c]}</b>」，預測它周圍的字。</span><span class="en">Token ${c + 1} of ${N}: target “${toks[c]}”, predict its neighbours.</span>`;
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
  mk('poly-2', [['液體', 2.7, 0.55, MUTE], ['空洞', 0.8, 2.8, MUTE]], [['水（液體）', 2.4, 0.9, GRN, -20, -14], ['水（內容空洞）', 0.55, 2.35, ORG, 14, 18]]);
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
        `<div class="ustep">${step === 0 ? '開始：隨機向量 start: random' : `更新第 ${step} 輪 · update round ${step}`}</div>` +
        `<div><span>思 · 學 <small>鄰居 neighbour</small></span><b class="ok-c">${fmt(sp)}</b></div>` +
        `<div><span>思 · 香蕉 <small>隨機 random</small></span><b class="bad-c">${fmt(sn)}</b></div>`;
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
    ['開始：三個詞的向量方向都是隨機的。', 'Start: all three directions are random.'],
    ['每一輪，每個詞都被拉向自己的鄰居。', 'Each round, every word is pulled towards its neighbours.'],
    ['開心、愉快被拉向同一群鄰居……', '開心 and 愉快 are pulled towards the same neighbours…'],
    ['……牙刷被拉向完全不同的方向。', '…while 牙刷 is pulled elsewhere.'],
    ['結果：開心 ≈ 愉快，而牙刷遠離它們。', 'Result: 開心 ≈ 愉快, far from 牙刷.']
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
      $('#why-note').innerHTML = `<span class="zh">${notes[k][0]}</span><span class="en">${notes[k][1]}</span>`;
    }
  };
})();
