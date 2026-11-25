/* Slide-specific logic (loaded before deck.js). */
window.HOOKS = {};
window.SECTIONS = [
  { id: 'sontag', zh: 'Sontag 的問題', en: "Sontag's question" },
  { id: 'art', zh: '藝術中的痛苦', en: 'Pain in art' },
  { id: 'evid', zh: '照片作為證據', en: 'Photographs as evidence' },
  { id: 'icon', zh: '經典照片與擺拍', en: 'Iconic photographs and staging' },
  { id: 'view', zh: '旁觀者', en: 'The spectator' },
  { id: 'luxun', zh: '魯迅與看客', en: 'Lu Xun and the onlookers' }
];

/* Auto-fit: on every ordinary slide, enlarge everything below the title (CSS zoom, see .slide[data-z])
   until the content reaches the bottom margin, without overflowing the slide on any side.
   Elements revealed step by step keep their place while hidden, so the final step is what gets measured. */
(function () {
  const BOTTOM = 720 - 46, RIGHT = 1280 - 70;
  function extent(s) {
    const st = document.getElementById('stage').getBoundingClientRect(), k = st.width / 1280;
    let b = 0, r = 0;
    s.querySelectorAll('*').forEach(el => {
      if (el.closest('h2, .src') || el.classList.contains('kicker')) return;
      const q = el.getBoundingClientRect(); if (!q.width && !q.height) return;
      b = Math.max(b, (q.bottom - st.top) / k); r = Math.max(r, (q.right - st.left) / k);
    });
    return [b, r];
  }
  function fitAll() {
    document.querySelectorAll('.slide').forEach(s => {
      if (s.matches('.title-slide, .full, .nofit')) return;
      s.setAttribute('data-z', '');
      const src = s.querySelector(':scope > .src');
      const limit = src ? src.offsetTop - 14 : BOTTOM;
      let lo = .7, hi = 1.7;
      for (let i = 0; i < 12; i++) {
        const z = (lo + hi) / 2; s.style.setProperty('--z', z);
        const [b, r] = extent(s);
        if (b <= limit && r <= RIGHT) lo = z; else hi = z;
      }
      s.style.setProperty('--z', lo.toFixed(3));
    });
  }
  const run = () => (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(fitAll));
  if (document.readyState === 'complete') run(); else addEventListener('load', run);
})();

/* Laser pointer: press L to swap the mouse cursor for a red dot (press L again to turn it off). */
(function () {
  const run = () => {
    const stage = document.getElementById('stage');
    const dot = document.createElement('div');
    dot.id = 'laser';
    stage.appendChild(dot);
    addEventListener('mousemove', e => {
      const r = stage.getBoundingClientRect(), k = r.width / 1280;
      dot.style.left = (e.clientX - r.left) / k + 'px';
      dot.style.top = (e.clientY - r.top) / k + 'px';
    });
    addEventListener('keydown', e => {
      if (e.metaKey || e.ctrlKey || e.altKey || (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName))) return;
      if (e.key === 'l' || e.key === 'L') { stage.classList.toggle('laser-on'); e.preventDefault(); }
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
