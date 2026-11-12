/* Slide-specific logic for the contextual-encoders deck (loaded before deck.js). */
window.HOOKS = window.HOOKS || {};
window.SECTIONS = [
  { id: 'nn',      zh: '神經網絡',   en: 'Neural networks' },
  { id: 'poly',    zh: '一詞多義',   en: 'Polysemy' },
  { id: 'bert',    zh: 'BERT',       en: 'BERT' },
  { id: 'attn',    zh: '自注意力',   en: 'Self-attention' },
  { id: 'use',     zh: '使用編碼器', en: 'Using an encoder' },
  { id: 'vp',      zh: '案例：律詩對仗', en: 'Case study: parallel couplets' },
  { id: 'summary', zh: '總結',       en: 'Summary' }
];
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- an opening slide for every chapter (except the summary), inserted before its first slide ---------- */
window.SECTIONS.forEach((sec, i) => {
  if (sec.id === 'summary') return;
  const first = document.querySelector(`.slide[data-sec="${sec.id}"]`);
  if (!first) return;
  const s = document.createElement('section');
  s.className = 'slide full title-slide sec-open'; s.id = 's-open-' + sec.id; s.dataset.sec = sec.id;
  s.innerHTML = `<div class="sec-num">${String(i + 1).padStart(2, '0')}</div><div class="big-zh">${sec.zh}</div><div class="big-en">${sec.en}</div><div class="rule"></div>`;
  first.parentNode.insertBefore(s, first);
});
const BLUE = '#1f5fd6', ORG = '#e0570f', INK = '#1b2333', MUTE = '#6a7386', LINE = '#dde1e8';
const NS = 'http://www.w3.org/2000/svg';
function el(tag, attrs, parent, text) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  if (parent) parent.appendChild(e);
  return e;
}

/* ---------- title: a small network whose neurons light up layer by layer ---------- */
(function () {
  const svg = $('#title-net'), slide = $('#s-title');
  const layers = [4, 6, 6, 3], W = 440, H = 440;
  const pos = layers.map((n, l) => Array.from({ length: n }, (_, i) => [50 + l * (W - 100) / (layers.length - 1), H / 2 + (i - (n - 1) / 2) * 62]));
  const lines = [], dots = [];
  for (let l = 0; l < layers.length - 1; l++) {
    lines[l] = [];
    pos[l].forEach((a, i) => pos[l + 1].forEach((b, j) => { lines[l].push({ i, j, e: el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1] }, svg) }); }));
  }
  pos.forEach((col, l) => { dots[l] = col.map(([x, y]) => el('circle', { cx: x, cy: y, r: 17 }, svg)); });
  let timers = [];
  function pulse() {
    timers.forEach(clearTimeout); timers = [];
    $$('.hot', svg).forEach(e => e.classList.remove('hot'));
    let on = dots[0].map(() => Math.random() < .5);
    if (!on.some(Boolean)) on[0] = true;
    for (let l = 0; l < layers.length; l++) {
      const cur = on;
      timers.push(setTimeout(() => {
        dots[l].forEach((d, i) => d.classList.toggle('hot', cur[i]));
        if (l > 0) lines[l - 1].forEach(o => o.e.classList.remove('hot'));
        if (l < layers.length - 1) lines[l].forEach(o => o.e.classList.toggle('hot', cur[o.i] && (o.i + o.j + l) % 3 !== 0));
      }, l * 650));
      if (l < layers.length - 1) {
        const next = dots[l + 1].map((_, j) => cur.some((v, i) => v && (i + j + l) % 3 !== 0) && Math.random() < .65);
        if (!next.some(Boolean)) next[Math.floor(Math.random() * next.length)] = true;
        on = next;
      }
    }
  }
  setInterval(() => { if (slide.classList.contains('active')) pulse(); }, 3400);
  pulse();
})();

