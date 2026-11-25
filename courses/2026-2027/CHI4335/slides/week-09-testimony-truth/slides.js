/* Slide-specific logic (loaded before deck.js). */
window.HOOKS = {};
window.SECTIONS = [
  { id: 'problem', zh: '證詞是什麼', en: 'What is testimony' },
  { id: 'individual', zh: '個人的偽造與加工', en: 'Individual forgeries and embellishments' },
  { id: 'state', zh: '國家製造的證詞', en: 'State-manufactured testimony' },
  { id: 'after', zh: '反面、後果與辨識', en: 'The reverse, the stakes, detection' },
  { id: 'theory', zh: '回頭看：理論', en: 'Looking back: theory' },
  { id: 'ung', zh: '《他們先殺了我父親》', en: 'First They Killed My Father' },
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
