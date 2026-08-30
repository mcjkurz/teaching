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
            w11: 0.2, w12: 1, b1: -0.5,    
            w21: 0.5, w22: -1.5, b2: 0.7,   
            v1: 0.3, v2: 1, c: -0.5        // output: not quite AND yet
        };
        
        // XOR solution weights - OR + NAND decomposition
        // h1: OR gate - fires when x1+x2 > 0.5 → boundary at x1+x2=0.5
        // h2: NAND gate - fires when x1+x2 < 1.5 (NOT AND) → uses negative weights
        // output: h1 AND h2 → XOR (both must fire)
        this.xorSolutionOrNand = {
            w11: 1, w12: 1, b1: -0.5,     // h1 (OR): fires when x1+x2 >= 0.5
            w21: -1, w22: -1, b2: 1.5,    // h2 (NAND): fires when x1+x2 <= 1.5
            v1: 1, v2: 1, c: -1.5         // output (AND): fires when h1+h2 >= 1.5
        };
        
        // XOR solution weights - Exclusive decomposition
        // h1: x1 AND NOT x2 - fires only when (1,0)
        // h2: NOT x1 AND x2 - fires only when (0,1)
        // output: h1 OR h2 → XOR (either must fire)
        this.xorSolutionExclusive = {
            w11: 1, w12: -1, b1: -0.5,    // h1 (x₁∧¬x₂): fires when x1-x2 >= 0.5
            w21: -1, w22: 1, b2: -0.5,    // h2 (¬x₁∧x₂): fires when x2-x1 >= 0.5
            v1: 1, v2: 1, c: -0.5         // output (OR): fires when h1+h2 >= 0.5
        };
        
        // Keep backward compatibility
        this.xorSolution = this.xorSolutionOrNand;
        
        this.setupCanvases();
        this.setupEventListeners();
        this.update();
        this.updateNetwork();
    }
    
    scaleForDPI(canvas) {
        const dpr = window.devicePixelRatio || 1;
        const logW = parseInt(canvas.getAttribute('width'), 10);
        const logH = parseInt(canvas.getAttribute('height'), 10);
        canvas.logicalWidth = logW;
        canvas.logicalHeight = logH;
        canvas.style.width = logW + 'px';
        canvas.style.height = logH + 'px';
        canvas.setAttribute('width', logW * dpr);
        canvas.setAttribute('height', logH * dpr);
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        return ctx;
    }

    setupCanvases() {
        this.canvas1 = document.getElementById('inputSpaceCanvas');
        this.ctx1 = this.scaleForDPI(this.canvas1);

        this.canvasPerceptron = document.getElementById('perceptronDiagramCanvas');
        this.ctxPerceptron = this.scaleForDPI(this.canvasPerceptron);

        this.canvasOR = document.getElementById('orGateCanvas');
        this.ctxOR = this.scaleForDPI(this.canvasOR);
        this.canvasNAND = document.getElementById('nandGateCanvas');
        this.ctxNAND = this.scaleForDPI(this.canvasNAND);

        this.canvas2 = document.getElementById('inputSpaceCanvas2');
        this.ctx2 = this.scaleForDPI(this.canvas2);

        this.canvasH = document.getElementById('hiddenSpaceCanvas');
        this.ctxH = this.scaleForDPI(this.canvasH);

        this.canvasNet = document.getElementById('networkDiagramCanvas');
        this.ctxNet = this.scaleForDPI(this.canvasNet);

        this.canvasStepPart1 = document.getElementById('stepFunctionCanvasPart1');
        this.ctxStepPart1 = this.scaleForDPI(this.canvasStepPart1);
        this.canvasStep = document.getElementById('stepFunctionCanvas');
        this.ctxStep = this.scaleForDPI(this.canvasStep);
        this.drawStepFunction(this.canvasStepPart1, this.ctxStepPart1);
        this.drawStepFunction(this.canvasStep, this.ctxStep);

        // Mini network diagrams
        this.canvasMiniH1 = document.getElementById('miniNetH1');
        this.ctxMiniH1 = this.scaleForDPI(this.canvasMiniH1);
        this.canvasMiniH2 = document.getElementById('miniNetH2');
        this.ctxMiniH2 = this.scaleForDPI(this.canvasMiniH2);
        this.canvasMiniOutput = document.getElementById('miniNetOutput');
        this.ctxMiniOutput = this.scaleForDPI(this.canvasMiniOutput);
        
        this.drawMiniNetworks();

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
        const outputX = canvas.logicalWidth - 50;
        const outputY = canvas.logicalHeight / 2;
        const radius = 18;
        
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Check if mouse is over output neuron
            const dist = Math.sqrt((x - outputX) ** 2 + (y - outputY) ** 2);
            if (dist <= radius) {
                tooltip.innerHTML = 'y = σ(w<sub>1</sub>·x<sub>1</sub> + w<sub>2</sub>·x<sub>2</sub> + b)';
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
        const W = canvas.logicalWidth;
        const H = canvas.logicalHeight;
        const layerX = [80, W/2, W - 80];
        const inputY = [H/2 - 35, H/2 + 35];
        const hiddenY = [H/2 - 35, H/2 + 35];
        const outputY = H/2;
        const radius = 22;
        
        const neurons = {
            h1: { x: layerX[1], y: hiddenY[0], tooltip: 'h<sub>1</sub> = σ(w<sub>11</sub>·x<sub>1</sub> + w<sub>12</sub>·x<sub>2</sub> + b<sub>1</sub>)' },
            h2: { x: layerX[1], y: hiddenY[1], tooltip: 'h<sub>2</sub> = σ(w<sub>21</sub>·x<sub>1</sub> + w<sub>22</sub>·x<sub>2</sub> + b<sub>2</sub>)' },
            y: { x: layerX[2], y: outputY, tooltip: 'y = σ(v<sub>1</sub>·h<sub>1</sub> + v<sub>2</sub>·h<sub>2</sub> + c)' }
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
                    tooltip.innerHTML = n.tooltip;
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
        const W = canvas.logicalWidth;
        const H = canvas.logicalHeight;
        
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
        // Filled circle at (0, 0) - x=0 outputs 0
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#4A90E2';
        ctx.fill();
        
        // Open circle at (0, 1) - x=0 does NOT output 1
        ctx.beginPath();
        ctx.arc(centerX, padding + 5, 4, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = '#4A90E2';
        ctx.lineWidth = 2;
        ctx.stroke();
        
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
        document.getElementById('loadSolutionOrNand')?.addEventListener('click', () => this.loadXORSolutionOrNand());
        document.getElementById('loadSolutionExclusive')?.addEventListener('click', () => this.loadXORSolutionExclusive());
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
        const w = canvas.logicalWidth - 2 * padding;
        const h = canvas.logicalHeight - 2 * padding;
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
        const W = canvas.logicalWidth;
        const H = canvas.logicalHeight;
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
            const nextGate = this.getNextGateSuggestion();
            if (nextGate) {
                msgBox.innerHTML = `Perfect! You found a valid decision boundary. Now try <a href="#" class="gate-link" data-gate="${nextGate}">${nextGate.toUpperCase()}</a>`;
            } else {
                msgBox.textContent = 'Perfect! You solved all linearly separable gates!';
            }
            msgBox.className = 'message-box success';
        } else if (this.currentGate === 'xor') {
            msgBox.textContent = `XOR is not linearly separable! No single line can work (${correct}/4). Try the neural network below.`;
            msgBox.className = 'message-box impossible';
        } else {
            msgBox.textContent = `${correct}/4 correct. Keep adjusting the weights!`;
            msgBox.className = 'message-box';
        }
        
        // Add click handler for gate links
        const gateLink = msgBox.querySelector('.gate-link');
        if (gateLink) {
            gateLink.addEventListener('click', (e) => {
                e.preventDefault();
                const gate = e.target.dataset.gate;
                this.switchToGate(gate);
            });
        }
    }
    
    getNextGateSuggestion() {
        const gateOrder = ['or', 'and', 'nand', 'xor'];
        const currentIndex = gateOrder.indexOf(this.currentGate);
        if (currentIndex < gateOrder.length - 1) {
            return gateOrder[currentIndex + 1];
        }
        return null;
    }
    
    switchToGate(gate) {
        document.querySelectorAll('.gate-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`[data-gate="${gate}"]`).classList.add('active');
        this.currentGate = gate;
        this.updateTruthTable();
        this.update();
    }
    
    update() {
        this.drawInputSpace(this.canvas1, this.ctx1, true);
        this.drawPerceptronDiagram();
        this.updateClassificationStatus();
        this.updatePerceptronEvals();
    }
    
    drawPerceptronDiagram() {
        const canvas = this.canvasPerceptron;
        const ctx = this.ctxPerceptron;
        const W = canvas.logicalWidth;
        const H = canvas.logicalHeight;
        
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
        return x > 0 ? 1 : 0;
    }
    
    detectGatePattern(w1, w2, b) {
        const outputs = {};
        for (const pt of this.points) {
            const z = w1 * pt.x + w2 * pt.y + b;
            outputs[pt.key] = this.step(z);
        }
        
        const patterns = {
            'OR':        { '00': 0, '01': 1, '10': 1, '11': 1 },
            'AND':       { '00': 0, '01': 0, '10': 0, '11': 1 },
            'NAND':      { '00': 1, '01': 1, '10': 1, '11': 0 },
            'NOR':       { '00': 1, '01': 0, '10': 0, '11': 0 },
            'x₁∧¬x₂':    { '00': 0, '01': 0, '10': 1, '11': 0 },
            '¬x₁∧x₂':    { '00': 0, '01': 1, '10': 0, '11': 0 },
            'x₁':        { '00': 0, '01': 0, '10': 1, '11': 1 },
            'x₂':        { '00': 0, '01': 1, '10': 0, '11': 1 },
            '¬x₁':       { '00': 1, '01': 1, '10': 0, '11': 0 },
            '¬x₂':       { '00': 1, '01': 0, '10': 1, '11': 0 },
            'TRUE':      { '00': 1, '01': 1, '10': 1, '11': 1 },
            'FALSE':     { '00': 0, '01': 0, '10': 0, '11': 0 },
            'XOR':       { '00': 0, '01': 1, '10': 1, '11': 0 },
            'XNOR':      { '00': 1, '01': 0, '10': 0, '11': 1 }
        };
        
        for (const [name, pattern] of Object.entries(patterns)) {
            if (outputs['00'] === pattern['00'] &&
                outputs['01'] === pattern['01'] &&
                outputs['10'] === pattern['10'] &&
                outputs['11'] === pattern['11']) {
                return { name, outputs };
            }
        }
        
        return { name: 'Custom', outputs };
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
        const W = canvas.logicalWidth;
        const H = canvas.logicalHeight;
        
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
        
        // Draw points with actual h1 outputs (dynamic based on current weights)
        const h1Outputs = {};
        for (const pt of this.points) {
            const z = w11 * pt.x + w12 * pt.y + b1;
            h1Outputs[pt.key] = this.step(z);
        }
        this.drawPointsExtended(ctx, toScreen, h1Outputs);
    }
    
    drawNANDGate() {
        const canvas = this.canvasNAND;
        const ctx = this.ctxNAND;
        const W = canvas.logicalWidth;
        const H = canvas.logicalHeight;
        
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
        
        // Draw points with actual h2 outputs (dynamic based on current weights)
        const h2Outputs = {};
        for (const pt of this.points) {
            const z = w21 * pt.x + w22 * pt.y + b2;
            h2Outputs[pt.key] = this.step(z);
        }
        this.drawPointsExtended(ctx, toScreen, h2Outputs);
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
        const W = canvas.logicalWidth;
        const H = canvas.logicalHeight;
        
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

        // Add sublabels for axis annotations (dynamic based on detected patterns)
        const xEnd = toScreen(1.25, 0);
        const yEnd = toScreen(0, 1.25);
        const h1Pattern = this.detectGatePattern(this.weights.w11, this.weights.w12, this.weights.b1);
        const h2Pattern = this.detectGatePattern(this.weights.w21, this.weights.w22, this.weights.b2);
        ctx.fillStyle = '#888';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`(${h1Pattern.name})`, xEnd.x, xEnd.y + 24);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`(${h2Pattern.name})`, yEnd.x - 12, yEnd.y + 14);

        // Output decision boundary line in hidden space: v1*h1 + v2*h2 + c = 0
        if (Math.abs(v1) > 0.001 || Math.abs(v2) > 0.001) {
            ctx.strokeStyle = '#9c27b0';
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 4]);
            this.drawBoundaryLine(ctx, v1, v2, c, toScreen);
            ctx.setLineDash([]);
        }
        
        // Transformed points - use actual network output (dynamic)
        // Group points by their hidden space coordinates to handle overlaps
        const pointGroups = {};
        
        for (const pt of this.points) {
            const { h1, h2, yBinary } = this.forwardPassStep(pt.x, pt.y);
            const key = `${h1},${h2}`;
            if (!pointGroups[key]) {
                pointGroups[key] = { h1, h2, points: [] };
            }
            pointGroups[key].points.push({ ...pt, yBinary });
        }
        
        // Draw each group
        for (const key in pointGroups) {
            const group = pointGroups[key];
            const screen = toScreen(group.h1, group.h2);
            const pts = group.points;
            
            if (pts.length === 1) {
                // Single point - draw normally
                const pt = pts[0];
                ctx.fillStyle = pt.yBinary === 1 ? '#2e7d32' : '#c62828';
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
                const allSameOutput = pts.every(p => p.yBinary === pts[0].yBinary);
                const output = pts[0].yBinary;
                
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
        const W = canvas.logicalWidth;
        const H = canvas.logicalHeight;
        
        ctx.clearRect(0, 0, W, H);
        
        const padding = 50;
        const { w11, w12, b1, w21, w22, b2, v1, v2, c } = this.weights;
        
        // Use same coordinate system as Part 1
        const toScreen = (x, y) => ({
            x: padding + (x + 0.2) / 1.4 * (W - 2 * padding),
            y: padding + (1.2 - y) / 1.4 * (H - 2 * padding)
        });
        
        const toCoord = (px, py) => ({
            x: (px - padding) / (W - 2 * padding) * 1.4 - 0.2,
            y: 1.2 - (py - padding) / (H - 2 * padding) * 1.4
        });
        
        // Background shading: use full network forward pass (hidden layer + output layer)
        // For OR+NAND decomposition: output layer does AND (both h1 and h2 must fire)
        // For exclusive decomposition: output layer does OR (either h1 or h2 must fire)
        for (let px = 0; px < W; px += 4) {
            for (let py = 0; py < H; py += 4) {
                const coord = toCoord(px, py);
                const z1 = w11 * coord.x + w12 * coord.y + b1;
                const z2 = w21 * coord.x + w22 * coord.y + b2;
                const h1 = this.step(z1);
                const h2 = this.step(z2);
                const zOut = v1 * h1 + v2 * h2 + c;
                const networkOutput = this.step(zOut);
                ctx.fillStyle = networkOutput === 1 ? 'rgba(200, 230, 200, 0.3)' : 'rgba(230, 200, 200, 0.3)';
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
        this.updateH1Evals();
        this.updateH2Evals();
        this.updateOutputEvals();
        this.updateGateLabels();
    }
    
    updateGateLabels() {
        const { w11, w12, b1, w21, w22, b2, v1, v2, c } = this.weights;
        
        const h1Pattern = this.detectGatePattern(w11, w12, b1);
        const h2Pattern = this.detectGatePattern(w21, w22, b2);
        
        const h1Label = document.getElementById('h1GateLabel');
        const h2Label = document.getElementById('h2GateLabel');
        const h1Legend = document.getElementById('h1LegendLabel');
        const h2Legend = document.getElementById('h2LegendLabel');
        const h1Sublabel = document.getElementById('h1Sublabel');
        const h2Sublabel = document.getElementById('h2Sublabel');
        
        if (h1Label) h1Label.textContent = h1Pattern.name;
        if (h2Label) h2Label.textContent = h2Pattern.name;
        if (h1Legend) h1Legend.textContent = h1Pattern.name;
        if (h2Legend) h2Legend.textContent = h2Pattern.name;
        
        const getSublabel = (pattern) => {
            const descriptions = {
                'OR': 'at least one input is 1',
                'AND': 'both inputs are 1',
                'NAND': 'not both inputs are 1',
                'NOR': 'neither input is 1',
                'x₁∧¬x₂': 'x₁ is 1 but x₂ is 0',
                '¬x₁∧x₂': 'x₂ is 1 but x₁ is 0',
                'x₁': 'x₁ is 1',
                'x₂': 'x₂ is 1',
                '¬x₁': 'x₁ is 0',
                '¬x₂': 'x₂ is 0',
                'TRUE': 'always fires',
                'FALSE': 'never fires',
                'XOR': 'exactly one input is 1',
                'XNOR': 'inputs are the same'
            };
            return descriptions[pattern.name] || 'custom pattern';
        };
        
        if (h1Sublabel) h1Sublabel.textContent = `Green region = h₁ fires (${getSublabel(h1Pattern)})`;
        if (h2Sublabel) h2Sublabel.textContent = `Green region = h₂ fires (${getSublabel(h2Pattern)})`;
        
        // Detect output layer pattern (operates on h1, h2 outputs)
        const outputPattern = this.detectOutputGatePattern();
        const outputGateLabel = document.getElementById('outputGateLabel');
        if (outputGateLabel) outputGateLabel.textContent = outputPattern.name;
        
        // Update info box
        this.updateInfoBox(h1Pattern, h2Pattern, outputPattern);
    }
    
    detectOutputGatePattern() {
        const { v1, v2, c } = this.weights;
        
        const outputs = {};
        const hiddenInputs = [
            { h1: 0, h2: 0, key: '00' },
            { h1: 0, h2: 1, key: '01' },
            { h1: 1, h2: 0, key: '10' },
            { h1: 1, h2: 1, key: '11' }
        ];
        
        for (const pt of hiddenInputs) {
            const z = v1 * pt.h1 + v2 * pt.h2 + c;
            outputs[pt.key] = this.step(z);
        }
        
        const patterns = {
            'OR':   { '00': 0, '01': 1, '10': 1, '11': 1 },
            'AND':  { '00': 0, '01': 0, '10': 0, '11': 1 },
            'NAND': { '00': 1, '01': 1, '10': 1, '11': 0 },
            'NOR':  { '00': 1, '01': 0, '10': 0, '11': 0 },
            'h₁':   { '00': 0, '01': 0, '10': 1, '11': 1 },
            'h₂':   { '00': 0, '01': 1, '10': 0, '11': 1 },
            '¬h₁':  { '00': 1, '01': 1, '10': 0, '11': 0 },
            '¬h₂':  { '00': 1, '01': 0, '10': 1, '11': 0 },
            'h₁∧¬h₂': { '00': 0, '01': 0, '10': 1, '11': 0 },
            '¬h₁∧h₂': { '00': 0, '01': 1, '10': 0, '11': 0 },
            'TRUE':  { '00': 1, '01': 1, '10': 1, '11': 1 },
            'FALSE': { '00': 0, '01': 0, '10': 0, '11': 0 },
            'XOR':   { '00': 0, '01': 1, '10': 1, '11': 0 },
            'XNOR':  { '00': 1, '01': 0, '10': 0, '11': 1 }
        };
        
        for (const [name, pattern] of Object.entries(patterns)) {
            if (outputs['00'] === pattern['00'] &&
                outputs['01'] === pattern['01'] &&
                outputs['10'] === pattern['10'] &&
                outputs['11'] === pattern['11']) {
                return { name, outputs };
            }
        }
        
        return { name: 'Custom', outputs };
    }
    
    updateInfoBox(h1Pattern, h2Pattern, outputPattern) {
        const outputOp = document.getElementById('outputOp');
        const xorExplanation = document.getElementById('xorExplanation');
        
        if (!outputOp || !xorExplanation) return;
        
        // Determine what operator the output layer implements
        // Only show simple operators (AND, OR) in the formula
        if (outputPattern.name === 'AND') {
            outputOp.textContent = 'AND';
        } else if (outputPattern.name === 'OR') {
            outputOp.textContent = 'OR';
        } else if (outputPattern.name === 'NAND') {
            outputOp.textContent = 'NAND';
        } else if (outputPattern.name === 'NOR') {
            outputOp.textContent = 'NOR';
        } else if (outputPattern.name === 'XOR') {
            outputOp.textContent = 'XOR';
        } else if (outputPattern.name === 'XNOR') {
            outputOp.textContent = 'XNOR';
        } else {
            // For non-standard patterns, show a generic operator
            outputOp.textContent = '⊕';
        }
        
        // Check if we have a valid XOR solution
        const networkAccuracy = document.getElementById('networkAccuracy');
        const isCorrect = networkAccuracy && networkAccuracy.textContent.includes('4/4');
        
        if (isCorrect) {
            // Explain the current solution
            if (h1Pattern.name === 'OR' && h2Pattern.name === 'NAND' && outputPattern.name === 'AND') {
                xorExplanation.innerHTML = `<strong>OR + NAND decomposition:</strong> Output is 1 where h₁ fires (${h1Pattern.name}: at least one input) <strong>AND</strong> h₂ fires (${h2Pattern.name}: not both inputs).`;
            } else if (h1Pattern.name === 'x₁∧¬x₂' && h2Pattern.name === '¬x₁∧x₂' && outputPattern.name === 'OR') {
                xorExplanation.innerHTML = `<strong>Exclusive decomposition:</strong> Output is 1 where h₁ fires (${h1Pattern.name}: only x₁) <strong>OR</strong> h₂ fires (${h2Pattern.name}: only x₂).`;
            } else {
                xorExplanation.innerHTML = `The network correctly computes XOR using h₁ (${h1Pattern.name}) ${outputPattern.name} h₂ (${h2Pattern.name}).`;
            }
        } else {
            xorExplanation.innerHTML = `Adjust the weights to make the green regions cover the green (1) points and red regions cover the red (0) points.`;
        }
    }
    
    drawNetworkDiagram() {
        const canvas = this.canvasNet;
        const ctx = this.ctxNet;
        const W = canvas.logicalWidth;
        const H = canvas.logicalHeight;
        
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
    
    drawMiniNetworks() {
        this.drawMiniNetwork(this.canvasMiniH1, this.ctxMiniH1, 'h1');
        this.drawMiniNetwork(this.canvasMiniH2, this.ctxMiniH2, 'h2');
        this.drawMiniNetwork(this.canvasMiniOutput, this.ctxMiniOutput, 'output');
    }
    
    drawMiniNetwork(canvas, ctx, highlight) {
        if (!canvas || !ctx) return;
        
        const W = canvas.logicalWidth;
        const H = canvas.logicalHeight;
        
        ctx.clearRect(0, 0, W, H);
        
        const layerX = [30, W/2, W - 30];
        const inputY = [H/2 - 18, H/2 + 18];
        const hiddenY = [H/2 - 18, H/2 + 18];
        const outputY = H/2;
        const radius = 12;
        
        const neurons = {
            x1: { x: layerX[0], y: inputY[0] },
            x2: { x: layerX[0], y: inputY[1] },
            h1: { x: layerX[1], y: hiddenY[0] },
            h2: { x: layerX[1], y: hiddenY[1] },
            y:  { x: layerX[2], y: outputY }
        };
        
        const greyColor = '#ccc';
        const greyText = '#aaa';
        
        // Colors for highlighted elements
        const inputColor = { bg: '#e3f2fd', border: '#1976d2', text: '#1976d2' };
        const h1Color = { bg: '#fff3e0', border: '#f57c00', text: '#e65100' };
        const h2Color = { bg: '#fff3e0', border: '#f57c00', text: '#e65100' };
        const outputColor = { bg: '#e8f5e9', border: '#388e3c', text: '#2e7d32' };
        
        // Draw connections with optional weight label
        const drawConnection = (from, to, isHighlighted, label = null, customOffsetY = null) => {
            ctx.strokeStyle = isHighlighted ? '#666' : greyColor;
            ctx.lineWidth = isHighlighted ? 1.5 : 1;
            ctx.beginPath();
            ctx.moveTo(from.x + radius, from.y);
            ctx.lineTo(to.x - radius, to.y);
            ctx.stroke();
            
            // Draw weight label if highlighted
            if (isHighlighted && label) {
                const midX = (from.x + to.x) / 2;
                const midY = (from.y + to.y) / 2;
                const offsetY = customOffsetY !== null ? customOffsetY : (from.y < to.y ? 6 : -6);
                ctx.fillStyle = '#666';
                ctx.font = '7px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(label, midX, midY + offsetY);
            }
        };
        
        // Determine which connections to highlight
        const h1Connections = highlight === 'h1';
        const h2Connections = highlight === 'h2';
        const outputConnections = highlight === 'output';
        
        // Hidden layer connections with weight labels
        drawConnection(neurons.x1, neurons.h1, h1Connections, h1Connections ? 'w₁₁' : null);
        drawConnection(neurons.x2, neurons.h1, h1Connections, h1Connections ? 'w₁₂' : null, -10);
        drawConnection(neurons.x1, neurons.h2, h2Connections, h2Connections ? 'w₂₁' : null);
        drawConnection(neurons.x2, neurons.h2, h2Connections, h2Connections ? 'w₂₂' : null);
        
        // Output layer connections with weight labels
        drawConnection(neurons.h1, neurons.y, outputConnections, outputConnections ? 'v₁' : null);
        drawConnection(neurons.h2, neurons.y, outputConnections, outputConnections ? 'v₂' : null);
        
        // Draw neurons
        const drawNeuron = (n, label, colors, isHighlighted, biasLabel = null) => {
            if (isHighlighted) {
                ctx.fillStyle = colors.bg;
                ctx.strokeStyle = colors.border;
                ctx.lineWidth = 2;
            } else {
                ctx.fillStyle = '#f5f5f5';
                ctx.strokeStyle = greyColor;
                ctx.lineWidth = 1;
            }
            
            ctx.beginPath();
            ctx.arc(n.x, n.y, radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            
            ctx.fillStyle = isHighlighted ? colors.text : greyText;
            ctx.font = 'bold 9px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, n.x, n.y);
            
            // Draw bias label if provided
            if (biasLabel) {
                ctx.fillStyle = '#888';
                ctx.font = '7px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(biasLabel, n.x, n.y + radius + 8);
            }
        };
        
        // Input neurons - highlighted for h1 and h2
        const inputHighlight = highlight === 'h1' || highlight === 'h2';
        drawNeuron(neurons.x1, 'x₁', inputColor, inputHighlight);
        drawNeuron(neurons.x2, 'x₂', inputColor, inputHighlight);
        
        // Hidden neurons with bias labels when highlighted
        const h1Bias = highlight === 'h1' ? '+b₁' : null;
        const h2Bias = highlight === 'h2' ? '+b₂' : null;
        drawNeuron(neurons.h1, 'h₁', h1Color, highlight === 'h1' || highlight === 'output', h1Bias);
        drawNeuron(neurons.h2, 'h₂', h2Color, highlight === 'h2' || highlight === 'output', h2Bias);
        
        // Output neuron with bias label when highlighted
        const outputBias = highlight === 'output' ? '+c' : null;
        drawNeuron(neurons.y, 'y', outputColor, highlight === 'output', outputBias);
    }
    
    fmtSigned(n) {
        return n >= 0 ? `+ ${n.toFixed(1)}` : `− ${Math.abs(n).toFixed(1)}`;
    }

    fmtTerms(weights, inputs, bias) {
        let s = `${weights[0].toFixed(1)}·${inputs[0]}`;
        for (let i = 1; i < weights.length; i++) {
            s += ` ${this.fmtSigned(weights[i])}·${inputs[i]}`;
        }
        s += ` ${this.fmtSigned(bias)}`;
        return s;
    }

    buildEvalRow(label, termsStr, sum, result) {
        const cls = result === 1 ? 'output-1' : 'output-0';
        return `<div class="eval-row">`
            + `<span class="eval-label">${label}</span>`
            + `<span class="eval-expansion">= σ(${termsStr})</span>`
            + `<span class="eval-sum">= σ(${sum.toFixed(1)})</span>`
            + `<span class="eval-arrow">→</span>`
            + `<span class="eval-result ${cls}"><strong>${result}</strong></span>`
            + `</div>`;
    }

    updatePerceptronEvals() {
        const el = document.getElementById('perceptronEvals');
        if (!el) return;
        const { w1, w2, b } = this.perceptron;
        let html = '<div class="eval-title">Evaluate all inputs</div>';
        for (const pt of this.points) {
            const sum = w1 * pt.x + w2 * pt.y + b;
            const result = this.step(sum);
            const terms = this.fmtTerms([w1, w2], [pt.x, pt.y], b);
            html += this.buildEvalRow(`f(${pt.x}, ${pt.y})`, terms, sum, result);
        }
        el.innerHTML = html;
    }

    updateH1Evals() {
        const el = document.getElementById('h1Evals');
        if (!el) return;
        const { w11, w12, b1 } = this.weights;
        let html = '<div class="eval-title">Evaluate all inputs</div>';
        for (const pt of this.points) {
            const sum = w11 * pt.x + w12 * pt.y + b1;
            const result = this.step(sum);
            const terms = this.fmtTerms([w11, w12], [pt.x, pt.y], b1);
            html += this.buildEvalRow(`h<sub>1</sub>(${pt.x}, ${pt.y})`, terms, sum, result);
        }
        el.innerHTML = html;
    }

    updateH2Evals() {
        const el = document.getElementById('h2Evals');
        if (!el) return;
        const { w21, w22, b2 } = this.weights;
        let html = '<div class="eval-title">Evaluate all inputs</div>';
        for (const pt of this.points) {
            const sum = w21 * pt.x + w22 * pt.y + b2;
            const result = this.step(sum);
            const terms = this.fmtTerms([w21, w22], [pt.x, pt.y], b2);
            html += this.buildEvalRow(`h<sub>2</sub>(${pt.x}, ${pt.y})`, terms, sum, result);
        }
        el.innerHTML = html;
    }

    updateOutputEvals() {
        const el = document.getElementById('outputEvals');
        if (!el) return;
        const { v1, v2, c } = this.weights;
        let html = '<div class="eval-title">Evaluate all hidden outputs</div>';
        const seen = new Set();
        for (const pt of this.points) {
            const { h1, h2 } = this.forwardPassStep(pt.x, pt.y);
            const key = `${h1},${h2}`;
            if (seen.has(key)) continue;
            seen.add(key);
            const sum = v1 * h1 + v2 * h2 + c;
            const result = this.step(sum);
            const terms = this.fmtTerms([v1, v2], [h1, h2], c);
            html += this.buildEvalRow(`y(${h1}, ${h2})`, terms, sum, result);
        }
        el.innerHTML = html;
    }

    loadXORSolutionOrNand() {
        this.weights = { ...this.xorSolutionOrNand };
        this.updateSliders();
        this.updateNetwork();
        
        // Switch to XOR mode
        document.querySelectorAll('.gate-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-gate="xor"]').classList.add('active');
        this.currentGate = 'xor';
        this.updateTruthTable();
        this.update();
    }
    
    loadXORSolutionExclusive() {
        this.weights = { ...this.xorSolutionExclusive };
        this.updateSliders();
        this.updateNetwork();
        
        // Switch to XOR mode
        document.querySelectorAll('.gate-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-gate="xor"]').classList.add('active');
        this.currentGate = 'xor';
        this.updateTruthTable();
        this.update();
    }
    
    // Keep backward compatibility
    loadXORSolution() {
        this.loadXORSolutionOrNand();
    }
    
    resetWeights() {
        this.weights = {
            w11: 0.2, w12: 1, b1: -0.5,    // h1: non-solution starting weights
            w21: 0.5, w22: -1.5, b2: 0.7,   // h2: non-solution starting weights
            v1: 0.3, v2: 1, c: -0.5        // output: non-solution starting weights
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
