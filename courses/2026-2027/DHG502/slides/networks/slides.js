/* Slide-specific logic (loaded before deck.js). */
window.HOOKS = {};
window.SECTIONS = [
  { id: 'basics',   zh: '基本概念',       en: 'Basic concepts' },
  { id: 'measures', zh: '測量網絡',       en: 'Measuring a network' },
  { id: 'layout',   zh: '版面',           en: 'Layout' },
  { id: 'data',     zh: '從史料到資料',   en: 'From sources to data' },
  { id: 'case',     zh: '個案：黨籍名單', en: 'Case: faction lists' },
  { id: 'cases',    zh: '中國史個案',     en: 'Cases: Beyond Guanxi' },
  { id: 'theory',   zh: '理論反思',       en: 'Theory and cautions' },
  { id: 'summary',  zh: '總結',           en: 'Summary' }
];
const $ = (s, r = document) => r.querySelector(s);
const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}, text) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  return e;
};

/* ---------- the toy network: a simplified, illustrative web of Northern Song literati (not research data) ---------- */
const NODES = [
  { id: 'WA', zh: '王安石', g: 'new',   x: 105, y: 150 },
  { id: 'LH', zh: '呂惠卿', g: 'new',   x: 45,  y: 270 },
  { id: 'ZD', zh: '章惇',   g: 'new',   x: 150, y: 350 },
  { id: 'ZG', zh: '曾鞏',   g: 'new',   x: 170, y: 55 },
  { id: 'OY', zh: '歐陽修', g: 'other', x: 275, y: 140 },
  { id: 'SS', zh: '蘇軾',   g: 'other', x: 335, y: 255 },
  { id: 'SZ', zh: '蘇轍',   g: 'other', x: 255, y: 385 },
  { id: 'HT', zh: '黃庭堅', g: 'other', x: 410, y: 380 },
  { id: 'SM', zh: '司馬光', g: 'old',   x: 490, y: 215 },
  { id: 'FC', zh: '范純仁', g: 'old',   x: 585, y: 120 },
  { id: 'CY', zh: '程頤',   g: 'old',   x: 590, y: 310 },
  { id: 'HQ', zh: '韓琦',   g: 'old',   x: 470, y: 60 }
];
const EDGE_IDS = ['WA-LH', 'WA-ZD', 'WA-ZG', 'LH-ZD', 'WA-OY', 'ZG-OY', 'OY-SS', 'OY-HQ', 'SS-SZ', 'SS-HT', 'SZ-HT', 'SS-ZD',
  'SS-SM', 'SZ-SM', 'SM-FC', 'SM-HQ', 'SM-CY', 'FC-HQ', 'FC-CY'];