/* ---------- neural-network playground on MNIST digits ---------- */
(function () {
  const slide = $('#s-play');
  const D = window.DIGITS, SIDE = D.side, N = SIDE * SIDE, OUT = 10;
  const dec = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const toF = u => { const f = new Float32Array(u.length); for (let i = 0; i < u.length; i++) f[i] = u[i] / 255; return f; };
  const trX = toF(dec(D.train.x)), trY = dec(D.train.y), teX = toF(dec(D.test.x)), teY = dec(D.test.y);
  const nTr = trY.length, nTe = teY.length;

  const ACTS = ['relu', 'sigmoid', 'linear'], ACT_LABEL = { relu: ['ReLU', 'ReLU'], sigmoid: ['Sigmoid', 'Sigm.'], linear: ['線性 none', '線性'] };
  const SIZES = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 24, 32, 48, 64, 96, 128];
  const MAX_LAYERS = 4, MAX_SHOW = 16, BATCH = 16;
  const st = {
    hidden: [8, 8], acts: ['relu', 'relu'], lr: 0.1, slow: false, running: false,
    seen: 0, loss: null, hist: [], nextEval: 0, diverged: false,
    input: new Float32Array(N), mode: 'test', testIdx: 0, dirty: true, inputDirty: false, hover: null, pin: null
  };
  let net, order = [], ptr = 0;

  /* ---- the network ---- */
  function randn() { let u = 0; while (!u) u = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random()); }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } }
  function makeNet() {
    const sizes = [N, ...st.hidden, OUT], L = sizes.length - 1;
    const W = [], b = [], gW = [], gb = [];
    for (let l = 0; l < L; l++) {
      const nin = sizes[l], nout = sizes[l + 1];
      const sd = l < L - 1 && st.acts[l] === 'relu' ? Math.sqrt(2 / nin) : Math.sqrt(1 / nin);
      W[l] = new Float32Array(nin * nout); for (let k = 0; k < W[l].length; k++) W[l][k] = randn() * sd;
      b[l] = new Float32Array(nout); gW[l] = new Float32Array(nin * nout); gb[l] = new Float32Array(nout);
    }
    net = { sizes, L, W, b, gW, gb, a: sizes.map(n => new Float32Array(n)), d: sizes.map(n => new Float32Array(n)) };
    order = Array.from({ length: nTr }, (_, i) => i); shuffle(order); ptr = 0;
    Object.assign(st, { seen: 0, loss: null, hist: [], nextEval: 0, diverged: false });
    evalTest();
  }
  function forward(X, off) {
    const { sizes, L, W, b, a } = net;
    a[0].set(X.subarray(off, off + N));
    for (let l = 0; l < L; l++) {
      const nin = sizes[l], nout = sizes[l + 1], w = W[l], bb = b[l], ai = a[l], ao = a[l + 1];
      for (let j = 0; j < nout; j++) {
        let s = bb[j]; const r = j * nin;
        for (let i = 0; i < nin; i++) s += w[r + i] * ai[i];
        ao[j] = s;
      }
      if (l < L - 1) {
        const f = st.acts[l];   // 'linear' leaves the weighted sums unchanged
        if (f === 'relu') for (let j = 0; j < nout; j++) { if (ao[j] < 0) ao[j] = 0; }
        else if (f === 'sigmoid') for (let j = 0; j < nout; j++) ao[j] = 1 / (1 + Math.exp(-ao[j]));
      } else {
        let m = -Infinity; for (let j = 0; j < nout; j++) m = Math.max(m, ao[j]);
        let z = 0; for (let j = 0; j < nout; j++) { ao[j] = Math.exp(ao[j] - m); z += ao[j]; }
        for (let j = 0; j < nout; j++) ao[j] /= z;
      }
    }
    return a[L];
  }
  const argmax = p => { let k = 0; for (let j = 1; j < p.length; j++) if (p[j] > p[k]) k = j; return k; };
  function trainBatch() {
    const { sizes, L, W, b, gW, gb, a, d } = net;
    for (let l = 0; l < L; l++) { gW[l].fill(0); gb[l].fill(0); }
    let loss = 0;
    for (let k = 0; k < BATCH; k++) {
      const idx = order[ptr++];
      if (ptr >= nTr) { ptr = 0; shuffle(order); }
      const p = forward(trX, idx * N), y = trY[idx];
      loss -= Math.log(Math.max(p[y], 1e-12));
      for (let j = 0; j < OUT; j++) d[L][j] = p[j] - (j === y ? 1 : 0);
      for (let l = L - 1; l >= 0; l--) {
        const nin = sizes[l], nout = sizes[l + 1], w = W[l], g = gW[l], ai = a[l], dout = d[l + 1], din = d[l];
        if (l > 0) din.fill(0);
        for (let j = 0; j < nout; j++) {
          const dj = dout[j]; if (dj === 0) continue;
          gb[l][j] += dj; const r = j * nin;
          for (let i = 0; i < nin; i++) g[r + i] += dj * ai[i];
          if (l > 0) for (let i = 0; i < nin; i++) din[i] += w[r + i] * dj;
        }
        if (l > 0) {
          const f = st.acts[l - 1];   // derivative of this layer's activation; 1 for 'linear'
          if (f === 'relu') for (let i = 0; i < nin; i++) { if (ai[i] <= 0) din[i] = 0; }
          else if (f === 'sigmoid') for (let i = 0; i < nin; i++) din[i] *= ai[i] * (1 - ai[i]);
        }
      }
    }
    const s = st.lr / BATCH;
    for (let l = 0; l < L; l++) {
      const w = W[l], g = gW[l], bb = b[l], gg = gb[l];
      for (let i = 0; i < w.length; i++) w[i] -= s * g[i];
      for (let i = 0; i < bb.length; i++) bb[i] -= s * gg[i];
    }
    return loss / BATCH;
  }
  function evalTest() {
    let ok = 0;
    for (let k = 0; k < nTe; k++) if (argmax(forward(teX, k * N)) === teY[k]) ok++;
    st.hist.push([st.seen, ok / nTe]);
    st.nextEval = st.seen + (st.seen < 2000 ? 250 : st.seen < 16000 ? 1000 : 4000);
  }
  function step() {
    const l = trainBatch();
    st.seen += BATCH;
    if (!isFinite(l)) { st.diverged = true; setRunning(false); }
    else st.loss = st.loss == null ? l : .97 * st.loss + .03 * l;
    if (st.seen >= st.nextEval && !st.diverged) evalTest();
    st.dirty = true;
  }

  /* ---- drawing pad: strokes are cropped, scaled to 20 px, centred by mass in 28 px, then halved to 14 px, like MNIST ---- */
  const pad = $('#pad'), pctx = pad.getContext('2d');
  const c28 = document.createElement('canvas'); c28.width = c28.height = 28;
  const x28 = c28.getContext('2d', { willReadFrequently: true });
  let drawing = false, last = null;
  const padXY = e => { const r = pad.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * pad.width, (e.clientY - r.top) / r.height * pad.height]; };
  function clearPad() { pctx.clearRect(0, 0, pad.width, pad.height); st.input.fill(0); st.mode = 'draw'; st.dirty = true; }
  pad.addEventListener('pointerdown', e => {
    e.stopPropagation(); pad.setPointerCapture(e.pointerId);
    if (st.mode === 'test') clearPad();
    st.mode = 'draw'; drawing = true; last = padXY(e);
    pctx.fillStyle = INK; pctx.beginPath(); pctx.arc(last[0], last[1], 16, 0, 7); pctx.fill();
    st.inputDirty = st.dirty = true;
  });
  pad.addEventListener('pointermove', e => {
    if (!drawing) return;
    const p = padXY(e);
    Object.assign(pctx, { strokeStyle: INK, lineWidth: 32, lineCap: 'round', lineJoin: 'round' });
    pctx.beginPath(); pctx.moveTo(last[0], last[1]); pctx.lineTo(p[0], p[1]); pctx.stroke();
    last = p; st.inputDirty = st.dirty = true;
  });
  const endDraw = () => { drawing = false; };
  pad.addEventListener('pointerup', endDraw); pad.addEventListener('pointercancel', endDraw);

  function padToInput() {
    const S = pad.width, img = pctx.getImageData(0, 0, S, S).data;
    let x0 = S, y0 = S, x1 = -1, y1 = -1;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (img[(y * S + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    st.input.fill(0);
    if (x1 < 0) return;
    const bw = x1 - x0 + 1, bh = y1 - y0 + 1, k = 20 / Math.max(bw, bh), dw = bw * k, dh = bh * k;
    x28.clearRect(0, 0, 28, 28); x28.imageSmoothingEnabled = true;
    x28.drawImage(pad, x0, y0, bw, bh, 0, 0, dw, dh);
    let m = 0, mx = 0, my = 0, d = x28.getImageData(0, 0, 28, 28).data;
    for (let y = 0; y < 28; y++) for (let x = 0; x < 28; x++) { const v = d[(y * 28 + x) * 4 + 3]; m += v; mx += v * (x + .5); my += v * (y + .5); }
    x28.clearRect(0, 0, 28, 28);
    x28.drawImage(pad, x0, y0, bw, bh, 14 - mx / m, 14 - my / m, dw, dh);
    d = x28.getImageData(0, 0, 28, 28).data;
    for (let r = 0; r < SIDE; r++) for (let c = 0; c < SIDE; c++) {
      const a = (q, p) => d[((2 * r + q) * 28 + 2 * c + p) * 4 + 3];
      st.input[r * SIDE + c] = (a(0, 0) + a(0, 1) + a(1, 0) + a(1, 1)) / (4 * 255);
    }
  }
  function showTest() {
    st.testIdx = Math.floor(Math.random() * nTe);
    st.input.set(teX.subarray(st.testIdx * N, st.testIdx * N + N));
    st.mode = 'test';
    const S = pad.width, cell = S / SIDE;
    pctx.clearRect(0, 0, S, S);
    for (let i = 0; i < N; i++) {
      const v = st.input[i]; if (v < .02) continue;
      pctx.fillStyle = `rgba(27,35,51,${v})`;
      pctx.fillRect((i % SIDE) * cell, Math.floor(i / SIDE) * cell, cell + .5, cell + .5);
    }
    st.dirty = true;
  }

  /* ---- network diagram ---- */
  const svg = $('#net'), VW = 612, VH = 420, stp = $('#steppers'), pills = $('#actpills'), tip = $('#wtip'), wctx = $('.wmap', tip).getContext('2d'), kctx = $('.tops', tip).getContext('2d');
  let G = null;   // diagram handles
  const IMG = { x: 6, cell: 8 };
  const shown = n => Math.min(n, MAX_SHOW);
  function colX() {
    const k = st.hidden.length, x0 = 164, x1 = 478;
    return Array.from({ length: k + 1 }, (_, i) => k === 0 ? x1 : x0 + i * (x1 - x0) / k);
  }
  function buildDiagram() {
    while (svg.firstChild) svg.firstChild.remove();
    stp.innerHTML = ''; pills.innerHTML = '';
    const xs = colX(), counts = [...st.hidden, OUT];
    const gE = el('g', {}, svg), gN = el('g', {}, svg);
    const imgTop = VH / 2 + 14 - SIDE * IMG.cell / 2;
    // input image
    el('text', { x: IMG.x + SIDE * IMG.cell / 2, y: 18, class: 'ttl' }, svg, '輸入 input');
    el('text', { x: IMG.x + SIDE * IMG.cell / 2, y: 35, class: 'ttl' }, svg, `${SIDE}×${SIDE} = ${N}`);
    const px = [];
    for (let i = 0; i < N; i++) px.push(el('rect', { x: IMG.x + (i % SIDE) * IMG.cell, y: imgTop + Math.floor(i / SIDE) * IMG.cell, width: IMG.cell - .6, height: IMG.cell - .6, fill: '#fff' }, gN));
    el('rect', { x: IMG.x - 1.5, y: imgTop - 1.5, width: SIDE * IMG.cell + 2.4, height: SIDE * IMG.cell + 2.4, fill: 'none', stroke: LINE, 'stroke-width': 1.5, rx: 3 }, gN);
    // neuron positions
    const cols = counts.map((n, c) => {
      const isOut = c === counts.length - 1, k = isOut ? OUT : shown(n);
      const sp = isOut ? 36 : Math.min(34, 350 / k), r = isOut ? 13 : Math.max(4, Math.min(12, sp * .38));
      const ys = Array.from({ length: k }, (_, i) => VH / 2 + 14 + (i - (k - 1) / 2) * sp);
      return { n, k, r, ys, x: xs[c], isOut, ell: !isOut && n > MAX_SHOW };
    });
    // edges: input fan (no weights drawn, there are too many), then real weights between shown neurons
    const fan = cols[0];
    const fanLines = [];
    fan.ys.forEach((y, j) => { if (!(fan.ell && j === fan.k - 1)) fanLines.push({ j, e: el('line', { x1: IMG.x + SIDE * IMG.cell + 2, y1: imgTop + (j + .5) * SIDE * IMG.cell / fan.k, x2: fan.x - fan.r, y2: y, stroke: '#c9cfda', 'stroke-width': 1 }, gE) }); });
    const edges = [];
    for (let c = 1; c < cols.length; c++) {
      const A = cols[c - 1], B = cols[c];
      for (let j = 0; j < B.k; j++) for (let i = 0; i < A.k; i++) {
        if ((A.ell && i === A.k - 1) || (B.ell && j === B.k - 1)) continue;
        edges.push({ l: c, i, j, e: el('line', { x1: A.x + A.r, y1: A.ys[i], x2: B.x - B.r, y2: B.ys[j], 'stroke-width': 1.2 }, gE) });
      }
    }
    // neurons, titles, steppers
    const narrow = xs.length > 1 && xs[1] - xs[0] < 110;
    const nodes = cols.map((C, c) => {
      el('text', { x: C.x, y: 18, class: 'ttl' }, svg, C.isOut ? (narrow ? '輸出' : '輸出 output') : (narrow ? `隱藏 ${c + 1}` : `隱藏層 ${c + 1}`));
      if (C.isOut) el('text', { x: C.x, y: 35, class: 'ttl' }, svg, 'softmax');
      else {   // second title line: this layer's activation, click to cycle
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'actpill ' + st.acts[c]; b.style.left = C.x + 'px';
        b.textContent = ACT_LABEL[st.acts[c]][narrow ? 1 : 0];
        b.title = 'Click: ReLU → Sigmoid → linear (none)';
        b.onclick = e => { e.stopPropagation(); b.blur(); st.acts[c] = ACTS[(ACTS.indexOf(st.acts[c]) + 1) % ACTS.length]; rebuild(); };
        pills.appendChild(b);
      }
      return C.ys.map((y, j) => {
        if (C.ell && j === C.k - 1) { el('text', { x: C.x, y: y + 7, class: 'more' }, gN, '⋮'); return null; }
        const circ = el('circle', { cx: C.x, cy: y, r: C.r, class: 'neuron probe', fill: '#fff' }, gN);
        circ.addEventListener('mouseenter', () => { st.hover = { c, j }; drawTip(); placeTip(C.x, y, C.r); styleEdges(); });
        circ.addEventListener('mouseleave', () => { st.hover = null; tip.classList.remove('show'); styleEdges(); });
        circ.addEventListener('click', e => {
          e.stopPropagation();
          st.pin = st.pin && st.pin.c === c && st.pin.j === j ? null : { c, j };
          styleEdges();
        });
        let lab = null, bar = null, pct = null;
        if (C.isOut) {
          lab = el('text', { x: C.x, y, class: 'dig' }, gN, j);
          el('rect', { x: C.x + 20, y: y - 9, width: 80, height: 18, rx: 4, fill: '#f0f2f6' }, gN);
          bar = el('rect', { x: C.x + 20, y: y - 9, width: 0, height: 18, rx: 4, fill: BLUE }, gN);
          pct = el('text', { x: C.x + 106, y: y + 5, 'font-size': 13, fill: MUTE }, gN, '');
        }
        return { circ, lab, bar, pct };
      });
    });
    cols.forEach((C, c) => {
      const d = document.createElement('div');
      const tight = xs.length > 1 && xs[1] - xs[0] < 110;
      d.className = 'stp' + (C.isOut ? ' fixed' : '') + (tight ? ' tight' : ''); d.style.left = C.x + 'px';
      if (C.isOut) d.textContent = tight ? '10 類' : '10 類 classes';
      else {
        d.innerHTML = `<button type="button" aria-label="Fewer neurons">−</button><b>${C.n}</b><button type="button" aria-label="More neurons">+</button>`;
        const [minus, plus] = d.querySelectorAll('button');
        const bump = dir => { const i = SIZES.indexOf(st.hidden[c]) + dir; if (i >= 0 && i < SIZES.length) { st.hidden[c] = SIZES[i]; rebuild(); } };
        minus.onclick = e => { e.stopPropagation(); minus.blur(); bump(-1); };
        plus.onclick = e => { e.stopPropagation(); plus.blur(); bump(1); };
      }
      stp.appendChild(d);
    });
    // legend in the empty corner under the input image
    const lg = el('g', { transform: `translate(${IMG.x + 4}, ${VH - 52})` }, svg);
    [[BLUE, '正權重 +w'], [ORG, '負權重 −w']].forEach(([c, t], k) => {
      el('line', { x1: 0, y1: k * 22, x2: 22, y2: k * 22, stroke: c, 'stroke-width': 3, 'stroke-linecap': 'round' }, lg);
      el('text', { x: 30, y: k * 22 + 5, 'font-size': 14, fill: MUTE }, lg, t);
    });
    const di = document.createElement('div');
    di.className = 'stp fixed'; di.style.left = (IMG.x + SIDE * IMG.cell / 2) + 'px'; di.textContent = `${N} 像素 pixels`;
    stp.appendChild(di);
    G = { px, cols, edges, nodes, fanLines };
    st.pin = null; st.hover = null; tip.classList.remove('show');
    $('#nlayers').textContent = st.hidden.length;
  }
  function placeTip(x, y, r) {
    tip.classList.add('show');
    const w = tip.offsetWidth, h = tip.offsetHeight;
    tip.style.left = (x + r + 10 + w <= VW ? x + r + 10 : x - r - 10 - w) + 'px';
    tip.style.top = Math.max(0, Math.min(VH + 40 - h, y - h / 2)) + 'px';
  }
  /* activations of every neuron on every test image, cached until the weights change */
  let acts = null, actsSeen = -1, actsNet = null, actsAt = 0;
  function testActs() {
    const now = performance.now();
    if (acts && actsNet === net && (actsSeen === st.seen || (st.running && now - actsAt < 700))) return acts;
    acts = net.sizes.map((n, l) => l ? new Float32Array(nTe * n) : null);
    for (let k = 0; k < nTe; k++) { forward(teX, k * N); for (let l = 1; l <= net.L; l++) acts[l].set(net.a[l], k * net.sizes[l]); }
    actsSeen = st.seen; actsNet = net; actsAt = now;
    return acts;
  }
  function drawTip() {
    if (!st.hover) return;
    const { c, j } = st.hover, l = c + 1, n = net.sizes[l];
    // weight picture: only for neurons wired straight to the pixels
    const wpart = $('.wpart', tip);
    wpart.style.display = c === 0 ? '' : 'none';
    if (c === 0) {
      const w = net.W[0], r = j * N, cell = 140 / SIDE;
      let m = 1e-6; for (let i = 0; i < N; i++) m = Math.max(m, Math.abs(w[r + i]));
      wctx.clearRect(0, 0, 140, 140);
      for (let i = 0; i < N; i++) {
        const v = w[r + i] / m;
        wctx.fillStyle = v >= 0 ? `rgba(31,95,214,${v})` : `rgba(224,87,15,${-v})`;
        wctx.fillRect((i % SIDE) * cell, Math.floor(i / SIDE) * cell, cell, cell);
      }
      $('.cap', wpart).innerHTML = (l === net.L ? `「${j}」的權重` : `第 ${j + 1} 個神經元的權重`) + '<br>weights: 藍 blue = 加分 +, 橙 orange = 減分 −';
    }
    // the 9 test images on which this neuron fires most strongly
    const A = testActs()[l], top = [];
    for (let k = 0; k < nTe; k++) {
      const v = A[k * n + j];
      if (top.length < 9 || v > top[8][0]) { top.push([v, k]); top.sort((p, q) => q[0] - p[0]); if (top.length > 9) top.pop(); }
    }
    const S = 300, g = 6, box = (S - 2 * g) / 3, px = box / SIDE;
    kctx.clearRect(0, 0, S, S);
    kctx.font = '600 22px Avenir, Helvetica, sans-serif'; kctx.textBaseline = 'top';
    top.forEach(([v, k], t) => {
      const ox = (t % 3) * (box + g), oy = Math.floor(t / 3) * (box + g);
      kctx.fillStyle = '#f3f5f8'; kctx.fillRect(ox, oy, box, box);
      for (let i = 0; i < N; i++) {
        const p = teX[k * N + i]; if (p < .03) continue;
        kctx.fillStyle = `rgba(27,35,51,${p})`;
        kctx.fillRect(ox + (i % SIDE) * px, oy + Math.floor(i / SIDE) * px, px + .4, px + .4);
      }
      kctx.fillStyle = BLUE; kctx.fillText(teY[k], ox + 5, oy + 4);
    });
  }

  /* ---- edges: colour = sign of the weight, opacity = its size.
     Hovering a neuron (or clicking it, which pins the choice) leaves only that neuron's own connections visible. ---- */
  function styleEdges() {
    const f = st.hover || st.pin;
    const mine = o => o.l === f.c && o.j === f.j || o.l === f.c + 1 && o.i === f.j;
    const maxW = []; G.edges.forEach(o => { const w = Math.abs(net.W[o.l][o.j * net.sizes[o.l] + o.i]); maxW[o.l] = Math.max(maxW[o.l] || 1e-6, w); });
    G.edges.forEach(o => {
      const w = net.W[o.l][o.j * net.sizes[o.l] + o.i], v = Math.abs(w) / maxW[o.l];
      const on = f && mine(o);
      o.e.setAttribute('stroke', w >= 0 ? BLUE : ORG);
      o.e.setAttribute('stroke-opacity', (!f ? .04 + .8 * v * v : on ? .2 + .8 * v : .015).toFixed(3));
      o.e.setAttribute('stroke-width', on ? 2.2 : 1.2);
    });
    G.fanLines.forEach(o => o.e.setAttribute('opacity', !f ? .7 : f.c === 0 && f.j === o.j ? 1 : .08));
    G.nodes.forEach((col, c) => col.forEach((nd, j) => nd && nd.circ.classList.toggle('focus', !!f && f.c === c && f.j === j)));
    G.nodes.forEach((col, c) => col.forEach((nd, j) => nd && nd.circ.classList.toggle('pinned', !!st.pin && st.pin.c === c && st.pin.j === j)));
  }
  svg.addEventListener('click', e => { e.stopPropagation(); if (st.pin) { st.pin = null; styleEdges(); } });

  /* ---- refresh everything that depends on the weights or the input ---- */
  const tint = v => v >= 0 ? `rgba(31,95,214,${Math.min(1, v).toFixed(3)})` : `rgba(224,87,15,${Math.min(1, -v).toFixed(3)})`;
  function drawViz() {
    if (st.inputDirty && st.mode === 'draw') { padToInput(); st.inputDirty = false; }
    const p = forward(st.input, 0), a = net.a;
    G.px.forEach((r, i) => { const v = st.input[i]; r.setAttribute('fill', v < .01 ? '#fff' : `rgba(27,35,51,${v.toFixed(3)})`); });
    G.cols.forEach((C, c) => {
      const act = a[c + 1];
      let m = 1e-6; if (!C.isOut) for (let j = 0; j < act.length; j++) m = Math.max(m, Math.abs(act[j]));
      if (!C.isOut && st.acts[c] === 'sigmoid') m = 1;
      G.nodes[c].forEach((nd, j) => {
        if (!nd) return;
        const v = C.isOut ? act[j] : act[j] / m;
        nd.circ.setAttribute('fill', tint(v));
        if (nd.lab) nd.lab.setAttribute('fill', v > .5 ? '#fff' : INK);
        if (nd.bar) { nd.bar.setAttribute('width', (80 * act[j]).toFixed(1)); nd.pct.textContent = act[j] >= .005 ? Math.round(100 * act[j]) + '%' : ''; }
      });
    });
    styleEdges();
    const k = argmax(p), empty = st.input.every(v => v === 0);
    G.nodes[G.cols.length - 1].forEach((nd, j) => nd.bar.setAttribute('fill', j === k && !empty ? BLUE : '#9fb6e6'));
    $('#pdigit').textContent = empty ? '?' : k;
    $('#pconf').textContent = empty ? '–' : Math.round(100 * p[k]) + '%';
    const t = $('#truth');
    if (st.mode === 'test') {
      const y = teY[st.testIdx];
      t.innerHTML = `正確答案 answer: <b>${y}</b> &nbsp;` + (k === y ? '<span class="ok">✓ 對</span>' : '<span class="no">✗ 錯</span>');
    } else t.innerHTML = empty ? '在上面畫一個數字 draw above' : '你畫的數字 your drawing';
    $('#st-seen').textContent = st.seen.toLocaleString('en-US');
    $('#st-epoch').textContent = (st.seen / nTr).toFixed(2);
    $('#st-loss').textContent = st.diverged ? '發散!' : st.loss == null ? '–' : st.loss.toFixed(3);
    $('#st-loss').classList.toggle('bad', st.diverged);
    $('#st-acc').textContent = st.hist.length ? (100 * st.hist[st.hist.length - 1][1]).toFixed(1) + '%' : '–';
    drawChart(); drawTip();
  }

  /* ---- test-accuracy curve ---- */
  const ch = $('#chart'), cx = ch.getContext('2d');
  function drawChart() {
    const W = ch.width, H = ch.height, l = 60, r = 12, t = 14, b = 36;
    cx.clearRect(0, 0, W, H);
    cx.font = '22px Avenir, Helvetica, sans-serif'; cx.textBaseline = 'middle';
    const Y = v => t + (1 - v) * (H - t - b);
    [0, .5, .9, 1].forEach(v => {
      const lab = v !== 1;
      cx.strokeStyle = v === .9 ? '#c7d3ea' : '#eceef3'; cx.lineWidth = 2; cx.setLineDash(v === .9 ? [6, 6] : []);
      cx.beginPath(); cx.moveTo(l, Y(v)); cx.lineTo(W - r, Y(v)); cx.stroke();
      cx.fillStyle = MUTE; cx.textAlign = 'right'; if (lab) cx.fillText(Math.round(v * 100) + '%', l - 8, Y(v));
    });
    cx.setLineDash([]);
    const xmax = Math.max(2000, st.seen), X = s => l + s / xmax * (W - l - r);
    cx.textAlign = 'left'; cx.fillText('測試準確率 test accuracy', l + 6, H - 14);
    cx.textAlign = 'right'; cx.fillText(xmax >= 1000 ? Math.round(xmax / 1000) + 'k' : xmax, W - r, H - 14);
    if (st.hist.length < 1) return;
    cx.strokeStyle = BLUE; cx.lineWidth = 4; cx.lineJoin = 'round';
    cx.beginPath(); st.hist.forEach(([s, v], i) => i ? cx.lineTo(X(s), Y(v)) : cx.moveTo(X(s), Y(v))); cx.stroke();
    const [s, v] = st.hist[st.hist.length - 1];
    cx.fillStyle = BLUE; cx.beginPath(); cx.arc(X(s), Y(v), 6, 0, 7); cx.fill();
  }

  /* ---- controls ---- */
  function rebuild() {
    makeNet(); buildDiagram(); st.dirty = true;
  }
  function setRunning(on) {
    st.running = on && !st.diverged;
    const b = $('#b-train');
    b.classList.toggle('running', st.running);
    b.innerHTML = st.running ? '❚❚ 暫停 <span>Pause</span>' : '▶ 訓練 <span>Train</span>';
  }
  const btn = (id, fn) => $(id).addEventListener('click', e => { e.stopPropagation(); e.currentTarget.blur(); fn(); });
  btn('#b-train', () => { if (st.diverged) rebuild(); setRunning(!st.running); });
  btn('#b-reset', () => { rebuild(); });
  btn('#b-speed', () => { st.slow = !st.slow; $('#b-speed').classList.toggle('on', st.slow); });
  btn('#b-clear', clearPad);
  btn('#b-test', showTest);
  btn('#b-lminus', () => { if (st.hidden.length) { st.hidden.pop(); st.acts.pop(); rebuild(); } });
  btn('#b-lplus', () => { if (st.hidden.length < MAX_LAYERS) { st.hidden.push(8); st.acts.push(st.acts[st.acts.length - 1] || 'relu'); rebuild(); } });
  const lrSel = $('#lr');
  lrSel.addEventListener('keydown', e => e.stopPropagation());   // arrow keys pick a value instead of changing slides
  lrSel.addEventListener('change', () => { st.lr = Number(lrSel.value); lrSel.blur(); if (st.diverged) rebuild(); });

  /* ---- main loop: train in ~12 ms slices per frame (or one batch per 150 ms in slow motion) ---- */
  let lastViz = 0, lastSlow = 0;
  function loop(t) {
    requestAnimationFrame(loop);
    const active = slide.classList.contains('active');
    if (st.running && !active) setRunning(false);
    if (st.running) {
      if (!st.slow) { const t0 = performance.now(); do step(); while (st.running && performance.now() - t0 < 12); }
      else if (t - lastSlow > 150) { lastSlow = t; step(); }
    }
    if (active && st.dirty && t - lastViz > (st.running ? 90 : 30)) { lastViz = t; st.dirty = false; drawViz(); }
  }

  window.HOOKS['s-play'] = {
    render() { st.dirty = true; },
    key(e) {
      const k = e.key.toLowerCase();
      if (k === 't') { $('#b-train').click(); return true; }
      if (k === 'r') { $('#b-reset').click(); return true; }
      if (k === 'c') { clearPad(); return true; }
      if (k === 'n') { showTest(); return true; }
      return false;
    }
  };

  rebuild();
  showTest();
  requestAnimationFrame(loop);
})();

/* ═════════════ lecture slides (before the laser pointer) ═════════════ */

/* ---------- LaTeX: write \( inline \) anywhere in the text; KaTeX is bundled in vendor/ ---------- */
(function texify(root) {
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
})(document.getElementById('stage'));

const GRN = '#1f9d55', RED = '#d64545', PUR = '#7c3aed', QRED = '#d0392b', TEAL = '#0b7285', AMB = '#c77800';
const sigm = z => 1 / (1 + Math.exp(-z));
function arrow(svg, x1, y1, x2, y2, o = {}) {
  const c = o.color || INK, w = o.w || 3, g = el('g', o.attrs || {}, svg);
  const a = Math.atan2(y2 - y1, x2 - x1), h = o.head || 12;
  el('line', { x1, y1, x2: x2 - Math.cos(a) * h * .8, y2: y2 - Math.sin(a) * h * .8, stroke: c, 'stroke-width': w, 'stroke-dasharray': o.dash || 'none' }, g);
  el('path', { d: `M${x2},${y2} L${x2 - h * Math.cos(a - .45)},${y2 - h * Math.sin(a - .45)} L${x2 - h * Math.cos(a + .45)},${y2 - h * Math.sin(a + .45)}Z`, fill: c }, g);
  return g;
}
const txt = (svg, x, y, s, o = {}) => el('text', Object.assign({ x, y, 'font-size': 16, fill: INK, 'text-anchor': 'middle' }, o), svg, s);
const INPUTS = [['精彩', 3.51, .25], ['電影', .51, .02], ['好看', 0, .22], ['失望', 0, -.30], ['無聊', 0, -.21]];
const fmtX = v => v.toFixed(2);
const fmtW = w => (w >= 0 ? '+' : '−') + Math.abs(w).toFixed(2);

/* ---------- logistic regression as one neuron ---------- */
(function () {
  const svg = $('#lr-svg');
  const sx = 600, sy = 180;
  // review box
  el('rect', { x: 8, y: 118, width: 160, height: 124, rx: 14, fill: '#fff', stroke: INK, 'stroke-width': 2.5 }, svg);
  txt(svg, 88, 146, '評論 review', { 'font-size': 15, fill: MUTE });
  txt(svg, 88, 182, '這部電影', { 'font-size': 26 }); txt(svg, 88, 216, '很精彩', { 'font-size': 26 });
  arrow(svg, 176, 180, 216, 180);
  INPUTS.forEach(([w, x, wt], i) => {
    const cy = 48 + i * 66, off = x === 0;
    el('path', { d: `M386,${cy} C480,${cy} 480,${sy} ${sx - 50},${sy}`, fill: 'none', stroke: wt >= 0 ? GRN : RED, 'stroke-width': 1.5 + Math.abs(wt) * 22, opacity: off ? .22 : .85 }, svg);
    txt(svg, 398, cy - 12, 'w = ' + fmtW(wt), { 'font-size': 14, fill: wt >= 0 ? GRN : RED, 'text-anchor': 'start', 'font-weight': 600 });
    el('circle', { cx: 360, cy, r: 27, fill: '#fff', stroke: INK, 'stroke-width': 2 }, svg);
    txt(svg, 360, cy + 7, w, { 'font-size': 19 });
    txt(svg, 322, cy + 6, 'x = ' + fmtX(x), { 'font-size': 17, 'text-anchor': 'end', opacity: off ? .45 : 1, 'font-weight': 600 });
  });
  el('rect', { x: sx - 50, y: sy - 42, width: 100, height: 84, rx: 14, fill: INK }, svg);
  txt(svg, sx, sy + 9, 'z = 0.99', { 'font-size': 23, fill: '#f6d365', 'font-weight': 700 });
  txt(svg, sx, sy - 56, 'b = +0.10', { 'font-size': 17 });
  txt(svg, sx, sy + 66, '加權總和 weighted sum', { 'font-size': 14, fill: MUTE });
  arrow(svg, sx + 58, sy, sx + 108, sy);
  const bx = 716, bw = 130;
  el('rect', { x: bx, y: 125, width: bw, height: 110, rx: 14, fill: '#f4f7fd', stroke: BLUE, 'stroke-width': 2.5 }, svg);
  let d = ''; for (let t = -6; t <= 6.01; t += .25) d += (d ? 'L' : 'M') + (bx + 10 + (t + 6) / 12 * (bw - 20)).toFixed(1) + ',' + (225 - sigm(t) * 90).toFixed(1);
  el('line', { x1: bx + 10, y1: 180, x2: bx + bw - 10, y2: 180, stroke: '#c5cfe2', 'stroke-dasharray': '4 4' }, svg);
  el('path', { d, fill: 'none', stroke: BLUE, 'stroke-width': 3 }, svg);
  el('circle', { cx: bx + 10 + (.99 + 6) / 12 * (bw - 20), cy: 225 - sigm(.99) * 90, r: 6, fill: BLUE }, svg);
  txt(svg, bx + bw / 2, 113, 'sigmoid σ', { 'font-size': 16, fill: BLUE, 'font-weight': 600 });
  txt(svg, bx + bw / 2, 266, 'p = 0.73', { 'font-size': 24, fill: BLUE, 'font-weight': 700 });
  arrow(svg, bx + bw + 8, sy, bx + bw + 58, sy);
  el('circle', { cx: 942, cy: 148, r: 25, fill: GRN }, svg); txt(svg, 980, 156, '正面', { 'font-size': 24, fill: GRN, 'text-anchor': 'start', 'font-weight': 600 });
  el('circle', { cx: 942, cy: 214, r: 23, fill: '#eceef2', stroke: RED, 'stroke-width': 2.5 }, svg); txt(svg, 980, 222, '負面', { 'font-size': 24, fill: MUTE, 'text-anchor': 'start' });
  const g = el('g', { 'data-step': 1 }, svg);
  el('rect', { x: sx - 88, y: 88, width: bx + bw + 16 - (sx - 88), height: 200, rx: 20, fill: 'none', stroke: BLUE, 'stroke-width': 2.5, 'stroke-dasharray': '9 7' }, g);
  txt(g, (sx - 88 + bx + bw + 16) / 2, 76, '一個神經元 a neuron', { 'font-size': 20, fill: BLUE, 'font-weight': 700 });
})();

/* ---------- several neurons side by side = a layer, then softmax ---------- */
(function () {
  const svg = $('#layer-svg');
  const W = [[-.3, 0, -.2, .35, .3], [.05, .1, 0, .05, 0], [.25, .02, .22, -.3, -.21]];
  const cls = [['負面', -2.0, '0.14', .02, '#e8a5a5'], ['中性', .5, '1.65', .26, '#b9c0cc'], ['正面', 1.5, '4.48', .72, GRN]];
  const nx = 560, ny = i => 80 + i * 100;
  INPUTS.forEach(([w, x], i) => {
    const cy = 48 + i * 66;
    W.forEach((row, k) => el('line', { x1: 276, y1: cy, x2: nx - 38, y2: ny(k), stroke: row[i] >= 0 ? GRN : RED, 'stroke-width': 1 + Math.abs(row[i]) * 12, opacity: x === 0 ? .25 : .75 }, svg));
  });
  INPUTS.forEach(([w, x], i) => {
    const cy = 48 + i * 66;
    el('circle', { cx: 250, cy, r: 26, fill: '#fff', stroke: INK, 'stroke-width': 2 }, svg);
    txt(svg, 250, cy + 7, w, { 'font-size': 18 });
    txt(svg, 212, cy + 6, 'x = ' + fmtX(x), { 'font-size': 17, 'text-anchor': 'end', opacity: x === 0 ? .45 : 1, 'font-weight': 600 });
  });
  el('rect', { x: 660, y: 36, width: 140, height: 288, rx: 16, fill: INK }, svg);
  txt(svg, 730, 24, 'softmax', { 'font-size': 18, fill: BLUE, 'font-weight': 700 });
  cls.forEach(([name, z, ez, p, col], k) => {
    const y = ny(k);
    el('circle', { cx: nx, cy: y, r: 38, fill: '#fff', stroke: INK, 'stroke-width': 2.5 }, svg);
    txt(svg, nx, y - 4, 'Σ σ', { 'font-size': 14, fill: MUTE });
    txt(svg, nx, y + 16, 'z = ' + (z >= 0 ? '+' : '−') + Math.abs(z).toFixed(1), { 'font-size': 16, 'font-weight': 700 });
    arrow(svg, nx + 42, y, 654, y, { w: 2.5 });
    txt(svg, 730, y + 7, 'eᶻ = ' + ez, { 'font-size': 19, fill: k === 2 ? '#f6d365' : '#aab3c4' });
    arrow(svg, 808, y, 850, y, { w: 2.5 });
    txt(svg, 860, y + 8, name, { 'font-size': 23, 'text-anchor': 'start', fill: k === 2 ? GRN : MUTE, 'font-weight': 600 });
    el('rect', { x: 916, y: y - 12, width: 150, height: 24, rx: 12, fill: '#eceef2' }, svg);
    el('rect', { x: 916, y: y - 12, width: Math.max(24, 150 * p), height: 24, rx: 12, fill: col }, svg);
    txt(svg, 1072, y + 7, Math.round(p * 100) + '%', { 'font-size': 18, 'text-anchor': 'start', 'font-weight': 600 });
  });
  const g = el('g', { 'data-step': 1 }, svg);
  el('rect', { x: nx - 56, y: 28, width: 112, height: 304, rx: 18, fill: 'none', stroke: BLUE, 'stroke-width': 2.5, 'stroke-dasharray': '9 7' }, g);
  txt(g, nx, 352, '一層 a layer', { 'font-size': 19, fill: BLUE, 'font-weight': 700 });
})();

/* ---------- add a layer at the end: the old output layer becomes the hidden layer ---------- */
(function () {
  const svg = $('#next-svg');
  const iy = i => 58 + i * 66, ly = k => 92 + k * 114, L1 = 400, L2 = 720, SUB = ['₁', '₂', '₃'];
  // a formula label above a neuron, with a white halo so it stays readable over the connection lines
  const lab = (x, y, s, col, op, bold) => {   // s uses _{…} for subscripts and ^{…} for superscripts
    const t = txt(svg, x, y, null, { 'font-size': 19, fill: col, opacity: op, 'font-weight': bold ? 700 : 500, 'font-style': 'italic', stroke: '#fff', 'stroke-width': 5, 'paint-order': 'stroke', 'font-family': '"Times New Roman", serif' });
    s.split(/(_\{[^}]*\}|\^\{[^}]*\})/).filter(Boolean).forEach(p => {
      const sub = p.startsWith('_{'), sup = p.startsWith('^{');
      const ts = el('tspan', sub || sup ? { 'baseline-shift': sub ? '-28%' : '42%', 'font-size': '68%', 'font-style': 'normal' } : {}, t);
      ts.textContent = sub || sup ? p.slice(2, -1) : p;
      if (sub || sup) el('tspan', { 'font-size': '19', dx: 0 }, t).textContent = '\u200a';
    });
    return t;
  };
  const W0 = [[.25, .02, .22, -.3, -.21], [.05, .1, 0, .05, 0], [-.3, 0, -.2, .35, .3]];   // weights into layer 1 (positive, neutral, negative)
  const H = [.88, .31, .12];                     // layer-1 activations once they are kept as features
  const CLS = [['正面', GRN], ['中性', '#b9c0cc'], ['負面', '#e8a5a5']];
  const P1 = [.72, .26, .02], P2 = [.81, .15, .04];
  let s = 1, a = 0, raf = null;                  // s: softmax shown on layer 1; a: the new layer
  function bars(x, P, op) {
    CLS.forEach(([n, c], k) => {
      const g = el('g', { opacity: op }, svg);
      arrow(g, x + 36, ly(k), x + 88, ly(k), { w: 2.5 });
      txt(g, x + 98, ly(k) + 8, n, { 'font-size': 23, 'text-anchor': 'start', 'font-weight': 600, fill: k ? MUTE : GRN });
      el('rect', { x: x + 154, y: ly(k) - 12, width: 150, height: 24, rx: 12, fill: '#eceef2' }, g);
      el('rect', { x: x + 154, y: ly(k) - 12, width: 150 * P[k], height: 24, rx: 12, fill: c }, g);
      txt(g, x + 312, ly(k) + 7, Math.round(P[k] * 100) + '%', { 'font-size': 18, 'text-anchor': 'start', 'font-weight': 600 });
    });
    txt(el('g', { opacity: op }, svg), x + 200, 34, 'softmax', { 'font-size': 16, fill: BLUE, 'font-weight': 700 });
  }
  function draw() {
    while (svg.firstChild) svg.firstChild.remove();
    const x2 = L2 + (1 - a) * 220;
    INPUTS.forEach((_, i) => [0, 1, 2].forEach(k => el('line', { x1: 143, y1: iy(i), x2: L1 - 33, y2: ly(k), stroke: W0[k][i] >= 0 ? GRN : RED, 'stroke-width': 1 + Math.abs(W0[k][i]) * 8, opacity: .55 }, svg)));
    if (a > 0) H.forEach((h, j) => [0, 1, 2].forEach(k => el('line', { x1: L1 + 33, y1: ly(j), x2: x2 - 33, y2: ly(k), stroke: BLUE, 'stroke-width': 1 + h * 4, opacity: a * .55 }, svg)));
    INPUTS.forEach(([w], i) => { el('circle', { cx: 120, cy: iy(i), r: 23, fill: '#fff', stroke: INK, 'stroke-width': 2 }, svg); txt(svg, 120, iy(i) + 6, w, { 'font-size': 16 }); });
    txt(svg, 120, 372, '輸入層 input', { 'font-size': 16, fill: MUTE });
    // layer 1: an output layer at first, a hidden layer at the end
    const keep = 1 - s;
    H.forEach((h, k) => {
      el('circle', { cx: L1, cy: ly(k), r: 32, fill: `rgba(31,95,214,${(h * keep).toFixed(3)})`, stroke: INK, 'stroke-width': 2.5 }, svg);
      txt(svg, L1, ly(k) + 6, 'Σ', { 'font-size': 20, opacity: s });
      txt(svg, L1, ly(k) + 7, h.toFixed(2), { 'font-size': 18, 'font-weight': 700, fill: h > .5 ? '#fff' : INK, opacity: keep });
      // what each neuron computes: the weighted sum, then (once it is kept) the activation
      const up = a > .5 ? '^{(1)}' : '', n = k + 1;   // layer superscripts only once there are two layers
      lab(L1, ly(k) - 42 - 22 * keep, `z_{${n}}${up} = w_{${n}}${up}·x + b_{${n}}${up}`, INK, 1);
      lab(L1, ly(k) - 42, `h_{${n}} = σ(z_{${n}}${up})`, BLUE, keep, true);
    });
    bars(L1, P1, s);
    txt(svg, L1, 372, '輸出層 output', { 'font-size': 16, fill: MUTE, opacity: 1 - a });
    if (a > 0) {
      el('rect', { x: L1 - 100, y: 2, width: 200, height: 352, rx: 18, fill: 'none', stroke: BLUE, 'stroke-width': 2.5, 'stroke-dasharray': '9 7', opacity: a }, svg);
      txt(svg, L1, 374, '隱藏層 hidden layer', { 'font-size': 17, fill: BLUE, 'font-weight': 700, opacity: a });
      CLS.forEach((_, k) => { el('circle', { cx: x2, cy: ly(k), r: 32, fill: '#fff', stroke: INK, 'stroke-width': 2.5, opacity: a }, svg); txt(svg, x2, ly(k) + 6, 'Σ', { 'font-size': 20, opacity: a }); lab(x2, ly(k) - 42, `z_{${k + 1}}^{(2)} = w_{${k + 1}}^{(2)}·h + b_{${k + 1}}^{(2)}`, INK, a); });
      bars(x2, P2, a);
      txt(svg, x2, 372, '新的輸出層 new output', { 'font-size': 16, fill: MUTE, opacity: a });
    }
    if (keep > 0 && a < 1) txt(svg, L1 + 180, ly(1) + 8, 'h ＝ 新的特徵', { 'font-size': 22, fill: BLUE, 'font-weight': 700, opacity: keep * (1 - a) });
  }
  function go(ts, ta) {
    cancelAnimationFrame(raf);
    const s0 = s, a0 = a, t0 = performance.now(), D = 700;
    (function frame(now) {
      const k = Math.min(1, (now - t0) / D), e = k * k * (3 - 2 * k);
      s = s0 + (ts - s0) * e; a = a0 + (ta - a0) * e; draw();
      if (k < 1) raf = requestAnimationFrame(frame);
    })(t0);
  }
  window.HOOKS['s-next'] = { render(step) { go(step >= 1 ? 0 : 1, step >= 2 ? 1 : 0); } };
  draw();
})();

