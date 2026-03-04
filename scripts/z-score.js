(function () {
    'use strict';

    var DEFAULT_COLUMNS = ['的', '了', '他', '喜欢', '面包'];
    var DEFAULT_DATA = [
        [80, 30, 12, 6, 1],
        [50, 20, 18, 4, 3],
        [70, 40, 10, 8, 2],
        [60, 25, 16, 2, 5],
        [90, 35, 14, 10, 0],
        [50, 30, 20, 6, 4],
    ];
    var DEFAULT_DOC_NAMES = ['Doc A', 'Doc B', 'Doc C', 'Doc D', 'Doc E', 'Doc F'];

    var columns, data, docNames, meanStdVisible, ghostColActive, ghostRowActive, showingOriginal;

    function init() {
        resetToDefaults();
        bindEvents();
    }

    function resetToDefaults() {
        columns = DEFAULT_COLUMNS.slice();
        data = DEFAULT_DATA.map(function (r) { return r.slice(); });
        docNames = DEFAULT_DOC_NAMES.slice();
        meanStdVisible = false;
        ghostColActive = false;
        ghostRowActive = false;
        showingOriginal = false;
        renderRawTable();
    }

    function hideAllDownstream() {
        document.getElementById('step2Trigger').classList.remove('hidden');
        document.getElementById('step2Content').classList.add('hidden');
        document.getElementById('step3Section').classList.add('hidden');
        document.getElementById('step4Section').classList.add('hidden');
        closeMeanStdCalc();
    }

    function bindEvents() {
        document.getElementById('btnResetData').addEventListener('click', function () {
            resetToDefaults();
            hideAllDownstream();
        });
        document.getElementById('btnToStep2').addEventListener('click', showStep2);
        document.getElementById('btnToStep3').addEventListener('click', function () { showStep3(false); });
        document.getElementById('btnToStep4').addEventListener('click', function () { showStep4(false); });
        document.getElementById('btnToggleOriginal').addEventListener('click', toggleOriginalZScore);
        document.getElementById('btnRestart').addEventListener('click', function () {
            resetToDefaults();
            hideAllDownstream();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        document.getElementById('btnToggleCalcMeanStd').addEventListener('click', toggleMeanStdCalc);
    }

    // ── Toggle calculation details ───────────────────────────────────
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

    // ── Toggle original / z-score in Step 3 table ────────────────────
    function toggleOriginalZScore() {
        showingOriginal = !showingOriginal;
        var btn = document.getElementById('btnToggleOriginal');
        btn.textContent = showingOriginal ? 'Show z-scores' : 'Show original values';
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
            docNames.push(name);
            data.push(row);
        }
        ghostRowActive = false;
        renderRawTable();
        refreshDownstream();
    }

    function removeRow(rIdx) {
        if (data.length <= 2) return;
        data.splice(rIdx, 1);
        docNames.splice(rIdx, 1);
        renderRawTable();
        refreshDownstream();
    }

    function refreshDownstream() {
        if (meanStdVisible) updateMeanStdCalcDetails();
        if (!document.getElementById('step3Section').classList.contains('hidden')) showStep3(true);
        if (!document.getElementById('step4Section').classList.contains('hidden')) showStep4(true);
    }

    // ── Read data from table inputs ──────────────────────────────────
    function readDataFromInputs() {
        var rows = document.getElementById('rawDataTable').querySelectorAll('tbody tr:not(.mean-row):not(.std-row):not(.ghost-row-trigger):not(.ghost-row-active)');
        rows.forEach(function (row, rIdx) {
            if (rIdx >= data.length) return;
            row.querySelectorAll('input.data-input').forEach(function (inp, cIdx) {
                if (cIdx >= columns.length) return;
                var v = parseFloat(inp.value);
                data[rIdx][cIdx] = isNaN(v) ? 0 : v;
            });
        });
    }

    // ── Statistics ───────────────────────────────────────────────────
    function computeMeans() {
        var n = data.length;
        return columns.map(function (_, c) {
            var s = 0;
            for (var i = 0; i < n; i++) s += data[i][c];
            return s / n;
        });
    }

    function computeStdDevs(means) {
        var n = data.length;
        return columns.map(function (_, c) {
            var s = 0;
            for (var i = 0; i < n; i++) { var d = data[i][c] - means[c]; s += d * d; }
            return Math.sqrt(s / n);
        });
    }

    function computeZScores(means, stdDevs) {
        return data.map(function (row) {
            return row.map(function (val, c) {
                return stdDevs[c] === 0 ? 0 : (val - means[c]) / stdDevs[c];
            });
        });
    }

    function cosineSimilarity(a, b) {
        var dot = 0, na = 0, nb = 0;
        for (var i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            na += a[i] * a[i];
            nb += b[i] * b[i];
        }
        var denom = Math.sqrt(na) * Math.sqrt(nb);
        return denom === 0 ? 0 : dot / denom;
    }

    // ── Render raw data table ────────────────────────────────────────
    function renderRawTable() {
        var table = document.getElementById('rawDataTable');
        var totalCols = columns.length + 2; // doc label + columns + ghost col
        var html = '<thead><tr><th>Document</th>';
        columns.forEach(function (col, cIdx) {
            html += '<th><input type="text" class="col-name-input" value="' + escAttr(col) + '" data-col="' + cIdx + '">';
            if (columns.length > 2) html += '<button class="remove-col-btn" data-col="' + cIdx + '" title="Remove column">\u2715</button>';
            html += '</th>';
        });
        html += ghostColActive
            ? '<th class="ghost-col active"><input type="text" class="ghost-header-input" placeholder="word\u2026"></th>'
            : '<th class="ghost-col">+ add<br>column</th>';
        html += '</tr></thead><tbody>';

        data.forEach(function (row, rIdx) {
            html += '<tr>';
            html += '<td class="doc-label"><input type="text" class="doc-name-input" value="' + escAttr(docNames[rIdx]) + '" data-row="' + rIdx + '">';
            if (data.length > 2) html += '<button class="remove-row-btn" data-row="' + rIdx + '" title="Remove document">\u2715</button>';
            html += '</td>';
            row.forEach(function (val, cIdx) {
                html += '<td><input type="number" class="data-input" value="' + val + '" data-r="' + rIdx + '" data-c="' + cIdx + '" min="0" max="999"></td>';
            });
            html += ghostColActive
                ? '<td class="ghost-col active"><input type="number" class="ghost-col-data" value="0" min="0" max="999"></td>'
                : '<td class="ghost-col"></td>';
            html += '</tr>';
        });

        // Ghost row
        if (ghostRowActive) {
            html += '<tr class="ghost-row-active">';
            html += '<td class="doc-label"><input type="text" class="ghost-row-name" placeholder="Doc name\u2026"></td>';
            columns.forEach(function () {
                html += '<td><input type="number" class="ghost-row-data" value="0" min="0" max="999"></td>';
            });
            html += '<td class="ghost-col"></td></tr>';
        } else {
            html += '<tr class="ghost-row-trigger"><td class="ghost-col" colspan="' + totalCols + '">+ add document</td></tr>';
        }

        if (meanStdVisible) {
            var means = computeMeans(), stdDevs = computeStdDevs(means);
            html += '<tr class="mean-row"><td class="stat-label">\u03BC (mean)</td>';
            means.forEach(function (m) { html += '<td>' + fmtNum(m, 2) + '</td>'; });
            html += '<td class="ghost-col"></td></tr>';
            html += '<tr class="std-row"><td class="stat-label">\u03C3 (std dev)</td>';
            stdDevs.forEach(function (s) { html += '<td>' + fmtNum(s, 2) + '</td>'; });
            html += '<td class="ghost-col"></td></tr>';
        }
        html += '</tbody>';
        table.innerHTML = html;
        wireTableEvents();
    }

    function wireTableEvents() {
        var table = document.getElementById('rawDataTable');
        table.querySelectorAll('.col-name-input').forEach(function (inp) {
            inp.addEventListener('change', function () {
                var idx = parseInt(this.dataset.col);
                var v = this.value.trim();
                if (v && v !== columns[idx]) { columns[idx] = v; refreshDownstream(); }
            });
        });
        table.querySelectorAll('.doc-name-input').forEach(function (inp) {
            inp.addEventListener('change', function () {
                var idx = parseInt(this.dataset.row);
                var v = this.value.trim();
                if (v) { docNames[idx] = v; refreshDownstream(); }
            });
        });
        table.querySelectorAll('.remove-col-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) { e.stopPropagation(); removeColumn(parseInt(this.dataset.col)); });
        });
        table.querySelectorAll('.remove-row-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) { e.stopPropagation(); removeRow(parseInt(this.dataset.row)); });
        });
        table.querySelectorAll('input.data-input').forEach(function (inp) {
            inp.addEventListener('change', function () {
                data[parseInt(this.dataset.r)][parseInt(this.dataset.c)] = parseFloat(this.value) || 0;
                if (meanStdVisible) { updateMeanStdRows(); updateMeanStdCalcDetails(); }
                if (!document.getElementById('step3Section').classList.contains('hidden')) showStep3(true);
                if (!document.getElementById('step4Section').classList.contains('hidden')) showStep4(true);
            });
        });
        // Ghost column
        if (!ghostColActive) {
            table.querySelectorAll('thead .ghost-col, tbody tr:not(.ghost-row-trigger):not(.ghost-row-active) .ghost-col').forEach(function (cell) {
                cell.addEventListener('click', function (e) { e.stopPropagation(); activateGhostCol(); });
            });
        } else {
            wireGhostBlur('.ghost-header-input', '.ghost-col-data', deactivateGhostCol, function () { ghostColActive = false; renderRawTable(); });
        }
        // Ghost row
        if (!ghostRowActive) {
            var trigger = table.querySelector('.ghost-row-trigger');
            if (trigger) trigger.addEventListener('click', function (e) { e.stopPropagation(); activateGhostRow(); });
        } else {
            wireGhostBlur('.ghost-row-name', '.ghost-row-data', deactivateGhostRow, function () { ghostRowActive = false; renderRawTable(); });
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

    function updateMeanStdRows() {
        var means = computeMeans(), stdDevs = computeStdDevs(means);
        var table = document.getElementById('rawDataTable');
        var mc = table.querySelector('.mean-row').querySelectorAll('td:not(.stat-label):not(.ghost-col)');
        var sc = table.querySelector('.std-row').querySelectorAll('td:not(.stat-label):not(.ghost-col)');
        means.forEach(function (m, i) { if (mc[i]) mc[i].textContent = fmtNum(m, 2); });
        stdDevs.forEach(function (s, i) { if (sc[i]) sc[i].textContent = fmtNum(s, 2); });
    }

    // ── Step 2 ───────────────────────────────────────────────────────
    function showStep2() {
        readDataFromInputs();
        meanStdVisible = true;
        renderRawTable();
        document.getElementById('step2Trigger').classList.add('hidden');
        document.getElementById('step2Content').classList.remove('hidden');
        updateMeanStdCalcDetails();
    }

    function updateMeanStdCalcDetails() {
        readDataFromInputs();
        var means = computeMeans(), stdDevs = computeStdDevs(means);
        var container = document.getElementById('calcDetailsMeanStd');
        var n = data.length, html = '';
        columns.forEach(function (col, cIdx) {
            var vals = data.map(function (r) { return r[cIdx]; });
            var sum = vals.reduce(function (a, b) { return a + b; }, 0);
            var mean = means[cIdx];
            var diffs = vals.map(function (v) { return v - mean; });
            var sumSq = diffs.reduce(function (s, d) { return s + d * d; }, 0);
            html += '<div class="calc-detail"><span class="col-name">\u201C' + escHtml(col) + '\u201D</span>';
            html += '<div style="margin:0.25rem 0">$$\\mu = \\frac{' + vals.join('+') + '}{' + n + '} = \\frac{' + fmtNum(sum) + '}{' + n + '} = ' + fmtNum(mean, 2) + '$$</div>';
            var dt = diffs.map(function (d) { return '(' + fmtNum(d, 2) + ')^2'; }).join('+');
            html += '<div style="margin:0.25rem 0">$$\\sigma = \\sqrt{\\frac{' + dt + '}{' + n + '}} = \\sqrt{\\frac{' + fmtNum(sumSq, 2) + '}{' + n + '}} = \\sqrt{' + fmtNum(sumSq / n, 2) + '} = ' + fmtNum(stdDevs[cIdx], 2) + '$$</div></div>';
        });
        container.innerHTML = html;
        if (container.classList.contains('open')) typesetElement(container);
    }

    // ── Step 3 ───────────────────────────────────────────────────────
    function showStep3(skipScroll) {
        readDataFromInputs();
        var section = document.getElementById('step3Section');
        section.classList.remove('hidden');
        renderZScoreExample();
        renderStep3Table();
        if (!skipScroll && section.dataset.seen !== 'true') {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            section.dataset.seen = 'true';
        }
        typesetElement(section);
    }

    function renderZScoreExample() {
        var means = computeMeans(), stdDevs = computeStdDevs(means);
        var col = escHtml(columns[0]), doc = docNames[0];
        var val = data[0][0], mean = means[0], std = stdDevs[0];
        var z = std === 0 ? 0 : (val - mean) / std;
        document.getElementById('calcDetailsZScore').innerHTML =
            '<div class="calc-detail"><strong>Example:</strong> ' + doc +
            ', column <span class="col-name">\u201C' + col + '\u201D</span>' +
            '<div style="margin:0.25rem 0">$$z = \\frac{\\text{count}(\\text{' + col + '} \\text{ in ' + doc + '}) - \\text{mean}(\\text{' + col + '})}{\\text{std}(\\text{' + col + '})}' +
            ' = \\frac{' + fmtNum(val) + ' - ' + fmtNum(mean, 2) + '}{' + fmtNum(std, 2) +
            '} = \\frac{' + fmtNum(val - mean, 2) + '}{' + fmtNum(std, 2) + '} = ' + fmtNum(z, 2) + '$$</div></div>';
    }

    function renderStep3Table() {
        var means = computeMeans(), stdDevs = computeStdDevs(means);
        var zScores = computeZScores(means, stdDevs);
        var table = document.getElementById('zScoreTable');
        var html = '<thead><tr><th>Doc</th>';
        columns.forEach(function (col) { html += '<th>' + escHtml(col) + '</th>'; });
        html += '</tr></thead><tbody>';

        if (showingOriginal) {
            data.forEach(function (row, rIdx) {
                html += '<tr><td class="doc-label">' + docNames[rIdx] + '</td>';
                row.forEach(function (val) { html += '<td>' + fmtNum(val) + '</td>'; });
                html += '</tr>';
            });
            html += '<tr class="step3-stat-row"><td class="step3-stat-label">\u03BC</td>';
            means.forEach(function (m) { html += '<td>' + fmtNum(m, 2) + '</td>'; });
            html += '</tr>';
            html += '<tr class="step3-stat-row"><td class="step3-stat-label">\u03C3</td>';
            stdDevs.forEach(function (s) { html += '<td>' + fmtNum(s, 2) + '</td>'; });
            html += '</tr>';
        } else {
            zScores.forEach(function (row, rIdx) {
                html += '<tr><td class="doc-label">' + docNames[rIdx] + '</td>';
                row.forEach(function (z) {
                    var cls = z > 0.005 ? 'positive' : z < -0.005 ? 'negative' : 'zero';
                    html += '<td class="' + cls + '">' + fmtNum(z, 2) + '</td>';
                });
                html += '</tr>';
            });
            html += '<tr class="step3-stat-row"><td class="step3-stat-label">\u03BC</td>';
            columns.forEach(function () { html += '<td>0.00</td>'; });
            html += '</tr>';
            html += '<tr class="step3-stat-row"><td class="step3-stat-label">\u03C3</td>';
            columns.forEach(function () { html += '<td>1.00</td>'; });
            html += '</tr>';
        }
        html += '</tbody>';
        table.innerHTML = html;
    }

    // ── Step 4: heatmap ──────────────────────────────────────────────
    function showStep4(skipScroll) {
        readDataFromInputs();
        var section = document.getElementById('step4Section');
        section.classList.remove('hidden');
        renderHeatmap();
        if (!skipScroll && section.dataset.seen !== 'true') {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            section.dataset.seen = 'true';
        }
        typesetElement(section);
    }

    function renderHeatmap() {
        var means = computeMeans(), stdDevs = computeStdDevs(means);
        var zScores = computeZScores(means, stdDevs);
        var n = data.length;

        // Compute similarity matrix
        var sim = [];
        for (var i = 0; i < n; i++) {
            sim[i] = [];
            for (var j = 0; j < n; j++) {
                sim[i][j] = cosineSimilarity(zScores[i], zScores[j]);
            }
        }

        // Find min/max for color scaling (excluding diagonal)
        var minSim = 1, maxSim = -1;
        for (var i = 0; i < n; i++) {
            for (var j = 0; j < n; j++) {
                if (i !== j) {
                    if (sim[i][j] < minSim) minSim = sim[i][j];
                    if (sim[i][j] > maxSim) maxSim = sim[i][j];
                }
            }
        }

        var cols = n + 1;
        var html = '<div class="heatmap-grid" style="grid-template-columns: repeat(' + cols + ', auto);">';

        // Corner
        html += '<div class="heatmap-cell hm-corner"></div>';
        // Column headers
        for (var j = 0; j < n; j++) {
            html += '<div class="heatmap-cell hm-label">' + docNames[j] + '</div>';
        }

        // Rows
        for (var i = 0; i < n; i++) {
            html += '<div class="heatmap-cell hm-label">' + docNames[i] + '</div>';
            for (var j = 0; j < n; j++) {
                var v = sim[i][j];
                var bg = simColor(v, minSim, maxSim, i === j);
                var fg = simTextColor(v, minSim, maxSim, i === j);
                html += '<div class="heatmap-cell" style="background:' + bg + ';color:' + fg + ';" title="' + docNames[i] + ' vs ' + docNames[j] + '">' + fmtNum(v, 2) + '</div>';
            }
        }
        html += '</div>';

        // Legend bar
        var absMax = Math.max(Math.abs(minSim), Math.abs(maxSim));
        html += '<div class="heatmap-legend">';
        html += '<span>' + fmtNum(-absMax, 2) + ' (opposite)</span>';
        html += '<div class="heatmap-legend-bar" style="background: linear-gradient(to right, ' + simColor(-absMax, -absMax, absMax, false) + ', #ffffff, ' + simColor(absMax, -absMax, absMax, false) + ');"></div>';
        html += '<span>' + fmtNum(absMax, 2) + ' (most similar)</span>';
        html += '</div>';

        document.getElementById('heatmapContainer').innerHTML = html;
    }

    function simColor(val, minSim, maxSim, isDiag) {
        if (isDiag) return '#e8e8e8';
        // Diverging blue–white–red: 0 maps to midpoint (white)
        // t: -1..+1 mapped from minSim..maxSim, with 0 at the center
        var absMax = Math.max(Math.abs(minSim), Math.abs(maxSim));
        if (absMax === 0) return '#ffffff';
        var t = val / absMax; // -1..+1
        if (t >= 0) {
            // white → red
            var r = 255;
            var g = Math.round(255 * (1 - t));
            var b = Math.round(255 * (1 - t));
        } else {
            // white → blue
            var s = -t;
            var r = Math.round(255 * (1 - s));
            var g = Math.round(255 * (1 - s * 0.6));
            var b = 255;
        }
        return 'rgb(' + r + ',' + g + ',' + b + ')';
    }

    function simTextColor(val, minSim, maxSim, isDiag) {
        if (isDiag) return '#999';
        var absMax = Math.max(Math.abs(minSim), Math.abs(maxSim));
        var intensity = absMax === 0 ? 0 : Math.abs(val) / absMax;
        return intensity > 0.6 ? '#fff' : '#333';
    }

    // ── Utilities ────────────────────────────────────────────────────
    function fmtNum(n, decimals) {
        if (typeof decimals === 'undefined') return Number.isInteger(n) ? String(n) : n.toFixed(2);
        return n.toFixed(decimals);
    }

    function escHtml(str) {
        var d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
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
