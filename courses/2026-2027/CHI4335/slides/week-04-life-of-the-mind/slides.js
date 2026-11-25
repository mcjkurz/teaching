/* Slide-specific logic (loaded before deck.js). */
window.HOOKS = {};
window.SECTIONS = [
  { id: 'start', zh: '集中營裏的日落', en: 'A sunset in the camp' },
  { id: 'virtue', zh: '英雄美德與普通美德', en: 'Heroic and ordinary virtues' },
  { id: 'mind', zh: '心靈生活', en: 'The life of the mind' },
  { id: 'moral', zh: '智識與道德', en: 'Intellect and morality' },
  { id: 'memory', zh: '記憶與遺忘', en: 'Remembering and forgetting' },
  { id: 'sympathy', zh: '同情的道德', en: 'The morality of sympathy' }
];

/* YouTube videos: load the player only while its slide is shown, unload it on leaving (stops playback).
   YouTube refuses to embed in pages opened from file:// (Error 153), so there the slide shows a
   clickable thumbnail that opens the video on YouTube instead. */
document.querySelectorAll('.video iframe').forEach(f => {
  const el = f.closest('.slide'), id = f.dataset.src.split('/embed/')[1].split('?')[0];
  HOOKS[el.id] = {
    render() {
      if (!/^https?:$/.test(location.protocol)) {
        const box = f.parentNode;
        if (box.querySelector('a')) return;
        box.innerHTML = `<a href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener" style="position:absolute;inset:0;display:block">` +
          `<img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" style="width:100%;height:100%;object-fit:cover;display:block">` +
          `<span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:84px;height:60px;border-radius:14px;background:#d00;color:#fff;font-size:30px;display:grid;place-items:center">▶</span></a>`;
        return;
      }
      if (!f.getAttribute('src')) f.src = f.dataset.src;
      if (!el._watch) {
        el._watch = new MutationObserver(() => { if (!el.classList.contains('active')) f.removeAttribute('src'); });
        el._watch.observe(el, { attributes: true, attributeFilter: ['class'] });
      }
    }
  };
});

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
