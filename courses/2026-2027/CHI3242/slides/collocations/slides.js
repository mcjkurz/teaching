/* Slide-specific logic (loaded before deck.js). */
window.HOOKS = {};
window.SECTIONS = [
  { id: 'intro',    zh: '搭配詞',     en: 'Collocations' },
  { id: 'observed', zh: '觀察值',     en: 'Observed frequency' },
  { id: 'expected', zh: '期望值',     en: 'Expected frequency' },
  { id: 'compare',  zh: '觀察 vs. 期望 · MI', en: 'Observed vs. expected, MI' },
  { id: 'ct',       zh: '列聯表',     en: 'Contingency table' },
  { id: 'three',    zh: '三種「相鄰」', en: 'Three kinds of “near”' },
  { id: 'window',   zh: '視窗法',     en: 'Window approach' },
  { id: 'sentence', zh: '句子法',     en: 'Sentence approach' },
  { id: 'syntax',   zh: '語法關係法', en: 'Grammatical approach' },
  { id: 'summary',  zh: '總結',       en: 'Summary' }
];
const $ = (s, r = document) => r.querySelector(s);
const isPunct = t => /^[，。、]$/.test(t);
const chip = (t, cls = '') => {
  const s = document.createElement('span');
  s.className = 'tok ' + cls + (isPunct(t) ? ' punct' : '');
  s.textContent = t;
  return s;
};
const EV = { a: 'O₁₁', b: 'O₁₂', c: 'O₂₁', d: 'O₂₂' };   // Evert's cell names

/* ---------- LaTeX: write \( inline \) or \[ display \] anywhere in the text; KaTeX is bundled in vendor/ ---------- */
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
const BLUE = '\\textcolor{#1f5fd6}', RED = '\\textcolor{#e0570f}', PUR = '\\textcolor{#7c3aed}';
const bi = ([z, e]) => `<span class="z">${z}</span><span class="e">${e}</span>`;

/* ---------- horizon graphic: distance labels above tokens + bracket below ---------- */
function clearHorizon(box, els) {
  box.querySelectorAll('.hz').forEach(n => n.remove());
  els.forEach(e => e.removeAttribute('data-d'));
}
function drawHorizon(box, els, targets, h) {
  clearHorizon(box, els);
  const n = els.length, used = [];   // used: [row, lo, hi, level]
  targets.forEach(t => {
    const lo = Math.max(0, t - h), hi = Math.min(n - 1, t + h);
    for (let i = lo; i <= hi; i++) {
      if (i === t) continue;
      const d = i - t, old = els[i].getAttribute('data-d');
      if (old === null || Math.abs(d) < Math.abs(+old)) els[i].setAttribute('data-d', d > 0 ? '+' + d : '−' + (-d));
    }
    // two brackets per target: left and right half, each starting at the middle of the target word
    const mid = els[t].offsetLeft + els[t].offsetWidth / 2;
    [[lo, t, true], [t, hi, false]].forEach(([from, to, isLeft]) => {
      if (from === to) return;
      const rows = new Map();
      for (let i = from; i <= to; i++) { const k = els[i].offsetTop; (rows.get(k) || rows.set(k, []).get(k)).push(i); }
      rows.forEach((group, top) => {
        const a = els[group[0]], b = els[group[group.length - 1]];
        let x0 = a.offsetLeft, x1 = b.offsetLeft + b.offsetWidth;
        if (group.includes(t)) { if (isLeft) x1 = mid - 2; else x0 = mid + 2; }
        let level = 0;
        used.forEach(u => { if (u.top === top && !(u.hi < x0 || u.lo > x1)) level = Math.max(level, u.level + 1); });
        used.push({ top, lo: x0, hi: x1, level });
        const br = document.createElement('div');
        br.className = 'hz';
        br.style.left = x0 + 'px';
        br.style.width = (x1 - x0) + 'px';
        br.style.top = (top + a.offsetHeight + 3 + level * 8) + 'px';
        box.appendChild(br);
      });
    });
  });
}

