(function () {
    'use strict';

    var DEFAULT_COLUMNS = ['的', '了', '是', '他', '有'];
    var DEFAULT_DATA = [
        [320, 110, 45, 55, 70],
        [85,  60,  28, 18, 22],
        [250, 150,  35, 48, 60],
        [140, 52,  44, 28, 35],
        [410, 145, 35, 72, 88],
        [180, 65,  55, 34, 42],
    ];
    var DEFAULT_TOTAL_WORDS = [4800, 1500, 4000, 2200, 6200, 2800];
    var DEFAULT_DOC_NAMES = ['Doc A', 'Doc B', 'Doc C', 'Doc D', 'Doc E', 'Doc F'];

    var METRIC_INFO = {
        manhattan: {
            label: 'Manhattan Distance (Classic Delta)',
            desc: 'Sum of absolute z-score differences. Treats every deviation linearly, so a single outlier word cannot dominate the result — the aggregate signal of many words "outvotes" noise.',
            formula: '$$d(\\mathbf{a},\\mathbf{b}) = \\sum_{j=1}^{p} |a_j - b_j|$$',
            isSimilarity: false
        },
        euclidean: {
            label: 'Euclidean Distance',
            desc: 'Square root of summed squared differences. Squaring penalizes large deviations disproportionately, making it sensitive to outlier words — one unusual word can dominate the entire calculation.',
            formula: '$$d(\\mathbf{a},\\mathbf{b}) = \\sqrt{\\sum_{j=1}^{p} (a_j - b_j)^2}$$',
            isSimilarity: false
        },
        cosine: {
            label: 'Cosine Distance (Cosine Delta)',
            desc: 'One minus the cosine similarity — measures how different the directions of two z-score vectors are. Focuses on proportional word-usage patterns, and research (Evert et al., 2017) shows it often outperforms Manhattan Delta on longer feature lists.',
            formula: '$$d(\\mathbf{a},\\mathbf{b}) = 1 - \\frac{\\sum_j a_j b_j}{\\sqrt{\\sum_j a_j^2}\\;\\sqrt{\\sum_j b_j^2}}$$',
            isSimilarity: false
        },
        burrows: {
            label: "Burrows' Delta",
            desc: 'The average absolute z-score difference — identical to Manhattan distance divided by the number of features. This is the original formulation from Burrows (2002), the "gold standard" baseline in stylometry.',
            formula: '$$\\Delta(\\mathbf{a},\\mathbf{b}) = \\frac{1}{p}\\sum_{j=1}^{p} |a_j - b_j|$$',
            isSimilarity: false
        }
    };

    var columns, data, totalWords, docNames;
    var ghostColActive, ghostRowActive, showingOriginal, currentMetric;

    function init() {
        currentMetric = 'manhattan';
        resetToDefaults();
        bindEvents();
    }

    function resetToDefaults() {
        columns = DEFAULT_COLUMNS.slice();
        data = DEFAULT_DATA.map(function (r) { return r.slice(); });
        totalWords = DEFAULT_TOTAL_WORDS.slice();
        docNames = DEFAULT_DOC_NAMES.slice();
        ghostColActive = false;
        ghostRowActive = false;
        showingOriginal = false;
        renderRawTable();
    }

    function hideAllDownstream() {
        document.getElementById('step2Section').classList.add('hidden');
        document.getElementById('step3Section').classList.add('hidden');
        document.getElementById('step4Section').classList.add('hidden');
        closeMeanStdCalc();
    }

    function bindEvents() {
        document.getElementById('btnResetData').addEventListener('click', function () {
            resetToDefaults();
            hideAllDownstream();
        });
        document.getElementById('btnToStep2').addEventListener('click', function () { showStep2(false); });
        document.getElementById('btnToStep3').addEventListener('click', function () { showStep3(false); });
        document.getElementById('btnToStep4').addEventListener('click', function () { showStep4(false); });
        document.getElementById('btnToggleOriginal').addEventListener('click', toggleOriginalZScore);
        document.getElementById('btnRestart').addEventListener('click', function () {
            resetToDefaults();
            hideAllDownstream();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        document.getElementById('btnToggleCalcMeanStd').addEventListener('click', toggleMeanStdCalc);
        document.getElementById('metricSelect').addEventListener('change', function () {
            currentMetric = this.value;
            renderStep4(true);
        });
    }

    // ── Toggle helpers ───────────────────────────────────────────────
    function toggleMeanStdCalc() {
        var container = document.getElementById('calcDetailsMeanStd');
        var btn = document.getElementById('btnToggleCalcMeanStd');
        if (container.classList.contains('open')) {
            container.classList.remove('open');
            btn.textContent = 'Show detailed calculations \u25B8';
        } else {
            container.classList.add('open');
            btn.textContent = 'Hide detailed calculations \u25BE';
            typesetElement(container);
        }
    }

    function closeMeanStdCalc() {
        var container = document.getElementById('calcDetailsMeanStd');
        var btn = document.getElementById('btnToggleCalcMeanStd');
        container.classList.remove('open');
        btn.textContent = 'Show detailed calculations \u25B8';
    }

    function toggleOriginalZScore() {
        showingOriginal = !showingOriginal;
        document.getElementById('btnToggleOriginal').textContent =
            showingOriginal ? 'Show z-scores' : 'Show normalized values';
        renderStep3Table();
    }

    // ── Ghost column ─────────────────────────────────────────────────
    function activateGhostCol() {
        if (ghostColActive) return;
        ghostColActive = true;
        renderRawTable();
        var hi = document.getElementById('rawDataTable').querySelector('.ghost-header-input');
        if (hi) hi.focus();
    }

    function deactivateGhostCol() {
        if (!ghostColActive) return;
        var hi = document.getElementById('rawDataTable').querySelector('.ghost-header-input');
        var word = hi ? hi.value.trim() : '';
        if (word && !columns.includes(word)) {
            var inputs = document.getElementById('rawDataTable').querySelectorAll('.ghost-col-data');
            columns.push(word);
            for (var i = 0; i < data.length; i++) {
                var v = inputs[i] ? parseFloat(inputs[i].value) : 0;
                data[i].push(isNaN(v) ? 0 : v);
            }
        }
        ghostColActive = false;
        renderRawTable();
        refreshDownstream();
    }

    function removeColumn(colIdx) {
        if (columns.length <= 2) return;
        columns.splice(colIdx, 1);
        for (var i = 0; i < data.length; i++) data[i].splice(colIdx, 1);
        renderRawTable();
        refreshDownstream();
    }

    // ── Ghost row ────────────────────────────────────────────────────
    function activateGhostRow() {
        if (ghostRowActive) return;
        ghostRowActive = true;
        renderRawTable();
        var ni = document.getElementById('rawDataTable').querySelector('.ghost-row-name');
        if (ni) ni.focus();
    }

    function deactivateGhostRow() {
        if (!ghostRowActive) return;
        var ni = document.getElementById('rawDataTable').querySelector('.ghost-row-name');
        var name = ni ? ni.value.trim() : '';
        if (name) {
            var inputs = document.getElementById('rawDataTable').querySelectorAll('.ghost-row-data');
            var row = [];
            for (var i = 0; i < columns.length; i++) {
                var v = inputs[i] ? parseFloat(inputs[i].value) : 0;
                row.push(isNaN(v) ? 0 : v);
            }
            var tw = document.getElementById('rawDataTable').querySelector('.ghost-row-total');
            var twVal = tw ? parseFloat(tw.value) : 1000;
            docNames.push(name);
            data.push(row);
            totalWords.push(isNaN(twVal) || twVal <= 0 ? 1000 : twVal);
        }
        ghostRowActive = false;
        renderRawTable();
        refreshDownstream();
    }

    function removeRow(rIdx) {
        if (data.length <= 2) return;
        data.splice(rIdx, 1);
        docNames.splice(rIdx, 1);
        totalWords.splice(rIdx, 1);
        renderRawTable();
        refreshDownstream();
    }

    function refreshDownstream() {
        if (!document.getElementById('step2Section').classList.contains('hidden')) showStep2(true);
        if (!document.getElementById('step3Section').classList.contains('hidden')) showStep3(true);
        if (!document.getElementById('step4Section').classList.contains('hidden')) showStep4(true);
    }

    // ── Read data from table inputs ──────────────────────────────────
    function readDataFromInputs() {
        var rows = document.getElementById('rawDataTable').querySelectorAll(
            'tbody tr:not(.ghost-row-trigger):not(.ghost-row-active)');
        rows.forEach(function (row, rIdx) {
            if (rIdx >= data.length) return;
            row.querySelectorAll('input.data-input').forEach(function (inp, cIdx) {
                if (cIdx >= columns.length) return;
                var v = parseFloat(inp.value);
                data[rIdx][cIdx] = isNaN(v) ? 0 : v;
            });
            var twInp = row.querySelector('input.total-input');
            if (twInp) {
                var tw = parseFloat(twInp.value);
                totalWords[rIdx] = (isNaN(tw) || tw <= 0) ? 1 : tw;
            }
        });
    }

    // ── Math helpers ─────────────────────────────────────────────────
    function computeNormalized() {
        return data.map(function (row, rIdx) {
            var tw = totalWords[rIdx];
            return row.map(function (val) { return tw === 0 ? 0 : val / tw; });
        });
    }

    function computeMeans(nd) {
        var n = nd.length;
        return columns.map(function (_, c) {
            var s = 0; for (var i = 0; i < n; i++) s += nd[i][c]; return s / n;
        });
    }

    function computeStdDevs(nd, means) {
        var n = nd.length;
        return columns.map(function (_, c) {
            var s = 0;
            for (var i = 0; i < n; i++) { var d = nd[i][c] - means[c]; s += d * d; }
            return Math.sqrt(s / n);
        });
    }

    function computeZScores(nd, means, stdDevs) {
        return nd.map(function (row) {
            return row.map(function (val, c) {
                return stdDevs[c] === 0 ? 0 : (val - means[c]) / stdDevs[c];
            });
        });
    }

    // ── Distance / similarity metrics ────────────────────────────────
    function manhattanDist(a, b) {
        var s = 0; for (var i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]); return s;
    }

    function euclideanDist(a, b) {
        var s = 0; for (var i = 0; i < a.length; i++) { var d = a[i] - b[i]; s += d * d; }
        return Math.sqrt(s);
    }

    function cosineDist(a, b) {
        var dot = 0, na = 0, nb = 0;
        for (var i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
        var den = Math.sqrt(na) * Math.sqrt(nb);
        return den === 0 ? 1 : 1 - dot / den;
    }

    function burrowsDelta(a, b) {
        var p = a.length;
        return p === 0 ? 0 : manhattanDist(a, b) / p;
    }

    function computeMatrix(zScores, metric) {
        var n = zScores.length, mat = [];
        var fn = metric === 'manhattan' ? manhattanDist
               : metric === 'euclidean' ? euclideanDist
               : metric === 'cosine'    ? cosineDist
               : burrowsDelta;
        for (var i = 0; i < n; i++) {
            mat[i] = [];
            for (var j = 0; j < n; j++) mat[i][j] = fn(zScores[i], zScores[j]);
        }
        return mat;
    }

    // ── Render raw data table (Step 1) ───────────────────────────────
    function renderRawTable() {
        var table = document.getElementById('rawDataTable');
        var totalCols = columns.length + 3;
        var html = '<thead><tr><th>Document</th>';
        columns.forEach(function (col, cIdx) {
            html += '<th><input type="text" class="col-name-input" value="' + escAttr(col) + '" data-col="' + cIdx + '">';
            if (columns.length > 2) html += '<button class="remove-col-btn" data-col="' + cIdx + '" title="Remove column">\u2715</button>';
            html += '</th>';
        });
        html += ghostColActive
            ? '<th class="ghost-col active"><input type="text" class="ghost-header-input" placeholder="word\u2026"></th>'
            : '<th class="ghost-col">+ add<br>column</th>';
        html += '<th class="total-col">Total<br>Words</th>';
        html += '</tr></thead><tbody>';

        data.forEach(function (row, rIdx) {
            html += '<tr>';
            html += '<td class="doc-label"><input type="text" class="doc-name-input" value="' + escAttr(docNames[rIdx]) + '" data-row="' + rIdx + '">';
            if (data.length > 2) html += '<button class="remove-row-btn" data-row="' + rIdx + '" title="Remove document">\u2715</button>';
            html += '</td>';
            row.forEach(function (val, cIdx) {
                html += '<td><input type="number" class="data-input" value="' + val + '" data-r="' + rIdx + '" data-c="' + cIdx + '" min="0" max="99999"></td>';
            });
            html += ghostColActive
                ? '<td class="ghost-col active"><input type="number" class="ghost-col-data" value="0" min="0" max="99999"></td>'
                : '<td class="ghost-col"></td>';
            html += '<td class="total-col"><input type="number" class="total-input" value="' + totalWords[rIdx] + '" data-row="' + rIdx + '" min="1" max="999999"></td>';
            html += '</tr>';
        });

        if (ghostRowActive) {
            html += '<tr class="ghost-row-active">';
            html += '<td class="doc-label"><input type="text" class="ghost-row-name" placeholder="Doc name\u2026"></td>';
            columns.forEach(function () {
                html += '<td><input type="number" class="ghost-row-data" value="0" min="0" max="99999"></td>';
            });
            html += '<td class="ghost-col"></td>';
            html += '<td class="total-col"><input type="number" class="ghost-row-total" value="1000" min="1" max="999999"></td>';
            html += '</tr>';
        } else {
            html += '<tr class="ghost-row-trigger"><td class="ghost-col" colspan="' + totalCols + '">+ add document</td></tr>';
        }
        html += '</tbody>';
        table.innerHTML = html;
        wireTableEvents();
    }

    function wireTableEvents() {
        var table = document.getElementById('rawDataTable');
        table.querySelectorAll('.col-name-input').forEach(function (inp) {
            inp.addEventListener('change', function () {
                var idx = parseInt(this.dataset.col), v = this.value.trim();
                if (v && v !== columns[idx]) { columns[idx] = v; refreshDownstream(); }
            });
        });
        table.querySelectorAll('.doc-name-input').forEach(function (inp) {
            inp.addEventListener('change', function () {
                var idx = parseInt(this.dataset.row), v = this.value.trim();
                if (v) { docNames[idx] = v; refreshDownstream(); }
            });
        });
        table.querySelectorAll('.remove-col-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) { e.stopPropagation(); removeColumn(parseInt(this.dataset.col)); });
        });
        table.querySelectorAll('.remove-row-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) { e.stopPropagation(); removeRow(parseInt(this.dataset.row)); });
        });
        table.querySelectorAll('input.data-input, input.total-input').forEach(function (inp) {
            inp.addEventListener('change', function () { readDataFromInputs(); refreshDownstream(); });
        });
        if (!ghostColActive) {
            table.querySelectorAll('thead .ghost-col, tbody tr:not(.ghost-row-trigger):not(.ghost-row-active) .ghost-col').forEach(function (cell) {
                cell.addEventListener('click', function (e) { e.stopPropagation(); activateGhostCol(); });
            });
        } else {
            wireGhostBlur('.ghost-header-input', '.ghost-col-data', deactivateGhostCol, function () { ghostColActive = false; renderRawTable(); });
        }
        if (!ghostRowActive) {
            var trigger = table.querySelector('.ghost-row-trigger');
            if (trigger) trigger.addEventListener('click', function (e) { e.stopPropagation(); activateGhostRow(); });
        } else {
            wireGhostBlur('.ghost-row-name', '.ghost-row-data,.ghost-row-total', deactivateGhostRow, function () { ghostRowActive = false; renderRawTable(); });
        }
    }

    function wireGhostBlur(nameSelector, dataSelector, commitFn, cancelFn) {
        var table = document.getElementById('rawDataTable');
        var inputs = table.querySelectorAll(nameSelector + ', ' + dataSelector);
        inputs.forEach(function (inp) {
            inp.addEventListener('blur', function () {
                setTimeout(function () {
                    var a = document.activeElement;
                    if (a && (a.matches(nameSelector) || a.matches(dataSelector))) return;
                    commitFn();
                }, 100);
            });
            inp.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') commitFn();
                else if (e.key === 'Escape') cancelFn();
            });
        });
    }

    // ── Step 2: Normalize + Mean/Std ─────────────────────────────────
    function showStep2(skipScroll) {
        readDataFromInputs();
        var section = document.getElementById('step2Section');
        section.classList.remove('hidden');
        renderNormTable();
        renderStep2FormulaExample();
        updateMeanStdCalcDetails();
        if (!skipScroll && section.dataset.seen !== 'true') {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            section.dataset.seen = 'true';
        }
        typesetElement(section);
    }

    function renderNormTable() {
        var nd = computeNormalized();
        var means = computeMeans(nd), stdDevs = computeStdDevs(nd, means);
        var table = document.getElementById('normTable');
        var html = '<thead><tr><th>Document</th>';
        columns.forEach(function (col) { html += '<th>' + escHtml(col) + '</th>'; });
        html += '</tr></thead><tbody>';
        nd.forEach(function (row, rIdx) {
            html += '<tr><td class="doc-label">' + escHtml(docNames[rIdx]) + '</td>';
            row.forEach(function (val) { html += '<td>' + fmtNum(val, 4) + '</td>'; });
            html += '</tr>';
        });
        html += '<tr class="mean-row"><td class="stat-label">\u03BC (mean)</td>';
        means.forEach(function (m) { html += '<td>' + fmtNum(m, 4) + '</td>'; });
        html += '</tr>';
        html += '<tr class="std-row"><td class="stat-label">\u03C3 (std dev)</td>';
        stdDevs.forEach(function (s) { html += '<td>' + fmtNum(s, 4) + '</td>'; });
        html += '</tr>';
        html += '</tbody>';
        table.innerHTML = html;
    }

    function renderStep2FormulaExample() {
        var col = escHtml(columns[0]), doc = escHtml(docNames[0]);
        var raw = data[0][0], tw = totalWords[0];
        var freq = tw === 0 ? 0 : raw / tw;
        var nd = computeNormalized();
        var means = computeMeans(nd), stdDevs = computeStdDevs(nd, means);

        var html = '';
        // Left: formulas
        html += '<div class="math-section"><h4>Formulas</h4><div class="math-content">';
        html += '<p style="font-size:0.85rem;margin-bottom:0.25rem"><strong>Relative frequency:</strong></p>';
        html += '<div class="math-formula">$$f_{ij} = \\frac{\\text{count}_{ij}}{\\text{total words}_i}$$</div>';
        html += '<p style="font-size:0.85rem;margin-bottom:0.25rem;margin-top:0.75rem"><strong>Mean</strong> &amp; <strong>Std Dev</strong> per column:</p>';
        html += '<div class="math-formula">$$\\mu_j = \\frac{1}{n}\\sum_{i=1}^{n} f_{ij} \\qquad \\sigma_j = \\sqrt{\\frac{1}{n}\\sum_{i=1}^{n}(f_{ij}-\\mu_j)^2}$$</div>';
        html += '</div></div>';

        // Right: example
        html += '<div class="calc-detail" style="display:flex;flex-direction:column;justify-content:center">';
        html += '<div><strong>Example:</strong></div>';
        html += '<div>' + doc + ', <span class="col-name">\u201C' + col + '\u201D</span></div>';
        html += '<div style="margin:0.25rem 0">$$f = \\frac{' + fmtNum(raw) + '}{' + fmtNum(tw) + '} = ' + fmtNum(freq, 4) + '$$</div>';
        html += '<div style="margin:0.25rem 0">$$\\mu = ' + fmtNum(means[0], 4) + ' \\qquad \\sigma = ' + fmtNum(stdDevs[0], 4) + '$$</div>';
        html += '</div>';

        document.getElementById('step2FormulaExample').innerHTML = html;
    }

    function updateMeanStdCalcDetails() {
        readDataFromInputs();
        var nd = computeNormalized();
        var means = computeMeans(nd), stdDevs = computeStdDevs(nd, means);
        var container = document.getElementById('calcDetailsMeanStd');
        var n = nd.length, html = '';
        columns.forEach(function (col, cIdx) {
            var vals = nd.map(function (r) { return r[cIdx]; });
            var sum = vals.reduce(function (a, b) { return a + b; }, 0);
            var mean = means[cIdx];
            var diffs = vals.map(function (v) { return v - mean; });
            var sumSq = diffs.reduce(function (s, d) { return s + d * d; }, 0);
            html += '<div class="calc-detail"><span class="col-name">\u201C' + escHtml(col) + '\u201D</span>';
            var valsStr = vals.map(function (v) { return fmtNum(v, 4); }).join('+');
            html += '<div style="margin:0.25rem 0">$$\\mu = \\frac{' + valsStr + '}{' + n + '} = \\frac{' + fmtNum(sum, 4) + '}{' + n + '} = ' + fmtNum(mean, 4) + '$$</div>';
            var dt = diffs.map(function (d) { return '(' + fmtNum(d, 4) + ')^2'; }).join('+');
            html += '<div style="margin:0.25rem 0">$$\\sigma = \\sqrt{\\frac{' + dt + '}{' + n + '}} = \\sqrt{\\frac{' + fmtNum(sumSq, 4) + '}{' + n + '}} = \\sqrt{' + fmtNum(sumSq / n, 4) + '} = ' + fmtNum(stdDevs[cIdx], 4) + '$$</div></div>';
        });
        container.innerHTML = html;
        if (container.classList.contains('open')) typesetElement(container);
    }

    // ── Step 3: Z-Scores ─────────────────────────────────────────────
    function showStep3(skipScroll) {
        readDataFromInputs();
        var section = document.getElementById('step3Section');
        section.classList.remove('hidden');
        renderStep3FormulaExample();
        renderStep3Table();
        if (!skipScroll && section.dataset.seen !== 'true') {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            section.dataset.seen = 'true';
        }
        typesetElement(section);
    }

    function renderStep3FormulaExample() {
        var nd = computeNormalized();
        var means = computeMeans(nd), stdDevs = computeStdDevs(nd, means);
        var col = escHtml(columns[0]), doc = escHtml(docNames[0]);
        var val = nd[0][0], mean = means[0], std = stdDevs[0];
        var z = std === 0 ? 0 : (val - mean) / std;

        var html = '';
        // Left: formula
        html += '<div class="math-section"><h4>The Z-Score Formula</h4><div class="math-content">';
        html += '<div class="math-formula">$$z_{ij} = \\frac{f_{ij} - \\mu_j}{\\sigma_j}$$</div>';
        html += '<p style="font-size:0.85rem;color:#555">Subtract the column mean, then divide by the column standard deviation. This <strong>centers</strong> the data (mean &rarr; 0) and <strong>rescales</strong> it (std dev &rarr; 1).</p>';
        html += '</div></div>';

        // Right: example
        html += '<div class="calc-detail" style="display:flex;flex-direction:column;justify-content:center">';
        html += '<div><strong>Example:</strong></div>';
        html += '<div>' + doc + ', <span class="col-name">\u201C' + col + '\u201D</span></div>';
        html += '<div style="margin:0.25rem 0">$$z = \\frac{' + fmtNum(val, 4) + ' - ' + fmtNum(mean, 4) + '}{' + fmtNum(std, 4) + '} = \\frac{' + fmtNum(val - mean, 4) + '}{' + fmtNum(std, 4) + '} = ' + fmtNum(z, 2) + '$$</div>';
        html += '</div>';

        document.getElementById('step3FormulaExample').innerHTML = html;
    }

    function renderStep3Table() {
        var nd = computeNormalized();
        var means = computeMeans(nd), stdDevs = computeStdDevs(nd, means);
        var zScores = computeZScores(nd, means, stdDevs);
        var table = document.getElementById('zScoreTable');
        var html = '<thead><tr><th>Document</th>';
        columns.forEach(function (col) { html += '<th>' + escHtml(col) + '</th>'; });
        html += '</tr></thead><tbody>';

        if (showingOriginal) {
            nd.forEach(function (row, rIdx) {
                html += '<tr><td class="doc-label">' + escHtml(docNames[rIdx]) + '</td>';
                row.forEach(function (val) { html += '<td>' + fmtNum(val, 4) + '</td>'; });
                html += '</tr>';
            });
            html += '<tr class="stat-row"><td class="stat-row-label">\u03BC</td>';
            means.forEach(function (m) { html += '<td>' + fmtNum(m, 4) + '</td>'; });
            html += '</tr><tr class="stat-row"><td class="stat-row-label">\u03C3</td>';
            stdDevs.forEach(function (s) { html += '<td>' + fmtNum(s, 4) + '</td>'; });
            html += '</tr>';
        } else {
            zScores.forEach(function (row, rIdx) {
                html += '<tr><td class="doc-label">' + escHtml(docNames[rIdx]) + '</td>';
                row.forEach(function (z) {
                    var cls = z > 0.005 ? 'positive' : z < -0.005 ? 'negative' : 'zero';
                    html += '<td class="' + cls + '">' + fmtNum(z, 2) + '</td>';
                });
                html += '</tr>';
            });
            html += '<tr class="stat-row"><td class="stat-row-label">\u03BC</td>';
            columns.forEach(function () { html += '<td>0.00</td>'; });
            html += '</tr><tr class="stat-row"><td class="stat-row-label">\u03C3</td>';
            columns.forEach(function () { html += '<td>1.00</td>'; });
            html += '</tr>';
        }
        html += '</tbody>';
        table.innerHTML = html;
    }

    // ── Step 4: Distance heatmap ─────────────────────────────────────
    function showStep4(skipScroll) {
        readDataFromInputs();
        var section = document.getElementById('step4Section');
        section.classList.remove('hidden');
        renderStep4(false);
        if (!skipScroll && section.dataset.seen !== 'true') {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            section.dataset.seen = 'true';
        }
    }

    function renderStep4(metricOnly) {
        var info = METRIC_INFO[currentMetric];
        document.getElementById('metricDescription').textContent = info.desc;
        document.getElementById('metricFormula').innerHTML =
            '<h4>' + info.label + '</h4><div class="math-content"><div class="math-formula">' + info.formula + '</div></div>';

        var hintDiag = document.getElementById('heatmapHintDiag');
        var hintColor = document.getElementById('heatmapHintColor');
        if (info.isSimilarity) {
            hintDiag.textContent = 'The diagonal is always 1.00 (each document is perfectly similar to itself).';
            hintColor.textContent = 'Higher values (warmer colors) mean more similar documents.';
        } else {
            hintDiag.textContent = 'The diagonal is always 0.00 (zero distance to itself).';
            hintColor.textContent = 'Lower values (cooler colors) mean more similar documents.';
        }

        renderHeatmap();
        typesetElement(document.getElementById('step4Section'));
    }

    function renderHeatmap() {
        var nd = computeNormalized();
        var means = computeMeans(nd), stdDevs = computeStdDevs(nd, means);
        var zScores = computeZScores(nd, means, stdDevs);
        var n = data.length;
        var info = METRIC_INFO[currentMetric];
        var mat = computeMatrix(zScores, currentMetric);

        // Find min/max excluding diagonal
        var minV = Infinity, maxV = -Infinity;
        for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) {
            if (i !== j) {
                if (mat[i][j] < minV) minV = mat[i][j];
                if (mat[i][j] > maxV) maxV = mat[i][j];
            }
        }

        var cols = n + 1;
        var html = '<div class="heatmap-grid" style="grid-template-columns: repeat(' + cols + ', auto);">';
        html += '<div class="heatmap-cell hm-corner"></div>';
        for (var j = 0; j < n; j++) html += '<div class="heatmap-cell hm-label">' + escHtml(docNames[j]) + '</div>';

        for (var i = 0; i < n; i++) {
            html += '<div class="heatmap-cell hm-label">' + escHtml(docNames[i]) + '</div>';
            for (var j = 0; j < n; j++) {
                var v = mat[i][j];
                var bg = heatColor(v, minV, maxV, i === j, info.isSimilarity);
                var fg = heatTextColor(v, minV, maxV, i === j, info.isSimilarity);
                html += '<div class="heatmap-cell" style="background:' + bg + ';color:' + fg + ';" title="' + escAttr(docNames[i]) + ' vs ' + escAttr(docNames[j]) + '">' + fmtNum(v, 2) + '</div>';
            }
        }
        html += '</div>';

        // Legend: blue → white → red
        html += '<div class="heatmap-legend">';
        if (info.isSimilarity) {
            html += '<span>' + fmtNum(minV, 2) + ' (least similar)</span>';
            html += '<div class="heatmap-legend-bar" style="background: linear-gradient(to right, rgb(0,0,255), rgb(255,255,255), rgb(255,0,0));"></div>';
            html += '<span>' + fmtNum(maxV, 2) + ' (most similar)</span>';
        } else {
            html += '<span>' + fmtNum(minV, 2) + ' (most similar)</span>';
            html += '<div class="heatmap-legend-bar" style="background: linear-gradient(to right, rgb(255,0,0), rgb(255,255,255), rgb(0,0,255));"></div>';
            html += '<span>' + fmtNum(maxV, 2) + ' (least similar)</span>';
        }
        html += '</div>';

        document.getElementById('heatmapContainer').innerHTML = html;
    }

    function heatColor(val, minV, maxV, isDiag, isSim) {
        if (isDiag) return '#e8e8e8';
        var range = maxV - minV;
        if (range === 0) return '#ffffff';
        // t: 0 = low value, 1 = high value
        var t = (val - minV) / range;
        // For distance metrics, flip so low distance = red (similar)
        if (!isSim) t = 1 - t;
        // Bipolar: blue (t=0) → white (t=0.5) → red (t=1)
        var r, g, b;
        if (t >= 0.5) {
            var s = (t - 0.5) * 2; // 0..1
            r = 255;
            g = Math.round(255 * (1 - s));
            b = Math.round(255 * (1 - s));
        } else {
            var s = (0.5 - t) * 2; // 0..1
            r = Math.round(255 * (1 - s));
            g = Math.round(255 * (1 - s));
            b = 255;
        }
        return 'rgb(' + r + ',' + g + ',' + b + ')';
    }

    function heatTextColor(val, minV, maxV, isDiag, isSim) {
        if (isDiag) return '#999';
        var range = maxV - minV;
        if (range === 0) return '#333';
        var t = (val - minV) / range;
        if (!isSim) t = 1 - t;
        // White text when far from center (saturated blue or red)
        return Math.abs(t - 0.5) > 0.3 ? '#fff' : '#333';
    }

    // ── Utilities ────────────────────────────────────────────────────
    function fmtNum(n, decimals) {
        if (typeof decimals === 'undefined') return Number.isInteger(n) ? String(n) : n.toFixed(2);
        return n.toFixed(decimals);
    }

    function escHtml(str) {
        var d = document.createElement('div'); d.textContent = str; return d.innerHTML;
    }

    function escAttr(str) {
        return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function typesetElement(el) {
        if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) MathJax.typesetPromise([el]);
    }

    // ── Boot ─────────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
