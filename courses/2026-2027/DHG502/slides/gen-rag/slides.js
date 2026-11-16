/* Slide-specific logic for the generation and retrieval deck (loaded before deck.js). */
window.HOOKS = {};
window.SECTIONS = [
  { id: 'lm',        zh: '語言模型',     en: 'What is a language model?' },
  { id: 'limits',    zh: '流暢不等於真實', en: 'Fluent is not true' },
  { id: 'rag',       zh: '檢索增強生成', en: 'Retrieval-augmented generation' },
  { id: 'retrieval', zh: '檢索',         en: 'Searching the passages' },
  { id: 'pilot',     zh: 'HistFig',      en: 'HistFig and last year’s pilot' },
  { id: 'inclass',   zh: '課堂練習',     en: 'In class: chat and check' },
  { id: 'essay',     zh: '作業與總結',   en: 'Essay and summary' }
];
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const SEAL = '#b03a2e', MUTE = '#7a7166', LINE = '#e4dccd', INK = '#26221d';
const fmt2 = n => n.toFixed(2);

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

/* ---------- tiny SVG helper ---------- */
const NS = 'http://www.w3.org/2000/svg';
function el(tag, attrs, parent, text) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  if (parent) parent.appendChild(e);
  return e;
}

/* ---------- the running example: scores (logits) for the next word ----------
   "The Wuchang Uprising of 1911 overthrew the ___"  (illustrative numbers) */
const NEXT = [['Qing', 2.4], ['Manchu', 1.4], ['monarchy', 1.0], ['Ming', 0.2], ['Yuan', -0.5], ['Tang', -1.2]];
const softmax = (zs, T = 1) => { const m = Math.max(...zs), e = zs.map(z => Math.exp((z - m) / T)), s = e.reduce((a, b) => a + b, 0); return e.map(x => x / s); };

/* ---------- next token, step by step ---------- */
(function () {
  const PREFIX = 'The Wuchang Uprising of 1911 began a revolution that ended';
  // each step: candidates [token, p] and the index of the token that is chosen (illustrative numbers)
  const STEPS = [
    { c: [['two', 0.41], ['the', 0.27], ['imperial', 0.14], ['Qing', 0.11], ['China’s', 0.04]], pick: 0 },
    { c: [['thousand', 0.83], ['centuries', 0.08], ['millennia', 0.04], ['hundred', 0.02], ['decades', 0.01]], pick: 0 },
    { c: [['years', 0.92], ['-year', 0.04], ['long', 0.02], ['odd', 0.01], ['and', 0.01]], pick: 0 },
    { c: [['of', 0.87], ['.', 0.06], ['in', 0.03], ['under', 0.02], [',', 0.01]], pick: 0 },
    { c: [['imperial', 0.54], ['dynastic', 0.21], ['monarchical', 0.12], ['Chinese', 0.08], ['autocratic', 0.03]], pick: 1, note: 'Sampled: “dynastic” was not the most likely token. That is why the same question can get different answers.' },
    { c: [['rule', 0.88], ['government', 0.05], ['history', 0.03], ['tradition', 0.02], ['power', 0.01]], pick: 0 }
  ];
  const sp = t => (/^[.,]/.test(t) ? t : ' ' + t);
  window.HOOKS['s-next'] = {
    render(step) {
      const k = Math.min(step, STEPS.length);
      // tokens generated so far
      const gen = STEPS.slice(0, k).map(s => s.c[s.pick][0]);
      $('#nt-sent').innerHTML = `<span class="pre">${PREFIX}</span>` +
        gen.map((t, i) => `<span class="gen${i === k - 1 ? ' new' : ''}">${sp(t)}</span>`).join('') +
        (k < STEPS.length ? '<span class="caret">▍</span>' : '');
      // candidates: at step 0 the options for token 1; at step k the options that were weighed for token k
      const show = k === 0 ? STEPS[0] : STEPS[k - 1];
      const chosen = k === 0 ? -1 : show.pick;
      const max = Math.max(...show.c.map(x => x[1]));
      $('#nt-cands').innerHTML = `<div class="nt-h">${k === 0 ? 'Which token comes next?' : `Step ${k}: probabilities for the next token`}</div>` +
        show.c.map(([t, p], i) => `<div class="nt-row${i === chosen ? ' pick' : ''}"><b>${t === '.' ? '“.”' : t === ',' ? '“,”' : t}</b><span class="nt-bar" style="width:${Math.round(470 * p / max)}px"></span><em>${Math.round(p * 100)}%</em></div>`).join('');
      $('#nt-note').textContent = k > 0 && show.note ? show.note : '';
    }
  };
})();