/* ---------- shared toy 2D meaning space: x = liquid / body, y = poor quality ---------- */
function meaningAxes(svg, X, Y, x0, x1, y0, y1, small) {
  el('rect', { x: X(0), y: Y(1), width: X(1) - X(0), height: Y(0) - Y(1), rx: 12, fill: '#fafbfd', stroke: LINE }, svg);
  el('ellipse', { cx: X(.8), cy: Y(.16), rx: (X(1) - X(0)) * .2, ry: (Y(0) - Y(1)) * .16, fill: '#e4edff' }, svg);
  el('ellipse', { cx: X(.18), cy: Y(.8), rx: (X(1) - X(0)) * .2, ry: (Y(0) - Y(1)) * .16, fill: '#ffe8d9' }, svg);
  txt(svg, X(.5), Y(0) + (small ? 20 : 26), '液體、身體 liquid, body →', { 'font-size': small ? 13 : 15, fill: MUTE });
  const t = txt(svg, X(0) - (small ? 10 : 14), Y(.5), '評價：品質差 poor quality →', { 'font-size': small ? 13 : 15, fill: MUTE });
  t.setAttribute('transform', `rotate(-90 ${X(0) - (small ? 10 : 14)} ${Y(.5)})`);
}

/* ---------- inside BERT: tokens → embeddings → layers → contextual vectors ---------- */
(function () {
  const svg = $('#stack-svg'), T = ['[CLS]', '這', '篇', '文', '章', '很', '水', '[SEP]'];
  const X = i => 160 + i * 72, special = i => i === 0 || i === T.length - 1;
  const rowY = { tok: 440, emb: 392, l1: 334, l2: 278, l12: 186, out: 128 };
  const lab = (y, s, step) => txt(step == null ? svg : el('g', { 'data-step': step }, svg), 104, y + 6, s, { 'font-size': 16, fill: MUTE, 'text-anchor': 'end', 'font-weight': 600 });
  const shade = [.35, .6, .85];
  lab(rowY.tok, '詞元');
  T.forEach((t, i) => {
    el('rect', { x: X(i) - 30, y: rowY.tok - 20, width: 60, height: 40, rx: 8, fill: special(i) ? '#f1ebfd' : (i === 6 ? '#ffe8d9' : '#e4edff'), stroke: special(i) ? PUR : (i === 6 ? ORG : BLUE), 'stroke-width': 1.8 }, svg);
    txt(svg, X(i), rowY.tok + (special(i) ? 5 : 8), t, { 'font-size': special(i) ? 13 : 22, fill: special(i) ? PUR : INK, class: 'tok' });
  });
  const ge = el('g', { 'data-step': 1 }, svg); lab(rowY.emb, '嵌入', 1);
  T.forEach((t, i) => { shade.forEach((o, k) => el('rect', { x: X(i) - 22 + k * 15, y: rowY.emb - 8, width: 13, height: 16, rx: 3, fill: special(i) ? PUR : BLUE, opacity: [o, shade[(k + i) % 3], .5][i % 3] }, ge)); el('line', { x1: X(i), y1: rowY.tok - 20, x2: X(i), y2: rowY.emb + 8, stroke: '#b5bcc9' }, ge); });
  function layer(y0, y1, step, name) {
    const g = el('g', { 'data-step': step }, svg); lab(y1, name, step);
    T.forEach((_, i) => T.forEach((__, j) => el('line', { x1: X(i), y1: y0 - 10, x2: X(j), y2: y1 + 12, stroke: '#c9cfda', 'stroke-width': .8 }, g)));
    T.forEach((_, i) => el('circle', { cx: X(i), cy: y1, r: 12, fill: '#fff', stroke: special(i) ? PUR : (i === 6 ? ORG : BLUE), 'stroke-width': 2.2 }, g));
    return g;
  }
  layer(rowY.emb, rowY.l1, 2, '第 1 層');
  layer(rowY.l1, rowY.l2, 2, '第 2 層');
  const g3 = el('g', { 'data-step': 3 }, svg);
  T.forEach((_, i) => txt(g3, X(i), (rowY.l2 + rowY.l12) / 2 + 8, '⋮', { 'font-size': 26, fill: MUTE }));
  layer(rowY.l2 - 40, rowY.l12, 3, '第 12 層');
  const go = el('g', { 'data-step': 4 }, svg); lab(rowY.out, '輸出', 4);
  [3, 4, 5].forEach(i => el('line', { x1: X(i), y1: rowY.l2 - 12, x2: X(6), y2: rowY.l12 + 12, stroke: ORG, 'stroke-width': 3.2, opacity: .8 }, go));
  T.forEach((_, i) => { [0, 1, 2].forEach(k => el('rect', { x: X(i) - 22 + k * 15, y: rowY.out - 8, width: 13, height: 16, rx: 3, fill: i === 6 ? ORG : (special(i) ? PUR : TEAL), opacity: [.45, .9, .65][(k + i) % 3] }, go)); el('line', { x1: X(i), y1: rowY.l12 - 12, x2: X(i), y2: rowY.out + 8, stroke: '#b5bcc9' }, go); });
  el('rect', { x: X(6) - 34, y: rowY.out - 22, width: 68, height: 44, rx: 10, fill: 'none', stroke: ORG, 'stroke-width': 2.5 }, go);
  txt(go, X(6), rowY.out - 40, '「水」＝ 品質差', { 'font-size': 18, fill: ORG, 'font-weight': 700 });
  arrow(go, X(6) - 120, rowY.out - 72, X(6) - 40, rowY.out - 22, { color: ORG, w: 2 });
  txt(go, X(6) - 124, rowY.out - 80, '讀過「文章」「很」', { 'font-size': 16, fill: ORG, 'text-anchor': 'end' });
})();

