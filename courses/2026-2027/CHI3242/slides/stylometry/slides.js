/* Slide-specific logic (loaded before deck.js). */
window.HOOKS = {};
window.SECTIONS = [
  { id: 'intro',   zh: '什麼是風格？',     en: 'What is style?' },
  { id: 'hist',    zh: '簡史',             en: 'A short history' },
  { id: 'vec',     zh: '特徵、向量、距離', en: 'Features, vectors, distances' },
  { id: 'norm',    zh: '正規化與標準化',   en: 'Normalization and standardization' },
  { id: 'methods', zh: '經典案例與方法',   en: 'Classic cases and methods' },
  { id: 'hlm',     zh: '紅樓夢的作者',     en: 'Who wrote the Dream?' },
  { id: 'svm',     zh: '支持向量機',       en: 'Support vector machines' },
  { id: 'paper',   zh: '論文的方法與結果', en: 'The paper: method and results' },
  { id: 'summary', zh: '總結',             en: 'Summary' }
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
const A_C = '#2563eb', B_C = '#dc2626', GOLD = '#f59e0b', MUTE = '#6a7386', INK = '#1b2333', LINE = '#e3e6ec';
// seeded random numbers (mulberry32), so the "random" pictures are the same every time
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function normal(r) { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }
const fmt = (x, d = 2) => (Math.abs(x) < 0.5 * 10 ** -d ? 0 : x).toFixed(d);
const svgArrowDefs = (id, col) => `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${col}"/></marker>`;

/* ---------- 1. the sticky notes: at the last step, stamp the definitions stylometry builds on ---------- */
HOOKS['s-defs'] = { render(step, el) { $('#defs', el).classList.toggle('focus', step >= 7); } };

/* ---------- 1. operational definition: light up the term that is being explained ---------- */
HOOKS['s-hdef'] = {
  render(step, el) { el.querySelectorAll('.dterm').forEach(t => { t.classList.toggle('lit', step >= 1 && t.classList.contains('t' + (step - 1))); }); }
};

/* ---------- 2. a feature in a passage ---------- */
(function () {
  const TEXT = '那人聽了，便笑道：「你也不必去了，我自然知道的。」說着，又倒了一杯茶來，遞與他吃。他只是不肯接，半日方說道：「這是哪裡的話？」';
  const FW = ['了', '的', '也', '着', '便', '又', '只', '方'];
  const PUNCT = /[，。：「」？！、]/;
  const chars = [...TEXT];
  // sentence index of every character (a sentence ends at 。？！, a closing 」 stays with it)
  const sent = []; let s = 0;
  chars.forEach((c, i) => { sent.push(s); if (/[。？！]/.test(c) && chars[i + 1] !== '」') s++; if (c === '」' && /[。？！]/.test(chars[i - 1])) s++; });
  const lens = []; chars.forEach((c, i) => { if (!PUNCT.test(c)) lens[sent[i]] = (lens[sent[i]] || 0) + 1; });
  let inQ = false; const quote = chars.map(c => { if (c === '「') inQ = true; const q = inQ; if (c === '」') inQ = false; return q; });
  const bigram = chars.map((c, i) => (c === '道' && /[笑說]/.test(chars[i - 1])) || (/[笑說]/.test(c) && chars[i + 1] === '道'));
  HOOKS['s-feat'] = {
    render(step, el) {
      const p = $('#feat-p', el);
      if (!p.children.length) p.innerHTML = chars.map(c => `<span>${c}</span>`).join('');
      [...p.children].forEach((sp, i) => {
        const c = chars[i];
        sp.className = '';
        if (step === 1 && !PUNCT.test(c)) sp.classList.add('s' + (sent[i] % 2));
        if (step === 2 && FW.includes(c)) sp.classList.add('fw');
        if (step === 3) { if (quote[i]) sp.classList.add('q'); if (c === '？') sp.classList.add('qm'); }
        if (step === 4 && bigram[i]) sp.classList.add('ng');
      });
      const out = $('#feat-out', el);
      if (step === 1) out.innerHTML = `${lens.length} 個句子，長度 ${lens.join('、')} 字 → 平均 <b style="font-size:28px;margin-left:6px">${(lens.reduce((a, b) => a + b, 0) / lens.length).toFixed(1)}</b>&nbsp;字`;
      else if (step === 2) out.innerHTML = FW.map(f => [f, chars.filter(c => c === f).length]).filter(x => x[1]).sort((a, b) => b[1] - a[1]).map(([f, n]) => `<span class="w">${f}<b>${n}</b></span>`).join('');
      else if (step === 3) out.innerHTML = `直接引語 <b style="margin:0 14px 0 6px">2</b> 段 · 問號 <b style="margin-left:6px">1</b> 個`;
      else if (step === 4) out.innerHTML = `<span class="w">笑道<b>1</b></span><span class="w">說道<b>1</b></span><span class="small">不必分詞也能數</span>`;
      else out.innerHTML = '';
    }
  };
})();

/* ---------- 2. the feature table: highlight one column, then one row ---------- */
HOOKS['s-ftab'] = {
  render(step, el) { el.classList.toggle('col', step === 1); el.classList.toggle('row', step >= 2); }
};

/* ---------- 2. what is a vector: two arrows in the plane ---------- */
HOOKS['s-vec0'] = {
  render(step, el) {
    const X = v => 70 + v * 95, Y = v => 400 - v * 95;
    let h = `<defs>${svgArrowDefs('v0u', A_C)}${svgArrowDefs('v0v', B_C)}</defs>`;
    for (let v = 0; v <= 4; v++) h += `<line x1="${X(v)}" y1="${Y(0)}" x2="${X(v)}" y2="${Y(4)}" stroke="${LINE}"/><line x1="${X(0)}" y1="${Y(v)}" x2="${X(4)}" y2="${Y(v)}" stroke="${LINE}"/><text x="${X(v)}" y="${Y(0) + 24}" text-anchor="middle">${v}</text><text x="${X(0) - 12}" y="${Y(v) + 5}" text-anchor="end">${v}</text>`;
    h += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(4.2)}" y2="${Y(0)}" stroke="${INK}" stroke-width="2"/><line x1="${X(0)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(4.2)}" stroke="${INK}" stroke-width="2"/>`;
    h += `<text x="${X(4.2)}" y="${Y(0) + 46}" text-anchor="end" style="fill:${INK}">第 1 個數 x</text><text x="${X(0) - 14}" y="${Y(4.2) - 6}" style="fill:${INK}">第 2 個數 y</text>`;
    if (step >= 2) h += `<path d="M${X(0)} ${Y(0)} H${X(3)} V${Y(1)}" fill="none" stroke="${A_C}" stroke-width="2" stroke-dasharray="6 5" opacity=".6"/><text x="${X(1.5)}" y="${Y(0) - 8}" text-anchor="middle" style="fill:${A_C};font-size:17px">→ 3</text><text x="${X(3) + 8}" y="${Y(0.5) + 6}" style="fill:${A_C};font-size:17px">↑ 1</text>`;
    if (step >= 4) h += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(3)}" y2="${Y(1)}" stroke="${GOLD}" stroke-width="12" opacity=".35" stroke-linecap="round"/><path d="M${X(3) - 16} ${Y(0)} V${Y(0) - 16} H${X(3)}" fill="none" stroke="${A_C}" stroke-width="1.5"/><text x="${X(1.3)}" y="${Y(0.75) - 4}" style="fill:#b45309;font-size:18px;font-weight:700" transform="rotate(-18 ${X(1.3)} ${Y(0.75)})">‖u‖ ≈ 3.16</text>`;
    if (step >= 2) h += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(3)}" y2="${Y(1)}" stroke="${A_C}" stroke-width="4" marker-end="url(#v0u)"/>`;
    if (step >= 1) h += `<circle cx="${X(3)}" cy="${Y(1)}" r="8" fill="${A_C}"/><text x="${X(3) + 14}" y="${Y(1) - 12}" style="font-size:22px;font-weight:700;fill:${A_C}">u = (3, 1)</text>`;
    if (step >= 5) h += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(1)}" y2="${Y(2)}" stroke="${GOLD}" stroke-width="12" opacity=".35" stroke-linecap="round"/><path d="M${X(0)} ${Y(0)} H${X(1)} V${Y(2)}" fill="none" stroke="${B_C}" stroke-width="2" stroke-dasharray="6 5" opacity=".6"/><text x="${X(0.18)}" y="${Y(1.25)}" style="fill:#b45309;font-size:18px;font-weight:700" transform="rotate(-63 ${X(0.18)} ${Y(1.25)})">‖v‖ ≈ 2.24</text>`;
    if (step >= 3) h += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(1)}" y2="${Y(2)}" stroke="${B_C}" stroke-width="4" marker-end="url(#v0v)"/><circle cx="${X(1)}" cy="${Y(2)}" r="8" fill="${B_C}"/><text x="${X(1) + 14}" y="${Y(2) - 12}" style="font-size:22px;font-weight:700;fill:${B_C}">v = (1, 2)</text>`;
    $('#v0-svg', el).innerHTML = h;
  }
};

