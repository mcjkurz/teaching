/* Slide-specific logic (loaded before deck.js). */
window.HOOKS = {};
window.SECTIONS = [
  { id: 'what',    en: 'What is OCR?' },
  { id: 'prep',    en: 'Preparing the images' },
  { id: 'metrics', en: 'Measuring errors' },
  { id: 'cases',   en: 'Case studies: Russian and Manchu' },
  { id: 'vlm',     en: 'Vision–language models' },
  { id: 'summary', en: 'Summary' }
];

/* preprocessing stepper: highlight the current / finished steps in the list */
HOOKS['s-recipe'] = {
  render(step, el) {
    el.querySelectorAll('.psteps li').forEach(li => {
      const n = +li.dataset.n;
      li.classList.toggle('cur', n === step);
      li.classList.toggle('past', n < step);
    });
  }
};

/* CER worked example: mark the edits once the step is reached */
HOOKS['s-cer'] = {
  render(step, el) {
    el.querySelectorAll('.diff .s.sub, .diff .s.ins, .diff .s.del').forEach(x => x.classList.toggle('on', step >= 1));
  }
};
