(function () {
    'use strict';

    // ── State ────────────────────────────────────────────────────────
    var state = {
        mode: 'char',        // 'char' | 'byte'
        text: '',
        pretokenize: true,   // split on whitespace before BPE
        segments: [],        // array of segments; each segment is an array of token ids
        vocab: [],           // array of { id, units, kind }
        idOfUnit: {},        // map from unit-key -> id  (for base vocab)
        merges: [],          // list of { step, pair:[id,id], newId, count }
        autoTimer: null
    };

    var DEFAULT_TEXT_CHAR = 'the cat sat on the mat the cat';
    var DEFAULT_TEXT_BYTE = '你好世界！hello 世界';

    // ── DOM refs ──────────────────────────────────────────────────────
    var el = {};

    function cacheDom() {
        el.textInput = document.getElementById('textInput');
        el.btnReset = document.getElementById('btnReset');
        el.btnPrev = document.getElementById('btnPrev');
        el.btnNext = document.getElementById('btnNext');
        el.btnAuto = document.getElementById('btnAuto');
        el.vocabCap = document.getElementById('vocabCap');
        el.tokenSequence = document.getElementById('tokenSequence');
        el.statsLine = document.getElementById('statsLine');
        el.pairTableBody = document.getElementById('pairTableBody');
        el.vocabTableBody = document.getElementById('vocabTableBody');
        el.mergeHistory = document.getElementById('mergeHistory');
        el.modeBtns = document.querySelectorAll('.mode-btn');
        el.pretokenToggle = document.getElementById('pretokenToggle');
        el.stepBadge = document.getElementById('stepBadge');
        el.stepDesc = document.getElementById('stepDesc');
        el.infoTabs = document.querySelectorAll('.info-tab');
        el.infoPanels = document.querySelectorAll('.info-panel');
        el.newTextInput = document.getElementById('newTextInput');
        el.newTokenSequence = document.getElementById('newTokenSequence');
        el.newStats = document.getElementById('newStats');
    }

    // ── Byte display map (GPT-2 style) ───────────────────────────────
    function byteLabel(b) {
        if (b === 0x20) return '␣';
        if (b >= 0x21 && b <= 0x7E) return String.fromCharCode(b);
        return '0x' + b.toString(16).toUpperCase().padStart(2, '0');
    }

    function tryDecodeUtf8(bytes) {
        try {
            var u8 = new Uint8Array(bytes);
            var dec = new TextDecoder('utf-8', { fatal: true });
            return dec.decode(u8);
        } catch (e) {
            return null;
        }
    }

    function tokenDisplay(token) {
        if (state.mode === 'char') {
            return token.units.join('');
        } else {
            var decoded = tryDecodeUtf8(token.units);
            if (decoded !== null && decoded.length > 0) {
                return decoded.replace(/ /g, '␣');
            }
            return token.units.map(byteLabel).join(' ');
        }
    }

    function tokenHex(token) {
        if (state.mode === 'char') return '';
        return token.units.map(function (b) {
            return b.toString(16).toUpperCase().padStart(2, '0');
        }).join(' ');
    }

    // ── Init ──────────────────────────────────────────────────────────
    function initFromText() {
        state.segments = [];
        state.vocab = [];
        state.idOfUnit = {};
        state.merges = [];
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
                    var b = u8[i];
                    var key = 'b:' + b;
                    if (!(key in state.idOfUnit)) {
                        var id = state.vocab.length;
                        state.vocab.push({ id: id, units: [b], kind: 'base' });
                        state.idOfUnit[key] = id;
                    }
                    segIds.push(state.idOfUnit[key]);
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
        var cap = parseInt(el.vocabCap.value, 10) || 50;
        if (state.vocab.length >= cap) {
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
        renderTokens();
        renderPairs();
        renderVocab();
        renderHistory();
        renderStats();
        renderNewText();
        updateButtons();
    }

    // Step indicator + dynamic Next button label
    function renderStep() {
        var n = state.merges.length;
        el.stepBadge.textContent = 'Step ' + n;
        var pairs = countPairs();
        var cap = parseInt(el.vocabCap.value, 10) || 50;
        var atCap = state.vocab.length >= cap;
        var noPairs = pairs.length === 0;

        if (n === 0) {
            el.stepBadge.classList.add('done');
            el.stepDesc.innerHTML = 'Press “Next Merge” to begin training.';
        } else if (noPairs || atCap) {
            el.stepBadge.classList.add('done');
            var reason = atCap ? 'vocab cap reached' : 'no more pairs to merge';
            el.stepDesc.innerHTML = 'Done after ' + n + ' merge' + (n > 1 ? 's' : '') + ' (' + reason + ').';
        } else {
            el.stepBadge.classList.remove('done');
            var last = state.merges[state.merges.length - 1];
            var aTok = state.vocab[last.pair[0]];
            var bTok = state.vocab[last.pair[1]];
            var resTok = state.vocab[last.newId];
            el.stepDesc.innerHTML =
                'Last merge: <code>' + escapeHtml(tokenDisplay(aTok)) + '</code> + ' +
                '<code>' + escapeHtml(tokenDisplay(bTok)) + '</code> ' +
                '<span class="merge-arrow">&rarr;</span> ' +
                '<code>' + escapeHtml(tokenDisplay(resTok)) + '</code>' +
                '<span class="count-pill-inline">×' + last.count + '</span>';
        }

        // Dynamic Next button: preview the upcoming merge
        if (noPairs || atCap) {
            el.btnNext.textContent = 'Next Merge →';
            el.btnNext.disabled = true;
        } else {
            var top = pairs[0];
            var ta = state.vocab[top.a], tb = state.vocab[top.b];
            var merged = tokenDisplay(ta) + tokenDisplay(tb);
            el.btnNext.innerHTML = 'Merge ' + escapeHtml(tokenDisplay(ta)) + '+' +
                escapeHtml(tokenDisplay(tb)) + ' &rarr;';
            el.btnNext.title = 'Merge "' + tokenDisplay(ta) + '" + "' + tokenDisplay(tb) +
                '" into "' + merged + '" (count: ' + top.count + ')';
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
                if (state.mode === 'byte') {
                    var hex = tokenHex(tok);
                    if (hex) chip.title = hex;
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
            var pairStr = tokenDisplay(aTok) + ' + ' + tokenDisplay(bTok);
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
            var disp = tokenDisplay(tok);
            var typeCell = tok.kind === 'base'
                ? '<span class="tag base">base</span>'
                : '<span class="tag merged">merged</span>';
            var hex = state.mode === 'byte' ? '<div class="hex-hint">' + tokenHex(tok) + '</div>' : '';
            tr.innerHTML =
                '<td>' + tok.id + '</td>' +
                '<td class="vocab-cell">' + escapeHtml(disp) + hex + '</td>' +
                '<td>' + typeCell + '</td>';
            el.vocabTableBody.appendChild(tr);
        });
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
            var aStr = aTok ? tokenDisplay(aTok) : '?';
            var bStr = bTok ? tokenDisplay(bTok) : '?';
            var li = document.createElement('li');
            li.innerHTML =
                '<span class="step-num">' + m.step + '.</span> ' +
                '<code>' + escapeHtml(aStr) + '</code> + ' +
                '<code>' + escapeHtml(bStr) + '</code> &rarr; ' +
                '<code class="merged-result">' + escapeHtml(tokenDisplay(state.vocab[m.newId])) + '</code> ' +
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
        var cap = parseInt(el.vocabCap.value, 10) || 50;
        el.btnNext.disabled = pairs.length === 0 || state.vocab.length >= cap;
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
        return byteLabel(item.unit);
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
                        var hex = tokenHex(tok);
                        if (hex) chip.title = hex;
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
        var prev = el.textInput.value;
        if (prev === DEFAULT_TEXT_CHAR || prev === DEFAULT_TEXT_BYTE) {
            el.textInput.value = mode === 'char' ? DEFAULT_TEXT_CHAR : DEFAULT_TEXT_BYTE;
        }
        el.modeBtns.forEach(function (btn) {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        initFromText();
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
        // Re-init when text changes (debounced)
        var t;
        el.textInput.addEventListener('input', function () {
            clearTimeout(t);
            t = setTimeout(initFromText, 400);
        });
        el.vocabCap.addEventListener('change', function () { renderStep(); updateButtons(); });
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