/* ---------- self-attention from 水, in two sentences ---------- */
(function () {
  const S = [
    { toks: ['水', '是', '人體', '最', '重要', '的', '組成', '成分'], a: [.30, .05, .30, .02, .05, .02, .10, .16], q: 0,
      v: [[.55, .45], [.24, .36], [.92, .06], [.36, .52], [.5, .3], [.34, .22], [.64, .12], [.8, .26]], col: BLUE },
    { toks: ['這', '篇', '文章', '很', '水'], a: [.05, .03, .47, .15, .30], q: 4,
      v: [[.26, .36], [.36, .24], [.1, .85], [.2, .7], [.55, .45]], col: ORG }
  ];
  const svg = $('#attn-svg'), plot = $('#attn-plot');
  function draw(k) {
    const s = S[k];
    while (svg.firstChild) svg.firstChild.remove();
    while (plot.firstChild) plot.firstChild.remove();
    // token row
    const wd = s.toks.map(t => 22 + t.length * 28), gap = 10, total = wd.reduce((a, b) => a + b, 0) + gap * (wd.length - 1);
    let x = (640 - total) / 2; const cx = [];
    s.toks.forEach((t, i) => { cx.push(x + wd[i] / 2); x += wd[i] + gap; });
    const ty = 250;
    s.toks.forEach((t, i) => {
      if (i === s.q) return;
      const d = Math.abs(cx[i] - cx[s.q]), h = 26 + d * .3;
      el('path', { d: `M${cx[s.q]},${ty - 26} Q${(cx[i] + cx[s.q]) / 2},${ty - 26 - h * 2} ${cx[i]},${ty - 26}`, fill: 'none', stroke: s.col, 'stroke-width': 1 + s.a[i] * 34, opacity: .3 + s.a[i] * 1.4, 'stroke-linecap': 'round' }, svg);
      const away = i < s.q ? -1 : 1;   // the arc arrives from 水's side, so the number sits on the other side
      txt(svg, cx[i] + away * 8, ty - 32, Math.round(s.a[i] * 100) + '%', { 'font-size': 16, fill: s.col, 'font-weight': 700, stroke: '#fff', 'stroke-width': 5, 'paint-order': 'stroke', 'text-anchor': away < 0 ? 'end' : 'start' });
    });
    // self loop
    el('path', { d: `M${cx[s.q] - 10},${ty - 26} C${cx[s.q] - 32},${ty - 72} ${cx[s.q] + 32},${ty - 72} ${cx[s.q] + 10},${ty - 26}`, fill: 'none', stroke: s.col, 'stroke-width': 1 + s.a[s.q] * 34, opacity: .55 }, svg);
    const out = s.q === 0 ? -1 : 1;   // 水's own share: outside the loop, away from the other tokens
    txt(svg, s.q === 0 ? cx[s.q] : cx[s.q] + 34, s.q === 0 ? ty - 80 : ty - 52, Math.round(s.a[s.q] * 100) + '%', { 'font-size': 16, fill: s.col, 'font-weight': 700, 'text-anchor': s.q === 0 ? 'middle' : 'start', stroke: '#fff', 'stroke-width': 5, 'paint-order': 'stroke' });
    s.toks.forEach((t, i) => {
      const q = i === s.q;
      el('rect', { x: cx[i] - wd[i] / 2, y: ty - 24, width: wd[i], height: 48, rx: 10, fill: q ? s.col : '#fff', stroke: q ? s.col : LINE, 'stroke-width': 2 }, svg);
      txt(svg, cx[i], ty + 10, t, { 'font-size': 26, fill: q ? '#fff' : INK });
    });
    // plot: the new 水 is the attention-weighted mix of the token vectors
    const X = x => 46 + x * 360, Y = y => 290 - y * 270;
    meaningAxes(plot, X, Y, 0, 0, 0, 0, true);
    const mix = s.v.reduce((m, v, i) => [m[0] + s.a[i] * v[0], m[1] + s.a[i] * v[1]], [0, 0]);
    s.toks.forEach((t, i) => {
      if (i === s.q) return;
      el('line', { x1: X(s.v[i][0]), y1: Y(s.v[i][1]), x2: X(mix[0]), y2: Y(mix[1]), stroke: s.col, 'stroke-width': .6 + s.a[i] * 8, opacity: .35 }, plot);
    });
    const seen = {};
    s.toks.forEach((t, i) => {
      if (i === s.q) return;
      const key = s.v[i].join(); const dy = seen[key] ? 18 : 0; seen[key] = 1;
      el('circle', { cx: X(s.v[i][0]), cy: Y(s.v[i][1]), r: 4.5, fill: '#8e98ab' }, plot);
      txt(plot, X(s.v[i][0]) + 8, Y(s.v[i][1]) + 5 + dy, t, { 'font-size': 15, fill: '#4a5366', 'text-anchor': 'start' });
    });
    el('circle', { cx: X(s.v[s.q][0]), cy: Y(s.v[s.q][1]), r: 9, fill: '#fff', stroke: PUR, 'stroke-width': 3 }, plot);
    txt(plot, X(s.v[s.q][0]) + 12, Y(s.v[s.q][1]) - 10, '原本的「水」', { 'font-size': 14, fill: PUR, 'text-anchor': 'start', 'font-weight': 600 });
    arrow(plot, X(s.v[s.q][0]), Y(s.v[s.q][1]), X(mix[0]), Y(mix[1]), { color: s.col, w: 3 });
    el('circle', { cx: X(mix[0]), cy: Y(mix[1]), r: 10, fill: s.col }, plot);
    txt(plot, X(mix[0]) + (k ? 14 : -14), Y(mix[1]) + (k ? -12 : 30), '新的「水」', { 'font-size': 17, fill: s.col, 'font-weight': 700, 'text-anchor': k ? 'start' : 'end' });
    $$('#attn-tabs button').forEach((b, i) => b.classList.toggle('on', i === k));
  }
  $$('#attn-tabs button').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); b.blur(); draw(+b.dataset.k); }));
  draw(0);
})();