/* ---------- 3. random vs meaningful: shuffle -> order (FLIP animation) ---------- */
(function () {
  const words = '你 坐 的 是 長途 公共汽車 ， 那 破舊 的 車子 ， 城市 裡 淘汰 下來 的 ， 在 保養 的 極差 的 山區 公路 上 ， 路面 到處 坑坑窪窪 ， 從 早起 顛簸 了 十二 個 小時 ， 來到 這座 南方 山區 的 小縣城 。'.split(' ');
  let seed = 7; const rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;   // fixed shuffle
  const order = words.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  let box, els, state = null;
  HOOKS['s-null'] = {
    render(step, el) {
      if (!box) {
        box = $('#shuffle', el);
        els = words.map(w => chip(w));
        order.forEach(i => box.appendChild(els[i]));
        state = 'shuffled';
      }
      const want = step >= 2 ? 'ordered' : 'shuffled';
      if (want === state) return;
      const first = els.map(e => [e.offsetLeft, e.offsetTop]);
      (want === 'ordered' ? words.map((_, i) => i) : order).forEach(i => box.appendChild(els[i]));
      els.forEach((e, i) => {
        e.style.transition = 'none';
        e.style.transform = `translate(${first[i][0] - e.offsetLeft}px, ${first[i][1] - e.offsetTop}px)`;
      });
      void box.offsetWidth;
      els.forEach((e, i) => {
        e.style.transition = `transform .9s cubic-bezier(.2,.8,.2,1) ${(i % 9) * 40}ms, background .35s`;
        e.style.transform = '';
      });
      box.classList.toggle('ordered', want === 'ordered');
      state = want;
    }
  };
})();

/* ---------- 4. observed frequency O: window around 王婆 ---------- */
(function () {
  const line = '王婆 半日 的 痛苦 沒有 代價 了 王婆 一生 的 痛苦 也 都 是 沒有 代價'.split(' ');
  const X = '王婆', Y = '痛苦', H = 3;
  let built = false, els = [];
  HOOKS['s-observed'] = {
    render(step, el) {
      const box = $('#obs-toks', el);
      if (!built) { line.forEach(t => { const c = chip(t); els.push(c); box.appendChild(c); }); built = true; }
      let O = 0;
      const targets = line.map((t, i) => t === X ? i : -1).filter(i => i >= 0);
      line.forEach((t, i) => {
        const inWin = targets.some(j => j !== i && Math.abs(i - j) <= H);
        const isCol = inWin && t === Y;
        if (isCol) O++;
        els[i].classList.toggle('tgt', step >= 1 && t === X);
        els[i].classList.toggle('win', step >= 2 && inWin && t !== X);
        els[i].classList.toggle('col', step >= 3 && isCol);
      });
      if (step >= 2) drawHorizon(box, els, targets, H); else clearHorizon(box, els);
      $('#obs-O', el).textContent = O;
    }
  };
})();