/* ---------- three training stages, each with its own looping animation ---------- */
(function () {
  // 1 · pre-training: walk through a sentence, guess each next word, then reveal it
  const SENT = ['The', 'Qing', 'dynasty', 'ruled', 'China', 'from', '1644', 'to', '1912', '.'];
  const GUESS = [null, 'Ming', 'dynasty', 'China', 'for', 'from', '1636', 'to', '1911', '.'];
  // 2 · instruction tuning: a base model rambles; an answer written by a person replaces it
  const Q = 'When did the Qing dynasty end?';
  const RAMBLE = 'When did the Ming dynasty end? When did the Yuan dynasty end? Quiz 3, chapter 7 …';
  const GOOD = 'The Qing dynasty ended in 1912, when the young emperor Puyi abdicated.';
  // 3 · preference tuning: two answers, a person picks one
  const A = 'In 1912.';
  const B = 'In February 1912, when the six-year-old Puyi abdicated and the Republic of China took over.';
  let t = 0, timer = null;
  const slide = document.getElementById('s-chat');
  function frame1(k) {
    const n = SENT.length, pos = 1 + Math.floor(k / 2) % (n - 1), reveal = k % 2 === 1;
    const words = SENT.map((w, i) => i < pos ? `<span class="w">${w}</span>` : i === pos ? (reveal ? `<span class="w ${GUESS[i] === w ? 'ok' : 'bad'}">${w}</span>` : '<span class="w gap">?</span>') : '<span class="w hid">▒▒</span>').join(' ');
    const g = GUESS[pos], ok = g === SENT[pos];
    return `<div class="p1s">${words}</div><div class="p1g">model’s guess: <b>${g}</b>${reveal ? (ok ? ' <span class="okc">✓ correct</span>' : ` <span class="badc">✗ it was “${SENT[pos]}”: adjust the weights</span>`) : ''}</div>`;
  }
  function frame2(k) {
    const c = k % 14;
    const typed = (txt, f) => txt.slice(0, Math.min(txt.length, Math.round(txt.length * f)));
    if (c < 6) return `<div class="p2a base"><span>base model, plain text</span>${Q} <i class="ramble">${typed(RAMBLE, (c + 1) / 4)}</i></div><div class="p2n">it continues the text; it does not answer</div>`;
    return `<div class="p2t"><span>training example in the chat template</span>
      <div><b class="role sys">system</b>You are a helpful assistant.</div>
      <div><b class="role usr">user</b>${Q}</div>
      <div><b class="role ast">assistant</b>${typed(GOOD, (c - 5) / 4)}</div></div>`;
  }
  function frame3(k) {
    const c = k % 10, pick = c >= 3, push = c >= 6;
    return `<div class="p2q"><span>question</span>${Q}</div>
      <div class="p3a${pick ? ' lose' : ''}"><i>A</i>${A}</div>
      <div class="p3a${pick ? ' win' : ''}"><i>B</i>${B}${pick ? '<em>👍 preferred</em>' : ''}</div>
      <div class="p3r${push ? ' on' : ''}">answers like B become more likely <span class="p3bar"><span style="width:${push ? 82 : 50}%"></span></span></div>`;
  }
  function tick() {
    if (!slide.classList.contains('active')) { clearInterval(timer); timer = null; return; }
    t++;
    $('#tr1-box').innerHTML = frame1(t);
    $('#tr2-box').innerHTML = frame2(t);
    $('#tr3-box').innerHTML = frame3(t);
  }
  window.HOOKS['s-chat'] = {
    render(step) {
      $$('#s-chat .tr').forEach((d, i) => d.classList.toggle('live', step === i + 1));
      if (!timer) { tick(); timer = setInterval(tick, 900); }
    }
  };
})();

