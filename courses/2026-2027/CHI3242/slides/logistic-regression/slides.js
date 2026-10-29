/* Slide-specific logic (loaded before deck.js). */
window.HOOKS = {};
window.SECTIONS = [
  { id: 'intro',   zh: '什麼是分類',   en: 'What is classification?' },
  { id: 'sig',     zh: 'S 形曲線',     en: 'The sigmoid' },
  { id: 'feat',    zh: '特徵',         en: 'Features' },
  { id: 'model',   zh: '計算預測',     en: 'Making a prediction' },
  { id: 'train',   zh: '訓練',         en: 'Loss and gradient descent' },
  { id: 'multi',   zh: '多類 Softmax', en: 'Multi-class' },
  { id: 'eval',    zh: '評估',         en: 'Evaluation' },
  { id: 'code',    zh: '實作',         en: 'In practice' },
  { id: 'summary', zh: '總結',         en: 'Summary' }
];
const $ = (s, r = document) => r.querySelector(s);
const sig = z => 1 / (1 + Math.exp(-z));

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

/* ---------- title slide: the logistic curve as decoration ---------- */
HOOKS['s-title'] = {
  render(step, el) {
    if (el._b) return;
    el._b = true;
    const svg = $('#tsig', el);
    const X0 = 24, X1 = 296, Y0 = 34, Y1 = 192;
    const px = z => X0 + (z + 6) / 12 * (X1 - X0);
    const py = p => Y1 - p * (Y1 - Y0);
    let g = '<rect x="8" y="12" width="304" height="196" rx="14" fill="#f5f7fa"/>';
    g += `<line x1="${X0}" y1="${py(.5)}" x2="${X1}" y2="${py(.5)}" stroke="#c9ced8" stroke-dasharray="6 6"/>`;
    g += `<line x1="${px(0)}" y1="${Y0}" x2="${px(0)}" y2="${Y1}" stroke="#c9ced8" stroke-dasharray="6 6"/>`;
    const pts = [];
    for (let z = -6; z <= 6.001; z += .25) pts.push(px(z).toFixed(1) + ',' + py(sig(z)).toFixed(1));
    g += `<polyline points="${pts.join(' ')}" fill="none" stroke="#1f5fd6" stroke-width="5" stroke-linecap="round"/>`;
    g += `<text x="${px(0) - 4}" y="${Y1 + 20}" style="font-size:14px;fill:#6a7386">z = 0</text>`;
    g += `<text x="${X0 - 8}" y="${py(1) - 6}" style="font-size:14px;fill:#6a7386">1</text>`;
    g += `<text x="${X0 - 8}" y="${py(0) + 4}" style="font-size:14px;fill:#6a7386">0</text>`;
    g += `<text x="${px(0) - 12}" y="${py(.5) - 10}" text-anchor="end" style="font-size:17px;font-weight:600;fill:#1f5fd6">σ(0) = 0.5</text>`;
    svg.innerHTML = g;
  }
};

/* ---------- the sigmoid: linear line vs the curve, with a movable marker ----------
 * steps: 1 the dashed linear line (can leave [0,1]) · 2 the sigmoid curve · 3 marker + readout (↑/↓) */