/* ---------- 2. texts as vectors, in three dimensions (slowly turning; drag to rotate) ---------- */
(function () {
  const DOCS = [['A', 42, 18, 8, A_C], ['B', 38, 22, 7, A_C], ['C', 25, 35, 3, B_C], ['D', 21, 41, 2, B_C]];
  const AX = [['「的」', 50], ['「了」', 50], ['「也」', 10]];        // axis label and maximum
  let yaw = -0.35, pitch = 0.38, drag = null, t0 = null, step = 0, el = null, raf = 0;
  // unit cube coordinates (的 → x, 了 → up, 也 → depth), rotated, then projected orthographically
  function P(x, y, z) {
    const qx = x - 0.5, qy = y - 0.5, qz = z - 0.5;
    const x1 = qx * Math.cos(yaw) + qz * Math.sin(yaw), z1 = -qx * Math.sin(yaw) + qz * Math.cos(yaw);
    const y2 = qy * Math.cos(pitch) - z1 * Math.sin(pitch);
    return [285 + 265 * x1, 262 - 265 * y2];
  }
  const doc = (a, b, c) => [a / AX[0][1], b / AX[1][1], c / AX[2][1]];
  const L = (p, q, attrs) => `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" ${attrs}/>`;
  function draw() {
    const svg = $('#vec-svg', el);
    let h = `<defs>${DOCS.map(d => svgArrowDefs('va' + d[0], d[4])).join('')}</defs>`;
    // floor grid (的–也 plane) and the cube's edges
    for (let i = 0; i <= 5; i++) { const u = i / 5; h += L(P(u, 0, 0), P(u, 0, 1), `stroke="${LINE}"`) + L(P(0, 0, u), P(1, 0, u), `stroke="${LINE}"`); }
    [[[0, 1, 0], [1, 1, 0]], [[0, 1, 0], [0, 1, 1]], [[1, 1, 0], [1, 1, 1]], [[0, 1, 1], [1, 1, 1]], [[1, 0, 0], [1, 1, 0]], [[0, 0, 1], [0, 1, 1]], [[1, 0, 1], [1, 1, 1]]]
      .forEach(([p, q]) => { h += L(P(...p), P(...q), `stroke="${LINE}" stroke-dasharray="4 4"`); });
    // the three axes from the origin
    const O = P(0, 0, 0), ends = [P(1.12, 0, 0), P(0, 1.12, 0), P(0, 0, 1.12)];
    ends.forEach((e, k) => { h += L(O, e, `stroke="${INK}" stroke-width="2.5"`) + `<text x="${e[0]}" y="${e[1] + 6}" text-anchor="middle" style="font-size:19px;fill:${INK};font-weight:600">${AX[k][0]}</text>`; });
    [P(1, 0, 0), P(0, 1, 0), P(0, 0, 1)].forEach((e, k) => { h += `<text x="${e[0] + 6}" y="${e[1] - 6}" style="font-size:13px">${AX[k][1]}</text>`; });
    if (step >= 2) DOCS.forEach(([n, a, b, c, col]) => {
      const [x, y, z] = doc(a, b, c), p = P(x, y, z), f = P(x, 0, z);
      h += L(p, f, `stroke="${col}" stroke-width="1.5" stroke-dasharray="4 4" opacity=".7"`) + `<circle cx="${f[0]}" cy="${f[1]}" r="3" fill="${col}" opacity=".6"/>`;
      h += L(O, p, `stroke="${col}" stroke-width="2.5" opacity=".6" marker-end="url(#va${n})"`);
      h += `<circle cx="${p[0]}" cy="${p[1]}" r="8" fill="${col}"/><text x="${p[0] + 12}" y="${p[1] - 10}" style="font-size:17px;fill:${col};font-weight:600">${n} (${a}, ${b}, ${c})</text>`;
    });
    h += `<text x="555" y="462" text-anchor="end" style="font-size:13px">拖曳旋轉 · drag to rotate</text>`;
    svg.innerHTML = h;
  }
  // a gentle back-and-forth turn while nobody is dragging
  function tick(t) {
    if (!el || !el.classList.contains('active')) { raf = 0; return; }
    if (!drag) { if (t0 == null) t0 = t; yaw = -0.35 + 0.6 * Math.sin((t - t0) / 3200); draw(); }
    raf = requestAnimationFrame(tick);
  }
  HOOKS['s-vec'] = {
    render(st, slide) {
      step = st;
      if (!el) {
        el = slide;
        const tb = $('#vec-tab tbody', el);
        tb.innerHTML = DOCS.map(([n, a, b, c, col]) => `<tr><td><b style="color:${col}">文件 ${n}</b></td><td class="num">${a}</td><td class="num">${b}</td><td class="num">${c}</td></tr>`).join('');
        const svg = $('#vec-svg', el);
        svg.addEventListener('pointerdown', e => { drag = [e.clientX, e.clientY, yaw, pitch]; svg.setPointerCapture(e.pointerId); svg.style.cursor = 'grabbing'; e.stopPropagation(); });
        svg.addEventListener('pointermove', e => {
          if (!drag) return;
          yaw = drag[2] + (e.clientX - drag[0]) / 130;
          pitch = Math.max(-0.6, Math.min(1.5, drag[3] + (e.clientY - drag[1]) / 160));
          draw();
        });
        const end = () => { if (drag) { drag = null; t0 = null; svg.style.cursor = 'grab'; } };
        svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
      }
      [...$('#vec-tab tbody', el).children].forEach(tr => { tr.style.background = step === 1 ? 'var(--win-bg)' : ''; });
      draw();
      if (!raf) raf = requestAnimationFrame(tick);
    }
  };
})();

/* ---------- 2. feature selection: a Zipf curve with a cut-off ---------- */
(function () {
  const LAB = ['了', '的', '不', '一', '來', '道', '人', '是', '說', '我', '他', '這', '你', '着', '也'];
  const NS = [5, 10, 15, 20, 30, 40];
  let ni = 3;
  function draw(el) {
    const N = NS[ni], svg = $('#fsel-svg', el), bw = 11.6;
    let h = `<line x1="30" y1="260" x2="550" y2="260" stroke="${INK}" stroke-width="2"/>`;
    for (let r = 1; r <= 40; r++) {
      const ht = 230 / Math.pow(r, 0.85), x = 32 + (r - 1) * (bw + 1.4);
      h += `<rect x="${x}" y="${260 - ht}" width="${bw}" height="${ht}" rx="2" fill="${r <= N ? A_C : '#cbd2dc'}"/>`;
      if (r <= LAB.length) h += `<text x="${x + bw / 2}" y="280" text-anchor="middle" style="font-size:12px;fill:${INK}">${LAB[r - 1]}</text>`;
    }
    const cx = 32 + N * (bw + 1.4) - 0.7;
    h += `<line x1="${cx}" y1="20" x2="${cx}" y2="262" stroke="${GOLD}" stroke-width="3" stroke-dasharray="6 4"/><text x="${cx + 8}" y="34" style="font-size:16px;fill:${INK};font-weight:600">N = ${N}</text>`;
    h += `<text x="550" y="298" text-anchor="end">排名 rank →</text>`;
    svg.innerHTML = h;
    $('#fsel-n', el).textContent = N;
  }
  HOOKS['s-fsel'] = {
    render(step, el) { draw(el); },
    key(e, step, el) {
      if (e.key === 'ArrowUp') { ni = Math.min(NS.length - 1, ni + 1); return true; }
      if (e.key === 'ArrowDown') { ni = Math.max(0, ni - 1); return true; }
    }
  };
})();

