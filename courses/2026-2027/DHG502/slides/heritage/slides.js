/* Slide-specific logic (loaded before deck.js). */
window.HOOKS = {};
window.SECTIONS = [
  { id: 'interp',     en: 'Interpreting heritage' },
  { id: 'surrogate',  en: 'Digital surrogates and reconstruction' },
  { id: 'intangible', en: 'Radical intangibles' },
  { id: 'distant',    en: 'Distant viewing' },
  { id: 'annot',      en: 'Annotation, close and distant' },
  { id: 'summary',    en: 'Summary' },
  { id: 'lab',        en: 'Lab (if time allows)' }
];

/* YouTube videos: load the player only while its slide is shown, unload it on leaving
   (stops playback). The deck only calls render() on the current slide, so a
   MutationObserver watches for the slide losing its "active" class. */
const VIDEO = {
  render(step, el) {
    const f = el.querySelector('iframe[data-src]');
    if (!f) return;
    // YouTube refuses to embed unless the page sends a referrer (Error 153): pages opened from file://
    // or inside an editor preview never do, so show a clickable thumbnail there instead.
    if (!/^https?:$/.test(location.protocol)) {
      const id = f.dataset.yt;
      f.parentNode.innerHTML = `<a href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener" style="position:absolute;inset:0;display:block">` +
        `<img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" style="width:100%;height:100%;object-fit:cover;display:block">` +
        `<span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:84px;height:60px;border-radius:14px;background:#d00;color:#fff;font-size:30px;display:grid;place-items:center">▶</span></a>`;
      return;
    }
    if (!f.src) f.src = f.dataset.src;
    if (!el._watch) {
      el._watch = new MutationObserver(() => { if (!el.classList.contains('active')) f.removeAttribute('src'); });
      el._watch.observe(el, { attributes: true, attributeFilter: ['class'] });
    }
  }
};
['s-cave', 's-sanxingdui', 's-rcr-q'].forEach(id => { HOOKS[id] = VIDEO; });

/* Fit text to the slide: on load, scale each slide's body text (not the headings) to the largest
   size that still fits inside the borders, up to 1.4x. Hidden steps still take up space, so one
   fit per slide holds for every step. Quote slides fit their text column instead. */
const FIT = { bottom: 668, right: 1180, max: 1.4 };
function fitSlide(s, scale) {
  const els = [...s.querySelectorAll('*')].filter(e => !e.closest('h2, .kicker') &&
    [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()));
  const orig = els.map(e => { const c = getComputedStyle(e); return [parseFloat(c.fontSize), c.lineHeight === 'normal' ? 0 : parseFloat(c.lineHeight)]; });
  const apply = k => els.forEach((e, i) => { e.style.fontSize = orig[i][0] * k + 'px'; if (orig[i][1]) e.style.lineHeight = orig[i][1] * k + 'px'; });
  const fits = () => {
    const r0 = s.getBoundingClientRect(), tx = s.querySelector('.qs .tx');
    if (tx) {
      const k = [...tx.children], h = tx.getBoundingClientRect().height;
      if (k[k.length - 1].getBoundingClientRect().bottom - k[0].getBoundingClientRect().top > h - 12 * scale) return false;
    }
    for (const e of s.querySelectorAll('*')) {
      if (e.matches('.qs, .qs .tx') || e.closest('.qs .ph')) continue;
      const r = e.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      if ((r.bottom - r0.top) / scale > FIT.bottom || (r.right - r0.left) / scale > FIT.right + 1) return false;
    }
    return true;
  };
  let lo = 1, hi = FIT.max;
  for (let i = 0; i < 8; i++) { const m = (lo + hi) / 2; apply(m); if (fits()) lo = m; else hi = m; }
  apply(lo);
}
addEventListener('load', () => (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
  const stage = document.getElementById('stage');
  stage.classList.add('measuring');
  const scale = stage.getBoundingClientRect().width / 1280;
  document.querySelectorAll('.slide:not(.full)').forEach(s => fitSlide(s, scale));
  stage.classList.remove('measuring');
}));
