/* Slide-specific logic (loaded before deck.js). */
window.HOOKS = {};
window.SECTIONS = [
  { id: 'happy', zh: '極端的幸福', en: 'Extreme happiness (Serve the People)' },
  { id: 'story', zh: '《白毛女》：四個版本', en: 'One story, four versions' },
  { id: 'race', zh: '階級的種族化', en: 'The racialization of class' },
  { id: 'gen', zh: '婦女的系譜', en: 'A genealogy of women (Barlow)' },
  { id: 'woman', zh: '喜兒：從女人到婦女', en: 'Xi\'er: from nüren to funü' },
  { id: 'form', zh: '敘事形式與性別政治', en: 'Narrative form and gender politics' },
  { id: 'wrap', zh: '導修', en: 'Tutorial' }
];

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