/* historical notes shown on hover (toy slide); dates and roles are standard, the edges are simplified */
const BIO = {
  WA: ['1021–1086 · 撫州臨川', '宰相，神宗支持下推行「新法」（熙寧變法，1069 起）。', 'Chief councilor under Emperor Shenzong; architect of the New Policies (from 1069).'],
  LH: ['1032–1111 · 泉州晉江', '王安石的得力助手，後與王安石失和。', 'Wang Anshi’s key lieutenant, later estranged from him.'],
  ZD: ['1035–1106 · 建州浦城', '支持新法；哲宗朝（1094 起）為宰相，打擊元祐舊臣。', 'New Policies supporter; chief councilor under Zhezong from 1094, purged Yuanyou figures.'],
  ZG: ['1019–1083 · 建昌軍南豐', '古文家，歐陽修的門生，王安石的朋友。', 'Prose master, protégé of Ouyang Xiu and friend of Wang Anshi.'],
  OY: ['1007–1072 · 吉州廬陵', '文壇領袖與政治家，提拔王安石、蘇軾、曾鞏等人。', 'Literary leader and statesman who promoted Wang Anshi, Su Shi, Zeng Gong and others.'],
  SS: ['1037–1101 · 眉州眉山', '詩人、官員；批評新法的某些措施，亦不見容於舊黨，屢遭貶謫。', 'Poet-official critical of parts of the New Policies, yet unwelcome among the conservatives; repeatedly exiled.'],
  SZ: ['1039–1112 · 眉州眉山', '蘇軾之弟，元祐年間任高官。', 'Su Shi’s younger brother; held high office in the Yuanyou years.'],
  HT: ['1045–1105 · 洪州分寧', '詩人、書法家，「蘇門四學士」之一。', 'Poet and calligrapher, one of the “Four Scholars of the Su Gate”.'],
  SM: ['1019–1086 · 陝州夏縣', '反對新法；主編《資治通鑑》；1085 年起主持元祐更化。', 'Opposed the New Policies; compiled the Zizhi tongjian; led the reversal from 1085.'],
  FC: ['1027–1101 · 蘇州吳縣', '范仲淹之子，元祐年間任宰相。', 'Son of Fan Zhongyan; chief councilor in the Yuanyou years.'],
  CY: ['1033–1107 · 河南洛陽', '理學家；元祐年間入朝為哲宗講書。', 'Neo-Confucian thinker; tutor to Emperor Zhezong in the Yuanyou period.'],
  HQ: ['1008–1075 · 相州安陽', '仁宗、英宗、神宗朝重臣；反對青苗法。', 'Senior statesman across three reigns; opposed the Green Sprouts loans.']
};
const EDGE_NOTE = {
  'WA-LH': ['提拔與共事，後來失和', 'Patron and aide, later estranged'],
  'WA-ZD': ['新法同盟', 'Allies in the New Policies'],
  'WA-ZG': ['朋友（同鄉）', 'Friends from the same region'],
  'LH-ZD': ['新法派同僚', 'Colleagues in the reform camp'],
  'WA-OY': ['歐陽修曾推薦王安石', 'Ouyang Xiu recommended Wang Anshi'],
  'ZG-OY': ['師生', 'Mentor and protégé'],
  'OY-SS': ['師生（歐陽修賞識蘇軾）', 'Mentor and protégé'],
  'OY-HQ': ['仁宗朝同朝為官', 'Contemporaries at the Renzong court'],
  'SS-SZ': ['兄弟', 'Brothers'],
  'SS-HT': ['師生', 'Master and disciple'],
  'SZ-HT': ['蘇軾交遊圈', 'Within Su Shi’s circle'],
  'SS-ZD': ['早年友人，後成政敵', 'Early friends, later rivals'],
  'SS-SM': ['元祐年間同朝', 'At court together in the Yuanyou years'],
  'SZ-SM': ['元祐年間同朝', 'At court together in the Yuanyou years'],
  'SM-FC': ['元祐盟友', 'Allies in the Yuanyou government'],
  'SM-HQ': ['同為反對新法的元老', 'Senior opponents of the New Policies'],
  'SM-CY': ['司馬光推薦程頤（1086）', 'Sima Guang recommended Cheng Yi (1086)'],
  'FC-HQ': ['同為舊法派', 'Fellow opponents of the reforms'],
  'FC-CY': ['元祐年間同朝', 'Court colleagues in the Yuanyou years']
};
const idx = Object.fromEntries(NODES.map((n, i) => [n.id, i]));
const EDGES = EDGE_IDS.map(s => s.split('-').map(k => idx[k]));
const N = NODES.length;
const ADJ = NODES.map(() => []);
EDGES.forEach(([a, b]) => { ADJ[a].push(b); ADJ[b].push(a); });
const isEdge = (a, b) => ADJ[a].includes(b);
const GROUP_COL = { new: '#e0570f', old: '#1f5fd6', other: '#8a93a6' };
const COMM_COL = ['#e0570f', '#1f5fd6', '#157a3c', '#7c3aed', '#c79500', '#b42318'];