/* ---------- 5. expected value: drawing balls (+ running-average chart on the next slide) ---------- */
(function () {
  const reds = [0, 2, 3, 6, 9];
  let picked = [2, 4, 6, 7];
  let draws = 0, sum = 0, avgs = [];          // avgs[i] = mean number of red balls after i+1 draws
  const redOf = i => reds.includes(i);
  const redCount = () => picked.filter(redOf).length;
  const pick4 = () => {                       // partial Fisher-Yates: 4 distinct balls, every subset equally likely
    const a = [...Array(10).keys()];
    for (let i = 0; i < 4; i++) { const j = i + Math.floor(Math.random() * (10 - i)); [a[i], a[j]] = [a[j], a[i]]; }
    return a.slice(0, 4);
  };
  const draw = () => { picked = pick4(); draws++; sum += redCount(); avgs.push(sum / draws); };
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs, text) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (text != null) e.textContent = text; return e; };
  function showBalls(box, picking) {
    if (!box.children.length) for (let i = 0; i < 10; i++) { const b = document.createElement('div'); b.className = 'ball' + (redOf(i) ? ' red' : ''); box.appendChild(b); }
    box.classList.toggle('picking', picking);
    [...box.children].forEach((b, i) => b.classList.toggle('picked', picking && picked.includes(i)));
  }
  function chart(svg) {
    svg.innerHTML = '';
    const L = 48, R = 626, T = 14, B = 250, W = R - L, H = B - T;
    const xmax = Math.max(10, Math.ceil(avgs.length / 10) * 10), ymax = 4;
    const X = i => L + W * i / xmax, Y = v => B - H * v / ymax;
    for (let v = 0; v <= ymax; v++) {                       // horizontal grid + y labels
      svg.appendChild(svgEl('line', { x1: L, x2: R, y1: Y(v), y2: Y(v), stroke: '#e3e6ec', 'stroke-width': 1 }));
      svg.appendChild(svgEl('text', { x: L - 10, y: Y(v) + 5, 'text-anchor': 'end' }, v));
    }
    [0, xmax / 2, xmax].forEach(i => svg.appendChild(svgEl('text', { x: X(i), y: B + 20, 'text-anchor': 'middle' }, i)));
    svg.appendChild(svgEl('text', { x: (L + R) / 2, y: B + 40, 'text-anchor': 'middle' }, '抽取次數 draws'));
    svg.appendChild(svgEl('line', { x1: L, x2: R, y1: Y(2), y2: Y(2), stroke: '#1f5fd6', 'stroke-width': 2, 'stroke-dasharray': '6 4' }));
    svg.appendChild(svgEl('text', { x: R, y: Y(2) - 8, 'text-anchor': 'end', style: 'fill:#1f5fd6;font-weight:600' }, 'E = 2'));
    if (!avgs.length) return;
    svg.appendChild(svgEl('polyline', { points: avgs.map((v, i) => `${X(i + 1)},${Y(v)}`).join(' '), fill: 'none', stroke: '#e0570f', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }));
    if (avgs.length <= 40) avgs.forEach((v, i) => svg.appendChild(svgEl('circle', { cx: X(i + 1), cy: Y(v), r: 3.5, fill: '#e0570f' })));
    const last = avgs[avgs.length - 1];
    svg.appendChild(svgEl('circle', { cx: X(avgs.length), cy: Y(last), r: 6, fill: '#e0570f', stroke: '#fff', 'stroke-width': 2 }));
  }
  HOOKS['s-balls'] = {
    render(step, el) {
      showBalls($('#balls', el), step >= 2);
      $('#ball-k', el).textContent = redCount();
    }
  };
  HOOKS['s-balls2'] = {
    render(step, el) {
      showBalls($('#balls2', el), true);
      $('#ball-k2', el).textContent = redCount();
      $('#ball-n', el).textContent = draws;
      $('#ball-avg', el).textContent = draws ? (sum / draws).toFixed(2) : '–';
      chart($('#ball-chart', el));
    },
    key(e) {
      const k = e.key.toLowerCase();
      if (k === 'r') { draw(); return true; }
      if (k === 't') { for (let i = 0; i < 10; i++) draw(); return true; }
      if (k === 'c') { draws = 0; sum = 0; avgs = []; return true; }
      return false;
    }
  };
})();

/* ---------- helper: contingency table (labels are [zh, en] pairs) ---------- */
function ctable(host, v, { rows, cols, hl = '', mini = false, letters = null }) {
  const cell = (k) => `<td class="${hl.includes(k) ? 'hl' : ''}"><span class="letter">${letters ? letters[k] : k}</span>${v[k]}</td>`;
  host.innerHTML = `<table class="ct${mini ? ' mini' : ''}${letters ? ' showl' : ''}">
    <tr><th></th><th>${bi(cols[0])}</th><th>${bi(cols[1])}</th></tr>
    <tr><th class="rh">${bi(rows[0])}</th>${cell('a')}${cell('b')}</tr>
    <tr><th class="rh">${bi(rows[1])}</th>${cell('c')}${cell('d')}</tr>
  </table>`;
}

/* ---------- 8. contingency table, cell by cell ---------- */
HOOKS['s-ct'] = {
  render(step, el) {
    el.querySelectorAll('#ct-main td').forEach((td, i) => td.classList.toggle('hl', step >= 1 && step <= 4 && i === step - 1));
  }
};

