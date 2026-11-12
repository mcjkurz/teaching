/* Neural-network playground on MNIST digits.
   Copied from the CHI3242 "bert" slide deck (slides.js); keep the two in sync by hand. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const BLUE = '#1f5fd6', ORG = '#e0570f', INK = '#1b2333', MUTE = '#6a7386', LINE = '#dde1e8';
const NS = 'http://www.w3.org/2000/svg';
function el(tag, attrs, parent, text) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  if (parent) parent.appendChild(e);
  return e;
}

/* ---------- neural-network playground on MNIST digits ---------- */
(function () {
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
  lrSel.addEventListener('keydown', e => e.stopPropagation());   // keep the arrow keys inside the dropdown
  lrSel.addEventListener('change', () => { st.lr = Number(lrSel.value); lrSel.blur(); if (st.diverged) rebuild(); });

  /* ---- main loop: train in ~12 ms slices per frame (or one batch per 150 ms in slow motion) ---- */
  let lastViz = 0, lastSlow = 0;
  function loop(t) {
    requestAnimationFrame(loop);
    const active = !document.hidden;
    if (st.running && !active) setRunning(false);
    if (st.running) {
      if (!st.slow) { const t0 = performance.now(); do step(); while (st.running && performance.now() - t0 < 12); }
      else if (t - lastSlow > 150) { lastSlow = t; step(); }
    }
    if (active && st.dirty && t - lastViz > (st.running ? 90 : 30)) { lastViz = t; st.dirty = false; drawViz(); }
  }

  // keyboard shortcuts: T train / pause, R reset, C clear the pad, N new test digit
  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey || /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
    const k = e.key.toLowerCase();
    if (k === 't') $('#b-train').click();
    else if (k === 'r') $('#b-reset').click();
    else if (k === 'c') clearPad();
    else if (k === 'n') showTest();
    else return;
    e.preventDefault();
  });

  rebuild();
  showTest();
  requestAnimationFrame(loop);
})();

/* ---------- optional lock: no text selection while drawing or dragging ---------- */
(function () {
  const box = document.getElementById('nn-lock'), stage = document.querySelector('.nn-stage');
  box.addEventListener('change', () => { stage.classList.toggle('locked', box.checked); box.blur(); });
})();

/* ---------- the playground is laid out at a fixed 1108 x 520 px and scaled to the page width ---------- */
(function () {
  const box = document.querySelector('.nn-fit'), stage = document.querySelector('.nn-stage');
  const fit = () => {
    const k = Math.min(1, box.clientWidth / 1108);
    stage.style.transform = `scale(${k})`;
    box.style.height = 520 * k + 'px';
  };
  addEventListener('resize', fit);
  fit();
})();
