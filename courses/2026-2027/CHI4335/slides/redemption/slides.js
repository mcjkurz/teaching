/* Slide-specific logic (loaded before deck.js). */
window.HOOKS = {};
window.SECTIONS = [
  { id: 'start', zh: '回到起點', en: 'Back to the beginning' },
  { id: 'life', zh: '本雅明其人', en: 'Walter Benjamin (1892–1940)' },
  { id: 'theo', zh: '神學與唯物主義', en: 'Theology and historical materialism' },
  { id: 'victor', zh: '勝利者的歷史', en: 'History written by the victors' },
  { id: 'angel', zh: '歷史的天使', en: 'The angel of history' },
  { id: 'prog', zh: '對進步的批判', en: 'Against progress' },
  { id: 'now', zh: '當下與星座', en: 'Now-time and constellation' },
  { id: 'recap', zh: '回望這個學期', en: 'Looking back at the semester' },
  { id: 'wrap', zh: '導修', en: 'Tutorial' }
];

/* The constellation of student essays (recap/index.html) is loaded into its slide only while the
   slide is shown, so that its animation does not run in the background. */
HOOKS['s-viz'] = {
  render(step, el) {
    const f = el.querySelector('iframe');
    if (!el._init) {
      el._init = true;
      new MutationObserver(() => {
        if (!el.classList.contains('active')) {
          // give the keyboard back to the deck, or ← → would go to the emptied frame
          if (document.activeElement === f) f.blur();
          window.focus();
          f.removeAttribute('src');
        }
      }).observe(el, { attributes: true, attributeFilter: ['class'] });
    }
    if (!f.getAttribute('src')) f.src = f.dataset.src;
  }
};

/* Jetztzeit diagram: the beads on the arrow of time swing into a column through the present. */
HOOKS['s-jetzt-dia'] = { render(step, el) { el.classList.toggle('v', step >= 1); } };

/* Auto-fit: on every ordinary slide, enlarge everything below the title (CSS zoom, see .slide[data-z])
   until the content reaches the bottom margin, without overflowing the slide on any side.
   Elements revealed step by step keep their place while hidden, so the final step is what gets measured. */
(function () {
  const BOTTOM = 720 - 46, RIGHT = 1280 - 70;
  function extent(s) {
    const st = document.getElementById('stage').getBoundingClientRect(), k = st.width / 1280;
    let b = 0, r = 0;
    s.querySelectorAll('*').forEach(el => {
      if (el.closest('h2') || el.classList.contains('kicker')) return;
      const q = el.getBoundingClientRect(); if (!q.width && !q.height) return;
      b = Math.max(b, (q.bottom - st.top) / k); r = Math.max(r, (q.right - st.left) / k);
    });
    return [b, r];
  }
  function fitAll() {
    document.querySelectorAll('.slide').forEach(s => {
      if (s.matches('.title-slide, .full, .nofit')) return;
      s.setAttribute('data-z', '');
      let lo = .7, hi = 1.7;
      for (let i = 0; i < 12; i++) {
        const z = (lo + hi) / 2; s.style.setProperty('--z', z);
        const [b, r] = extent(s);
        if (b <= BOTTOM && r <= RIGHT) lo = z; else hi = z;
      }
      s.style.setProperty('--z', lo.toFixed(3));
    });
  }
  const run = () => (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(fitAll));
  if (document.readyState === 'complete') run(); else addEventListener('load', run);
})();

/* Keys pressed inside the embedded visualization are forwarded here, so that ← → still turn the slides. */
addEventListener('message', e => {
  if (e.data && e.data.deckKey) dispatchEvent(new KeyboardEvent('keydown', { key: e.data.deckKey }));
});

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
