// XOR Problem Visualization

class XORVisualization {
    constructor() {
        this.currentGate = 'or';
        this.gateOutputs = {
            or:   { '00': 0, '01': 1, '10': 1, '11': 1 },
            and:  { '00': 0, '01': 0, '10': 0, '11': 1 },
            nand: { '00': 1, '01': 1, '10': 1, '11': 0 },
            xor:  { '00': 0, '01': 1, '10': 1, '11': 0 }
        };
        
        this.points = [
            { x: 0, y: 0, key: '00' },
            { x: 0, y: 1, key: '01' },
            { x: 1, y: 0, key: '10' },
            { x: 1, y: 1, key: '11' }
        ];
        
        // Part 1 perceptron weights: w1*x1 + w2*x2 + b >= 0 => output 1
        this.perceptron = { w1: 0.2, w2: 1, b: -0.5 };
        
        // Network weights for Part 2 (start with non-solution so user needs to adjust)
        this.weights = {
            w11: 0.2, w12: 1, b1: -0.5,    // h1: not quite OR yet
            w21: -0.2, w22: -1, b2: 1.5,   // h2: not quite NAND yet
            v1: 1, v2: 1, c: -1.5          // output weights
        };
        
        // XOR solution weights
        // h1: OR gate - fires when x1+x2 > 0.5 → boundary at x1+x2=0.5
        // h2: NAND gate - fires when x1+x2 < 1.5 (NOT AND) → uses negative weights
        // output: h1 AND h2 → XOR (both must fire)
        this.xorSolution = {
            w11: 10, w12: 10, b1: -5,     // h1 (OR): boundary at x1+x2 = 0.5, fires above
            w21: -10, w22: -10, b2: 15,   // h2 (NAND): boundary at x1+x2 = 1.5, fires below
            v1: 10, v2: 10, c: -15        // output: high when both h1≈1 AND h2≈1
        };
        
        this.setupCanvases();
        this.setupEventListeners();
        this.update();
        this.updateNetwork();
    }
    
    setupCanvases() {
        // Part 1 canvas
        this.canvas1 = document.getElementById('inputSpaceCanvas');
        this.ctx1 = this.canvas1.getContext('2d');
        
        // Part 1 perceptron diagram
        this.canvasPerceptron = document.getElementById('perceptronDiagramCanvas');
        this.ctxPerceptron = this.canvasPerceptron.getContext('2d');
        
        // Part 2 canvases - separate gate canvases
        this.canvasOR = document.getElementById('orGateCanvas');
        this.ctxOR = this.canvasOR.getContext('2d');
        this.canvasNAND = document.getElementById('nandGateCanvas');
        this.ctxNAND = this.canvasNAND.getContext('2d');
        
        // Combined input space
        this.canvas2 = document.getElementById('inputSpaceCanvas2');
        this.ctx2 = this.canvas2.getContext('2d');
        
        // Hidden space
        this.canvasH = document.getElementById('hiddenSpaceCanvas');
        this.ctxH = this.canvasH.getContext('2d');
        
        // Network diagram canvas
        this.canvasNet = document.getElementById('networkDiagramCanvas');
        this.ctxNet = this.canvasNet.getContext('2d');
        
        // Step function canvases (Part 1 and Part 2)
        this.canvasStepPart1 = document.getElementById('stepFunctionCanvasPart1');
        this.ctxStepPart1 = this.canvasStepPart1.getContext('2d');
        this.canvasStep = document.getElementById('stepFunctionCanvas');
        this.ctxStep = this.canvasStep.getContext('2d');
        this.drawStepFunction(this.canvasStepPart1, this.ctxStepPart1);
        this.drawStepFunction(this.canvasStep, this.ctxStep);
        
        // Setup hover for perceptron diagram
        this.setupPerceptronHover();
    }
    
