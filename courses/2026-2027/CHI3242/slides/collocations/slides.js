/* Slide-specific logic (loaded before deck.js). */
window.HOOKS = {};
window.SECTIONS = [
  { id: 'intro',    zh: '搭配詞',     en: 'Collocations' },
  { id: 'observed', zh: '觀察值',     en: 'Observed frequency' },
  { id: 'expected', zh: '期望值',     en: 'Expected frequency' },
  { id: 'compare',  zh: '觀察 vs. 期望', en: 'Observed vs. expected' },
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
    [[lo, t], [t, hi]].forEach(([from, to]) => {
      if (from === to) return;
      const rows = new Map();
      for (let i = from; i <= to; i++) { const k = els[i].offsetTop; (rows.get(k) || rows.set(k, []).get(k)).push(i); }
      rows.forEach((group, top) => {
        const a = els[group[0]], b = els[group[group.length - 1]];
        let x0 = a.offsetLeft, x1 = b.offsetLeft + b.offsetWidth;
        if (group.includes(t)) { if (from === lo) x1 = mid - 2; else x0 = mid + 2; }
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
  const line = '王婆 半日 的 痛苦 沒有 代價 了 王婆 一生 的 痛苦'.split(' ');
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

/* ---------- 5. expected value: drawing balls ---------- */
(function () {
  const reds = [0, 2, 3, 6, 9];
  let balls = [], built = false, draws = 0, sum = 0, picked = [2, 4, 6, 7];
  const redOf = i => reds.includes(i);
  const redCount = () => picked.filter(redOf).length;
  HOOKS['s-balls'] = {
    render(step, el) {
      const box = $('#balls', el);
      if (!built) { for (let i = 0; i < 10; i++) { const b = document.createElement('div'); b.className = 'ball' + (redOf(i) ? ' red' : ''); box.appendChild(b); balls.push(b); } built = true; }
      box.classList.toggle('picking', step >= 2);
      balls.forEach((b, i) => b.classList.toggle('picked', step >= 2 && picked.includes(i)));
      $('#ball-k', el).textContent = redCount();
      $('#ball-avg', el).textContent = draws ? `${draws} 次隨機抽取的平均 · average of ${draws} random draws: ${(sum / draws).toFixed(2)}` : '';
    },
    key(e, step) {
      if ((e.key === 'r' || e.key === 'R') && step >= 2) {
        picked = [...Array(10).keys()].sort(() => Math.random() - .5).slice(0, 4);
        draws++; sum += redCount(); return true;
      }
      return false;
    }
  };
})();

/* ---------- helper: contingency table (labels are [zh, en] pairs) ---------- */
function ctable(host, v, { rows, cols, hl = '', mini = false, hideLetters = false }) {
  const cell = (k) => `<td class="${hl.includes(k) ? 'hl' : ''}"><span class="letter">${k}</span>${v[k]}</td>`;
  host.innerHTML = `<table class="ct${mini ? ' mini' : ''}">
    <tr><th></th><th>${bi(cols[0])}</th><th>${bi(cols[1])}</th></tr>
    <tr><th class="rh">${bi(rows[0])}</th>${cell('a')}${cell('b')}</tr>
    <tr><th class="rh">${bi(rows[1])}</th>${cell('c')}${cell('d')}</tr>
  </table>`;
}

/* ---------- 8. contingency table, cell by cell ---------- */
HOOKS['s-ct'] = {
  render(step, el) {
    el.querySelectorAll('#ct-main td').forEach((td, i) => td.classList.toggle('hl', step >= 1 && i === Math.min(step, 4) - 1));
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
        ctable($(`#f${a}`, el), v, { rows: [['有 X', 'has X'], ['無 X', 'no X']], cols: [['有 Y', 'has Y'], ['無 Y', 'no Y']], mini: true, hl: 'a' });
        $(`#p${a}`, el).textContent = `p = ${P(a).toFixed(4)}`;
      });
      $('#p-sum', el).textContent = (P(8) + P(9) + P(10)).toFixed(4);
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
      ctable($('#win-ct', el), v, { rows: [['靠近 好', 'near 好'], ['不靠近', 'not near']], cols: [['天氣', 'Y'], ['其他詞', 'other words']], hl: 'a', mini: true });
      $('#win-sig', el).textContent = `N = ${v.N} · count(好) = ${v.nX} · count(天氣) = ${v.nY}`;
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
    ctable($('#sen-ct', el), sentenceCounts(), { rows: [['句子含 好', 'has 好'], ['不含 好', 'no 好']], cols: [['含 天氣', 'has 天氣'], ['不含', 'no 天氣']], hl: 'a', mini: true });
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
    ctable($('#syn-ct', el), syntaxCounts(), { rows: [['修飾語 好', 'modifier 好'], ['其他修飾語', 'other modifier']], cols: [['名詞 天氣', 'noun 天氣'], ['其他名詞', 'other noun']], hl: 'a', mini: true });
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
      const L = { rows: [['先牛奶', 'milk first'], ['先茶', 'tea first']], cols: [['她說先牛奶', 'says milk'], ['她說先茶', 'says tea']], mini: true, hl: 'ad' };
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
      const opt = { mini: true, hl: 'a' };
      ctable($('#ex-smoke', el), { a: 30, b: 70, c: 10, d: 190 }, { ...opt, rows: [['吸煙者', 'smoker'], ['非吸煙者', 'non-smoker']], cols: [['肺癌', 'cancer'], ['無', 'none']] });
      ctable($('#ex-hand', el), { a: 9, b: 43, c: 4, d: 44 }, { ...opt, rows: [['男', 'male'], ['女', 'female']], cols: [['左手', 'left'], ['右手', 'right']] });
      ctable($('#ex-words', el), sentenceCounts(), { ...opt, rows: [['有 好', 'has 好'], ['無 好', 'no 好']], cols: [['有 天氣', 'has 天氣'], ['無', 'no']] });
      el.querySelectorAll('table.ct').forEach(t => t.classList.add('tight'));
      built = true;
    }
  };
})();

/* ---------- 9b. n choose k ---------- */
(function () {
  let built = false;
  HOOKS['s-choose'] = {
    render(step, el) {
      if (built) return;
      const L = ['A', 'B', 'C', 'D'], box = $('#ch-pairs', el);
      for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) { const s = document.createElement('span'); s.textContent = L[i] + L[j]; box.appendChild(s); }
      built = true;
    }
  };
})();

