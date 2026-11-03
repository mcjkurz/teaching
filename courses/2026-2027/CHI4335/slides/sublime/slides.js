/* Slide-specific logic (loaded before deck.js). */
window.HOOKS = {};
window.SECTIONS = [
  { id: 'genre', zh: '這是什麼文類？', en: 'What genre is this?' },
  { id: 'sublime', zh: '崇高', en: 'The sublime' },
  { id: 'event', zh: '32111 鑽井隊', en: 'The 32111 Drilling Team' },
  { id: 'read', zh: '細讀文本', en: 'Close reading' },
  { id: 'aside', zh: '旁白：計算', en: 'Aside: computation' },
  { id: 'voice', zh: '誰在說話', en: 'Who is speaking' },
  { id: 'axes', zh: '準確與本真', en: 'Accuracy and authenticity' },
  { id: 'after', zh: '從紙面到舞台', en: 'From page to stage' },
  { id: 'wrap', zh: '小結與導修', en: 'Conclusion and tutorial' }
];

/* Image slots: a figure with class "ph" shows the expected file name until the image exists
   (add the file to img/ and reload). */
(function () {
  const mark = f => { if (!f.querySelector('img') || !f.querySelector('img').naturalWidth) f.classList.add('missing'); };
  const run = () => document.querySelectorAll('.ph').forEach(f => {
    const im = f.querySelector('img');
    if (!im) return;
    if (im.complete) mark(f); else { im.addEventListener('error', () => f.classList.add('missing')); im.addEventListener('load', () => f.classList.remove('missing')); }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();

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
