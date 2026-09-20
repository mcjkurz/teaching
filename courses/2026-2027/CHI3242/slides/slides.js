/* Slide-specific logic (loaded before deck.js). */
window.HOOKS = {};
const $ = (s, r = document) => r.querySelector(s);
const isPunct = t => /^[，。、]$/.test(t);
const chip = (t, cls = '') => {
  const s = document.createElement('span');
  s.className = 'tok ' + cls + (isPunct(t) ? ' punct' : '');
  s.textContent = t;
  return s;
};

/* ---------- 3. random vs meaningful: shuffle -> order (FLIP animation) ---------- */
(function () {
  const words = '你 坐 的 是 长途 公共汽车 ， 那 破旧 的 车子 ， 城市 里 淘汰 下来 的 ， 在 保养 的 极差 的 山区 公路 上 ， 路面 到处 坑坑洼洼 ， 从 早起 颠簸 了 十二 个 小时 ， 来到 这座 南方 山区 的 小县城 。'.split(' ');
  // fixed pseudo-random permutation so the "shuffle" is the same every time
  let seed = 7; const rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
  const order = words.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  let box, els, state = null;
  HOOKS['s-null'] = {
    steps: 3,
    render(step, el) {
      if (!box) {
        box = $('#shuffle', el);
        els = words.map((w, i) => chip(w));
        order.forEach(i => box.appendChild(els[i]));
        state = 'shuffled';
      }
      const want = step >= 2 ? 'ordered' : 'shuffled';
      if (want === state) return;
      const first = els.map(e => [e.offsetLeft, e.offsetTop]);
      (want === 'ordered' ? words.map((_, i) => i) : order).forEach(i => box.appendChild(els[i]));
      els.forEach((e, i) => {
        const dx = first[i][0] - e.offsetLeft, dy = first[i][1] - e.offsetTop;
        e.style.transition = 'none';
        e.style.transform = `translate(${dx}px, ${dy}px)`;
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
    steps: 4,
    render(step, el) {
      const box = $('#obs-toks', el);
      if (!built) { line.forEach(t => { const c = chip(t); els.push(c); box.appendChild(c); }); built = true; }
      let O = 0;
      line.forEach((t, i) => {
        let inWin = false;
        line.forEach((u, j) => { if (u === X && j !== i && Math.abs(i - j) <= H) inWin = true; });
        const isX = t === X, isCol = inWin && t === Y;
        if (isCol) O++;
        els[i].classList.toggle('tgt', step >= 1 && isX);
        els[i].classList.toggle('win', step >= 2 && inWin && !isX);
        els[i].classList.toggle('col', step >= 3 && isCol);
      });
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
    steps: 4,
    render(step, el) {
      const box = $('#balls', el);
      if (!built) { for (let i = 0; i < 10; i++) { const b = document.createElement('div'); b.className = 'ball' + (redOf(i) ? ' red' : ''); box.appendChild(b); balls.push(b); } built = true; }
      box.classList.toggle('picking', step >= 2);
      balls.forEach((b, i) => b.classList.toggle('picked', step >= 2 && picked.includes(i)));
      $('#ball-k', el).textContent = redCount();
      $('#ball-avg', el).textContent = draws ? `average over ${draws} random draws: ${(sum / draws).toFixed(2)}` : '';
    },
    key(e, step, el) {
      if ((e.key === 'r' || e.key === 'R') && step >= 2) {
        const idx = [...Array(10).keys()].sort(() => Math.random() - .5).slice(0, 4);
        picked = idx; draws++; sum += redCount(); return true;
      }
      return false;
    }
  };
})();

/* ---------- 6. expected for words: slot grid ---------- */
(function () {
  let built = false, cells = [];
  HOOKS['s-expected'] = {
    steps: 4,
    render(step, el) {
      const g = $('#slots', el);
      if (!built) {
        let seed = 11; const rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
        const idx = [...Array(100).keys()].sort(() => rnd() - .5).slice(0, 10);
        for (let i = 0; i < 100; i++) { const c = document.createElement('div'); c.className = 'cell'; g.appendChild(c); cells.push(c); }
        cells.forEach((c, i) => c.dataset.the = idx.includes(i) ? 1 : 0);
        built = true;
      }
      cells.forEach(c => c.classList.toggle('the', step >= 3 && c.dataset.the === '1'));
    }
  };
})();

/* ---------- helper: contingency table ---------- */
function ctable(host, v, opts = {}) {
  const { x = 'X', y = 'Y', rows = ['near X', 'not near X'], cols = ['Y', 'not Y'], hl = '', mini = false } = opts;
  host.innerHTML = `<table class="ct${mini ? ' mini' : ''}">
    <tr><th></th><th>${cols[0]}</th><th>${cols[1]}</th></tr>
    <tr><th>${rows[0]}</th><td class="${hl.includes('a') ? 'hl' : ''}"><span class="letter">a</span>${v.a}</td><td class="${hl.includes('b') ? 'hl' : ''}"><span class="letter">b</span>${v.b}</td></tr>
    <tr><th>${rows[1]}</th><td class="${hl.includes('c') ? 'hl' : ''}"><span class="letter">c</span>${v.c}</td><td class="${hl.includes('d') ? 'hl' : ''}"><span class="letter">d</span>${v.d}</td></tr>
  </table>`;
}

/* ---------- 8. contingency table, cell by cell ---------- */
HOOKS['s-ct'] = {
  steps: 4,
  render(step, el) {
    el.querySelectorAll('#ct-main td').forEach((td, i) => td.classList.toggle('hl', step >= 1 && i === step - 1));
  }
};

/* ---------- 9. Fisher's exact test (hypergeometric) ---------- */
(function () {
  const lf = n => { let s = 0; for (let i = 2; i <= n; i++) s += Math.log(i); return s; };
  const lC = (n, k) => lf(n) - lf(k) - lf(n - k);
  const N = 20, R = 10, C = 10;        // 10 sentences with X, 10 with Y, 20 in total
  const P = a => Math.exp(lC(R, a) + lC(N - R, C - a) - lC(N, C));
  let built = false;
  HOOKS['s-fisher'] = {
    steps: 3,
    render(step, el) {
      if (!built) {
        [8, 9, 10].forEach(a => {
          const v = { a, b: R - a, c: C - a, d: N - R - C + a };
          ctable($(`#f${a}`, el), v, { rows: ['has X', 'no X'], cols: ['has Y', 'no Y'], mini: true, hl: 'a' });
          $(`#p${a}`, el).textContent = `p = ${P(a).toFixed(4)}`;
        });
        $('#p-sum', el).textContent = (P(8) + P(9) + P(10)).toFixed(4);
        built = true;
      }
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

function renderLines(host, mapFn) {
  host.innerHTML = '';
  CORPUS.forEach((sent, si) => {
    const row = document.createElement('div'); row.className = 'line';
    row.innerHTML = `<div class="sid">S${si + 1}</div>`;
    const toks = document.createElement('div'); toks.className = 'toks';
    const w = words(sent); let wi = -1;
    sent.forEach(t => {
      const p = isPunct(t); if (!p) wi++;
      const c = chip(t, p ? '' : mapFn(t, wi, w, si));
      toks.appendChild(c);
    });
    row.appendChild(toks);
    host.appendChild(row);
  });
  return host;
}

function windowCounts(h) {
  let N = 0, nX = 0, nY = 0, ctx = 0, a = 0;
  CORPUS.forEach(sent => {
    const w = words(sent); N += w.length;
    w.forEach((t, i) => {
      if (t === X) nX++;
      if (t === Y) nY++;
      const near = t !== X && w.some((u, j) => u === X && Math.abs(i - j) <= h);
      if (near) { ctx++; if (t === Y) a++; }
    });
  });
  return { a, b: ctx - a, c: nY - a, d: N - nX - ctx - (nY - a), N, nX, nY };
}
function sentenceCounts() {
  const v = { a: 0, b: 0, c: 0, d: 0 };
  CORPUS.forEach(s => { const w = words(s); const x = w.includes(X), y = w.includes(Y); v[x && y ? 'a' : x ? 'b' : y ? 'c' : 'd']++; });
  return v;
}
// hand-annotated adjective -> noun modifier pairs (word index within sentence)
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
    steps: 3,
    render(step, el) {
      renderLines($('#win-lines', el), (t, i, w) => {
        const near = t !== X && w.some((u, j) => u === X && Math.abs(i - j) <= h);
        let c = '';
        if (step >= 1 && t === X) c += ' tgt';
        if (step >= 2 && near) c += ' win';
        if (step >= 2 && near && t === Y) c += ' col';
        if (step === 1 && t === Y) c += ' col';
        return c;
      });
      $('#win-h', el).textContent = h;
      const v = windowCounts(h);
      ctable($('#win-ct', el), v, { rows: ['near 好', 'not near 好'], cols: ['天氣', 'not 天氣'], hl: 'a' });
      $('#win-sig', el).textContent = `tokens N = ${v.N}   ·   count(好) = ${v.nX}   ·   count(天氣) = ${v.nY}`;
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
  steps: 3,
  render(step, el) {
    renderLines($('#sen-lines', el), (t) => step >= 1 ? (t === X ? 'tgt' : t === Y ? 'col' : '') : '');
    // badges
    el.querySelectorAll('#sen-lines .line').forEach((row, i) => {
      const w = words(CORPUS[i]); const x = w.includes(X), y = w.includes(Y);
      const b = document.createElement('span');
      b.className = 'badge ' + (x && y ? 'both' : x ? 'xonly' : 'none');
      b.textContent = x && y ? 'X and Y' : x ? 'X only' : 'neither';
      b.style.opacity = step >= 2 ? 1 : 0; b.style.transition = 'opacity .4s';
      row.appendChild(b);
    });
    ctable($('#sen-ct', el), sentenceCounts(), { rows: ['sentence has 好', 'no 好'], cols: ['has 天氣', 'no 天氣'], hl: 'a' });
  }
};

/* ---------- 13. grammatical approach ---------- */
HOOKS['s-syntax'] = {
  steps: 3,
  render(step, el) {
    renderLines($('#syn-lines', el), (t, i, w, si) => {
      const pair = MODS[si].find(([m, n]) => i === m || i === n);
      if (step >= 1) {
        if (pair) return i === pair[0] ? 'pairA' : 'pairB';
        return 'dim';
      }
      return '';
    });
    const list = MODS.flatMap((ms, si) => ms.map(([m, n]) => { const w = words(CORPUS[si]); return `(${w[m]}, ${w[n]})`; }));
    $('#syn-list', el).textContent = list.join('  ');
    ctable($('#syn-ct', el), syntaxCounts(), { rows: ['modifier 好', 'other modifier'], cols: ['noun 天氣', 'other noun'], hl: 'a' });
  }
};

/* ---------- 14. summary: same table, three ways to count ---------- */
HOOKS['s-summary'] = {
  steps: 3,
  render(step, el) {
    ctable($('#sum-win', el), windowCounts(2), { rows: ['near 好', 'not near'], cols: ['天氣', 'not'], mini: true, hl: 'a' });
    ctable($('#sum-sen', el), sentenceCounts(), { rows: ['has 好', 'no 好'], cols: ['天氣', 'not'], mini: true, hl: 'a' });
    ctable($('#sum-syn', el), syntaxCounts(), { rows: ['mod. 好', 'other'], cols: ['天氣', 'not'], mini: true, hl: 'a' });
  }
};