/* ---------- Q, K, V: one embedding, three learned matrices ---------- */
(function () {
  const svg = $('#qkv-svg');
  const vec = (g, x, y, c, ops) => ops.forEach((o, i) => el('rect', { x: x + i * 22, y, width: 20, height: 26, rx: 4, fill: c, opacity: o }, g));
  vec(svg, 14, 197, ORG, [.4, .85, .6, .3]);
  txt(svg, 58, 250, 'x：「水」的嵌入', { 'font-size': 15, fill: MUTE });
  const rows = [['W_Q', 'q 查詢', QRED, 84], ['W_K', 'k 鍵', TEAL, 216], ['W_V', 'v 值', AMB, 348]];
  rows.forEach(([m, out, c, y], k) => {
    const g = el('g', { 'data-step': k + 1 }, svg);
    el('path', { d: `M106,210 C150,210 150,${y} 196,${y}`, fill: 'none', stroke: '#8e98ab', 'stroke-width': 2.5 }, g);
    for (let r = 0; r < 4; r++) for (let c2 = 0; c2 < 4; c2++) el('rect', { x: 200 + c2 * 24, y: y - 48 + r * 24, width: 22, height: 22, rx: 3, fill: c, opacity: .2 + ((r * 7 + c2 * 3 + k) % 5) * .15 }, g);
    txt(g, 248, y - 58, m.replace('_', ''), { 'font-size': 18, fill: c, 'font-weight': 700 });
    arrow(g, 304, y, 360, y, { color: c, w: 2.5 });
    vec(g, 368, y - 13, c, [.5, .9, .35, .7]);
    txt(g, 412, y + 38, out, { 'font-size': 20, fill: c, 'font-weight': 700 });
  });
})();

/* ---------- drag the query and the keys: dot product, then softmax (as in visualizations/attention-keys-queries) ---------- */
(function () {
  const svg = $('#kq-svg'), P = { q: [.62, .62], 水: [.64, .46], 風: [.5, .71], 有: [-.65, .76] };
  const KEYS = ['水', '風', '有'], X = x => 220 + x * 190, Y = y => 220 - y * 190;
  const bars = $('#kq-bars');
  bars.innerHTML = KEYS.map(k => `<div class="kqb-row"><span class="k">K(${k})</span><span class="dp" id="kq-dp-${k}"></span><span class="bar"><b id="kq-b-${k}"></b></span><span class="a" id="kq-a-${k}"></span></div>`).join('');
  const static_ = el('g', {}, svg), dyn = el('g', {}, svg);
  for (let v = -1; v <= 1.001; v += .25) {
    el('line', { x1: X(v), y1: Y(-1), x2: X(v), y2: Y(1), stroke: Math.abs(v) < .01 ? '#9aa3b5' : '#eceef3', 'stroke-width': Math.abs(v) < .01 ? 1.5 : 1 }, static_);
    el('line', { x1: X(-1), y1: Y(v), x2: X(1), y2: Y(v), stroke: Math.abs(v) < .01 ? '#9aa3b5' : '#eceef3', 'stroke-width': Math.abs(v) < .01 ? 1.5 : 1 }, static_);
  }
  el('circle', { cx: X(0), cy: Y(0), r: 190, fill: 'none', stroke: '#e1e5ec', 'stroke-dasharray': '4 5' }, static_);
  function render() {
    while (dyn.firstChild) dyn.firstChild.remove();
    const dots = KEYS.map(k => P.q[0] * P[k][0] + P.q[1] * P[k][1]);
    const m = Math.max(...dots), ex = dots.map(d => Math.exp(d - m)), Z = ex.reduce((a, b) => a + b, 0);
    KEYS.forEach((k, i) => {
      arrow(dyn, X(0), Y(0), X(P[k][0]), Y(P[k][1]), { color: '#2f3b4c', w: 3 });
      txt(dyn, X(P[k][0] * 1.13), Y(P[k][1] * 1.13) + 7, `K(${k})`, { 'font-size': 20, fill: '#2f3b4c', 'font-weight': 600 });
      $(`#kq-dp-${k}`).textContent = 'Q·K = ' + dots[i].toFixed(2);
      $(`#kq-b-${k}`).style.width = (100 * ex[i] / Z) + '%';
      $(`#kq-a-${k}`).textContent = (ex[i] / Z).toFixed(2);
    });
    arrow(dyn, X(0), Y(0), X(P.q[0]), Y(P.q[1]), { color: QRED, w: 4 });
    txt(dyn, X(P.q[0] * 1.12) + 10, Y(P.q[1] * 1.12) + 2, 'Q([CLS])', { 'font-size': 20, fill: QRED, 'font-weight': 700, 'text-anchor': 'start' });
    ['q', ...KEYS].forEach(k => {
      const h = el('circle', { cx: X(P[k][0]), cy: Y(P[k][1]), r: 13, fill: k === 'q' ? 'rgba(208,57,43,.15)' : 'rgba(47,59,76,.12)', class: 'handle' }, dyn);
      h.addEventListener('pointerdown', e => { e.stopPropagation(); drag = k; svg.setPointerCapture(e.pointerId); });
    });
  }
  let drag = null;
  svg.addEventListener('pointermove', e => {
    if (!drag) return;
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    const clamp = v => Math.max(-1.05, Math.min(1.05, v));
    P[drag] = [clamp((p.x - 220) / 190), clamp((220 - p.y) / 190)];
    render();
  });
  const stop = () => { drag = null; };
  svg.addEventListener('pointerup', stop); svg.addEventListener('pointercancel', stop);
  render();
})();

/* ---------- three ways to use an encoder ---------- */
(function () {
  const svg = $('#uses-svg'), T = ['[CLS]', '明', '月', '松', '間', '照', '，', '清', '泉', '石', '上', '流', '[SEP]'];
  const X = i => 76 + i * 54, sp = i => i === 0 || i === T.length - 1;
  T.forEach((t, i) => {
    el('rect', { x: X(i) - 24, y: 420, width: 48, height: 38, rx: 7, fill: sp(i) ? '#f1ebfd' : '#e4edff', stroke: sp(i) ? PUR : BLUE, 'stroke-width': 1.6 }, svg);
    txt(svg, X(i), sp(i) ? 444 : 447, t, { 'font-size': sp(i) ? 11 : 21, fill: sp(i) ? PUR : INK });
    arrow(svg, X(i), 418, X(i), 384, { color: '#9aa3b5', w: 1.6, head: 8 });
    arrow(svg, X(i), 296, X(i), 262, { color: '#9aa3b5', w: 1.6, head: 8 });
    [0, 1, 2].forEach(k => el('rect', { x: X(i) - 19 + k * 13, y: 236, width: 11, height: 20, rx: 3, fill: sp(i) ? (i ? PUR : QRED) : TEAL, opacity: [.45, .9, .65][(k + i) % 3] }, svg));
  });
  el('rect', { x: X(0) - 32, y: 300, width: X(T.length - 1) - X(0) + 64, height: 80, rx: 14, fill: '#f5f7fa', stroke: '#9aa3b5', 'stroke-width': 2 }, svg);
  txt(svg, (X(0) + X(T.length - 1)) / 2, 348, 'BERT 編碼器 encoder（12 層 layers）', { 'font-size': 21, 'font-weight': 600 });
  // ① [CLS] classifier
  const g1 = el('g', { 'data-step': 1, 'data-until': 2 }, svg);
  arrow(g1, X(0), 230, X(0), 186, { color: QRED, w: 3 });
  // the classifier sits straight above [CLS]: one vertical line from the last hidden state to the output
  el('rect', { x: X(0) - 48, y: 140, width: 96, height: 44, rx: 10, fill: '#fde9e7', stroke: QRED, 'stroke-width': 2 }, g1);
  txt(g1, X(0), 169, '分類器', { 'font-size': 20, fill: QRED, 'font-weight': 600 });
  arrow(g1, X(0), 138, X(0), 96, { color: QRED, w: 3 });
  txt(g1, X(0) - 50, 82, '對仗：0.97', { 'font-size': 26, 'font-weight': 700, 'text-anchor': 'start' });
  txt(g1, X(0) + 58, 168, '只讀 [CLS] 的向量', { 'font-size': 16, fill: QRED, 'text-anchor': 'start' });
  // ② token classifier
  const POS = { 明: ['形', '#7c3aed'], 月: ['名', BLUE], 松: ['名', BLUE], 間: ['方', AMB], 照: ['動', GRN], 清: ['形', '#7c3aed'], 泉: ['名', BLUE], 石: ['名', BLUE], 上: ['方', AMB], 流: ['動', GRN] };
  const g2 = el('g', { 'data-step': 2, 'data-until': 3 }, svg);
  el('rect', { x: X(1) - 26, y: 168, width: X(11) - X(1) + 52, height: 40, rx: 10, fill: '#efe9fb', stroke: PUR, 'stroke-width': 2 }, g2);
  txt(g2, (X(1) + X(11)) / 2, 194, '分類器（每個字）token classifier', { 'font-size': 17, fill: PUR, 'font-weight': 600 });
  T.forEach((t, i) => {
    if (!POS[t]) return;
    arrow(g2, X(i), 230, X(i), 212, { color: PUR, w: 1.8, head: 7 });
    arrow(g2, X(i), 166, X(i), 136, { color: PUR, w: 1.8, head: 7 });
    el('rect', { x: X(i) - 22, y: 96, width: 44, height: 36, rx: 8, fill: POS[t][1] }, g2);
    txt(g2, X(i), 121, POS[t][0], { 'font-size': 20, fill: '#fff', 'font-weight': 700 });
  });
  txt(g2, (X(1) + X(11)) / 2, 74, '詞性：形 名 名 方 動 ／ 形 名 名 方 動', { 'font-size': 18, fill: INK, 'font-weight': 600 });
  // ③ embeddings
  const g3 = el('g', { 'data-step': 3 }, svg);
  el('path', { d: `M${X(0) - 20},224 L${X(0) - 20},212 L${X(12) + 20},212 L${X(12) + 20},224 M${(X(0) + X(12)) / 2},212 L${(X(0) + X(12)) / 2},190`, fill: 'none', stroke: TEAL, 'stroke-width': 2.5 }, g3);
  [0, 1, 2, 3, 4].forEach(k => el('rect', { x: (X(0) + X(12)) / 2 - 58 + k * 24, y: 160, width: 20, height: 26, rx: 4, fill: TEAL, opacity: [.4, .9, .6, .75, .3][k] }, g3));
  txt(g3, (X(0) + X(12)) / 2, 146, '句向量 sentence vector', { 'font-size': 17, fill: TEAL, 'font-weight': 600 });
  arrow(g3, (X(0) + X(12)) / 2 + 74, 172, (X(0) + X(12)) / 2 + 150, 172, { color: TEAL, w: 2.5 });
  txt(g3, (X(0) + X(12)) / 2 + 160, 166, 'cos(·, 其他詩句)', { 'font-size': 18, 'text-anchor': 'start', 'font-weight': 600 });
  txt(g3, (X(0) + X(12)) / 2 + 160, 190, '→ 相似詩句', { 'font-size': 17, 'text-anchor': 'start', fill: MUTE });
})();

