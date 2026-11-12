/* Case-study visuals ported from the Beijing Forum 2026 deck (vector poetics); characters converted to traditional. */
/* Per-slide visuals. Each HOOKS[slideId] may define render(step, el), key(e, step, el), enter(el), leave(el). */
window.HOOKS = window.HOOKS || {};
(function () {
  const H = window.HOOKS;
  const NS = 'http://www.w3.org/2000/svg';
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const C = {
    ink: css('--ink'), ink2: css('--ink2'), mute: css('--mute'), faint: css('--faint'), line: css('--line'),
    blue: css('--blue'), amber: css('--amber'), coral: css('--coral'), green: css('--green'), violet: css('--violet'),
  };

  // svg helper: el('circle', {cx, cy, r}, parent)
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) {
      if (k === 'text') e.textContent = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    if (parent) parent.appendChild(e);
    return e;
  }
  const show = (node, on) => { node.style.transition = 'opacity .5s'; node.style.opacity = on ? 1 : 0; };

  // animation loop that runs only while its slide is active
  function loop(slide, draw) {
    if (slide._loop) return;
    slide._loop = true;
    const t0 = performance.now();
    const f = now => {
      if (!slide.classList.contains('active')) { slide._loop = false; return; }
      draw((now - t0) / 1000);
      requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  }
  function hidpi(canvas, w, h) {
    const r = 2;
    canvas.width = w * r; canvas.height = h * r;
    const g = canvas.getContext('2d'); g.setTransform(r, 0, 0, r, 0, 0);
    return g;
  }


  /* ───────────────────────── poem: highlight the couplet under the classifier */
  H['s-poem'] = {
    render(step) {
      const ln = [...document.querySelectorAll('#clf-grid .ln')];
      ln[1].classList.toggle('on', step >= 1);                       // the parallel couplet (0.97)
      ln[3].classList.toggle('on', step >= 4); ln[3].classList.add('no');   // the free couplet (0.02), shown neutral
    },
  };



  /* ───────────────────────── regulated verse: the middle two couplets are parallel by rule */
  H['s-reg'] = {
    render(step) {
      const ln = [...document.querySelectorAll('#reg-poem .ln')];
      ln.forEach((l, i) => {
        const mid = i === 1 || i === 2;
        l.classList.toggle('par', step >= 1 && mid);
        l.classList.toggle('hl', step >= 1 && mid);
        l.classList.toggle('hl2', step >= 2 && !mid);
      });
    },
  };

  /* ───────────────────────── what "aligned" looks like: schematic 3D paths (hypothetical coordinates) */
  (function () {
    const B = [[-1.6, -.6, -.4], [-.8, .2, .3], [0, -.3, -.2], [.8, .5, .4], [1.6, 0, -.1]];
    const add = (a, b) => a.map((v, i) => v + b[i]);
    // misaligned: the second verse takes steps in unrelated directions
    const stepsMis = [[1.2, -1.1, .5], [-1.6, .4, -1.0], [.5, 1.3, 1.2], [-1.0, -1.4, -.4]];
    const M = [[-.7, 1.0, -.6]]; stepsMis.forEach(d => M.push(add(M[M.length - 1], d)));
    // aligned: the same steps as the first verse, plus a small offset
    // (same overall directions, but different step lengths and a little noise, so it does not look like a copy)
    const scale = [.65, 1.3, .8, 1.25], noise = [[.18, -.22, .12], [-.25, .15, -.2], [.2, .2, .15], [-.12, -.25, .2]];
    const A = [[-1.5, .9, -.7]];
    for (let i = 0; i < 4; i++) A.push(add(A[i], add(B[i + 1].map((v, k) => (v - B[i][k]) * scale[i]), noise[i])));
    function panel(cv, other, g, t) {
      const W = 520, H_ = 320, S = 88, yaw = -.5 + .45 * Math.sin(t * .5), pitch = .4;
      const proj = ([x, y, z]) => {
        const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
        const x1 = x * cy - y * sy, y1 = x * sy + y * cy;
        const d = y1 * cp + z * sp, up = z * cp - y1 * sp, k = 1 / (1 - d * .12);
        return { X: W / 2 + x1 * S * k, Y: H_ / 2 - up * S * k, d, k };
      };
      g.clearRect(0, 0, W, H_);
      [[[-2.1, 0, 0], [2.1, 0, 0]], [[0, -1.6, 0], [0, 1.6, 0]], [[0, 0, -1.4], [0, 0, 1.4]]].forEach(([a, b]) => {
        const pa = proj(a), pb = proj(b); g.beginPath(); g.moveTo(pa.X, pa.Y); g.lineTo(pb.X, pb.Y); g.strokeStyle = C.faint; g.lineWidth = 1.2; g.stroke();
      });
      const nodes = [];
      [[B, C.coral], [other, css('--cyan')]].forEach(([pts, col]) => {
        const P = pts.map(proj);
        for (let i = 0; i < P.length - 1; i++) {
          const a = P[i], b = P[i + 1], ang = Math.atan2(b.Y - a.Y, b.X - a.X), r = 9;
          const sx = a.X + r * Math.cos(ang), sy = a.Y + r * Math.sin(ang), ex = b.X - r * Math.cos(ang), ey = b.Y - r * Math.sin(ang);
          g.strokeStyle = col; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.stroke();
          g.beginPath(); g.moveTo(ex - 9 * Math.cos(ang - .45), ey - 9 * Math.sin(ang - .45)); g.lineTo(ex, ey); g.lineTo(ex - 9 * Math.cos(ang + .45), ey - 9 * Math.sin(ang + .45)); g.stroke();
        }
        P.forEach(p => nodes.push({ p, col }));
      });
      nodes.sort((u, v) => u.p.d - v.p.d).forEach(({ p, col }) => {
        g.beginPath(); g.arc(p.X, p.Y, 9 * p.k, 0, 7); g.fillStyle = col; g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke();
      });
    }
    H['s-align-ex'] = {
      enter(slide) {
        const c1 = document.getElementById('ax-mis'), c2 = document.getElementById('ax-ali');
        const g1 = hidpi(c1, 520, 320), g2 = hidpi(c2, 520, 320);
        loop(slide, t => { panel(c1, M, g1, t); panel(c2, A, g2, t); });
      },
    };
  })();

  /* ───────────────────────── keys & queries: every character carries its own key arrow; the [CLS] query is one arrow
     that turns through 360°, and a character lights up when its key points the same way (viridis = match) */
  (function () {
    const rad = d => d * Math.PI / 180;
    // key directions by word class (illustrative): adjectives ≈ 35°, nouns ≈ 115°, locatives ≈ 205°, verbs ≈ 290°.
    // In BOTH couplets, characters of the same class point the same way. What differs is where they sit:
    // in the parallel couplet the classes line up position by position, in the non-parallel one they do not.
    const CATS = [['形容詞', 35], ['名詞', 115], ['方位詞', 205], ['動詞', 290]];
    const SETS = {
      par: { v1: [...'明月松間照'], v2: [...'清泉石上流'], a1: [31, 110, 122, 199, 287], a2: [40, 118, 112, 210, 294],
        text: '<b class="cls">轉動 [CLS] 的查詢。</b>每個字都帶著一支小箭頭：它的<span class="c-blue">鍵</span>。鍵與<span class="c-red">查詢</span>方向越一致，字就越亮。同類的字指向同一方向：名詞（月 松 泉 石）、形容詞（明 清）、方位詞（間 上）、動詞（照 流）。在對仗句中，同類的字<b>位置也相同</b>，所以上下兩句<b>逐字一起亮起</b>。' },
      non: { v1: [...'空山新雨後'], v2: [...'天氣晚來秋'], a1: [38, 116, 30, 121, 206], a2: [110, 123, 43, 286, 113],
        text: '<b>不對仗的一聯。</b>這裡同類的字<b>同樣</b>指向同一方向：查詢對準名詞，山、雨、天、氣、秋都會亮起。差別不在方向，而在<b>位置</b>：上句亮在第 2、4 字，下句亮在第 1、2、5 字。除第 2 字偶然重合外，亮點<b>上下錯開</b>，無法逐字對應。' },
    };
    const STOPS = [[68, 1, 84], [59, 82, 139], [33, 144, 141], [93, 200, 99], [253, 231, 37]];
    const viridis = t => { t = Math.max(0, Math.min(1, t)) * 4; const i = Math.min(3, Math.floor(t)), f = t - i; return `rgb(${STOPS[i].map((v, k) => Math.round(v + (STOPS[i + 1][k] - v) * f)).join(',')})`; };
    const O = [220, 214], R = 150, RED = css('--red');
    let built = false, which = 'par', qa = rad(115), K = [], tiles = [], links = [], qg, svg, drag = false, anim = null;
    // attention of [CLS], as in the original figure: softmax over all ten characters of 7·(q·k),
    // with |q| = .8 and |k| ≈ .75 (plus the special tokens below), so several characters of the same class share the attention between them
    const QL = .8, KL = [.78, .8, .74, .72, .78, .72, .74, .8, .66, .72];
    function attn() {
      const e = K.map((a, i) => Math.exp(7 * QL * KL[i] * Math.cos(a - qa)));
      // [CLS], the comma and [SEP] also take part of the attention (see the heatmap of real heads),
      // so even a perfectly aimed pair stays around 0.3 rather than turning bright yellow
      const SINK = 70, z = e.reduce((u, v) => u + v, 0) + SINK;
      return e.map(v => v / z);
    }
    function paint() {
      const m = attn();
      tiles.forEach((t, i) => { t.style.background = viridis(m[i] / .5); t.classList.toggle('lit', m[i] / .5 > .7); });
      links.forEach((l, i) => { l.style.opacity = Math.min(m[i], m[i + 5]) > .09 ? 1 : 0; });
      const c = Math.cos(qa), s = Math.sin(qa), X = O[0] + R * c, Y = O[1] - R * s;
      qg.line.setAttribute('x2', X - 14 * c); qg.line.setAttribute('y2', Y + 14 * s);
      qg.head.setAttribute('d', `M${X} ${Y} L${X - 20 * Math.cos(qa - .36)} ${Y + 20 * Math.sin(qa - .36)} L${X - 20 * Math.cos(qa + .36)} ${Y + 20 * Math.sin(qa + .36)} z`);
      const w = rad(24), arc = a => [O[0] + (R + 18) * Math.cos(a), O[1] - (R + 18) * Math.sin(a)];
      const [x1, y1] = arc(qa - w), [x2, y2] = arc(qa + w);
      qg.beam.setAttribute('d', `M${O[0]} ${O[1]} L${x1} ${y1} A${R + 18} ${R + 18} 0 0 0 ${x2} ${y2} z`);
      qg.lab.setAttribute('x', O[0] + (R - 60) * c + 26 * s); qg.lab.setAttribute('y', O[1] - (R - 60) * s + 26 * c + 5);
    }
    function arrowSvg(a) {
      const deg = -a * 180 / Math.PI;
      return `<svg viewBox="-16 -16 32 32" width="30" height="30"><g transform="rotate(${deg})"><line x1="-11" y1="0" x2="7" y2="0" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M13 0 L4 -6 L4 6 z" fill="currentColor"/></g></svg>`;
    }
    function load(name) {
      which = name; const D = SETS[name];
      K = D.a1.concat(D.a2).map(rad);
      const chars = D.v1.concat(D.v2);
      tiles.forEach((t, i) => { t.innerHTML = `<span class="ch">${chars[i]}</span>${arrowSvg(K[i])}`; });
      document.getElementById('kq-text').innerHTML = D.text;
      document.querySelectorAll('.kq-tabs button').forEach(b => b.classList.toggle('on', b.dataset.set === name));
      paint();
    }
    function turnTo(target) {
      cancelAnimationFrame(anim);
      let d = ((target - qa) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
      const from = qa, t0 = performance.now();
      const f = now => { const t = Math.min(1, (now - t0) / 450), e = t * t * (3 - 2 * t); qa = from + d * e; paint(); if (t < 1) anim = requestAnimationFrame(f); };
      anim = requestAnimationFrame(f);
    }
    function build() {
      svg = document.getElementById('kq');
      el('circle', { cx: O[0], cy: O[1], r: R + 18, fill: 'none', stroke: C.line, 'stroke-width': 1.5 }, svg);
      el('circle', { cx: O[0], cy: O[1], r: R * .55, fill: 'none', stroke: C.line, 'stroke-dasharray': '3 5' }, svg);
      for (let d = 0; d < 360; d += 15) {
        const a = rad(d), r1 = R + 18, r2 = R + (d % 90 ? 12 : 6);
        el('line', { x1: O[0] + r1 * Math.cos(a), y1: O[1] - r1 * Math.sin(a), x2: O[0] + r2 * Math.cos(a), y2: O[1] - r2 * Math.sin(a), stroke: C.faint, 'stroke-width': 1.4 }, svg);
      }
      qg = { beam: el('path', { fill: RED, opacity: .1 }, svg) };
      // word-class directions around the dial; click one to turn the query there
      CATS.forEach(([lab, d]) => {
        const a = rad(d), r = R + 40, x = O[0] + r * Math.cos(a), y = O[1] - r * Math.sin(a);
        const g = el('g', { style: 'cursor:pointer' }, svg);
        el('circle', { cx: O[0] + (R + 18) * Math.cos(a), cy: O[1] - (R + 18) * Math.sin(a), r: 4.5, fill: C.mute }, g);
        el('rect', { x: x - 36, y: y - 16, width: 72, height: 30, fill: 'transparent' }, g);
        el('text', { x: x + 6 * Math.cos(a), y: y + 6, 'text-anchor': Math.abs(Math.cos(a)) < .5 ? 'middle' : Math.cos(a) > 0 ? 'start' : 'end', 'font-size': 17, 'font-weight': 600, fill: C.mute, text: lab }, g);
        g.addEventListener('pointerdown', e => { e.stopPropagation(); turnTo(a); });
      });
      Object.assign(qg, {
        line: el('line', { x1: O[0], y1: O[1], stroke: RED, 'stroke-width': 6, 'stroke-linecap': 'round' }, svg),
        head: el('path', { fill: RED }, svg),
        lab: el('text', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: RED, 'font-family': 'JetBrains Mono', text: '[CLS]' }, svg),
      });
      el('circle', { cx: O[0], cy: O[1], r: 7, fill: RED }, svg);
      el('text', { x: O[0], y: 436, 'text-anchor': 'middle', 'font-size': 13, fill: RED, 'font-family': 'JetBrains Mono', text: '● [CLS] 查詢：拖曳旋轉 360°' }, svg);
      ['kq-r1', 'kq-r2'].forEach(id => {
        const row = document.getElementById(id);
        for (let i = 0; i < 5; i++) { const d = document.createElement('div'); d.className = 'kq-cell'; row.appendChild(d); tiles.push(d); }
      });
      const lr = document.getElementById('kq-links');
      for (let i = 0; i < 5; i++) { const d = document.createElement('div'); d.className = 'kq-link'; lr.appendChild(d); links.push(d); }
      const move = e => {
        const r = svg.getBoundingClientRect(), k = r.width / 440;
        const x = (e.clientX - r.left) / k - O[0], y = -((e.clientY - r.top) / k - O[1]);
        if (Math.hypot(x, y) > 4) { qa = Math.atan2(y, x); paint(); }
      };
      const slide = document.getElementById('s-cls');
      svg.addEventListener('pointerdown', e => { e.preventDefault(); cancelAnimationFrame(anim); drag = true; slide.classList.add('dragging'); window.getSelection && window.getSelection().removeAllRanges(); svg.setPointerCapture(e.pointerId); move(e); });
      svg.addEventListener('pointermove', e => { if (drag) move(e); });
      const end = () => { drag = false; slide.classList.remove('dragging'); };
      svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
      document.querySelectorAll('.kq-tabs button').forEach(b => b.addEventListener('click', () => load(b.dataset.set)));
      built = true;
    }
    H['s-cls'] = {
      enter() { if (!built) build(); qa = rad(115); load('par'); },
      key(e) { if (e.key === 'n' || e.key === 'N') { load(which === 'par' ? 'non' : 'par'); return true; } return false; },
    };
  })();

  /* ───────────────────────── 3D couplet: encoded apart vs. together (data: window.ALIGN, from standalone_3d/alignment_coords.py) */
  (function () {
    const A = window.ALIGN, chars1 = [...A.verse1], chars2 = [...A.verse2];
    const HOME = { yaw: -0.7, pitch: 0.35 };
    let yaw = HOME.yaw, pitch = HOME.pitch, auto = true, drag = null, stepNow = 0, g = null, zoom = 1, layer = 12, mix = /[?&]mix=1/.test(location.search) ? 1 : 0, vis1 = 1, vis2 = 0, both = 0;
    const CX = 790, CY = 385, SC0 = 305;
    const ease = t => t * t * (3 - 2 * t);
    // positions at the current layer, normalised so that both conditions fit the same unit sphere
    function coords() {
      const L = A.layers[layer], rad = Math.max(...L.separate.concat(L.joint).map(p => Math.hypot(...p)));
      const e = ease(mix);
      return L.separate.map((p, i) => p.map((v, k) => (v * (1 - e) + L.joint[i][k] * e) / rad));
    }
    function project([x, y, z]) {
      const SC = SC0 * zoom;
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      const x1 = x * cy - y * sy, y1 = x * sy + y * cy;
      const depth = y1 * cp + z * sp, up = z * cp - y1 * sp;
      const persp = 1 / (1 - depth * 0.18);
      return { X: CX + x1 * SC * persp, Y: CY - up * SC * persp, d: depth, s: persp };
    }
    function line(a, b, col, w, dash, alpha) {
      g.beginPath(); g.moveTo(a.X, a.Y); g.lineTo(b.X, b.Y);
      g.strokeStyle = col; g.lineWidth = w; g.setLineDash(dash || []); g.globalAlpha = alpha == null ? 1 : alpha; g.stroke();
      g.setLineDash([]); g.globalAlpha = 1;
    }
    function bars() {
      const L = A.layers[layer], box = document.getElementById('cpl-align');
      box.style.opacity = both;
      document.getElementById('cpl-al-layer').textContent = '第 ' + layer + ' 層' + (layer === 12 ? '（頂層）' : '');
      document.getElementById('cpl-bar1').style.width = (100 * Math.max(0, L.alignment_separate)) + '%';
      document.getElementById('cpl-v1').textContent = L.alignment_separate.toFixed(2);
      document.getElementById('cpl-row2').style.opacity = .15 + .85 * ease(mix);
      document.getElementById('cpl-bar2').style.width = (100 * Math.max(0, L.alignment_joint)) + '%';
      document.getElementById('cpl-v2').textContent = L.alignment_joint.toFixed(2);
    }
    function draw() {
      g.clearRect(0, 0, 1280, 720);
      const L = A.layers[layer], v3 = L.var_pct, Lx = 1.15;
      [[[Lx, 0, 0], `PC1 · ${v3[0].toFixed(1)}%`], [[0, Lx, 0], `PC2 · ${v3[1].toFixed(1)}%`], [[0, 0, Lx], `PC3 · ${v3[2].toFixed(1)}%`]].forEach(([e, t]) => {
        const a = project(e.map(v => -v)), b = project(e);
        line(a, b, C.faint, 1.5);
        g.fillStyle = C.mute; g.font = '13px "JetBrains Mono", "Songti SC", serif'; g.fillText(t, b.X + 6, b.Y);
      });
      const Q = coords().map(project), Q1 = Q.slice(0, 5), Q2 = Q.slice(5);
      for (let i = 0; i < 4; i++) { if (vis1 > .01) line(Q1[i], Q1[i + 1], C.blue, 6, null, .85 * vis1); if (vis2 > .01) line(Q2[i], Q2[i + 1], '#12b5cb', 6, null, .85 * vis2); }
      // the pairs 明–清, 月–泉 … : loose while the verses are read apart, tight once they see each other
      for (let i = 0; i < 5; i++) line(Q1[i], Q2[i], mix > .5 ? C.green : C.faint, 2 + 2 * ease(mix), [8, 7], (.35 + .6 * ease(mix)) * both);
      const pts = Q1.map((q, i) => ({ q, c: chars1[i], col: C.blue, a: vis1 })).concat(Q2.map((q, i) => ({ q, c: chars2[i], col: '#12b5cb', a: vis2 }))).filter(p => p.a > .01);
      pts.sort((a, b) => a.q.d - b.q.d);
      pts.forEach(({ q, c, col, a }) => {
        const r = 27 * q.s;
        g.beginPath(); g.arc(q.X, q.Y, r, 0, 2 * Math.PI);
        g.fillStyle = col; g.globalAlpha = .92 * a; g.fill(); g.globalAlpha = a;
        g.lineWidth = 2; g.strokeStyle = '#fff'; g.stroke();
        g.fillStyle = '#fff'; g.font = `600 ${Math.round(28 * q.s)}px "Songti SC", "Noto Serif SC", serif`;
        g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(c, q.X, q.Y + 1);
        g.textAlign = 'start'; g.textBaseline = 'alphabetic'; g.globalAlpha = 1;
      });
      bars();
    }
    const cv = document.getElementById('cpl');
    cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, yaw, pitch }; auto = false; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', e => {
      if (!drag) return;
      yaw = drag.yaw + (e.clientX - drag.x) * 0.008;
      pitch = Math.max(-1.4, Math.min(1.4, drag.pitch + (e.clientY - drag.y) * 0.008));
    });
    cv.addEventListener('pointerup', () => { drag = null; });
    const setZoom = z => { zoom = Math.max(.4, Math.min(3, z)); };
    cv.addEventListener('wheel', e => { e.preventDefault(); setZoom(zoom * Math.exp(-e.deltaY * 0.0015)); }, { passive: false });
    const setLayer = l => { layer = Math.max(0, Math.min(12, l)); const el2 = document.getElementById('cpl-layer'); if (el2) el2.textContent = layer === 12 ? '頂層（第 12 層）' : '第 ' + layer + ' 層'; };
    H['s-3d'] = {
      enter(sl) {
        g = hidpi(cv, 1280, 720);
        let lastT = 0;
        loop(sl, t => {
          const dt = t - lastT; lastT = t;
          if (auto) yaw += dt * 0.25;
          const target = stepNow >= 3 ? 1 : 0;
          mix += Math.sign(target - mix) * Math.min(Math.abs(target - mix), dt / 1.6);
          const t1 = stepNow === 1 ? 0 : 1, t2 = stepNow >= 1 ? 1 : 0;
          vis1 += Math.sign(t1 - vis1) * Math.min(Math.abs(t1 - vis1), dt / .6);
          vis2 += Math.sign(t2 - vis2) * Math.min(Math.abs(t2 - vis2), dt / .6);
          const tb = stepNow >= 2 ? 1 : 0;   // the alignment readout belongs to the two verses seen together, so it ignores the 0 ↔ 1 cross-fade
          both += Math.sign(tb - both) * Math.min(Math.abs(tb - both), dt / .6);
          draw();
        });
      },
      render(step) { stepNow = step; },
      key(e) {
        if (e.key === 'r' || e.key === 'R') { auto = !auto; return true; }
        if (e.key === '+' || e.key === '=') { setZoom(zoom * 1.12); return true; }
        if (e.key === '-' || e.key === '_') { setZoom(zoom / 1.12); return true; }
        if (e.key === ']') { setLayer(layer + 1); return true; }
        if (e.key === '[') { setLayer(layer - 1); return true; }
        if (e.key === '0') { yaw = HOME.yaw; pitch = HOME.pitch; zoom = 1; setLayer(12); return true; }
        return false;
      },
    };
  })();
})();

