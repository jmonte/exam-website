// Drawing Canvas Controller with Apple Pencil Support
class DrawingCanvas {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.options = {
            tool: 'pen',
            color: '#000000',
            brushSize: 3,
            onDrawingChange: () => {},
            ...options
        };
        
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.drawings = [];
        this.history = [];
        this.historyIndex = -1;
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.saveState();
    }

    setupCanvas() {
        // Set canvas size to match container
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        // Ensure minimum canvas size
        const width = Math.max(rect.width, 300);
        const height = Math.max(rect.height, 200);
        
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        
        // Only scale if canvas has valid dimensions
        if (this.canvas.width > 0 && this.canvas.height > 0) {
            this.ctx.scale(dpr, dpr);
        }
        
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        
        // Set drawing properties
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.imageSmoothingEnabled = true;
        
        // Handle resize
        window.addEventListener('resize', () => {
            setTimeout(() => this.setupCanvas(), 100);
        });
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));

        // Touch events for mobile and Apple Pencil
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        this.canvas.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });

        // Pointer events for better stylus support
        if (window.PointerEvent) {
            this.canvas.addEventListener('pointerdown', this.handlePointerDown.bind(this));
            this.canvas.addEventListener('pointermove', this.handlePointerMove.bind(this));
            this.canvas.addEventListener('pointerup', this.handlePointerEnd.bind(this));
            this.canvas.addEventListener('pointercancel', this.handlePointerEnd.bind(this));
        }

        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    // Mouse Events
    startDrawing(e) {
        if (e.button !== 0) return; // Only left mouse button
        
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
        
        this.beginStroke(this.lastX, this.lastY, 0.5);
    }

    draw(e) {
        if (!this.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        this.drawLine(this.lastX, this.lastY, currentX, currentY, 0.5);
        
        this.lastX = currentX;
        this.lastY = currentY;
    }

    stopDrawing() {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        this.endStroke();
    }

    // Touch Events (Apple Pencil and finger)
    handleTouchStart(e) {
        e.preventDefault();
        
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            
            this.isDrawing = true;
            this.lastX = touch.clientX - rect.left;
            this.lastY = touch.clientY - rect.top;
            
            // Use force for pressure sensitivity if available
            const pressure = touch.force || 0.5;
            this.beginStroke(this.lastX, this.lastY, pressure);
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        
        if (!this.isDrawing || e.touches.length !== 1) return;
        
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const currentX = touch.clientX - rect.left;
        const currentY = touch.clientY - rect.top;
        const pressure = touch.force || 0.5;
        
        this.drawLine(this.lastX, this.lastY, currentX, currentY, pressure);
        
        this.lastX = currentX;
        this.lastY = currentY;
    }

    handleTouchEnd(e) {
        e.preventDefault();
        
        if (this.isDrawing) {
            this.isDrawing = false;
            this.endStroke();
        }
    }

    // Pointer Events (Enhanced stylus support)
    handlePointerDown(e) {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        
        e.preventDefault();
        this.canvas.setPointerCapture(e.pointerId);
        
        const rect = this.canvas.getBoundingClientRect();
        this.isDrawing = true;
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
        
        // Use pressure for Apple Pencil
        const pressure = e.pressure || 0.5;
        this.beginStroke(this.lastX, this.lastY, pressure);
    }

    handlePointerMove(e) {
        if (!this.isDrawing) return;
        
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        const pressure = e.pressure || 0.5;
        
        this.drawLine(this.lastX, this.lastY, currentX, currentY, pressure);
        
        this.lastX = currentX;
        this.lastY = currentY;
    }

    handlePointerEnd(e) {
        if (this.isDrawing) {
            e.preventDefault();
            this.canvas.releasePointerCapture(e.pointerId);
            this.isDrawing = false;
            this.endStroke();
        }
    }

    // Drawing Methods
    beginStroke(x, y, pressure) {
        this.currentStroke = {
            tool: this.options.tool,
            color: this.options.color,
            size: this.options.brushSize,
            points: [{ x, y, pressure }]
        };
        
        this.ctx.globalCompositeOperation = this.options.tool === 'eraser' ? 'destination-out' : 'source-over';
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    }

    drawLine(fromX, fromY, toX, toY, pressure) {
        if (!this.currentStroke) return;
        
        this.currentStroke.points.push({ x: toX, y: toY, pressure });
        
        // Calculate dynamic brush size based on pressure
        const baseBrushSize = this.options.brushSize;
        const dynamicSize = baseBrushSize * (0.5 + pressure * 0.5);
        
        this.ctx.lineWidth = dynamicSize;
        this.ctx.strokeStyle = this.options.tool === 'eraser' ? '#000000' : this.options.color;
        
        this.ctx.lineTo(toX, toY);
        this.ctx.stroke();
        
        // Smooth the line with quadratic curves for better Apple Pencil experience
        if (this.currentStroke.points.length > 2) {
            const points = this.currentStroke.points;
            const len = points.length;
            
            this.ctx.beginPath();
            this.ctx.moveTo(points[len - 3].x, points[len - 3].y);
            
            const midX = (points[len - 2].x + points[len - 1].x) / 2;
            const midY = (points[len - 2].y + points[len - 1].y) / 2;
            
            this.ctx.quadraticCurveTo(points[len - 2].x, points[len - 2].y, midX, midY);
            this.ctx.stroke();
        }
    }

    endStroke() {
        if (this.currentStroke) {
            this.drawings.push({ ...this.currentStroke });
            this.currentStroke = null;
            this.saveState();
            
            // Notify parent component
            this.options.onDrawingChange(this.drawings);
        }
    }

    // Tool Management
    setTool(tool) {
        this.options.tool = tool;
    }

    setColor(color) {
        this.options.color = color;
    }

    setBrushSize(size) {
        this.options.brushSize = size;
    }

    // History Management
    saveState() {
        // Check if canvas has valid dimensions
        if (this.canvas.width === 0 || this.canvas.height === 0) {
            console.warn('Canvas has invalid dimensions, skipping save state');
            return;
        }
        
        // Remove any history beyond current index
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        try {
            // Save current canvas state
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            this.history.push({
                imageData: imageData,
                drawings: JSON.parse(JSON.stringify(this.drawings))
            });
            
            this.historyIndex++;
            
            // Limit history size
            if (this.history.length > 20) {
                this.history.shift();
                this.historyIndex--;
            }
        } catch (error) {
            console.error('Failed to save canvas state:', error);
        }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState();
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState();
        }
    }

    restoreState() {
        if (this.historyIndex >= 0 && this.historyIndex < this.history.length) {
            const state = this.history[this.historyIndex];
            this.ctx.putImageData(state.imageData, 0, 0);
            this.drawings = JSON.parse(JSON.stringify(state.drawings));
            this.options.onDrawingChange(this.drawings);
        }
    }

    clear() {
        if (this.canvas.width > 0 && this.canvas.height > 0) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.drawings = [];
        this.saveState();
        this.options.onDrawingChange(this.drawings);
    }

    // Load/Save Drawings
    loadDrawings(drawings) {
        this.clear();
        this.drawings = JSON.parse(JSON.stringify(drawings));
        this.redrawCanvas();
        this.saveState();
    }

    redrawCanvas() {
        if (this.canvas.width === 0 || this.canvas.height === 0) {
            console.warn('Canvas has invalid dimensions, skipping redraw');
            return;
        }
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawings.forEach(stroke => {
            if (!stroke.points || stroke.points.length === 0) return;
            
            this.ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
            this.ctx.strokeStyle = stroke.color || '#000000';
            this.ctx.lineWidth = stroke.size || 3;
            
            this.ctx.beginPath();
            this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            
            for (let i = 1; i < stroke.points.length; i++) {
                const point = stroke.points[i];
                
                if (i === stroke.points.length - 1) {
                    this.ctx.lineTo(point.x, point.y);
                } else {
                    const nextPoint = stroke.points[i + 1];
                    const midX = (point.x + nextPoint.x) / 2;
                    const midY = (point.y + nextPoint.y) / 2;
                    this.ctx.quadraticCurveTo(point.x, point.y, midX, midY);
                }
            }
            
            this.ctx.stroke();
        });
    }

    // Export
    toDataURL(type = 'image/png', quality = 0.92) {
        return this.canvas.toDataURL(type, quality);
    }

    toBlob(callback, type = 'image/png', quality = 0.92) {
        this.canvas.toBlob(callback, type, quality);
    }
}