/* ---------- one neuron = one straight line: z = w1·x1 + w2·x2 + b, output 1 where z > 0 (OR and AND work, XOR does not) ---------- */
(function () {
  const svg = $('#gate-svg'), tab = $('#gate-tab'), score = $('#gate-score');
  const PTS = [[0, 0], [0, 1], [1, 0], [1, 1]];
  const GATES = { or: [0, 1, 1, 1], and: [0, 0, 0, 1], nand: [1, 1, 1, 0], xor: [0, 1, 1, 0] };
  const START = { w1: 0, w2: 1, b: -.5 };   // a horizontal line: right for some points, but not the answer
  let gate = 'or', P = Object.assign({}, START);
  const lo = -.3, hi = 1.3;
  const X = x => 70 + (x - lo) / (hi - lo) * 360, Y = y => 380 - (y - lo) / (hi - lo) * 360;
  const z = p => P.w1 * p[0] + P.w2 * p[1] + P.b;
  const num = v => (v < 0 ? '−' : '') + Math.abs(v);
  function half() {   // the part of the box where z > 0
    const poly = [[lo, lo], [hi, lo], [hi, hi], [lo, hi]], out = [];
    for (let i = 0; i < 4; i++) {
      const A = poly[i], B = poly[(i + 1) % 4], za = z(A), zb = z(B);
      if (za > 0) out.push(A);
      if ((za > 0) !== (zb > 0)) { const t = za / (za - zb); out.push([A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])]); }
    }
    return out;
  }
  function render() {
    while (svg.firstChild) svg.firstChild.remove();
    const y = GATES[gate], pred = PTS.map(p => z(p) > 0 ? 1 : 0), ok = pred.filter((v, i) => v === y[i]).length;
    el('rect', { x: X(lo), y: Y(hi), width: X(hi) - X(lo), height: Y(lo) - Y(hi), fill: '#fff4f2', stroke: LINE }, svg);
    const h = half();
    if (h.length > 2) el('polygon', { points: h.map(p => X(p[0]) + ',' + Y(p[1])).join(' '), fill: '#e6f4ea' }, svg);
    // the line z = 0
    let seg = null;
    if (P.w2 !== 0) seg = [[lo, -(P.w1 * lo + P.b) / P.w2], [hi, -(P.w1 * hi + P.b) / P.w2]];
    else if (P.w1 !== 0) seg = [[-P.b / P.w1, lo], [-P.b / P.w1, hi]];
    if (seg) {
      const cp = el('clipPath', { id: 'gate-clip' }, svg); el('rect', { x: X(lo), y: Y(hi), width: X(hi) - X(lo), height: Y(lo) - Y(hi) }, cp);
      el('line', { x1: X(seg[0][0]), y1: Y(seg[0][1]), x2: X(seg[1][0]), y2: Y(seg[1][1]), stroke: INK, 'stroke-width': 3.5, 'clip-path': 'url(#gate-clip)' }, svg);
    }
    [0, 1].forEach(v => {
      txt(svg, X(v), Y(lo) + 30, v, { 'font-size': 26, fill: INK, 'font-weight': 700 });
      txt(svg, X(lo) - 20, Y(v) + 9, v, { 'font-size': 26, fill: INK, 'font-weight': 700 });
    });
    txt(svg, X(.5), Y(lo) + 36, 'x₁', { 'font-size': 24, fill: INK, 'font-weight': 700 });
    txt(svg, X(lo) - 46, Y(.5) + 8, 'x₂', { 'font-size': 24, fill: INK, 'font-weight': 700 });
    PTS.forEach((p, i) => {
      const good = pred[i] === y[i];
      el('circle', { cx: X(p[0]), cy: Y(p[1]), r: 20, fill: y[i] ? GRN : RED, stroke: good ? '#fff' : INK, 'stroke-width': good ? 3 : 4, 'stroke-dasharray': good ? 'none' : '5 4' }, svg);
      txt(svg, X(p[0]), Y(p[1]) + 7, y[i], { 'font-size': 20, fill: '#fff', 'font-weight': 700 });
    });
    score.innerHTML = `綠色區域 z &gt; 0 → 輸出 1 · 正確 <b class="${ok === 4 ? 'ok-c' : 'bad-c'}">${ok} / 4</b><span>Green region: z &gt; 0, the neuron outputs 1.</span>`;
    tab.innerHTML = '<tr><th>x₁</th><th>x₂</th><th>z</th><th>輸出</th><th class="ans">正確答案</th></tr>' + PTS.map((p, i) =>
      `<tr><td>${p[0]}</td><td>${p[1]}</td><td class="zc">${num(+z(p).toFixed(2))}</td><td class="${pred[i] ? 'g1' : 'g0'}">${pred[i]}</td><td class="ans ${y[i] ? 'g1' : 'g0'}">${y[i]}<span class="mk ${pred[i] === y[i] ? 'ok' : 'no'}">${pred[i] === y[i] ? '✓' : '✗'}</span></td></tr>`).join('');
  }
  // dropdowns: −2 … +2 in steps of 0.5
  const VALS = []; for (let v = -2; v <= 2.001; v += .5) VALS.push(+v.toFixed(1));
  $$('#gate-eq select').forEach(sel => {
    sel.innerHTML = VALS.map(v => `<option value="${v}">${v > 0 ? '+' : ''}${num(v)}</option>`).join('');
    sel.value = String(P[sel.dataset.k]);
    sel.addEventListener('keydown', e => e.stopPropagation());   // arrow keys change the value, not the slide
    sel.addEventListener('change', () => { P[sel.dataset.k] = +sel.value; sel.blur(); render(); });
  });
  const reset = () => { P = Object.assign({}, START); $$('#gate-eq select').forEach(s => { s.value = String(P[s.dataset.k]); }); };
  $$('#gate-btns button').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation(); b.blur(); gate = b.dataset.g; reset();
    $$('#gate-btns button').forEach(x => x.classList.toggle('on', x === b)); render();
  }));
  render();
})();

/* ---------- XOR with a hidden layer: h1 = OR, h2 = NAND, output = h1 AND h2 ---------- */
(function () {
  const C1 = BLUE, C2 = PUR;
  const frame = (svg, lab) => {
    const X = x => 60 + (x + .25) / 1.5 * 310, Y = y => 330 - (y + .25) / 1.5 * 310;
    el('rect', { x: X(-.25), y: Y(1.25), width: X(1.25) - X(-.25), height: Y(-.25) - Y(1.25), fill: '#fafbfd', stroke: LINE }, svg);
    [0, 1].forEach(v => { txt(svg, X(v), Y(-.25) + 28, v, { 'font-size': 24, fill: INK, 'font-weight': 700 }); txt(svg, X(-.25) - 18, Y(v) + 8, v, { 'font-size': 24, fill: INK, 'font-weight': 700 }); });
    txt(svg, X(.5), Y(-.25) + 32, lab[0], { 'font-size': 22, fill: INK, 'font-weight': 700 });
    txt(svg, X(-.25) - 42, Y(.5) + 8, lab[1], { 'font-size': 22, fill: INK, 'font-weight': 700 });
    return { X, Y };
  };
  const dot = (svg, P, x, y, v, extra) => {
    el('circle', { cx: P.X(x), cy: P.Y(y), r: 19, fill: v ? GRN : RED, stroke: '#fff', 'stroke-width': 3 }, svg);
    txt(svg, P.X(x), P.Y(y) + 7, v, { 'font-size': 19, fill: '#fff', 'font-weight': 700 });
    if (extra) txt(svg, P.X(x) + (extra[2] || 0), P.Y(y) + extra[1], extra[0], { 'font-size': 14, fill: MUTE });
  };
  const line = (svg, P, x1, y1, x2, y2, c, step) => {
    const g = el('g', { 'data-step': step }, svg);
    el('line', { x1: P.X(x1), y1: P.Y(y1), x2: P.X(x2), y2: P.Y(y2), stroke: c, 'stroke-width': 4, 'stroke-dasharray': '10 6' }, g);
    return g;
  };
  const si = $('#xh-in'), Pi = frame(si, ['x₁', 'x₂']);
  line(si, Pi, -.25, .75, .75, -.25, C1, 1); txt(si.lastChild, Pi.X(-.2), Pi.Y(.85), 'h₁', { 'font-size': 22, fill: C1, 'font-weight': 700 });
  line(si, Pi, .25, 1.25, 1.25, .25, C2, 2); txt(si.lastChild, Pi.X(1.2), Pi.Y(.4), 'h₂', { 'font-size': 22, fill: C2, 'font-weight': 700 });
  [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]].forEach(([x, y, v]) => dot(si, Pi, x, y, v));
  // the network in the middle: x1, x2 → h1 = OR, h2 = NAND → y = AND (step activations)
  const sn = $('#xh-net');
  const N = { x1: [32, 110], x2: [32, 270], h1: [166, 110], h2: [166, 270], y: [272, 190] };
  const edge = (a, b, w, c, step, t, dx, dy) => {   // weight label at fraction t of the edge, nudged by (dx, dy)
    const g = el('g', step ? { 'data-step': step } : {}, sn), [x1, y1] = N[a], [x2, y2] = N[b];
    el('line', { x1: x1 + 26, y1, x2: x2 - 30, y2, stroke: c, 'stroke-width': 3, opacity: .75 }, g);
    txt(g, x1 + 26 + (x2 - 30 - x1 - 26) * t + dx, y1 + (y2 - y1) * t + dy, (w > 0 ? '+' : '−') + Math.abs(w), { 'font-size': 16, fill: c, 'font-weight': 700 });
  };
  edge('x1', 'h1', 1, C1, 1, .5, 0, -10); edge('x2', 'h1', 1, C1, 1, .78, 12, 2);
  edge('x2', 'h2', -1, C2, 2, .5, 0, 24); edge('x1', 'h2', -1, C2, 2, .78, 12, 12);
  edge('h1', 'y', 1, INK, 4, .45, 4, -12); edge('h2', 'y', 1, INK, 4, .45, 4, 26);
  const node = (k, label, sub, bias, c, step) => {
    const g = el('g', step ? { 'data-step': step } : {}, sn), [x, y] = N[k];
    el('circle', { cx: x, cy: y, r: k[0] === 'x' ? 26 : 30, fill: k[0] === 'x' ? INK : '#fff', stroke: c, 'stroke-width': 3 }, g);
    txt(g, x, y + 7, label, { 'font-size': 20, fill: k[0] === 'x' ? '#fff' : c, 'font-weight': 700 });
    if (sub) txt(g, x, y + 50, sub, { 'font-size': 15, fill: c, 'font-weight': 700 });
    if (bias) txt(g, x, y - 40, 'b = ' + bias, { 'font-size': 14, fill: MUTE });
  };
  node('x1', 'x₁', '', '', INK); node('x2', 'x₂', '', '', INK);
  node('h1', 'h₁', 'OR', '−0.5', C1, 1); node('h2', 'h₂', 'NAND', '+1.5', C2, 2); node('y', 'y', 'AND', '−1.5', GRN, 4);
  const sh = $('#xh-hid'), Ph = frame(sh, ['h₁', 'h₂']);
  line(sh, Ph, .35, 1.25, 1.25, .35, INK, 4);
  dot(sh, Ph, 0, 1, 0, ['(0,0)', 36]);
  dot(sh, Ph, 1, 1, 1, ['(0,1) (1,0)', -28]);
  dot(sh, Ph, 1, 0, 0, ['(1,1)', 36]);
})();

/* ---------- polysemy: static vs. contextual (after the DHG502 word-meaning deck) ---------- */
(function () {
  const mk = (id, arrows) => {
    const svg = $('#' + id), X = x => 70 + x * 110, Y = y => 240 - y * 70;
    for (let v = 0; v <= 3; v++) {
      el('line', { x1: X(v), y1: Y(0), x2: X(v), y2: Y(3.1), stroke: v ? '#eceef3' : '#9aa3b5', 'stroke-width': v ? 1 : 2 }, svg);
      el('line', { x1: X(0), y1: Y(v), x2: X(3.6), y2: Y(v), stroke: v ? '#eceef3' : '#9aa3b5', 'stroke-width': v ? 1 : 2 }, svg);
    }
    [['液體', 2.9, .55], ['空洞', .8, 2.8]].forEach(([w, x, y]) => { el('circle', { cx: X(x), cy: Y(y), r: 7, fill: MUTE }, svg); txt(svg, X(x) + 14, Y(y) - 8, w, { 'font-size': 24, fill: MUTE, 'text-anchor': 'start', 'font-weight': 600 }); });
    arrows.forEach(([w, x, y, c, dx, dy]) => { arrow(svg, X(0), Y(0), X(x), Y(y), { color: c, w: 5, head: 16 }); txt(svg, X(x) + dx, Y(y) + dy, w, { 'font-size': 26, fill: c, 'font-weight': 700, 'text-anchor': 'start' }); });
  };
  mk('poly-1', [['水', 1.9, 1.9, BLUE, 12, 26]]);
  mk('poly-2', [['水（液體）', 2.5, .95, GRN, -40, -18], ['水（空洞）', .55, 2.35, ORG, 16, 20]]);
})();