/* ---------- 2. three distances ---------- */
(function () {
  const A = [7, 3], PRE = [[3, 6], [5, 7.5], [8.5, 5], [2, 2.5]];
  let pi = 0, sc = 1;
  const X = v => 60 + v * 42, Y = v => 420 - v * 40;
  function B() { return PRE[pi].map(v => v * sc); }
  function draw(step, el) {
    const b = B(), svg = $('#dist-svg', el);
    let h = `<defs>${svgArrowDefs('da', A_C)}${svgArrowDefs('db', B_C)}</defs>`;
    for (let v = 0; v <= 10; v += 2) h += `<line x1="${X(v)}" y1="${Y(0)}" x2="${X(v)}" y2="${Y(10)}" stroke="${LINE}"/><line x1="${X(0)}" y1="${Y(v)}" x2="${X(10)}" y2="${Y(v)}" stroke="${LINE}"/><text x="${X(v)}" y="${Y(0) + 20}" text-anchor="middle">${v}</text><text x="${X(0) - 8}" y="${Y(v) + 5}" text-anchor="end">${v}</text>`;
    h += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(10)}" y2="${Y(0)}" stroke="${INK}" stroke-width="2"/><line x1="${X(0)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(10)}" stroke="${INK}" stroke-width="2"/>`;
    h += `<text x="${X(5)}" y="${Y(0) + 42}" text-anchor="middle" style="fill:${INK}">特徵 1 feature 1</text>`;
    // cosine: the angle at the origin
    if (step >= 3) {
      const r = 70, a1 = Math.atan2(A[1], A[0]), a2 = Math.atan2(b[1], b[0]);
      const p = a => [X(0) + r * Math.cos(a), Y(0) - r * Math.sin(a)];
      const [x1, y1] = p(a1), [x2, y2] = p(a2);
      h += `<path d="M${X(0)} ${Y(0)} L${x1} ${y1} A${r} ${r} 0 0 0 ${x2} ${y2} Z" fill="#9333ea" opacity=".18"/><path d="M${x1} ${y1} A${r} ${r} 0 0 0 ${x2} ${y2}" fill="none" stroke="#9333ea" stroke-width="3"/>`;
      const am = (a1 + a2) / 2;
      h += `<text x="${X(0) + (r + 16) * Math.cos(am)}" y="${Y(0) - (r + 16) * Math.sin(am) + 6}" style="font-size:20px;fill:#9333ea;font-weight:600">θ</text>`;
    }
    h += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(A[0])}" y2="${Y(A[1])}" stroke="${A_C}" stroke-width="3" marker-end="url(#da)" opacity=".8"/>`;
    h += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(b[0])}" y2="${Y(b[1])}" stroke="${B_C}" stroke-width="3" marker-end="url(#db)" opacity=".8"/>`;
    if (step >= 1) {
      const route = `M${X(A[0])} ${Y(A[1])} H${X(b[0])} V${Y(b[1])}`;
      h += `<path d="${route}" fill="none" stroke="#e0570f" stroke-width="5" stroke-linejoin="round" opacity=".85"/>`;
      if (step === 1) h += `<text font-size="30" text-anchor="middle" dy="10">🚕<animateMotion dur="2.2s" fill="freeze" path="${route}"/></text>`;
    }
    if (step >= 2) h += `<line x1="${X(A[0])}" y1="${Y(A[1])}" x2="${X(b[0])}" y2="${Y(b[1])}" stroke="#16a34a" stroke-width="4" stroke-dasharray="9 6"/>`;
    h += `<circle cx="${X(A[0])}" cy="${Y(A[1])}" r="9" fill="${A_C}"/><text x="${X(A[0]) + 12}" y="${Y(A[1]) + 24}" style="font-size:19px;fill:${A_C};font-weight:600">A (${A.join(', ')})</text>`;
    h += `<circle cx="${X(b[0])}" cy="${Y(b[1])}" r="9" fill="${B_C}"/><text x="${X(b[0]) + 12}" y="${Y(b[1]) - 12}" style="font-size:19px;fill:${B_C};font-weight:600">B (${fmt(b[0], 1)}, ${fmt(b[1], 1)})</text>`;
    svg.innerHTML = h;
    const dx = A[0] - b[0], dy = A[1] - b[1];
    $('#d-man', el).textContent = fmt(Math.abs(dx) + Math.abs(dy));
    $('#d-euc', el).textContent = fmt(Math.hypot(dx, dy));
    $('#d-cos', el).textContent = fmt(1 - (A[0] * b[0] + A[1] * b[1]) / (Math.hypot(...A) * Math.hypot(...b)), 3);
  }
  HOOKS['s-dist'] = {
    render(step, el) { draw(step, el); },
    key(e) {
      const m = Math.max(...PRE[pi]);
      if (e.key === 'ArrowUp') { sc = Math.min(9.8 / m, sc * 1.2); return true; }
      if (e.key === 'ArrowDown') { sc = Math.max(0.25, sc / 1.2); return true; }
      if (e.key === 'p' || e.key === 'P') { pi = (pi + 1) % PRE.length; sc = 1; return true; }
    }
  };
})();

/* ---------- 3. length: raw counts vs relative frequencies ---------- */
HOOKS['s-len'] = {
  render(step, el) {
    const rel = step >= 2;
    $('#len-v1', el).textContent = rel ? '30' : '150';
    $('#len-v2', el).textContent = rel ? '30' : '≈ 4,500';
    $('#len-b1', el).style.height = (rel ? 120 : 7) + 'px';
    $('#len-b2', el).style.height = (rel ? 120 : 210) + 'px';
    $('#len-cap', el).innerHTML = rel ? '「的」<b>每千字</b>出現的次數<span>per 1,000 characters</span>' : '「的」出現的<b>次數</b><span>raw count of 的</span>';
  }
};

/* ---------- 3. mean and standard deviation: five words, thirty documents each (illustrative) ---------- */
(function () {
  const F = [['的', 40, 6], ['了', 25, 5], ['是', 14, 2.5], ['也', 6, 1.5], ['呢', 1.7, 0.6]];
  const r = rng(13);
  const DOTS = F.map(([, m, sd]) => Array.from({ length: 30 }, () => Math.max(0.1, m + normal(r) * sd)));
  const X0 = 90, X1 = 850, X = v => X0 + v / 60 * (X1 - X0), RY = i => 56 + i * 62, C1 = 880, C2 = 950, C3 = 1020;
  HOOKS['s-sd'] = {
    render(step, el) {
      let h = '';
      for (let v = 0; v <= 60; v += 10) h += `<line x1="${X(v)}" y1="30" x2="${X(v)}" y2="${RY(4) + 18}" stroke="#f1f3f6"/><text x="${X(v)}" y="${RY(4) + 40}" text-anchor="middle">${v}</text>`;
      h += `<text x="${X1}" y="${RY(4) + 62}" text-anchor="end" style="font-size:14px">每千字 per 1,000 →</text>`;
      h += `<text x="${C1}" y="24" style="font-size:16px;fill:#b45309;font-weight:700">μ</text><text x="${C2}" y="24" style="font-size:16px;fill:#9333ea;font-weight:700">σ</text>`;
      F.forEach(([w, m, sd], i) => {
        const y = RY(i);
        h += `<text x="20" y="${y + 8}" style="font-size:24px;fill:${INK}">「${w}」</text><line x1="${X0}" y1="${y + 16}" x2="${X1}" y2="${y + 16}" stroke="${LINE}" stroke-width="2"/>`;
        // the bell curve of this word
        let d = '';
        for (let v = Math.max(0, m - 3.5 * sd); v <= m + 3.5 * sd; v += sd / 12) d += `${d ? 'L' : 'M'}${X(v).toFixed(1)} ${(y + 16 - 34 * Math.exp(-((v - m) ** 2) / (2 * sd * sd))).toFixed(1)}`;
        h += `<path d="${d}" fill="none" stroke="${MUTE}" stroke-width="1.5" opacity=".6"/>`;
        DOTS[i].forEach((v, k) => { h += `<circle cx="${X(v).toFixed(1)}" cy="${y + 16 - 4 - (k % 3) * 5}" r="3.5" fill="${A_C}" opacity=".55"/>`; });
        if (step >= 1) h += `<line x1="${X(m)}" y1="${y - 22}" x2="${X(m)}" y2="${y + 22}" stroke="${GOLD}" stroke-width="3"/><text x="${C1}" y="${y + 20}" style="font-size:17px;fill:#b45309;font-weight:700">${m}</text>`;
        if (step >= 2) {
          h += `<path d="M${X(m - sd)} ${y + 24} v6 H${X(m + sd)} v-6" fill="none" stroke="#9333ea" stroke-width="2.5"/>`;
          h += `<text x="${C2}" y="${y + 20}" style="font-size:17px;fill:#9333ea;font-weight:700">${sd}</text>`;
        }
        if (step >= 3) {
          // the same raw difference of 2, measured in standard deviations
          h += `<text x="${C3}" y="${y + 20}" style="font-size:17px;fill:${INK};font-weight:700">${(2 / sd).toFixed(1)}σ</text>`;
        }
      });
      if (step >= 3) h += `<text x="${C3}" y="24" style="font-size:15px;fill:${INK};font-weight:600">差 2 ＝</text>`;
      $('#sd-svg', el).innerHTML = h;
    }
  };
})();

