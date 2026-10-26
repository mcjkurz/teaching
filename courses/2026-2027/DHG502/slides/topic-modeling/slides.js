/* Slide-specific logic (loaded before deck.js). */
window.HOOKS = {};
window.SECTIONS = [
  { id: 'intro',   zh: '主題與建模',   en: 'Topics and modeling' },
  { id: 'lda',     zh: 'LDA 的直覺',   en: 'The intuition behind LDA' },
  { id: 'dist',    zh: '兩種分布',     en: 'Two distributions' },
  { id: 'gibbs',   zh: '吉布斯採樣',   en: 'Gibbs sampling' },
  { id: 'k',       zh: '主題數 K',     en: 'How many topics?' },
  { id: 'alpha',   zh: 'α 與 β',       en: 'Dirichlet & hyperparameters' },
  { id: 'dh',      zh: '歷史與應用',   en: 'History and applications' },
  { id: 'eval',    zh: '評估與實踐',   en: 'Evaluation and practice' },
  { id: 'summary', zh: '總結',         en: 'Summary' }
];
const $ = (s, r = document) => r.querySelector(s);

/* ---------- LaTeX: write \( inline \) anywhere in the text; KaTeX is bundled in vendor/ ---------- */
function texify(root) {
  const re = /\\\((.+?)\\\)|\\\[(.+?)\\\]/gs;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) if (/\\[(\[]/.test(walker.currentNode.nodeValue)) nodes.push(walker.currentNode);
  nodes.forEach(n => {
    const txt = n.nodeValue, frag = document.createDocumentFragment();
    let last = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(txt))) {
      if (m.index > last) frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
      const span = document.createElement('span');
      span.className = m[2] != null ? 'tex tex-block' : 'tex';
      try { katex.render((m[1] ?? m[2]).trim(), span, { throwOnError: false, strict: false, displayMode: false }); }
      catch (e) { span.textContent = m[0]; }
      frag.appendChild(span);
      last = re.lastIndex;
    }
    if (last < txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
    n.parentNode.replaceChild(frag, n);
  });
}

/* ---------- shared helpers ---------- */
const TC = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#d97706', '#0891b2'];   // topic colours = --t0 … --t5
const TNAME = ['blue', 'green', 'red', 'purple', 'orange', 'teal'];
// seeded random numbers (mulberry32), so the "random" pictures are the same every time
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function normal(r) { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }
// log of a Gamma(a, 1) draw (Marsaglia–Tsang); logs keep tiny α from underflowing to 0
function logGamma(a, r) {
  if (a < 1) return logGamma(a + 1, r) + Math.log(r() || 1e-300) / a;
  const d = a - 1 / 3, c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x, v;
    do { x = normal(r); v = 1 + c * x; } while (v <= 0);
    v = v * v * v;
    const u = r();
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return Math.log(d * v);
  }
}
function dirichlet(alpha, K, r) {
  const l = Array.from({ length: K }, () => logGamma(alpha, r));
  const m = Math.max(...l), e = l.map(x => Math.exp(x - m)), s = e.reduce((a, b) => a + b, 0);
  return e.map(x => x / s);
}
function pickIndex(p, r) {
  let u = r() * p.reduce((a, b) => a + b, 0), k = 0;
  while (k < p.length - 1 && u >= p[k]) { u -= p[k]; k++; }
  return k;
}
const wchip = (t, cls = '') => { const s = document.createElement('span'); s.className = 'w ' + cls; s.textContent = t; return s; };
const setK = (el, k) => { el.classList.remove('k0', 'k1', 'k2', 'k3', 'k4', 'k5', 'kx'); if (k != null) el.classList.add(k < 0 ? 'kx' : 'k' + k); };
const pct = x => Math.round(100 * x) + '%';

/* ---------- collapsed Gibbs sampler for LDA ----------
 * docs: arrays of word ids; z: topic of every token.
 * remove(d, i) takes one token out and returns P(topic) for it; assign(d, i, k) puts it back with topic k.
 * Tokens are visited in order (document by document), one full pass = one sweep. */
