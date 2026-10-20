/* Slide-specific logic (loaded before deck.js). */
window.HOOKS = {};
window.SECTIONS = [
  { id: 'appraisal', zh: '評估理論',           en: 'What is “cognitive”?' },
  { id: 'levels',    zh: '從心靈到大腦',       en: 'From minds to brains' },
  { id: 'triggers',  zh: '情感的觸發',         en: 'Concrete triggers' },
  { id: 'literary',  zh: '文學情感',           en: 'Literary feeling' },
  { id: 'disgust',   zh: '厭惡、文化與權力',   en: 'Disgust, culture, power' },
  { id: 'wrap',      zh: '小結',               en: 'Conclusion' }
];

/* Appraisal video: load the player only while its slide is shown, unload it on leaving
   (stops playback). The deck only calls render() on the current slide, so a
   MutationObserver watches for the slide losing its "active" class. */
HOOKS['s-video'] = {
  render(step, el) {
    const f = el.querySelector('iframe');
    if (!f) return;
    // YouTube refuses to embed unless the page sends a referrer (Error 153): pages opened from file://
    // or inside an editor preview never do, so show a clickable thumbnail there instead.
    if (!/^https?:$/.test(location.protocol)) {
      const box = f.parentNode;
      box.innerHTML = `<a href="https://www.youtube.com/watch?v=akxG6yPJdhE" target="_blank" rel="noopener" style="position:absolute;inset:0;display:block">` +
        `<img src="https://i.ytimg.com/vi/akxG6yPJdhE/hqdefault.jpg" alt="" style="width:100%;height:100%;object-fit:cover;display:block">` +
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

/* Pointillism: zoom into the painting until only dots are left. */
HOOKS['s-seurat'] = {
  // Zoom about a fixed point O (fractions of the painting) by resizing the plane each frame.
  // Final view (95x): the woman's ear and cheek at upper right, about 4 cm of canvas: only patches of paint.
  // Layers: l0 full painting, l1 high-res piece, l2 half-native piece; each sits exactly over its spot.
  O: [0.81970, 0.23193], MAX: 95, DUR: 4400,
  render(step, el) {
    const box = el.querySelector('.zoombox'), plane = box.querySelector('.plane');
    const target = step >= 2 ? this.MAX : 1;
    if (el._target === target) return;
    el._target = target;
    const from = el._s || 1, t0 = performance.now(), O = this.O, dur = this.DUR;
    cancelAnimationFrame(el._raf);
    const frame = now => {
      const p = Math.min(1, (now - t0) / dur), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      const s = Math.exp(Math.log(from) + (Math.log(target) - Math.log(from)) * e);  // even feel: interpolate log-scale
      const W = box.clientWidth, H = box.clientHeight;
      plane.style.width = W * s + 'px'; plane.style.height = H * s + 'px';
      plane.style.left = O[0] * W * (1 - s) + 'px'; plane.style.top = O[1] * H * (1 - s) + 'px';
      el._s = s;
      if (p < 1) el._raf = requestAnimationFrame(frame);
    };
    el._raf = requestAnimationFrame(frame);
  }
};


/* Four levels: at step 6 the middle rows split into mind / brain, with brackets; at step 7 they close up again (connected). */
HOOKS['s-levels'] = { render(step, el) { el.classList.toggle('grp', step >= 6); el.classList.toggle('joined', step >= 7); } };

/* Walls of disgust (Hogan 253–254): the closer to the innate core, the thicker the wall.
   Hunger / sexual desire break through the cultural extension but are stopped further in. */
HOOKS['s-rings'] = {
  render(step, el) {
    // the picture is complete at step 4; redraw only when it changes, so the arrow animates once
    const shown = Math.min(step, 4);
    if (el._shown === shown) return;
    el._shown = shown;
    const svg = el.querySelector('#ringsvg'), ink = '#1d1d1d', red = '#b3261e', grey = '#8a8a8a';
    const top = 70, bot = 300, mid = 185;
    // [x, thickness, step, name, example]
    const walls = [[455, 34, 1, '核心', '腐肉的氣味'], [330, 18, 2, '關鍵期', '屍體'], [205, 7, 3, '文化擴展', '火葬者、「賤民」']];
    let h = `<defs><marker id="rg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto"><path d="M0 0L10 5L0 10z" fill="${red}"/></marker></defs>`;
    walls.forEach(([x, w, st, name, ex], i) => {
      if (shown < st) return;
      const broken = i === 2 && shown >= 4;
      const fill = ['#1d1d1d', '#666', '#aaa'][i];
      if (broken) {  // the thin outer wall cracks open where the arrow passes
        h += `<rect x="${x}" y="${top}" width="${w}" height="${mid - 28 - top}" fill="${fill}"/><rect x="${x}" y="${mid + 28}" width="${w}" height="${bot - mid - 28}" fill="${fill}"/>`;
      } else h += `<rect x="${x}" y="${top}" width="${w}" height="${bot - top}" fill="${fill}"/>`;
      h += `<text x="${x + w / 2}" y="${bot + 32}" text-anchor="middle" font-size="19" font-weight="700">${name}</text>`;
      h += `<text x="${x + w / 2}" y="${bot + 54}" text-anchor="middle" font-size="14" fill="${grey}">${ex}</text>`;
    });
    if (shown >= 1) h += `<text x="${455 + 17}" y="${top - 16}" text-anchor="middle" font-size="14" fill="${grey}">最強</text>`;
    if (shown >= 3) h += `<text x="${205 + 3}" y="${top - 16}" text-anchor="middle" font-size="14" fill="${grey}">最弱</text>`;
    if (shown >= 4) {
      h += `<path class="push" d="M 20 ${mid} L 324 ${mid}" stroke="${red}" stroke-width="7" fill="none" marker-end="url(#rg)"/>`;
      h += `<text x="20" y="${mid - 20}" font-size="21" font-weight="700" fill="${red}">飢餓・性慾</text>`;
      h += `<text x="266" y="${mid + 34}" text-anchor="middle" font-size="17" font-weight="700" fill="${red}">擋不住</text>`;
      h += `<text x="400" y="${mid + 6}" text-anchor="middle" font-size="17" font-weight="700" fill="${ink}">擋住</text>`;
    }
    svg.innerHTML = h;
  }
};

/* Senses in Jeong-dae's memories: highlight one sense per step. */
HOOKS['s-senses'] = {
  render(step, el) {
    ['touch', 'smell', 'sound', 'sight', 'taste'].forEach((k, i) => el.classList.toggle('h-' + k, step >= i + 2));
  }
};