/* ---------- 3. the z-score, on two number lines: shift by μ, zoom in, divide by σ ---------- */
(function () {
  const DE = [44, 36, 42, 31, 46, 33], NE = [0.6, 2.4, 0.9, 2.8, 0.7, 2.6];
  const COL = [A_C, B_C, A_C, B_C, A_C, B_C];
  const stats = v => { const m = v.reduce((a, b) => a + b, 0) / v.length; return [m, Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / (v.length - 1))]; };
  const ST = [stats(DE), stats(NE)];
  // axis per step: raw; x − μ (0 in the middle, so every row slides to the centre); ÷σ (both rows spread equally)
  const RANGES = [[0, 50, 5], [-25, 25, 5], [-2.5, 2.5, 0.5], [-2.5, 2.5, 0.5]];
  const ROWS = [100, 175];
  const X0 = 170, X1 = 1070;
  let built = false;
  function value(row, i, step) {
    const v = (row ? NE : DE)[i], [m, s] = ST[row];
    return step === 0 ? v : step === 1 ? v - m : (v - m) / s;
  }
  HOOKS['s-z'] = {
    render(step, el) {
      const svg = $('#z-svg', el);
      if (!built) {
        built = true;
        let h = `<defs>${svgArrowDefs('zarr', '#b45309')}</defs><g class="ticks"></g>`;
        ROWS.forEach((y, r) => {
          h += `<text x="20" y="${y + 7}" style="font-size:22px;fill:${INK}">${r ? '「呢」' : '「的」'}</text><line x1="${X0}" y1="${y}" x2="${X1}" y2="${y}" stroke="${INK}" stroke-width="2"/>`;
          h += `<g class="dot mu" data-r="${r}"><line x1="0" y1="-26" x2="0" y2="26" stroke="${GOLD}" stroke-width="3" stroke-dasharray="4 3"/><text x="0" y="-30" text-anchor="middle" style="font-size:16px;fill:#b45309;font-weight:600">μ</text></g>`;
          DE.forEach((_, i) => { h += `<circle class="dot pt" data-r="${r}" data-i="${i}" r="10" fill="${COL[i]}" fill-opacity=".8" stroke="#fff" stroke-width="2"/>`; });
        });
        svg.innerHTML = h;
      }
      const [lo, hi, tk] = RANGES[step];
      const X = v => X0 + (v - lo) / (hi - lo) * (X1 - X0);
      let t = '';
      for (let v = lo; v <= hi + 1e-9; v += tk) t += `<g class="tick"><line x1="${X(v)}" y1="${ROWS[1] + 30}" x2="${X(v)}" y2="${ROWS[1] + 38}" stroke="${MUTE}"/><text x="${X(v)}" y="${ROWS[1] + 56}" text-anchor="middle">${+v.toFixed(1)}</text></g>`;
      t += `<text x="${X1}" y="${ROWS[0] - 52}" text-anchor="end" style="font-size:17px;fill:${MUTE}">${['原始值 raw (per 1,000)', 'x − μ：移到中間', 'z = (x − μ) / σ：散開', 'z = (x − μ) / σ'][step]}</text>`;
      // step 1: an arrow from each row's mean to 0, drawn over the old axis
      const X0raw = v => X0 + (v - RANGES[0][0]) / (RANGES[0][1] - RANGES[0][0]) * (X1 - X0);
      if (step === 1) ROWS.forEach((y, r) => {
        const m = ST[r][0], x1 = X0raw(m), x2 = X(0), lift = 40;
        t += `<path class="zdraw" d="M${x1} ${y - 30} C${x1} ${y - 30 - lift}, ${x2} ${y - 30 - lift}, ${x2} ${y - 30}" fill="none" stroke="#b45309" stroke-width="2.5" marker-end="url(#zarr)"/>`;
        t += `<text x="${(x1 + x2) / 2}" y="${y - 30 - lift * 0.8}" text-anchor="middle" style="font-size:16px;fill:#b45309;font-weight:700">μ = ${m.toFixed(1)} → 0</text>`;
      });
      if (step === 2) ROWS.forEach((y, r) => { t += `<text x="${X1}" y="${y - 14}" text-anchor="end" style="font-size:16px;fill:#b45309;font-weight:700">÷ σ = ÷ ${ST[r][1].toFixed(1)}</text>`; });
      svg.querySelector('.ticks').innerHTML = t;
      svg.querySelectorAll('.pt').forEach(c => {
        const r = +c.dataset.r, i = +c.dataset.i, jitter = (i % 3 - 1) * 9;
        c.style.transform = `translate(${X(value(r, i, step))}px, ${ROWS[r] + jitter}px)`;
      });
      svg.querySelectorAll('.mu').forEach(g => {
        const r = +g.dataset.r;
        g.style.transform = `translate(${X(step === 0 ? ST[r][0] : 0)}px, ${ROWS[r]}px)`;
      });
    }
  };
})();

