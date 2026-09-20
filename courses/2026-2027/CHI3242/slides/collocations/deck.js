/* Minimal step-based slide engine.
 *
 * - Each <section class="slide" data-sec="id"> is one slide; window.SECTIONS lists the sections.
 * - Elements with data-step="n" appear when the slide's step >= n
 *   (optional data-until="m" hides them again from step m on).
 *   The number of steps of a slide is the largest data-step in it.
 * - window.HOOKS[slideId] = { render(step, el), key(e, step, el) } computes / animates content.
 * - → / Space / PageDown: next step (then next slide). ← / PageUp: back.
 * - 1–9: jump to a section (or click it in the sidebar). Home / End. F: fullscreen.
 */
(function () {
  const stage = document.getElementById('stage');
  const slides = [...document.querySelectorAll('.slide')];
  const bar = document.getElementById('bar');
  const num = document.getElementById('num');
  const side = document.getElementById('side');
  const hooks = window.HOOKS || {};
  const sections = window.SECTIONS || [];
  let cur = 0, step = 0;

  const maxStep = s => { let m = 0; s.querySelectorAll('[data-step]').forEach(e => { m = Math.max(m, +e.dataset.step); }); return m; };
  const firstOf = id => slides.findIndex(s => s.dataset.sec === id);

  // sidebar + kicker
  sections.forEach((sec, i) => {
    const d = document.createElement('div');
    d.className = 'item'; d.dataset.sec = sec.id;
    d.innerHTML = `<span class="n">${i + 1}</span><span class="zh">${sec.zh}</span><span class="en">${sec.en}</span>`;
    d.addEventListener('click', e => { e.stopPropagation(); go(firstOf(sec.id), 0); });
    side.appendChild(d);
  });
  slides.forEach(s => {
    const i = sections.findIndex(x => x.id === s.dataset.sec);
    if (i >= 0) {
      const k = document.createElement('div');
      k.className = 'kicker'; k.textContent = `${String(i + 1).padStart(2, '0')} · ${sections[i].en}`;
      s.insertBefore(k, s.firstChild);
    }
  });

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
    // sidebar state
    const ci = sections.findIndex(x => x.id === s.dataset.sec);
    side.classList.toggle('hide', s.classList.contains('full'));
    side.querySelectorAll('.item').forEach((d, i) => { d.classList.toggle('cur', i === ci); d.classList.toggle('done', i < ci); });
    // progress across all (slide, step) positions
    let done = 0, total = 0;
    slides.forEach((x, i) => { const n = maxStep(x) + 1; if (i < cur) done += n; if (i === cur) done += step; total += n; });
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
  function go(i, st) {
    cur = Math.max(0, Math.min(slides.length - 1, i));
    step = Math.max(0, Math.min(maxStep(slides[cur]), st || 0));
    apply();
  }

  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const h = hooks[slides[cur].id];
    if (h && h.key && h.key(e, step, slides[cur])) { e.preventDefault(); apply(); return; }
    if (/^[1-9]$/.test(e.key) && sections[+e.key - 1]) { go(firstOf(sections[+e.key - 1].id), 0); e.preventDefault(); return; }
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
  addEventListener('click', e => { (e.clientX < innerWidth / 4) ? prev() : next(); });
  addEventListener('resize', fit);

  fit();
  const m = location.hash.match(/^#(\d+)\.?(\d+)?/);
  if (m) go(+m[1] - 1, +(m[2] || 0)); else apply();
})();