/* ───────── SymNet: pan and zoom the character network to show single communities */
(function () {
  const H = window.HOOKS;
  const MAX = 8;
  let box, img, net, z = 1, x = 0, y = 0;
  const base = () => Math.max(box.clientWidth, box.clientHeight);   // image is square: fit the longer side
  const clamp = () => {
    const s = base() * z;
    x = Math.min(Math.max(x, box.clientWidth - s), Math.max(0, (box.clientWidth - s) / 2));
    y = Math.min(Math.max(y, box.clientHeight - s), Math.max(0, (box.clientHeight - s) / 2));
  };
  const draw = () => { clamp(); img.style.width = base() + 'px'; img.style.transform = `translate(${x}px, ${y}px) scale(${z})`; };
  // the stage is CSS-scaled to the window: convert screen pixels to stage pixels
  const k = () => box.getBoundingClientRect().width / box.clientWidth;
  function zoomAt(f, px, py) {
    const nz = Math.min(MAX, Math.max(1, z * f));
    x = px - (px - x) * nz / z; y = py - (py - y) * nz / z; z = nz; draw();
  }
  const reset = () => { z = 1; x = 0; y = 0; draw(); };
  function bind() {
    box = document.getElementById('net-zoom'); img = box.querySelector('img'); net = box.parentElement;
    box.addEventListener('wheel', e => {
      e.preventDefault();
      const r = box.getBoundingClientRect(), s = k();
      zoomAt(Math.exp(-e.deltaY * .0025), (e.clientX - r.left) / s, (e.clientY - r.top) / s);
    }, { passive: false });
    let drag = null;
    box.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; box.setPointerCapture(e.pointerId); box.classList.add('drag'); });
    box.addEventListener('pointermove', e => {
      if (!drag) return;
      const s = k(); x += (e.clientX - drag.x) / s; y += (e.clientY - drag.y) / s; drag = { x: e.clientX, y: e.clientY }; draw();
    });
    const end = () => { drag = null; box.classList.remove('drag'); };
    box.addEventListener('pointerup', end); box.addEventListener('pointercancel', end);
    box.addEventListener('dblclick', reset);
    net.querySelector('.vp-zctl').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      e.stopPropagation(); b.blur();
      const c = [box.clientWidth / 2, box.clientHeight / 2];
      if (b.dataset.z === 'in') zoomAt(1.6, ...c);
      else if (b.dataset.z === 'out') zoomAt(1 / 1.6, ...c);
      else if (b.dataset.z === 'reset') reset();
      else { net.classList.toggle('big'); reset(); }
    });
  }
  H['s-v-net'] = {
    enter() { if (!box) bind(); requestAnimationFrame(draw); },
    leave() { net.classList.remove('big'); reset(); },
  };
})();