/* ---------- 3. the step-by-step walkthrough (counts → frequencies → z → distances) ---------- */
(function () {
  const W = ['的', '了', '也', '着', '便'];
  const NAMES = ['A', 'B', 'C', 'D', 'E', 'F'];
  const AUTH = [0, 1, 0, 1, 0, 1];
  const LEN = [4800, 1500, 4000, 2200, 6200, 2800];
  const CNT = [[216, 91, 39, 15, 29], [51, 47, 8, 10, 3], [188, 84, 30, 10, 22], [79, 64, 10, 13, 6], [267, 136, 53, 22, 40], [92, 90, 15, 19, 6]];
  const REL = CNT.map((r, d) => r.map(c => 1000 * c / LEN[d]));
  const MU = W.map((_, j) => REL.reduce((a, r) => a + r[j], 0) / REL.length);
  const SD = W.map((_, j) => Math.sqrt(REL.reduce((a, r) => a + (r[j] - MU[j]) ** 2, 0) / (REL.length - 1)));
  const Z = REL.map(r => r.map((v, j) => (v - MU[j]) / SD[j]));
  const DIST = {
    M: (a, b) => a.reduce((s, v, j) => s + Math.abs(v - b[j]), 0),
    D: (a, b) => a.reduce((s, v, j) => s + Math.abs(v - b[j]), 0) / a.length,
    E: (a, b) => Math.sqrt(a.reduce((s, v, j) => s + (v - b[j]) ** 2, 0)),
    C: (a, b) => { const d = a.reduce((s, v, j) => s + v * b[j], 0); return 1 - d / (Math.hypot(...a) * Math.hypot(...b)); }
  };
  const METRICS = [['M', 'M 曼哈頓'], ['D', 'D Burrows’s Delta（曼哈頓 ÷ 5）'], ['E', 'E 歐氏'], ['C', 'C 餘弦']];
  let metric = 'M';
  const COLS = '<colgroup><col class="c0"><col><col><col><col><col><col></colgroup>';
  const nameCell = (d, color) => `<td style="${color ? `color:${AUTH[d] ? B_C : A_C}` : ''}">文件 ${NAMES[d]}</td>`;
  function table(step) {
    // the same seven columns in every step: name, length, five characters (or name, A–F)
    const head = `<tr><th>文件</th><th>總字數</th>${W.map(w => `<th>${w}</th>`).join('')}</tr>`;
    const len = d => `<td class="${step ? 'dim' : ''}">${LEN[d].toLocaleString()}</td>`;
    if (step === 0) return head + CNT.map((r, d) => `<tr>${nameCell(d)}${len(d)}${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('');
    if (step === 1) return head + REL.map((r, d) => `<tr>${nameCell(d)}${len(d)}${r.map(v => `<td>${v.toFixed(1)}</td>`).join('')}</tr>`).join('')
      + `<tr class="stat first"><td>平均 μ</td><td></td>${MU.map(v => `<td>${v.toFixed(1)}</td>`).join('')}</tr><tr class="stat"><td>標準差 σ</td><td></td>${SD.map(v => `<td>${v.toFixed(2)}</td>`).join('')}</tr>`;
    if (step === 2) return head + Z.map((r, d) => `<tr>${nameCell(d)}${len(d)}${r.map(z => {
      const a = Math.min(Math.abs(z) / 1.8, 1) * 0.6;
      return `<td style="background:${z >= 0 ? `rgba(22,163,74,${a})` : `rgba(220,38,38,${a})`}">${z >= 0 ? '+' : '−'}${Math.abs(z).toFixed(2)}</td>`;
    }).join('')}</tr>`).join('');
    // distances
    const D = Z.map(a => Z.map(b => DIST[metric](a, b)));
    let mx = 0; D.forEach((r, i) => r.forEach((v, j) => { if (i !== j) mx = Math.max(mx, v); }));
    const nn = D.map((r, i) => r.reduce((best, v, j) => (j !== i && (best < 0 || v < r[best]) ? j : best), -1));
    return `<tr><th></th>${NAMES.map((n, j) => `<th style="${step >= 4 ? `color:${AUTH[j] ? B_C : A_C}` : ''}">${n}</th>`).join('')}</tr>` + D.map((r, i) => `<tr>${nameCell(i, step >= 4)}${r.map((v, j) => {
      if (i === j) return '<td class="self">0</td>';
      const t = v / mx, a = (1 - t) * 0.8 + 0.04;
      return `<td class="${step >= 4 && nn[i] === j ? 'nn' : ''}" style="background:rgba(37,99,235,${a.toFixed(2)});color:${a > 0.45 ? '#fff' : INK}">${v.toFixed(2)}</td>`;
    }).join('')}</tr>`).join('');
  }
  HOOKS['s-walk'] = {
    render(step, el) {
      $('#wk-tab', el).innerHTML = COLS + table(step);
      [...$('#wk-steps', el).children].forEach((s, i) => s.classList.toggle('on', i === step));
      const ms = $('#wk-m', el);
      ms.innerHTML = METRICS.map(([k, t]) => `<span class="${k === metric ? 'on' : ''}">${t}</span>`).join('');
    },
    key(e, step) {
      const k = e.key.toUpperCase();
      if (step >= 3 && DIST[k] && e.key.length === 1) { metric = k; return true; }
      const i = METRICS.findIndex(m => m[0] === metric);
      if (step >= 3 && e.key === 'ArrowDown') { metric = METRICS[(i + 1) % METRICS.length][0]; return true; }
      if (step >= 3 && e.key === 'ArrowUp') { metric = METRICS[(i + METRICS.length - 1) % METRICS.length][0]; return true; }
    }
  };
})();

/* ---------- 4. the stylistic fingerprint: z-score profiles as ridges (illustrative) ---------- */
(function () {
  const W = ['的', '了', '是', '不', '我', '他', '也', '着', '便', '就', '都', '又', '只', '這', '那', '說', '道', '呢', '麼', '罷'];
  const r = rng(21), clip = v => Math.max(-2.3, Math.min(2.3, v));
  const A1 = W.map(() => clip(normal(r) * 1.1));
  const A2 = A1.map(v => clip(v + normal(r) * 0.35));
  const B = A1.map(v => clip(-0.6 * v + normal(r) * 0.7));    // author B leans the other way on many words
  const delta = (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0) / a.length;
  const X = i => 76 + i * 38, Y = v => 128 - v * 44;
  HOOKS['s-print'] = {
    render(step, el) {
      let h = '';
      [-2, -1, 1, 2].forEach(v => { h += `<line x1="60" y1="${Y(v)}" x2="${X(19) + 10}" y2="${Y(v)}" stroke="#f1f3f6"/><text x="52" y="${Y(v) + 5}" text-anchor="end">${v > 0 ? '+' : '−'}${Math.abs(v)}</text>`; });
      h += `<text x="52" y="${Y(0) + 5}" text-anchor="end">0</text>`;
      // grouped bars: each text keeps its own slot, so nothing moves when the others appear
      const bar = (v, i, off, col, op) => { const y0 = Y(0), y1 = Y(v); return `<rect x="${X(i) + off - 5.5}" y="${Math.min(y0, y1)}" width="11" height="${Math.max(1, Math.abs(y1 - y0))}" rx="2" fill="${col}" opacity="${op}"/>`; };
      W.forEach((_, i) => {
        h += bar(A1[i], i, -12, A_C, 1);
        if (step >= 1) h += bar(A2[i], i, 0, '#93b4f5', 1);
        if (step >= 2) h += bar(B[i], i, 12, B_C, 0.9);
      });
      h += `<line x1="60" y1="${Y(0)}" x2="${X(19) + 18}" y2="${Y(0)}" stroke="${INK}" stroke-width="2"/>`;
      W.forEach((w, i) => { h += `<text x="${X(i)}" y="262" text-anchor="middle" style="font-size:18px;fill:${INK}">${w}</text>`; });
      h += `<g style="font-size:15px"><rect x="86" y="7" width="14" height="14" rx="2" fill="${A_C}"/><text x="106" y="19" style="fill:${A_C}">作者甲</text>`;
      if (step >= 1) h += `<rect x="196" y="7" width="14" height="14" rx="2" fill="#93b4f5"/><text x="216" y="19" style="fill:${A_C}">作者甲′（另一篇）</text>`;
      if (step >= 2) h += `<rect x="386" y="7" width="14" height="14" rx="2" fill="${B_C}"/><text x="406" y="19" style="fill:${B_C}">作者乙</text>`;
      h += `<text x="${X(19) + 12}" y="19" text-anchor="end" style="font-size:13px">z 分數（示意）：↑ 高於平均 ↓ 低於平均</text></g>`;
      $('#fp-svg', el).innerHTML = h;
      $('#fp-d1', el).textContent = delta(A1, A2).toFixed(2);
      $('#fp-d2', el).textContent = delta(A1, B).toFixed(2);
    }
  };
})();

/* ---------- 5. cross-validation folds ---------- */
HOOKS['s-valid'] = {
  render(step, el) {
    const box = $('#folds', el);
    const rows = step >= 2 ? 5 : 1;
    let h = '';
    for (let r = 0; r < rows; r++) {
      h += `<div class="fold"><span style="width:70px">${step >= 2 ? `第 ${r + 1} 輪` : ''}</span>`;
      for (let k = 0; k < 5; k++) h += `<i class="${step >= 2 && k === r ? 'v' : ''}">${step >= 2 && k === r ? '驗證' : '訓練'}</i>`;
      h += `<i class="t">${step >= 1 ? '測試' : '?'}</i></div>`;
    }
    box.innerHTML = h;
  }
};

/* ---------- 6. the chrono-divide, schematically ---------- */
(function () {
  const r = rng(7), N = 120;
  const one = Array.from({ length: N }, () => 0.15 + normal(r) * 1.1);
  const two = Array.from({ length: N }, (_, i) => (i < 80 ? 1.4 : -1.3) + normal(r) * 0.55);
  const X = n => 170 + (n - 1) * 7.6, Y = v => 150 - v * 40;
  let built = false;
  HOOKS['s-cd'] = {
    render(step, el) {
      const svg = $('#cd-svg', el);
      if (!built) {
        built = true;
        let h = `<rect class="cd-shade" x="${X(80.5)}" y="20" width="${X(120) - X(80.5) + 10}" height="260" fill="${B_C}" opacity="0" style="transition:opacity .5s"/>`;
        h += `<line x1="160" y1="${Y(0)}" x2="1090" y2="${Y(0)}" stroke="${INK}" stroke-width="2"/><text x="150" y="${Y(0) + 5}" text-anchor="end">0</text>`;
        h += `<text x="150" y="${Y(2.4) + 5}" text-anchor="end" style="fill:${A_C};font-size:16px">＋ 像作者甲</text><text x="150" y="${Y(-2.4) + 5}" text-anchor="end" style="fill:${B_C};font-size:16px">－ 像作者乙</text>`;
        h += `<text x="24" y="${Y(0)}" text-anchor="middle" transform="rotate(-90 24 ${Y(0)})" style="fill:${INK};font-size:16px">分類器的分數 S(n)</text>`;
        [1, 20, 40, 60, 80, 100, 120].forEach(n => { h += `<text x="${X(n)}" y="295" text-anchor="middle">${n}</text>`; });
        h += `<text x="1090" y="275" text-anchor="end">章回 chapter n →</text>`;
        h += `<line class="cd-div" x1="${X(80.5)}" y1="20" x2="${X(80.5)}" y2="280" stroke="${GOLD}" stroke-width="3" stroke-dasharray="7 5" opacity="0" style="transition:opacity .5s"/><text class="cd-div" x="${X(80.5) + 8}" y="36" style="font-size:17px;fill:#b45309;font-weight:600;transition:opacity .5s" opacity="0">X</text>`;
        for (let n = 1; n <= N; n++) h += `<circle class="cdp" r="4.5" style="transition:transform .8s ease, fill .5s" transform="translate(${X(n)} ${Y(0)})"/>`;
        svg.innerHTML = h;
      }
      const vals = step === 0 ? null : step === 1 ? one : two;
      svg.querySelectorAll('.cdp').forEach((c, i) => {
        const v = vals ? Math.max(-3.2, Math.min(3.2, vals[i])) : 0;
        c.style.transform = `translate(${X(i + 1)}px, ${Y(v)}px)`;
        c.setAttribute('transform', '');
        c.style.fill = !vals ? '#cbd2dc' : '#475569';
      });
      svg.querySelectorAll('.cd-div').forEach(e => e.setAttribute('opacity', step >= 2 ? 1 : 0));
      $('.cd-shade', svg).setAttribute('opacity', step >= 2 ? 0.06 : 0);
    }
  };
})();

/* =================== support vector machines =================== */
// toy data: two features (z-scores) per chapter; y = +1 for the first 80 chapters (blue), −1 for the last 40 (red)
const BLUE = [[-2.4, 0.4], [-1.8, 1.5], [-1.1, 0.6], [-2.2, -0.4], [-0.5, 1.7], [-1.4, -0.2], [0.3, 1.4], [-0.2, 0.75], [-2.6, 1.6], [0.9, 2.2]];
const RED = [[1.2, -0.8], [2.0, 0.6], [0.6, -0.9], [1.6, -1.8], [2.4, 1.1], [0.2, -1.5], [1.0, 0.1], [2.6, -0.5], [-0.4, -1.9], [0.0, -0.7], [1.8, -0.2]];
const PTS = [...BLUE.map(([x, y]) => ({ x, y, c: 1 })), ...RED.map(([x, y]) => ({ x, y, c: -1 }))];

// geometric max-margin: the normal n = (cos θ, sin θ) points towards the blue class
function marginAt(P, th) {
  const n = [Math.cos(th), Math.sin(th)];
  let mb = Infinity, mr = -Infinity;
  P.forEach(p => { const v = n[0] * p.x + n[1] * p.y; if (p.c > 0) mb = Math.min(mb, v); else mr = Math.max(mr, v); });
  return { th, n, mb, mr, W: mb - mr, c: (mb + mr) / 2 };
}
function maxMargin(P) {
  let best = null;
  for (let t = 0; t < 7200; t++) { const m = marginAt(P, t / 20 * Math.PI / 180); if (!best || m.W > best.W) best = m; }
  return best;
}
// canonical (w, b) of a geometric street: f(x) = (n·x − c) / (W/2), so the support vectors sit on ±1
const canon = m => { const h = m.W / 2; return { w: [m.n[0] / h, m.n[1] / h], b: -m.c / h }; };
const OPT = maxMargin(PTS);

// soft-margin linear SVM by dual coordinate descent (Hsieh et al. 2008); the bias is a constant feature
function trainSVM(P, C) {
  const B = 3, n = P.length, a = new Array(n).fill(0), w = [0, 0, 0];
  const xs = P.map(p => [p.x, p.y, B]), Q = xs.map(x => x[0] ** 2 + x[1] ** 2 + x[2] ** 2);
  const r = rng(3), order = [...Array(n).keys()];
  for (let ep = 0; ep < 1500; ep++) {
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    for (const i of order) {
      const y = P[i].c, x = xs[i], G = y * (w[0] * x[0] + w[1] * x[1] + w[2] * x[2]) - 1;
      const PG = a[i] === 0 ? Math.min(G, 0) : a[i] === C ? Math.max(G, 0) : G;
      if (Math.abs(PG) > 1e-12) {
        const old = a[i]; a[i] = Math.min(Math.max(a[i] - G / Q[i], 0), C);
        const d = (a[i] - old) * y; w[0] += d * x[0]; w[1] += d * x[1]; w[2] += d * x[2];
      }
    }
  }
  return { w: [w[0], w[1]], b: w[2] * B, alpha: a };
}
// L2-regularized logistic regression by gradient descent; P(blue | x) = σ(w·x + b)
function trainLR(P, lam) {
  let w = [0, 0], b = 0;
  for (let it = 0; it < 6000; it++) {
    const g = [0, 0]; let gb = 0;
    P.forEach(p => { const y = p.c > 0 ? 1 : 0, s = 1 / (1 + Math.exp(-(w[0] * p.x + w[1] * p.y + b))); g[0] += (s - y) * p.x; g[1] += (s - y) * p.y; gb += s - y; });
    const n = P.length;
    w = [w[0] - 0.3 * (g[0] / n + lam * w[0]), w[1] - 0.3 * (g[1] / n + lam * w[1])]; b -= 0.3 * gb / n;
  }
  return { w, b };
}

/* a square plot of the toy data; draw(svg, opts) redraws everything */
const SP = { L: 100, R: 520, T: 12, B: 432, lo: -3.2, hi: 3.2 };
const SX = x => SP.L + (x - SP.lo) / (SP.hi - SP.lo) * (SP.R - SP.L);
const SY = y => SP.B - (y - SP.lo) / (SP.hi - SP.lo) * (SP.B - SP.T);
// the line w·x + b = k, as two far-away points (the plot is clipped)
function lineAt(w, b, k) {
  const nn = w[0] ** 2 + w[1] ** 2, p0 = [w[0] * (k - b) / nn, w[1] * (k - b) / nn], d = [-w[1] / Math.sqrt(nn), w[0] / Math.sqrt(nn)];
  return [[p0[0] - 20 * d[0], p0[1] - 20 * d[1]], [p0[0] + 20 * d[0], p0[1] + 20 * d[1]]];
}
const P2 = ([x, y]) => `${SX(x).toFixed(1)},${SY(y).toFixed(1)}`;
function svmPlot(svg, o) {
  const id = svg.id;
  let h = `<defs><clipPath id="${id}-clip"><rect x="${SP.L}" y="${SP.T}" width="${SP.R - SP.L}" height="${SP.B - SP.T}"/></clipPath>${svgArrowDefs(id + '-wa', INK)}</defs>`;
  h += `<rect x="${SP.L}" y="${SP.T}" width="${SP.R - SP.L}" height="${SP.B - SP.T}" fill="#fff" stroke="${LINE}" stroke-width="1.5"/>`;
  for (let v = -3; v <= 3; v++) h += `<line x1="${SX(v)}" y1="${SP.T}" x2="${SX(v)}" y2="${SP.B}" stroke="${v ? '#f1f3f6' : LINE}"/><line x1="${SP.L}" y1="${SY(v)}" x2="${SP.R}" y2="${SY(v)}" stroke="${v ? '#f1f3f6' : LINE}"/><text x="${SX(v)}" y="${SP.B + 18}" text-anchor="middle">${v}</text><text x="${SP.L - 8}" y="${SY(v) + 5}" text-anchor="end">${v}</text>`;
  h += `<text x="${(SP.L + SP.R) / 2}" y="${SP.B + 38}" text-anchor="middle" style="fill:${INK}">特徵 1（例：「了」的 z 分數）</text>`;
  h += `<text x="${SP.L - 34}" y="${(SP.T + SP.B) / 2}" text-anchor="middle" transform="rotate(-90 ${SP.L - 34} ${(SP.T + SP.B) / 2})" style="fill:${INK}">特徵 2（例：「便」的 z 分數）</text>`;
  h += `<g clip-path="url(#${id}-clip)">`;
  if (o.field) h += o.field;
  (o.lines || []).forEach(L => {
    if (L.street) { const a = lineAt(L.w, L.b, 1), b = lineAt(L.w, L.b, -1); h += `<polygon points="${P2(a[0])} ${P2(a[1])} ${P2(b[1])} ${P2(b[0])}" fill="${GOLD}" opacity=".16"/>`; }
    if (L.gutters) [1, -1].forEach(k => { const s = lineAt(L.w, L.b, k); h += `<line x1="${SX(s[0][0])}" y1="${SY(s[0][1])}" x2="${SX(s[1][0])}" y2="${SY(s[1][1])}" stroke="${k > 0 ? A_C : B_C}" stroke-width="2" stroke-dasharray="7 5" opacity=".8"/>`; });
    const s = lineAt(L.w, L.b, 0);
    h += `<line x1="${SX(s[0][0])}" y1="${SY(s[0][1])}" x2="${SX(s[1][0])}" y2="${SY(s[1][1])}" stroke="${L.color || INK}" stroke-width="${L.width || 3}" ${L.dash ? `stroke-dasharray="${L.dash}"` : ''}/>`;
  });
  h += `</g>`;
  if (o.labels) o.labels.forEach(([x, y, t, col]) => { h += `<text x="${SX(x)}" y="${SY(y)}" style="font-size:17px;font-weight:600;fill:${col || INK}">${t}</text>`; });
  if (o.extra) h += o.extra;
  (o.pts || PTS).forEach((p, i) => {
    const cx = SX(p.x), cy = SY(p.y), col = p.c > 0 ? A_C : B_C;
    if (o.sv && o.sv(p, i)) h += `<circle cx="${cx}" cy="${cy}" r="14" fill="none" stroke="${GOLD}" stroke-width="3.5"/>`;
    if (o.bad && o.bad(p, i)) h += `<circle cx="${cx}" cy="${cy}" r="14" fill="none" stroke="${B_C}" stroke-width="2.5" stroke-dasharray="4 3"/>`;
    if (p.diamond) h += `<rect x="${cx - 9}" y="${cy - 9}" width="18" height="18" transform="rotate(45 ${cx} ${cy})" fill="${col}" stroke="${INK}" stroke-width="2"/>`;
    else h += `<circle cx="${cx}" cy="${cy}" r="8" fill="${col}" stroke="#fff" stroke-width="1.5"/>`;
    if (o.val) { const [t, bad] = o.val(p, i); h += `<text class="lbl" x="${cx + 11}" y="${cy - 8}" style="${bad ? `fill:${B_C};font-weight:700;font-size:15px` : ''}">${t}</text>`; }
  });
  svg.innerHTML = h;
}
const f = (L, p) => L.w[0] * p.x + L.w[1] * p.y + L.b;

/* ---------- 7. many separating lines ---------- */
(function () {
  const WANT = [[-24, 0.22], [18, 0.75], [-8, 0.85], [27, 0.3], [0, 0.5]];
  const LINES = WANT.map(([dt, t]) => {
    let d = dt, m;
    for (;;) { m = marginAt(PTS, OPT.th + d * Math.PI / 180); if (m.W > 0.12 || Math.abs(d) < 0.5) break; d *= 0.8; }
    const c = m.mr + t * m.W;
    return { w: m.n, b: -c };
  });
  // a new chapter, a little on the blue side of the best line
  const o = OPT, dir = [-o.n[1], o.n[0]];
  const STAR = { x: o.n[0] * (o.c + 0.12) + 0.9 * dir[0], y: o.n[1] * (o.c + 0.12) + 0.9 * dir[1] };
  let li = 0;
  HOOKS['s-lines'] = {
    render(step, el) {
      const L = LINES[li], blue = f(L, STAR) > 0;
      let extra = '';
      if (step >= 2) {
        const cx = SX(STAR.x), cy = SY(STAR.y);
        extra = `<text x="${cx}" y="${cy + 11}" text-anchor="middle" style="font-size:34px;fill:${blue ? A_C : B_C};stroke:${INK};stroke-width:1.2">★</text><text x="${cx}" y="${cy + 38}" text-anchor="middle" style="font-size:16px;font-weight:600;fill:${blue ? A_C : B_C}">→ ${blue ? '前 80 回' : '後 40 回'}</text>`;
      }
      svmPlot($('#ln-svg', el), { lines: [{ ...L, color: INK }], extra });
      $('#ln-i', el).textContent = li + 1;
    },
    key(e) { if (e.key === 'n' || e.key === 'N') { li = (li + 1) % LINES.length; return true; } }
  };
})();

/* ---------- 7. rotate the street ---------- */
(function () {
  let k = 10;                                            // steps of 3° away from the optimum
  HOOKS['s-street'] = {
    render(step, el) {
      const m = marginAt(PTS, OPT.th + k * 3 * Math.PI / 180);
      const ok = m.W > 0;
      const L = ok ? { ...canon(m), street: true, gutters: true } : { w: m.n, b: -m.c, color: B_C, dash: '10 6' };
      const extra = ok ? '' : `<text x="${(SP.L + SP.R) / 2}" y="${SP.T + 34}" text-anchor="middle" style="font-size:24px;font-weight:700;fill:${B_C}">分不開！not separable</text>`;
      svmPlot($('#st-svg', el), {
        lines: [L], extra,
        sv: (p) => ok && step >= 1 && Math.abs((m.n[0] * p.x + m.n[1] * p.y) - (p.c > 0 ? m.mb : m.mr)) < 1e-9
      });
      $('#st-w', el).textContent = ok ? m.W.toFixed(2) + (k === 0 ? '  ✓ 最寬！' : '') : '—';
      $('#st-max', el).textContent = OPT.W.toFixed(2);
      $('#st-meter', el).style.width = (ok ? 100 * m.W / OPT.W : 0) + '%';
    },
    key(e) {
      if (e.key === 'ArrowUp') { k++; return true; }
      if (e.key === 'ArrowDown') { k--; return true; }
      if (e.key === 'o' || e.key === 'O') { k = 0; return true; }
    }
  };
})();

/* ---------- 7. a classifier as a machine: features → weighted wires → Σ → lamp ---------- */
(function () {
  const WORDS = ['了', '便', '呢', '道'], W = [0.9, -1.2, -0.4, 0.3], B = -0.3;
  const CH = [[23, [1.5, -0.5, 0.2, 0.8]], [97, [-0.8, 1.1, 0.9, -0.4]], [52, [0.4, 0.3, -0.6, 1.0]], [110, [-0.2, 0.6, 0.5, 0.2]]];
  let ci = 0, el = null;
  const IY = i => 70 + i * 80, IX = 330, NX = 700, NY = 190;
  const sg = v => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(1);
  function draw(step) {
    const [n, x] = CH[ci], fx = x.reduce((t, v, i) => t + v * W[i], B), front = fx > 0;
    let h = `<defs><radialGradient id="glow"><stop offset="0" stop-color="#fde68a"/><stop offset=".6" stop-color="#fbbf24"/><stop offset="1" stop-color="#f59e0b" stop-opacity="0"/></radialGradient>
      <linearGradient id="mach" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1e293b"/><stop offset="1" stop-color="#334155"/></linearGradient></defs>`;
    // the chapter being read
    h += `<g><rect x="20" y="110" width="150" height="170" rx="10" fill="#fff" stroke="${INK}" stroke-width="3"/>`;
    for (let k = 0; k < 6; k++) h += `<rect x="38" y="${150 + k * 18}" width="${[110, 90, 115, 80, 105, 70][k]}" height="7" rx="3" fill="#cbd2dc"/>`;
    h += `<text x="95" y="138" text-anchor="middle" style="font-size:20px;fill:${INK};font-weight:700">第 ${n} 回</text></g>`;
    h += `<path d="M178 195 H${IX - 70}" stroke="${INK}" stroke-width="3" marker-end="url(#ob-arr)"/>`;
    h += `<defs>${svgArrowDefs('ob-arr', INK)}${svgArrowDefs('ob-arr2', INK)}</defs>`;
    // wires and their weights
    WORDS.forEach((w, i) => {
      const col = W[i] >= 0 ? A_C : B_C, d = `M${IX + 30} ${IY(i)} C${IX + 180} ${IY(i)}, ${NX - 170} ${NY}, ${NX - 62} ${NY}`;
      h += `<path id="wire${i}" d="${d}" fill="none" stroke="${step >= 2 ? col : '#cbd2dc'}" stroke-width="${step >= 2 ? 2 + Math.abs(W[i]) * 6 : 3}" opacity=".8"/>`;
      if (step >= 2) h += `<text x="${IX + 40}" y="${IY(i) - 12}" style="font-size:17px;font-weight:700;fill:${col}">w = ${sg(W[i])}</text>`;
      if (step >= 3) h += `<circle r="7" fill="#fbbf24" stroke="#fff" stroke-width="2"><animateMotion dur="0.9s" begin="${0.1 * i}s" fill="freeze" path="${d}"/></circle>`;
    });
    // inputs
    WORDS.forEach((w, i) => {
      h += `<circle cx="${IX}" cy="${IY(i)}" r="30" fill="#fff" stroke="${INK}" stroke-width="2.5"/><text x="${IX}" y="${IY(i) + 9}" text-anchor="middle" style="font-size:26px;fill:${INK}">${w}</text>`;
      if (step >= 1) h += `<text x="${IX - 42}" y="${IY(i) + 7}" text-anchor="end" style="font-size:18px;fill:${INK};font-weight:700">x = ${sg(x[i])}</text>`;
    });
    // the machine
    h += `<circle cx="${NX}" cy="${NY}" r="95" fill="url(#glow)" opacity="${step >= 3 ? 0.9 : 0.35}"><animate attributeName="r" values="88;100;88" dur="2.4s" repeatCount="indefinite"/></circle>`;
    h += `<rect x="${NX - 62}" y="${NY - 62}" width="124" height="124" rx="26" fill="url(#mach)" stroke="#fbbf24" stroke-width="3"/>`;
    h += `<text x="${NX}" y="${NY - 8}" text-anchor="middle" style="font-size:44px">🧠</text>`;
    h += `<text x="${NX}" y="${NY + 42}" text-anchor="middle" style="font-size:${step >= 3 ? 26 : step >= 2 ? 18 : 34}px;fill:#fde68a;font-weight:700">${step >= 3 ? (fx >= 0 ? '+' : '−') + Math.abs(fx).toFixed(2) : step >= 2 ? 'Σ w·x + b' : '?'}</text>`;
    h += `<path d="M${NX + 66} ${NY} H${NX + 140}" stroke="${INK}" stroke-width="3" marker-end="url(#ob-arr2)"/>`;
    // the two lamps
    [[true, '前 80 回', A_C, NY - 60], [false, '後 40 回', B_C, NY + 60]].forEach(([fr, t, col, y]) => {
      const on = step >= 3 && fr === front;
      h += `<circle cx="${NX + 190}" cy="${y}" r="28" fill="${on ? col : '#e5e7eb'}" stroke="${col}" stroke-width="3" style="${on ? `filter:drop-shadow(0 0 12px ${col})` : ''}">${on ? '<animate attributeName="opacity" values="0;0;1" keyTimes="0;0.8;1" dur="1.1s" fill="freeze"/>' : ''}</circle>`;
      h += `<text x="${NX + 230}" y="${y + 8}" style="font-size:24px;font-weight:${on ? 700 : 400};fill:${on ? col : MUTE}">${t}</text>`;
    });
    h += `<text x="${NX}" y="${NY + 120}" text-anchor="middle" style="font-size:15px">分類器 classifier</text>`;
    $('#clf-svg', el).innerHTML = h;
  }
  let last = 0;
  HOOKS['s-clf'] = {
    render(step, slide) { el = slide; last = step; draw(step); },
    key(e, step) { if ((e.key === 'n' || e.key === 'N') && step >= 3) { ci = (ci + 1) % CH.length; return true; } }
  };
})();

/* ---------- 7. the objective: the optimal street with its labels ---------- */
HOOKS['s-svmobj'] = {
  render(step, el) {
    const C0 = canon(OPT), nw = Math.hypot(...C0.w), u = [C0.w[0] / nw, C0.w[1] / nw], h = 1 / nw;
    const lab = [[2.05, 2.85, '= 0', INK]];
    if (step >= 1) lab.push([-2.95, 2.85, '+1：前 80 回', A_C], [1.15, -2.95, '−1：後 40 回', B_C]);
    // step 2: from the middle line, 1/‖w‖ to each edge, perpendicular to the line
    let extra = '';
    if (step >= 2) {
      const p0 = [-C0.b * u[0] / nw - 2.1 * -u[1], -C0.b * u[1] / nw - 2.1 * u[0]];
      [1, -1].forEach(sg => {
        const q = [p0[0] + sg * h * u[0], p0[1] + sg * h * u[1]], col = sg > 0 ? A_C : B_C;
        extra += `<line x1="${SX(p0[0])}" y1="${SY(p0[1])}" x2="${SX(q[0])}" y2="${SY(q[1])}" stroke="${col}" stroke-width="3.5" marker-end="url(#ob-svg-wa)"/>`;
        extra += `<text x="${SX(q[0]) + (sg > 0 ? -66 : 8)}" y="${SY(q[1]) + (sg > 0 ? -6 : 18)}" style="font-size:17px;font-weight:700;fill:${col}">1/‖w‖</text>`;
      });
      extra += `<circle cx="${SX(p0[0])}" cy="${SY(p0[1])}" r="5" fill="${INK}"/>`;
    }
    svmPlot($('#ob-svg', el), { lines: [{ ...C0, street: step >= 3, gutters: step >= 1 }], labels: lab, extra, sv: p => step >= 1 && Math.abs(Math.abs(f(C0, p)) - 1) < 1e-6 });
  }
};

/* ---------- 7. SVM vs logistic regression ---------- */
(function () {
  let LR = null, field = null;
  HOOKS['s-lr'] = {
    render(step, el) {
      if (!LR) {
        LR = trainLR(PTS, 0.1);
        const G = 40, cw = (SP.R - SP.L) / G;
        field = '';
        for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) {
          const x = SP.lo + (i + 0.5) / G * (SP.hi - SP.lo), y = SP.hi - (j + 0.5) / G * (SP.hi - SP.lo);
          const p = 1 / (1 + Math.exp(-(LR.w[0] * x + LR.w[1] * y + LR.b)));
          field += `<rect x="${(SP.L + i * cw).toFixed(1)}" y="${(SP.T + j * cw).toFixed(1)}" width="${(cw + 0.4).toFixed(1)}" height="${(cw + 0.4).toFixed(1)}" fill="${p > 0.5 ? A_C : B_C}" opacity="${(Math.abs(p - 0.5) * 0.5).toFixed(3)}"/>`;
        }
      }
      const lines = [{ ...canon(OPT), street: true, gutters: false }];
      if (step >= 1) lines.push({ ...LR, color: '#9333ea', dash: '10 6', width: 3.5 });
      svmPlot($('#lr-svg', el), { lines, field: step >= 2 ? field : '', sv: p => Math.abs(Math.abs(f(canon(OPT), p)) - 1) < 1e-6 });
    }
  };
})();

