// Cosine Similarity Interactive Visualization

class CosineSimilarityVisualization {
    constructor() {
        this.canvas = document.getElementById('vectorCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Canvas dimensions and center
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.scale = 150; // Pixels per unit — unit circle fills most of the canvas
        this.maxCoord = 1.25; // Visible coordinate range
        
        // Unit vectors (normalized, living on the unit circle)
        const angleA = Math.PI / 6;  // 30°
        const angleB = Math.PI / 2.5; // 72°
        this.vectorA = { x: Math.cos(angleA), y: Math.sin(angleA) };
        this.vectorB = { x: Math.cos(angleB), y: Math.sin(angleB) };
        
        // Interaction state
        this.dragging = null;
        
        this.setupEventListeners();
        this.setupResizeListener();
        this.setupMainFormula();
        this.update();
    }
    
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', () => this.handleMouseUp());
    }
    
    setupResizeListener() {
        // Listen for window resize to update formula layout
        window.addEventListener('resize', () => {
            // Debounce resize events
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.setupMainFormula();
                this.updateDisplay();
            }, 250);
        });
    }
    
    setupMainFormula() {
        const desktopFormula = `$$\\cos(\\theta) = \\hat{\\mathbf{A}} \\cdot \\hat{\\mathbf{B}} = A_x B_x + A_y B_y \\qquad \\text{(for unit vectors } |\\hat{\\mathbf{A}}| = |\\hat{\\mathbf{B}}| = 1\\text{)}$$`;
        
        const mobileFormula = `$$\\begin{align}
\\cos(\\theta) &= \\hat{\\mathbf{A}} \\cdot \\hat{\\mathbf{B}} \\\\[0.5em]
&= A_x B_x + A_y B_y
\\end{align}$$`;
        
        const isMobile = window.innerWidth <= 768;
        const formulaToUse = isMobile ? mobileFormula : desktopFormula;
        
        const mainFormulaElement = document.getElementById('mainFormula');
        if (mainFormulaElement) {
            mainFormulaElement.innerHTML = formulaToUse;
            if (window.MathJax) {
                window.MathJax.typesetPromise([mainFormulaElement]).catch((err) => console.log(err.message));
            }
        }
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }
    
    getTouchPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return {
            x: (e.touches[0].clientX - rect.left) * scaleX,
            y: (e.touches[0].clientY - rect.top) * scaleY
        };
    }
    
    screenToCanvas(screenX, screenY) {
        return {
            x: (screenX - this.centerX) / this.scale,
            y: -(screenY - this.centerY) / this.scale // Flip Y axis
        };
    }
    
    canvasToScreen(canvasX, canvasY) {
        return {
            x: canvasX * this.scale + this.centerX,
            y: -canvasY * this.scale + this.centerY // Flip Y axis
        };
    }
    
    normalizeVector(x, y) {
        const mag = Math.sqrt(x * x + y * y);
        if (mag === 0) return { x: 1, y: 0 };
        return { x: x / mag, y: y / mag };
    }
    
    getVectorEndpoint(vector) {
        return this.canvasToScreen(vector.x, vector.y);
    }
    
    isPointNearEndpoint(mouseX, mouseY, vector, threshold = 15) {
        const endpoint = this.getVectorEndpoint(vector);
        const distance = Math.sqrt(
            Math.pow(mouseX - endpoint.x, 2) + 
            Math.pow(mouseY - endpoint.y, 2)
        );
        return distance <= threshold;
    }
    
    handleMouseDown(e) {
        const mousePos = this.getMousePos(e);
        
        if (this.isPointNearEndpoint(mousePos.x, mousePos.y, this.vectorA)) {
            this.dragging = 'A';
        } else if (this.isPointNearEndpoint(mousePos.x, mousePos.y, this.vectorB)) {
            this.dragging = 'B';
        }
    }
    
    handleMouseMove(e) {
        if (this.dragging) {
            const mousePos = this.getMousePos(e);
            const canvasPos = this.screenToCanvas(mousePos.x, mousePos.y);
            const normalized = this.normalizeVector(canvasPos.x, canvasPos.y);
            
            if (this.dragging === 'A') {
                this.vectorA = normalized;
            } else if (this.dragging === 'B') {
                this.vectorB = normalized;
            }
            
            this.update();
        } else {
            const mousePos = this.getMousePos(e);
            if (this.isPointNearEndpoint(mousePos.x, mousePos.y, this.vectorA) ||
                this.isPointNearEndpoint(mousePos.x, mousePos.y, this.vectorB)) {
                this.canvas.style.cursor = 'grab';
            } else {
                this.canvas.style.cursor = 'default';
            }
        }
    }
    
    handleMouseUp() {
        if (this.dragging) {
            this.canvas.style.cursor = 'default';
        }
        this.dragging = null;
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        const touchPos = this.getTouchPos(e);
        // Create a mock mouse event with the correct structure
        const mockEvent = {
            clientX: e.touches[0].clientX,
            clientY: e.touches[0].clientY
        };
        this.handleMouseDown(mockEvent);
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        const touchPos = this.getTouchPos(e);
        // Create a mock mouse event with the correct structure
        const mockEvent = {
            clientX: e.touches[0].clientX,
            clientY: e.touches[0].clientY
        };
        this.handleMouseMove(mockEvent);
    }
    
    calculateCosineSimilarity() {
        // Dot product
        const dotProduct = this.vectorA.x * this.vectorB.x + this.vectorA.y * this.vectorB.y;
        
        // Magnitudes (should be 1 for unit vectors, but calculate anyway)
        const magnitudeA = Math.sqrt(this.vectorA.x * this.vectorA.x + this.vectorA.y * this.vectorA.y);
        const magnitudeB = Math.sqrt(this.vectorB.x * this.vectorB.x + this.vectorB.y * this.vectorB.y);
        
        // Cosine similarity
        const cosineSimilarity = dotProduct / (magnitudeA * magnitudeB);
        
        // Angle in radians and degrees
        const angleRad = Math.acos(Math.max(-1, Math.min(1, cosineSimilarity)));
        const angleDeg = angleRad * (180 / Math.PI);
        
        return {
            dotProduct,
            magnitudeA,
            magnitudeB,
            cosineSimilarity,
            angleRad,
            angleDeg
        };
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.drawGrid();
        this.drawAxes();
        this.drawUnitCircle();
        this.drawCoordinateLabels();
        this.drawAngleArc();
        this.drawVector(this.vectorA, '#dc3545', 'A');
        this.drawVector(this.vectorB, '#007bff', 'B');
        this.drawProjection();
        this.drawCornerInfo();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#e8e8e8';
        this.ctx.lineWidth = 0.5;
        
        const steps = [-1, 1];
        for (const i of steps) {
            const x = this.centerX + i * this.scale;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
            
            const y = this.centerY + i * this.scale;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }
    
    drawUnitCircle() {
        this.ctx.strokeStyle = '#bbb';
        this.ctx.lineWidth = 1.5;
        this.ctx.setLineDash([6, 4]);
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.scale, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    drawProjection() {
        const cos = this.vectorA.x * this.vectorB.x + this.vectorA.y * this.vectorB.y;
        
        // Projection of B onto A: proj = cos(alpha) * Â  (since |A|=1)
        const projX = cos * this.vectorA.x;
        const projY = cos * this.vectorA.y;
        
        const projScreen = this.canvasToScreen(projX, projY);
        const bScreen = this.getVectorEndpoint(this.vectorB);
        
        // Dashed line from B endpoint down to the projection point on A
        this.ctx.strokeStyle = '#888';
        this.ctx.lineWidth = 1.5;
        this.ctx.setLineDash([4, 4]);
        this.ctx.beginPath();
        this.ctx.moveTo(bScreen.x, bScreen.y);
        this.ctx.lineTo(projScreen.x, projScreen.y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Right-angle marker at the projection point
        const markerSize = 8;
        // Direction along A (unit vector in screen space)
        const aLen = Math.sqrt(
            (this.getVectorEndpoint(this.vectorA).x - this.centerX) ** 2 +
            (this.getVectorEndpoint(this.vectorA).y - this.centerY) ** 2
        );
        const aScreenEnd = this.getVectorEndpoint(this.vectorA);
        const aDirX = (aScreenEnd.x - this.centerX) / aLen;
        const aDirY = (aScreenEnd.y - this.centerY) / aLen;
        // Perpendicular direction (towards B side)
        const perpX = -(aDirY);
        const perpY = aDirX;
        // Determine which side B is on so the marker points towards B
        const toBx = bScreen.x - projScreen.x;
        const toBy = bScreen.y - projScreen.y;
        const sign = (perpX * toBx + perpY * toBy) >= 0 ? 1 : -1;
        
        this.ctx.strokeStyle = '#888';
        this.ctx.lineWidth = 1.2;
        this.ctx.beginPath();
        this.ctx.moveTo(
            projScreen.x + sign * perpX * markerSize,
            projScreen.y + sign * perpY * markerSize
        );
        this.ctx.lineTo(
            projScreen.x + sign * perpX * markerSize - aDirX * markerSize * (cos >= 0 ? 1 : -1),
            projScreen.y + sign * perpY * markerSize - aDirY * markerSize * (cos >= 0 ? 1 : -1)
        );
        this.ctx.lineTo(
            projScreen.x - aDirX * markerSize * (cos >= 0 ? 1 : -1),
            projScreen.y - aDirY * markerSize * (cos >= 0 ? 1 : -1)
        );
        this.ctx.stroke();
        
        // Thick colored segment from origin to projection point (the "shadow")
        this.ctx.strokeStyle = '#e8960e';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, this.centerY);
        this.ctx.lineTo(projScreen.x, projScreen.y);
        this.ctx.stroke();
        
        // Small filled circle at projection point
        this.ctx.fillStyle = '#e8960e';
        this.ctx.beginPath();
        this.ctx.arc(projScreen.x, projScreen.y, 4, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    drawAxes() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1.5;
        
        // X axis
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.centerY);
        this.ctx.lineTo(this.width, this.centerY);
        this.ctx.stroke();
        
        // Y axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, 0);
        this.ctx.lineTo(this.centerX, this.height);
        this.ctx.stroke();
        
        this.drawArrowHead(this.width - 4, this.centerY, 0);
        this.drawArrowHead(this.centerX, 4, -Math.PI / 2);
    }
    
    drawArrowHead(x, y, angle) {
        const size = 8;
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle);
        this.ctx.fillStyle = '#333';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(-size, -size/2);
        this.ctx.lineTo(-size, size/2);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    }
    
    drawAngleArc() {
        const calculations = this.calculateCosineSimilarity();
        // Flip Y coordinates for canvas coordinate system
        const angleA = Math.atan2(-this.vectorA.y, this.vectorA.x);
        const angleB = Math.atan2(-this.vectorB.y, this.vectorB.x);
        
        // Always draw the smaller angle between vectors
        // Calculate both possible angle differences
        let diff1 = angleB - angleA;
        let diff2 = diff1 > 0 ? diff1 - 2 * Math.PI : diff1 + 2 * Math.PI;
        
        // Choose the smaller absolute difference
        let angleDiff = Math.abs(diff1) <= Math.abs(diff2) ? diff1 : diff2;
        
        // Set start and end angles
        let startAngle, endAngle;
        if (angleDiff >= 0) {
            startAngle = angleA;
            endAngle = angleA + angleDiff;
        } else {
            startAngle = angleA + angleDiff;
            endAngle = angleA;
        }
        
        const arcRadius = 40;
        
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([3, 3]);
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, arcRadius, startAngle, endAngle);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        let midAngle = (startAngle + endAngle) / 2;
        
        const labelX = this.centerX + Math.cos(midAngle) * (arcRadius + 16);
        const labelY = this.centerY + Math.sin(midAngle) * (arcRadius + 16);
        
        this.ctx.fillStyle = '#555';
        this.ctx.font = 'italic 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('θ', labelX, labelY);
    }
    
    drawVector(vector, color, label) {
        const endpoint = this.getVectorEndpoint(vector);
        
        // Vector line
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, this.centerY);
        this.ctx.lineTo(endpoint.x, endpoint.y);
        this.ctx.stroke();
        
        // Endpoint circle
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(endpoint.x, endpoint.y, 8, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // White center for endpoint
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(endpoint.x, endpoint.y, 4, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Vector label
        this.ctx.fillStyle = color;
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const labelOffset = 20;
        const labelX = endpoint.x + (vector.x > 0 ? labelOffset : -labelOffset);
        const labelY = endpoint.y + (vector.y > 0 ? -labelOffset : labelOffset);
        
        this.ctx.fillText(label, labelX, labelY);
    }
    
    drawCoordinateLabels() {
        this.ctx.fillStyle = '#666';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        for (const i of [-1, 1]) {
            const x = this.centerX + i * this.scale;
            this.ctx.fillText(i.toString(), x, this.centerY + 16);
            const y = this.centerY - i * this.scale;
            this.ctx.fillText(i.toString(), this.centerX - 16, y);
        }
        
        this.ctx.fillText('0', this.centerX - 12, this.centerY + 14);
    }
    
    drawCornerInfo() {
        const cos = this.vectorA.x * this.vectorB.x + this.vectorA.y * this.vectorB.y;
        const angleDeg = Math.acos(Math.max(-1, Math.min(1, cos))) * (180 / Math.PI);
        
        const x = 12;
        const y = 18;
        
        this.ctx.fillStyle = 'rgba(255,255,255,0.85)';
        this.ctx.fillRect(x - 4, y - 14, 130, 40);
        
        this.ctx.font = 'bold 13px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        
        this.ctx.fillStyle = '#555';
        this.ctx.fillText(`θ = ${angleDeg.toFixed(1)}°`, x, y);
        
        this.ctx.fillStyle = '#b37400';
        this.ctx.fillText(`cos θ = ${cos.toFixed(2)}`, x, y + 20);
    }
    
    updateDisplay() {
        const calculations = this.calculateCosineSimilarity();
        const cos = calculations.cosineSimilarity;
        
        document.getElementById('cosineSimilarityLive').textContent = cos.toFixed(2);
        document.getElementById('angleLive').textContent = calculations.angleDeg.toFixed(2) + '°';
        document.getElementById('projectionLive').textContent = cos.toFixed(2);
        
        document.getElementById('vectorAComponents').textContent =
            `(${this.vectorA.x.toFixed(2)}, ${this.vectorA.y.toFixed(2)})`;
        document.getElementById('vectorBComponents').textContent =
            `(${this.vectorB.x.toFixed(2)}, ${this.vectorB.y.toFixed(2)})`;
        
        const ax = this.vectorA.x.toFixed(2);
        const ay = this.vectorA.y.toFixed(2);
        const bx = this.vectorB.x.toFixed(2);
        const by = this.vectorB.y.toFixed(2);
        
        const latexCalc = `$$\\cos(\\theta) = \\hat{\\mathbf{A}} \\cdot \\hat{\\mathbf{B}} = (${ax})(${bx}) + (${ay})(${by}) = ${cos.toFixed(2)}$$`;
        
        const latexCalcMobile = `$$\\begin{align}
\\cos(\\theta) &= \\hat{\\mathbf{A}} \\cdot \\hat{\\mathbf{B}} \\\\[0.5em]
&= (${ax})(${bx}) + (${ay})(${by}) \\\\[0.5em]
&= ${cos.toFixed(2)}
\\end{align}$$`;
        
        const isMobile = window.innerWidth <= 768;
        const formulaToUse = isMobile ? latexCalcMobile : latexCalc;
        
        document.getElementById('fullCalculation').innerHTML = formulaToUse;
        
        if (window.MathJax) {
            window.MathJax.typesetPromise([document.getElementById('fullCalculation')]).catch((err) => console.log(err.message));
        }
    }
    
    
    drawCosineGraph() {
        const canvas = document.getElementById('cosineGraphCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;
        
        ctx.clearRect(0, 0, W, H);
        
        const padL = 45, padR = 20, padT = 25, padB = 40;
        const plotW = W - padL - padR;
        const plotH = H - padT - padB;
        const midY = padT + plotH / 2;
        
        const degToX = (deg) => padL + (deg / 360) * plotW;
        const valToY = (v) => midY - v * (plotH / 2);
        
        // Grid lines for key values
        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 1;
        for (const v of [1, 0.5, -0.5, -1]) {
            const y = valToY(v);
            ctx.beginPath();
            ctx.moveTo(padL, y);
            ctx.lineTo(padL + plotW, y);
            ctx.stroke();
        }
        for (const deg of [90, 180, 270, 360]) {
            const x = degToX(deg);
            ctx.beginPath();
            ctx.moveTo(x, padT);
            ctx.lineTo(x, padT + plotH);
            ctx.stroke();
        }
        
        // Axes
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(padL, midY);
        ctx.lineTo(padL + plotW + 8, midY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(padL, padT - 5);
        ctx.lineTo(padL, padT + plotH + 5);
        ctx.stroke();
        
        // Y-axis labels
        ctx.fillStyle = '#555';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (const v of [1, 0.5, 0, -0.5, -1]) {
            ctx.fillText(v.toFixed(1), padL - 6, valToY(v));
        }
        
        // X-axis labels
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (const deg of [0, 90, 180, 270, 360]) {
            ctx.fillText(deg + '°', degToX(deg), padT + plotH + 8);
        }
        
        // Y-axis title
        ctx.save();
        ctx.translate(12, midY);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'italic 13px Arial';
        ctx.fillStyle = '#555';
        ctx.fillText('cos θ', 0, 0);
        ctx.restore();
        
        // Cosine curve: 0°-180° (relevant range) as solid, 180°-360° as dotted/faded
        // First draw the faded 180°-360° portion (behind)
        ctx.strokeStyle = 'rgba(0, 102, 204, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        for (let deg = 180; deg <= 360; deg += 1) {
            const x = degToX(deg);
            const y = valToY(Math.cos(deg * Math.PI / 180));
            if (deg === 180) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Then draw the solid 0°-180° portion (in front)
        ctx.strokeStyle = '#0066cc';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let deg = 0; deg <= 180; deg += 1) {
            const x = degToX(deg);
            const y = valToY(Math.cos(deg * Math.PI / 180));
            if (deg === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Key-point dots (no labels - values readable from y-axis)
        const keyPoints = [
            { deg: 0, faded: false },
            { deg: 90, faded: false },
            { deg: 180, faded: false },
            { deg: 270, faded: true },
            { deg: 360, faded: true }
        ];
        for (const pt of keyPoints) {
            const x = degToX(pt.deg);
            const cosVal = Math.cos(pt.deg * Math.PI / 180);
            const y = valToY(cosVal);
            ctx.fillStyle = pt.faded ? 'rgba(0, 102, 204, 0.3)' : '#0066cc';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // Current angle marker
        const calc = this.calculateCosineSimilarity();
        const curDeg = calc.angleDeg;
        const curCos = calc.cosineSimilarity;
        const mx = degToX(curDeg);
        const my = valToY(curCos);
        
        // Vertical dashed line
        ctx.strokeStyle = 'rgba(232, 150, 14, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(mx, padT);
        ctx.lineTo(mx, padT + plotH);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Horizontal dashed line to y-axis
        ctx.beginPath();
        ctx.setLineDash([4, 3]);
        ctx.moveTo(padL, my);
        ctx.lineTo(mx, my);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Dot at current position
        ctx.fillStyle = '#e8960e';
        ctx.beginPath();
        ctx.arc(mx, my, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Label
        ctx.fillStyle = '#b37400';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`θ = ${curDeg.toFixed(1)}°`, mx + 10, my - 4);
        ctx.fillText(`cos θ = ${curCos.toFixed(2)}`, mx + 10, my + 12);
    }
    
    update() {
        this.draw();
        this.updateDisplay();
        this.drawCosineGraph();
    }
}

// Initialize the visualization when the page loads
function initVisualization() {
    const canvas = document.getElementById('vectorCanvas');
    if (canvas) {
        new CosineSimilarityVisualization();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVisualization);
} else {
    initVisualization();
}