(function () {
  let z = 1.5;
  const X0 = 60, X1 = 600, Y0 = 40, Y1 = 340;
  const px = t => X0 + (t + 6) / 12 * (X1 - X0);
  const py = p => Y1 - p * (Y1 - Y0);
  function curvePts() {
    const a = [];
    for (let t = -6; t <= 6.001; t += .25) a.push(px(t).toFixed(1) + ',' + py(sig(t)).toFixed(1));
    return a.join(' ');
  }
  HOOKS['s-sig'] = {
    render(step, el) {
      const svg = $('#sig-svg', el);
      if (!el._b) {
        el._b = true;
        let g = `<line x1="${X0}" y1="${Y0 - 8}" x2="${X0}" y2="${Y1}" stroke="#9aa1ad" stroke-width="2"/>`;
        g += `<line x1="${X0}" y1="${Y1}" x2="${X1}" y2="${Y1}" stroke="#9aa1ad" stroke-width="2"/>`;
        for (let t = -6; t <= 6; t += 2) g += `<line x1="${px(t)}" y1="${Y1}" x2="${px(t)}" y2="${Y1 + 7}" stroke="#9aa1ad" stroke-width="2"/><text x="${px(t)}" y="${Y1 + 26}" text-anchor="middle">${t}</text>`;
        g += `<text x="${(X0 + X1) / 2}" y="${Y1 + 46}" text-anchor="middle" style="font-size:18px;font-weight:600;fill:#1b2333">線性輸出 z</text>`;
        [[1, '1'], [.5, '0.5'], [0, '0']].forEach(([p, t]) => { g += `<text x="${X0 - 10}" y="${py(p) + 5}" text-anchor="end">${t}</text>`; });
        g += `<text x="${X0 - 10}" y="${Y0 - 16}" text-anchor="end" style="font-weight:600">p</text>`;
        g += `<line x1="${X0}" y1="${py(.5)}" x2="${X1}" y2="${py(.5)}" stroke="#e3e6ec" stroke-width="2" stroke-dasharray="7 7"/>`;
        svg.innerHTML = g;
        // dynamic layers, shown and hidden per step below
        svg.insertAdjacentHTML('beforeend',
          `<g class="d"><line x1="${px(-2)}" y1="${py(0)}" x2="${px(2)}" y2="${py(1)}" stroke="#9aa1ad" stroke-width="3.5" stroke-dasharray="11 8"/>` +
          `<text x="${px(1.4)}" y="${Y0 - 14}" style="font-size:16px;fill:#6a7386">線性 linear：ŷ = 0.25z + 0.5</text></g>` +
          `<g class="s"><polyline points="${curvePts()}" fill="none" stroke="#1f5fd6" stroke-width="5" stroke-linecap="round"/>` +
          `<text x="${px(-4.7)}" y="${py(0.16)}" style="font-size:18px;font-weight:600;fill:#1f5fd6">σ(z)</text></g>` +
          `<g class="m"><line class="gv" x1="0" y1="0" x2="0" y2="0" stroke="#1f5fd6" stroke-width="2" stroke-dasharray="5 5"/>` +
          `<line class="gh" x1="0" y1="0" x2="0" y2="0" stroke="#1f5fd6" stroke-width="2" stroke-dasharray="5 5"/>` +
          `<circle class="mk" r="9" fill="#1f5fd6" stroke="#fff" stroke-width="3"/></g>`);
      }
      svg.querySelector('.d').style.opacity = step >= 1 ? 1 : 0;
      svg.querySelector('.s').style.opacity = step >= 2 ? 1 : 0;
      const m = svg.querySelector('.m');
      m.style.opacity = step >= 3 ? 1 : 0;
      const mx = px(z), my = py(sig(z));
      const gv = svg.querySelector('.gv'), gh = svg.querySelector('.gh'), mk = svg.querySelector('.mk');
      gv.setAttribute('x1', mx); gv.setAttribute('x2', mx); gv.setAttribute('y1', my); gv.setAttribute('y2', Y1);
      gh.setAttribute('x1', X0); gh.setAttribute('x2', mx); gh.setAttribute('y1', my); gh.setAttribute('y2', my);
      mk.setAttribute('cx', mx); mk.setAttribute('cy', my);
      $('#sig-z', el).textContent = (z > 0 ? '+' : '') + z.toFixed(1);
      $('#sig-p', el).textContent = sig(z).toFixed(2);
    },
    key(e, step) {
      if (step < 3 || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return false;
      z = Math.max(-6, Math.min(6, z + (e.key === 'ArrowUp' ? 0.5 : -0.5)));
      return true;
    }
  };
})();

/* ---------- one prediction as a machine: words → weighted wires → Σ → σ → lamp ----------
 * steps: 1 x values · 2 weights and bias · 3 the sum z · 4 the sigmoid and the label */
(function () {
  const INK = '#1b2333', MUTE = '#6a7386', POS = '#16a34a', NEG = '#dc2626', ACC = '#1f5fd6';
  const WORDS = ['精彩', '電影', '好看', '失望', '無聊'];
  const X = [0.80, 0.50, 0, 0, 0], W = [1.10, 0.02, 0.95, -1.30, -0.90], B = 0.10;
  const z = X.reduce((t, v, i) => t + v * W[i], B), p = sig(z);
  const IX = 320, IY = i => 57 + i * 64, NX = 600, NY = 185, SX0 = 720, SX1 = 860;
  const sg = v => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(2);
  const arrow = (x1, x2, y) => `<path d="M${x1} ${y} H${x2}" stroke="${INK}" stroke-width="3" marker-end="url(#lr-arr)"/>`;
  function draw(step, svg) {
    let h = `<defs><marker id="lr-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="${INK}"/></marker></defs>`;
    // the review
    h += `<rect x="10" y="115" width="130" height="140" rx="10" fill="#fff" stroke="${INK}" stroke-width="3"/>`;
    h += `<text x="75" y="145" text-anchor="middle" style="font-size:16px;fill:${MUTE}">評論 review</text>`;
    h += `<text x="75" y="190" text-anchor="middle" style="font-size:24px;fill:${INK}">這部電影</text>`;
    h += `<text x="75" y="225" text-anchor="middle" style="font-size:24px;fill:${INK}">很精彩</text>`;
    h += arrow(146, 200, NY);
    // wires, weights, and the values flowing along them
    WORDS.forEach((w, i) => {
      const col = W[i] >= 0 ? POS : NEG, d = `M${IX + 28} ${IY(i)} C${IX + 150} ${IY(i)}, ${NX - 160} ${NY}, ${NX - 56} ${NY}`;
      const off = step >= 3 && !X[i];
      h += `<path d="${d}" fill="none" stroke="${step >= 2 ? col : '#cbd2dc'}" stroke-width="${step >= 2 ? 2 + Math.abs(W[i]) * 6 : 3}" opacity="${off ? 0.2 : 0.8}"/>`;
      // wires below the middle bend upwards, so their labels go underneath
      if (step >= 2) h += `<text x="${IX + 38}" y="${IY(i) + (i > 2 ? 24 : -10)}" style="font-size:16px;font-weight:700;fill:${col};opacity:${off ? 0.4 : 1}">w = ${sg(W[i])}</text>`;
      if (step === 3 && X[i]) h += `<circle r="7" fill="#fbbf24" stroke="#fff" stroke-width="2"><animateMotion dur="0.9s" begin="${0.15 * i}s" fill="freeze" path="${d}"/></circle>`;
    });
    // inputs
    WORDS.forEach((w, i) => {
      h += `<circle cx="${IX}" cy="${IY(i)}" r="28" fill="#fff" stroke="${INK}" stroke-width="2.5"/><text x="${IX}" y="${IY(i) + 7}" text-anchor="middle" style="font-size:19px;fill:${INK}">${w}</text>`;
      if (step >= 1) h += `<text x="${IX - 36}" y="${IY(i) + 6}" text-anchor="end" style="font-size:17px;font-weight:700;fill:${X[i] ? INK : MUTE}">x = ${X[i].toFixed(2)}</text>`;
    });
    // the weighted sum
    h += `<rect x="${NX - 55}" y="${NY - 55}" width="110" height="110" rx="22" fill="${INK}"/>`;
    h += `<text x="${NX}" y="${NY + (step >= 2 ? 8 : 14)}" text-anchor="middle" style="font-size:${step >= 3 ? 24 : step >= 2 ? 18 : 40}px;font-weight:700;fill:#fde68a">${step >= 3 ? 'z = ' + z.toFixed(2) : step >= 2 ? 'Σ w·x + b' : 'Σ'}</text>`;
    if (step >= 2) h += `<text x="${NX}" y="${NY - 68}" text-anchor="middle" style="font-size:16px;font-weight:700;fill:${INK}">b = ${sg(B)}</text>`;
    h += `<text x="${NX}" y="${NY + 80}" text-anchor="middle" style="font-size:15px">加權總分 weighted sum</text>`;
    h += arrow(NX + 60, SX0 - 6, NY);
    // the sigmoid
    const qx = t => SX0 + 12 + (t + 6) / 12 * (SX1 - SX0 - 24), qy = v => NY + 43 - v * 86;
    const pts = [];
    for (let t = -6; t <= 6.001; t += .5) pts.push(qx(t).toFixed(1) + ',' + qy(sig(t)).toFixed(1));
    h += `<rect x="${SX0}" y="${NY - 55}" width="${SX1 - SX0}" height="110" rx="16" fill="#f5f7fa" stroke="${step >= 4 ? ACC : '#cbd2dc'}" stroke-width="3"/>`;
    h += `<line x1="${SX0 + 10}" y1="${qy(.5)}" x2="${SX1 - 10}" y2="${qy(.5)}" stroke="#cbd2dc" stroke-dasharray="5 5"/>`;
    h += `<polyline points="${pts.join(' ')}" fill="none" stroke="${step >= 4 ? ACC : '#9aa1ad'}" stroke-width="4" stroke-linecap="round"/>`;
    if (step >= 4) h += `<circle cx="${qx(z)}" cy="${qy(p)}" r="7" fill="${ACC}" stroke="#fff" stroke-width="2.5"/>`;
    h += `<text x="${(SX0 + SX1) / 2}" y="${NY - 68}" text-anchor="middle" style="font-size:16px;font-weight:700;fill:${step >= 4 ? ACC : MUTE}">sigmoid σ</text>`;
    if (step >= 4) h += `<text x="${(SX0 + SX1) / 2}" y="${NY + 82}" text-anchor="middle" style="font-size:22px;font-weight:700;fill:${ACC}">p = ${p.toFixed(2)}</text>`;
    h += arrow(SX1 + 6, SX1 + 56, NY);
    // the two lamps
    [[true, '正面', POS, NY - 50], [false, '負面', NEG, NY + 50]].forEach(([pos, t, col, y]) => {
      const on = step >= 4 && pos === (p >= 0.5);
      h += `<circle cx="${SX1 + 90}" cy="${y}" r="24" fill="${on ? col : '#e5e7eb'}" stroke="${col}" stroke-width="3" style="${on ? `filter:drop-shadow(0 0 10px ${col})` : ''}"/>`;
      h += `<text x="${SX1 + 124}" y="${y + 8}" style="font-size:24px;font-weight:${on ? 700 : 400};fill:${on ? col : MUTE}">${t}</text>`;
    });
    svg.innerHTML = h;
  }
  HOOKS['s-model'] = { render(step, el) { draw(step, $('#clf-svg', el)); } };
})();

/* ---------- cross-entropy: two loss curves, one per true label ---------- */
HOOKS['s-train'] = {
  render(step, el) {
    if (el._b) return;
    el._b = true;
    const svg = $('#loss-svg', el);
    const X0 = 55, X1 = 545, Y0 = 30, Y1 = 290;
    const px = p => X0 + p * (X1 - X0);
    const py = L => Y1 - L * 50;
    let g = '';
    for (let L = 1; L <= 5; L++) g += `<line x1="${X0}" x2="${X1}" y1="${py(L)}" y2="${py(L)}" stroke="#e3e6ec"/><text x="${X0 - 8}" y="${py(L) + 4}" text-anchor="end">${L}</text>`;
    g += `<line x1="${X0}" y1="${Y0}" x2="${X0}" y2="${Y1}" stroke="#9aa1ad" stroke-width="2"/><line x1="${X0}" y1="${Y1}" x2="${X1}" y2="${Y1}" stroke="#9aa1ad" stroke-width="2"/>`;
    [0, .25, .5, .75, 1].forEach(p => g += `<line x1="${px(p)}" y1="${Y1}" x2="${px(p)}" y2="${Y1 + 7}" stroke="#9aa1ad" stroke-width="2"/><text x="${px(p)}" y="${Y1 + 26}" text-anchor="middle">${p}</text>`);
    g += `<text x="${(X0 + X1) / 2}" y="${Y1 + 46}" text-anchor="middle" style="font-size:18px;font-weight:600;fill:#1b2333">模型給「正面」的機率 p</text>`;
    g += `<text x="${X0 - 45}" y="${Y0 - 12}" style="font-weight:600">損失 loss</text>`;
    const gp = [], rp = [];
    for (let p = 0.01; p <= 0.995; p += 0.005) {
      gp.push(px(p).toFixed(1) + ',' + Math.max(Y0, py(-Math.log(p))).toFixed(1));
      rp.push(px(p).toFixed(1) + ',' + Math.max(Y0, py(-Math.log(1 - p))).toFixed(1));
    }
    g += `<polyline points="${gp.join(' ')}" fill="none" stroke="#16a34a" stroke-width="5" stroke-linecap="round"/>`;
    g += `<polyline points="${rp.join(' ')}" fill="none" stroke="#dc2626" stroke-width="5" stroke-linecap="round"/>`;
    g += `<text x="${px(0.08)}" y="${py(4.4)}" style="font-size:17px;font-weight:600;fill:#16a34a">標籤 y = 1：L = −log p</text>`;
    g += `<text x="${px(0.92)}" y="${py(4.4)}" text-anchor="end" style="font-size:17px;font-weight:600;fill:#dc2626">標籤 y = 0：L = −log(1−p)</text>`;
    svg.innerHTML = g;
  }
};

texify(document.getElementById('stage'));