/* ---------- 7. recursive feature elimination ---------- */
(function () {
  const F = ['回', '沒', '便', '方', '呢', '倒', '好些', '去', '得', '就'];
  const W0 = [0.92, 0.74, 0.52, 0.6, 0.47, 0.36, 0.3, 0.2, 0.24, 0.1];
  let w, gone, round;
  function reset() { w = W0.slice(); gone = new Set(); round = 0; }
  reset();
  const minIdx = () => w.reduce((b, v, i) => (gone.has(i) ? b : b < 0 || v < w[b] ? i : b), -1);
  function eliminate() {
    if (F.length - gone.size <= 3) return;
    gone.add(minIdx()); round++;
    // retraining shuffles the remaining weights a little
    const r = rng(11 + round);
    w = w.map((v, i) => gone.has(i) ? v : v * (0.8 + 0.4 * r()));
  }
  HOOKS['s-rfe'] = {
    render(step, el) {
      const box = $('#rfe-bars', el), mx = Math.max(...w), mi = minIdx();
      box.innerHTML = F.map((c, i) => `<div class="tr ${gone.has(i) ? 'gone' : ''} ${i === mi && step >= 2 ? 'min' : ''}"><span class="ch">${c}</span><div class="track"><div class="fill" style="width:${gone.has(i) ? 0 : 100 * w[i] / mx}%"></div></div><span class="n">${gone.has(i) ? '✕' : w[i].toFixed(2)}</span></div>`).join('');
      $('#rfe-r', el).textContent = round;
    },
    key(e) {
      if (e.key === 'n' || e.key === 'N') { eliminate(); return true; }
      if (e.key === 'r' || e.key === 'R') { reset(); return true; }
    }
  };
})();