class LDA {
  constructor(docs, V, K, alpha, beta, z, r) {
    Object.assign(this, { docs, V, K, alpha, beta, r });
    this.z = z ? z.map(row => row.slice()) : docs.map(d => d.map(() => Math.floor(r() * K)));
    this.ndk = docs.map(() => new Array(K).fill(0));
    this.nkw = Array.from({ length: K }, () => new Array(V).fill(0));
    this.nk = new Array(K).fill(0);
    docs.forEach((d, i) => d.forEach((w, j) => this.add(i, j, this.z[i][j])));
    this.pos = [0, 0]; this.steps = 0; this.sweeps = 0;
  }
  add(d, i, k) { const w = this.docs[d][i]; this.z[d][i] = k; this.ndk[d][k]++; this.nkw[k][w]++; this.nk[k]++; }
  remove(d, i) {
    const w = this.docs[d][i], k = this.z[d][i];
    this.ndk[d][k]--; this.nkw[k][w]--; this.nk[k]--; this.z[d][i] = -1;
    const p = this.ndk[d].map((n, q) => (n + this.alpha) * (this.nkw[q][w] + this.beta) / (this.nk[q] + this.V * this.beta));
    const s = p.reduce((a, b) => a + b, 0);
    return p.map(x => x / s);
  }
  assign(d, i, k) { this.add(d, i, k); }
  // advance the scan position; true when a sweep has just been completed
  advance() {
    this.steps++;
    let [d, i] = this.pos;
    if (++i >= this.docs[d].length) { i = 0; if (++d >= this.docs.length) { d = 0; this.sweeps++; this.pos = [d, i]; return true; } }
    this.pos = [d, i];
    return false;
  }
  step() {
    const [d, i] = this.pos, p = this.remove(d, i), k = pickIndex(p, this.r);
    this.assign(d, i, k);
    return { d, i, p, k, sweep: this.advance() };
  }
  sweep() { const n = this.sweeps; while (this.sweeps === n) this.step(); }
  // perplexity of the corpus under the current counts: exp(−average log P(word | its document)).
  // Lower is better; with V distinct words, random guessing gives about V.
  perplexity() {
    let ll = 0, n = 0;
    this.docs.forEach((doc, d) => doc.forEach(w => {
      let p = 0;
      for (let k = 0; k < this.K; k++) p += (this.ndk[d][k] + this.alpha) / (doc.length + this.K * this.alpha) * (this.nkw[k][w] + this.beta) / (this.nk[k] + this.V * this.beta);
      ll += Math.log(p); n++;
    }));
    return Math.exp(-ll / n);
  }
}

/* ---------- the toy corpus (after Serrano.Academy) ---------- */
// Serrano's first document; the others were chosen by simulation so that the sampler settles on
// 足球 / 公投 / 行星+星系 reliably (about 93% of sweeps after burn-in, with α = 0.1, β = 0.01)
const TOY = [['足球', '足球', '足球', '行星', '星系'], ['行星', '行星', '星系', '星系', '公投'], ['行星', '行星', '行星', '星系', '星系'], ['足球', '足球', '公投', '公投', '公投']];
const TOY_V = ['足球', '行星', '星系', '公投'];
const TOY_IDS = TOY.map(d => d.map(w => TOY_V.indexOf(w)));
// random-looking start: for the first 足球 of doc 1 the counts are doc (2, 0, 2) and word (0, 1, 3), as in Serrano's video
const Z_INIT = [[0, 2, 2, 0, 0], [2, 0, 1, 0, 1], [0, 1, 2, 0, 1], [1, 2, 0, 2, 1]];
// a "converged" colouring, used for the two-distributions slide
const Z_FINAL = [[2, 2, 2, 0, 0], [0, 0, 0, 0, 1], [0, 0, 0, 0, 0], [2, 2, 1, 1, 1]];

// clipboards; returns the chip elements as chips[d][i]
function buildDocs(host, docs, { mix = false, plain = false } = {}) {
  host.innerHTML = '';
  const chips = docs.map((words, d) => {
    const box = document.createElement('div');
    box.className = 'doc'; box.dataset.name = `Doc ${d + 1}`;
    const row = words.map(w => box.appendChild(wchip(w, plain ? 'plain' : '')));
    if (mix) {
      box.insertAdjacentHTML('beforeend', '<div class="mix"></div><div class="mixlbl"></div>');
      row.mix = box.querySelector('.mix'); row.lbl = box.querySelector('.mixlbl');
    }
    host.appendChild(box);
    return row;
  });
  return chips;
}
function paintDocs(chips, z) { chips.forEach((row, d) => row.forEach((c, i) => setK(c, z ? z[d][i] : null))); }
function paintMix(row, counts) {
  const n = counts.reduce((a, b) => a + b, 0) || 1;
  row.mix.innerHTML = counts.map((c, k) => `<div style="width:${100 * c / n}%;background:${TC[k]}"></div>`).join('');
  row.lbl.innerHTML = counts.map((c, k) => c ? `<span style="color:${TC[k]}">${pct(c / n)}</span>` : '').filter(Boolean).join(' · ');
}