/* ---------- network measures, computed live on the toy network ---------- */
function bfs(s) {
  const dist = Array(N).fill(-1), prev = Array(N).fill(-1), q = [s];
  dist[s] = 0;
  while (q.length) { const v = q.shift(); ADJ[v].forEach(w => { if (dist[w] < 0) { dist[w] = dist[v] + 1; prev[w] = v; q.push(w); } }); }
  return { dist, prev };
}
const ALL = NODES.map((_, i) => bfs(i));
const degree = NODES.map((_, i) => ADJ[i].length);
const closeness = ALL.map(r => (N - 1) / r.dist.reduce((a, b) => a + b, 0));
const betweenness = (() => {                       // Brandes' algorithm, undirected, unnormalised
  const C = Array(N).fill(0);
  for (let s = 0; s < N; s++) {
    const S = [], P = NODES.map(() => []), sigma = Array(N).fill(0), d = Array(N).fill(-1), q = [s];
    sigma[s] = 1; d[s] = 0;
    while (q.length) {
      const v = q.shift(); S.push(v);
      ADJ[v].forEach(w => {
        if (d[w] < 0) { d[w] = d[v] + 1; q.push(w); }
        if (d[w] === d[v] + 1) { sigma[w] += sigma[v]; P[w].push(v); }
      });
    }
    const delta = Array(N).fill(0);
    while (S.length) { const w = S.pop(); P[w].forEach(v => { delta[v] += sigma[v] / sigma[w] * (1 + delta[w]); }); if (w !== s) C[w] += delta[w]; }
  }
  return C.map(c => c / 2);
})();
const density = 2 * EDGES.length / (N * (N - 1));
let avgPath = 0, diam = 0, diamPair = [0, 0];
for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
  const d = ALL[i].dist[j]; avgPath += d;
  if (d > diam) { diam = d; diamPair = [i, j]; }
}
avgPath /= N * (N - 1) / 2;
function pathBetween(a, b) { const p = [b]; while (p[0] !== a) p.unshift(ALL[a].prev[p[0]]); return p; }
function localC(v) {
  const nb = ADJ[v], k = nb.length; let links = 0;
  for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) if (isEdge(nb[i], nb[j])) links++;
  return { k, pairs: k * (k - 1) / 2, links, c: k > 1 ? links / (k * (k - 1) / 2) : 0 };
}
function modularity(comm) {                         // comm[i] = community id of node i
  const m = EDGES.length, ids = [...new Set(comm)];
  return ids.reduce((q, c) => {
    const inside = EDGES.filter(([a, b]) => comm[a] === c && comm[b] === c).length;
    const deg = NODES.reduce((s, _, i) => s + (comm[i] === c ? degree[i] : 0), 0);
    return q + inside / m - (deg / (2 * m)) ** 2;
  }, 0);
}
const greedyComm = (() => {                         // Clauset–Newman–Moore style: merge the pair that raises Q most; keep the best partition
  let comm = NODES.map((_, i) => i), best = comm.slice(), bestQ = modularity(comm);
  for (;;) {
    const ids = [...new Set(comm)]; let pick = null, pq = -Infinity;
    ids.forEach(a => ids.forEach(b => {
      if (a >= b || !EDGES.some(([x, y]) => (comm[x] === a && comm[y] === b) || (comm[x] === b && comm[y] === a))) return;
      const t = comm.map(c => c === b ? a : c), q = modularity(t);
      if (q > pq) { pq = q; pick = t; }
    }));
    if (!pick) break;
    comm = pick;
    if (pq > bestQ) { bestQ = pq; best = comm.slice(); }
  }
  const rank = {}; let n = 0;                       // renumber 0,1,2… in node order
  return best.map(c => (c in rank ? rank[c] : (rank[c] = n++)));
})();
const attrComm = NODES.map(n => ({ new: 0, old: 1, other: 2 }[n.g]));