/* ───────── heptasyllabic couplets in 3D: Du Fu's parallel Jaw couplet vs. his non-parallel opening couplet.
 * Data: window.HEPTA.examples (GujiBERT_fan, couplet encoded jointly, per-layer PCA; alignment = mean step cosine − random-pair baseline). */
(function () {
  const H = window.HOOKS, D = window.HEPTA;
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const W = 540, Hh = 340, GROW = 650;
  // each panel has its own view (drag one, the other stays put) and its own drawing state:
  // shown = 'all' draws both paths at once; a number k draws the first k characters of each line, the newest step growing in tandem
  const V = { a: { yaw: -0.6, pitch: 0.38, auto: true, shown: 'all', t0: 0 }, b: { yaw: -0.6, pitch: 0.38, auto: true, shown: 'all', t0: 0 } };
  let layer = 12, ctx = {};
  function proj(v, [x, y, z]) {
    const cy = Math.cos(v.yaw), sy = Math.sin(v.yaw), cp = Math.cos(v.pitch), sp = Math.sin(v.pitch);
    const x1 = x * cy - y * sy, y1 = x * sy + y * cy, d = y1 * cp + z * sp, up = z * cp - y1 * sp, k = 1 / (1 - d * .16);
    return { X: W / 2 + x1 * 122 * k, Y: Hh / 2 + 8 - up * 122 * k, d, k };
  }
  function arrowHead(g, a, b, col) {
    const ang = Math.atan2(b.Y - a.Y, b.X - a.X), L = 13;
    g.fillStyle = col; g.beginPath(); g.moveTo(b.X, b.Y);
    g.lineTo(b.X - L * Math.cos(ang - .42), b.Y - L * Math.sin(ang - .42)); g.lineTo(b.X - L * Math.cos(ang + .42), b.Y - L * Math.sin(ang + .42)); g.closePath(); g.fill();
  }
  function panel(g, ex, v, now) {
    const L = ex.layers[layer], n = ex.v1.length, c1 = css('--cyan'), c2 = css('--coral');
    g.clearRect(0, 0, W, Hh);
    [[1.2, 0, 0], [0, 1.2, 0], [0, 0, 1.2]].forEach((e, i) => {
      const a = proj(v, e.map(u => -u)), b = proj(v, e);
      g.strokeStyle = '#d9d5e3'; g.lineWidth = 1; g.beginPath(); g.moveTo(a.X, a.Y); g.lineTo(b.X, b.Y); g.stroke();
      g.fillStyle = '#9b96ad'; g.font = '11px "JetBrains Mono", monospace'; g.fillText(`PC${i + 1} ${L.var[i].toFixed(0)}%`, b.X + 4, b.Y);
    });
    const stepping = v.shown !== 'all', k = stepping ? v.shown : n, p = stepping ? Math.min(1, (now - v.t0) / GROW) : 1;
    if (stepping && k === 0) {
      g.fillStyle = '#9b96ad'; g.font = '15px "Songti SC", "Noto Serif SC", serif'; g.textAlign = 'center';
      g.fillText('按“下一步”，逐字畫出兩條路徑', W / 2, Hh - 18); g.textAlign = 'start';
      return;
    }
    const P = L.pts.map(q => proj(v, q)), A = P.slice(0, n), B = P.slice(n);
    const lerp = (u, w, t) => ({ X: u.X + (w.X - u.X) * t, Y: u.Y + (w.Y - u.Y) * t });
    // rungs joining corresponding characters
    g.setLineDash([4, 5]); g.strokeStyle = '#c9c4d6'; g.lineWidth = 1.2;
    for (let i = 0; i < k; i++) { g.globalAlpha = i === k - 1 ? p : 1; g.beginPath(); g.moveTo(A[i].X, A[i].Y); g.lineTo(B[i].X, B[i].Y); g.stroke(); }
    g.setLineDash([]); g.globalAlpha = 1;
    [[A, c1], [B, c2]].forEach(([Q, col]) => {
      g.strokeStyle = col; g.lineWidth = 3.2; g.lineJoin = 'round'; g.lineCap = 'round'; g.globalAlpha = .85;
      g.beginPath(); g.moveTo(Q[0].X, Q[0].Y);
      for (let i = 1; i < k - 1; i++) g.lineTo(Q[i].X, Q[i].Y);
      if (k >= 2) { const tip = lerp(Q[k - 2], Q[k - 1], p); g.lineTo(tip.X, tip.Y); }
      g.stroke(); g.globalAlpha = 1;
      // while stepping, the newest step carries an arrowhead: the two lines' steps can be compared as directions
      if (stepping && k >= 2) {
        const tip = lerp(Q[k - 2], Q[k - 1], p), back = lerp(Q[k - 2], Q[k - 1], Math.max(0, p - .02));
        if (p < 1) arrowHead(g, back, tip, col);
      }
    });
    const nodes = [];
    for (let i = 0; i < k; i++) {
      const al = i === k - 1 ? (k === 1 ? p : (p >= 1 ? 1 : Math.max(0, (p - .75) / .25))) : 1;
      nodes.push({ q: A[i], c: ex.v1[i], col: c1, al }, { q: B[i], c: ex.v2[i], col: c2, al });
    }
    nodes.sort((u, w) => u.q.d - w.q.d).forEach(({ q, c, col, al }) => {
      if (al <= 0) return;
      g.globalAlpha = al;
      const r = 15 * q.k;
      g.beginPath(); g.arc(q.X, q.Y, r, 0, 7); g.fillStyle = col; g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke();
      g.fillStyle = '#fff'; g.font = `600 ${Math.round(17 * q.k)}px "Songti SC", "Noto Serif SC", serif`;
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(c, q.X, q.Y + 1); g.textAlign = 'start'; g.textBaseline = 'alphabetic';
      g.globalAlpha = 1;
    });
  }
  function readout() {
    [['a', 'inner'], ['b', 'head']].forEach(([k, e]) => {
      const v = D.examples[e].align[layer];
      document.getElementById('h3d-v-' + k).textContent = v.toFixed(2);
      document.getElementById('h3d-bar-' + k).style.width = Math.max(0, Math.min(1, v)) * 100 + '%';
    });
  }
  // buttons above each panel: 全部 draws both paths at once; 清空 clears; 下一步 adds one character to each line, in tandem
  const lenOf = key => D.examples[key === 'a' ? 'inner' : 'head'].v1.length;
  function setShown(key, val) { V[key].shown = val; V[key].t0 = performance.now(); syncButtons(key); }
  function act(key, what) {
    const v = V[key], n = lenOf(key);
    if (what === 'all') setShown(key, 'all');
    else if (what === 'clear') setShown(key, 0);
    else if (what === 'step') setShown(key, v.shown === 'all' || v.shown >= n ? 1 : v.shown + 1);
  }
  function syncButtons(key) {
    const bar = document.querySelector(`.h3d-ctl[data-p="${key}"]`); if (!bar) return;
    const v = V[key], n = lenOf(key);
    bar.querySelector('[data-a="all"]').classList.toggle('on', v.shown === 'all');
    bar.querySelector('.cnt').textContent = v.shown === 'all' ? `${n} / ${n}` : `${v.shown} / ${n}`;
  }
  function bind() {
    ['a', 'b'].forEach(key => {
      const cv = document.getElementById('h3d-' + key), v = V[key];
      const r = 2; cv.width = W * r; cv.height = Hh * r; const g = cv.getContext('2d'); g.setTransform(r, 0, 0, r, 0, 0); ctx[key] = g;
      let drag = null;
      cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, yaw: v.yaw, pitch: v.pitch, moved: false }; cv.setPointerCapture(e.pointerId); });
      cv.addEventListener('pointermove', e => {
        if (!drag) return;
        if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 5) return;
        drag.moved = true; v.auto = false;
        v.yaw = drag.yaw + (e.clientX - drag.x) * .008; v.pitch = Math.max(-1.4, Math.min(1.4, drag.pitch + (e.clientY - drag.y) * .008));
      });
      cv.addEventListener('pointerup', () => { drag = null; });
      cv.addEventListener('pointercancel', () => { drag = null; });
      const bar = document.querySelector(`.h3d-ctl[data-p="${key}"]`);
      bar.addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        e.stopPropagation(); b.blur(); act(key, b.dataset.a);
      });
    });
  }
  H['s-v-h3d'] = {
    enter(slide) {
      if (!ctx.a) bind();
      // every visit starts with both couplets drawn in full
      ['a', 'b'].forEach(k => setShown(k, 'all'));
      readout();
      if (slide._loop) return; slide._loop = true;
      let last = performance.now();
      const f = now => {
        if (!slide.classList.contains('active')) { slide._loop = false; return; }
        const dt = (now - last) / 1000; last = now;
        Object.values(V).forEach(v => { if (v.auto) v.yaw += dt * .25; });
        panel(ctx.a, D.examples.inner, V.a, now); panel(ctx.b, D.examples.head, V.b, now);
        requestAnimationFrame(f);
      };
      requestAnimationFrame(f);
    },
  };
})();