/* ---------- temperature: a rectangle whose areas are the probabilities; darts sample from it ----------
   (after visualizations/softmax-temperature.html: treemap + sampling dot) */
(function () {
  const svg = $("#tp-map"), W = 640, H = 330;
  const COLS = ['#b03a2e', '#d0703f', '#e0a050', '#7d9f5a', '#4f86b5', '#8e6bb5'];
  let T = 1.0, darts = [], hist = [];
  // squarified treemap of values (summing to 1) into rect [x, y, w, h]
  function squarify(vals, x, y, w, h) {
    const out = new Array(vals.length);
    const items = vals.map((v, i) => ({ v: v * w * h, i })).sort((a, b) => b.v - a.v);
    const worst = (row, side) => { const s = row.reduce((a, r) => a + r.v, 0); let m = 0; row.forEach(r => { m = Math.max(m, side * side * r.v / (s * s), s * s / (side * side * r.v)); }); return m; };
    let row = [];
    const layRow = () => {
      const s = row.reduce((a, r) => a + r.v, 0);
      if (w >= h) { const rw = s / h; let yy = y; row.forEach(r => { const rh = r.v / rw; out[r.i] = [x, yy, rw, rh]; yy += rh; }); x += rw; w -= rw; }
      else { const rh = s / w; let xx = x; row.forEach(r => { const rw = r.v / rh; out[r.i] = [xx, y, rw, rh]; xx += rw; }); y += rh; h -= rh; }
      row = [];
    };
    items.forEach(it => {
      const side = Math.min(w, h);
      if (row.length && worst(row.concat(it), side) > worst(row, side)) layRow();
      row.push(it);
    });
    if (row.length) layRow();
    return out;
  }
  let cells = [];
  const draw = () => {
    const p = softmax(NEXT.map(x => x[1]), T);
    $('#tp-T').textContent = T.toFixed(1);
    $('#tp-knob').style.left = `${(T - 0.1) / (3 - 0.1) * 100}%`;
    cells = squarify(p, 0, 0, W, H);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    cells.forEach(([x, y, w, h], i) => {
      el('rect', { x: x + 1.5, y: y + 1.5, width: Math.max(0, w - 3), height: Math.max(0, h - 3), rx: 4, fill: COLS[i], 'fill-opacity': 0.85 }, svg);
      if (w > 46 && h > 30) {
        const fs = Math.max(14, Math.min(34, Math.sqrt(w * h) / 6));
        el('text', { x: x + w / 2, y: y + h / 2 - (h > 64 ? fs * 0.25 : -fs * 0.35), 'text-anchor': 'middle', 'font-size': fs, 'font-family': 'Iowan Old Style, Palatino, Georgia, serif', fill: '#fff' }, svg, NEXT[i][0]);
        if (h > 64) el('text', { x: x + w / 2, y: y + h / 2 + fs * 0.85, 'text-anchor': 'middle', 'font-size': Math.max(13, fs * 0.6), fill: '#fff', 'fill-opacity': 0.9 }, svg, (100 * p[i]).toFixed(p[i] < 0.1 ? 1 : 0) + '%');
      }
    });
    darts.forEach(([x, y], k) => {
      const last = k === darts.length - 1;
      el('circle', { cx: x, cy: y, r: last ? 9 : 5, fill: last ? '#1f5fd6' : '#fff', stroke: last ? '#fff' : '#1b2333', 'stroke-width': last ? 3 : 1.5, class: last ? 'dart-new' : '' }, svg);
    });
    const last = hist.slice(-7).reverse();
    $('#tp-out').innerHTML = last.length ? last.map((s, i) => `<div class="${i === 0 ? 'new' : ''}">… overthrew the <b class="${s.rank > 2 ? 'odd' : ''}">${s.w}</b> <small>T=${s.T.toFixed(1)}</small></div>`).join('')
      : '<div class="empty">Press <kbd>S</kbd> to throw a dart at the rectangle.</div>';
    if (hist.length) {
      const c = {}; hist.forEach(s => { c[s.w] = (c[s.w] || 0) + 1; });
      $('#tp-count').innerHTML = `<span>${hist.length} darts:</span>` + NEXT.filter(([w]) => c[w]).map(([w]) => `<i>${w} ${c[w]}</i>`).join('');
    } else $('#tp-count').innerHTML = '';
  };
  const throwDart = () => {
    const x = Math.random() * W, y = Math.random() * H;
    let i = cells.findIndex(([cx, cy, w, h]) => x >= cx && x < cx + w && y >= cy && y < cy + h);
    if (i < 0) i = 0;
    darts.push([x, y]);
    hist.push({ w: NEXT[i][0], T, rank: i });
  };
  // drag the knob (or click the track) to set T; the stage is scaled, so use the track's on-screen box
  (function () {
    const track = $('#s-temp .tp-track'); let drag = false;
    const setFrom = e => {
      const r = track.getBoundingClientRect();
      const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      const t = +(0.1 + f * 2.9).toFixed(1);
      if (t !== T) { T = t; darts = []; draw(); }
    };
    track.addEventListener('pointerdown', e => { drag = true; track.setPointerCapture(e.pointerId); setFrom(e); e.stopPropagation(); });
    track.addEventListener('pointermove', e => { if (drag) setFrom(e); });
    track.addEventListener('pointerup', () => { drag = false; });
    track.addEventListener('click', e => e.stopPropagation());
  })();
  window.HOOKS['s-temp'] = {
    render: draw,
    key(e) {
      // a new temperature moves the areas, so the darts on the board are cleared (the list of words is kept)
      if (e.key === 'ArrowUp') { T = Math.min(3, +(T + 0.1).toFixed(1)); darts = []; return true; }
      if (e.key === 'ArrowDown') { T = Math.max(0.1, +(T - 0.1).toFixed(1)); darts = []; return true; }
      if (e.key === 's' || e.key === 'S') { throwDart(); return true; }
      if (e.key === 'r' || e.key === 'R') { for (let i = 0; i < 20; i++) throwDart(); return true; }
      if (e.key === 'c' || e.key === 'C') { darts = []; hist = []; return true; }
      return false;
    }
  };
})();

