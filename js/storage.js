// Storage and Export Controller
class StorageController {
    constructor() {
        this.storageKey = 'exam_app_data';
        this.autoSaveInterval = 30000; // 30 seconds
        this.autoSaveTimer = null;
        
        this.init();
    }

    init() {
        this.startAutoSave();
        this.setupBeforeUnloadHandler();
    }

    // Auto-save functionality
    startAutoSave() {
        this.autoSaveTimer = setInterval(() => {
            this.autoSave();
        }, this.autoSaveInterval);
    }

    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    autoSave() {
        try {
            if (window.examApp && window.examApp.pages.length > 0) {
                const data = this.prepareDataForSave();
                this.saveToLocalStorage(data);
                console.log('Auto-saved exam data');
            }
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    }

    // Prepare data for saving
    prepareDataForSave() {
        const examApp = window.examApp;
        if (!examApp) return null;

        return {
            pages: examApp.pages.map(page => ({
                id: page.id,
                imageSrc: page.imageSrc,
                width: page.width,
                height: page.height,
                drawings: page.drawings || []
            })),
            currentPageIndex: examApp.currentPageIndex,
            metadata: {
                version: '1.0',
                created: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                userAgent: navigator.userAgent
            }
        };
    }

    // Local Storage operations
    saveToLocalStorage(data) {
        try {
            const jsonData = JSON.stringify(data);
            localStorage.setItem(this.storageKey, jsonData);
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            
            // Handle quota exceeded error
            if (error.name === 'QuotaExceededError') {
                this.cleanupOldData();
                try {
                    localStorage.setItem(this.storageKey, JSON.stringify(data));
                    return true;
                } catch (retryError) {
                    console.error('Retry save failed:', retryError);
                    return false;
                }
            }
            return false;
        }
    }

    loadFromLocalStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return null;
        }
    }

    clearLocalStorage() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
            return false;
        }
    }

    // Clean up old data to free space
    cleanupOldData() {
        const keysToCheck = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('exam_')) {
                keysToCheck.push(key);
            }
        }

        // Remove old exam data
        keysToCheck.forEach(key => {
            if (key !== this.storageKey) {
                localStorage.removeItem(key);
            }
        });
    }

    // Export functionality
    async exportAsJSON() {
        const data = this.prepareDataForSave();
        if (!data) return false;

        try {
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `exam_${timestamp}.json`;

            this.downloadBlob(blob, filename);
            URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Export as JSON failed:', error);
            return false;
        }
    }

    async exportAsPDF() {
        const examApp = window.examApp;
        if (!examApp || examApp.pages.length === 0) return false;

        try {
            // This would require a PDF library like jsPDF
            // For now, we'll create a simple implementation
            const { jsPDF } = window.jspdf || {};
            
            if (!jsPDF) {
                console.error('jsPDF library not loaded');
                return false;
            }

            const pdf = new jsPDF('p', 'mm', 'a4');
            
            for (let i = 0; i < examApp.pages.length; i++) {
                const page = examApp.pages[i];
                
                if (i > 0) {
                    pdf.addPage();
                }

                // Add the background image
                if (page.imageSrc) {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        canvas.width = img.width;
                        canvas.height = img.height;
                        
                        // Draw the background image
                        ctx.drawImage(img, 0, 0);
                        
                        // Draw the annotations (simplified)
                        if (page.drawings && page.drawings.length > 0) {
                            this.drawAnnotationsOnCanvas(ctx, page.drawings, canvas.width, canvas.height);
                        }
                        
                        const imgData = canvas.toDataURL('image/jpeg', 0.95);
                        pdf.addImage(imgData, 'JPEG', 10, 10, 190, 270);
                        
                        if (i === examApp.pages.length - 1) {
                            const timestamp = new Date().toISOString().split('T')[0];
                            pdf.save(`exam_${timestamp}.pdf`);
                        }
                    };
                    img.src = page.imageSrc;
                }
            }
            
            return true;
        } catch (error) {
            console.error('Export as PDF failed:', error);
            return false;
        }
    }

    drawAnnotationsOnCanvas(ctx, drawings, width, height) {
        drawings.forEach(stroke => {
            if (stroke.points.length === 0) return;

            ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
            ctx.strokeStyle = stroke.color || '#000000';
            ctx.lineWidth = stroke.size || 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }

            ctx.stroke();
        });
    }

    async exportAsImages() {
        const examApp = window.examApp;
        if (!examApp || examApp.pages.length === 0) return false;

        try {
            const zip = new JSZip();
            const timestamp = new Date().toISOString().split('T')[0];

            for (let i = 0; i < examApp.pages.length; i++) {
                const page = examApp.pages[i];
                const canvas = await this.createCanvasFromPage(page);
                
                const blob = await new Promise(resolve => {
                    canvas.toBlob(resolve, 'image/png', 0.95);
                });

                zip.file(`page_${i + 1}.png`, blob);
            }

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            this.downloadBlob(zipBlob, `exam_images_${timestamp}.zip`);
            
            return true;
        } catch (error) {
            console.error('Export as images failed:', error);
            return false;
        }
    }

    async createCanvasFromPage(page) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Draw background image
                ctx.drawImage(img, 0, 0);
                
                // Draw annotations
                if (page.drawings && page.drawings.length > 0) {
                    this.drawAnnotationsOnCanvas(ctx, page.drawings, canvas.width, canvas.height);
                }
                
                resolve(canvas);
            };
            img.src = page.imageSrc;
        });
    }

    // Import functionality
    async importFromJSON(file) {
        try {
            const text = await this.readFileAsText(file);
            const data = JSON.parse(text);
            
            if (this.validateImportData(data)) {
                return data;
            } else {
                throw new Error('Invalid file format');
            }
        } catch (error) {
            console.error('Import from JSON failed:', error);
            return null;
        }
    }

    validateImportData(data) {
        return data && 
               Array.isArray(data.pages) && 
               data.pages.every(page => 
                   page.id && 
                   page.imageSrc && 
                   Array.isArray(page.drawings)
               );
    }

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    // Utility methods
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Setup before unload handler to save data
    setupBeforeUnloadHandler() {
        window.addEventListener('beforeunload', (e) => {
            this.autoSave();
            
            // Show warning if there are unsaved changes
            const examApp = window.examApp;
            if (examApp && examApp.pages.length > 0) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        });
    }

    // Get storage usage information
    getStorageInfo() {
        try {
            const data = this.loadFromLocalStorage();
            const usage = new Blob([JSON.stringify(data)]).size;
            const available = this.getAvailableStorage();
            
            return {
                used: usage,
                available: available,
                total: usage + available,
                percentage: (usage / (usage + available)) * 100
            };
        } catch (error) {
            console.error('Failed to get storage info:', error);
            return null;
        }
    }

    getAvailableStorage() {
        // Estimate available localStorage space
        let available = 0;
        const testKey = 'test_storage_key';
        
        try {
            while (true) {
                const testData = 'x'.repeat(1024); // 1KB chunks
                localStorage.setItem(testKey, testData.repeat(available + 1));
                localStorage.removeItem(testKey);
                available++;
                
                if (available > 10000) break; // Safety limit
            }
        } catch (error) {
            localStorage.removeItem(testKey);
        }
        
        return available * 1024; // Return in bytes
    }

    destroy() {
        this.stopAutoSave();
    }
}

// Initialize storage controller
document.addEventListener('DOMContentLoaded', () => {
    window.storageController = new StorageController();
});