    setupPerceptronHover() {
        const canvas = this.canvasPerceptron;
        const tooltip = document.createElement('div');
        tooltip.className = 'neuron-tooltip';
        tooltip.style.display = 'none';
        document.body.appendChild(tooltip);
        this.perceptronTooltip = tooltip;
        
        // Output neuron position (must match drawPerceptronDiagram)
        const outputX = canvas.width - 50;
        const outputY = canvas.height / 2;
        const radius = 18;
        
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Check if mouse is over output neuron
            const dist = Math.sqrt((x - outputX) ** 2 + (y - outputY) ** 2);
            if (dist <= radius) {
                tooltip.textContent = 'y = σ(w₁·x₁ + w₂·x₂ + b)';
                tooltip.style.display = 'block';
                tooltip.style.left = (e.clientX + 10) + 'px';
                tooltip.style.top = (e.clientY + 10) + 'px';
            } else {
                tooltip.style.display = 'none';
            }
        });
        
        canvas.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
        
        // Also setup hover for Part 2 network diagram
        this.setupNetworkDiagramHover();
    }
    
    setupNetworkDiagramHover() {
        const canvas = this.canvasNet;
        const tooltip = document.createElement('div');
        tooltip.className = 'neuron-tooltip';
        tooltip.style.display = 'none';
        document.body.appendChild(tooltip);
        this.networkTooltip = tooltip;
        
        // Neuron positions (must match drawNetworkDiagram)
        const W = canvas.width;
        const H = canvas.height;
        const layerX = [80, W/2, W - 80];
        const inputY = [H/2 - 35, H/2 + 35];
        const hiddenY = [H/2 - 35, H/2 + 35];
        const outputY = H/2;
        const radius = 22;
        
        const neurons = {
            h1: { x: layerX[1], y: hiddenY[0], tooltip: 'h₁ = σ(w₁₁·x₁ + w₁₂·x₂ + b₁)' },
            h2: { x: layerX[1], y: hiddenY[1], tooltip: 'h₂ = σ(w₂₁·x₁ + w₂₂·x₂ + b₂)' },
            y: { x: layerX[2], y: outputY, tooltip: 'y = σ(v₁·h₁ + v₂·h₂ + c)' }
        };
        
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            let found = false;
            for (const key in neurons) {
                const n = neurons[key];
                const dist = Math.sqrt((x - n.x) ** 2 + (y - n.y) ** 2);
                if (dist <= radius) {
                    tooltip.textContent = n.tooltip;
                    tooltip.style.display = 'block';
                    tooltip.style.left = (e.clientX + 10) + 'px';
                    tooltip.style.top = (e.clientY + 10) + 'px';
                    found = true;
                    break;
                }
            }
            if (!found) {
                tooltip.style.display = 'none';
            }
        });
        
        canvas.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
    }
    
    drawStepFunction(canvas, ctx) {
        if (!canvas || !ctx) return;
        const W = canvas.width;
        const H = canvas.height;
        
        ctx.clearRect(0, 0, W, H);
        
        const padding = 20;
        const plotW = W - 2 * padding;
        const plotH = H - 2 * padding;
        const centerX = padding + plotW / 2;
        const centerY = padding + plotH / 2;
        
        // Draw axes
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1;
        
        // X-axis
        ctx.beginPath();
        ctx.moveTo(padding, centerY);
        ctx.lineTo(W - padding, centerY);
        ctx.stroke();
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(centerX, H - padding);
        ctx.lineTo(centerX, padding);
        ctx.stroke();
        
        // Axis labels
        ctx.fillStyle = '#666';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('x', W - padding + 8, centerY + 4);
        ctx.fillText('σ(x)', centerX, padding - 6);
        
        // Draw step function
        ctx.strokeStyle = '#4A90E2';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        
        // Left part (y = 0 for x < 0)
        ctx.moveTo(padding, centerY);
        ctx.lineTo(centerX, centerY);
        
        // Vertical jump at x = 0
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX, padding + 5);
        
        // Right part (y = 1 for x >= 0)
        ctx.lineTo(W - padding, padding + 5);
        ctx.stroke();
        
        // Draw points at the jump
        // Open circle at (0, 0)
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = '#4A90E2';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Filled circle at (0, 1)
        ctx.beginPath();
        ctx.arc(centerX, padding + 5, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#4A90E2';
        ctx.fill();
        
        // Labels for 0 and 1 on y-axis
        ctx.fillStyle = '#666';
        ctx.font = '9px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('1', centerX - 6, padding + 8);
        ctx.fillText('0', centerX - 6, centerY + 3);
    }
    
    setupEventListeners() {
        // Gate selector buttons
        document.querySelectorAll('.gate-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.gate-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentGate = e.target.dataset.gate;
                this.updateTruthTable();
                this.update();
            });
        });
        
        // Part 1 perceptron weight sliders
        const perceptronIds = [
            { slider: 'pw1', key: 'w1' },
            { slider: 'pw2', key: 'w2' },
            { slider: 'pb', key: 'b' }
        ];
        perceptronIds.forEach(({ slider, key }) => {
            const el = document.getElementById(slider);
            if (el) {
                el.addEventListener('input', (e) => {
                    this.perceptron[key] = parseFloat(e.target.value);
                    document.getElementById(slider + 'Val').textContent = this.perceptron[key].toFixed(1);
                    this.update();
                });
            }
        });
        
        // Network weight sliders (Part 2)
        const weightIds = ['w11', 'w12', 'b1', 'w21', 'w22', 'b2', 'v1', 'v2', 'c'];
        weightIds.forEach(id => {
            const slider = document.getElementById(id);
            if (slider) {
                slider.addEventListener('input', (e) => {
                    this.weights[id] = parseFloat(e.target.value);
                    document.getElementById(id + 'Val').textContent = this.weights[id].toFixed(1);
                    this.updateNetwork();
                });
            }
        });
        
        // Preset buttons
        document.getElementById('loadSolution').addEventListener('click', () => this.loadXORSolution());
        document.getElementById('resetWeights').addEventListener('click', () => this.resetWeights());
        document.getElementById('resetPerceptron').addEventListener('click', () => this.resetPerceptron());
    }
    
    resetPerceptron() {
        this.perceptron = { w1: 0.2, w2: 1, b: -0.5 };
        document.getElementById('pw1').value = this.perceptron.w1;
        document.getElementById('pw2').value = this.perceptron.w2;
        document.getElementById('pb').value = this.perceptron.b;
        document.getElementById('pw1Val').textContent = this.perceptron.w1.toFixed(1);
        document.getElementById('pw2Val').textContent = this.perceptron.w2.toFixed(1);
        document.getElementById('pbVal').textContent = this.perceptron.b.toFixed(1);
        this.update();
    }
    
    coordToCanvas(canvas, x, y) {
        const padding = 50;
        const w = canvas.width - 2 * padding;
        const h = canvas.height - 2 * padding;
        return {
            x: padding + (x + 0.2) / 1.4 * w,
            y: padding + (1.2 - y) / 1.4 * h
        };
    }
    
    classifyPoint(x, y) {
        const { w1, w2, b } = this.perceptron;
        return w1 * x + w2 * y + b >= 0 ? 1 : 0;
    }
    
    updateTruthTable() {
        const outputs = this.gateOutputs[this.currentGate];
        document.getElementById('out00').textContent = outputs['00'];
        document.getElementById('out01').textContent = outputs['01'];
        document.getElementById('out10').textContent = outputs['10'];
        document.getElementById('out11').textContent = outputs['11'];
        
        // Part 2 always targets XOR
        const xorOutputs = this.gateOutputs['xor'];
        document.getElementById('t00').textContent = xorOutputs['00'];
        document.getElementById('t01').textContent = xorOutputs['01'];
        document.getElementById('t10').textContent = xorOutputs['10'];
        document.getElementById('t11').textContent = xorOutputs['11'];
    }
    
    drawInputSpace(canvas, ctx, showBoundary = true) {
        const W = canvas.width;
        const H = canvas.height;
        ctx.clearRect(0, 0, W, H);
        
        const padding = 50;
        
        // Helper to convert canvas pixels to coordinates
        const canvasToCoord = (px, py) => ({
            x: (px - padding) / (W - 2 * padding) * 1.4 - 0.2,
            y: 1.2 - (py - padding) / (H - 2 * padding) * 1.4
        });
        
        // Background shading for decision regions
        if (showBoundary) {
            const { w1, w2, b } = this.perceptron;
            for (let px = 0; px < W; px += 4) {
                for (let py = 0; py < H; py += 4) {
                    const coord = canvasToCoord(px, py);
                    const val = w1 * coord.x + w2 * coord.y + b;
                    ctx.fillStyle = val >= 0 ? 'rgba(200, 230, 200, 0.3)' : 'rgba(230, 200, 200, 0.3)';
                    ctx.fillRect(px, py, 4, 4);
                }
            }
        }
        
        // Grid
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 1; i += 0.5) {
            const p = this.coordToCanvas(canvas, i, 0);
            ctx.beginPath();
            ctx.moveTo(p.x, padding);
            ctx.lineTo(p.x, H - padding);
            ctx.stroke();
            
            const p2 = this.coordToCanvas(canvas, 0, i);
            ctx.beginPath();
            ctx.moveTo(padding, p2.y);
            ctx.lineTo(W - padding, p2.y);
            ctx.stroke();
        }
        
        // Axes
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        const origin = this.coordToCanvas(canvas, 0, 0);
        const xEnd = this.coordToCanvas(canvas, 1.25, 0);
        const yEnd = this.coordToCanvas(canvas, 0, 1.25);
        
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(xEnd.x, xEnd.y);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(yEnd.x, yEnd.y);
        ctx.stroke();
        
        // Arrowheads
        const arrowSize = 8;
        // X-axis arrow
        ctx.beginPath();
        ctx.moveTo(xEnd.x, xEnd.y);
        ctx.lineTo(xEnd.x - arrowSize, xEnd.y - arrowSize / 2);
        ctx.lineTo(xEnd.x - arrowSize, xEnd.y + arrowSize / 2);
        ctx.closePath();
        ctx.fillStyle = '#333';
        ctx.fill();
        
        // Y-axis arrow
        ctx.beginPath();
        ctx.moveTo(yEnd.x, yEnd.y);
        ctx.lineTo(yEnd.x - arrowSize / 2, yEnd.y + arrowSize);
        ctx.lineTo(yEnd.x + arrowSize / 2, yEnd.y + arrowSize);
        ctx.closePath();
        ctx.fill();
        
        // Axis labels
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('x₁', xEnd.x, xEnd.y + 10);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'right';
        ctx.fillText('x₂', yEnd.x - 12, yEnd.y);
        
        // Tick labels
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (let i = 0; i <= 1; i++) {
            const p = this.coordToCanvas(canvas, i, 0);
            ctx.fillText(i.toString(), p.x, p.y + 8);
        }
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let i = 0; i <= 1; i++) {
            if (i === 0) continue;
            const p = this.coordToCanvas(canvas, 0, i);
            ctx.fillText(i.toString(), p.x - 8, p.y);
        }
        
        // Decision boundary line: w1*x1 + w2*x2 + b = 0
        // Draw line that always spans the full canvas
        if (showBoundary) {
            const { w1, w2, b } = this.perceptron;
            
            ctx.strokeStyle = '#4A90E2';
            ctx.lineWidth = 3;
            
            // Use a large range to ensure line always crosses the visible area
            const range = 10;
            let p1, p2;
            
            if (Math.abs(w2) > Math.abs(w1)) {
                // More horizontal line - solve for x2 at x1 extremes
                const x1A = -range, x1B = range;
                const x2A = -(w1 * x1A + b) / w2;
                const x2B = -(w1 * x1B + b) / w2;
                p1 = this.coordToCanvas(canvas, x1A, x2A);
                p2 = this.coordToCanvas(canvas, x1B, x2B);
            } else if (Math.abs(w1) > 0.001) {
                // More vertical line - solve for x1 at x2 extremes
                const x2A = -range, x2B = range;
                const x1A = -(w2 * x2A + b) / w1;
                const x1B = -(w2 * x2B + b) / w1;
                p1 = this.coordToCanvas(canvas, x1A, x2A);
                p2 = this.coordToCanvas(canvas, x1B, x2B);
            }
            
            if (p1 && p2) {
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
        
        // Points
        const outputs = this.gateOutputs[this.currentGate];
        for (const pt of this.points) {
            const screen = this.coordToCanvas(canvas, pt.x, pt.y);
            const output = outputs[pt.key];
            
            ctx.fillStyle = output === 1 ? '#2e7d32' : '#c62828';
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, 14, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(output.toString(), screen.x, screen.y);
        }
    }
    
    updateClassificationStatus() {
        const outputs = this.gateOutputs[this.currentGate];
        const { w1, w2, b } = this.perceptron;
        let correct = 0;
        
        for (const pt of this.points) {
            const predicted = this.classifyPoint(pt.x, pt.y);
            const actual = outputs[pt.key];
            if (predicted === actual) correct++;
        }
        
        // Update message box
        const msgBox = document.getElementById('messageBox');
        if (correct === 4) {
            msgBox.textContent = 'Perfect! You found a valid decision boundary (4/4 correct).';
            msgBox.className = 'message-box success';
        } else if (this.currentGate === 'xor') {
            msgBox.textContent = `XOR is not linearly separable! No single line can work (${correct}/4). Try the neural network below.`;
            msgBox.className = 'message-box impossible';
        } else {
            msgBox.textContent = `${correct}/4 correct. Keep adjusting the weights!`;
            msgBox.className = 'message-box';
        }
        
        // Update boundary equation with current weights (algebraic + values)
        const formatNum = (n) => n >= 0 ? `+ ${n.toFixed(1)}` : `− ${Math.abs(n).toFixed(1)}`;
        const eqnValues = `${w1.toFixed(1)}·x₁ ${formatNum(w2)}·x₂ ${formatNum(b)} ≥ 0 → 1`;
        const eqnAlgebra = `w₁·x₁ + w₂·x₂ + b ≥ 0 → 1`;
        document.getElementById('boundaryEquation').innerHTML = `<span class="equation-algebra">${eqnAlgebra}</span><br><span class="equation-values">${eqnValues}</span>`;
    }
    
    update() {
        this.drawInputSpace(this.canvas1, this.ctx1, true);
        this.drawPerceptronDiagram();
        this.updateClassificationStatus();
    }
    
    drawPerceptronDiagram() {
        const canvas = this.canvasPerceptron;
        const ctx = this.ctxPerceptron;
        const W = canvas.width;
        const H = canvas.height;
        
        ctx.clearRect(0, 0, W, H);
        
        // Neuron positions
        const inputX = 40;
        const outputX = W - 50;
        const inputY = [H/2 - 30, H/2 + 30];
        const outputY = H/2;
        const radius = 18;
        
        const neurons = {
            x1: { x: inputX, y: inputY[0] },
            x2: { x: inputX, y: inputY[1] },
            y:  { x: outputX, y: outputY }
        };
        
        // Draw connections with weight labels
        const drawConnection = (from, to, label, color = '#888') => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(from.x + radius, from.y);
            ctx.lineTo(to.x - radius, to.y);
            ctx.stroke();
            
            // Weight label at midpoint
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            ctx.fillStyle = '#666';
            ctx.font = '11px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, midX, midY - 8);
        };
        
        // Draw connections
        drawConnection(neurons.x1, neurons.y, 'w₁', '#888');
        drawConnection(neurons.x2, neurons.y, 'w₂', '#888');
        
        // Draw neurons
        const drawNeuron = (n, label, bgColor, borderColor, textColor) => {
            ctx.fillStyle = bgColor;
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(n.x, n.y, radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            
            ctx.fillStyle = textColor;
            ctx.font = 'bold 13px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, n.x, n.y);
        };
        
        // Input neurons
        drawNeuron(neurons.x1, 'x₁', '#e3f2fd', '#1976d2', '#1976d2');
        drawNeuron(neurons.x2, 'x₂', '#e3f2fd', '#1976d2', '#1976d2');
        
        // Output neuron
        drawNeuron(neurons.y, 'y', '#e8f5e9', '#388e3c', '#2e7d32');
        
        // Bias label
        ctx.fillStyle = '#999';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('+b', neurons.y.x, neurons.y.y + radius + 10);
    }
    
    // Neural network functions
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }
    
    step(x) {
        return x >= 0 ? 1 : 0;
    }
    
    forwardPass(x1, x2) {
        const { w11, w12, b1, w21, w22, b2, v1, v2, c } = this.weights;
        
        // Hidden layer (using sigmoid for smooth values in table display)
        const z1 = w11 * x1 + w12 * x2 + b1;
        const z2 = w21 * x1 + w22 * x2 + b2;
        const h1 = this.sigmoid(z1);
        const h2 = this.sigmoid(z2);
        
        // Output layer
        const zOut = v1 * h1 + v2 * h2 + c;
        const y = this.sigmoid(zOut);
        
        return { h1, h2, y, yBinary: y >= 0.5 ? 1 : 0 };
    }
    
    forwardPassStep(x1, x2) {
        const { w11, w12, b1, w21, w22, b2, v1, v2, c } = this.weights;
        
        // Hidden layer using step function for crisp boundaries
        const z1 = w11 * x1 + w12 * x2 + b1;
        const z2 = w21 * x1 + w22 * x2 + b2;
        const h1 = this.step(z1);
        const h2 = this.step(z2);
        
        // Output layer using step function
        const zOut = v1 * h1 + v2 * h2 + c;
        const yBinary = this.step(zOut);
        
        return { h1, h2, yBinary };
    }
    
    drawORGate() {
        const canvas = this.canvasOR;
        const ctx = this.ctxOR;
        const W = canvas.width;
        const H = canvas.height;
        
        ctx.clearRect(0, 0, W, H);
        
        const padding = 50;
        const { w11, w12, b1 } = this.weights;
        
        // Use same coordinate system as Part 1: range from -0.2 to 1.2
        const toScreen = (x, y) => ({
            x: padding + (x + 0.2) / 1.4 * (W - 2 * padding),
            y: padding + (1.2 - y) / 1.4 * (H - 2 * padding)
        });
        
        const toCoord = (px, py) => ({
            x: (px - padding) / (W - 2 * padding) * 1.4 - 0.2,
            y: 1.2 - (py - padding) / (H - 2 * padding) * 1.4
        });
        
        // Background shading: green where h1 activates (above boundary)
        // OR gate: activates when x1+x2 > threshold (above the line)
        for (let px = 0; px < W; px += 4) {
            for (let py = 0; py < H; py += 4) {
                const coord = toCoord(px, py);
                const z1 = w11 * coord.x + w12 * coord.y + b1;
                const h1 = this.step(z1);  // Use step function for crisp boundary
                ctx.fillStyle = h1 === 1 ? 'rgba(200, 230, 200, 0.3)' : 'rgba(230, 200, 200, 0.3)';
                ctx.fillRect(px, py, 4, 4);
            }
        }
        
        // Draw grid and axes with extended arrows
        this.drawAxesAndGridExtended(ctx, W, H, padding, toScreen, 'x₁', 'x₂');
        
        // Draw h1 boundary line (blue for OR)
        ctx.strokeStyle = '#1976d2';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        this.drawBoundaryLine(ctx, w11, w12, b1, toScreen);
        
        // Draw points with OR gate outputs (for reference)
        const orOutputs = { '00': 0, '01': 1, '10': 1, '11': 1 };
        this.drawPointsExtended(ctx, toScreen, orOutputs);
    }
    
    drawNANDGate() {
        const canvas = this.canvasNAND;
        const ctx = this.ctxNAND;
        const W = canvas.width;
        const H = canvas.height;
        
        ctx.clearRect(0, 0, W, H);
        
        const padding = 50;
        const { w21, w22, b2 } = this.weights;
        
        // Use same coordinate system as Part 1
        const toScreen = (x, y) => ({
            x: padding + (x + 0.2) / 1.4 * (W - 2 * padding),
            y: padding + (1.2 - y) / 1.4 * (H - 2 * padding)
        });
        
        const toCoord = (px, py) => ({
            x: (px - padding) / (W - 2 * padding) * 1.4 - 0.2,
            y: 1.2 - (py - padding) / (H - 2 * padding) * 1.4
        });
        
        // Background shading: green where h2 fires
        // With NAND weights (negative), h2 fires when NOT(both inputs high)
        for (let px = 0; px < W; px += 4) {
            for (let py = 0; py < H; py += 4) {
                const coord = toCoord(px, py);
                const z2 = w21 * coord.x + w22 * coord.y + b2;
                const h2 = this.step(z2);  // Use step function for crisp boundary
                // Green where h2 fires (NAND output=1), red where it doesn't
                ctx.fillStyle = h2 === 1 ? 'rgba(200, 230, 200, 0.3)' : 'rgba(230, 200, 200, 0.3)';
                ctx.fillRect(px, py, 4, 4);
            }
        }
        
        // Draw grid and axes with extended arrows
        this.drawAxesAndGridExtended(ctx, W, H, padding, toScreen, 'x₁', 'x₂');
        
        // Draw h2 boundary line (orange for NAND)
        ctx.strokeStyle = '#ff9800';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        this.drawBoundaryLine(ctx, w21, w22, b2, toScreen);
        
        // Draw points with NAND gate outputs (for reference)
        const nandOutputs = { '00': 1, '01': 1, '10': 1, '11': 0 };
        this.drawPointsExtended(ctx, toScreen, nandOutputs);
    }
    
    drawAxesAndGrid(ctx, W, H, padding, toScreen, xLabel, yLabel) {
        // Grid
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 1; i += 0.5) {
            const p = toScreen(i, 0);
            ctx.beginPath();
            ctx.moveTo(p.x, padding);
            ctx.lineTo(p.x, H - padding);
            ctx.stroke();
            
            const p2 = toScreen(0, i);
            ctx.beginPath();
            ctx.moveTo(padding, p2.y);
            ctx.lineTo(W - padding, p2.y);
            ctx.stroke();
        }
        
        // Axes
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        const origin = toScreen(0, 0);
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(toScreen(1.05, 0).x, origin.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(origin.x, toScreen(0, 1.05).y);
        ctx.stroke();
        
        // Axis labels
        ctx.fillStyle = '#333';
        ctx.font = '13px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(xLabel, toScreen(1.05, 0).x, origin.y + 5);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(yLabel, origin.x - 8, toScreen(0, 1.05).y);
        
        // Tick labels
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (let i = 0; i <= 1; i++) {
            const p = toScreen(i, 0);
            ctx.fillText(i.toString(), p.x, p.y + 6);
        }
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let i = 0; i <= 1; i++) {
            if (i === 0) continue;
            const p = toScreen(0, i);
            ctx.fillText(i.toString(), p.x - 6, p.y);
        }
    }
    
    drawAxesAndGridExtended(ctx, W, H, padding, toScreen, xLabel, yLabel) {
        // Grid
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 1; i += 0.5) {
            const p = toScreen(i, 0);
            ctx.beginPath();
            ctx.moveTo(p.x, padding);
            ctx.lineTo(p.x, H - padding);
            ctx.stroke();
            
            const p2 = toScreen(0, i);
            ctx.beginPath();
            ctx.moveTo(padding, p2.y);
            ctx.lineTo(W - padding, p2.y);
            ctx.stroke();
        }
        
        // Axes with arrows (like Part 1)
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        const origin = toScreen(0, 0);
        const xEnd = toScreen(1.25, 0);
        const yEnd = toScreen(0, 1.25);
        
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(xEnd.x, xEnd.y);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(yEnd.x, yEnd.y);
        ctx.stroke();
        
        // Arrowheads
        const arrowSize = 8;
        ctx.fillStyle = '#333';
        // X-axis arrow
        ctx.beginPath();
        ctx.moveTo(xEnd.x, xEnd.y);
        ctx.lineTo(xEnd.x - arrowSize, xEnd.y - arrowSize / 2);
        ctx.lineTo(xEnd.x - arrowSize, xEnd.y + arrowSize / 2);
        ctx.closePath();
        ctx.fill();
        
        // Y-axis arrow
        ctx.beginPath();
        ctx.moveTo(yEnd.x, yEnd.y);
        ctx.lineTo(yEnd.x - arrowSize / 2, yEnd.y + arrowSize);
        ctx.lineTo(yEnd.x + arrowSize / 2, yEnd.y + arrowSize);
        ctx.closePath();
        ctx.fill();
        
        // Axis labels
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(xLabel, xEnd.x, xEnd.y + 10);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'right';
        ctx.fillText(yLabel, yEnd.x - 12, yEnd.y);
        
        // Tick labels
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (let i = 0; i <= 1; i++) {
            const p = toScreen(i, 0);
            ctx.fillText(i.toString(), p.x, p.y + 8);
        }
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let i = 0; i <= 1; i++) {
            if (i === 0) continue;
            const p = toScreen(0, i);
            ctx.fillText(i.toString(), p.x - 8, p.y);
        }
    }
    
    drawPointsExtended(ctx, toScreen, outputs) {
        for (const pt of this.points) {
            const screen = toScreen(pt.x, pt.y);
            const output = outputs[pt.key];
            
            ctx.fillStyle = output === 1 ? '#2e7d32' : '#c62828';
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, 14, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(output.toString(), screen.x, screen.y);
        }
    }
    
    drawBoundaryLine(ctx, w1, w2, b, toScreen) {
        if (Math.abs(w1) < 0.001 && Math.abs(w2) < 0.001) return;
        
        const range = 10;
        let p1, p2;
        
        if (Math.abs(w2) > Math.abs(w1)) {
            const x2A = -(w1 * (-range) + b) / w2;
            const x2B = -(w1 * range + b) / w2;
            p1 = toScreen(-range, x2A);
            p2 = toScreen(range, x2B);
        } else {
            const x1A = -(w2 * (-range) + b) / w1;
            const x1B = -(w2 * range + b) / w1;
            p1 = toScreen(x1A, -range);
            p2 = toScreen(x1B, range);
        }
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }
    
    drawPoints(ctx, toScreen, outputs) {
        for (const pt of this.points) {
            const screen = toScreen(pt.x, pt.y);
            const output = outputs[pt.key];
            
            ctx.fillStyle = output === 1 ? '#2e7d32' : '#c62828';
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, 12, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(output.toString(), screen.x, screen.y);
        }
    }
    
    drawHiddenSpace() {
        const canvas = this.canvasH;
        const ctx = this.ctxH;
        const W = canvas.width;
        const H = canvas.height;
        
        ctx.clearRect(0, 0, W, H);
        
        const padding = 50;
        const { v1, v2, c } = this.weights;
        
        // Use same coordinate system as Part 1: range from -0.2 to 1.2
        const toScreen = (h1, h2) => ({
            x: padding + (h1 + 0.2) / 1.4 * (W - 2 * padding),
            y: padding + (1.2 - h2) / 1.4 * (H - 2 * padding)
        });
        
        const toCoord = (px, py) => ({
            h1: (px - padding) / (W - 2 * padding) * 1.4 - 0.2,
            h2: 1.2 - (py - padding) / (H - 2 * padding) * 1.4
        });
        
        // Background shading based on output decision boundary in hidden space
        for (let px = 0; px < W; px += 4) {
            for (let py = 0; py < H; py += 4) {
                const { h1, h2 } = toCoord(px, py);
                const zOut = v1 * h1 + v2 * h2 + c;
                const pred = this.step(zOut);  // Use step function for crisp boundary
                ctx.fillStyle = pred === 1 ? 'rgba(200, 230, 200, 0.3)' : 'rgba(230, 200, 200, 0.3)';
                ctx.fillRect(px, py, 4, 4);
            }
        }
        
        // Draw grid and axes with extended arrows
        this.drawAxesAndGridExtended(ctx, W, H, padding, toScreen, 'h₁', 'h₂');
        
        // Output decision boundary line in hidden space: v1*h1 + v2*h2 + c = 0
        if (Math.abs(v1) > 0.001 || Math.abs(v2) > 0.001) {
            ctx.strokeStyle = '#9c27b0';
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 4]);
            this.drawBoundaryLine(ctx, v1, v2, c, toScreen);
            ctx.setLineDash([]);
        }
        
        // Transformed points - always use XOR outputs for Part 2
        // Group points by their hidden space coordinates to handle overlaps
        const outputs = this.gateOutputs['xor'];
        const pointGroups = {};
        
        for (const pt of this.points) {
            const { h1, h2 } = this.forwardPassStep(pt.x, pt.y);
            const key = `${h1},${h2}`;
            if (!pointGroups[key]) {
                pointGroups[key] = { h1, h2, points: [] };
            }
            pointGroups[key].points.push(pt);
        }
        
        // Draw each group
        for (const key in pointGroups) {
            const group = pointGroups[key];
            const screen = toScreen(group.h1, group.h2);
            const pts = group.points;
            
            if (pts.length === 1) {
                // Single point - draw normally
                const pt = pts[0];
                const output = outputs[pt.key];
                ctx.fillStyle = output === 1 ? '#2e7d32' : '#c62828';
                ctx.beginPath();
                ctx.arc(screen.x, screen.y, 14, 0, 2 * Math.PI);
                ctx.fill();
                
                ctx.fillStyle = 'white';
                ctx.font = 'bold 9px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${pt.x},${pt.y}`, screen.x, screen.y);
            } else {
                // Multiple points at same location - draw stacked/combined
                // Check if all have same output
                const allSameOutput = pts.every(p => outputs[p.key] === outputs[pts[0].key]);
                const output = outputs[pts[0].key];
                
                // Draw larger circle to indicate multiple points
                ctx.fillStyle = output === 1 ? '#2e7d32' : '#c62828';
                ctx.beginPath();
                ctx.arc(screen.x, screen.y, 18, 0, 2 * Math.PI);
                ctx.fill();
                
                // Add border to indicate overlap
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // Label with all coordinates
                const labels = pts.map(p => `${p.x},${p.y}`).join(' & ');
                ctx.fillStyle = 'white';
                ctx.font = 'bold 8px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(labels, screen.x, screen.y);
            }
        }
    }
    
    drawInputSpace2() {
        const canvas = this.canvas2;
        const ctx = this.ctx2;
        const W = canvas.width;
        const H = canvas.height;
        
        ctx.clearRect(0, 0, W, H);
        
        const padding = 50;
        const { w11, w12, b1, w21, w22, b2 } = this.weights;
        
        // Use same coordinate system as Part 1
        const toScreen = (x, y) => ({
            x: padding + (x + 0.2) / 1.4 * (W - 2 * padding),
            y: padding + (1.2 - y) / 1.4 * (H - 2 * padding)
        });
        
        const toCoord = (px, py) => ({
            x: (px - padding) / (W - 2 * padding) * 1.4 - 0.2,
            y: 1.2 - (py - padding) / (H - 2 * padding) * 1.4
        });
        
        // Background shading based on network output (XOR = OR AND NAND)
        // Both h1 and h2 must fire for XOR=1
        for (let px = 0; px < W; px += 4) {
            for (let py = 0; py < H; py += 4) {
                const coord = toCoord(px, py);
                const { yBinary } = this.forwardPassStep(coord.x, coord.y);  // Use step function
                // Green for XOR=1, red for XOR=0
                ctx.fillStyle = yBinary === 1 ? 'rgba(200, 230, 200, 0.3)' : 'rgba(230, 200, 200, 0.3)';
                ctx.fillRect(px, py, 4, 4);
            }
        }
        
        // Draw grid and axes with extended arrows
        this.drawAxesAndGridExtended(ctx, W, H, padding, toScreen, 'x₁', 'x₂');
        
        // Draw both boundary lines with distinct colors
        ctx.setLineDash([6, 3]);
        ctx.lineWidth = 2;
        
        // h1 boundary (OR) - blue
        ctx.strokeStyle = '#1976d2';
        this.drawBoundaryLine(ctx, w11, w12, b1, toScreen);
        
        // h2 boundary (NAND) - orange
        ctx.strokeStyle = '#ff9800';
        this.drawBoundaryLine(ctx, w21, w22, b2, toScreen);
        
        ctx.setLineDash([]);
        
        // Points - always use XOR outputs for Part 2
        const outputs = this.gateOutputs['xor'];
        this.drawPointsExtended(ctx, toScreen, outputs);
    }
    
    updateComputationTable() {
        // Always use XOR outputs for Part 2
        const outputs = this.gateOutputs['xor'];
        let correct = 0;
        
        for (const pt of this.points) {
            const { h1, h2, yBinary } = this.forwardPassStep(pt.x, pt.y);
            const target = outputs[pt.key];
            const isCorrect = yBinary === target;
            if (isCorrect) correct++;
            
            document.getElementById('h' + pt.key).textContent = `(${h1}, ${h2})`;
            document.getElementById('y' + pt.key).textContent = `${yBinary}`;
            document.getElementById('c' + pt.key).textContent = isCorrect ? '✓' : '✗';
            document.getElementById('c' + pt.key).style.color = isCorrect ? '#2e7d32' : '#c62828';
        }
        
        document.getElementById('networkAccuracy').textContent = `Network Accuracy: ${correct}/4`;
        document.getElementById('networkAccuracy').style.color = correct === 4 ? '#2e7d32' : '#333';
    }
    
    updateNetwork() {
        this.drawORGate();
        this.drawNANDGate();
        this.drawInputSpace2();
        this.drawHiddenSpace();
        this.drawNetworkDiagram();
        this.updateComputationTable();
    }
    
    drawNetworkDiagram() {
        const canvas = this.canvasNet;
        const ctx = this.ctxNet;
        const W = canvas.width;
        const H = canvas.height;
        
        ctx.clearRect(0, 0, W, H);
        
        // Neuron positions - spread across wider canvas
        const layerX = [80, W/2, W - 80];
        const inputY = [H/2 - 35, H/2 + 35];
        const hiddenY = [H/2 - 35, H/2 + 35];
        const outputY = [H/2];
        
        const neurons = {
            x1: { x: layerX[0], y: inputY[0] },
            x2: { x: layerX[0], y: inputY[1] },
            h1: { x: layerX[1], y: hiddenY[0] },
            h2: { x: layerX[1], y: hiddenY[1] },
            y:  { x: layerX[2], y: outputY[0] }
        };
        
        const radius = 22;
        
        // Draw connections with weight labels
        // t: position along line (0=from, 1=to), offsetY: perpendicular offset
        const drawConnection = (from, to, label, color, t = 0.5, offsetY = -10) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(from.x + radius, from.y);
            ctx.lineTo(to.x - radius, to.y);
            ctx.stroke();
            
            // Weight label at specified position along line
            const labelX = from.x + (to.x - from.x) * t;
            const labelY = from.y + (to.y - from.y) * t + offsetY;
            ctx.fillStyle = '#666';
            ctx.font = '11px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, labelX, labelY);
        };
        
        // Hidden layer connections - stagger label positions to avoid overlap
        drawConnection(neurons.x1, neurons.h1, 'w₁₁', '#888', 0.3, -10);   // top-left, early
        drawConnection(neurons.x2, neurons.h1, 'w₁₂', '#888', 0.75, 12);   // bottom-left to top, late, below
        drawConnection(neurons.x1, neurons.h2, 'w₂₁', '#888', 0.75, -12);  // top-left to bottom, late, above
        drawConnection(neurons.x2, neurons.h2, 'w₂₂', '#888', 0.3, 10);    // bottom-left, early, below
        
        // Output layer connections
        drawConnection(neurons.h1, neurons.y, 'v₁', '#888', 0.5, -10);
        drawConnection(neurons.h2, neurons.y, 'v₂', '#888', 0.5, 10);
        
        // Draw neurons
        const drawNeuron = (n, label, bgColor, borderColor, textColor) => {
            ctx.fillStyle = bgColor;
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(n.x, n.y, radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            
            ctx.fillStyle = textColor;
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, n.x, n.y);
        };
        
        // Input neurons
        drawNeuron(neurons.x1, 'x₁', '#e3f2fd', '#1976d2', '#1976d2');
        drawNeuron(neurons.x2, 'x₂', '#e3f2fd', '#1976d2', '#1976d2');
        
        // Hidden neurons - same color for both (orange/yellow)
        drawNeuron(neurons.h1, 'h₁', '#fff3e0', '#f57c00', '#e65100');
        drawNeuron(neurons.h2, 'h₂', '#fff3e0', '#f57c00', '#e65100');
        
        // Output neuron
        drawNeuron(neurons.y, 'y', '#e8f5e9', '#388e3c', '#2e7d32');
        
        // Bias labels
        ctx.fillStyle = '#999';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('+b₁', neurons.h1.x, neurons.h1.y + radius + 12);
        ctx.fillText('+b₂', neurons.h2.x, neurons.h2.y + radius + 12);
        ctx.fillText('+c', neurons.y.x, neurons.y.y + radius + 12);
    }
    
    loadXORSolution() {
        this.weights = { ...this.xorSolution };
        this.updateSliders();
        this.updateNetwork();
        
        // Switch to XOR mode
        document.querySelectorAll('.gate-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-gate="xor"]').classList.add('active');
        this.currentGate = 'xor';
        this.updateTruthTable();
        this.update();
    }
    
    resetWeights() {
        this.weights = {
            w11: 1, w12: 1, b1: -0.5,      // h1 (OR-like): fires when x1+x2 > 0.5
            w21: -1, w22: -1, b2: 1.5,     // h2 (NAND-like): fires when x1+x2 < 1.5
            v1: 1, v2: 1, c: -1.5          // output: fires when both h1 and h2 fire
        };
        this.updateSliders();
        this.updateNetwork();
    }
    
    updateSliders() {
        const weightIds = ['w11', 'w12', 'b1', 'w21', 'w22', 'b2', 'v1', 'v2', 'c'];
        weightIds.forEach(id => {
            const slider = document.getElementById(id);
            if (slider) {
                slider.value = this.weights[id];
                document.getElementById(id + 'Val').textContent = this.weights[id].toFixed(1);
            }
        });
    }
}

// Initialize
function init() {
    new XORVisualization();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