/* ---------- interactive cosine, copied from the Week 9 deck (own scope: its helpers and colours) ---------- */
(function () {
  const BAD_C = '#b42318', BLUE = '#1f5fd6', ORG = '#e0570f', GRN = '#157a3c', PUR = '#7c3aed', GLD = '#d99a00', MUTE = '#6a7386', LINE = '#dde1e8', INK = '#1b2333';
  const fmt = n => (Math.round(n * 100) / 100).toString().replace('-', '−');
  const rad = d => d * Math.PI / 180;
  const dotp = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
  const norm = a => Math.sqrt(dotp(a, a));
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
})();

/* ---------- map of the Lu Xun passages (real embeddings, PCA to 2D) ---------- */
(function () {
  const R = window.RAG; if (!R) return;
  const svg = $('#map-plot'), W = 560, Hh = 470, pad = 18;
  const COL = ['#8a7a63', '#2f6db5', '#2a9d8f', '#5b8c3a', '#8e5bb5', SEAL];
  const pts = []; for (let i = 0; i < R.pts.length; i += 3) pts.push([R.pts[i], R.pts[i + 1], R.pts[i + 2]]);
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const xmin = Math.min(...xs), xmax = Math.max(...xs), ymin = Math.min(...ys), ymax = Math.max(...ys);
  const legH = 96;
  const s = Math.min((W - 2 * pad) / (xmax - xmin), (Hh - 2 * pad - legH) / (ymax - ymin));
  const X = x => pad + (x - xmin) * s + ((W - 2 * pad) - (xmax - xmin) * s) / 2;
  const Y = y => Hh - pad - (y - ymin) * s;
  el('rect', { x: 0.75, y: 0.75, width: W - 1.5, height: Hh - 1.5, rx: 12, fill: '#fffdf8', stroke: LINE, 'stroke-width': 1.5 }, svg);
  const gPts = el('g', {}, svg);
  pts.forEach(([x, y, d]) => el('circle', { cx: X(x), cy: Y(y), r: 2.6, fill: COL[d], 'fill-opacity': 0.42 }, gPts));
  // legend
  const gL = el('g', {}, svg);
  R.docs.forEach((d, i) => {
    const lx = 16 + (i % 2) * 272, ly = 18 + Math.floor(i / 2) * 20;
    el('circle', { cx: lx + 5, cy: ly - 5, r: 5, fill: COL[i] }, gL);
    el('text', { x: lx + 15, y: ly, 'font-size': 14, fill: INK }, gL, d);
  });
  const gK = el('g', {}, svg);
  el('path', { d: star(24, 92, 9, 4), fill: '#f2b705', stroke: INK, 'stroke-width': 1.2 }, gK);
  el('text', { x: 38, y: 97, 'font-size': 14, 'font-weight': 600, fill: INK }, gK, 'the question');
  el('circle', { cx: 160, cy: 92, r: 8, fill: '#8a7a63', stroke: '#fff', 'stroke-width': 1.5 }, gK);
  el('text', { x: 160, y: 96, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 700, fill: '#fff' }, gK, '1');
  el('text', { x: 174, y: 97, 'font-size': 14, 'font-weight': 600, fill: INK }, gK, 'a retrieved passage');
  el('circle', { cx: 336, cy: 92, r: 3, fill: '#8a7a63', 'fill-opacity': 0.6 }, gK);
  el('text', { x: 346, y: 97, 'font-size': 14, fill: INK }, gK, 'any other passage');
  const dyn = el('g', {}, svg);
  let qi = 0;
  const draw = () => {
    while (dyn.firstChild) dyn.removeChild(dyn.firstChild);
    const q = R.queries[qi], qx = X(q.xy[0]), qy = Y(q.xy[1]);
    // screen positions of the hits; push any hit hidden under the star outwards (illustrative data)
    const HP = q.hits.map((h, k) => {
      const p = pts[h.i]; let x = X(p[0]), y = Y(p[1]);
      const dx = x - qx, dy = y - qy, d = Math.hypot(dx, dy);
      if (d < 34) { const a = d > 1 ? Math.atan2(dy, dx) : (k * 2.4); x = qx + 34 * Math.cos(a); y = qy + 34 * Math.sin(a); }
      return [x, y, p[2]];
    });
    HP.forEach(([x, y]) => el('line', { x1: qx, y1: qy, x2: x, y2: y, stroke: INK, 'stroke-width': 1.6, 'stroke-opacity': 0.55 }, dyn));
    el('path', { d: star(qx, qy, 15, 6.5), fill: '#f2b705', stroke: INK, 'stroke-width': 1.6 }, dyn);
    HP.forEach(([x, y, d], k) => {
      el('circle', { cx: x, cy: y, r: 10, fill: COL[d], stroke: '#fff', 'stroke-width': 2 }, dyn);
      el('text', { x, y: y + 4.5, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#fff' }, dyn, k + 1);
    });
    // label the star
    const ly = qy + 62, lx = qx - 60;
    el('line', { x1: qx, y1: qy + 14, x2: qx - 8, y2: ly - 16, stroke: INK, 'stroke-width': 1.5 }, dyn);
    el('text', { x: lx, y: ly, 'font-size': 18, 'font-weight': 700, fill: INK, stroke: '#fffdf8', 'stroke-width': 5, 'paint-order': 'stroke' }, dyn, 'your question');
    $('#map-q').innerHTML = `<span>question ${qi + 1} of ${R.queries.length}</span>${q.q.match(/[一-鿿]/) ? `<b class="zhs">${q.q}</b>` : `“${q.q}”`}`;
    $('#map-hits').innerHTML = q.hits.map((h, k) => `<div class="mh"><i style="background:${COL[R.docs.indexOf(h.doc)]}">${k + 1}</i><div><b>${h.doc}, part ${h.part}</b> <em>${h.sim.toFixed(2)}</em><p>${h.text}</p></div></div>`).join('');
  };
  function star(cx, cy, r1, r2) {
    let d = '';
    for (let i = 0; i < 10; i++) { const r = i % 2 ? r2 : r1, a = -Math.PI / 2 + i * Math.PI / 5; d += (i ? 'L' : 'M') + (cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1); }
    return d + 'Z';
  }
  window.HOOKS['s-map'] = {
    render: draw,
    key(e) {
      if (e.key === 'q' || e.key === 'Q') { qi = (qi + 1) % R.queries.length; return true; }
      if (e.key === 'a' || e.key === 'A') { qi = (qi + R.queries.length - 1) % R.queries.length; return true; }
      return false;
    }
  };
})();

/* ---------- RAG pipeline: an animated diagram ---------- */
(function () {
  const slide = document.getElementById('s-pipe');
  const bars = [0.5, -0.8, 0.66, 0.2, -0.35, 0.9, -0.6, 0.15, 0.75, -0.25, 0.4, -0.7, 0.3, 0.55];
  $('#pv-bars').innerHTML = bars.map(v => `<span class="${v < 0 ? 'neg' : ''}" style="height:${Math.abs(v) * 34}px"></span>`).join('');
  const N = 66, TOP = [41, 7, 58, 23, 34];
  $('#pv-db').innerHTML = Array.from({ length: N }, (_, i) => `<span data-i="${i}"></span>`).join('');
  const cells = $$('#pv-db span');
  const TOPS = [['孙中山全集', 0.66], ['Bergère', 0.64], ['Wikipedia', 0.60], ['孙中山全集', 0.58], ['建国方略', 0.52]];
  $('#pv-top').innerHTML = TOPS.map(([d, v], k) => `<div class="tc"><b>[${k + 1}]</b>${d}<em>${v.toFixed(2)}</em></div>`).join('');
  const ANS = [['我讓出臨時大總統之位，是為了南北統一', 1], ['。誰知不過兩年，國會被解散', 4], ['，他竟要做皇帝', 3], ['。所以我說，革命尚未成功', 2], ['。', 0]];
  let timers = [];
  const clear = () => { timers.forEach(t => clearInterval(t)); timers = []; };
  const live = () => slide.classList.contains('active');
  function scan(done) {
    let k = 0;
    const t = setInterval(() => {
      if (!live()) return clear();
      cells.forEach(c => c.classList.remove('scan'));
      if (k < 14) { for (let j = 0; j < 6; j++) cells[(k * 7 + j * 11) % N].classList.add('scan'); k++; }
      else { clearInterval(t); done(); }
    }, 90);
    timers.push(t);
  }
  const showTop = on => cells.forEach((c, i) => { const r = TOP.indexOf(i); c.classList.toggle('hit', on && r >= 0); c.textContent = on && r >= 0 ? r + 1 : ''; });
  function type() {
    const full = ANS.map(([t, n]) => t + (n ? `<sup>${n}</sup>` : '')).join('');
    const plain = ANS.map(([t]) => t).join('');
    let k = 0;
    $('#pv-llm').classList.add('busy');
    const t = setInterval(() => {
      if (!live()) return clear();
      k += 2;
      // rebuild the visible prefix, inserting footnotes once their sentence is complete
      let out = '', used = 0;
      for (const [txt, n] of ANS) {
        if (used >= k) break;
        const part = txt.slice(0, Math.max(0, k - used)); out += part; used += txt.length;
        if (used <= k && n) out += `<sup>${n}</sup>`;
      }
      $('#pv-ans').innerHTML = out + (k < plain.length ? '<span class="caret">▍</span>' : '');
      if (k >= plain.length) { clearInterval(t); $('#pv-llm').classList.remove('busy'); $('#pv-ans').innerHTML = full; }
    }, 70);
    timers.push(t);
  }
  let last = -1;
  window.HOOKS['s-pipe'] = {
    render(step) {
      if (step === last) return;
      clear();
      showTop(step >= 3 && !(step === 3 && last < 3));
      if (step === 3 && last < 3) scan(() => showTop(true));
      if (step >= 6) { if (last < 6) { $('#pv-ans').innerHTML = ''; type(); } } else { $('#pv-ans').innerHTML = ''; $('#pv-llm').classList.remove('busy'); }
      if (step >= 6 && last >= 6) $('#pv-ans').innerHTML = ANS.map(([t, n]) => t + (n ? `<sup>${n}</sup>` : '')).join('');
      last = step;
    }
  };
})();

/* ---------- keyword search: matched words light up, scores grow ---------- */
(function () {
  const W = { chen: 3.9, jiongming: 4.2, revolt: 2.1, '1922': 1.9 };
  const PS = [
    'In 1922 Chen Jiongming turned against Sun; the revolt drove him from Guangzhou.',
    'Chen Jiongming had governed Guangdong since 1920 and favoured a federal China.',
    'The Guangdong army rose in revolt in 1922 and forced Sun onto a gunboat.',
    'Sun returned to Guangzhou in 1917 to set up a rival government.'
  ];
  const score = p => p.split(/[^A-Za-z0-9]+/).reduce((s, w) => s + (W[w.toLowerCase()] || 0), 0);
  const max = Math.max(...PS.map(score));
  $('#kw-ps').innerHTML = PS.map((p, i) => {
    const html = p.replace(/[A-Za-z0-9]+/g, w => W[w.toLowerCase()] ? `<mark>${w}</mark>` : w);
    const sc = score(p);
    return `<div class="kwp" data-step="${i < 2 ? 2 : 3}"><p>${html}</p><span class="kwbar"><span style="width:${Math.round(240 * sc / max)}px"></span></span><em>${sc.toFixed(1)}</em></div>`;
  }).join('');
})();

/* ---------- reciprocal rank fusion ---------- */
(function () {
  const P = { P1: 'Chen’s revolt, 1922', P2: 'Chen governs Guangdong', P3: 'army revolts; Sun flees', P4: 'rival government, 1917', P5: 'mutiny in the south', P6: 'Northern Expedition plans' };
  const V = ['P3', 'P5', 'P1', 'P6', 'P2'], B = ['P1', 'P2', 'P4', 'P3', 'P6'];
  const sc = {};
  V.forEach((p, i) => { sc[p] = (sc[p] || 0) + 1 / (61 + i); });
  B.forEach((p, i) => { sc[p] = (sc[p] || 0) + 1 / (61 + i); });
  const M = Object.keys(sc).sort((a, b) => sc[b] - sc[a]);
  const card = (p, k, extra = '') => `<div class="rc" data-p="${p}"><i>${k + 1}</i><b>${p}</b><span>${P[p]}</span>${extra}</div>`;
  $('#rrf-v').insertAdjacentHTML('beforeend', V.map((p, k) => card(p, k)).join(''));
  $('#rrf-b').insertAdjacentHTML('beforeend', B.map((p, k) => card(p, k)).join(''));
  $('#rrf-m').insertAdjacentHTML('beforeend', M.map((p, k) => card(p, k, `<em>${(sc[p] * 1000).toFixed(1)}</em><u style="width:${Math.round(sc[p] * 1000 * 3)}px"></u>`)).join(''));
  const svg = $('#rrf-lines');
  const box = () => document.querySelector('#s-rrf .rrfv').getBoundingClientRect();
  function lines(step) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    $('#rrf-v').classList.toggle('on', step >= 1); $('#rrf-b').classList.toggle('on', step >= 1);
    $('#rrf-m').classList.toggle('on', step >= 2);
    if (step < 2) return;
    const R = box(), k = R.width / 1108;
    const pos = (col, p, side) => { const e = document.querySelector(`#${col} .rc[data-p="${p}"]`); if (!e) return null; const r = e.getBoundingClientRect(); return [((side ? r.right : r.left) - R.left) / k, (r.top + r.height / 2 - R.top) / k]; };
    M.forEach(p => {
      [['rrf-v', '#2f6db5', 1, 0], ['rrf-b', '#8e5bb5', 0, 1]].forEach(([c, col, sa, sm]) => {
        const a = pos(c, p, sa), m = pos('rrf-m', p, sm); if (!a || !m) return;
        const dx = (m[0] - a[0]) / 2;
        el('path', { d: `M${a[0]},${a[1]} C${a[0] + dx},${a[1]} ${m[0] - dx},${m[1]} ${m[0]},${m[1]}`, fill: 'none', stroke: col, 'stroke-width': 2.2, 'stroke-opacity': 0.55 }, svg);
      });
    });
  }
  window.HOOKS['s-rrf'] = { render(step) { requestAnimationFrame(() => lines(step)); } };
})();

/* ---------- laser pointer: press L to swap the cursor for a red dot; L again to turn it off.
   G opens the page-number box to jump to a slide. ---------- */
(function () {
  const run = () => {
    const stage = document.getElementById('stage');
    const dot = document.createElement('div');
    dot.id = 'laser';
    stage.appendChild(dot);
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