/* ---------- drawing a graph into an <svg viewBox="0 0 640 430"> ---------- */
function buildGraph(svg, pos = NODES) {
  if (svg.__g) return svg.__g;
  const g = { svg, edges: [], nodes: [] };
  g.hits = [];
  EDGES.forEach(([a, b]) => { const l = svgEl('line', { class: 'ge' }); svg.appendChild(l); g.edges.push(l); });
  EDGES.forEach(() => { const h = svgEl('line', { class: 'gh' }); svg.appendChild(h); g.hits.push(h); });
  NODES.forEach((n, i) => {
    const grp = svgEl('g', { class: 'gn' });
    const c = svgEl('circle', { r: 16 }), t = svgEl('text', { 'text-anchor': 'middle' }, n.zh);
    grp.append(c, t); svg.appendChild(grp);
    g.nodes.push({ grp, c, t });
  });
  g.pos = pos.map(p => ({ x: p.x, y: p.y }));
  g.place = () => {
    EDGES.forEach(([a, b], i) => { const l = g.edges[i]; l.setAttribute('x1', g.pos[a].x); l.setAttribute('y1', g.pos[a].y); l.setAttribute('x2', g.pos[b].x); l.setAttribute('y2', g.pos[b].y); const h = g.hits[i]; ['x1','y1','x2','y2'].forEach(k => h.setAttribute(k, l.getAttribute(k))); });
    g.nodes.forEach((n, i) => { n.c.setAttribute('cx', g.pos[i].x); n.c.setAttribute('cy', g.pos[i].y); n.t.setAttribute('x', g.pos[i].x); });
    g.nodes.forEach((n, i) => n.t.setAttribute('y', g.pos[i].y + (+n.c.getAttribute('r')) + 17));
  };
  g.reset = () => {
    g.nodes.forEach(n => { n.c.setAttribute('r', 16); n.c.style.fill = ''; n.c.style.stroke = ''; n.grp.classList.remove('dim', 'hot'); n.t.classList.remove('dim'); });
    g.edges.forEach(e => { e.classList.remove('dim', 'hot'); e.style.stroke = ''; });
    svg.querySelectorAll('.glabel').forEach(x => x.remove());
    g.place();
  };
  svg.__g = g; g.reset();
  return g;
}
function label(g, i, text, dy = -4) {                 // value tag next to a node
  const t = svgEl('text', { class: 'glabel', x: g.pos[i].x, y: g.pos[i].y + dy, 'text-anchor': 'middle' }, text);
  g.svg.appendChild(t);
}
const topK = (vals, k) => vals.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]).slice(0, k).map(x => x[1]);
const fmt = (v, d = 2) => (Math.round(v * 10 ** d) / 10 ** d).toString();

/* ---------- 節點與邊: static illustrations are inline in the HTML; clique helper for the co-occurrence slides ---------- */
function drawClique(svg, n, labels) {
  svg.innerHTML = '';
  const cx = 80, cy = 70, r = 48, pts = [...Array(n).keys()].map(i => [cx + r * Math.sin(2 * Math.PI * i / n), cy - r * Math.cos(2 * Math.PI * i / n)]);
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) svg.appendChild(svgEl('line', { x1: pts[i][0], y1: pts[i][1], x2: pts[j][0], y2: pts[j][1], class: 'ge hot' }));
  pts.forEach((p, i) => {
    svg.appendChild(svgEl('circle', { cx: p[0], cy: p[1], r: 13, class: 'cl-n' }));
    if (labels) svg.appendChild(svgEl('text', { x: p[0], y: p[1] + 5, 'text-anchor': 'middle', class: 'cl-t' }, labels[i]));
  });
}
HOOKS['s-cooc2'] = {
  render(step, el) { drawClique($('#clq5', el), 5, ['甲', '乙', '丙', '丁', '戊']); drawClique($('#clq3', el), 3, ['甲', '乙', '丙']); }
};