/* ---------- 9. Fisher's exact test (hypergeometric) ---------- */
(function () {
  const lf = n => { let s = 0; for (let i = 2; i <= n; i++) s += Math.log(i); return s; };
  const lC = (n, k) => lf(n) - lf(k) - lf(n - k);
  const N = 20, R = 10, C = 10;
  const P = a => Math.exp(lC(R, a) + lC(N - R, C - a) - lC(N, C));
  let built = false;
  HOOKS['s-fisher'] = {
    render(step, el) {
      if (built) return;
      [8, 9, 10].forEach(a => {
        const v = { a, b: R - a, c: C - a, d: N - R - C + a };
        ctable($(`#f${a}`, el), v, { rows: [['女', 'woman'], ['男', 'man']], cols: [['讀書', 'studying'], ['不讀書', 'not studying']], mini: true });
        $(`#p${a}`, el).textContent = `\\(p = ${P(a).toFixed(4)}\\)`;
      });
      $('#p-sum', el).textContent = `\\(p = ${(P(8) + P(9) + P(10)).toFixed(4)} < 0.05\\)`;
      texify(el);
      built = true;
    }
  };
})();

/* ---------- 9c. back to Evert's the Iliad / must also ---------- */
(function () {
  let built = false;
  HOOKS['s-fisher-iliad'] = {
    render(step, el) {
      if (built) return;
      const f = n => n.toLocaleString('en-US');
      const opt = { mini: true, hl: 'a', rows: [['w₁', 'w₁'], ['非 w₁', 'not w₁']], cols: [['w₂', 'w₂'], ['非 w₂', 'not w₂']] };
      const fmt = v => Object.fromEntries(Object.entries(v).map(([k, x]) => [k, f(x)]));
      ctable($('#il-a', el), fmt({ a: 10, b: 99990, c: 0, d: 900000 }), { ...opt, rows: [['the', 'the'], ['非 the', 'not the']], cols: [['Iliad', 'Iliad'], ['非 Iliad', 'not Iliad']] });
      ctable($('#il-b', el), fmt({ a: 10, b: 990, c: 990, d: 998010 }), { ...opt, rows: [['must', 'must'], ['非 must', 'not must']], cols: [['also', 'also'], ['非 also', 'not also']] });
      $('#il-pa', el).textContent = '\\(p \\approx 1 \\times 10^{-10}\\)';
      $('#il-pb', el).textContent = '\\(p \\approx 1 \\times 10^{-7}\\)';
      texify(el);
      built = true;
    }
  };
})();

/* ---------- toy corpus for the three approaches ---------- */
const CORPUS = [
  '今天 是 好 天氣 ， 我們 去 公園 散步 。',
  '昨天 下 了 大 雨 ， 我們 心情 不 好 。',
  '好 天氣 讓 大家 心情 很 好 。',
  '公園 裡 有 一 條 長 路 。',
  '他們 玩 得 很 好 ， 但是 沒有 看 天氣 預報 。'
].map(s => s.split(' '));
const X = '好', Y = '天氣';
const words = s => s.filter(t => !isPunct(t));

/* build the five sentence rows once; later calls only restyle them */
function lines(host, { badges = false, tight = false } = {}) {
  if (!host._rows) {
    host._rows = CORPUS.map((sent, si) => {
      const row = document.createElement('div'); row.className = 'line';
      row.innerHTML = `<div class="sid">S${si + 1}</div>`;
      const toks = document.createElement('div'); toks.className = tight ? 'toks' : 'toks sparse';
      const wordEls = [];
      sent.forEach(t => { const c = chip(t); toks.appendChild(c); if (!isPunct(t)) wordEls.push(c); });
      row.appendChild(toks);
      let badge = null;
      if (badges) { badge = document.createElement('span'); badge.className = 'badge'; row.appendChild(badge); }
      host.appendChild(row);
      return { toks, wordEls, badge, w: words(sent) };
    });
  }
  return host._rows;
}
const setCls = (el, ...c) => { el.className = 'tok ' + c.filter(Boolean).join(' '); };