/* ---------- reality vs. model: the octagon slides over the circle, but never covers it exactly ---------- */
(function () {
  const CY = 260, R = 150, X0 = 205;                     // reality: circle
  const OCT = Array.from({ length: 8 }, (_, k) => { const a = Math.PI / 8 + k * Math.PI / 4, r = 151.5; return `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`; }).join(' ');
  const POS = [700, 400, 300, 215];                      // octagon centre per step (700 = off stage)
  const GREEN = '#3f9d4a', BLUE = '#4a72c4', ORANGE = '#e0570f';
  let el;
  function build() {
    const svg = $('#rm-svg', el);
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
      <text x="${X0 - 120}" y="88" font-size="26" font-weight="600" fill="${GREEN}">reality <tspan font-size="18" font-weight="400">現實</tspan></text>
      <g class="mv"><text x="10" y="-172" font-size="26" font-weight="600" fill="${BLUE}">our model <tspan font-size="18" font-weight="400">模型</tspan></text></g>
      <g class="rm-gap" font-size="20">
        <rect x="20" y="440" width="22" height="22" rx="4" fill="${GREEN}" opacity=".6"/><text x="52" y="458">reality the model misses <tspan fill="#6a7386" font-size="16">模型沒抓到的現實</tspan></text>
        <rect x="20" y="472" width="22" height="22" rx="4" fill="${ORANGE}" opacity=".6"/><text x="52" y="490">invalid values <tspan fill="#6a7386" font-size="16">現實中不存在的值</tspan></text>
      </g>`;
  }
  function place(v, animate) {
    el.querySelectorAll('#rm-svg .mv').forEach(n => {
      n.style.transition = animate ? 'transform 1.1s ease-in-out' : 'none';
      n.style.transform = `translate(${v}px, ${CY}px)`;
    });
  }
  HOOKS['s-model'] = {
    render(step, slide) {
      if (!el) { el = slide; build(); place(POS[0], false); }
      el.querySelectorAll('.rm-gap').forEach(g => { g.style.transition = 'opacity .5s .6s'; g.style.opacity = step >= 2 ? 1 : 0; });
      requestAnimationFrame(() => place(POS[Math.min(step, 3)], true));
    }
  };
})();

/* ---------- 4. bag of words ---------- */
(function () {
  const toks = '今年 的 足球 比賽 很 精彩 ， 球員 在 比賽 中 進球 ， 球迷 為 球員 歡呼 。'.split(' ');
  const STOP = new Set(['的', '很', '在', '中', '為', '，', '。']);
  let chips = null;
  HOOKS['s-bow'] = {
    render(step, el) {
      if (!chips) {
        const box = $('#bow-toks', el);
        chips = toks.map(t => box.appendChild(wchip(t)));
        const counts = {};
        toks.filter(t => !STOP.has(t)).forEach(t => { counts[t] = (counts[t] || 0) + 1; });
        $('#bow-bag', el).innerHTML = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([w, c]) => `<span>${w}<b>${c}</b></span>`).join('');
      }
      $('#bow-toks', el).classList.toggle('raw', step < 1);   // before segmentation: one unbroken line of text
      chips.forEach((c, i) => c.classList.toggle('stop', step >= 2 && STOP.has(toks[i])));
    }
  };
})();

/* ---------- 5. Blei's figure: arrows from the highlighted areas to their explanations ---------- */
(function () {
  // [box, label, step, side of the box the arrow leaves from, side of the label it points at]
  const ARROWS = [['hb-topics', 'lb-topics', 1, 'bottom', 'top'], ['hb-mix', 'lb-mix', 2, 'right', 'left'], ['hb-dots', 'lb-dots', 3, 'right', 'left']];
  // position inside the slide, ignoring the reveal transforms
  const box = (n, slide) => { let x = 0, y = 0; const w = n.offsetWidth, h = n.offsetHeight; while (n && n !== slide) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; } return { x, y, w, h }; };
  const at = (b, side) => side === 'bottom' ? [b.x + b.w / 2, b.y + b.h] : side === 'top' ? [b.x + 20, b.y] : side === 'right' ? [b.x + b.w, b.y + b.h / 2] : [b.x, b.y + 22];
  HOOKS['s-blei1'] = {
    render(step, el) {
      const svg = $('#b1-arrows', el);
      svg.innerHTML = '<defs><marker id="b1-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#dc2626"/></marker></defs>' +
        ARROWS.map(([b, l, st, s1, s2]) => {
          const [x1, y1] = at(box($('#' + b, el), el), s1); let [x2, y2] = at(box($('#' + l, el), el), s2);
          if (s2 === 'top') x2 = x1;   // straight down
          return `<line x1="${x1}" y1="${y1}" x2="${x2 - (s2 === 'left' ? 8 : 0)}" y2="${y2 - (s2 === 'top' ? 8 : 0)}" stroke="#dc2626" stroke-width="3.5" marker-end="url(#b1-head)" style="opacity:${step >= st ? 1 : 0};transition:opacity .4s"/>`;
        }).join('');
    }
  };
})();

/* ---------- 6. generative story ---------- */
(function () {
  const TOPICS = [
    { name: 'astronomy', words: [['行星', .35], ['星系', .3], ['望遠鏡', .2], ['太空', .15]] },
    { name: 'sports', words: [['足球', .35], ['比賽', .3], ['球員', .2], ['進球', .15]] },
    { name: 'politics', words: [['公投', .35], ['選舉', .3], ['政府', .2], ['投票', .15]] }
  ];
  const r = rng(3);
  let theta = [.6, .1, .3], timer = null, built = false, started = false;
  // the board: one strip per topic, as wide as its share; a dart lands at a random spot, the strip it hits is the topic
  const BW = 300, BH = 150;
  function showMix(el) {
    $('#gen-board', el).innerHTML = theta.map((p, k) => `<div class="strip" style="width:${100 * p}%;background:${TC[k]}">${p * BW > 46 ? `<span>${TOPICS[k].name}<br>${pct(p)}</span>` : ''}</div>`).join('');
  }
  function dart(el, u, v) {
    const board = $('#gen-board', el);
    board.querySelectorAll('.hit.now').forEach(h => { h.classList.remove('now'); h.textContent = ''; });
    const h = document.createElement('div');
    h.className = 'hit now'; h.textContent = '🎯';
    h.style.left = (u * BW) + 'px'; h.style.top = (v * BH) + 'px';
    board.appendChild(h);
  }
  function generate(el) {
    clearInterval(timer);
    const doc = $('#gen-doc', el);
    doc.innerHTML = '';
    $('#gen-board', el).querySelectorAll('.hit').forEach(h => h.remove());
    let n = 0;
    timer = setInterval(() => {
      if (!el.classList.contains('active') || n >= 12) { clearInterval(timer); return; }
      const u = r(), v = 0.08 + 0.84 * r();
      let k = 0, acc = theta[0];
      while (k < theta.length - 1 && u >= acc) acc += theta[++k];
      const t = TOPICS[k].words, w = t[pickIndex(t.map(x => x[1]), r)][0];
      dart(el, u, v);
      doc.appendChild(wchip(w, 'k' + k));
      n++;
    }, 650);
  }
  HOOKS['s-gen'] = {
    render(step, el) {
      if (!built) {
        $('#gen-topics', el).innerHTML = TOPICS.map((t, k) => `<div class="topic k${k}"><h4 style="color:${TC[k]}">Topic ${k + 1} (${t.name})</h4>${t.words.map(([w, p]) => `<div class="row"><span>${w}</span><span>${p.toFixed(2)}</span></div>`).join('')}</div>`).join('');
        showMix(el);
        built = true;
      }
      if (step >= 2 && !started) { started = true; generate(el); }
      if (step < 2 && started) { started = false; clearInterval(timer); $('#gen-doc', el).innerHTML = ''; }
    },
    key(e, step, el) {
      if (e.key.toLowerCase() !== 'g' || step < 1) return false;
      theta = dirichlet(0.8, 3, r);
      showMix(el);
      if (step >= 2) generate(el);
      return true;
    }
  };
})();

/* ---------- 8. two distributions (from the converged toy colouring) ---------- */
HOOKS['s-two'] = {
  render(step, el) {
    if (el._built) return;
    const m = new LDA(TOY_IDS, 4, 3, 0, 0, Z_FINAL, Math.random);
    const head = TNAME.slice(0, 3).map((n, k) => `<th class="num" style="color:${TC[k]}">${n}</th>`).join('');
    $('#theta-table', el).innerHTML = `<thead><tr><th></th>${head}<th style="width:120px"></th></tr></thead><tbody>` +
      m.ndk.map((r, d) => `<tr><td>Doc ${d + 1}</td>${r.map(c => `<td class="num">${(c / 5).toFixed(1)}</td>`).join('')}<td><div class="mix" style="margin:0">${r.map((c, k) => `<div style="width:${20 * c}%;background:${TC[k]}"></div>`).join('')}</div></td></tr>`).join('') + '</tbody>';
    $('#phi-table', el).innerHTML = `<thead><tr><th></th>${TOY_V.map(w => `<th class="num" style="font-family:var(--cjk)">${w}</th>`).join('')}</tr></thead><tbody>` +
      m.nkw.map((r, k) => `<tr><td style="color:${TC[k]};font-weight:600">Topic ${TNAME[k]}</td>${r.map(c => `<td class="num" style="${c ? '' : 'color:#b6bcc8'}">${(c / m.nk[k]).toFixed(2)}</td>`).join('')}</tr>`).join('') + '</tbody>';
    el._built = true;
  }
};

/* ---------- 9. the toy problem ---------- */
HOOKS['s-goal'] = {
  render(step, el) {
    if (!el._chips) el._chips = buildDocs($('#goal-docs', el), TOY);
    paintDocs(el._chips, step >= 4 ? Z_INIT : null);
  }
};

/* ---------- 10. one Gibbs step (Serrano's numbers) ----------
 * steps: 1 pick · 2 remove colour · 3–4 count · 5 multiply the raw counts (blue and green become 0)
 *        6 the problem with zeros · 7 add α = β = 0.5 (the rectangles grow back) · 8 dart → red */
(function () {
  const A = 0.5, B = 0.5, DOC = [2, 0, 2], WORD = [0, 1, 3];
  HOOKS['s-step'] = {
    render(step, el) {
      if (!el._chips) {
        el._chips = buildDocs($('#step-docs', el), TOY);
        const q = $('#step-q', el);
        q.innerHTML = '<div></div>' + [0, 1, 2].map(k => `<div class="hd" style="color:${TC[k]}">${TNAME[k]} · topic ${k + 1}</div>`).join('') +
          '<div class="q">How much of each topic is in document 1?<span class="en">文件 1 有幾個詞是這個顏色？</span></div>' + [0, 1, 2].map(k => `<div class="v q1" style="color:${TC[k]}"></div>`).join('') +
          '<div class="q">How much is 足球 in each topic?<span class="en">其他「足球」有幾個是這個顏色？</span></div>' + [0, 1, 2].map(k => `<div class="v q2" style="color:${TC[k]}"></div>`).join('');
        $('#step-rects', el).innerHTML = '<div class="q" style="align-self:center;font-size:17px">area ∝ probability<span class="en" style="display:block;font-size:13px">面積 ∝ 機率</span></div>' +
          [0, 1, 2].map(k => `<div class="r"><div class="dart" style="opacity:0;bottom:62px">🎯</div><div class="box" style="background:${TC[k]}"></div><div class="area"></div></div>`).join('');
      }
      const z = Z_INIT.map(r => r.slice());
      if (step >= 2) z[0][0] = -1;
      if (step >= 8) z[0][0] = 2;
      paintDocs(el._chips, z);
      el._chips[0][0].classList.toggle('pick', step >= 1);
      const plus = step >= 7, a = plus ? A : 0, b = plus ? B : 0;
      el.querySelectorAll('.q1').forEach((c, k) => { c.textContent = step >= 3 ? DOC[k] + (plus ? ' + α' : '') : ''; });
      el.querySelectorAll('.q2').forEach((c, k) => { c.textContent = step >= 4 ? WORD[k] + (plus ? ' + β' : '') : ''; });
      const prod = DOC.map((n, k) => (n + a) * (WORD[k] + b)), tot = prod.reduce((s, x) => s + x, 0);
      el.querySelectorAll('#step-rects .r').forEach((r, k) => {
        const box = r.querySelector('.box');
        box.style.width = (DOC[k] + a) * 40 + 'px';
        box.style.height = (WORD[k] + b) * 25 + 'px';
        r.querySelector('.area').innerHTML = `${DOC[k] + a} × ${WORD[k] + b} = <b>${+prod[k].toFixed(2)}</b><br>→ ${pct(prod[k] / tot)}`;
        r.querySelector('.area').style.color = !plus && prod[k] === 0 ? 'var(--bad)' : '';
        r.querySelector('.dart').style.opacity = step >= 8 && k === 2 ? 1 : 0;
      });
    }
  };
})();

/* ---------- 11. the Gibbs sampler, live ---------- */
(function () {
  const SPEEDS = [
    { name: 'slow', ms: 650, phased: true },
    { name: 'medium', ms: 220 },
    { name: 'fast', ms: 40 },
    { name: 'turbo', ms: 40, perTick: 20 }
  ];
  let m, chips, el, timer = null, speed = 0, phase = 0, last = null, hist = [];
  const reset = (z) => {
    m = new LDA(TOY_IDS, 4, 3, 0.1, 0.01, z, Math.random);
    phase = 0; last = null; hist = [m.perplexity()];
  };
  reset(Z_INIT);

  function tick() {
    if (!el.classList.contains('active')) { stop(); return; }
    const sp = SPEEDS[speed];
    if (sp.phased) {
      const [d, i] = m.pos;
      if (phase === 0) { last = { d, i, p: null, k: null }; phase = 1; }
      else if (phase === 1) { last.p = m.remove(d, i); phase = 2; }
      else {
        last.k = pickIndex(last.p, Math.random);
        m.assign(d, i, last.k);
        if (m.advance()) hist.push(m.perplexity());
        phase = 0;
      }
    } else {
      for (let n = 0; n < (sp.perTick || 1); n++) { last = m.step(); if (last.sweep) hist.push(m.perplexity()); }
    }
    draw();
  }
  function stop() { clearInterval(timer); timer = null; }
  function play() { stop(); timer = setInterval(tick, SPEEDS[speed].ms); }
  // finish a half-done phased step, so the model is consistent before switching to whole steps
  function settle() {
    if (phase === 2) { tick(); }
    else if (phase === 1) { phase = 0; last = null; }
  }

  function chart() {
    const svg = $('#gs-chart', el), W = 720, H = 150, L = 40, R = 10, T = 8, Bm = 22, LO = 2, HI = 4.2;
    const n = Math.max(40, hist.length - 1);
    const x = i => L + (W - L - R) * i / n, y = v => T + (H - T - Bm) * (1 - (Math.min(HI, v) - LO) / (HI - LO));
    let g = '';
    [2, 2.5, 3, 3.5, 4].forEach(v => { g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#e3e6ec"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v.toFixed(1)}</text>`; });
    g += `<line x1="${L}" x2="${W - R}" y1="${y(4)}" y2="${y(4)}" stroke="#9aa1ad" stroke-dasharray="6 5"/><text x="${W - R}" y="${y(4) - 5}" text-anchor="end">random guessing (4 words)</text>`;
    g += `<text x="${W - R}" y="${H - 4}" text-anchor="end">sweeps → ${hist.length - 1}</text>`;
    g += `<polyline points="${hist.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}" fill="none" stroke="#e0570f" stroke-width="3"/>`;
    const v = hist[hist.length - 1];
    g += `<circle cx="${x(hist.length - 1)}" cy="${y(v)}" r="5" fill="#e0570f"/><text x="${x(hist.length - 1) + (hist.length < n / 4 ? 10 : -9)}" y="${y(v) - 10}" text-anchor="${hist.length < n / 4 ? 'start' : 'end'}" style="fill:#e0570f;font-weight:600">${v.toFixed(2)}</text>`;
    svg.innerHTML = g;
  }

  function draw() {
    paintDocs(chips, m.z);
    chips.flat().forEach(c => c.classList.remove('pick'));
    if (last) chips[last.d][last.i].classList.add('pick');
    chips.forEach((row, d) => paintMix(row, m.ndk[d]));
    $('#gs-word', el).textContent = last ? `Doc ${last.d + 1} · “${TOY[last.d][last.i]}”` : '–';
    $('#gs-bars', el).innerHTML = [0, 1, 2].map(k => {
      const p = last && last.p ? last.p[k] : 0;
      return `<div class="pb${last && last.k === k ? ' won' : ''}"><span style="background:${TC[k]}"></span><div class="track"><div class="fill" style="width:${100 * p}%;background:${TC[k]}"></div></div><span>${last && last.p ? pct(p) : ''}</span></div>`;
    }).join('');
    $('#gs-step', el).textContent = m.steps;
    $('#gs-sweep', el).textContent = m.sweeps;
    $('#gs-speed', el).textContent = SPEEDS[speed].name + (timer ? ' ▶' : ' ❚❚');
    chart();
  }

  HOOKS['s-gibbs'] = {
    render(step, slide) {
      el = slide;
      if (!chips) chips = buildDocs($('#gs-docs', el), TOY, { mix: true });
      draw();
    },
    key(e) {
      const k = e.key.toLowerCase();
      if (k === 'n') {
        stop(); tick();   // slow speed: one phase per press (pick → probabilities → colour)
        return true;
      }
      if (k === 'a') { if (timer) stop(); else play(); return true; }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const next = Math.max(0, Math.min(SPEEDS.length - 1, speed + (e.key === 'ArrowUp' ? 1 : -1)));
        if (SPEEDS[speed].phased && !SPEEDS[next].phased) settle();
        speed = next;
        if (timer) play();
        return true;
      }
      if (k === 'r') { stop(); reset(Z_INIT); return true; }   // back to the starting colours, paused
      return false;
    }
  };
})();

