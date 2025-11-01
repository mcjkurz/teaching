// Attention Keys and Queries Interactive Visualization

class AttentionVisualization {
    constructor() {
        this.canvas = document.getElementById('vectorCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Canvas dimensions and center
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.scale = 150; // Scale factor for coordinate system (pixels per unit)
        this.maxCoord = 1; // Maximum coordinate value (-1 to 1)
        
        // Fixed key vectors (in black) - from Figure 1
        this.keys = {
            '水': { x: 0.7, y: 0.5, color: '#2F4F4F' },  // Water
            '風': { x: 0.5, y: 0.71, color: '#2F4F4F' }, // Wind
            '有': { x: -0.6, y: 0.7, color: '#2F4F4F' }  // Have
        };
        
        // Movable query vector (in red)
        this.query = { x: 0.62, y: 0.62 };
        
        // Interaction state
        this.dragging = false;
        this.dragOffset = { x: 0, y: 0 };
        
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
        
        // Toggle detailed equations
        const toggleBtn = document.getElementById('toggleEquations');
        const hideBtn = document.getElementById('hideEquations');
        const detailedSection = document.getElementById('detailedEquations');
        
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                detailedSection.style.display = 'block';
                this.updateDetailedCalculations();
            });
        }
        
        if (hideBtn) {
            hideBtn.addEventListener('click', (e) => {
                e.preventDefault();
                detailedSection.style.display = 'none';
            });
        }
    }
    
    setupResizeListener() {
        // Listen for window resize to update formula layout
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.setupMainFormula();
                this.updateDisplay();
            }, 250);
        });
    }
    
    setupMainFormula() {
        // Define desktop and mobile versions of the main formula
        const desktopFormula = `$$\\text{Attention}(Q, K) = \\text{softmax}\\left(\\frac{Q \\cdot K^T}{\\sqrt{d_k}}\\right) \\approx \\text{softmax}(Q \\cdot K^T)$$`;
        
        const mobileFormula = `$$\\begin{align}
\\text{Attention}(Q, K) &= \\text{softmax}(Q \\cdot K^T) \\\\[0.5em]
\\text{softmax}(x_i) &= \\frac{e^{x_i}}{\\sum_j e^{x_j}}
\\end{align}$$`;
        
        // Use mobile formula on small screens
        const isMobile = window.innerWidth <= 768;
        const formulaToUse = isMobile ? mobileFormula : desktopFormula;
        
        const mainFormulaElement = document.getElementById('mainFormula');
        if (mainFormulaElement) {
            mainFormulaElement.innerHTML = formulaToUse;
            
            // Re-render MathJax for the updated equation
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
    
    constrainVector(x, y) {
        // Constrain vector components to the valid range
        const constrainedX = Math.max(-this.maxCoord, Math.min(this.maxCoord, x));
        const constrainedY = Math.max(-this.maxCoord, Math.min(this.maxCoord, y));
        return { x: constrainedX, y: constrainedY };
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
        
        if (this.isPointNearEndpoint(mousePos.x, mousePos.y, this.query)) {
            this.dragging = true;
            const endpoint = this.getVectorEndpoint(this.query);
            this.dragOffset = {
                x: mousePos.x - endpoint.x,
                y: mousePos.y - endpoint.y
            };
        }
    }
    
    handleMouseMove(e) {
        if (this.dragging) {
            const mousePos = this.getMousePos(e);
            const adjustedPos = {
                x: mousePos.x - this.dragOffset.x,
                y: mousePos.y - this.dragOffset.y
            };
            
            const canvasPos = this.screenToCanvas(adjustedPos.x, adjustedPos.y);
            const constrained = this.constrainVector(canvasPos.x, canvasPos.y);
            
            this.query = constrained;
            this.update();
        } else {
            // Update cursor
            const mousePos = this.getMousePos(e);
            if (this.isPointNearEndpoint(mousePos.x, mousePos.y, this.query)) {
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
        this.dragging = false;
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        const mockEvent = {
            clientX: e.touches[0].clientX,
            clientY: e.touches[0].clientY
        };
        this.handleMouseDown(mockEvent);
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        const mockEvent = {
            clientX: e.touches[0].clientX,
            clientY: e.touches[0].clientY
        };
        this.handleMouseMove(mockEvent);
    }
    
    calculateDotProduct(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }
    
    softmax(values) {
        const maxVal = Math.max(...values);
        const expValues = values.map(v => Math.exp(v - maxVal));
        const sumExp = expValues.reduce((a, b) => a + b, 0);
        return expValues.map(v => v / sumExp);
    }
    
    calculateAttention() {
        // Calculate dot products between query and each key
        const dotProducts = {};
        const dotProductArray = [];
        
        for (const [label, keyVec] of Object.entries(this.keys)) {
            const dotProd = this.calculateDotProduct(this.query, keyVec);
            dotProducts[label] = dotProd;
            dotProductArray.push(dotProd);
        }
        
        // Apply softmax to get attention weights
        const attentionWeights = this.softmax(dotProductArray);
        const attention = {};
        
        Object.keys(this.keys).forEach((label, idx) => {
            attention[label] = attentionWeights[idx];
        });
        
        return {
            dotProducts,
            attention
        };
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw axes
        this.drawAxes();
        
        // Draw key vectors (fixed, in black)
        for (const [label, keyVec] of Object.entries(this.keys)) {
            this.drawVector(keyVec, keyVec.color, `K(${label})`, false);
        }
        
        // Draw query vector (movable, in red)
        this.drawVector(this.query, '#CB0000', 'Q', true);
        
        // Draw coordinate labels
        this.drawCoordinateLabels();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 0.5;
        
        const gridSpacing = this.scale / 5; // 0.2 unit spacing
        const maxPixels = this.maxCoord * this.scale;
        
        // Vertical lines
        for (let i = -5; i <= 5; i++) {
            const x = this.centerX + i * gridSpacing;
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.centerY - maxPixels);
            this.ctx.lineTo(x, this.centerY + maxPixels);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let i = -5; i <= 5; i++) {
            const y = this.centerY + i * gridSpacing;
            this.ctx.beginPath();
            this.ctx.moveTo(this.centerX - maxPixels, y);
            this.ctx.lineTo(this.centerX + maxPixels, y);
            this.ctx.stroke();
        }
    }
    
    drawAxes() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        
        const maxPixels = this.maxCoord * this.scale;
        
        // X axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX - maxPixels - 10, this.centerY);
        this.ctx.lineTo(this.centerX + maxPixels + 10, this.centerY);
        this.ctx.stroke();
        
        // Y axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, this.centerY - maxPixels - 10);
        this.ctx.lineTo(this.centerX, this.centerY + maxPixels + 10);
        this.ctx.stroke();
        
        // Arrow heads
        this.drawArrowHead(this.centerX + maxPixels + 10, this.centerY, 0);
        this.drawArrowHead(this.centerX, this.centerY - maxPixels - 10, -Math.PI / 2);
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
    
    drawVector(vector, color, label, isQuery) {
        const endpoint = this.getVectorEndpoint(vector);
        
        // Vector line with thicker width
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, this.centerY);
        this.ctx.lineTo(endpoint.x, endpoint.y);
        this.ctx.stroke();
        
        // Endpoint circle (larger for query)
        const circleSize = isQuery ? 10 : 8;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(endpoint.x, endpoint.y, circleSize, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // White center for endpoint
        const centerSize = isQuery ? 5 : 4;
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(endpoint.x, endpoint.y, centerSize, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Vector label
        this.ctx.fillStyle = color;
        this.ctx.font = isQuery ? 'bold 16px Arial' : 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const labelOffset = 18;
        const labelX = endpoint.x + (vector.x > 0 ? labelOffset : -labelOffset);
        const labelY = endpoint.y + (vector.y > 0 ? -labelOffset : labelOffset);
        
        this.ctx.fillText(label, labelX, labelY);
    }
    
    drawCoordinateLabels() {
        this.ctx.fillStyle = '#666';
        this.ctx.font = '11px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // X axis labels
        for (let i = -5; i <= 5; i++) {
            if (i !== 0 && i % 2 === 0) {
                const x = this.centerX + (i / 5) * this.scale;
                this.ctx.fillText((i / 5).toFixed(1), x, this.centerY + 20);
            }
        }
        
        // Y axis labels
        for (let i = -5; i <= 5; i++) {
            if (i !== 0 && i % 2 === 0) {
                const y = this.centerY - (i / 5) * this.scale;
                this.ctx.fillText((i / 5).toFixed(1), this.centerX - 25, y);
            }
        }
        
        // Origin
        this.ctx.fillText('0', this.centerX - 15, this.centerY + 15);
    }
    
    updateDisplay() {
        const results = this.calculateAttention();
        
        // Update query components
        document.getElementById('queryComponents').textContent = `(${this.query.x.toFixed(2)}, ${this.query.y.toFixed(2)})`;
        
        // Update dot products and attention weights
        const keyLabels = Object.keys(this.keys);
        keyLabels.forEach(label => {
            document.getElementById(`dotProduct_${label}`).textContent = results.dotProducts[label].toFixed(3);
            document.getElementById(`attention_${label}`).textContent = results.attention[label].toFixed(3);
            
            // Update progress bar
            const progressBar = document.getElementById(`progress_${label}`);
            progressBar.style.width = (results.attention[label] * 100) + '%';
        });
        
        // Update the LaTeX calculation with current values
        const dotProductsText = keyLabels.map(label => 
            `Q \\cdot K_{\\text{${label}}} = ${results.dotProducts[label].toFixed(3)}`
        ).join(', \\quad ');
        
        const attentionText = keyLabels.map(label => 
            `\\alpha_{\\text{${label}}} = ${results.attention[label].toFixed(3)}`
        ).join(', \\quad ');
        
        const isMobile = window.innerWidth <= 768;
        
        let latexCalc;
        if (isMobile) {
            latexCalc = `$$\\begin{align}
&${keyLabels.map(label => `Q \\cdot K_{\\text{${label}}} = ${results.dotProducts[label].toFixed(3)}`).join(' \\\\[0.3em] &')} \\\\[0.7em]
&\\text{Attention weights:} \\\\[0.3em]
&${keyLabels.map(label => `\\alpha_{\\text{${label}}} = ${results.attention[label].toFixed(3)}`).join(' \\\\[0.3em] &')}
\\end{align}$$`;
        } else {
            latexCalc = `$$\\begin{align}
&${dotProductsText} \\\\[0.5em]
&\\text{Attention: } ${attentionText}
\\end{align}$$`;
        }
        
        document.getElementById('fullCalculation').innerHTML = latexCalc;
        
        // Re-render MathJax for the updated equation
        if (window.MathJax) {
            window.MathJax.typesetPromise([document.getElementById('fullCalculation')]).catch((err) => console.log(err.message));
        }
        
        // Update detailed calculations if visible
        const detailedSection = document.getElementById('detailedEquations');
        if (detailedSection && detailedSection.style.display !== 'none') {
            this.updateDetailedCalculations();
        }
    }
    
    updateDetailedCalculations() {
        const results = this.calculateAttention();
        const keyLabels = Object.keys(this.keys);
        const isMobile = window.innerWidth <= 768;
        
        // Build detailed calculation HTML
        let html = '<div class="detailed-calc-step">';
        html += '<h4>Step 1: Current Vector Values</h4>';
        html += '<div class="calc-formula">';
        
        if (isMobile) {
            html += '$$\\begin{align}';
            html += `Q &= (${this.query.x.toFixed(2)}, ${this.query.y.toFixed(2)}) \\\\[0.3em]`;
            keyLabels.forEach(label => {
                const key = this.keys[label];
                html += `K_{\\text{${label}}} &= (${key.x.toFixed(2)}, ${key.y.toFixed(2)}) \\\\[0.3em]`;
            });
            html += '\\end{align}$$';
        } else {
            html += `$$Q = (${this.query.x.toFixed(2)}, ${this.query.y.toFixed(2)})$$`;
            html += '$$';
            keyLabels.forEach((label, idx) => {
                const key = this.keys[label];
                html += `K_{\\text{${label}}} = (${key.x.toFixed(2)}, ${key.y.toFixed(2)})`;
                if (idx < keyLabels.length - 1) html += ', \\quad ';
            });
            html += '$$';
        }
        
        html += '</div></div>';
        
        // Step 2: Dot products
        html += '<div class="detailed-calc-step">';
        html += '<h4>Step 2: Calculate Dot Products</h4>';
        html += '<div class="calc-formula">';
        
        keyLabels.forEach(label => {
            const key = this.keys[label];
            const dotProd = results.dotProducts[label];
            
            if (isMobile) {
                html += `$$\\begin{align}`;
                html += `Q \\cdot K_{\\text{${label}}} &= (${this.query.x.toFixed(2)})(${key.x.toFixed(2)}) \\\\`;
                html += `&\\quad + (${this.query.y.toFixed(2)})(${key.y.toFixed(2)}) \\\\`;
                html += `&= ${(this.query.x * key.x).toFixed(3)} + ${(this.query.y * key.y).toFixed(3)} \\\\`;
                html += `&= ${dotProd.toFixed(3)}`;
                html += `\\end{align}$$`;
            } else {
                html += `$$Q \\cdot K_{\\text{${label}}} = (${this.query.x.toFixed(2)})(${key.x.toFixed(2)}) + (${this.query.y.toFixed(2)})(${key.y.toFixed(2)}) = ${dotProd.toFixed(3)}$$`;
            }
        });
        
        html += '</div></div>';
        
        // Step 3: Softmax calculation
        html += '<div class="detailed-calc-step">';
        html += '<h4>Step 3: Apply Softmax</h4>';
        html += '<div class="calc-formula">';
        
        // Get exponentials
        const dotProductArray = keyLabels.map(label => results.dotProducts[label]);
        const maxVal = Math.max(...dotProductArray);
        const expValues = dotProductArray.map(v => Math.exp(v - maxVal));
        const sumExp = expValues.reduce((a, b) => a + b, 0);
        
        // Show exponentials
        html += '<p><strong>Calculate exponentials:</strong></p>';
        keyLabels.forEach((label, idx) => {
            const dotProd = results.dotProducts[label];
            const expVal = expValues[idx];
            
            if (isMobile) {
                html += `$$\\begin{align}`;
                html += `e^{${dotProd.toFixed(3)}} &\\approx ${expVal.toFixed(4)}`;
                html += `\\end{align}$$`;
            } else {
                html += `$$e^{${dotProd.toFixed(3)}} \\approx ${expVal.toFixed(4)}$$`;
            }
        });
        
        // Show sum
        html += '<p><strong>Sum of exponentials:</strong></p>';
        if (isMobile) {
            html += `$$\\begin{align}`;
            html += `\\sum_j e^{Q \\cdot K_j} &= ${expValues.map(v => v.toFixed(4)).join(' \\\\[0.2em] &\\quad + ')} \\\\[0.3em]`;
            html += `&= ${sumExp.toFixed(4)}`;
            html += `\\end{align}$$`;
        } else {
            html += `$$\\sum_j e^{Q \\cdot K_j} = ${expValues.map(v => v.toFixed(4)).join(' + ')} = ${sumExp.toFixed(4)}$$`;
        }
        
        // Show final probabilities
        html += '<p><strong>Normalize to get attention weights:</strong></p>';
        keyLabels.forEach((label, idx) => {
            const attention = results.attention[label];
            const expVal = expValues[idx];
            
            if (isMobile) {
                html += `$$\\begin{align}`;
                html += `\\alpha_{\\text{${label}}} &= \\frac{${expVal.toFixed(4)}}{${sumExp.toFixed(4)}} \\\\`;
                html += `&= ${attention.toFixed(3)}`;
                html += `\\end{align}$$`;
            } else {
                html += `$$\\alpha_{\\text{${label}}} = \\frac{${expVal.toFixed(4)}}{${sumExp.toFixed(4)}} = ${attention.toFixed(3)}$$`;
            }
        });
        
        html += '</div></div>';
        
        // Verification
        html += '<div class="detailed-calc-step">';
        html += '<h4>Verification</h4>';
        html += '<div class="calc-formula">';
        const sumAttention = keyLabels.reduce((sum, label) => sum + results.attention[label], 0);
        
        if (isMobile) {
            html += `$$\\begin{align}`;
            html += `\\sum_j \\alpha_j &= ${keyLabels.map(label => results.attention[label].toFixed(3)).join(' \\\\[0.2em] &\\quad + ')} \\\\[0.3em]`;
            html += `&= ${sumAttention.toFixed(3)}`;
            html += `\\end{align}$$`;
        } else {
            html += `$$\\sum_j \\alpha_j = ${keyLabels.map(label => results.attention[label].toFixed(3)).join(' + ')} = ${sumAttention.toFixed(3)}$$`;
        }
        
        html += '<p style="margin-top: 1em;"><em>The attention weights sum to 1, as expected.</em></p>';
        html += '</div></div>';
        
        document.getElementById('equationsContainer').innerHTML = html;
        
        // Re-render MathJax for the new equations
        if (window.MathJax) {
            window.MathJax.typesetPromise([document.getElementById('equationsContainer')]).catch((err) => console.log(err.message));
        }
    }
    
    update() {
        this.draw();
        this.updateDisplay();
    }
}

// Initialize the visualization when the page loads
function initVisualization() {
    const canvas = document.getElementById('vectorCanvas');
    if (canvas) {
        new AttentionVisualization();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVisualization);
} else {
    initVisualization();
}

