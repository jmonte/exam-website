// Main Application Controller
class ExamApp {
    constructor() {
        this.pages = [];
        this.currentPageIndex = 0;
        this.canvas = null;
        this.isDrawing = false;
        this.currentTool = 'pen';
        this.currentColor = '#000000';
        this.brushSize = 3;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners() {
        // File upload events
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const browseBtn = document.getElementById('browseBtn');

        // Upload area events
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(Array.from(e.target.files));
        });

        // Browse button
        browseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.click();
        });

        // Navigation controls
        document.getElementById('prevBtn').addEventListener('click', () => this.previousPage());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextPage());
        
        // Tool controls
        document.querySelectorAll('[data-tool]').forEach(btn => {
            btn.addEventListener('click', (e) => this.setTool(e.target.dataset.tool));
        });
        
        // Color controls
        document.querySelectorAll('[data-color]').forEach(btn => {
            btn.addEventListener('click', (e) => this.setColor(e.target.dataset.color));
        });
        
        // Brush size
        const brushSize = document.getElementById('brushSize');
        brushSize.addEventListener('input', (e) => this.setBrushSize(e.target.value));
        
        // Action buttons
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());
        document.getElementById('clearAll').addEventListener('click', () => this.clearAll());
        document.getElementById('saveExam').addEventListener('click', () => this.saveExam());
        document.getElementById('addPageBtn').addEventListener('click', () => this.addNewPage());

        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
    }

    // File Upload Handlers
    handleDragOver(e) {
        e.preventDefault();
        e.target.closest('.upload-area').classList.add('dragover');
    }

    handleDragLeave(e) {
        e.target.closest('.upload-area').classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        const uploadArea = e.target.closest('.upload-area');
        uploadArea.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        this.handleFileUpload(files);
    }

    async handleFileUpload(files) {
        const validFiles = files.filter(file => 
            file.type.startsWith('image/') || file.type === 'application/pdf'
        );

        if (validFiles.length === 0) {
            alert('Please upload valid image files (JPG, PNG) or PDF files.');
            return;
        }

        // Show loading state
        document.getElementById('uploadSection').style.opacity = '0.5';
        
        try {
            for (const file of validFiles) {
                if (file.type === 'application/pdf') {
                    await this.handlePDFFile(file);
                } else {
                    await this.handleImageFile(file);
                }
            }
            
            this.showExamInterface();
        } catch (error) {
            console.error('Error processing files:', error);
            alert('Error processing files. Please try again.');
        } finally {
            document.getElementById('uploadSection').style.opacity = '1';
        }
    }

    async handleImageFile(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.addPage(e.target.result, img.width, img.height);
                    resolve();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    async handlePDFFile(file) {
        // For PDF files, we'll treat each as a single page
        // In a real implementation, you'd use PDF.js to extract pages
        return this.handleImageFile(file);
    }

    // Page Management
    addPage(imageSrc, width, height) {
        const page = {
            id: Date.now() + Math.random(),
            imageSrc,
            width,
            height,
            drawings: [],
            history: [],
            historyIndex: -1
        };
        
        this.pages.push(page);
        this.updateUI();
    }

    addNewPage() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*,.pdf';
        fileInput.onchange = (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(Array.from(e.target.files));
            }
        };
        fileInput.click();
    }

    deletePage(index) {
        if (this.pages.length <= 1) return;
        
        this.pages.splice(index, 1);
        if (this.currentPageIndex >= this.pages.length) {
            this.currentPageIndex = this.pages.length - 1;
        }
        this.updateUI();
    }

    // Navigation
    previousPage() {
        if (this.currentPageIndex > 0) {
            this.currentPageIndex--;
            this.updateUI();
        }
    }

    nextPage() {
        if (this.currentPageIndex < this.pages.length - 1) {
            this.currentPageIndex++;
            this.updateUI();
        }
    }

    // Tool Management
    setTool(tool) {
        this.currentTool = tool;
        document.querySelectorAll('[data-tool]').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
        this.updateCanvasCursor();
    }

    setColor(color) {
        this.currentColor = color;
        document.querySelectorAll('[data-color]').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-color="${color}"]`).classList.add('active');
    }

    setBrushSize(size) {
        this.brushSize = parseInt(size);
        document.getElementById('sizeDisplay').textContent = `${size}px`;
    }

    updateCanvasCursor() {
        const canvas = document.querySelector('.drawing-canvas');
        if (!canvas) return;
        
        if (this.currentTool === 'pen') {
            canvas.style.cursor = 'crosshair';
        } else if (this.currentTool === 'eraser') {
            canvas.style.cursor = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><circle cx="10" cy="10" r="8" fill="none" stroke="black" stroke-width="2"/></svg>') 10 10, auto`;
        }
    }

    // Drawing Actions
    undo() {
        if (this.canvas) {
            this.canvas.undo();
        }
    }

    redo() {
        if (this.canvas) {
            this.canvas.redo();
        }
    }

    clearAll() {
        if (confirm('Are you sure you want to clear all drawings on this page?')) {
            if (this.canvas) {
                this.canvas.clear();
            }
        }
    }

    // UI Updates
    showExamInterface() {
        document.getElementById('uploadSection').classList.add('hidden');
        document.getElementById('examInterface').classList.remove('hidden');
        document.getElementById('examInterface').classList.add('fade-in');
        
        setTimeout(() => {
            this.renderCurrentPage();
        }, 100);
    }

    updateUI() {
        if (this.pages.length === 0) return;
        
        // Update page indicator
        document.getElementById('pageIndicator').textContent = 
            `Page ${this.currentPageIndex + 1} of ${this.pages.length}`;
        
        // Update navigation buttons
        document.getElementById('prevBtn').disabled = this.currentPageIndex === 0;
        document.getElementById('nextBtn').disabled = this.currentPageIndex === this.pages.length - 1;
        
        this.renderCurrentPage();
    }

    renderCurrentPage() {
        if (this.pages.length === 0) return;
        
        const pageWrapper = document.getElementById('pageWrapper');
        const currentPage = this.pages[this.currentPageIndex];
        
        pageWrapper.innerHTML = `
            <div class="page current">
                <div class="page-content">
                    <img src="${currentPage.imageSrc}" class="page-image" alt="Test paper page ${this.currentPageIndex + 1}">
                    <canvas class="drawing-canvas" id="drawingCanvas"></canvas>
                </div>
            </div>
        `;
        
        // Wait for the image to load and page to be rendered
        const img = pageWrapper.querySelector('.page-image');
        const canvas = document.getElementById('drawingCanvas');
        
        const initializeCanvas = () => {
            // Ensure the canvas has proper dimensions
            setTimeout(() => {
                this.canvas = new DrawingCanvas(canvas, {
                    tool: this.currentTool,
                    color: this.currentColor,
                    brushSize: this.brushSize,
                    onDrawingChange: (drawingData) => {
                        currentPage.drawings = drawingData;
                    }
                });
                
                // Restore previous drawings
                if (currentPage.drawings && currentPage.drawings.length > 0) {
                    this.canvas.loadDrawings(currentPage.drawings);
                }
                
                this.updateCanvasCursor();
            }, 100);
        };

        if (img.complete) {
            initializeCanvas();
        } else {
            img.addEventListener('load', initializeCanvas);
            img.addEventListener('error', initializeCanvas); // Still initialize even if image fails to load
        }
    }

    // Keyboard Shortcuts
    handleKeyboard(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'z':
                    e.preventDefault();
                    this.undo();
                    break;
                case 'y':
                    e.preventDefault();
                    this.redo();
                    break;
                case 's':
                    e.preventDefault();
                    this.saveExam();
                    break;
            }
        }
        
        // Page navigation
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.previousPage();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextPage();
                break;
        }
    }

    // Save/Export
    async saveExam() {
        if (this.pages.length === 0) return;
        
        try {
            const examData = {
                pages: this.pages.map((page, index) => ({
                    id: page.id,
                    imageSrc: page.imageSrc,
                    drawings: page.drawings
                })),
                timestamp: new Date().toISOString()
            };
            
            // Save to localStorage
            localStorage.setItem('exam_data', JSON.stringify(examData));
            
            // Create downloadable file
            const blob = new Blob([JSON.stringify(examData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `exam_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert('Exam saved successfully!');
        } catch (error) {
            console.error('Error saving exam:', error);
            alert('Error saving exam. Please try again.');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.examApp = new ExamApp();
});