/* ---------- 1. toy graph overview (nodes + edges + attributes) ---------- */
HOOKS['s-toy'] = {
  render(step, el) {
    const g = buildGraph($('#g-toy', el)); g.reset();
    const info = $('#toy-info', el);
    if (!g.wired) {
      g.wired = true;
      const dflt = '<div class="bi xs"><span class="zh">把滑鼠移到<b>節點</b>或<b>邊</b>上，看歷史背景。</span><span class="en">Hover over a node or an edge for historical background.</span></div>';
      info.innerHTML = dflt;
      g.nodes.forEach((n, i) => {
        n.grp.addEventListener('mouseenter', () => {
          const [d, zh, en] = BIO[NODES[i].id];
          info.innerHTML = `<div class="bi xs"><span class="zh"><b>${NODES[i].zh}</b> <span class="small">${d}</span><br>${zh}</span><span class="en">${en}</span></div>`;
          g.edges.forEach((e, k) => e.classList.toggle('hot', EDGES[k].includes(i)));
        });
        n.grp.addEventListener('mouseleave', () => { info.innerHTML = dflt; g.edges.forEach(e => e.classList.remove('hot')); });
      });
      g.hits.forEach((h, k) => {
        const [a, b] = EDGES[k], [zh, en] = EDGE_NOTE[EDGE_IDS[k]];
        h.addEventListener('mouseenter', () => {
          info.innerHTML = `<div class="bi xs"><span class="zh"><b>${NODES[a].zh} — ${NODES[b].zh}</b><br>${zh}</span><span class="en">${en}</span></div>`;
          g.edges[k].classList.add('hot');
        });
        h.addEventListener('mouseleave', () => { info.innerHTML = dflt; g.edges[k].classList.remove('hot'); });
      });
    }
    g.nodes.forEach((n, i) => {
      if (step >= 2) { n.c.style.stroke = GROUP_COL[NODES[i].g]; n.c.style.fill = GROUP_COL[NODES[i].g]; }
    });
    $('#toy-legend', el).style.opacity = step >= 2 ? 1 : 0;
  }
};

/* ---------- 2. global measures ---------- */
HOOKS['s-global'] = {
  render(step, el) {
    const g = buildGraph($('#g-global', el)); g.reset();
    $('#gm-n', el).textContent = N; $('#gm-e', el).textContent = EDGES.length;
    $('#gm-d', el).textContent = fmt(density); $('#gm-max', el).textContent = (N * (N - 1) / 2);
    $('#gm-p', el).textContent = fmt(avgPath); $('#gm-diam', el).textContent = diam;
    if (step >= 4) {
      const p = pathBetween(...diamPair);
      g.nodes.forEach((n, i) => { if (!p.includes(i)) n.grp.classList.add('dim'); else n.c.style.fill = '#ffe8d9', n.c.style.stroke = '#e0570f'; });
      EDGES.forEach(([a, b], i) => { const on = p.includes(a) && p.includes(b) && Math.abs(p.indexOf(a) - p.indexOf(b)) === 1; g.edges[i].classList.toggle('hot', on); g.edges[i].classList.toggle('dim', !on); });
    }
  }
};

/* ---------- 3a. three small pictures: same network, redder = more central ---------- */
HOOKS['s-central-def'] = {
  render(step, el) {
    const M = { degree, betweenness, closeness };
    el.querySelectorAll('svg.mini').forEach(svg => {
      const g = buildGraph(svg), v = M[svg.dataset.m], max = Math.max(...v), min = Math.min(...v);
      g.reset();
      const top = topK(v, 1)[0];
      g.nodes.forEach((n, i) => {
        const t = (v[i] - min) / (max - min || 1);
        const c = [0, 1, 2].map(k => Math.round([253, 232, 228][k] + ([192, 22, 12][k] - [253, 232, 228][k]) * t));
        n.c.setAttribute('r', 24); n.c.style.fill = `rgb(${c})`; n.c.style.stroke = i === top ? '#7a0c05' : '#b8c0cf';
        n.c.style.strokeWidth = i === top ? 5 : 2; n.t.style.display = 'none';
      });
    });
  }
};

