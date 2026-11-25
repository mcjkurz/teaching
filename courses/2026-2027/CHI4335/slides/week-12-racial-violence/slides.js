/* Slide-specific logic (loaded before deck.js). */
window.HOOKS = {};
window.SECTIONS = [
  { id: 'hist', zh: '歷史背景', en: 'From the slave trade to the Second World War' },
  { id: 'hale', zh: '私刑作為景觀', en: 'Lynching as spectacle (Hale)' },
  { id: 'view', zh: '觀看與看客', en: 'Regarding the pain of others (Sontag)' },
  { id: 'fanon', zh: 'Fanon：黑皮膚，白面具', en: 'Fanon: Black Skin, White Masks' },
  { id: 'wrap', zh: '導修', en: 'Tutorial' }
];

/* The Birth of a Nation: two clip buttons. The player loads only while the slide is shown and is
   unloaded when the slide is left (stops playback). YouTube refuses to embed in pages opened from
   file:// (no referrer, Error 153), so there each button opens YouTube at the clip's start instead. */
HOOKS['s-birth'] = {
  render(step, el) {
    const f = el.querySelector('iframe');
    const local = !/^https?:$/.test(location.protocol);
    const url = (s, e) => `https://www.youtube.com/embed/${f.dataset.vid}?start=${s}&end=${e}&autoplay=1&rel=0`;
    if (!el._init) {
      el._init = true;
      const btns = [...el.querySelectorAll('.clipbtns button')];
      btns.forEach(b => b.addEventListener('click', ev => {
        ev.stopPropagation(); b.blur();
        if (local) { window.open(`https://www.youtube.com/watch?v=${f.dataset.vid}&t=${b.dataset.start}s`, '_blank', 'noopener'); return; }
        btns.forEach(x => x.classList.toggle('on', x === b));
        f.src = url(b.dataset.start, b.dataset.end);
      }));
      if (local) f.parentNode.classList.add('local');
      new MutationObserver(() => { if (!el.classList.contains('active')) { f.removeAttribute('src'); btns.forEach(x => x.classList.remove('on')); } })
        .observe(el, { attributes: true, attributeFilter: ['class'] });
    }
    if (!local && !f.getAttribute('src')) f.src = url(8100, 8400).replace('&autoplay=1', '');
  }
};

/* Laser pointer: press L to swap the mouse cursor for a red dot (press L again to turn it off). */
(function () {
  const run = () => {
    const stage = document.getElementById('stage');
    const dot = document.createElement('div');
    dot.id = 'laser';
    stage.appendChild(dot);
    // the stage is scaled with a CSS transform, so convert screen coordinates to stage coordinates
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
