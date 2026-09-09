(function () {
    'use strict';

    // ── State ────────────────────────────────────────────────────────
    var state = {
        mode: 'char',        // 'char' | 'byte'
        text: '',
        pretokenize: true,   // split on whitespace before BPE
        base: 10,            // number base for display: 2, 10, or 16
        segments: [],        // array of segments; each segment is an array of token ids
        vocab: [],           // array of { id, units, kind }
        idOfUnit: {},        // map from unit-key -> id  (for base vocab)
        merges: [],          // list of { step, pair:[id,id], newId, count }
        autoTimer: null
    };

    var DEFAULT_TEXT = 'the cat sat on the mat the cat';

    // ── DOM refs ──────────────────────────────────────────────────────
    var el = {};

    function cacheDom() {
        el.textInput = document.getElementById('textInput');
        el.btnReset = document.getElementById('btnReset');
        el.btnPrev = document.getElementById('btnPrev');
        el.btnNext = document.getElementById('btnNext');
        el.btnAuto = document.getElementById('btnAuto');
        el.maxMerges = document.getElementById('maxMerges');
        el.tokenSequence = document.getElementById('tokenSequence');
        el.statsLine = document.getElementById('statsLine');
        el.pairTableBody = document.getElementById('pairTableBody');
        el.vocabTableBody = document.getElementById('vocabTableBody');
        el.mergeHistory = document.getElementById('mergeHistory');
        el.modeBtns = document.querySelectorAll('.mode-btn');
        el.baseSelect = document.getElementById('baseSelect');
        el.pretokenToggle = document.getElementById('pretokenToggle');
        el.stepBadge = document.getElementById('stepBadge');
        el.stepDesc = document.getElementById('stepDesc');
        el.infoTabs = document.querySelectorAll('.info-tab');
        el.infoPanels = document.querySelectorAll('.info-panel');
        el.newTextInput = document.getElementById('newTextInput');
        el.newTokenSequence = document.getElementById('newTokenSequence');
        el.newStats = document.getElementById('newStats');
        el.byteSequencePanel = document.getElementById('byteSequencePanel');
        el.byteSequence = document.getElementById('byteSequence');
        el.vocabWrapper = document.querySelector('#vocabPanel .table-wrapper');
    }

    // ── UTF-8 helpers ─────────────────────────────────────────────────
    function tryDecodeUtf8(bytes) {
        try {
            var u8 = new Uint8Array(bytes);
            var dec = new TextDecoder('utf-8', { fatal: true });
            return dec.decode(u8);
        } catch (e) {
            return null;
        }
    }

    // Format a number in the user-chosen base (2, 10, or 16).
    // Byte values are zero-padded to a fixed width; vocab IDs are not.
    function formatNum(n, isByte) {
        var base = state.base;
        if (base === 10) return String(n);
        if (base === 16) {
            var h = n.toString(16).toUpperCase();
            return isByte ? h.padStart(2, '0') : h;
        }
        var b = n.toString(2);
        return isByte ? b.padStart(8, '0') : b;
    }

    function tokenHex(token) {
        if (state.mode === 'char') return '';
        return token.units.map(function (v) { return formatNum(v, true); }).join(' ');
    }

    // Content of a token (no ID): chars in char mode, "hex (hint)" in byte mode.
    function tokenContent(token) {
        if (state.mode === 'char') return token.units.join('');
        var h = tokenHex(token);
        var hint = tokenHint(token);
        return hint ? h + ' (' + hint + ')' : h;
    }

    // Primary chip text.
    //  - base token: its content (char, or hex byte in byte mode)
    //  - merged token: its NEW VOCAB ID (+ a content hint), since each merge
    //    creates a fresh vocabulary entry identified by that integer.
    function tokenDisplay(token) {
        if (token.kind === 'merged') return mergedDisplay(token);
        if (state.mode === 'char') return token.units.join('');
        return tokenHex(token);
    }

    function mergedDisplay(token) {
        if (state.mode === 'char') {
            // Char mode: the content is the meaningful identifier; show it
            // (parenthesized to distinguish merged tokens from base chars).
            // The ID is not shown here — it lives in the vocabulary table.
            return '(' + token.units.join('') + ')';
        }
        // Byte mode: just the new vocab ID — the bytes/decoded word stay in
        // the tooltip and the vocabulary table, not on the chip.
        return formatNum(token.id, false);
    }

    // Rich text for tables / descriptions.
    //  - base token: content (+ hint)
    //  - merged token: new vocab ID (+ content hint)
    function tokenRich(token) {
        if (token.kind === 'merged') return mergedDisplay(token);
        return tokenContent(token);
    }

    // Decoded UTF-8 hint for byte mode (empty in char mode).
    // Decoded UTF-8 hint for byte mode (empty in char mode, or for control bytes).
    function tokenHint(token) {
        if (state.mode === 'char') return '';
        var d = tryDecodeUtf8(token.units);
        if (d === null || d.length === 0) return '';
        var cps = Array.from(d);
        for (var i = 0; i < cps.length; i++) {
            var cp = cps[i].codePointAt(0);
            if (cp < 0x20 || cp === 0x7F) return '';  // skip control chars
        }
        return d.replace(/ /g, '␣');
    }

    // ── Init ──────────────────────────────────────────────────────────
    function initFromText() {
        state.segments = [];
        state.vocab = [];
        state.idOfUnit = {};
        state.merges = [];
        state.justMerged = false;
        stopAuto();

        var text = el.textInput.value;
        state.pretokenize = el.pretokenToggle.checked;

        // Build a list of "chunks". When pre-tokenizing, each chunk is one
        // whitespace-delimited word (whitespace discarded, acts as a barrier).
        // When not pre-tokenizing, the whole text is a single chunk.
        var chunks;
        if (state.pretokenize) {
            chunks = text.split(/\s+/).filter(Boolean);
        } else {
            chunks = [text];
        }

        // Byte-level BPE starts with all 256 byte values as the base
        // vocabulary, so every possible byte is representable from the
        // outset (no out-of-vocabulary bytes). Char mode builds its base
        // vocab only from the characters that appear.
        if (state.mode === 'byte') {
            for (var bv = 0; bv < 256; bv++) {
                var bkey = 'b:' + bv;
                state.vocab.push({ id: bv, units: [bv], kind: 'base' });
                state.idOfUnit[bkey] = bv;
            }
        }

        chunks.forEach(function (chunk) {
            var segIds = [];
            if (state.mode === 'char') {
                Array.from(chunk).forEach(function (ch) {
                    var key = 'c:' + ch;
                    if (!(key in state.idOfUnit)) {
                        var id = state.vocab.length;
                        state.vocab.push({ id: id, units: [ch], kind: 'base' });
                        state.idOfUnit[key] = id;
                    }
                    segIds.push(state.idOfUnit[key]);
                });
            } else {
                var u8 = new TextEncoder().encode(chunk);
                for (var i = 0; i < u8.length; i++) {
                    segIds.push(state.idOfUnit['b:' + u8[i]]);
                }
            }
            if (segIds.length > 0) state.segments.push(segIds);
        });
        render();
    }

    // ── Pair counting (within segments only) ──────────────────────────
    function countPairs() {
        var counts = {};
        state.segments.forEach(function (seg) {
            for (var i = 0; i < seg.length - 1; i++) {
                var a = seg[i];
                var b = seg[i + 1];
                var key = a + ',' + b;
                if (!counts[key]) counts[key] = { a: a, b: b, count: 0 };
                counts[key].count++;
            }
        });
        var arr = [];
        for (var k in counts) arr.push(counts[k]);
        arr.sort(function (x, y) {
            if (y.count !== x.count) return y.count - x.count;
            if (x.a !== y.a) return x.a - y.a;
            return x.b - y.b;
        });
        return arr;
    }

    // ── Next merge ────────────────────────────────────────────────────
    function nextMerge() {
        var pairs = countPairs();
        if (pairs.length === 0) {
            stopAuto();
            return false;
        }
        var cap = parseInt(el.maxMerges.value, 10) || 30;
        if (state.merges.length >= cap) {
            stopAuto();
            return false;
        }
        var top = pairs[0];
        var newId = state.vocab.length;
        var newUnits = state.vocab[top.a].units.concat(state.vocab[top.b].units);
        state.vocab.push({ id: newId, units: newUnits, kind: 'merged' });
        state.merges.push({
            step: state.merges.length + 1,
            pair: [top.a, top.b],
            newId: newId,
            count: top.count
        });
        // replace the pair within every segment
        state.segments = state.segments.map(function (seg) {
            var out = [], i = 0;
            while (i < seg.length) {
                if (i < seg.length - 1 && seg[i] === top.a && seg[i + 1] === top.b) {
                    out.push(newId);
                    i += 2;
                } else {
                    out.push(seg[i]);
                    i += 1;
                }
            }
            return out;
        });
        state.justMerged = true;   // hint for renderVocab to scroll to bottom
        render();
        return true;
    }

    // ── Previous merge (undo) ─────────────────────────────────────────
    function previousMerge() {
        if (state.merges.length === 0) return;
        stopAuto();
        var last = state.merges.pop();
        state.vocab.pop();
        var a = last.pair[0], b = last.pair[1], newId = last.newId;
        state.segments = state.segments.map(function (seg) {
            var out = [];
            for (var i = 0; i < seg.length; i++) {
                if (seg[i] === newId) {
                    out.push(a);
                    out.push(b);
                } else {
                    out.push(seg[i]);
                }
            }
            return out;
        });
        render();
    }

    // ── Jump to step n ─────────────────────────────────────────────────
    function jumpToStep(targetStep) {
        initFromText();
        for (var s = 0; s < targetStep; s++) {
            if (!nextMerge()) break;
        }
    }

    // ── Auto run ──────────────────────────────────────────────────────
    function toggleAuto() {
        if (state.autoTimer) {
            stopAuto();
        } else {
            el.btnAuto.textContent = 'Stop';
            el.btnAuto.classList.add('danger');
            state.autoTimer = setInterval(function () {
                var did = nextMerge();
                if (!did) stopAuto();
            }, 700);
        }
    }

    function stopAuto() {
        if (state.autoTimer) {
            clearInterval(state.autoTimer);
            state.autoTimer = null;
        }
        el.btnAuto.textContent = 'Auto Run';
        el.btnAuto.classList.remove('danger');
    }

    // ── Rendering ─────────────────────────────────────────────────────
    function render() {
        renderStep();
        renderByteSequence();
        renderTokens();
        renderPairs();
        renderVocab();
        renderHistory();
        renderStats();
        renderNewText();
        updateButtons();
    }

    // Static strip showing the raw UTF-8 bytes of the input (byte mode only).
    function renderByteSequence() {
        if (state.mode !== 'byte') {
            el.byteSequencePanel.style.display = 'none';
            return;
        }
        el.byteSequencePanel.style.display = 'block';
        el.byteSequence.innerHTML = '';
        var u8 = new TextEncoder().encode(el.textInput.value);
        if (u8.length === 0) {
            var empty = document.createElement('span');
            empty.className = 'empty-stage';
            empty.textContent = 'Enter text above to see its UTF-8 bytes.';
            el.byteSequence.appendChild(empty);
            return;
        }
        for (var i = 0; i < u8.length; i++) {
            var chip = document.createElement('span');
            chip.className = 'byte-chip';
            chip.textContent = formatNum(u8[i], true);
            // show the printable char as a hint in the tooltip
            if (u8[i] >= 0x20 && u8[i] <= 0x7E) {
                chip.title = formatNum(u8[i], true) + '  ·  ' + String.fromCharCode(u8[i]);
            } else if (u8[i] === 0x20) {
                chip.title = formatNum(u8[i], true) + '  ·  space';
            } else {
                chip.title = formatNum(u8[i], true);
            }
            el.byteSequence.appendChild(chip);
        }
    }

    // Step indicator + dynamic Next button label
    function renderStep() {
        var n = state.merges.length;
        el.stepBadge.textContent = 'Step ' + n;
        var pairs = countPairs();
        var cap = parseInt(el.maxMerges.value, 10) || 30;
        var atCap = state.merges.length >= cap;
        var noPairs = pairs.length === 0;

        if (n === 0) {
            el.stepBadge.classList.add('done');
            el.stepDesc.innerHTML = 'Press “Merge” to begin training.';
        } else if (noPairs || atCap) {
            el.stepBadge.classList.add('done');
            var reason = atCap ? 'max merges reached' : 'no more pairs to merge';
            el.stepDesc.innerHTML = 'Done after ' + n + ' merge' + (n > 1 ? 's' : '') + ' (' + reason + ').';
        } else {
            el.stepBadge.classList.remove('done');
            var last = state.merges[state.merges.length - 1];
            var aTok = state.vocab[last.pair[0]];
            var bTok = state.vocab[last.pair[1]];
            var resTok = state.vocab[last.newId];
            el.stepDesc.innerHTML =
                'Last merge: <code>' + escapeHtml(tokenRich(aTok)) + '</code> + ' +
                '<code>' + escapeHtml(tokenRich(bTok)) + '</code> ' +
                '<span class="merge-arrow">&rarr;</span> ' +
                '<code>' + escapeHtml(tokenRich(resTok)) + '</code>' +
                '<span class="count-pill-inline">×' + last.count + '</span>';
        }

        // The Next button just says "Merge" — the highlighted pair in the
        // tokenization above shows what will be merged.
        if (noPairs || atCap) {
            el.btnNext.textContent = 'Merge →';
            el.btnNext.disabled = true;
        } else {
            var top = pairs[0];
            el.btnNext.textContent = 'Merge →';
            el.btnNext.title = 'Merge the highlighted pair (count: ' + top.count + ')';
        }
    }

    function renderTokens() {
        el.tokenSequence.innerHTML = '';
        var pairs = countPairs();
        var topPair = pairs.length ? pairs[0] : null;

        if (state.segments.length === 0 || totalTokens() === 0) {
            var empty = document.createElement('span');
            empty.className = 'empty-stage';
            empty.textContent = 'Enter some text above to begin.';
            el.tokenSequence.appendChild(empty);
            return;
        }

        // Build chips per segment. We collect chips into a grid so we can
        // tag next-merge pairs afterwards using per-segment adjacency.
        var chipGrid = [];   // chipGrid[segIdx][pos] = chip element

        state.segments.forEach(function (seg, segIdx) {
            if (segIdx > 0 && state.pretokenize) {
                var gap = document.createElement('span');
                gap.className = 'segment-gap';
                gap.textContent = '␣';
                gap.title = 'word boundary — pre-tokenization prevents merges across this gap';
                el.tokenSequence.appendChild(gap);
            }
            var row = [];
            seg.forEach(function (id) {
                var tok = state.vocab[id];
                var chip = document.createElement('span');
                chip.className = 'token-chip';
                if (tok.kind === 'merged') chip.classList.add('merged');
                chip.textContent = tokenDisplay(tok);
                // Tooltip: full content of the token (chars, or bytes + decoded hint).
                if (state.mode === 'byte') {
                    chip.title = 'id ' + formatNum(tok.id, false) + '  ·  ' + tokenContent(tok);
                } else if (tok.kind === 'merged') {
                    chip.title = 'id ' + formatNum(tok.id, false) + '  ·  ' + tok.units.join('');
                }
                el.tokenSequence.appendChild(chip);
                row.push(chip);
            });
            chipGrid.push(row);
        });

        // Tag the next-merge pair within each segment.
        if (topPair) {
            state.segments.forEach(function (seg, s) {
                for (var i = 0; i < seg.length - 1; i++) {
                    if (seg[i] === topPair.a && seg[i + 1] === topPair.b) {
                        chipGrid[s][i].classList.add('next-merge');
                        chipGrid[s][i + 1].classList.add('next-merge');
                    }
                }
            });
        }
    }

    function renderPairs() {
        el.pairTableBody.innerHTML = '';
        var pairs = countPairs();
        if (pairs.length === 0) {
            var tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="3" class="empty">No adjacent pairs (need at least 2 tokens).</td>';
            el.pairTableBody.appendChild(tr);
            return;
        }
        pairs.slice(0, 30).forEach(function (p, idx) {
            var tr = document.createElement('tr');
            if (idx === 0) tr.className = 'top-pair';
            var aTok = state.vocab[p.a];
            var bTok = state.vocab[p.b];
            var pairStr = tokenRich(aTok) + ' + ' + tokenRich(bTok);
            tr.innerHTML =
                '<td>' + (idx + 1) + '</td>' +
                '<td class="pair-cell">' + escapeHtml(pairStr) + '</td>' +
                '<td>' + p.count + '</td>';
            el.pairTableBody.appendChild(tr);
        });
    }

    function renderVocab() {
        el.vocabTableBody.innerHTML = '';
        state.vocab.forEach(function (tok) {
            var tr = document.createElement('tr');
            if (tok.kind === 'merged' && tok.id === state.vocab.length - 1 && state.merges.length > 0) {
                tr.className = 'new-token';
            }
            var disp = tokenContent(tok);
            var typeCell = tok.kind === 'base'
                ? '<span class="tag base">base</span>'
                : '<span class="tag merged">merged</span>';
            var hint = state.mode === 'byte' ? '<div class="hex-hint">' + escapeHtml(tokenHint(tok)) + '</div>' : '';
            tr.innerHTML =
                '<td>' + formatNum(tok.id, false) + '</td>' +
                '<td class="vocab-cell">' + escapeHtml(disp) + hint + '</td>' +
                '<td>' + typeCell + '</td>';
            el.vocabTableBody.appendChild(tr);
        });
        // After a merge, scroll the vocab list to the bottom so the newly
        // added token is visible. (Only when a merge just happened, so typing
        // text or switching tabs doesn't hijack the scroll position.)
        if (state.justMerged && el.vocabWrapper) {
            el.vocabWrapper.scrollTop = el.vocabWrapper.scrollHeight;
            state.justMerged = false;
        }
    }

    function renderHistory() {
        el.mergeHistory.innerHTML = '';
        if (state.merges.length === 0) {
            var li = document.createElement('li');
            li.className = 'empty';
            li.textContent = 'No merges yet. Press “Next Merge”.';
            el.mergeHistory.appendChild(li);
            return;
        }
        state.merges.forEach(function (m) {
            var aTok = state.vocab[m.pair[0]];
            var bTok = state.vocab[m.pair[1]];
            var aStr = aTok ? tokenRich(aTok) : '?';
            var bStr = bTok ? tokenRich(bTok) : '?';
            var li = document.createElement('li');
            li.innerHTML =
                '<span class="step-num">' + m.step + '.</span> ' +
                '<code>' + escapeHtml(aStr) + '</code> + ' +
                '<code>' + escapeHtml(bStr) + '</code> &rarr; ' +
                '<code class="merged-result">' + escapeHtml(tokenRich(state.vocab[m.newId])) + '</code> ' +
                '<span class="count-pill">×' + m.count + '</span>';
            li.addEventListener('click', function () {
                jumpToStep(m.step);
            });
            el.mergeHistory.appendChild(li);
        });
    }

    function totalTokens() {
        var n = 0;
        state.segments.forEach(function (seg) { n += seg.length; });
        return n;
    }

    function renderStats() {
        var nTokens = totalTokens();
        var nVocab = state.vocab.length;
        var nMerges = state.merges.length;
        var nChars = Array.from(el.textInput.value).length;
        var nSegs = state.segments.length;
        el.statsLine.innerHTML =
            '<strong>' + nTokens + '</strong> tokens &middot; ' +
            '<strong>' + nVocab + '</strong> vocab size &middot; ' +
            '<strong>' + nMerges + '</strong> merges &middot; ' +
            '<strong>' + nSegs + '</strong> ' + (state.pretokenize ? 'words' : 'segment') +
            ' &middot; <strong>' + nChars + '</strong> characters in input';
    }

    function updateButtons() {
        el.btnPrev.disabled = state.merges.length === 0;
        var pairs = countPairs();
        var cap = parseInt(el.maxMerges.value, 10) || 30;
        el.btnNext.disabled = pairs.length === 0 || state.merges.length >= cap;
    }

    // ── Tokenize new text with the trained merges ─────────────────────
    // Each token is either { id, oov:false } or { oov:true, unit }.
    function tokenizeNewText(text) {
        var chunks = state.pretokenize ? text.split(/\s+/).filter(Boolean) : [text];
        var result = [];
        chunks.forEach(function (chunk) {
            var seg = [];
            var units = state.mode === 'char' ? Array.from(chunk)
                : Array.from(new TextEncoder().encode(chunk));
            units.forEach(function (u) {
                var key = state.mode === 'char' ? 'c:' + u : 'b:' + u;
                if (key in state.idOfUnit) {
                    seg.push({ id: state.idOfUnit[key], oov: false });
                } else {
                    seg.push({ oov: true, unit: u });
                }
            });
            // apply learned merges in order
            state.merges.forEach(function (m) {
                var a = m.pair[0], b = m.pair[1], newId = m.newId;
                var out = [], i = 0;
                while (i < seg.length) {
                    var cur = seg[i], nxt = i < seg.length - 1 ? seg[i + 1] : null;
                    if (nxt && !cur.oov && !nxt.oov && cur.id === a && nxt.id === b) {
                        out.push({ id: newId, oov: false });
                        i += 2;
                    } else {
                        out.push(cur);
                        i += 1;
                    }
                }
                seg = out;
            });
            result.push(seg);
        });
        return result;
    }

    function oovDisplay(item) {
        if (state.mode === 'char') return item.unit;
        return formatNum(item.unit, true);
    }

    function renderNewText() {
        el.newTokenSequence.innerHTML = '';
        var text = el.newTextInput.value;
        var segments = tokenizeNewText(text);
        var nTokens = 0, nOov = 0, nChars = Array.from(text).length;

        if (segments.length === 0 || segments.every(function (s) { return s.length === 0; })) {
            var empty = document.createElement('span');
            empty.className = 'empty-stage';
            empty.textContent = 'Type some text above to tokenize it.';
            el.newTokenSequence.appendChild(empty);
            el.newStats.innerHTML = '';
            return;
        }

        segments.forEach(function (seg, segIdx) {
            if (segIdx > 0 && state.pretokenize) {
                var gap = document.createElement('span');
                gap.className = 'segment-gap';
                gap.textContent = '␣';
                el.newTokenSequence.appendChild(gap);
            }
            seg.forEach(function (item) {
                nTokens++;
                var chip = document.createElement('span');
                chip.className = 'token-chip';
                if (item.oov) {
                    chip.classList.add('oov');
                    chip.textContent = oovDisplay(item);
                    chip.title = 'out of vocabulary — not seen during training';
                    nOov++;
                } else {
                    var tok = state.vocab[item.id];
                    if (tok.kind === 'merged') chip.classList.add('merged');
                    chip.textContent = tokenDisplay(tok);
                    if (state.mode === 'byte') {
                        chip.title = 'id ' + formatNum(tok.id, false) + '  ·  ' + tokenContent(tok);
                    } else if (tok.kind === 'merged') {
                        chip.title = 'id ' + formatNum(tok.id, false) + '  ·  ' + tok.units.join('');
                    }
                }
                el.newTokenSequence.appendChild(chip);
            });
        });

        el.newStats.innerHTML = '<strong>' + nTokens + '</strong> tokens &middot; ' +
            '<strong>' + nChars + '</strong> characters' +
            (nOov ? ' &middot; <span class="oov-count">' + nOov + ' out-of-vocabulary</span>' : '');
    }

    // ── Mode switching ────────────────────────────────────────────────
    function setMode(mode) {
        if (mode === state.mode) return;
        state.mode = mode;
        el.modeBtns.forEach(function (btn) {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        initFromText();
    }

    function setBase(base) {
        base = parseInt(base, 10) || 10;
        if (base === state.base) return;
        state.base = base;
        el.baseSelect.value = String(base);
        render();
    }

    // ── Helpers ───────────────────────────────────────────────────────
    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ── Bind events ──────────────────────────────────────────────────
    function bindEvents() {
        el.btnReset.addEventListener('click', initFromText);
        el.btnPrev.addEventListener('click', previousMerge);
        el.btnNext.addEventListener('click', function () { nextMerge(); });
        el.btnAuto.addEventListener('click', toggleAuto);
        el.pretokenToggle.addEventListener('change', initFromText);
        el.infoTabs.forEach(function (tab) {
            tab.addEventListener('click', function () { switchInfoTab(tab.dataset.info); });
        });
        el.modeBtns.forEach(function (btn) {
            btn.addEventListener('click', function () { setMode(btn.dataset.mode); });
        });
        el.baseSelect.addEventListener('change', function () { setBase(this.value); });
        // Re-init when text changes (debounced)
        var t;
        el.textInput.addEventListener('input', function () {
            clearTimeout(t);
            t = setTimeout(initFromText, 400);
        });
        el.maxMerges.addEventListener('change', function () { renderStep(); updateButtons(); });
        var nt;
        el.newTextInput.addEventListener('input', function () {
            clearTimeout(nt);
            nt = setTimeout(renderNewText, 200);
        });
    }

    function switchInfoTab(name) {
        el.infoTabs.forEach(function (tab) {
            tab.classList.toggle('active', tab.dataset.info === name);
        });
        el.infoPanels.forEach(function (panel) {
            panel.classList.toggle('active', panel.id === name + 'Panel');
        });
    }

    // ── Boot ──────────────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', function () {
        cacheDom();
        bindEvents();
        initFromText();
    });
})();