/* ---------- 3. centrality: degree / betweenness / closeness ---------- */
HOOKS['s-central'] = {
  render(step, el) {
    const g = buildGraph($('#g-central', el)); g.reset();
    const M = [null, degree, betweenness, closeness][step];
    const names = [null, '度中心性 degree', '中介中心性 betweenness', '接近中心性 closeness'];
    const list = $('#cent-list', el);
    list.innerHTML = '';
    if (!M) return;
    const max = Math.max(...M), min = Math.min(...M);
    const top = topK(M, 3);
    g.nodes.forEach((n, i) => {
      const t = (M[i] - min) / (max - min || 1);
      n.c.setAttribute('r', 10 + 24 * t);
      if (top.includes(i)) { n.c.style.fill = '#ffe8d9'; n.c.style.stroke = '#e0570f'; }
    });
    g.place();
    top.forEach((i, r) => {
      const li = document.createElement('div'); li.className = 'rankrow';
      li.innerHTML = `<i>${r + 1}</i><span class="nm">${NODES[i].zh}</span><b>${step === 3 ? fmt(M[i]) : fmt(M[i], step === 2 ? 1 : 0)}</b>`;
      list.appendChild(li);
      label(g, i, step === 3 ? fmt(M[i]) : fmt(M[i], step === 2 ? 1 : 0), 5);
    });
  }
};

/* ---------- 4. local clustering ---------- */
HOOKS['s-clust'] = {
  render(step, el) {
    const g = buildGraph($('#g-clust', el)); g.reset();
    const pick = [null, idx.WA, idx.SS, idx.SM][step];
    const box = $('#cl-out', el);
    if (pick == null) { box.innerHTML = ''; return; }
    const nb = ADJ[pick], inset = [pick, ...nb];
    g.nodes.forEach((n, i) => { if (!inset.includes(i)) n.grp.classList.add('dim'); else if (i === pick) { n.c.style.fill = '#1f5fd6'; n.c.style.stroke = '#1f5fd6'; n.t.style.fontWeight = 600; } else { n.c.style.fill = '#ffe8d9'; n.c.style.stroke = '#e0570f'; } });
    EDGES.forEach(([a, b], i) => {
      const among = nb.includes(a) && nb.includes(b), touch = a === pick || b === pick;
      g.edges[i].classList.toggle('hot', among); g.edges[i].classList.toggle('dim', !among && !touch);
      if (among) g.edges[i].style.stroke = '#e0570f';
    });
    const L = localC(pick);
    box.innerHTML = `<div class="kv"><span>${NODES[pick].zh}</span><b>k = ${L.k}</b></div>
      <div class="kv"><span><span class="zh-s">鄰居之間可能的邊</span> <em class="en">possible edges among neighbours</em></span><b>${L.pairs}</b></div>
      <div class="kv"><span><span class="zh-s">實際存在的邊</span> <em class="en">actual</em></span><b class="col-c">${L.links}</b></div>
      <div class="kv"><span><span class="zh-s">局部聚類係數</span> <em class="en">local clustering</em></span><b class="tgt-c">C = ${L.links} / ${L.pairs} = ${fmt(L.c)}</b></div>`;
  }
};

