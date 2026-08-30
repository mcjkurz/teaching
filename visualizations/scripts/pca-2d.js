// =========================================
// 2D PCA STEP-BY-STEP VISUALIZATION
// =========================================

(function() {
    'use strict';

    // -----------------------------------------
    // CONFIGURATION & STATE
    // -----------------------------------------
    const CANVAS_SIZE = 320;
    const LOGICAL_MIN = -4;
    const LOGICAL_MAX = 4;
    const LOGICAL_RANGE = LOGICAL_MAX - LOGICAL_MIN;

    // Get all canvases
    const canvases = {
        c0: document.getElementById('canvas0'),
        c1: document.getElementById('canvas1'),
        c2: document.getElementById('canvas2'),
        c3: document.getElementById('canvas3'),
        c4: document.getElementById('canvas4')
    };
    const contexts = {};
    for (let key in canvases) {
        contexts[key] = canvases[key].getContext('2d');
    }

    // State
    let originalPoints = [];
    let centeredPoints = [];
    let mean = [0, 0];
    let covMatrix = [[1, 0], [0, 1]];
    let eigenvalues = [1, 1];
    let eigenvectors = [[1, 0], [0, 1]];

    // Toggle states for each step
    let step1Shown = false;
    let step2Shown = false;
    let step3PC1Shown = false;
    let step3PC2Shown = false;
    let step3EllipseShown = false;
    let step4Shown = false;

    // -----------------------------------------
    // COORDINATE TRANSFORMATIONS
    // -----------------------------------------
    function toCanvas(x, y) {
        const cx = ((x - LOGICAL_MIN) / LOGICAL_RANGE) * CANVAS_SIZE;
        const cy = CANVAS_SIZE - ((y - LOGICAL_MIN) / LOGICAL_RANGE) * CANVAS_SIZE;
        return [cx, cy];
    }

    function toLogical(canvasX, canvasY) {
        const x = (canvasX / CANVAS_SIZE) * LOGICAL_RANGE + LOGICAL_MIN;
        const y = ((CANVAS_SIZE - canvasY) / CANVAS_SIZE) * LOGICAL_RANGE + LOGICAL_MIN;
        return [x, y];
    }

    function scaleLength(len) {
        return (len / LOGICAL_RANGE) * CANVAS_SIZE;
    }

    // -----------------------------------------
    // DRAWING UTILITIES
    // -----------------------------------------
    function drawGrid(ctx) {
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.fillStyle = '#fafafa';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Grid lines
        ctx.strokeStyle = '#e8e8e8';
        ctx.lineWidth = 1;
        for (let i = LOGICAL_MIN; i <= LOGICAL_MAX; i++) {
            const [vx] = toCanvas(i, 0);
            ctx.beginPath();
            ctx.moveTo(vx, 0);
            ctx.lineTo(vx, CANVAS_SIZE);
            ctx.stroke();

            const [, hy] = toCanvas(0, i);
            ctx.beginPath();
            ctx.moveTo(0, hy);
            ctx.lineTo(CANVAS_SIZE, hy);
            ctx.stroke();
        }

        // Axes
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 1.5;
        const [, yAxis] = toCanvas(0, 0);
        ctx.beginPath();
        ctx.moveTo(0, yAxis);
        ctx.lineTo(CANVAS_SIZE, yAxis);
        ctx.stroke();

        const [xAxis] = toCanvas(0, 0);
        ctx.beginPath();
        ctx.moveTo(xAxis, 0);
        ctx.lineTo(xAxis, CANVAS_SIZE);
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#888';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        for (let i = LOGICAL_MIN; i <= LOGICAL_MAX; i++) {
            if (i === 0) continue;
            const [x, y] = toCanvas(i, 0);
            ctx.fillText(i.toString(), x, yAxis + 12);
        }
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let i = LOGICAL_MIN; i <= LOGICAL_MAX; i++) {
            if (i === 0) continue;
            const [x, y] = toCanvas(0, i);
            ctx.fillText(i.toString(), xAxis - 5, y);
        }
    }

    function drawPoint(ctx, x, y, color = '#333', radius = 5, hollow = false) {
        const [cx, cy] = toCanvas(x, y);
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        if (hollow) {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            ctx.fillStyle = color;
            ctx.fill();
        }
    }

    function drawVector(ctx, x1, y1, x2, y2, color, lineWidth = 2.5) {
        const [cx1, cy1] = toCanvas(x1, y1);
        const [cx2, cy2] = toCanvas(x2, y2);
        
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(cx1, cy1);
        ctx.lineTo(cx2, cy2);
        ctx.stroke();

        // Arrowhead
        const angle = Math.atan2(cy2 - cy1, cx2 - cx1);
        const headLen = 10;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(cx2, cy2);
        ctx.lineTo(cx2 - headLen * Math.cos(angle - Math.PI / 6), cy2 - headLen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(cx2 - headLen * Math.cos(angle + Math.PI / 6), cy2 - headLen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
    }

    function drawEllipse(ctx, cx, cy, a, b, rotation, color) {
        const [canvasCx, canvasCy] = toCanvas(cx, cy);
        const canvasA = scaleLength(a);
        const canvasB = scaleLength(b);

        ctx.save();
        ctx.translate(canvasCx, canvasCy);
        ctx.rotate(-rotation);

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.ellipse(0, 0, canvasA, canvasB, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = color.replace(')', ', 0.1)').replace('rgb', 'rgba');
        ctx.beginPath();
        ctx.ellipse(0, 0, canvasA, canvasB, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.setLineDash([]);
        ctx.restore();
    }

    function drawLine(ctx, x1, y1, x2, y2, color, lineWidth = 2, dashed = false) {
        const [cx1, cy1] = toCanvas(x1, y1);
        const [cx2, cy2] = toCanvas(x2, y2);
        
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        if (dashed) ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cx1, cy1);
        ctx.lineTo(cx2, cy2);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // -----------------------------------------
    // MATH FUNCTIONS
    // -----------------------------------------
    function computeMean(points) {
        if (points.length === 0) return [0, 0];
        let sx = 0, sy = 0;
        points.forEach(([x, y]) => { sx += x; sy += y; });
        return [sx / points.length, sy / points.length];
    }

    function centerPoints(points, m) {
        return points.map(([x, y]) => [x - m[0], y - m[1]]);
    }

    function computeCovariance(points) {
        const n = points.length;
        if (n < 2) return [[1, 0], [0, 1]];

        let sxx = 0, syy = 0, sxy = 0;
        points.forEach(([x, y]) => {
            sxx += x * x;
            syy += y * y;
            sxy += x * y;
        });

        const factor = 1 / (n - 1);
        return [
            [sxx * factor, sxy * factor],
            [sxy * factor, syy * factor]
        ];
    }

    function computeEigen(cov) {
        const a = cov[0][0], b = cov[0][1], c = cov[1][1];
        const trace = a + c;
        const det = a * c - b * b;
        const disc = Math.sqrt(Math.max(0, trace * trace / 4 - det));

        let l1 = trace / 2 + disc;
        let l2 = trace / 2 - disc;

        if (l1 < l2) [l1, l2] = [l2, l1];

        // Eigenvectors
        let v1, v2;
        if (Math.abs(b) > 1e-10) {
            v1 = [l1 - c, b];
            v2 = [l2 - c, b];
        } else if (a >= c) {
            v1 = [1, 0];
            v2 = [0, 1];
        } else {
            v1 = [0, 1];
            v2 = [1, 0];
        }

        // Normalize
        const norm1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
        const norm2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);
        v1 = [v1[0] / norm1, v1[1] / norm1];
        v2 = [v2[0] / norm2, v2[1] / norm2];

        return {
            eigenvalues: [Math.max(0, l1), Math.max(0, l2)],
            eigenvectors: [v1, v2],
            trace: trace,
            det: det
        };
    }

    // -----------------------------------------
    // DATA GENERATION
    // -----------------------------------------
    function generateRandom(n = 20) {
        const pts = [];
        // Random offset to make centering visually meaningful
        const offsetX = (Math.random() - 0.5) * 2 + (Math.random() > 0.5 ? 0.8 : -0.8);
        const offsetY = (Math.random() - 0.5) * 2 + (Math.random() > 0.5 ? 0.8 : -0.8);
        for (let i = 0; i < n; i++) {
            pts.push([(Math.random() - 0.5) * 5 + offsetX, (Math.random() - 0.5) * 5 + offsetY]);
        }
        return pts;
    }

    function generateCorrelated(n = 22) {
        const pts = [];
        // Random angle between 15° and 75° (positive slope)
        const angle = (Math.random() * 60 + 15) * Math.PI / 180;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        // Random spread perpendicular to the line (0.3 to 0.8)
        const spread = Math.random() * 0.5 + 0.3;
        // Random offset to make centering visually meaningful
        const offsetX = (Math.random() - 0.5) * 1.5 + (Math.random() > 0.5 ? 0.8 : -0.8);
        const offsetY = (Math.random() - 0.5) * 1.5 + (Math.random() > 0.5 ? 0.8 : -0.8);
        for (let i = 0; i < n; i++) {
            const t = (Math.random() - 0.5) * 5; // Along the line
            const noise = (Math.random() - 0.5) * 2 * spread; // Perpendicular noise
            pts.push([t * cosA - noise * sinA + offsetX, t * sinA + noise * cosA + offsetY]);
        }
        return pts;
    }

    function generateNegCorrelated(n = 22) {
        const pts = [];
        // Random angle between 105° and 165° (negative slope)
        const angle = (Math.random() * 60 + 105) * Math.PI / 180;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        // Random spread perpendicular to the line (0.3 to 0.8)
        const spread = Math.random() * 0.5 + 0.3;
        // Random offset to make centering visually meaningful
        const offsetX = (Math.random() - 0.5) * 1.5 + (Math.random() > 0.5 ? 0.8 : -0.8);
        const offsetY = (Math.random() - 0.5) * 1.5 + (Math.random() > 0.5 ? 0.8 : -0.8);
        for (let i = 0; i < n; i++) {
            const t = (Math.random() - 0.5) * 5; // Along the line
            const noise = (Math.random() - 0.5) * 2 * spread; // Perpendicular noise
            pts.push([t * cosA - noise * sinA + offsetX, t * sinA + noise * cosA + offsetY]);
        }
        return pts;
    }

    function generateCircular(n = 22) {
        const pts = [];
        // Random offset to make centering visually meaningful
        const offsetX = (Math.random() - 0.5) * 1.5 + (Math.random() > 0.5 ? 0.8 : -0.8);
        const offsetY = (Math.random() - 0.5) * 1.5 + (Math.random() > 0.5 ? 0.8 : -0.8);
        for (let i = 0; i < n; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * 1.8 + 0.3;
            pts.push([Math.cos(angle) * r + offsetX, Math.sin(angle) * r + offsetY]);
        }
        return pts;
    }

    // -----------------------------------------
    // RENDER FUNCTIONS
    // -----------------------------------------
    function renderCanvas0() {
        const ctx = contexts.c0;
        drawGrid(ctx);
        originalPoints.forEach(([x, y]) => drawPoint(ctx, x, y, '#2c3e50', 5));
    }

    function renderCanvas1() {
        const ctx = contexts.c1;
        drawGrid(ctx);
        
        if (step1Shown) {
            // Show original points as ghosts
            originalPoints.forEach(([x, y]) => drawPoint(ctx, x, y, '#ccc', 4));
            // Show centered points
            centeredPoints.forEach(([x, y]) => drawPoint(ctx, x, y, '#3498db', 5));
            // Show mean at origin (where it moved to after centering)
            drawPoint(ctx, 0, 0, '#e74c3c', 6, true);
        } else {
            // Show original points with mean marker at original position
            originalPoints.forEach(([x, y]) => drawPoint(ctx, x, y, '#3498db', 5));
            if (originalPoints.length >= 3) {
                drawPoint(ctx, mean[0], mean[1], '#e74c3c', 6, true);
                // Arrow from mean to origin showing where it will move
                drawLine(ctx, mean[0], mean[1], 0, 0, '#e74c3c', 1.5, true);
            }
        }
    }

    function renderCanvas2() {
        const ctx = contexts.c2;
        drawGrid(ctx);
        
        centeredPoints.forEach(([x, y]) => drawPoint(ctx, x, y, '#3498db', 5));
        
        if (step2Shown) {
            const varX = covMatrix[0][0];
            const varY = covMatrix[1][1];
            const covXY = covMatrix[0][1];
            
            // Draw variance visualization - lines from each point to axes
            centeredPoints.forEach(([x, y]) => {
                // Horizontal line (contributes to Var(x))
                drawLine(ctx, 0, y, x, y, 'rgba(231, 76, 60, 0.3)', 1);
                // Vertical line (contributes to Var(y))
                drawLine(ctx, x, 0, x, y, 'rgba(155, 89, 182, 0.3)', 1);
            });
            
            // Draw spread indicators
            const maxX = Math.max(...centeredPoints.map(p => Math.abs(p[0])));
            const maxY = Math.max(...centeredPoints.map(p => Math.abs(p[1])));
            
            // Horizontal spread bar (Var(x)) with value
            drawLine(ctx, -maxX, -3.5, maxX, -3.5, '#e74c3c', 3);
            ctx.fillStyle = '#e74c3c';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            const [, barY] = toCanvas(0, -3.5);
            ctx.fillText(`Var(x) = ${varX.toFixed(2)}`, CANVAS_SIZE / 2, barY - 8);
            
            // Vertical spread bar (Var(y)) with value
            drawLine(ctx, -3.5, -maxY, -3.5, maxY, '#9b59b6', 3);
            ctx.save();
            ctx.fillStyle = '#9b59b6';
            const [barX] = toCanvas(-3.5, 0);
            ctx.translate(barX - 8, CANVAS_SIZE / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(`Var(y) = ${varY.toFixed(2)}`, 0, 0);
            ctx.restore();
            
            // Draw covariance annotation (no line, just label with direction arrow)
            ctx.fillStyle = '#f39c12';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'right';
            const [lx, ly] = toCanvas(3.3, 3.5);
            
            let covLabel;
            if (covXY > 0.1) {
                covLabel = `Cov = +${covXY.toFixed(2)} ↗`;
            } else if (covXY < -0.1) {
                covLabel = `Cov = ${covXY.toFixed(2)} ↘`;
            } else {
                covLabel = `Cov ≈ 0`;
            }
            ctx.fillText(covLabel, lx, ly);
        }
    }

    function renderCanvas3() {
        const ctx = contexts.c3;
        drawGrid(ctx);

        // Draw ellipse first (behind everything)
        if (step3EllipseShown) {
            const a = Math.sqrt(eigenvalues[0]) * 2;
            const b = Math.sqrt(eigenvalues[1]) * 2;
            const rotation = Math.atan2(eigenvectors[0][1], eigenvectors[0][0]);
            drawEllipse(ctx, 0, 0, a, b, rotation, 'rgb(155, 89, 182)');
        }

        // Data points
        centeredPoints.forEach(([x, y]) => drawPoint(ctx, x, y, '#3498db', 5));

        const scale1 = Math.sqrt(eigenvalues[0]) * 1.8;
        const scale2 = Math.sqrt(eigenvalues[1]) * 1.8;
        const v1 = eigenvectors[0], v2 = eigenvectors[1];

        if (step3PC1Shown) {
            // PC1 (both directions)
            drawLine(ctx, -v1[0] * scale1, -v1[1] * scale1, v1[0] * scale1, v1[1] * scale1, '#e74c3c', 2.5);
            drawVector(ctx, 0, 0, v1[0] * scale1, v1[1] * scale1, '#e74c3c', 2.5);
            
            // Label
            const [lx1, ly1] = toCanvas(v1[0] * scale1 * 1.15, v1[1] * scale1 * 1.15);
            ctx.font = 'bold 11px sans-serif';
            ctx.fillStyle = '#e74c3c';
            ctx.textAlign = 'center';
            ctx.fillText('PC1', lx1, ly1);
        }
        
        if (step3PC2Shown) {
            // PC2 (both directions)
            drawLine(ctx, -v2[0] * scale2, -v2[1] * scale2, v2[0] * scale2, v2[1] * scale2, '#9b59b6', 2.5);
            drawVector(ctx, 0, 0, v2[0] * scale2, v2[1] * scale2, '#9b59b6', 2.5);
            
            // Label
            const [lx2, ly2] = toCanvas(v2[0] * scale2 * 1.15, v2[1] * scale2 * 1.15);
            ctx.font = 'bold 11px sans-serif';
            ctx.fillStyle = '#9b59b6';
            ctx.textAlign = 'center';
            ctx.fillText('PC2', lx2, ly2);
        }
    }

    function renderCanvas4() {
        const ctx = contexts.c4;
        drawGrid(ctx);

        const v1 = eigenvectors[0];
        
        // Extended PC1 line
        drawLine(ctx, -v1[0] * 5, -v1[1] * 5, v1[0] * 5, v1[1] * 5, 'rgba(231, 76, 60, 0.35)', 4);

        // Draw points based on projection state
        centeredPoints.forEach(([x, y]) => {
            const dot = x * v1[0] + y * v1[1];
            const px = dot * v1[0];
            const py = dot * v1[1];

            if (step4Shown) {
                // Only show projected points on the line (original points disappear)
                drawPoint(ctx, px, py, '#27ae60', 5);
            } else {
                // Show original 2D points
                drawPoint(ctx, x, y, '#3498db', 5);
            }
        });
    }

    // -----------------------------------------
    // UPDATE UI
    // -----------------------------------------
    function updateDataTable() {
        const tbody = document.getElementById('dataTableBody');
        if (originalPoints.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #999;">No data yet</td></tr>';
            return;
        }
        let html = '';
        originalPoints.forEach((p, i) => {
            html += `<tr><td>${i + 1}</td><td>${p[0].toFixed(2)}</td><td>${p[1].toFixed(2)}</td></tr>`;
        });
        tbody.innerHTML = html;
    }

    function updatePointCount() {
        document.getElementById('pointCount').textContent = originalPoints.length;
        document.getElementById('btnStartStep1').disabled = originalPoints.length < 3;
    }

    function showStep(stepNum) {
        for (let i = 1; i <= 4; i++) {
            const section = document.getElementById(`step${i}Section`);
            if (i <= stepNum) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        }
        
        const targetSection = document.getElementById(`step${stepNum}Section`);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function updateButtonState(btnId, isActive) {
        const btn = document.getElementById(btnId);
        if (isActive) {
            btn.classList.add('active');
            btn.textContent = btn.textContent.replace('Show', 'Hide');
        } else {
            btn.classList.remove('active');
            btn.textContent = btn.textContent.replace('Hide', 'Show');
        }
    }

    function updateMathDisplay() {
        const varX = covMatrix[0][0];
        const varY = covMatrix[1][1];
        const covXY = covMatrix[0][1];
        
        // Step 1: Mean
        document.getElementById('meanComputed').innerHTML = 
            `Computed mean: <strong>μ = (${mean[0].toFixed(3)}, ${mean[1].toFixed(3)})</strong>`;

        // Step 2: Covariance - update the visual matrix with computed values
        document.getElementById('covMatVarX').textContent = varX.toFixed(2);
        document.getElementById('covMatCovXY1').textContent = covXY.toFixed(2);
        document.getElementById('covMatCovXY2').textContent = covXY.toFixed(2);
        document.getElementById('covMatVarY').textContent = varY.toFixed(2);
        
        // Update the interactive explorer hint with computed values
        document.getElementById('covExplorerDataHint').innerHTML = 
            `<strong>Your data:</strong> Var(x)=${varX.toFixed(2)}, Var(y)=${varY.toFixed(2)}, Cov=${covXY.toFixed(2)} — try these values to see the transformation that produces your data's shape!`;

        // Step 3: Eigenvalues
        const trace = varX + varY;
        const det = varX * varY - covXY * covXY;
        document.getElementById('charEqComputed').innerHTML = 
            `(${varX.toFixed(2)} - λ)(${varY.toFixed(2)} - λ) - (${covXY.toFixed(2)})² = 0`;
        document.getElementById('traceDetComputed').innerHTML = 
            `<strong>trace(Σ) = ${trace.toFixed(3)}</strong> (total variance), &nbsp; <strong>det(Σ) = ${det.toFixed(3)}</strong>`;
        
        const ratio = det > 0 ? Math.sqrt(eigenvalues[0] / eigenvalues[1]) : 1;
        let traceDetInterpret = `Total variance = ${trace.toFixed(2)}. `;
        if (ratio > 3) {
            traceDetInterpret += `Eigenvalue ratio ${ratio.toFixed(1)}:1 → highly correlated data (elongated ellipse). PCA compression will lose little info.`;
        } else if (ratio > 1.5) {
            traceDetInterpret += `Eigenvalue ratio ${ratio.toFixed(1)}:1 → moderate correlation (somewhat elongated ellipse).`;
        } else {
            traceDetInterpret += `Eigenvalue ratio ${ratio.toFixed(1)}:1 → data spreads in multiple directions (rounder ellipse). Both PCs carry information.`;
        }
        document.getElementById('traceDetInterpret').innerHTML = traceDetInterpret;
        
        document.getElementById('lambda1Computed').innerHTML = 
            `<span class="highlight-pc1">λ₁ = ${eigenvalues[0].toFixed(4)}</span> (PC1 - larger)`;
        document.getElementById('lambda2Computed').innerHTML = 
            `<span class="highlight-pc2">λ₂ = ${eigenvalues[1].toFixed(4)}</span> (PC2 - smaller)`;
        document.getElementById('v1Computed').innerHTML = 
            `<span class="highlight-pc1">v₁ = (${eigenvectors[0][0].toFixed(3)}, ${eigenvectors[0][1].toFixed(3)})</span>`;
        document.getElementById('v2Computed').innerHTML = 
            `<span class="highlight-pc2">v₂ = (${eigenvectors[1][0].toFixed(3)}, ${eigenvectors[1][1].toFixed(3)})</span>`;

        // Ellipse/variance explained
        const std1 = Math.sqrt(eigenvalues[0]);
        const std2 = Math.sqrt(eigenvalues[1]);
        const angle = Math.atan2(eigenvectors[0][1], eigenvectors[0][0]) * 180 / Math.PI;
        document.getElementById('axis1Computed').innerHTML = 
            `<span class="highlight-pc1">√λ₁ = ${std1.toFixed(3)}</span> (PC1 std dev)`;
        document.getElementById('axis2Computed').innerHTML = 
            `<span class="highlight-pc2">√λ₂ = ${std2.toFixed(3)}</span> (PC2 std dev)`;
        document.getElementById('angleComputed').innerHTML = 
            `Rotation angle θ = <strong>${angle.toFixed(1)}°</strong>`;

        const totalVar = eigenvalues[0] + eigenvalues[1];
        const pct1 = totalVar > 0 ? (eigenvalues[0] / totalVar * 100) : 50;
        const pct2 = totalVar > 0 ? (eigenvalues[1] / totalVar * 100) : 50;
        document.getElementById('var1Explained').innerHTML = 
            `<span class="highlight-pc1">PC1: ${pct1.toFixed(1)}%</span>`;
        document.getElementById('var2Explained').innerHTML = 
            `<span class="highlight-pc2">PC2: ${pct2.toFixed(1)}%</span>`;

        // Step 4: Projection info
        document.getElementById('infoRetained').innerHTML = 
            `<span class="highlight-pc1">Information retained (PC1): ${pct1.toFixed(1)}%</span>`;
        document.getElementById('infoLost').innerHTML = 
            `<span class="highlight-pc2">Information lost (PC2): ${pct2.toFixed(1)}%</span>`;
    }

    function computeAllValues() {
        mean = computeMean(originalPoints);
        centeredPoints = centerPoints(originalPoints, mean);
        covMatrix = computeCovariance(centeredPoints);
        const result = computeEigen(covMatrix);
        eigenvalues = result.eigenvalues;
        eigenvectors = result.eigenvectors;
        updateMathDisplay();
    }

    function resetAll() {
        originalPoints = [];
        centeredPoints = [];
        mean = [0, 0];
        covMatrix = [[1, 0], [0, 1]];
        eigenvalues = [1, 1];
        eigenvectors = [[1, 0], [0, 1]];
        
        // Reset toggle states
        step1Shown = false;
        step2Shown = false;
        step3PC1Shown = false;
        step3PC2Shown = false;
        step3EllipseShown = false;
        step4Shown = false;

        updatePointCount();
        updateDataTable();
        
        // Reset button states
        updateButtonState('btnToggleStep1', false);
        updateButtonState('btnToggleStep2', false);
        updateButtonState('btnToggleStep3PC1', false);
        updateButtonState('btnToggleStep3PC2', false);
        updateButtonState('btnToggleStep3Ellipse', false);
        updateButtonState('btnToggleStep4', false);

        // Hide all steps except step 0
        for (let i = 1; i <= 4; i++) {
            document.getElementById(`step${i}Section`).classList.add('hidden');
        }

        // Clear all canvases
        for (let key in contexts) {
            drawGrid(contexts[key]);
        }

        document.getElementById('step0Section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // -----------------------------------------
    // EVENT HANDLERS
    // -----------------------------------------
    canvases.c0.addEventListener('click', function(e) {
        const rect = canvases.c0.getBoundingClientRect();
        const scaleX = CANVAS_SIZE / rect.width;
        const scaleY = CANVAS_SIZE / rect.height;
        const cx = (e.clientX - rect.left) * scaleX;
        const cy = (e.clientY - rect.top) * scaleY;
        const [x, y] = toLogical(cx, cy);

        if (x >= LOGICAL_MIN && x <= LOGICAL_MAX && y >= LOGICAL_MIN && y <= LOGICAL_MAX) {
            originalPoints.push([x, y]);
            updatePointCount();
            updateDataTable();
            renderCanvas0();
        }
    });

    // Toggle button handlers
    document.getElementById('btnToggleStep1').addEventListener('click', () => {
        step1Shown = !step1Shown;
        updateButtonState('btnToggleStep1', step1Shown);
        renderCanvas1();
    });

    document.getElementById('btnToggleStep2').addEventListener('click', () => {
        step2Shown = !step2Shown;
        updateButtonState('btnToggleStep2', step2Shown);
        renderCanvas2();
    });

    document.getElementById('btnToggleStep3PC1').addEventListener('click', () => {
        step3PC1Shown = !step3PC1Shown;
        updateButtonState('btnToggleStep3PC1', step3PC1Shown);
        renderCanvas3();
    });

    document.getElementById('btnToggleStep3PC2').addEventListener('click', () => {
        step3PC2Shown = !step3PC2Shown;
        updateButtonState('btnToggleStep3PC2', step3PC2Shown);
        renderCanvas3();
    });

    document.getElementById('btnToggleStep3Ellipse').addEventListener('click', () => {
        step3EllipseShown = !step3EllipseShown;
        updateButtonState('btnToggleStep3Ellipse', step3EllipseShown);
        renderCanvas3();
    });

    document.getElementById('btnToggleStep4').addEventListener('click', () => {
        step4Shown = !step4Shown;
        updateButtonState('btnToggleStep4', step4Shown);
        renderCanvas4();
    });

    document.getElementById('btnRandom').addEventListener('click', () => {
        originalPoints = generateRandom();
        updatePointCount();
        updateDataTable();
        renderCanvas0();
    });

    document.getElementById('btnCorrelated').addEventListener('click', () => {
        // 50% chance for positive correlation, 50% for negative
        originalPoints = Math.random() < 0.5 ? generateCorrelated() : generateNegCorrelated();
        updatePointCount();
        updateDataTable();
        renderCanvas0();
    });

    document.getElementById('btnCircular').addEventListener('click', () => {
        originalPoints = generateCircular();
        updatePointCount();
        updateDataTable();
        renderCanvas0();
    });

    document.getElementById('btnClear').addEventListener('click', resetAll);

    // Step progression buttons
    document.getElementById('btnStartStep1').addEventListener('click', () => {
        computeAllValues();
        step1Shown = false;
        updateButtonState('btnToggleStep1', false);
        renderCanvas1();
        showStep(1);
    });

    document.getElementById('btnStartStep2').addEventListener('click', () => {
        step2Shown = false;
        updateButtonState('btnToggleStep2', false);
        renderCanvas2();
        showStep(2);
    });

    document.getElementById('btnStartStep3').addEventListener('click', () => {
        step3PC1Shown = false;
        step3PC2Shown = false;
        step3EllipseShown = false;
        updateButtonState('btnToggleStep3PC1', false);
        updateButtonState('btnToggleStep3PC2', false);
        updateButtonState('btnToggleStep3Ellipse', false);
        renderCanvas3();
        showStep(3);
    });

    document.getElementById('btnStartStep4').addEventListener('click', () => {
        step4Shown = false;
        updateButtonState('btnToggleStep4', false);
        renderCanvas4();
        showStep(4);
    });

    document.getElementById('btnRestart').addEventListener('click', resetAll);

    // -----------------------------------------
    // COVARIANCE EXPLORER (Interactive Mini-Demo)
    // -----------------------------------------
    const covExplorerCanvas = document.getElementById('covExplorerCanvas');
    const covExplorerCtx = covExplorerCanvas.getContext('2d');
    const COV_SIZE = 200;
    const COV_RANGE = 6; // -3 to 3 logical range
    
    // Generate fixed sample points for the explorer (bivariate standard normal approximation)
    const explorerSamplePoints = [];
    for (let i = 0; i < 50; i++) {
        // Box-Muller for standard normal
        const u1 = Math.random(), u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
        explorerSamplePoints.push([z0, z1]);
    }
    
    function covToCanvasExplorer(x, y) {
        const cx = ((x + COV_RANGE/2) / COV_RANGE) * COV_SIZE;
        const cy = COV_SIZE - ((y + COV_RANGE/2) / COV_RANGE) * COV_SIZE;
        return [cx, cy];
    }
    
    function scaleLengthExplorer(len) {
        return (len / COV_RANGE) * COV_SIZE;
    }
    
    function drawCovExplorer() {
        const varX = parseFloat(document.getElementById('varXSlider').value);
        const varY = parseFloat(document.getElementById('varYSlider').value);
        
        // Compute valid range for covariance (positive semi-definite constraint)
        const maxCov = Math.sqrt(varX * varY);
        const covSlider = document.getElementById('covXYSlider');
        
        // Keep slider range fixed, but clamp the effective value
        // (Changing min/max dynamically causes browser step-snapping bugs)
        const rawCovXY = parseFloat(covSlider.value);
        const covXY = Math.max(-maxCov, Math.min(maxCov, rawCovXY));
        
        // Update display values
        document.getElementById('varXSliderVal').textContent = varX.toFixed(2);
        document.getElementById('varYSliderVal').textContent = varY.toFixed(2);
        
        // Show effective covariance (may be clamped)
        const covLabel = document.getElementById('covXYSliderVal');
        if (Math.abs(rawCovXY) > maxCov + 0.001) {
            // Value is being clamped - show both
            covLabel.innerHTML = `<span style="text-decoration: line-through; color: #999;">${rawCovXY.toFixed(2)}</span> → ${covXY.toFixed(2)}`;
        } else {
            covLabel.textContent = covXY.toFixed(2);
        }
        
        // Update the valid range hint
        document.getElementById('covRangeHint').textContent = 
            `Valid range: [−${maxCov.toFixed(2)}, ${maxCov.toFixed(2)}] — variables can't co-vary more than they each vary on their own (Cov² ≤ Var(x)·Var(y))`;
        
        // Update matrix display
        document.getElementById('covMatDisplay00').textContent = varX.toFixed(2);
        document.getElementById('covMatDisplay01').textContent = covXY.toFixed(2);
        document.getElementById('covMatDisplay10').textContent = covXY.toFixed(2);
        document.getElementById('covMatDisplay11').textContent = varY.toFixed(2);
        
        // Compute eigenvalues for this covariance matrix
        const trace = varX + varY;
        const det = varX * varY - covXY * covXY;
        const disc = Math.sqrt(Math.max(0, trace * trace / 4 - det));
        const lambda1 = trace / 2 + disc;
        const lambda2 = trace / 2 - disc;
        
        // Compute eigenvector for lambda1
        let v1x, v1y;
        if (Math.abs(covXY) > 1e-10) {
            v1x = lambda1 - varY;
            v1y = covXY;
        } else if (varX >= varY) {
            v1x = 1; v1y = 0;
        } else {
            v1x = 0; v1y = 1;
        }
        const norm = Math.sqrt(v1x * v1x + v1y * v1y);
        v1x /= norm; v1y /= norm;
        
        const rotation = Math.atan2(v1y, v1x);
        const a = Math.sqrt(lambda1) * 2; // 2 sigma
        const b = Math.sqrt(lambda2) * 2;
        
        // Clear and draw background
        covExplorerCtx.clearRect(0, 0, COV_SIZE, COV_SIZE);
        covExplorerCtx.fillStyle = '#fafafa';
        covExplorerCtx.fillRect(0, 0, COV_SIZE, COV_SIZE);
        
        // Draw light grid
        covExplorerCtx.strokeStyle = '#e8e8e8';
        covExplorerCtx.lineWidth = 1;
        for (let i = -2; i <= 2; i++) {
            const [vx] = covToCanvasExplorer(i, 0);
            covExplorerCtx.beginPath();
            covExplorerCtx.moveTo(vx, 0);
            covExplorerCtx.lineTo(vx, COV_SIZE);
            covExplorerCtx.stroke();
            
            const [, hy] = covToCanvasExplorer(0, i);
            covExplorerCtx.beginPath();
            covExplorerCtx.moveTo(0, hy);
            covExplorerCtx.lineTo(COV_SIZE, hy);
            covExplorerCtx.stroke();
        }
        
        // Draw axes
        covExplorerCtx.strokeStyle = '#bbb';
        covExplorerCtx.lineWidth = 1;
        const [cx, cy] = covToCanvasExplorer(0, 0);
        covExplorerCtx.beginPath();
        covExplorerCtx.moveTo(0, cy);
        covExplorerCtx.lineTo(COV_SIZE, cy);
        covExplorerCtx.stroke();
        covExplorerCtx.beginPath();
        covExplorerCtx.moveTo(cx, 0);
        covExplorerCtx.lineTo(cx, COV_SIZE);
        covExplorerCtx.stroke();
        
        // Transform and draw sample points
        // For a covariance matrix Σ = [[varX, covXY], [covXY, varY]]
        // We need to find L such that L*L^T = Σ (Cholesky decomposition)
        // L = [[sqrt(varX), 0], [covXY/sqrt(varX), sqrt(varY - covXY^2/varX)]]
        const L00 = Math.sqrt(varX);
        const L10 = covXY / L00;
        const L11Sq = varY - covXY * covXY / varX;
        const L11 = Math.sqrt(Math.max(0, L11Sq));
        
        // Draw transformed points
        covExplorerCtx.fillStyle = 'rgba(52, 152, 219, 0.6)';
        explorerSamplePoints.forEach(([z0, z1]) => {
            // Transform: [x, y] = L * [z0, z1]
            const x = L00 * z0;
            const y = L10 * z0 + L11 * z1;
            const [px, py] = covToCanvasExplorer(x, y);
            if (px >= 0 && px <= COV_SIZE && py >= 0 && py <= COV_SIZE) {
                covExplorerCtx.beginPath();
                covExplorerCtx.arc(px, py, 3, 0, Math.PI * 2);
                covExplorerCtx.fill();
            }
        });
        
        // Draw ellipse
        const canvasA = scaleLengthExplorer(a);
        const canvasB = scaleLengthExplorer(b);
        
        covExplorerCtx.save();
        covExplorerCtx.translate(cx, cy);
        covExplorerCtx.rotate(-rotation);
        
        covExplorerCtx.strokeStyle = '#9b59b6';
        covExplorerCtx.lineWidth = 2;
        covExplorerCtx.setLineDash([4, 3]);
        covExplorerCtx.beginPath();
        covExplorerCtx.ellipse(0, 0, canvasA, canvasB, 0, 0, Math.PI * 2);
        covExplorerCtx.stroke();
        
        covExplorerCtx.fillStyle = 'rgba(155, 89, 182, 0.08)';
        covExplorerCtx.beginPath();
        covExplorerCtx.ellipse(0, 0, canvasA, canvasB, 0, 0, Math.PI * 2);
        covExplorerCtx.fill();
        
        covExplorerCtx.setLineDash([]);
        covExplorerCtx.restore();
        
        // Draw PC axes (short vectors from center)
        const pcScale = 1.5;
        const pc1Len = Math.sqrt(lambda1) * pcScale;
        const pc2Len = Math.sqrt(lambda2) * pcScale;
        
        // PC1 (red)
        const [pc1x, pc1y] = covToCanvasExplorer(v1x * pc1Len, v1y * pc1Len);
        covExplorerCtx.strokeStyle = '#e74c3c';
        covExplorerCtx.lineWidth = 2;
        covExplorerCtx.beginPath();
        covExplorerCtx.moveTo(cx, cy);
        covExplorerCtx.lineTo(pc1x, pc1y);
        covExplorerCtx.stroke();
        
        // PC2 (purple) - perpendicular to PC1
        const v2x = -v1y, v2y = v1x;
        const [pc2x, pc2y] = covToCanvasExplorer(v2x * pc2Len, v2y * pc2Len);
        covExplorerCtx.strokeStyle = '#9b59b6';
        covExplorerCtx.lineWidth = 2;
        covExplorerCtx.beginPath();
        covExplorerCtx.moveTo(cx, cy);
        covExplorerCtx.lineTo(pc2x, pc2y);
        covExplorerCtx.stroke();
        
        // Update info text
        const infoEl = document.getElementById('covExplorerInfo');
        const correlation = covXY / Math.sqrt(varX * varY);
        let info = '';
        
        if (Math.abs(correlation) < 0.1) {
            if (Math.abs(varX - varY) < 0.2) {
                info = 'Equal variances, no correlation → circular distribution';
            } else if (varX > varY) {
                info = 'No correlation, but wider horizontally → axis-aligned ellipse';
            } else {
                info = 'No correlation, but wider vertically → axis-aligned ellipse';
            }
        } else if (correlation > 0) {
            info = `Positive correlation (r=${correlation.toFixed(2)}) → tilted upward ↗`;
        } else {
            info = `Negative correlation (r=${correlation.toFixed(2)}) → tilted downward ↘`;
        }
        
        const varExplained = (lambda1 / (lambda1 + lambda2) * 100).toFixed(0);
        info += ` | PC1 explains ${varExplained}%`;
        
        infoEl.textContent = info;
    }
    
    // Event listeners for sliders
    document.getElementById('varXSlider').addEventListener('input', drawCovExplorer);
    document.getElementById('varYSlider').addEventListener('input', drawCovExplorer);
    document.getElementById('covXYSlider').addEventListener('input', drawCovExplorer);

    // -----------------------------------------
    // INITIALIZATION
    // -----------------------------------------
    function init() {
        for (let key in contexts) {
            drawGrid(contexts[key]);
        }
        // Initialize covariance explorer
        drawCovExplorer();
    }

    init();
})();

