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
        this.scale = 50; // Scale factor for coordinate system (pixels per unit)
        this.maxCoord = 3; // Maximum coordinate value (-3 to 3)
        
        // Vector endpoints (can have any length within bounds)
        this.vectorA = { x: 2.0, y: 1.5 }; // Example vector
        this.vectorB = { x: -1.0, y: 2.5 }; // Example vector
        
        // Interaction state
        this.dragging = null;
        this.dragOffset = { x: 0, y: 0 };
        
        this.setupEventListeners();
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
        
        if (this.isPointNearEndpoint(mousePos.x, mousePos.y, this.vectorA)) {
            this.dragging = 'A';
            const endpoint = this.getVectorEndpoint(this.vectorA);
            this.dragOffset = {
                x: mousePos.x - endpoint.x,
                y: mousePos.y - endpoint.y
            };
        } else if (this.isPointNearEndpoint(mousePos.x, mousePos.y, this.vectorB)) {
            this.dragging = 'B';
            const endpoint = this.getVectorEndpoint(this.vectorB);
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
            
            if (this.dragging === 'A') {
                this.vectorA = constrained;
            } else if (this.dragging === 'B') {
                this.vectorB = constrained;
            }
            
            this.update();
        } else {
            // Update cursor
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
        this.handleMouseDown({ clientX: touchPos.x, clientY: touchPos.y });
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        const touchPos = this.getTouchPos(e);
        this.handleMouseMove({ clientX: touchPos.x, clientY: touchPos.y });
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
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw coordinate bounds
        this.drawCoordinateBounds();
        
        // Draw axes
        this.drawAxes();
        
        // Draw angle arc
        this.drawAngleArc();
        
        // Draw vectors
        this.drawVector(this.vectorA, '#dc3545', 'A'); // Red
        this.drawVector(this.vectorB, '#007bff', 'B'); // Blue
        
        // Draw coordinate labels
        this.drawCoordinateLabels();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 0.5;
        
        const gridSpacing = this.scale; // 1 unit spacing
        const maxPixels = this.maxCoord * this.scale;
        
        // Vertical lines
        for (let i = -this.maxCoord; i <= this.maxCoord; i++) {
            const x = this.centerX + i * this.scale;
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.centerY - maxPixels);
            this.ctx.lineTo(x, this.centerY + maxPixels);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let i = -this.maxCoord; i <= this.maxCoord; i++) {
            const y = this.centerY + i * this.scale;
            this.ctx.beginPath();
            this.ctx.moveTo(this.centerX - maxPixels, y);
            this.ctx.lineTo(this.centerX + maxPixels, y);
            this.ctx.stroke();
        }
    }
    
    drawCoordinateBounds() {
        // Draw a rectangle showing the coordinate bounds
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        const maxPixels = this.maxCoord * this.scale;
        this.ctx.beginPath();
        this.ctx.rect(
            this.centerX - maxPixels, 
            this.centerY - maxPixels, 
            2 * maxPixels, 
            2 * maxPixels
        );
        this.ctx.stroke();
        this.ctx.setLineDash([]);
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
        
        // Angle label positioned at the middle of the arc
        let midAngle = (startAngle + endAngle) / 2;
        
        const labelX = this.centerX + Math.cos(midAngle) * (arcRadius + 20);
        const labelY = this.centerY + Math.sin(midAngle) * (arcRadius + 20); // Use + since we already flipped Y in angle calculation
        
        this.ctx.fillStyle = '#666';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`θ = ${calculations.angleDeg.toFixed(1)}°`, labelX, labelY);
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
        
        // X axis labels
        for (let i = -this.maxCoord; i <= this.maxCoord; i++) {
            if (i !== 0) {
                const x = this.centerX + i * this.scale;
                this.ctx.fillText(i.toString(), x, this.centerY + 20);
            }
        }
        
        // Y axis labels
        for (let i = -this.maxCoord; i <= this.maxCoord; i++) {
            if (i !== 0) {
                const y = this.centerY - i * this.scale; // Flip Y for display
                this.ctx.fillText(i.toString(), this.centerX - 20, y);
            }
        }
        
        // Origin
        this.ctx.fillText('0', this.centerX - 15, this.centerY + 15);
    }
    
    updateDisplay() {
        const calculations = this.calculateCosineSimilarity();
        
        // Update live results panel (right side of canvas)
        document.getElementById('cosineSimilarityLive').textContent = calculations.cosineSimilarity.toFixed(2);
        document.getElementById('angleLive').textContent = calculations.angleDeg.toFixed(1) + '°';
        document.getElementById('dotProductLive').textContent = calculations.dotProduct.toFixed(2);
        
        // Update vector components and magnitudes
        document.getElementById('vectorAComponents').textContent = `(${this.vectorA.x.toFixed(1)}, ${this.vectorA.y.toFixed(1)})`;
        document.getElementById('vectorBComponents').textContent = `(${this.vectorB.x.toFixed(1)}, ${this.vectorB.y.toFixed(1)})`;
        document.getElementById('magnitudeA').textContent = calculations.magnitudeA.toFixed(2);
        document.getElementById('magnitudeB').textContent = calculations.magnitudeB.toFixed(2);
        
        // Update the LaTeX calculation with current values
        const latexCalc = `$$\\cos(\\theta) = \\frac{(${this.vectorA.x.toFixed(2)})(${this.vectorB.x.toFixed(2)}) + (${this.vectorA.y.toFixed(2)})(${this.vectorB.y.toFixed(2)})}{\\sqrt{${this.vectorA.x.toFixed(2)}^2 + ${this.vectorA.y.toFixed(2)}^2} \\sqrt{${this.vectorB.x.toFixed(2)}^2 + ${this.vectorB.y.toFixed(2)}^2}} = \\frac{${calculations.dotProduct.toFixed(2)}}{${calculations.magnitudeA.toFixed(2)} \\times ${calculations.magnitudeB.toFixed(2)}} = ${calculations.cosineSimilarity.toFixed(2)}$$`;
        
        document.getElementById('fullCalculation').innerHTML = latexCalc;
        
        // Re-render MathJax for the updated equation
        if (window.MathJax) {
            window.MathJax.typesetPromise([document.getElementById('fullCalculation')]).catch((err) => console.log(err.message));
        }
    }
    
    
    update() {
        this.draw();
        this.updateDisplay();
    }
}

// Initialize the visualization when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CosineSimilarityVisualization();
});