/* ---------- 5. communities ---------- */
HOOKS['s-comm'] = {
  render(step, el) {
    const g = buildGraph($('#g-comm', el)); g.reset();
    const part = step >= 2 ? greedyComm : attrComm;
    const col = step >= 2 ? COMM_COL : [GROUP_COL.new, GROUP_COL.old, GROUP_COL.other];
    if (step >= 1) g.nodes.forEach((n, i) => { n.c.style.fill = col[part[i]]; n.c.style.stroke = col[part[i]]; });
    EDGES.forEach(([a, b], i) => { if (step >= 1 && part[a] !== part[b]) g.edges[i].classList.add('dim'); });
    const nc = new Set(part).size;
    $('#q-val', el).textContent = fmt(modularity(part), 3);
    $('#q-lab', el).innerHTML = step >= 2 ? `<span class="zh-s">演算法找出 ${nc} 個社群</span> <em class="en">algorithm finds ${nc} communities</em>` : `<span class="zh-s">按我們事先貼的標籤分組</span> <em class="en">grouped by labels we assigned</em>`;
    $('#q-attr', el).textContent = fmt(modularity(attrComm), 3);
    $('#q-alg', el).textContent = fmt(modularity(greedyComm), 3);
  }
};

/* ---------- 6. layouts: same graph, three pictures ---------- */
(function () {
  const W = 640, H = 430, cx = W / 2, cy = H / 2 + 6;
  const lcg = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const rand = NODES.map(() => ({ x: 50 + lcg() * (W - 100), y: 40 + lcg() * (H - 90) }));
  const circle = NODES.map((_, i) => ({ x: cx + 175 * Math.sin(2 * Math.PI * i / N) * 1.4, y: cy - 165 * Math.cos(2 * Math.PI * i / N) }));
  const force = (() => {                              // Fruchterman–Reingold, deterministic start
    let p = NODES.map((_, i) => ({ x: cx + 120 * Math.cos(2 * Math.PI * i / N + .3), y: cy + 120 * Math.sin(2 * Math.PI * i / N + .3) }));
    const k = 105;
    for (let it = 0; it < 400; it++) {
      const t = 14 * (1 - it / 400) + .3, d = p.map(() => ({ x: 0, y: 0 }));
      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
        let dx = p[i].x - p[j].x, dy = p[i].y - p[j].y, L = Math.hypot(dx, dy) || .01, f = k * k / L;
        d[i].x += dx / L * f; d[i].y += dy / L * f; d[j].x -= dx / L * f; d[j].y -= dy / L * f;
      }
      EDGES.forEach(([a, b]) => {
        let dx = p[a].x - p[b].x, dy = p[a].y - p[b].y, L = Math.hypot(dx, dy) || .01, f = L * L / k;
        d[a].x -= dx / L * f; d[a].y -= dy / L * f; d[b].x += dx / L * f; d[b].y += dy / L * f;
      });
      p = p.map((q, i) => { const L = Math.hypot(d[i].x, d[i].y) || 1, s = Math.min(L, t); return { x: q.x + d[i].x / L * s, y: q.y + d[i].y / L * s }; });
    }
    const xs = p.map(q => q.x), ys = p.map(q => q.y), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    return p.map(q => ({ x: 45 + (q.x - x0) / (x1 - x0) * (W - 90), y: 35 + (q.y - y0) / (y1 - y0) * (H - 95) }));
  })();
  const sets = [rand, circle, force];
  let anim = 0;
  HOOKS['s-layout'] = {
    render(step, el) {
      const g = buildGraph($('#g-layout', el), rand);
      const to = sets[Math.min(step, 2)], from = g.pos.map(p => ({ x: p.x, y: p.y }));
      cancelAnimationFrame(anim);
      const t0 = performance.now();
      const tick = now => {
        const u = Math.min(1, (now - t0) / 800), e = u < .5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u);
        g.pos = from.map((p, i) => ({ x: p.x + (to[i].x - p.x) * e, y: p.y + (to[i].y - p.y) * e }));
        g.place();
        if (u < 1) anim = requestAnimationFrame(tick);
      };
      anim = requestAnimationFrame(tick);
      el.querySelectorAll('.lay-name').forEach((x, i) => x.classList.toggle('cur', i === Math.min(step, 2)));
    }
  };
})();