/* ---------- two ReLUs fold the plane: ReLU(x2 − x1) flattens one half (t = 0.5); adding ReLU(x1 − x2) gives |x1 − x2|, the fold (t = 1) ---------- */
(function () {
  const svg = $('#fold-svg'), slide = $('#s-fold');
  let cur = 0;   // 0 = flat, 1 = folded
  const R = Math.SQRT1_2, lo = -.25, hi = 1.25;
  const X = x => 70 + (x - lo) / (hi - lo) * 400, Y = y => 420 - (y - lo) / (hi - lo) * 400;
  const uv = p => [(p[0] + p[1]) * R, (p[1] - p[0]) * R], xy = (u, v) => [(u - v) * R, (u + v) * R];
  // the half below the diagonal (v < 0) turns over like a page; at t = 1 it lies mirrored on the upper half
  const fold = (p, t) => { const [u, v] = uv(p); return v < 0 ? xy(u, v * Math.cos(Math.PI * t)) : p; };
  const PTS = [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]];
  const ticks = []; for (let v = -.25; v <= 1.251; v += .125) ticks.push(v);
  const samp = []; for (let k = 0; k <= 48; k++) samp.push(lo + k / 48 * (hi - lo));
  const path = pts => pts.map((q, k) => (k ? 'L' : 'M') + X(q[0]).toFixed(1) + ',' + Y(q[1]).toFixed(1)).join('');
  function grid(t, lower) {   // grid lines of one half only
    const g = el('g', {}, svg), keep = p => lower ? p[1] <= p[0] + 1e-9 : p[1] >= p[0] - 1e-9;
    ticks.forEach(v => [s => [v, s], s => [s, v]].forEach(f => {
      const pts = samp.map(f).filter(keep);
      if (pts.length > 1) el('path', { d: path(pts.map(p => fold(p, t))), fill: 'none', stroke: lower ? ORG : BLUE, 'stroke-width': 1, opacity: .45 }, g);
    }));
  }
  function render(t) {
    while (svg.firstChild) svg.firstChild.remove();
    el('rect', { x: X(lo), y: Y(hi), width: X(hi) - X(lo), height: Y(lo) - Y(hi), fill: '#fafbfd', stroke: LINE }, svg);
    // upper half (stays) and lower half (turns over), each a triangle of the box
    el('polygon', { points: [[lo, lo], [lo, hi], [hi, hi]].map(p => X(p[0]) + ',' + Y(p[1])).join(' '), fill: '#e4edff', opacity: .7 }, svg);
    grid(t, false);
    const flip = Math.abs(Math.cos(Math.PI * t));
    el('polygon', { points: [[lo, lo], [hi, lo], [hi, hi]].map(p => fold(p, t)).map(p => X(p[0]) + ',' + Y(p[1])).join(' '), fill: '#ffe8d9', opacity: .55 + .3 * (1 - flip), stroke: ORG, 'stroke-width': 1.5 }, svg);
    grid(t, true);
    // the fold line
    el('line', { x1: X(lo), y1: Y(lo), x2: X(hi), y2: Y(hi), stroke: INK, 'stroke-width': 2.5, 'stroke-dasharray': '3 5' }, svg);
    txt(svg, X(1.12), Y(1.2) - 2, '摺線 x₁ = x₂', { 'font-size': 15, fill: INK, 'text-anchor': 'end', 'font-weight': 600 });
    // after the fold: the separating line x2 − x1 = 0.5, i.e. |x1 − x2| = 0.5
    if (t > .97) {
      el('line', { x1: X(lo), y1: Y(lo + .5), x2: X(hi - .5), y2: Y(hi), stroke: GRN, 'stroke-width': 4, 'stroke-dasharray': '10 6' }, svg);
      txt(svg, X(.12), Y(1.12), '|x₁ − x₂| = 0.5', { 'font-size': 17, fill: GRN, 'font-weight': 700, 'text-anchor': 'end' });
    }
    PTS.forEach(([a, b, v]) => {
      const q = fold([a, b], t), moving = a === 1 && b === 0;
      el('circle', { cx: X(q[0]), cy: Y(q[1]), r: moving ? 16 : 19, fill: v ? GRN : RED, stroke: moving ? ORG : '#fff', 'stroke-width': 3 }, svg);
      txt(svg, X(q[0]), Y(q[1]) + 7, v, { 'font-size': 18, fill: '#fff', 'font-weight': 700 });
      txt(svg, X(q[0]) + (moving ? 30 : -30), Y(q[1]) + (moving && t > .5 ? 24 : -14), `(${a},${b})`, { 'font-size': 14, fill: moving ? ORG : MUTE, 'font-weight': moving ? 700 : 400 });
    });
    txt(svg, X(.5), Y(lo) + 30, 'x₁', { 'font-size': 18, fill: MUTE });
    txt(svg, X(lo) - 22, Y(.5) + 6, 'x₂', { 'font-size': 18, fill: MUTE });
    cur = t;
  }
  let anim = null;
  $('#fold-reset').addEventListener('click', e => {   // back to the flat plane, without playing
    e.stopPropagation(); e.currentTarget.blur();
    cancelAnimationFrame(anim); anim = null; render(0);
  });
  function animTo(T) {   // play the fold up to t = T (1 = fully folded; replays from flat when already folded)
    cancelAnimationFrame(anim);
    let t = cur > T - 1e-6 && T === 1 ? 0 : cur, last = performance.now();
    if (t > T) t = 0;
    (function frame(now) {
      t = Math.min(T, t + (now - last) / 2400); last = now;
      render(t);
      if (t < T && slide.classList.contains('active')) anim = requestAnimationFrame(frame); else anim = null;
    })(last);
  }
  $('#fold-play').addEventListener('click', e => { e.stopPropagation(); e.currentTarget.blur(); animTo(1); });
  render(0);
})();