/* ---------- 8. experimental design: chapter strips ---------- */
(function () {
  const EXP = [
    ['實驗 1：全書', 'whole book: train 1–60 vs. 91–120, test 61–90', n => n <= 60 ? 'ta' : n <= 90 ? 'te' : 'tb'],
    ['實驗 2：只看前 80 回（應該沒有斷點）', 'first 80 only: 1–30 vs. 51–80, test 31–50', n => n <= 30 ? 'ta' : n <= 50 ? 'te' : n <= 80 ? 'tb' : ''],
    ['實驗 3：只看後 40 回（每回切成兩半）', 'last 40 only: 81–95 vs. 106–120, test 96–105', n => n <= 80 ? '' : n <= 95 ? 'ta' : n <= 105 ? 'te' : 'tb']
  ];
  HOOKS['s-split'] = {
    render(step, el) {
      const box = $('#split', el);
      if (!box.children.length) {
        box.innerHTML = EXP.map(([zh, en, cls], k) => `<div class="exp" data-step="${k + 1}"><div class="h">${zh}<span class="en">${en}</span></div><div class="strip">${Array.from({ length: 120 }, (_, i) => `<i class="${cls(i + 1)}"></i>`).join('')}</div><div class="strip-ax">${[1, 20, 40, 60, 80, 100, 120].map(n => `<span style="left:${(n - 0.5) * 9}px">${n}</span>`).join('')}</div></div>`).join('');
      }
      box.querySelectorAll('[data-step]').forEach(e => e.classList.toggle('on', step >= +e.dataset.step));
    }
  };
})();

