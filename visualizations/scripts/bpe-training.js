(function () {
    'use strict';

    // ── State ────────────────────────────────────────────────────────
    var state = {
        mode: 'char',        // 'char' | 'byte'
        text: '',
        tokens: [],          // array of token ids
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
        state.tokens = [];
        state.vocab = [];
        state.idOfUnit = {};
        state.merges = [];
        stopAuto();

        var text = el.textInput.value;

        if (state.mode === 'char') {
            var chars = Array.from(text);
            chars.forEach(function (ch) {
                var key = 'c:' + ch;
                if (!(key in state.idOfUnit)) {
                    var id = state.vocab.length;
                    state.vocab.push({ id: id, units: [ch], kind: 'base' });
                    state.idOfUnit[key] = id;
                }
                state.tokens.push(state.idOfUnit[key]);
            });
        } else {
            var u8 = new TextEncoder().encode(text);
            for (var i = 0; i < u8.length; i++) {
                var b = u8[i];
                var key = 'b:' + b;
                if (!(key in state.idOfUnit)) {
                    var id = state.vocab.length;
                    state.vocab.push({ id: id, units: [b], kind: 'base' });
                    state.idOfUnit[key] = id;
                }
                state.tokens.push(state.idOfUnit[key]);
            }
        }
        render();
    }

    // ── Pair counting ─────────────────────────────────────────────────
    function countPairs() {
        var counts = {};
        for (var i = 0; i < state.tokens.length - 1; i++) {
            var a = state.tokens[i];
            var b = state.tokens[i + 1];
            var key = a + ',' + b;
            if (!counts[key]) counts[key] = { a: a, b: b, count: 0 };
            counts[key].count++;
        }
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
        var newTokens = [];
        var i = 0;
        while (i < state.tokens.length) {
            if (i < state.tokens.length - 1 &&
                state.tokens[i] === top.a && state.tokens[i + 1] === top.b) {
                newTokens.push(newId);
                i += 2;
            } else {
                newTokens.push(state.tokens[i]);
                i += 1;
            }
        }
        state.tokens = newTokens;
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
        var newTokens = [];
        for (var i = 0; i < state.tokens.length; i++) {
            if (state.tokens[i] === newId) {
                newTokens.push(a);
                newTokens.push(b);
            } else {
                newTokens.push(state.tokens[i]);
            }
        }
        state.tokens = newTokens;
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
        renderTokens();
        renderPairs();
        renderVocab();
        renderHistory();
        renderStats();
        updateButtons();
    }

    function renderTokens() {
        el.tokenSequence.innerHTML = '';
        var pairs = countPairs();
        var topPair = pairs.length ? pairs[0] : null;

        var highlightIdx = new Set();
        if (topPair) {
            for (var i = 0; i < state.tokens.length - 1; i++) {
                if (state.tokens[i] === topPair.a && state.tokens[i + 1] === topPair.b) {
                    highlightIdx.add(i);
                    highlightIdx.add(i + 1);
                }
            }
        }

        state.tokens.forEach(function (id, idx) {
            var tok = state.vocab[id];
            var chip = document.createElement('span');
            chip.className = 'token-chip';
            if (tok.kind === 'merged') chip.classList.add('merged');
            if (highlightIdx.has(idx)) chip.classList.add('next-merge');
            chip.textContent = tokenDisplay(tok);
            if (state.mode === 'byte') {
                var hex = tokenHex(tok);
                if (hex) chip.title = hex;
            }
            el.tokenSequence.appendChild(chip);
        });
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

    function renderStats() {
        var nTokens = state.tokens.length;
        var nVocab = state.vocab.length;
        var nMerges = state.merges.length;
        var nChars = Array.from(el.textInput.value).length;
        el.statsLine.innerHTML =
            '<strong>' + nTokens + '</strong> tokens &middot; ' +
            '<strong>' + nVocab + '</strong> vocab size &middot; ' +
            '<strong>' + nMerges + '</strong> merges &middot; ' +
            '<strong>' + nChars + '</strong> characters in input';
    }

    function updateButtons() {
        el.btnPrev.disabled = state.merges.length === 0;
        var pairs = countPairs();
        var cap = parseInt(el.vocabCap.value, 10) || 50;
        el.btnNext.disabled = pairs.length === 0 || state.vocab.length >= cap;
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
        el.modeBtns.forEach(function (btn) {
            btn.addEventListener('click', function () { setMode(btn.dataset.mode); });
        });
        // Re-init when text changes (debounced)
        var t;
        el.textInput.addEventListener('input', function () {
            clearTimeout(t);
            t = setTimeout(initFromText, 400);
        });
        el.vocabCap.addEventListener('change', updateButtons);
    }

    // ── Boot ──────────────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', function () {
        cacheDom();
        bindEvents();
        initFromText();
    });
})();