/* ---------- 12. K-means ---------- */
(function () {
  const PAL = ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc948', '#b07aa1', '#ff9da7', '#9c755f', '#bab0ac'];
  const CENTERS = [[100, 95], [240, 75], [385, 170], [475, 205], [205, 262], [318, 322], [130, 372], [515, 352]];
  const r0 = rng(42);
  const pts = CENTERS.flatMap(([cx, cy]) => Array.from({ length: 45 }, () => [cx + 21 * normal(r0), cy + 21 * normal(r0)]));
  let K = 3, cent = [], lab = [], it = 0, timer = null, el;
  const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
  function init(r) {   // k-means++
    cent = [pts[Math.floor(r() * pts.length)].slice()];
    while (cent.length < K) {
      const w = pts.map(p => Math.min(...cent.map(c => d2(p, c))));
      cent.push(pts[pickIndex(w, r)].slice());
    }
    lab = pts.map(() => -1); it = 0;
  }
  function iterate() {
    const nl = pts.map(p => { let b = 0; cent.forEach((c, k) => { if (d2(p, c) < d2(p, cent[b])) b = k; }); return b; });
    const changed = nl.some((l, i) => l !== lab[i]);
    lab = nl;
    cent = cent.map((c, k) => { const m = pts.filter((_, i) => lab[i] === k); return m.length ? [m.reduce((s, p) => s + p[0], 0) / m.length, m.reduce((s, p) => s + p[1], 0) / m.length] : c; });
    it++;
    return changed;
  }
  function draw() {
    let g = pts.map((p, i) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4.2" fill="${lab[i] < 0 ? '#9aa1ad' : PAL[lab[i]]}" opacity=".8"/>`).join('');
    g += cent.map((c, k) => `<circle cx="${c[0]}" cy="${c[1]}" r="11" fill="${PAL[k]}" stroke="#1b2333" stroke-width="3"/>`).join('');
    $('#km-svg', el).innerHTML = g;
    $('#km-k', el).textContent = K;
    $('#km-it', el).textContent = it;
  }
  // back to the unclustered picture: grey points, no centroids
  function clear() { clearInterval(timer); cent = []; lab = pts.map(() => -1); it = 0; draw(); }
  function run(r) {
    clearInterval(timer);
    init(r); draw();
    timer = setInterval(() => {
      if (!el.classList.contains('active')) { clearInterval(timer); return; }
      const changed = iterate(); draw();
      if (!changed) clearInterval(timer);
    }, 450);
  }
  HOOKS['s-kmeans'] = {
    render(step, slide) {
      if (!el) { el = slide; clear(); }
    },
    key(e) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        K = Math.max(2, Math.min(10, K + (e.key === 'ArrowUp' ? 1 : -1)));
        clear(); return true;
      }
      if (e.key.toLowerCase() === 'c') { run(it === 0 && !cent.length ? rng(7) : Math.random); return true; }
      if (e.key.toLowerCase() === 'r') { clear(); return true; }
      return false;
    }
  };
})();