/* ---------- 8. pseudo-aggregation: a hundred runs of SVM-RFE (illustrative) ---------- */
(function () {
  const F = [['回', 0.85], ['沒', 0.62], ['便', 0.55], ['呢', 0.5], ['方', 0.46], ['好些', 0.4], ['倒', 0.34], ['去', 0.26], ['得', 0.24], ['就', 0.2], ['知', 0.17]];
  let r, runs, cnt, last, timer = null;
  function reset() { r = rng(5); runs = 0; cnt = F.map(() => 0); last = []; stop(); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function run() {
    if (runs >= 100) return;
    runs++;
    // each run keeps the strong features with high probability, plus a few random weak ones
    last = F.map(([c, p], i) => (r() < p ? i : -1)).filter(i => i >= 0);
    last.forEach(i => cnt[i]++);
  }
  let el0;
  function paint(el) {
    $('#agg-n', el).textContent = runs;
    $('#agg-run', el).innerHTML = last.map(i => `<span class="w">${F[i][0]}</span>`).join('');
    $('#agg-bars', el).innerHTML = F.map(([c], i) => `<div class="tr"><span class="ch">${c}</span><div class="track"><div class="fill" style="width:${runs ? 100 * cnt[i] / runs : 0}%"></div></div><span class="n">${cnt[i]}</span></div>`).join('');
  }
  reset();
  HOOKS['s-agg'] = {
    render(step, el) { el0 = el; paint(el); },
    key(e, step, el) {
      if (e.key === 'n' || e.key === 'N') { stop(); run(); return true; }
      if (e.key === 'r' || e.key === 'R') { reset(); return true; }
      if (e.key === 'a' || e.key === 'A') {
        if (timer) stop();
        else timer = setInterval(() => { if (!el0.classList.contains('active') || runs >= 100) { stop(); return; } run(); paint(el0); }, 90);
        return true;
      }
    }
  };
})();

/* ---------- 8. the result, redrawn from Fig. 1(b) (values read off the figure, approximate) ---------- */
(function () {
  const V = { 61: 1.75, 62: 1.85, 63: 1.5, 64: 0.9, 65: 1.5, 66: 0.1, 67: -1.35, 68: 1.05, 69: 0.6, 70: 1.55, 71: 1.35, 72: 1.3, 73: 1.45, 74: 1.9, 75: 2.6, 76: 2.25, 77: 1.65, 78: 0.9, 79: 1.65, 80: 1.9,
    81: -0.55, 82: -0.6, 83: -0.8, 84: -1.45, 85: -0.9, 86: -3.95, 87: -0.45, 88: -0.75, 89: -0.25, 90: -0.25 };
  const X = n => 90 + (n - 60) * 18.5, Y = v => 30 + (3 - v) / 7 * 360;
  HOOKS['s-res'] = {
    render(step, el) {
      let h = '';
      if (step >= 3) h += `<rect x="${X(80.5)}" y="${Y(3)}" width="${X(90.5) - X(80.5)}" height="${Y(-4) - Y(3)}" fill="${B_C}" opacity=".06"/>`;
      for (let v = -4; v <= 3; v++) h += `<line x1="${X(60)}" y1="${Y(v)}" x2="${X(90.5)}" y2="${Y(v)}" stroke="${v ? '#f1f3f6' : INK}" stroke-width="${v ? 1 : 2}"/><text x="${X(60) - 10}" y="${Y(v) + 5}" text-anchor="end">${v}</text>`;
      for (let n = 60; n <= 90; n += 5) h += `<text x="${X(n)}" y="${Y(-4) + 24}" text-anchor="middle">${n}</text>`;
      h += `<text x="${X(75)}" y="${Y(-4) + 50}" text-anchor="middle" style="fill:${INK}">回 chapter</text>`;
      h += `<text x="${X(60) - 46}" y="${Y(-0.5)}" text-anchor="middle" transform="rotate(-90 ${X(60) - 46} ${Y(-0.5)})" style="fill:${INK}">SVM 分數 classification value</text>`;
      if (step >= 3) h += `<line x1="${X(80.5)}" y1="${Y(3)}" x2="${X(80.5)}" y2="${Y(-4)}" stroke="${GOLD}" stroke-width="3" stroke-dasharray="7 5"/><text x="${X(80.5) + 8}" y="${Y(3) + 18}" style="font-size:17px;font-weight:600;fill:#b45309">第 80 回</text>`;
      Object.entries(V).forEach(([n, v]) => {
        n = +n;
        if (n <= 80 && step >= 1) h += `<text x="${X(n)}" y="${Y(v) + 9}" text-anchor="middle" style="font-size:26px;fill:${A_C}">*</text>`;
        if (n > 80 && step >= 2) h += `<circle cx="${X(n)}" cy="${Y(v)}" r="6.5" fill="none" stroke="${B_C}" stroke-width="2.5"/>`;
      });
      if (step >= 4) h += `<circle cx="${X(67)}" cy="${Y(-1.35)}" r="17" fill="none" stroke="${GOLD}" stroke-width="3.5"/><text x="${X(67) + 22}" y="${Y(-1.35) + 30}" style="font-size:18px;font-weight:700;fill:#b45309">第 67 回</text>`;
      $('#res-svg', el).innerHTML = h;
    }
  };
})();

/* ---------- 8. controls: Table 2 as small bar charts ---------- */
HOOKS['s-ctrl'] = {
  render(step, el) {
    const box = $('#rf-rows', el);
    if (box.children.length) return;
    const T = [['紅樓夢', [0.57, 0.46, 0.43, 0.36, 0.31, 0.30, 0.29, 0.19]], ['三國演義', [0.31, 0.27, 0.26, 0.25, 0.23, 0.22, 0.17, 0.15]], ['水滸傳', [0.18, 0.17, 0.16, 0.16, 0.14, 0.11, 0.11, 0.10]], ['西遊記', [0.03, 0.03, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02]]];
    box.innerHTML = T.map(([n, v], k) => `<div class="rfrow"><span class="nm">${n}</span><div class="bars">${v.map(x => `<div style="height:${Math.max(2, x / 0.6 * 70)}px;background:${k ? '#94a3b8' : 'var(--tgt)'}"></div>`).join('')}</div><span class="top">${v[0].toFixed(2)}</span></div>`).join('');
  }
};

texify(document.getElementById('stage'));