function windowCounts(h) {
  let N = 0, nX = 0, nY = 0, ctx = 0, a = 0;
  CORPUS.forEach(sent => {
    const w = words(sent); N += w.length;
    w.forEach((t, i) => {
      if (t === X) nX++;
      if (t === Y) nY++;
      if (t !== X && w.some((u, j) => u === X && Math.abs(i - j) <= h)) { ctx++; if (t === Y) a++; }
    });
  });
  return { a, b: ctx - a, c: nY - a, d: N - nX - ctx - (nY - a), N, nX, nY };
}
function sentenceCounts() {
  const v = { a: 0, b: 0, c: 0, d: 0 };
  CORPUS.forEach(s => { const w = words(s); const x = w.includes(X), y = w.includes(Y); v[x && y ? 'a' : x ? 'b' : y ? 'c' : 'd']++; });
  return v;
}
// hand-annotated adjective → noun modifier pairs (word indices within each sentence)
const MODS = [[[2, 3]], [[3, 4]], [[0, 1]], [[5, 6]], []];
function syntaxCounts() {
  const v = { a: 0, b: 0, c: 0, d: 0 };
  CORPUS.forEach((s, si) => { const w = words(s); MODS[si].forEach(([m, n]) => { const x = w[m] === X, y = w[n] === Y; v[x && y ? 'a' : x ? 'b' : y ? 'c' : 'd']++; }); });
  return v;
}

/* ---------- 11. window approach (↑ ↓ changes the horizon) ---------- */
(function () {
  let h = 2;
  HOOKS['s-window'] = {
    render(step, el) {
      const rows = lines($('#win-lines', el));
      rows.forEach(r => {
        const targets = r.w.map((t, i) => t === X ? i : -1).filter(i => i >= 0);
        r.wordEls.forEach((e, i) => {
          const near = r.w[i] !== X && targets.some(j => Math.abs(i - j) <= h);
          setCls(e, step >= 1 && r.w[i] === X && 'tgt', step >= 1 && r.w[i] === Y && 'col', step >= 2 && near && 'win');
        });
        if (step >= 2) drawHorizon(r.toks, r.wordEls, targets, h); else clearHorizon(r.toks, r.wordEls);
      });
      $('#win-h', el).textContent = h;
      const v = windowCounts(h);
      ctable($('#win-ct', el), v, { rows: [['靠近 w₁＝好', 'near w₁'], ['不靠近', 'not near']], cols: [['w₂＝天氣', 'collocate'], ['其他詞', 'other']], hl: 'a', mini: true, letters: EV });
      
    },
    key(e) {
      if (e.key === 'ArrowUp') { h = Math.min(6, h + 1); return true; }
      if (e.key === 'ArrowDown') { h = Math.max(1, h - 1); return true; }
      return false;
    }
  };
})();

/* ---------- 12. sentence approach ---------- */
HOOKS['s-sentence'] = {
  render(step, el) {
    const rows = lines($('#sen-lines', el), { badges: true, tight: true });
    rows.forEach(r => {
      const x = r.w.includes(X), y = r.w.includes(Y);
      r.wordEls.forEach((e, i) => setCls(e, step >= 1 && r.w[i] === X && 'tgt', step >= 1 && r.w[i] === Y && 'col'));
      r.badge.className = 'badge ' + (x && y ? 'both' : x ? 'xonly' : 'none');
      r.badge.textContent = x && y ? '兩者皆有 both' : x ? '只有 X only' : '皆無 neither';
      r.badge.style.opacity = step >= 2 ? 1 : 0;
    });
    ctable($('#sen-ct', el), sentenceCounts(), { rows: [['含 w₁＝好', 'contains w₁'], ['不含 w₁', 'no w₁']], cols: [['含 w₂＝天氣', 'contains w₂'], ['不含 w₂', 'no w₂']], hl: 'a', mini: true, letters: EV });
  }
};

/* ---------- 13. grammatical approach ---------- */
HOOKS['s-syntax'] = {
  render(step, el) {
    const rows = lines($('#syn-lines', el), { tight: true });
    rows.forEach((r, si) => {
      r.wordEls.forEach((e, i) => {
        const pair = MODS[si].find(([m, n]) => i === m || i === n);
        setCls(e, step >= 1 && (pair ? (i === pair[0] ? 'pairA' : 'pairB') : 'dim'));
      });
    });
    $('#syn-list', el).textContent = MODS.flatMap((ms, si) => ms.map(([m, n]) => { const w = words(CORPUS[si]); return `(${w[m]}, ${w[n]})`; })).join('  ');
    ctable($('#syn-ct', el), syntaxCounts(), { rows: [['w₁＝好', 'first word'], ['其他修飾語', 'other']], cols: [['w₂＝天氣', 'second word'], ['其他名詞', 'other']], hl: 'a', mini: true, letters: EV });
  }
};