/* ---------- 13. synthetic "poems", choose K ---------- */
(function () {
  const THEMES = [
    ['兵', '戰', '馬', '沙場', '劍', '胡', '關', '將軍'],   // frontier war
    ['酒', '杯', '醉', '歌', '樽', '飲', '月'],             // drinking
    ['鄉', '家', '歸', '夢', '故園', '書信', '淚', '月'],    // homesickness
    ['山', '水', '雲', '松', '泉', '石', '鳥']              // landscape
  ];
  // 16 documents of 10 words; each mostly from one theme, some with a second theme mixed in
  const r0 = rng(11), DOCS = [];
  for (let d = 0; d < 16; d++) {
    const a = d % 4, b = (a + 1 + Math.floor(r0() * 3)) % 4, two = r0() < 0.6;
    DOCS.push(Array.from({ length: 10 }, () => { const t = (!two || r0() < 0.7) ? a : b; return THEMES[t][Math.floor(r0() * THEMES[t].length)]; }));
  }
  const VOC = [...new Set(THEMES.flat())], IDS = DOCS.map(d => d.map(w => VOC.indexOf(w)));
  const KS = [2, 3, 4, 5, 6], MAXSWEEPS = 200;
  let K = 4, m, chips, el, timer = null, hist = [];
  const reset = () => { m = new LDA(IDS, VOC.length, K, 0.1, 0.05, null, Math.random); hist = [m.perplexity()]; };
  // mini perplexity chart; the y-axis is fixed, so runs with different K can be compared
  function mini() {
    const W = 300, H = 104, L = 30, R = 8, T = 18, B = 16, LO = 5, HI = 30, n = Math.max(60, hist.length - 1);
    const x = i => L + (W - L - R) * i / n, y = v => T + (H - T - B) * (1 - (Math.min(HI, v) - LO) / (HI - LO));
    let g = `<text x="${W - R}" y="12" text-anchor="end" style="fill:#e0570f;font-weight:600">perplexity</text>`;
    [10, 20, 30].forEach(v => { g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#e3e6ec"/><text x="${L - 5}" y="${y(v) + 4}" text-anchor="end">${v}</text>`; });
    g += `<polyline points="${hist.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}" fill="none" stroke="#e0570f" stroke-width="2.5"/>`;
    const v = hist[hist.length - 1], i = hist.length - 1, right = i < n / 3;
    g += `<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="#e0570f"/><text x="${x(i) + (right ? 8 : -8)}" y="${y(v) - 7}" text-anchor="${right ? 'start' : 'end'}" style="fill:#e0570f;font-weight:600">${v.toFixed(1)}</text>`;
    $('#po-perp', el).innerHTML = g;
  }
  reset();
  function draw() {
    paintDocs(chips, m.z);
    $('#po-k', el).innerHTML = KS.map(k => `<span class="${k === K ? 'on' : ''}">${k}</span>`).join('');
    $('#po-sweep', el).textContent = m.sweeps;
    mini();
    $('#po-topics', el).innerHTML = m.nkw.map((row, k) => {
      const top = row.map((c, w) => [c, VOC[w]]).filter(x => x[0]).sort((a, b) => b[0] - a[0]).slice(0, 4);
      return `<div class="topic k${k}"><h4 style="color:${TC[k]}">Topic ${k + 1}</h4>${top.map(([c, w]) => `<div class="row"><span>${w}</span><span>${c}</span></div>`).join('')}</div>`;
    }).join('');
  }
  function stop() { clearInterval(timer); timer = null; }
  function play() {
    stop();
    timer = setInterval(() => {
      if (!el.classList.contains('active') || m.sweeps >= MAXSWEEPS) { stop(); return; }
      m.sweep(); hist.push(m.perplexity()); draw();
    }, 90);
  }
  HOOKS['s-poems'] = {
    render(step, slide) {
      el = slide;
      if (!chips) {
        const host = $('#po-docs', el);
        chips = DOCS.map((d, i) => {
          const row = document.createElement('div'); row.className = 'cdoc';
          row.innerHTML = `<span class="id">${i + 1}</span>`;
          const c = d.map(w => row.appendChild(wchip(w)));
          host.appendChild(row);
          return c;
        });
      }
      draw();
    },
    key(e) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const i = KS.indexOf(K) + (e.key === 'ArrowUp' ? 1 : -1);
        if (i < 0 || i >= KS.length) return true;
        K = KS[i]; reset(); play(); return true;
      }
      if (e.key.toLowerCase() === 'a') { if (timer) stop(); else { if (m.sweeps >= MAXSWEEPS) reset(); play(); } return true; }
      if (e.key.toLowerCase() === 'r') { stop(); reset(); return true; }   // fresh random start, paused
      return false;
    }
  };
})();