/* ───────── alignment by GujiBERT layer and couplet role, hepta vs. penta (window.HEPTA.roles) */
(function () {
  const H = window.HOOKS, D = window.HEPTA, NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); p.appendChild(e); return e; };
  const X0 = 58, X1 = 584, Y0 = 18, Y1 = 362;
  const ROLES = [['jaw', '頷聯', '--coral', 0], ['neck', '頸聯', '--cyan', 0], ['head', '首聯', '--amber', 1], ['tail', '尾聯', '--mute', 1]];
  let svg, lines = {}, dots = {}, mode = 'penta', yMax;
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const px = l => X0 + (X1 - X0) * l / 12, py = v => Y1 - (Y1 - Y0) * (v - yMin()) / (yMax - yMin());
  const yMin = () => -0.05;
  function build() {
    svg = document.getElementById('hl-chart');
    const all = ['hepta', 'penta'].flatMap(m => Object.values(D.roles[m].roles).flat());
    yMax = Math.ceil(Math.max(...all) * 10 + .5) / 10;
    for (let v = 0; v <= yMax + 1e-9; v += .1) {
      el('line', { x1: X0, x2: X1, y1: py(v), y2: py(v), stroke: v === 0 ? '#9b96ad' : '#ebe8f2', 'stroke-width': v === 0 ? 1.2 : 1 }, svg);
      el('text', { x: X0 - 8, y: py(v) + 4, 'text-anchor': 'end' }, svg).textContent = v.toFixed(1);
    }
    for (let l = 0; l <= 12; l += 2) el('text', { x: px(l), y: Y1 + 20, 'text-anchor': 'middle' }, svg).textContent = l;
    el('text', { x: (X0 + X1) / 2, y: Y1 + 38, 'text-anchor': 'middle' }, svg).textContent = 'GujiBERT 層';
    ROLES.forEach(([r, zh, c, dash], i) => {
      const col = css(c);
      lines[r] = el('path', { class: 'ln', stroke: col, 'stroke-dasharray': dash ? '7 6' : 'none' }, svg);
      dots[r] = [...Array(13)].map(() => el('circle', { r: 3.6, fill: col }, svg));
      const ly = Y0 + 8 + i * 22;
      el('line', { x1: X0 + 14, x2: X0 + 40, y1: ly, y2: ly, stroke: col, 'stroke-width': 3, 'stroke-dasharray': dash ? '7 6' : 'none' }, svg);
      el('text', { x: X0 + 48, y: ly + 5, class: 'lg' }, svg).textContent = zh + (dash ? '（外）' : '（內）');
    });
    document.querySelectorAll('.hl-tabs button').forEach(b => b.addEventListener('click', () => { b.blur(); show(b.dataset.m); }));
    const n = m => D.roles[m].n[1];
    document.getElementById('hl-n').textContent = `樣本：唐、宋、元、明、清各 ${D.per_dynasty} 首七言律詩、${D.per_dynasty} 首五言律詩（各約 1,000 首，每首四聯）；GujiBERT 整聯編碼。`;
  }
  function show(m) {
    mode = m;
    ROLES.forEach(([r]) => {
      const v = D.roles[m].roles[r], dy = m === 'hepta' && r === 'neck' ? -4 : 0;   // hepta jaw/neck coincide: nudge one up
      lines[r].setAttribute('d', v.map((y, l) => (l ? 'L' : 'M') + px(l).toFixed(1) + ',' + (py(y) + dy).toFixed(1)).join(' '));
      dots[r].forEach((c, l) => { c.setAttribute('cx', px(l)); c.setAttribute('cy', py(v[l]) + dy); });
    });
    document.querySelectorAll('.hl-tabs button').forEach(b => b.classList.toggle('on', b.dataset.m === m));
  }
  H['s-v-hlayers'] = {
    enter() { if (!svg) build(); show(mode); },
    render(step) { if (svg) show(step >= 1 ? 'hepta' : 'penta'); },
    key(e) { if (e.key === 'n' || e.key === 'N') { show(mode === 'hepta' ? 'penta' : 'hepta'); return true; } return false; },
  };
})();