/* ---------- 14. summary: same table, three ways to count ---------- */
HOOKS['s-summary'] = {
  render(step, el) {
    const L = { rows: [['有 好', 'has 好'], ['無 好', 'no 好']], cols: [['天氣', 'Y'], ['其他', 'other']], mini: true, hl: 'a' };
    ctable($('#sum-win', el), windowCounts(2), L);
    ctable($('#sum-sen', el), sentenceCounts(), L);
    ctable($('#sum-syn', el), syntaxCounts(), L);
  }
};

/* ---------- 10a. Fisher's lady tasting tea ---------- */
(function () {
  let built = false;
  HOOKS['s-tea'] = {
    render(step, el) {
      if (built) return;
      const L = { rows: [['先牛奶', 'milk first'], ['先茶', 'tea first']], cols: [['她說先牛奶', 'says milk'], ['她說先茶', 'says tea']], mini: true };
      ctable($('#tea-perfect', el), { a: 4, b: 0, c: 0, d: 4 }, L);
      ctable($('#tea-three', el), { a: 3, b: 1, c: 1, d: 3 }, L);
      built = true;
    }
  };
})();

/* ---------- binomial-coefficient markup: <span data-binom="top|bottom"> ---------- */
document.querySelectorAll('[data-binom]').forEach(e => {
  const [n, k] = e.dataset.binom.split('|');
  e.innerHTML = `<span class="bn"><span class="p">(</span><span class="st"><span class="n">${n}</span><span class="k">${k}</span></span><span class="p">)</span></span>`;
});
const comb = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); };

/* ---------- 9a. examples of contingency tables ---------- */
(function () {
  let built = false;
  HOOKS['s-examples'] = {
    render(step, el) {
      if (built) return;
      const opt = { mini: true };
      ctable($('#ex-smoke', el), { a: 30, b: 70, c: 10, d: 190 }, { ...opt, rows: [['吸煙者', 'smoker'], ['非吸煙者', 'non-smoker']], cols: [['肺癌', 'cancer'], ['無', 'none']] });
      ctable($('#ex-hand', el), { a: 9, b: 43, c: 4, d: 44 }, { ...opt, rows: [['男', 'male'], ['女', 'female']], cols: [['左手', 'left'], ['右手', 'right']] });
      ctable($('#ex-words', el), sentenceCounts(), { ...opt, rows: [['有 好', 'has 好'], ['無 好', 'no 好']], cols: [['有 天氣', 'has 天氣'], ['無', 'no']] });
      el.querySelectorAll('table.ct').forEach(t => t.classList.add('tight'));
      built = true;
    }
  };
})();