/* ---------- 14. Dirichlet simplex, for α (documents over topics) and β (topics over words) ----------
 * each dot is one draw from Dir(x, x, x): a document's mix of 3 topics, or a topic's mix of 3 words */
function simplexSlide(id, { colors, corner, item, center, legend, start = 3, seed0 = 5 }) {
  const XS = [0.05, 0.1, 0.3, 1, 3, 10, 25, 50];
  const V3 = [[215, 34], [34, 346], [396, 346]];   // corners: 1 (top), 2 (left), 3 (right)
  let xi = start, seed = seed0, el;
  function draw() {
    const x = XS[xi], r = rng(seed);
    const S = Array.from({ length: 300 }, () => dirichlet(x, 3, r));
    let g = `<polygon points="${V3.map(v => v.join(',')).join(' ')}" fill="#f5f7fa" stroke="#c9ced8" stroke-width="2"/>`;
    g += S.map(t => {
      const px = t[0] * V3[0][0] + t[1] * V3[1][0] + t[2] * V3[2][0], py = t[0] * V3[0][1] + t[1] * V3[1][1] + t[2] * V3[2][1];
      return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3.2" fill="#1b2333" opacity=".4"/>`;
    }).join('');
    g += V3.map((v, k) => `<circle cx="${v[0]}" cy="${v[1]}" r="9" fill="${colors[k]}"/><text x="${v[0] + (k === 0 ? 16 : 0)}" y="${v[1] + (k === 0 ? 5 : 30)}" text-anchor="${k === 0 ? 'start' : 'middle'}" style="fill:${colors[k]};font-weight:600">${corner(k)}</text>`).join('');
    g += `<text x="215" y="250" text-anchor="middle" style="fill:#6a7386">${center}</text>`;
    // legend: what one dot is, and how to read its position
    g += `<circle cx="-30" cy="18" r="6" fill="#1b2333" opacity=".6"/><text x="-18" y="24" style="font-weight:600">${legend[0]}</text>` +
      legend.slice(1).map((t, i) => `<text x="-36" y="${52 + 24 * i}" style="fill:#6a7386;font-size:16px">${t}</text>`).join('');
    $('.sx-svg', el).innerHTML = g;
    $('.sx-val', el).textContent = x;
    $('.sx-bars', el).innerHTML = S.slice(0, 5).map((t, d) => `<div style="display:flex;align-items:center;gap:10px;margin:5px 0"><span class="small" style="width:60px">${item(d)}</span><div class="mix" style="height:20px;margin:0;width:360px">${t.map((p, k) => `<div style="width:${100 * p}%;background:${colors[k]}"></div>`).join('')}</div></div>`).join('');
  }
  HOOKS[id] = {
    render(step, slide) { if (!el) { el = slide; draw(); } },
    key(e) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { xi = Math.max(0, Math.min(XS.length - 1, xi + (e.key === 'ArrowUp' ? 1 : -1))); draw(); return true; }
      if (e.key.toLowerCase() === 'r') { seed++; draw(); return true; }
      return false;
    }
  };
}
simplexSlide('s-alpha', { colors: TC, corner: k => `only topic ${k + 1}`, item: d => `Doc ${d + 1}`, center: 'even mixture', legend: ['each dot = one document', 'the closer to a corner,', 'the more of that topic'] });
// words get neutral colours of their own, so they are not mistaken for topics
const WORD3 = ['足球', '行星', '公投'], WC = ['#475569', '#b45309', '#0f766e'];
simplexSlide('s-beta', { colors: WC, corner: k => `only “${WORD3[k]}”`, item: d => `Topic ${d + 1}`, center: 'every word used', legend: ['each dot = one topic', 'the closer to a corner,', 'the more of that word'], seed0: 9 });

/* ---------- 18. word intrusion ---------- */
(function () {
  const ROWS = [
    [['兵', '戰', '馬', '將軍', '茶', '沙場'], 4],
    [['行星', '星系', '太空', '公投', '望遠鏡', '軌道'], 3],
    [['酒', '杯', '醉', '法院', '歌', '月'], 3],
    [['時候', '覺得', '已經', '可以', '事情', '開始'], 5]
  ];
  HOOKS['s-intrude'] = {
    render(step, el) {
      const box = $('#intr', el);
      if (!box.children.length) {
        box.innerHTML = ROWS.map(([ws, x], i) => `<div class="row"><span class="small" style="width:22px">${i + 1}</span>${ws.map((w, j) => `<span class="w${j === x ? ' intruder' : ''}">${w}</span>`).join('')}<span class="small note" style="margin-left:10px"></span></div>`).join('');
      }
      [...box.children].forEach((row, i) => {
        const show = step >= (i < 3 ? 1 : 2);
        row.querySelector('.intruder').classList.toggle('show', show);
        row.querySelector('.note').textContent = i === 3 && show ? '← almost impossible to tell' : '';
      });
    }
  };
})();

texify(document.getElementById('stage'));
