/* Slide-specific logic for the generation and retrieval deck (loaded before deck.js). */
window.HOOKS = {};
window.SECTIONS = [
  { id: 'lm',        zh: '解碼器',       en: 'Decoders' },
  { id: 'head',      zh: '從向量到詞',   en: 'From a vector to a word' },
  { id: 'limits',    zh: '流暢不等於真實', en: 'Fluent is not true' },
  { id: 'rag',       zh: '檢索增強生成', en: 'Retrieval-augmented generation' },
  { id: 'retrieval', zh: '檢索',         en: 'Searching the passages' },
  { id: 'pilot',     zh: 'HistFig',      en: 'HistFig and last year’s pilot' },
  { id: 'inclass',   zh: '課堂練習',     en: 'In class: chat and check' },
  { id: 'summary',   zh: '總結',         en: 'Summary' }
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

/* ---------- the running example: 寒塘渡鶴影，冷月葬＿ (Honglou meng, ch. 76) ----------
   h = [2, 1, 0, -1]; the five columns of W_U; scores z = h · w (toy numbers) */
const H = [2, 1, 0, -1];
const WU = [['花', [1, 2, 1, -1]], ['詩', [2, 0, 1, 0]], ['香', [1, 1, 2, 1]], ['孤', [0, 1, -1, 0]], ['劍', [-1, 0, 2, 0]]];
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const NEXT = WU.map(([w, v]) => [w, dot(H, v)]);   // 5, 4, 2, 1, -2
const neg = n => String(n).replace('-', '−');
const softmax = (zs, T = 1) => { const m = Math.max(...zs), e = zs.map(z => Math.exp((z - m) / T)), s = e.reduce((a, b) => a + b, 0); return e.map(x => x / s); };

/* ---------- next token: the same sentence, different contexts on the left ---------- */
(function () {
  const BASE = '這是一個很有意思的';
  const WORDS = ['地方', '遊戲', '故事', '電影', '人'];
  // each step: the context added on the left and the probabilities of the five words (illustrative numbers)
  const STEPS = [
    { ctx: '', p: [0.2, 0.2, 0.2, 0.2, 0.2], note: '沒有上文：五個詞一樣可能，各 20%（均勻分佈）。' },
    { ctx: '我昨天讀完了它。', p: [0.04, 0.07, 0.76, 0.05, 0.08], note: '「讀完了」：最可能的是「故事」。' },
    { ctx: '我昨天去過那裡。', p: [0.82, 0.05, 0.05, 0.04, 0.04], note: '「去過那裡」：最可能的是「地方」。' },
    { ctx: '我昨天在電影院看了它。', p: [0.02, 0.03, 0.08, 0.86, 0.01], note: '「在電影院看了」：最可能的是「電影」。' }
  ];
  window.HOOKS['s-next'] = {
    render(step) {
      // two clicks per context: the context appears and the bars wait ("？"); the next click reveals them
      const S = STEPS[Math.min(Math.ceil(step / 2), STEPS.length - 1)];
      const hide = step % 2 === 1 && step < 7;
      const best = hide ? -1 : S.p.indexOf(Math.max(...S.p));
      $('#nt-sent').innerHTML = `<span class="ctxslot${S.ctx ? '' : ' empty'}">${S.ctx ? `<span class="ctx">${S.ctx}</span>` : '（沒有上文）'}</span><span class="pre">${BASE}</span><span class="gap">＿＿</span>`;
      $('#nt-cands').innerHTML = `<div class="nt-h">下一個詞元的機率</div>` +
        WORDS.map((w, i) => `<div class="nt-row${step > 0 && i === best ? ' pick' : ''}"><b>${w}</b><span class="nt-bar" style="width:${hide ? 0 : Math.round(560 * S.p[i])}px"></span><em>${hide ? '？' : Math.round(S.p[i] * 100) + '%'}</em></div>`).join('');
      $('#nt-note').textContent = hide ? '先猜一猜：加了這句上文，哪一個詞最可能？' : S.note;
    }
  };
})();

/* ---------- inside the decoder: tokens → embeddings → 12 masked layers → the last vector h → W_U ---------- */
(function () {
  const svg = $('#dstack-svg'), T = ['寒', '塘', '渡', '鶴', '影', '，', '冷', '月', '葬'];
  const BLUE = '#2f6db5', LAST = T.length - 1;
  const X = i => 120 + i * 62;
  const rowY = { tok: 470, emb: 422, l1: 362, l2: 304, l12: 210, out: 150 };
  const txt = (g, x, y, s, a = {}) => el('text', Object.assign({ x, y, 'text-anchor': 'middle', 'font-family': 'PingFang TC, Noto Sans TC, sans-serif' }, a), g, s);
  const lab = (y, s, step) => txt(step == null ? svg : el('g', { 'data-step': step }, svg), 62, y + 6, s, { 'font-size': 16, fill: MUTE, 'text-anchor': 'end', 'font-weight': 600 });
  // tokens
  lab(rowY.tok, '詞元');
  T.forEach((t, i) => {
    el('rect', { x: X(i) - 25, y: rowY.tok - 20, width: 50, height: 40, rx: 8, fill: i === LAST ? '#f6e3d6' : '#e7f0f9', stroke: i === LAST ? SEAL : BLUE, 'stroke-width': 1.8 }, svg);
    txt(svg, X(i), rowY.tok + 8, t, { 'font-size': 23, fill: INK, 'font-family': 'Songti TC, Noto Serif TC, serif' });
  });
  // static embeddings
  const ge = el('g', { 'data-step': 1 }, svg); lab(rowY.emb, '嵌入', 1);
  T.forEach((_, i) => {
    [0, 1, 2].forEach(k => el('rect', { x: X(i) - 20 + k * 14, y: rowY.emb - 8, width: 12, height: 16, rx: 3, fill: BLUE, opacity: [.35, .6, .85][(k + i) % 3] }, ge));
    el('line', { x1: X(i), y1: rowY.tok - 20, x2: X(i), y2: rowY.emb + 8, stroke: '#c9bfae' }, ge);
  });
  // a masked layer: position i only receives lines from positions j <= i
  function layer(y0, y1, step, name) {
    const g = el('g', { 'data-step': step }, svg); lab(y1, name, step);
    T.forEach((_, i) => T.forEach((__, j) => { if (j <= i) el('line', { x1: X(j), y1: y0 - 10, x2: X(i), y2: y1 + 12, stroke: '#cfc5b4', 'stroke-width': .8 }, g); }));
    T.forEach((_, i) => el('circle', { cx: X(i), cy: y1, r: 11, fill: '#fff', stroke: i === LAST ? SEAL : BLUE, 'stroke-width': 2.2 }, g));
    return g;
  }
  layer(rowY.emb, rowY.l1, 2, '第 1 層');
  layer(rowY.l1, rowY.l2, 2, '第 2 層');
  const g3 = el('g', { 'data-step': 3 }, svg);
  T.forEach((_, i) => txt(g3, X(i), (rowY.l2 + rowY.l12) / 2 + 8, '⋮', { 'font-size': 24, fill: MUTE }));
  layer(rowY.l2 - 40, rowY.l12, 3, '第 12 層');
  // output: only the last position is used to predict the next token
  const go = el('g', { 'data-step': 4 }, svg); lab(rowY.out, '輸出', 4);
  T.forEach((_, j) => el('line', { x1: X(j), y1: rowY.l2 - 50, x2: X(LAST), y2: rowY.l12 + 12, stroke: SEAL, 'stroke-width': 2.2, opacity: .55 }, go));
  T.forEach((_, i) => {
    const last = i === LAST;
    [0, 1, 2].forEach(k => el('rect', { x: X(i) - 20 + k * 14, y: rowY.out - 8, width: 12, height: 16, rx: 3, fill: last ? SEAL : '#c9bfae', opacity: last ? [.55, .95, .75][k] : .45 }, go));
    el('line', { x1: X(i), y1: rowY.l12 - 12, x2: X(i), y2: rowY.out + 8, stroke: '#c9bfae' }, go);
  });
  el('rect', { x: X(LAST) - 30, y: rowY.out - 20, width: 60, height: 40, rx: 9, fill: 'none', stroke: SEAL, 'stroke-width': 2.5 }, go);
  txt(go, X(LAST) + 46, rowY.out + 9, 'h', { 'font-size': 28, 'font-style': 'italic', 'font-weight': 700, fill: '#7c3aed', 'font-family': 'Georgia, serif' });
  // h × W_U → softmax → 花
  const gw = el('g', { 'data-step': 5 }, svg);
  el('line', { x1: X(LAST), y1: rowY.out - 22, x2: X(LAST), y2: 62, stroke: SEAL, 'stroke-width': 3 }, gw);
  el('polygon', { points: `${X(LAST)},50 ${X(LAST) - 8},66 ${X(LAST) + 8},66`, fill: SEAL }, gw);
  const tw = txt(gw, X(LAST) - 14, 104, '× W', { 'font-size': 20, fill: SEAL, 'text-anchor': 'end', 'font-weight': 600 });
  const sub = document.createElementNS(NS, 'tspan'); sub.setAttribute('baseline-shift', 'sub'); sub.setAttribute('font-size', '14'); sub.textContent = 'U'; tw.appendChild(sub);
  const t2 = document.createElementNS(NS, 'tspan'); t2.textContent = '，softmax'; tw.appendChild(t2);
  el('rect', { x: X(LAST) - 30, y: 4, width: 60, height: 46, rx: 9, fill: SEAL }, gw);
  txt(gw, X(LAST), 38, '花', { 'font-size': 30, fill: '#fff', 'font-family': 'Songti TC, Noto Serif TC, serif', 'font-weight': 700 });
  txt(gw, X(LAST) - 44, 34, '下一個詞元', { 'font-size': 17, fill: SEAL, 'text-anchor': 'end' });
})();

/* ---------- three training stages, each with its own looping animation ---------- */
(function () {
  // 1 · pre-training: walk through a sentence, guess each next word, then reveal it
  const SENT = ['魯迅', '原名', '周樹人', '，', '浙江', '紹興', '人', '。'];
  const GUESS = [null, '是', '周作人', '，', '浙江', '杭州', '人', '。'];
  // 2 · instruction tuning: a base model rambles; an answer written by a person replaces it
  const Q = '《紅樓夢》的作者是誰？';
  const RAMBLE = '《水滸傳》的作者是誰？《西遊記》的作者是誰？第三章練習題……';
  const GOOD = '一般認為前八十回是曹雪芹所作，後四十回的作者仍有爭議，通常歸於高鶚。';
  // 3 · preference tuning: two answers, a person picks one
  const A = '曹雪芹。';
  const B = '前八十回是曹雪芹所作；今天通行的後四十回，一般歸於高鶚，但學界仍有爭論。';
  let t = 0, timer = null;
  const slide = document.getElementById('s-chat');
  function frame1(k) {
    const n = SENT.length, pos = 1 + Math.floor(k / 2) % (n - 1), reveal = k % 2 === 1;
    const words = SENT.map((w, i) => i < pos ? `<span class="w">${w}</span>` : i === pos ? (reveal ? `<span class="w ${GUESS[i] === w ? 'ok' : 'bad'}">${w}</span>` : '<span class="w gap">?</span>') : '<span class="w hid">▒▒</span>').join('');
    const g = GUESS[pos], ok = g === SENT[pos];
    return `<div class="p1s">${words}</div><div class="p1g">模型猜：<b>${g}</b>${reveal ? (ok ? ' <span class="okc">✓ 猜對</span>' : ` <span class="badc">✗ 應是「${SENT[pos]}」：調整權重</span>`) : ''}</div>`;
  }
  function frame2(k) {
    const c = k % 14;
    const typed = (txt, f) => txt.slice(0, Math.min(txt.length, Math.round(txt.length * f)));
    if (c < 6) return `<div class="p2a base"><span>基礎模型，純文字</span>${Q} <i class="ramble">${typed(RAMBLE, (c + 1) / 4)}</i></div><div class="p2n">它只會續寫，不會回答</div>`;
    return `<div class="p2t"><span>對話模板裡的訓練範例</span>
      <div><b class="role sys">system</b>你是一個樂於助人的助手。</div>
      <div><b class="role usr">user</b>${Q}</div>
      <div><b class="role ast">assistant</b>${typed(GOOD, (c - 5) / 4)}</div></div>`;
  }
  function frame3(k) {
    const c = k % 10, pick = c >= 3, push = c >= 6;
    return `<div class="p2q"><span>問題</span>${Q}</div>
      <div class="p3a${pick ? ' lose' : ''}"><i>A</i>${A}</div>
      <div class="p3a${pick ? ' win' : ''}"><i>B</i>${B}${pick ? '<em>👍 較好</em>' : ''}</div>
      <div class="p3r${push ? ' on' : ''}">像 B 的答案變得更可能 <span class="p3bar"><span style="width:${push ? 82 : 50}%"></span></span></div>`;
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
  const COLS = ['#b03a2e', '#d0703f', '#e0a050', '#7d9f5a', '#4f86b5'];
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
        el('text', { x: x + w / 2, y: y + h / 2 - (h > 64 ? fs * 0.25 : -fs * 0.35), 'text-anchor': 'middle', 'font-size': fs, 'font-family': 'Songti TC, Noto Serif TC, serif', fill: '#fff' }, svg, NEXT[i][0]);
        if (h > 64) el('text', { x: x + w / 2, y: y + h / 2 + fs * 0.85, 'text-anchor': 'middle', 'font-size': Math.max(13, fs * 0.6), fill: '#fff', 'fill-opacity': 0.9 }, svg, (100 * p[i]).toFixed(p[i] < 0.1 ? 1 : 0) + '%');
      }
    });
    // a small dart: the tip sits exactly on the landing point, the body sticks out up and to the left
    darts.forEach(([x, y], k) => {
      const last = k === darts.length - 1, sc = last ? 1.5 : 1;
      const body = last ? '#1f5fd6' : '#fff', line = last ? '#0d2f6e' : '#1b2333';
      // position on the outer group; the pulse (a CSS transform) goes on an inner group so it cannot override it
      const g0 = el('g', { transform: `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(-40) scale(${sc})` }, svg);
      const g = el('g', last ? { class: 'dart-new' } : {}, g0);
      el('circle', { cx: 0, cy: 0, r: 2.2, fill: '#1b2333', 'fill-opacity': .35 }, g);                       // the hole
      el('path', { d: 'M0,0 L-1.6,-7 L1.6,-7 Z', fill: '#9aa3b2', stroke: line, 'stroke-width': .8 }, g);       // steel tip
      el('rect', { x: -3, y: -19, width: 6, height: 12, rx: 2, fill: body, stroke: line, 'stroke-width': 1.3 }, g);  // barrel
      el('line', { x1: 0, y1: -19, x2: 0, y2: -30, stroke: line, 'stroke-width': 1.6 }, g);                    // shaft
      el('path', { d: 'M0,-26 L-7,-36 L0,-33 L7,-36 Z', fill: last ? '#f2b705' : '#e4dccd', stroke: line, 'stroke-width': 1.1 }, g);  // flights
    });
    const last = hist.slice(-7).reverse();
    $('#tp-out').innerHTML = last.length ? last.map((s, i) => `<div class="${i === 0 ? 'new' : ''}">冷月葬<b class="${s.rank > 1 ? 'odd' : ''}">${s.w}</b>魂 <small>T=${s.T.toFixed(1)}</small></div>`).join('')
      : '<div class="empty">按 <kbd>S</kbd> 向長方形擲一支飛鏢。</div>';
    if (hist.length) {
      const c = {}; hist.forEach(s => { c[s.w] = (c[s.w] || 0) + 1; });
      $('#tp-count').innerHTML = `<span>${hist.length} 支飛鏢：</span>` + NEXT.filter(([w]) => c[w]).map(([w]) => `<i>${w} ${c[w]}</i>`).join('');
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
  // both vectors are normalized (length 1), so A · B = cos θ and only the direction of B can change
  const svg = $('#cos-plot'), p = Plot(svg, { xmin: -1.4, xmax: 1.4, ymin: -1.25, ymax: 1.25, pad: 8 });
  const A = [Math.cos(rad(20)), Math.sin(rad(20))];
  let B = [Math.cos(rad(60)), Math.sin(rad(60))];
  function draw() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    p.grid(0.5, true);
    el('circle', { cx: p.X(0), cy: p.Y(0), r: p.s, fill: 'none', stroke: '#b9ae9c', 'stroke-width': 2, 'stroke-dasharray': '6 5' }, svg);
    p.text(0.72, -0.92, '長度 ＝ 1', { color: MUTE, size: 18 });
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
  const setB = angDeg => { const a = rad(20 + angDeg); B = [Math.cos(a), Math.sin(a)]; draw(); };
  let drag = false;
  const pos = e => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const q = pt.matrixTransform(svg.getScreenCTM().inverse()); return [(q.x - p.X(0)) / p.s, (p.Y(0) - q.y) / p.s]; };
  svg.addEventListener('pointerdown', e => { drag = true; svg.setPointerCapture(e.pointerId); move(e); });
  svg.addEventListener('pointermove', e => { if (drag) move(e); });
  svg.addEventListener('pointerup', () => { drag = false; });
  function move(e) { const [x, y] = pos(e); const l = Math.hypot(x, y); if (l < 0.1) return; B = [x / l, y / l]; draw(); }
  HOOKS['s-cos'] = { render(step) { if (step <= 1) setB(40); else if (step === 2) setB(90); else if (step === 3) setB(180); } };
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
  el('text', { x: 38, y: 97, 'font-size': 14, 'font-weight': 600, fill: INK }, gK, '問題');
  el('circle', { cx: 160, cy: 92, r: 8, fill: '#8a7a63', stroke: '#fff', 'stroke-width': 1.5 }, gK);
  el('text', { x: 160, y: 96, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 700, fill: '#fff' }, gK, '1');
  el('text', { x: 174, y: 97, 'font-size': 14, 'font-weight': 600, fill: INK }, gK, '檢索到的段落');
  el('circle', { cx: 316, cy: 92, r: 3, fill: '#8a7a63', 'fill-opacity': 0.6 }, gK);
  el('text', { x: 326, y: 97, 'font-size': 14, fill: INK }, gK, '其他段落');
  const dyn = el('g', {}, svg);
  let qi = 0;
  const draw = () => {
    while (dyn.firstChild) dyn.removeChild(dyn.firstChild);
    const q = R.queries[qi], qx = X(q.xy[0]), qy = Y(q.xy[1]);
    // screen positions of the hits; push any hit hidden under the star outwards (illustrative data)
    const HP = q.hits.map((h, k) => {
      const p = pts[h.i]; let x = X(p[0]), y = Y(p[1]);
      const dx = x - qx, dy = y - qy, d = Math.hypot(dx, dy);
      if (d < 20) { const a = d > 1 ? Math.atan2(dy, dx) : (k * 2.4); x = qx + 20 * Math.cos(a); y = qy + 20 * Math.sin(a); }
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
    el('text', { x: lx, y: ly, 'font-size': 18, 'font-weight': 700, fill: INK, stroke: '#fffdf8', 'stroke-width': 5, 'paint-order': 'stroke' }, dyn, '你的問題');
    $('#map-q').innerHTML = `<span>問題 ${qi + 1} / ${R.queries.length}</span><b class="zhs">${q.q}</b>`;
    $('#map-hits').innerHTML = q.hits.map((h, k) => `<div class="mh"><i style="background:${COL[R.docs.indexOf(h.doc)]}">${k + 1}</i><div><b>${h.doc}，第 ${h.part} 段</b> <em>${h.sim.toFixed(2)}</em><p>${h.text}</p></div></div>`).join('');
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
  const TOPS = [['鲁迅全集', 0.66], ['呐喊 · 阿Q', 0.63], ['呐喊 · 阿Q', 0.60], ['Wikipedia', 0.57], ['呐喊 · 自序', 0.55]];
  $('#pv-top').innerHTML = TOPS.map(([d, v], k) => `<div class="tc"><b>[${k + 1}]</b>${d}<em>${v.toFixed(2)}</em></div>`).join('');
  const ANS = [['我寫阿Q，是想寫出一個現代的我們國人的魂靈來', 1], ['。他沒有家，只給人家做短工', 2], ['；挨了打，便說「總算被兒子打了」，於是得勝地走了', 3], ['。', 0]];
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
  // the corpus is in simplified characters; each query word counts once per passage (toy BM25)
  const W = { '猹': 4.6, '西瓜': 2.4, '少年': 1.8, '月': 1.3 };
  const PS = [
    '……一轮金黄的圆月，下面是海边的沙地，都种着一望无际的碧绿的西瓜，其间有一个十一二岁的少年……向一匹猹尽力的刺去……',
    '……要管的是獾猪，刺猬，猹。月亮底下，你听，啦啦的响了，猹在咬瓜了。',
    '……我素不知道天下有这许多新鲜事：海边有如许五色的贝壳；西瓜有这样危险的经历……',
    '……孔乙己是站着喝酒而穿长衫的唯一的人。'
  ];
  const score = p => Object.keys(W).reduce((s, w) => s + (p.includes(w) ? W[w] : 0), 0);
  const max = Math.max(...PS.map(score));
  $('#kw-ps').innerHTML = PS.map((p, i) => {
    const html = p.replace(new RegExp(Object.keys(W).join('|'), 'g'), w => `<mark>${w}</mark>`);
    const sc = score(p);
    return `<div class="kwp" data-step="${i < 2 ? 2 : 3}"><p>${html}</p><span class="kwbar"><span style="width:${Math.round(240 * sc / max)}px"></span></span><em>${sc.toFixed(1)}</em></div>`;
  }).join('');
})();

/* ---------- reciprocal rank fusion ---------- */
(function () {
  const P = { P1: '故鄉：月下刺猹', P2: '故鄉：閏土講瓜田', P3: '故鄉：一聲「老爺」', P4: '社戲：月夜看戲', P5: '百草園：少年時', P6: '自序：鐵屋子' };
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

/* ---------- causal mask: BERT sees everything, GPT only the left ---------- */
(function () {
  const T = ['冷', '月', '葬', '花', '魂'];
  const grid = (id, causal) => {
    let h = '<span class="mkc0"></span>' + T.map(t => `<span class="mkc top">${t}</span>`).join('');
    T.forEach((r, i) => {
      h += `<span class="mkc side">${r}</span>` + T.map((c, j) => `<span class="mkc ${causal && j > i ? 'off' : 'onc'}"></span>`).join('');
    });
    $(id).innerHTML = h;
  };
  grid('#mk-bert', false); grid('#mk-gpt', true);
})();

/* ---------- unembedding quiz: h · every column of W_U ---------- */
(function () {
  // display order on the quiz slide: the winner 花 sits in the second column, so the first worked example (詩) is not the answer
  const ORD = [1, 0, 2, 3, 4];
  const m = $('#ue-mat');
  let h = ORD.map(k => `<span class="uh" data-c="${WU[k][0]}">${WU[k][0]}</span>`).join('');
  for (let r = 0; r < 4; r++) h += ORD.map(k => `<span class="uc" data-c="${WU[k][0]}">${neg(WU[k][1][r])}</span>`).join('');
  h += ORD.map(k => `<span class="uz" data-c="${WU[k][0]}">${neg(NEXT[k][1])}</span>`).join('');
  m.innerHTML = h;
  const term = (a, b) => `${a < 0 ? '(' + neg(a) + ')' : a}×${b < 0 ? '(' + neg(b) + ')' : b}`;
  const line = k => { const [w, v] = WU[k]; return `<div class="ucl"><b>${w}</b><span>${H.map((x, r) => term(x, v[r])).join(' ＋ ')}</span><em>＝ ${neg(NEXT[k][1])}</em></div>`; };
  // steps 5–14: two clicks per column, in display order. Odd click: the column lights up and students
  // compute in their heads ("＝ ？"); even click: the score is revealed. Step 15: the winner.
  const WIN = 15;
  window.HOOKS['s-unemb'] = {
    render(step) {
      const hot = step >= 5 && step < WIN ? Math.floor((step - 5) / 2) : -1;
      const shown = step >= 5 ? Math.min(5, Math.floor((step - 4) / 2)) : 0;
      $$('#ue-mat [data-c]').forEach(e => {
        e.classList.toggle('hot', hot >= 0 && e.dataset.c === WU[ORD[hot]][0]);
        e.classList.toggle('win', step >= WIN && e.dataset.c === '花');
      });
      $$('#ue-mat .uz').forEach((e, i) => e.classList.toggle('on', i < shown));
      const lines = ORD.slice(0, shown).map(line);
      if (hot >= shown) lines.push(line(ORD[hot]).replace(/＝ [^<]*<\/em>/, '＝ ？</em>'));
      $('#ue-calc').innerHTML = lines.join('');
      $('#ue-calc').classList.add('all');
    }
  };
})();

/* ---------- drag h: scores are dot products with five 2D word vectors ---------- */
(function () {
  const svg = $('#u2-plot'), W = 500, Hh = 470, S = 100, ox = 250, oy = 250;
  const V = [['花', [1.4, 0.6]], ['詩', [0.9, 1.15]], ['香', [0.2, 1.35]], ['孤', [-0.85, 0.9]], ['劍', [-1.2, -0.75]]];
  const COLS = ['#b03a2e', '#d0703f', '#c79a2e', '#7d9f5a', '#4f86b5'];
  const H0 = [1.15, 0.38];
  let h = H0.slice();
  const X = x => ox + x * S, Y = y => oy - y * S;
  const arrow = (x, y, col, w) => {
    const a = Math.atan2(Y(y) - oy, X(x) - ox), L = 16, c = Math.cos(a), s = Math.sin(a);
    el('line', { x1: ox, y1: oy, x2: X(x) - c * L * .8, y2: Y(y) - s * L * .8, stroke: col, 'stroke-width': w, 'stroke-linecap': 'round' }, svg);
    el('polygon', { points: `${X(x)},${Y(y)} ${X(x) - c * L - s * 7},${Y(y) - s * L + c * 7} ${X(x) - c * L + s * 7},${Y(y) - s * L - c * 7}`, fill: col }, svg);
  };
  function draw() {
    svg.innerHTML = '';
    el('rect', { x: 0.75, y: 0.75, width: W - 1.5, height: Hh - 1.5, rx: 12, fill: '#fffdf8', stroke: LINE, 'stroke-width': 1.5 }, svg);
    for (let k = -2; k <= 2; k++) {
      el('line', { x1: X(k), y1: 10, x2: X(k), y2: Hh - 10, stroke: LINE }, svg);
      el('line', { x1: 10, y1: Y(k), x2: W - 10, y2: Y(k), stroke: LINE }, svg);
    }
    el('line', { x1: 10, y1: oy, x2: W - 10, y2: oy, stroke: '#b9ae9c', 'stroke-width': 1.6 }, svg);
    el('line', { x1: ox, y1: 10, x2: ox, y2: Hh - 10, stroke: '#b9ae9c', 'stroke-width': 1.6 }, svg);
    V.forEach(([w, v], k) => {
      arrow(v[0], v[1], COLS[k], 3.5);
      const L = Math.hypot(...v), px = -v[1] / L, py = v[0] / L;
      el('text', { x: X(v[0] * 1.1 + px * 0.2), y: Y(v[1] * 1.1 + py * 0.2) + 10, 'text-anchor': 'middle', 'font-size': 28, 'font-family': 'Songti TC, Noto Serif TC, serif', 'font-weight': 600, fill: COLS[k] }, svg, w);
    });
    arrow(h[0], h[1], '#7c3aed', 6);
    el('circle', { cx: X(h[0]), cy: Y(h[1]), r: 12, fill: '#7c3aed', stroke: '#fff', 'stroke-width': 2.5 }, svg);
    el('text', { x: X(h[0]) + 10, y: Y(h[1]) + 36, 'font-size': 30, 'font-weight': 700, 'font-style': 'italic', fill: '#7c3aed', stroke: '#fffdf8', 'stroke-width': 5, 'paint-order': 'stroke' }, svg, 'h');
    const z = V.map(([, v]) => dot(h, v)), p = softmax(z);
    const best = z.indexOf(Math.max(...z));
    $('#u2-bars').innerHTML = `<div class="u2h"><span></span><span>分數 z</span><span>機率 P</span></div>` + V.map(([w], k) =>
      `<div class="u2row${k === best ? ' best' : ''}"><b style="color:${COLS[k]}">${w}</b><em>${neg(z[k].toFixed(2))}</em><span class="u2bar"><span style="width:${Math.round(280 * p[k])}px;background:${COLS[k]}"></span></span><i>${(100 * p[k]).toFixed(p[k] < 0.1 ? 1 : 0)}%</i></div>`).join('') +
      `<div class="u2len">h 的長度 ＝ ${Math.hypot(...h).toFixed(2)}</div>`;
  }
  let drag = false;
  const pos = e => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const q = pt.matrixTransform(svg.getScreenCTM().inverse()); return [(q.x - ox) / S, (oy - q.y) / S]; };
  const move = e => { let [x, y] = pos(e); const l = Math.hypot(x, y); if (l < 0.15) return; if (l > 2.3) { x *= 2.3 / l; y *= 2.3 / l; } h = [x, y]; draw(); };
  svg.addEventListener('pointerdown', e => { drag = true; svg.setPointerCapture(e.pointerId); move(e); e.stopPropagation(); });
  svg.addEventListener('pointermove', e => { if (drag) move(e); });
  svg.addEventListener('pointerup', () => { drag = false; });
  svg.addEventListener('click', e => e.stopPropagation());
  // step 2 stretches h along its direction to show that a longer h gives a sharper distribution
  window.HOOKS['s-unemb2'] = { render(step) { h = step === 2 ? H0.map(v => v * 1.8) : H0.slice(); draw(); } };
  draw();
})();

/* ---------- softmax table ---------- */
(function () {
  const z = NEXT.map(x => x[1]), e = z.map(Math.exp), p = softmax(z);
  $('#sm-tab tbody').innerHTML = NEXT.map(([w], k) => `<tr><th>${w}</th><td class="num">${neg(z[k])}</td><td class="num" data-step="1">${e[k] < 1 ? e[k].toFixed(2) : e[k].toFixed(1)}</td><td class="num" data-step="3"><b>${(100 * p[k]).toFixed(p[k] < 0.01 ? 2 : 1)}%</b></td><td data-step="3"><span class="smbar" style="width:${Math.round(160 * p[k])}px"></span></td></tr>`).join('') +
    `<tr class="sum"><th></th><td></td><td class="num" data-step="2">總和 ${e.reduce((a, b) => a + b, 0).toFixed(1)}</td><td class="num" data-step="3">100%</td><td></td></tr>`;
})();

/* ---------- why "temperature": an ice lattice and boiling water, each with its distribution ---------- */
(function () {
  const z = NEXT.map(x => x[1]);
  const bars = (id, T) => {
    const p = softmax(z, T);
    $(id).innerHTML = NEXT.map(([w], k) => `<div class="phrow"><b>${w}</b><span class="phbar" style="width:${Math.max(2, Math.round(220 * p[k]))}px"></span><em>${p[k] < 0.001 ? '<0.1' : (100 * p[k]).toFixed(p[k] < 0.01 ? 1 : 0)}%</em></div>`).join('');
  };
  bars('#ph-bars-ice', 0.5); bars('#ph-bars-hot', 2);
  // ice: a regular lattice; boiling water: scattered molecules that jitter (CSS animation)
  const ice = $('#ph-ice'), hot = $('#ph-hot');
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) el('circle', { cx: 25 + c * 30, cy: 25 + r * 30, r: 9, fill: '#4f86b5' }, ice);
  let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let k = 0; k < 25; k++) el('circle', { cx: 12 + rnd() * 146, cy: 12 + rnd() * 146, r: 9, fill: '#b03a2e', class: 'jit', style: `animation-delay:${(-rnd() * 1).toFixed(2)}s;animation-duration:${(0.3 + rnd() * 0.4).toFixed(2)}s` }, hot);
})();

/* ---------- interactive slides (data-lock) get a small checkbox, top right, that turns off text selection ---------- */
(function () {
  const KEY = 'chi3242-decoder-lock';
  let on = false; try { on = localStorage.getItem(KEY) === '1'; } catch (e) {}
  const slides = $$('.slide[data-lock]'), boxes = [];
  const apply = () => { slides.forEach(s => s.classList.toggle('locked', on)); boxes.forEach(b => { b.checked = on; }); };
  slides.forEach(s => {
    const l = document.createElement('label');
    l.className = 'lockbox'; l.title = 'Lock text selection while dragging';
    l.innerHTML = '<input type="checkbox"> 鎖定選取 <i>lock selection</i>';
    const box = l.querySelector('input'); boxes.push(box);
    box.addEventListener('change', () => { on = box.checked; box.blur(); try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {} apply(); });
    l.addEventListener('click', e => e.stopPropagation());
    s.appendChild(l);
  });
  apply();
})();

/* ---------- sentence similarity matrix (illustrative cosines) ---------- */
(function () {
  const S = ['我的手機不好用。', '你的電話看起來很棒。', '明天會下雪嗎？', '最近很多颱風吹襲香港。', '一天一蘋果，醫生遠離我。', '吃草莓有益健康。'];
  const M = [[1, .50, .14, .24, .30, .23], [.50, 1, .09, .10, .21, .15], [.14, .09, 1, .38, .16, .22],
             [.24, .10, .38, 1, .08, .16], [.30, .21, .16, .08, 1, .56], [.23, .15, .22, .16, .56, 1]];
  const col = v => { const t = Math.min(1, v / .6); return `rgba(176, 58, 46, ${(0.08 + 0.85 * t).toFixed(2)})`; };
  let h = '<span></span>' + S.map((_, j) => `<span class="simh">${j + 1}</span>`).join('');
  S.forEach((s, i) => {
    h += `<span class="siml"><i>${i + 1}</i>${s}</span>`;
    M[i].forEach((v, j) => {
      const pair = (i !== j) && ((i < 2 && j < 2) ? 2 : (i > 3 && j > 3) ? 3 : 0);
      h += `<span class="simc${i === j ? ' diag' : ''}${pair ? ' p' + pair : ''}" style="background:${i === j ? '#e9e3d8' : col(v)};color:${v > .35 && i !== j ? '#fff' : 'var(--ink)'}">${v.toFixed(2)}</span>`;
    });
  });
  $('#sim-grid').innerHTML = h;
  window.HOOKS['s-sim'] = {
    render(step) {
      $$('#sim-grid .p2').forEach(e => e.classList.toggle('hl', step === 2));
      $$('#sim-grid .p3').forEach(e => e.classList.toggle('hl', step === 3));
    }
  };
})();

/* ---------- multilingual sentence vectors: one question in three languages ---------- */
(function () {
  const svg = $('#ml-plot');
  el('rect', { x: 0.75, y: 0.75, width: 468.5, height: 328.5, rx: 12, fill: '#fffdf8', stroke: LINE, 'stroke-width': 1.5 }, svg);
  let seed = 3; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let k = 0; k < 90; k++) el('circle', { cx: 40 + rnd() * 200, cy: 110 + rnd() * 190, r: 2.6, fill: '#b9ae9c', 'fill-opacity': .6 }, svg);
  const P = [
    [118, 150, '#2f6db5', '退房是幾點？', 190, 44],
    [128, 160, '#7c3aed', 'What time is the check-out?', 190, 82],
    [112, 166, '#1f8a8a', 'チェックアウトは何時ですか？', 190, 120],
    [190, 262, '#d0703f', '泳池開到幾點？', 260, 268]
  ];
  P.forEach(([x, y, c, t, lx, ly]) => {
    el('line', { x1: x, y1: y, x2: lx - 8, y2: ly - 6, stroke: c, 'stroke-dasharray': '4 4', 'stroke-width': 1.5 }, svg);
    el('circle', { cx: x, cy: y, r: 7, fill: c, stroke: '#fff', 'stroke-width': 1.5 }, svg);
    el('text', { x: lx, y: ly, 'font-size': 19, fill: c, 'font-weight': 600, 'font-family': 'PingFang TC, Hiragino Sans, Noto Sans TC, sans-serif' }, svg, t);
  });
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
