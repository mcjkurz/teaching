/* Slide-specific logic (loaded before deck.js). */
window.HOOKS = {};
window.SECTIONS = [
  { id: 'time',    zh: '時間與創傷',         en: 'Retention, protention, trauma' },
  { id: 'history', zh: '創傷有歷史',         en: 'Trauma has a history' },
  { id: 'against', zh: '批判「自然主義」',   en: 'Against naturalism' },
  { id: 'process', zh: '創傷過程',           en: 'The trauma process' },
  { id: 'apply',   zh: '應用與批評',         en: 'Application and critique' }
];

/* Husserl's time diagram (Lectures on Internal Time-Consciousness, §10), drawn step by step:
   C D E F G are successive nows; each now sinks along an oblique line (C → C* → C**);
   the vertical under each now holds the retentions it contains; F points up to G* (protention). */
HOOKS['s-husserl'] = {
  render(step, el) {
    const svg = el.querySelector('#husserl');
    const y0 = 170, d = 95, X = { C: 40, D: 180, E: 320, F: 460, G: 580 };
    const P = { C: [X.C, y0], D: [X.D, y0], E: [X.E, y0], F: [X.F, y0], G: [X.G, y0],
      'C*': [X.D, y0 + d], 'C**': [X.E, y0 + 2 * d], 'D*': [X.E, y0 + d], 'D**': [X.F, y0 + 2 * d], 'E*': [X.F, y0 + d],
      'G*': [X.F, 50] };
    const ink = '#1d1d1d', red = '#b3261e';
    const ln = (a, b, c = ink, w = 2.5) => `<line x1="${P[a][0]}" y1="${P[a][1]}" x2="${P[b][0]}" y2="${P[b][1]}" stroke="${c}" stroke-width="${w}"/>`;
    const lab = (k, dx, dy, c = ink) => `<text x="${P[k][0] + dx}" y="${P[k][1] + dy}" font-size="22" font-weight="600" fill="${c}">${k}</text>`;
    const now = ['C', 'D', 'E', 'F'][Math.min(Math.max(step, 1), 4) - 1];
    let h = `<line x1="15" y1="${y0}" x2="625" y2="${y0}" stroke="${ink}" stroke-width="2.5"/>`;
    // obliques (sinking) and verticals (the content of each now)
    if (step >= 2) h += ln('C', 'C*') + ln('D', 'C*');
    if (step >= 3) h += ln('C*', 'C**') + ln('D', 'D*') + ln('E', 'C**');
    if (step >= 4) h += ln('D*', 'D**') + ln('E', 'E*') + ln('F', 'D**');
    if (step >= 5) h += ln('F', 'G*', red, 3) + ln('G*', 'G', red, 3);
    // points and labels
    const nows = ['C', 'D', 'E', 'F'].slice(0, Math.min(Math.max(step, 1), 4));
    nows.forEach(k => {
      h += `<circle cx="${P[k][0]}" cy="${y0}" r="${k === now ? 8 : 5}" fill="${k === now ? red : ink}"/>`;
      h += lab(k, k === 'F' ? -24 : -8, -16, k === now ? red : ink);
    });
    if (step >= 2) h += lab('C*', 10, 6);
    if (step >= 3) h += lab('C**', 10, 6) + lab('D*', 10, 6);
    if (step >= 4) h += lab('D**', 10, 6) + lab('E*', 10, 6);
    if (step >= 5) h += lab('G*', 10, 6, red) + lab('G', -8, -16, red);
    svg.innerHTML = h;
  }
};

/* Broken time (O'Brien): an ordinary series of nows with their retentions, then a moment T that
   relates to nothing; later nows keep looping back to it. */
