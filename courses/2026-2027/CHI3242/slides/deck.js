/* Minimal step-based slide engine.
 *
 * - Each <section class="slide"> is one slide.
 * - Elements with data-step="n" appear when the slide's step >= n
 *   (optional data-until="m" hides them again from step m on).
 * - window.HOOKS[slideId] = { steps, render(step, el), key(e, step, el) }
 *   lets a slide compute / animate its own content on every step change.
 * - → / Space / PageDown: next step (then next slide). ← / PageUp: back.
 * - Home / End: first / last slide. F: fullscreen.
 */
(function () {
  const stage = document.getElementById('stage');
  const slides = [...document.querySelectorAll('.slide')];
  const bar = document.getElementById('bar');
  const num = document.getElementById('num');
  const hooks = window.HOOKS || {};
  let cur = 0, step = 0;

  function maxStep(s) {
    let m = 0;
    s.querySelectorAll('[data-step]').forEach(e => { m = Math.max(m, +e.dataset.step); });
    const h = hooks[s.id];
    if (h && h.steps) m = Math.max(m, h.steps);
    return m;
  }

  function fit() {
    const k = Math.min(innerWidth / 1280, innerHeight / 720);
    stage.style.transform = `translate(-50%, -50%) scale(${k})`;
  }

  function apply() {
    const s = slides[cur];
    slides.forEach((x, i) => x.classList.toggle('active', i === cur));
    s.querySelectorAll('[data-step]').forEach(e => {
      const from = +e.dataset.step;
      const until = e.dataset.until != null ? +e.dataset.until : Infinity;
      e.classList.toggle('on', step >= from && step < until);
    });
    const h = hooks[s.id];
    if (h && h.render) h.render(step, s);
    // progress across all (slide, step) positions
    let done = 0, total = 0;
    slides.forEach((x, i) => {
      const n = maxStep(x) + 1;
      if (i < cur) done += n;
      if (i === cur) done += step;
      total += n;
    });
    bar.style.width = (100 * done / Math.max(1, total - 1)) + '%';
    num.textContent = `${cur + 1} / ${slides.length}`;
    history.replaceState(null, '', `#${cur + 1}.${step}`);
  }

  function next() {
    if (step < maxStep(slides[cur])) step++;
    else if (cur < slides.length - 1) { cur++; step = 0; }
    apply();
  }
  function prev() {
    if (step > 0) step--;
    else if (cur > 0) { cur--; step = maxStep(slides[cur]); }
    apply();
  }
  function go(i, st) { cur = Math.max(0, Math.min(slides.length - 1, i)); step = Math.max(0, Math.min(maxStep(slides[cur]), st || 0)); apply(); }

  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const h = hooks[slides[cur].id];
    if (h && h.key && h.key(e, step, slides[cur])) { e.preventDefault(); apply(); return; }
    switch (e.key) {
      case 'ArrowRight': case ' ': case 'PageDown': case 'Enter': next(); break;
      case 'ArrowLeft': case 'PageUp': case 'Backspace': prev(); break;
      case 'Home': go(0, 0); break;
      case 'End': go(slides.length - 1, 99); break;
      case 'f': case 'F':
        if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen();
        break;
      default: return;
    }
    e.preventDefault();
  });
  // click: right 2/3 = forward, left 1/3 = back
  addEventListener('click', e => { (e.clientX < innerWidth / 3) ? prev() : next(); });
  addEventListener('resize', fit);

  fit();
  const m = location.hash.match(/^#(\d+)\.?(\d+)?/);
  if (m) go(+m[1] - 1, +(m[2] || 0)); else apply();
})();