/* ---------- 9c. Fisher / hypergeometric formula, part by part ---------- */
(function () {
  const ids = ['fa', 'fb', 'fc', 'fd', 'ra', 'rc', 'ca', 'cb', 'fn'];
  const letters = { fa: 'a', fb: 'b', fc: 'c', fd: 'd', ra: 'a+b', rc: 'c+d', ca: 'a+c', cb: 'b+d', fn: 'N' };
  const nums = { fa: 8, fb: 2, fc: 2, fd: 8, ra: 10, rc: 10, ca: 10, cb: 10, fn: 20 };
  const all = ['fa', 'fb', 'fc', 'fd'];
  // outer rectangle = the group we choose from (blue: a row, purple: all N items);
  // inner red rectangle = the part we choose (the items that have Y)
  const plan = {
    1: { outer: ['pu', all], tot: { fn: 'pu' } },
    2: { outer: ['bl', ['fa', 'fb']], inner: ['fa'], tot: { ra: 'bl' } },
    3: { outer: ['bl', ['fc', 'fd']], inner: ['fc'], tot: { rc: 'bl' } },
    4: { outer: ['pu', all], inner: ['fa', 'fc'], tot: { fn: 'pu', ca: 'rd' } }
  };
  HOOKS['s-formula'] = {
    render(step, el) {
      const p = plan[step] || {};
      const wrap = $('#fm-wrap', el), k = wrap.getBoundingClientRect().width / wrap.offsetWidth || 1;
      ids.forEach(id => {
        const td = $('#' + id, el);
        td.textContent = step >= 5 ? nums[id] : letters[id];
        td.classList.remove('rd', 'bl', 'pu');
        const t = p.tot && p.tot[id]; if (t) td.classList.add(t);
      });
      wrap.querySelectorAll('.rect').forEach(r => r.remove());
      const box = (cls, list, pad) => {
        const rs = list.map(id => $('#' + id, el).getBoundingClientRect()), w = wrap.getBoundingClientRect();
        const x0 = Math.min(...rs.map(r => r.left)), y0 = Math.min(...rs.map(r => r.top));
        const x1 = Math.max(...rs.map(r => r.right)), y1 = Math.max(...rs.map(r => r.bottom));
        const d = document.createElement('div'); d.className = 'rect ' + cls;
        d.style.left = ((x0 - w.left) / k - pad) + 'px'; d.style.top = ((y0 - w.top) / k - pad) + 'px';
        d.style.width = ((x1 - x0) / k + 2 * pad) + 'px'; d.style.height = ((y1 - y0) / k + 2 * pad) + 'px';
        wrap.appendChild(d);
      };
      if (p.outer) box(p.outer[0], p.outer[1], 7);
      if (p.inner) box('rd', p.inner, 1);
      [2, 3, 4].forEach(n => $('#fp' + (n - 1), el).classList.toggle('act', step === n));
      const num = comb(10, 8) * comb(10, 2), den = comb(20, 10);
      $('#fm-plug', el).textContent = `\\(\\dfrac{\\binom{10}{8}\\binom{10}{2}}{\\binom{20}{10}} = \\dfrac{${comb(10, 8)} \\cdot ${comb(10, 2)}}{${den.toLocaleString('en').replace(/,/g, '{,}')}} = \\dfrac{${num.toLocaleString('en').replace(/,/g, '{,}')}}{${den.toLocaleString('en').replace(/,/g, '{,}')}} \\approx \\mathbf{${(num / den).toFixed(4)}}\\)`;
      texify($('#fm-plug', el));
    }
  };
})();

/* ---------- 7a / 7b. MI and PPMI ---------- */
(function () {
  const ratios = [[1 / 4, '1/4'], [1 / 2, '1/2'], [1, '1'], [2, '2'], [4, '4'], [8, '8']];
  const meaning = { '-2': ['遠少於偶然', 'far less than chance'], '-1': ['少於偶然', 'less than chance'], 0: ['如偶然', 'as expected'], 1: ['多一倍', 'twice as often'], 2: ['4 倍', '4× as often'], 3: ['8 倍', '8× as often'] };
  const cls = m => m < 0 ? 'neg' : m === 0 ? 'zer' : 'pos';
  const fmt = m => (m > 0 ? '+' : m < 0 ? '−' : '') + Math.abs(m);
  const mi = r => Math.log2(r);
  let built = false;
  const build = el => {
    $('#mi-val', el) && ($('#mi-val', el).textContent = mi(8 / 1.2).toFixed(2));
    $('#mi-table', el) && ($('#mi-table', el).innerHTML =
      `<thead><tr><th class="num">O / E</th><th class="num">MI (bits)</th><th class="bi xs"><span class="zh">意思</span><span class="en">meaning</span></th></tr></thead>` +
      ratios.map(([r, l]) => { const m = mi(r); const [z, e] = meaning[m]; return `<tr class="${cls(m)}"><td class="num">${l}</td><td class="num"><b>${fmt(m)}</b></td><td class="bi xs"><span class="zh">${z}</span><span class="en">${e}</span></td></tr>`; }).join(''));
    $('#ppmi-table', el) && ($('#ppmi-table', el).innerHTML =
      `<thead><tr><th class="num">O / E</th><th class="num">MI</th><th class="num">PPMI</th></tr></thead>` +
      ratios.map(([r, l]) => { const m = mi(r); const p = Math.max(0, m); return `<tr class="${cls(m)}"><td class="num">${l}</td><td class="num">${fmt(m)}</td><td class="num ${p === 0 ? 'zero' : ''}"><b>${p}</b></td></tr>`; }).join(''));
  };
  HOOKS['s-mi'] = { render(step, el) { if (!built) { build(document); built = true; } } };
  HOOKS['s-ppmi'] = { render(step, el) { if (!built) { build(document); built = true; } } };
})();