HOOKS['s-break'] = {
  render(step, el) {
    const svg = el.querySelector('#breaksvg'), ink = '#1d1d1d', red = '#b3261e', grey = '#999';
    const y0 = 150, X = [50, 140, 230], T = 330, L = [430, 520];
    let h = `<defs><marker id="bk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10z" fill="${red}"/></marker></defs>`;
    h += `<line x1="20" y1="${y0}" x2="${step >= 2 ? 290 : 540}" y2="${y0}" stroke="${ink}" stroke-width="2.5"/>`;
    // normal series: each now sinks along an oblique; verticals hold the retentions
    X.forEach((x, i) => {
      const len = (X[X.length - 1] - x) + 40;
      h += `<line x1="${x}" y1="${y0}" x2="${x + len}" y2="${y0 + 0.6 * len}" stroke="${grey}" stroke-width="2"/>`;
      if (i > 0) h += `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y0 + 0.6 * (x - X[0])}" stroke="${grey}" stroke-width="2"/>`;
      h += `<circle cx="${x}" cy="${y0}" r="6" fill="${ink}"/>`;
    });
    h += `<text x="40" y="${y0 + 190}" font-size="17" fill="#8a8a8a">一般的時間：每個「現在」都與過去相連</text>`;
    if (step >= 2) {
      h += `<line x1="370" y1="${y0}" x2="540" y2="${y0}" stroke="${ink}" stroke-width="2.5"/>`;
      h += `<circle cx="${T}" cy="${y0}" r="13" fill="${red}"/>`;
      h += `<text x="${T}" y="${y0 + 44}" text-anchor="middle" font-size="20" font-weight="700" fill="${red}">創傷</text>`;
      h += `<text x="${T}" y="${y0 + 68}" text-anchor="middle" font-size="15" fill="${red}">無法與任何時刻相連</text>`;
    }
    if (step >= 3) {
      L.forEach((x, i) => {
        h += `<circle cx="${x}" cy="${y0}" r="6" fill="${ink}"/>`;
        const top = y0 - 70 - i * 40;
        h += `<path d="M ${x} ${y0 - 8} C ${x - 10} ${top}, ${T + 20} ${top}, ${T + 6} ${y0 - 16}" fill="none" stroke="${red}" stroke-width="2.5" stroke-dasharray="7 5" marker-end="url(#bk)"/>`;
      });
      h += `<text x="475" y="${y0 - 128}" text-anchor="middle" font-size="17" font-weight="700" fill="${red}">一再回返</text>`;
    }
    svg.innerHTML = h;
  }
};

/* Aftershock: the dated section headings of the story, plotted in reading order. */
HOOKS['s-yuzhen'] = {
  render(step, el) {
    const svg = el.querySelector('#yzsvg');
    const S = [[2006.01, '多倫多'], [1976.56, '唐山'], [1976.57, '唐山'], [2005.98, '多倫多'], [1976.58, '大連'], [1976.7, '唐山'],
      [2006.12, '多倫多'], [1988.6, '上海'], [1992.75, '上海'], [1982.95, '石家莊'], [1994.3, '唐山'], [1999.46, '多倫多'],
      [2002.84, '多倫多'], [2006.24, '多倫多'], [2006.3, '唐山'], [2006.31, '多倫多']];
    const shown = [0, 3, 7, 13, 16, 16][Math.min(step, 5)];
    const x = i => 80 + i * 34, y = yr => 350 - (yr - 1975) * 10.6;
    const col = p => p === '唐山' ? '#b3261e' : p === '多倫多' ? '#1d1d1d' : '#999';
    let h = '';
    [1976, 1982, 1988, 1994, 2000, 2006].forEach(yr => {
      h += `<line x1="70" y1="${y(yr)}" x2="610" y2="${y(yr)}" stroke="#eee" stroke-width="1"/>`;
      h += `<text x="62" y="${y(yr) + 5}" text-anchor="end" font-size="14" fill="#8a8a8a">${yr}</text>`;
    });
    h += `<text x="335" y="378" text-anchor="middle" font-size="14" fill="#8a8a8a">閱讀順序：第 1 節 → 第 16 節</text>`;
    if (shown > 1) h += `<polyline points="${S.slice(0, shown).map((d, i) => `${x(i)},${y(d[0])}`).join(' ')}" fill="none" stroke="#bbb" stroke-width="2"/>`;
    S.slice(0, shown).forEach((d, i) => { h += `<circle cx="${x(i)}" cy="${y(d[0])}" r="7" fill="${col(d[1])}"/>`; });
    // legend, below the graph
    [['唐山', '#b3261e'], ['多倫多', '#1d1d1d'], ['大連、上海、石家莊', '#999']].forEach(([t, c], i) => {
      const lx = 110 + i * 150;
      h += `<circle cx="${lx}" cy="410" r="7" fill="${c}"/><text x="${lx + 14}" y="415" font-size="16" fill="#555">${t}</text>`;
    });
    svg.innerHTML = h;
  }
};

/* lineage: fade the English rows when the Chinese collage appears */
HOOKS['s-lineage'] = { render(step, el) { el.classList.toggle('collage-on', step >= 8); } };
