/* Slide-specific logic (loaded before deck.js). */
window.HOOKS = {};
window.SECTIONS = [
  { id: 'interp',     en: 'Interpreting heritage' },
  { id: 'surrogate',  en: 'Digital surrogates and reconstruction' },
  { id: 'intangible', en: 'Radical intangibles' },
  { id: 'distant',    en: 'Distant viewing' },
  { id: 'annot',      en: 'Annotation, close and distant' },
  { id: 'summary',    en: 'Summary' }
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