/* ---------- 14a. Evert's own syntactic example: (young, gentleman), Fig. 58.6 ---------- */
(function () {
  let built = false;
  HOOKS['s-syntax-evert'] = {
    render(step, el) {
      if (built) return;
      ctable($('#synev-ct', el), { a: 1, b: 2, c: 2, d: 4 }, { rows: [['w₁＝young', 'first word'], ['其他形容詞', 'other adjective']], cols: [['w₂＝gentleman', 'second word'], ['其他名詞', 'other noun']], hl: 'a', mini: true, letters: EV });
      built = true;
    }
  };
})();

/* render all static LaTeX once */
texify(document.getElementById('stage'));

/* ---------- 7a0. graph of log2 ---------- */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const el_ = (tag, attrs, text) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (text != null) e.textContent = text; return e; };
  let drawn = null;
  HOOKS['s-log'] = {
    render(step, el) {
      const svg = $('#log-chart', el), showPts = step >= 3;
      if (drawn === showPts) return;
      drawn = showPts;
      svg.innerHTML = '';
      const L = 56, R = 540, T = 40, B = 300, xmax = 8, ymin = -3, ymax = 3;
      const X = x => L + (R - L) * x / xmax, Y = y => B - (B - T) * (y - ymin) / (ymax - ymin);
      for (let y = ymin; y <= ymax; y++) {
        svg.appendChild(el_('line', { x1: L, x2: R, y1: Y(y), y2: Y(y), stroke: y === 0 ? '#6a7386' : '#e3e6ec', 'stroke-width': y === 0 ? 2 : 1 }));
        svg.appendChild(el_('text', { x: L - 10, y: Y(y) + 5, 'text-anchor': 'end' }, y > 0 ? '+' + y : y < 0 ? '\u2212' + (-y) : '0'));
      }
      [0, 1, 2, 4, 8].forEach(x => {
        svg.appendChild(el_('line', { x1: X(x), x2: X(x), y1: T, y2: B, stroke: x === 1 ? '#f4b400' : '#eef0f4', 'stroke-width': x === 1 ? 2 : 1, 'stroke-dasharray': x === 1 ? '5 4' : '' }));
        svg.appendChild(el_('text', { x: X(x), y: B + 20, 'text-anchor': 'middle' }, x));
      });
      svg.appendChild(el_('text', { x: (L + R) / 2, y: B + 40, 'text-anchor': 'middle' }, 'O / E (ratio)'));
      svg.appendChild(el_('text', { x: L, y: 16, 'text-anchor': 'start', style: 'font-weight:600;fill:#1b2333' }, 'log\u2082(O / E)  =  MI (bits)'));
      const pts = [];
      for (let x = 0.125; x <= xmax + 1e-9; x += 0.05) pts.push(`${X(x)},${Y(Math.log2(x))}`);
      svg.appendChild(el_('polyline', { points: pts.join(' '), fill: 'none', stroke: '#1f5fd6', 'stroke-width': 3.5, 'stroke-linejoin': 'round' }));
      if (showPts) [[0.25, -2], [0.5, -1], [1, 0], [2, 1], [4, 2], [8, 3]].forEach(([x, y]) => {
        const c = x === 1 ? '#e0570f' : '#1f5fd6';
        svg.appendChild(el_('circle', { cx: X(x), cy: Y(y), r: 6, fill: c, stroke: '#fff', 'stroke-width': 2 }));
        svg.appendChild(el_('text', { x: X(x) + (x === 8 ? -4 : 10), y: Y(y) + 24, 'text-anchor': x === 8 ? 'end' : 'start', style: 'font-weight:600;fill:' + c }, `${x < 1 ? '1/' + 1 / x : x} \u2192 ${y > 0 ? '+' + y : y < 0 ? '\u2212' + (-y) : '0'}`));
      });
    }
  };
})();