/* ---------- interactive slides (data-lock) get a small checkbox, top right, that turns off text selection ---------- */
(function () {
  const KEY = 'chi3242-bert-lock';
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

/* ---------- activation functions: step, sigmoid, tanh, ReLU ---------- */
(function () {
  const plot = (id, f, ymin, ymax, yt, color, opt = {}) => {
    const svg = $('#' + id), L = 34, R = 228, T = 12, B = 146, zmin = -4, zmax = 4;
    const X = z => L + (z - zmin) / (zmax - zmin) * (R - L), Y = y => B - (y - ymin) / (ymax - ymin) * (B - T);
    [-4, -2, 0, 2, 4].forEach(z => el('line', { x1: X(z), y1: T, x2: X(z), y2: B, stroke: z ? '#eef0f4' : '#9aa3b5', 'stroke-width': z ? 1 : 1.6 }, svg));
    yt.forEach(y => {
      el('line', { x1: L, y1: Y(y), x2: R, y2: Y(y), stroke: y ? '#eef0f4' : '#9aa3b5', 'stroke-width': y ? 1 : 1.6 }, svg);
      txt(svg, L - 7, Y(y) + 5, y < 0 ? '−' + Math.abs(y) : y, { 'font-size': 14, fill: MUTE, 'text-anchor': 'end' });
    });
    [-4, 0, 4].forEach(z => txt(svg, X(z), B + 18, z < 0 ? '−' + Math.abs(z) : z, { 'font-size': 14, fill: MUTE }));
    txt(svg, R + 9, B + 4, 'z', { 'font-size': 15, fill: MUTE, 'font-style': 'italic', 'text-anchor': 'start' });
    const pts = [];
    for (let k = 0; k <= 160; k++) { const z = zmin + k / 160 * (zmax - zmin); pts.push([X(z), Y(f(z))]); }
    if (opt.step) {   // draw the jump with an open and a filled dot
      el('path', { d: `M${X(zmin)},${Y(0)} L${X(0)},${Y(0)} M${X(0)},${Y(1)} L${X(zmax)},${Y(1)}`, fill: 'none', stroke: color, 'stroke-width': 4, 'stroke-linecap': 'round' }, svg);
      el('line', { x1: X(0), y1: Y(0), x2: X(0), y2: Y(1), stroke: color, 'stroke-width': 1.5, 'stroke-dasharray': '3 4' }, svg);
      el('circle', { cx: X(0), cy: Y(0), r: 5, fill: color }, svg);
      el('circle', { cx: X(0), cy: Y(1), r: 5, fill: '#fff', stroke: color, 'stroke-width': 2.5 }, svg);
      return;
    }
    const d = pts.map((p, k) => (k ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('');
    const base = Y(Math.max(ymin, 0));
    el('path', { d: d + `L${X(zmax)},${base}L${X(zmin)},${base}Z`, fill: color, opacity: .08 }, svg);
    el('path', { d, fill: 'none', stroke: color, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
  };
  plot('act-step', z => z > 0 ? 1 : 0, -.25, 1.25, [0, 1], INK, { step: true });
  plot('act-sig', sigm, -.25, 1.25, [0, 1], BLUE);
  plot('act-tanh', Math.tanh, -1.25, 1.25, [-1, 0, 1], PUR);
  plot('act-relu', z => Math.max(0, z), -1, 4.2, [0, 2, 4], GRN);
})();

/* ---------- 《紅樓夢》 emotional space in 3D: 9,019 passages (UMAP 3D), coloured by an emotion axis; drag to turn, click a passage to see its nearest neighbours (window.HLM) ---------- */
(function () {
  const H = window.HLM, N = H.x.length, cv = $('#hlm-cv'), g = cv.getContext('2d'), sel = $('#hlm-axis'), tip = $('#hlm-tip'), slide = $('#s-hlm');
  const W = 620, Hh = 440, R = 2;
  g.setTransform(R, 0, 0, R, 0, 0);
  // centre and scale the cloud into the unit sphere
  const mean = a => a.reduce((s, v) => s + v, 0) / a.length, mx = mean(H.x), my = mean(H.y), mz = mean(H.z);
  // scale to the bulk of the cloud (98th percentile), so a few outliers do not shrink it
  const dist = Array.from({ length: N }, (_, i) => Math.hypot(H.x[i] - mx, H.y[i] - my, H.z[i] - mz)).sort((u, v) => u - v);
  const rad = dist[Math.floor(N * .98)];
  const P3 = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { P3[3 * i] = (H.x[i] - mx) / rad; P3[3 * i + 1] = (H.y[i] - my) / rad; P3[3 * i + 2] = (H.z[i] - mz) / rad; }
  const SX = new Float32Array(N), SY = new Float32Array(N), SD = new Float32Array(N);
  let yaw = .6, pitch = .35, auto = true, drag = null, raf = null;
  const mix = (a, b, t) => a.map((v, j) => Math.round(v + (b[j] - v) * t));
  const SAD = [224, 87, 15], MID = [205, 210, 220], HAP = [31, 157, 85];
  let mode = 0, pick = 2197, hover = -1, cols = [];
  const colour = i => {
    if (mode === H.axes.length) { const t = (H.c[i] - 1) / 119; return `rgb(${mix([190, 205, 240], [20, 50, 140], t)})`; }   // by chapter
    const z = Math.max(-2.5, Math.min(2.5, H.s[mode][i])) / 2.5;
    return `rgb(${z < 0 ? mix(MID, SAD, -z) : mix(MID, HAP, z)})`;
  };
  const recolour = () => { cols = Array.from({ length: N }, (_, i) => colour(i)); };
  function project() {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), S = 270;
    for (let i = 0; i < N; i++) {
      const x = P3[3 * i], y = P3[3 * i + 1], z = P3[3 * i + 2];
      const x1 = x * cy - y * sy, y1 = x * sy + y * cy, d = y1 * cp + z * sp, up = z * cp - y1 * sp, k = 1 / (1 - d * .25);
      SX[i] = W / 2 + x1 * S * k; SY[i] = Hh / 2 - up * S * k; SD[i] = d;
    }
  }
  const order = [...Array(N).keys()];
  function draw() {
    project();
    g.clearRect(0, 0, W, Hh);
    g.fillStyle = '#fafbfd'; g.fillRect(0, 0, W, Hh);
    order.sort((a, b) => SD[a] - SD[b]);                       // far points first
    for (const i of order) { const k = .75 + .35 * (SD[i] + 1) / 2; g.fillStyle = cols[i]; g.globalAlpha = .55 + .35 * (SD[i] + 1) / 2; g.fillRect(SX[i] - 1.5 * k, SY[i] - 1.5 * k, 3 * k, 3 * k); }
    g.globalAlpha = 1;
    if (pick >= 0) {
      H.nn[pick].forEach(j => {
        g.strokeStyle = 'rgba(27,35,51,.6)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(SX[pick], SY[pick]); g.lineTo(SX[j], SY[j]); g.stroke();
        g.beginPath(); g.arc(SX[j], SY[j], 5, 0, 7); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2.2; g.strokeStyle = INK; g.stroke();
      });
      g.beginPath(); g.arc(SX[pick], SY[pick], 7.5, 0, 7); g.fillStyle = INK; g.fill(); g.lineWidth = 2.5; g.strokeStyle = '#fff'; g.stroke();
    }
    if (hover >= 0) { g.beginPath(); g.arc(SX[hover], SY[hover], 6, 0, 7); g.lineWidth = 2.5; g.strokeStyle = BLUE; g.stroke(); }
  }
  function nearest(x, y) {   // closest point on screen, preferring the front
    let best = -1, bd = 64;
    for (let i = 0; i < N; i++) { const d = (SX[i] - x) ** 2 + (SY[i] - y) ** 2 - SD[i] * 6; if (d < bd) { bd = d; best = i; } }
    return best;
  }
  const score = i => {
    if (mode === H.axes.length) return `第 ${H.c[i]} 回`;
    const a = H.axes[mode], z = H.s[mode][i];
    return `${z >= 0 ? a.pos : a.neg} ${(z >= 0 ? '+' : '−') + Math.abs(z).toFixed(1)}`;
  };
  function panel() {
    const i = pick;
    $('#hlm-pick').innerHTML = `<b>第 ${H.c[i]} 回 · ${H.titles[H.c[i] - 1]}</b>${H.t[i]}…… <span class="sc">${score(i)}</span>`;
    $('#hlm-nn').innerHTML = H.nn[i].slice(0, 4).map((j, r) => `<div data-i="${j}"><b>${H.ns[i][r].toFixed(2)}</b><span>第 ${H.c[j]} 回</span>${H.t[j].slice(0, 34)}……</div>`).join('');
    $$('#hlm-nn > div').forEach(d => d.addEventListener('click', e => { e.stopPropagation(); pick = +d.dataset.i; panel(); }));
  }
  function legend() {
    const L = $('#hlm-leg');
    if (mode === H.axes.length) L.innerHTML = '<span>第 1 回</span><i class="ch"></i><span>第 120 回</span>';
    else L.innerHTML = `<span class="n">${H.axes[mode].neg}</span><i></i><span class="p">${H.axes[mode].pos}</span>`;
  }
  const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * Hh]; };
  cv.addEventListener('pointerdown', e => { e.stopPropagation(); drag = { x: e.clientX, y: e.clientY, yaw, pitch, moved: false }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => {
    if (drag) {
      if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 4) return;
      drag.moved = true; auto = false; tip.style.opacity = 0;
      yaw = drag.yaw + (e.clientX - drag.x) * .008; pitch = Math.max(-1.4, Math.min(1.4, drag.pitch + (e.clientY - drag.y) * .008));
      return;
    }
    const [x, y] = pos(e), i = nearest(x, y);
    hover = i;
    if (i < 0) { tip.style.opacity = 0; return; }
    tip.innerHTML = `<b>第 ${H.c[i]} 回</b> ${H.t[i]}…… <span>${score(i)}</span>`;
    tip.style.left = Math.min(x + 14, W - 300) + 'px'; tip.style.top = Math.max(0, y - 54) + 'px'; tip.style.opacity = 1;
  });
  cv.addEventListener('pointerup', e => {
    if (drag && !drag.moved) { const [x, y] = pos(e), i = nearest(x, y); if (i >= 0) { pick = i; panel(); } }
    drag = null;
  });
  cv.addEventListener('pointerleave', () => { hover = -1; tip.style.opacity = 0; });
  sel.innerHTML = H.axes.map((a, i) => `<option value="${i}">${a.name}</option>`).join('') + `<option value="${H.axes.length}">回目 chapter</option>`;
  sel.addEventListener('keydown', e => e.stopPropagation());
  sel.addEventListener('change', () => { sel.blur(); mode = +sel.value; recolour(); legend(); panel(); });
  // animation loop while the slide is visible: slow automatic rotation until the viewer drags
  let last = 0;
  function frame(now) {
    if (!slide.classList.contains('active')) { raf = null; return; }
    if (auto) yaw += (now - (last || now)) / 1000 * .18;
    last = now; draw(); raf = requestAnimationFrame(frame);
  }
  window.HOOKS['s-hlm'] = { enter() { last = 0; if (!raf) raf = requestAnimationFrame(frame); } };
  recolour(); legend(); panel(); draw();
})();

/* ---------- how a network learns: forward pass, error at the output, error pulses travelling back (no maths) ---------- */
(function () {
  const svg = $('#bp-svg'), slide = $('#s-grad');
  const IX = 70, HX = 340, OX = 590, iy = i => 50 + i * 76, hy = j => 100 + j * 110, OY = 210;
  const HV = [.88, .31, .12], V = [1.2, .3, -.8];         // hidden activations and their weights to the output
  const ON = INPUTS.map(([, x]) => x > 0);                  // only 精彩 and 電影 occur in this review
  const gE = el('g', {}, svg), gN = el('g', {}, svg), gP = el('g', {}, svg), gS = el('g', {}, svg);
  const e1 = [], e2 = [];
  INPUTS.forEach((_, i) => HV.forEach((__, j) => e1.push({ i, j, l: el('line', { x1: IX + 26, y1: iy(i), x2: HX - 32, y2: hy(j), stroke: '#c3c8d2', 'stroke-width': ON[i] ? 2 : 1.2 }, gE) })));
  HV.forEach((_, j) => e2.push({ j, l: el('line', { x1: HX + 32, y1: hy(j), x2: OX - 36, y2: OY, stroke: BLUE, 'stroke-width': 1.5 + Math.abs(V[j]) * 3, opacity: .6 }, gE) }));
  INPUTS.forEach(([w, x], i) => {
    el('circle', { cx: IX, cy: iy(i), r: 26, fill: '#fff', stroke: INK, 'stroke-width': 2, opacity: ON[i] ? 1 : .55 }, gN);
    txt(gN, IX, iy(i) + 6, w, { 'font-size': 17, opacity: ON[i] ? 1 : .55 });
  });
  const hc = HV.map((h, j) => el('circle', { cx: HX, cy: hy(j), r: 32, fill: `rgba(31,95,214,${h})`, stroke: INK, 'stroke-width': 2.5 }, gN));
  HV.forEach((h, j) => txt(gN, HX, hy(j) + 7, h.toFixed(2), { 'font-size': 17, 'font-weight': 700, fill: h > .5 ? '#fff' : INK }));
  const oc = el('circle', { cx: OX, cy: OY, r: 38, fill: '#fff', stroke: INK, 'stroke-width': 2.5 }, gN);
  const ov = txt(gN, OX, OY + 8, '?', { 'font-size': 24, 'font-weight': 700 });
  txt(gN, OX, OY - 52, '正面？', { 'font-size': 18, fill: GRN, 'font-weight': 700 });
  const ans = el('g', { opacity: 0 }, gN);
  el('rect', { x: OX - 62, y: OY + 52, width: 124, height: 34, rx: 9, fill: '#e0f4e7' }, ans);
  txt(ans, OX, OY + 75, '正確答案：1', { 'font-size': 17, fill: '#157a3c', 'font-weight': 700 });
  // static marks for later steps
  const err = el('g', { 'data-step': 1 }, gS);
  el('rect', { x: OX - 58, y: OY - 116, width: 116, height: 38, rx: 10, fill: '#fde9e7', stroke: RED, 'stroke-width': 2 }, err);
  txt(err, OX, OY - 90, '誤差 −0.27', { 'font-size': 19, fill: RED, 'font-weight': 700 });
  const dir = el('g', { 'data-step': 2 }, gS);
  HV.forEach((_, j) => {
    const up = V[j] > 0, c = up ? GRN : RED;
    // a labelled pill: should this neuron's value go up or down to raise the (too low) output?
    el('rect', { x: HX - 62, y: hy(j) - 74, width: 124, height: 30, rx: 15, fill: up ? '#e0f4e7' : '#fde9e7', stroke: c, 'stroke-width': 2 }, dir);
    txt(dir, HX, hy(j) - 53, up ? 'h 要變大 ↑' : 'h 要變小 ↓', { 'font-size': 17, fill: c, 'font-weight': 700 });
  });
  // the weights to the output explain the direction: positive weight → up, negative weight → down
  HV.forEach((_, j) => {
    const mx = HX + 32 + (OX - 36 - HX - 32) * .5, my = hy(j) + (OY - hy(j)) * .5;
    txt(gS, mx, my + (j === 0 ? -12 : j === 2 ? 24 : -10), (V[j] > 0 ? '+' : '−') + Math.abs(V[j]).toFixed(1), { 'font-size': 16, fill: V[j] > 0 ? BLUE : ORG, 'font-weight': 700, stroke: '#fff', 'stroke-width': 5, 'paint-order': 'stroke' });
  });
  const zero = el('g', { 'data-step': 3 }, gS);
  INPUTS.forEach(([, x], i) => { if (!ON[i]) txt(zero, IX - 34, iy(i) + 5, '不變', { 'font-size': 13, fill: MUTE, 'text-anchor': 'end' }); });

  // pulses: small dots that run along edges
  let pulses = [], raf = null;
  const add = (x1, y1, x2, y2, col, delay, dur) => pulses.push({ x1, y1, x2, y2, col, t0: performance.now() + delay, dur });
  function tick(now) {
    while (gP.firstChild) gP.firstChild.remove();
    pulses = pulses.filter(p => now < p.t0 + p.dur);
    pulses.forEach(p => {
      const k = (now - p.t0) / p.dur; if (k < 0) return;
      el('circle', { cx: p.x1 + (p.x2 - p.x1) * k, cy: p.y1 + (p.y2 - p.y1) * k, r: 7, fill: p.col, opacity: .9 }, gP);
    });
    if (pulses.length && slide.classList.contains('active')) raf = requestAnimationFrame(tick); else { raf = null; while (gP.firstChild) gP.firstChild.remove(); }
  }
  const run = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); };
  const later = (ms, f) => setTimeout(() => { if (slide.classList.contains('active')) f(); }, ms);
  function forward() {
    ov.textContent = '?'; ans.setAttribute('opacity', 0);
    e1.forEach(e => { if (ON[e.i]) add(IX + 26, iy(e.i), HX - 32, hy(e.j), BLUE, 0, 700); });
    e2.forEach(e => add(HX + 32, hy(e.j), OX - 36, OY, BLUE, 750, 700));
    run(); later(1500, () => { ov.textContent = '0.73'; ans.setAttribute('opacity', 1); });
  }
  function backHidden() {
    e2.forEach(e => add(OX - 36, OY, HX + 32, hy(e.j), RED, 0, 800));
    run();
  }
  function backInputs() {
    e1.forEach(e => { if (ON[e.i]) add(HX - 32, hy(e.j), IX + 26, iy(e.i), RED, 0, 800); });
    run();
    later(800, () => e1.forEach(e => { if (ON[e.i]) { e.l.setAttribute('stroke', RED); later(500, () => e.l.setAttribute('stroke', '#c3c8d2')); } }));
  }
  let last = -1;
  window.HOOKS['s-grad'] = {
    enter() { last = -1; },
    render(step) {   // animate only when entering, or when stepping forward by one
      const fresh = last === -1;
      if (fresh && step === 0) forward();
      else { ov.textContent = '0.73'; ans.setAttribute('opacity', 1); }
      if (!fresh && step === last + 1) { if (step === 2) backHidden(); if (step === 3) backInputs(); }
      last = step;
    }
  };
})();

/* ---------- recap: a 2×2 matrix W transforms the plane; x = (1, 2) becomes Wx ---------- */
(function () {
  const svg = $('#la-svg'), X0 = [1, 2], slide = $('#s-linalg');
  const S = 46, CX = 235, CY = 225, X = x => CX + x * S, Y = y => CY - y * S;
  let M = { a: 1, b: 0, c: 0, d: 1 }, shown = { ...M }, raf = null;
  const apply = (m, [x, y]) => [m.a * x + m.b * y, m.c * x + m.d * y];
  const num = v => (v < 0 ? '−' : '') + (Math.abs(v) % 1 ? Math.abs(v).toFixed(1) : Math.abs(v));
  function draw() {
    while (svg.firstChild) svg.firstChild.remove();
    const cp = el('clipPath', { id: 'la-clip' }, svg); el('rect', { x: 10, y: 10, width: 450, height: 430, rx: 10 }, cp);
    el('rect', { x: 10, y: 10, width: 450, height: 430, rx: 10, fill: '#fafbfd', stroke: LINE }, svg);
    const g = el('g', { 'clip-path': 'url(#la-clip)' }, svg);
    // the original grid, faint
    for (let v = -6; v <= 6; v++) {
      el('line', { x1: X(v), y1: Y(-6), x2: X(v), y2: Y(6), stroke: v ? '#eceef3' : '#c3c8d2', 'stroke-width': v ? 1 : 1.5 }, g);
      el('line', { x1: X(-6), y1: Y(v), x2: X(6), y2: Y(v), stroke: v ? '#eceef3' : '#c3c8d2', 'stroke-width': v ? 1 : 1.5 }, g);
    }
    // the transformed grid
    for (let v = -8; v <= 8; v++) {
      const [a1, b1] = apply(shown, [v, -8]), [a2, b2] = apply(shown, [v, 8]), [c1, d1] = apply(shown, [-8, v]), [c2, d2] = apply(shown, [8, v]);
      el('line', { x1: X(a1), y1: Y(b1), x2: X(a2), y2: Y(b2), stroke: BLUE, 'stroke-width': v ? 1 : 2.2, opacity: v ? .28 : .7 }, g);
      el('line', { x1: X(c1), y1: Y(d1), x2: X(c2), y2: Y(d2), stroke: BLUE, 'stroke-width': v ? 1 : 2.2, opacity: v ? .28 : .7 }, g);
    }
    // x and Wx
    arrow(g, X(0), Y(0), X(X0[0]), Y(X0[1]), { color: '#8e98ab', w: 3.5, head: 14 });
    txt(g, X(X0[0]) + 10, Y(X0[1]) - 6, 'x', { 'font-size': 24, fill: '#6a7386', 'font-weight': 700, 'font-style': 'italic', 'text-anchor': 'start', stroke: '#fff', 'stroke-width': 5, 'paint-order': 'stroke' });
    const [wx, wy] = apply(shown, X0);
    arrow(g, X(0), Y(0), X(wx), Y(wy), { color: QRED, w: 4, head: 16 });
    txt(g, X(wx) + (wx >= 0 ? 10 : -10), Y(wy) + (wy >= 0 ? -8 : 22), 'y = Wx', { 'font-size': 24, fill: QRED, 'font-weight': 700, 'font-style': 'italic', 'text-anchor': wx >= 0 ? 'start' : 'end', stroke: '#fff', 'stroke-width': 5, 'paint-order': 'stroke' });
  }
  function readout() {
    const [rx, ry] = apply(M, X0), r = $$('#la-res span');
    r[0].textContent = num(rx); r[1].textContent = num(ry);
    $('#la-calc').innerHTML = `<div><b>第一列 row 1</b> ${num(M.a)}·1 + ${num(M.b)}·2 ＝ <b class="r">${num(rx)}</b></div><div><b>第二列 row 2</b> ${num(M.c)}·1 + ${num(M.d)}·2 ＝ <b class="r">${num(ry)}</b></div>`;
    $$('#la-mat select').forEach(s => { s.value = String(M[s.dataset.k]); });
    $$('#la-presets button').forEach(b => b.classList.toggle('on', b.dataset.m === [M.a, M.b, M.c, M.d].join(',')));
  }
  function animateTo() {   // the grid slides from its current shape to the new one
    cancelAnimationFrame(raf);
    const from = { ...shown }, t0 = performance.now();
    (function f(now) {
      const t = Math.min(1, (now - t0) / 700), e = t * t * (3 - 2 * t);
      for (const k in M) shown[k] = from[k] + (M[k] - from[k]) * e;
      draw();
      if (t < 1 && slide.classList.contains('active')) raf = requestAnimationFrame(f); else { shown = { ...M }; draw(); }
    })(t0);
  }
  const VALS = []; for (let v = -2; v <= 2.001; v += .5) VALS.push(+v.toFixed(1));
  $$('#la-mat select').forEach(s => {
    s.innerHTML = VALS.map(v => `<option value="${v}">${num(v)}</option>`).join('');
    s.addEventListener('keydown', e => e.stopPropagation());
    s.addEventListener('change', () => { M[s.dataset.k] = +s.value; s.blur(); readout(); animateTo(); });
  });
  $$('#la-presets button').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation(); b.blur();
    const [a, bb, c, d] = b.dataset.m.split(',').map(Number); M = { a, b: bb, c, d }; readout(); animateTo();
  }));
  readout(); draw();
})();

/* ---------- laser pointer: press L to swap the cursor for a red dot; L again to turn it off ---------- */
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
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