/* ---------- 9c. Fisher / hypergeometric formula, part by part ---------- */
(function () {
  const ids = ['fa', 'fb', 'fc', 'fd', 'ra', 'rc', 'ca', 'cb', 'fn'];
  const letters = { fa: 'a', fb: 'b', fc: 'c', fd: 'd', ra: 'a+b', rc: 'c+d', ca: 'a+c', cb: 'b+d', fn: 'n' };
  const nums = { fa: 8, fb: 2, fc: 2, fd: 8, ra: 10, rc: 10, ca: 10, cb: 10, fn: 20 };
  const plan = {
    1: { rd: ['fa'], bl: ['fa', 'fb', 'ra'] },
    2: { rd: ['fc'], bl: ['fc', 'fd', 'rc'] },
    3: { rd: ['fa', 'fc', 'ca'], bl: ['fa', 'fb', 'fc', 'fd', 'fn'] }
  };
  HOOKS['s-formula'] = {
    render(step, el) {
      const p = plan[step] || { rd: [], bl: [] };
      ids.forEach(id => {
        const td = $('#' + id, el);
        td.textContent = step >= 4 ? nums[id] : letters[id];
        td.classList.toggle('rd', p.rd.includes(id));
        td.classList.toggle('bl', p.bl.includes(id) && !p.rd.includes(id));
      });
      [1, 2, 3].forEach(k => $('#fp' + k, el).classList.toggle('act', step === k));
      const num = comb(10, 8) * comb(10, 2), den = comb(20, 10);
      $('#fm-plug', el).innerHTML = `C(10,8) · C(10,2) / C(20,10) = ${comb(10, 8)} · ${comb(10, 2)} / ${den.toLocaleString()} = ${num.toLocaleString()} / ${den.toLocaleString()} ≈ <b>${(num / den).toFixed(4)}</b>`;
    }
  };
})();
