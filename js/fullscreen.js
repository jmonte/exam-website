// Fullscreen Controller
class FullscreenController {
    constructor() {
        this.isFullscreen = false;
        this.fullscreenBtn = null;
        this.sidebarTimer = null;
        this.headerTimer = null;
        
        this.init();
    }

    init() {
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        if (this.fullscreenBtn) {
            this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }

        this.setupEventListeners();
        this.checkFullscreenSupport();
    }

    setupEventListeners() {
        // Listen for fullscreen changes
        document.addEventListener('fullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('webkitfullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('mozfullscreenchange', () => this.onFullscreenChange());
        document.addEventListener('MSFullscreenChange', () => this.onFullscreenChange());

        // ESC key to exit fullscreen
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isFullscreen) {
                this.exitFullscreen();
            }
        });

        // Mouse movement for auto-hide/show UI
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Touch events for mobile UI
        document.addEventListener('touchstart', (e) => this.handleTouch(e));
    }

    checkFullscreenSupport() {
        const elem = document.documentElement;
        this.fullscreenEnabled = !!(
            elem.requestFullscreen || 
            elem.mozRequestFullScreen || 
            elem.webkitRequestFullScreen || 
            elem.msRequestFullscreen
        );

        if (!this.fullscreenEnabled && this.fullscreenBtn) {
            this.fullscreenBtn.title = 'Fullscreen not supported in this browser';
        }
    }

    async toggleFullscreen() {
        if (this.isFullscreen) {
            await this.exitFullscreen();
        } else {
            await this.enterFullscreen();
        }
    }

    async enterFullscreen() {
        if (!this.fullscreenEnabled) {
            // Fallback: Simulate fullscreen mode
            this.simulateFullscreen();
            return;
        }

        const elem = document.documentElement;
        
        try {
            if (elem.requestFullscreen) {
                await elem.requestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                await elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullScreen) {
                await elem.webkitRequestFullScreen();
            } else if (elem.msRequestFullscreen) {
                await elem.msRequestFullscreen();
            }
        } catch (error) {
            console.error('Failed to enter fullscreen:', error);
            this.simulateFullscreen();
        }
    }

    async exitFullscreen() {
        if (document.fullscreenElement || document.webkitFullscreenElement || 
            document.mozFullScreenElement || document.msFullscreenElement) {
            
            try {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    await document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                    await document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    await document.msExitFullscreen();
                }
            } catch (error) {
                console.error('Failed to exit fullscreen:', error);
            }
        }
        
        // Always exit simulated fullscreen
        this.exitSimulatedFullscreen();
    }

    simulateFullscreen() {
        document.body.classList.add('fullscreen-mode');
        this.isFullscreen = true;
        this.updateButton();
        this.setupFullscreenUI();
    }

    exitSimulatedFullscreen() {
        document.body.classList.remove('fullscreen-mode');
        this.isFullscreen = false;
        this.updateButton();
        this.teardownFullscreenUI();
    }

    onFullscreenChange() {
        const isInFullscreen = !!(
            document.fullscreenElement || 
            document.webkitFullscreenElement || 
            document.mozFullScreenElement || 
            document.msFullscreenElement
        );

        if (isInFullscreen && !this.isFullscreen) {
            // Entered native fullscreen
            this.isFullscreen = true;
            this.simulateFullscreen(); // Apply our custom styles
        } else if (!isInFullscreen && this.isFullscreen) {
            // Exited native fullscreen
            this.exitSimulatedFullscreen();
        }
    }

    updateButton() {
        if (!this.fullscreenBtn) return;

        if (this.isFullscreen) {
            this.fullscreenBtn.innerHTML = '🗗 Exit Fullscreen';
            this.fullscreenBtn.title = 'Exit fullscreen mode (ESC)';
        } else {
            this.fullscreenBtn.innerHTML = '🔲 Fullscreen';
            this.fullscreenBtn.title = 'Enter fullscreen mode';
        }
    }

    setupFullscreenUI() {
        // Auto-hide sidebar after 3 seconds
        const sidebar = document.querySelector('.tools-sidebar');
        const header = document.querySelector('.header');
        
        if (sidebar) {
            setTimeout(() => {
                sidebar.classList.remove('show-sidebar');
            }, 3000);
        }

        if (header) {
            setTimeout(() => {
                header.classList.remove('show-header');
            }, 3000);
        }

        // Set initial focus to the exam area
        const canvas = document.querySelector('.drawing-canvas');
        if (canvas) {
            canvas.focus();
        }
    }

    teardownFullscreenUI() {
        const sidebar = document.querySelector('.tools-sidebar');
        const header = document.querySelector('.header');

        if (sidebar) {
            sidebar.classList.remove('show-sidebar');
        }
        
        if (header) {
            header.classList.remove('show-header');
        }

        // Clear any pending timers
        if (this.sidebarTimer) {
            clearTimeout(this.sidebarTimer);
            this.sidebarTimer = null;
        }
        
        if (this.headerTimer) {
            clearTimeout(this.headerTimer);
            this.headerTimer = null;
        }
    }

    handleMouseMove(e) {
        if (!this.isFullscreen) return;

        const sidebar = document.querySelector('.tools-sidebar');
        const header = document.querySelector('.header');

        // Show sidebar when mouse is near left edge
        if (e.clientX < 50) {
            if (sidebar) {
                sidebar.classList.add('show-sidebar');
                
                // Auto-hide after 3 seconds of no interaction
                if (this.sidebarTimer) clearTimeout(this.sidebarTimer);
                this.sidebarTimer = setTimeout(() => {
                    sidebar.classList.remove('show-sidebar');
                }, 3000);
            }
        }

        // Show header when mouse is near top edge
        if (e.clientY < 50) {
            if (header) {
                header.classList.add('show-header');
                
                // Auto-hide after 3 seconds of no interaction
                if (this.headerTimer) clearTimeout(this.headerTimer);
                this.headerTimer = setTimeout(() => {
                    header.classList.remove('show-header');
                }, 3000);
            }
        }
    }

    handleTouch(e) {
        if (!this.isFullscreen) return;

        const touch = e.touches[0];
        if (!touch) return;

        const sidebar = document.querySelector('.tools-sidebar');
        const header = document.querySelector('.header');

        // Show sidebar on left edge touch
        if (touch.clientX < 30) {
            e.preventDefault();
            if (sidebar) {
                sidebar.classList.add('show-sidebar');
                setTimeout(() => {
                    sidebar.classList.remove('show-sidebar');
                }, 4000);
            }
        }

        // Show header on top edge touch
        if (touch.clientY < 30) {
            e.preventDefault();
            if (header) {
                header.classList.add('show-header');
                setTimeout(() => {
                    header.classList.remove('show-header');
                }, 4000);
            }
        }
    }

    // Public methods for external control
    isInFullscreenMode() {
        return this.isFullscreen;
    }

    showSidebar() {
        if (!this.isFullscreen) return;
        const sidebar = document.querySelector('.tools-sidebar');
        if (sidebar) {
            sidebar.classList.add('show-sidebar');
        }
    }

    hideSidebar() {
        const sidebar = document.querySelector('.tools-sidebar');
        if (sidebar) {
            sidebar.classList.remove('show-sidebar');
        }
    }

    showHeader() {
        if (!this.isFullscreen) return;
        const header = document.querySelector('.header');
        if (header) {
            header.classList.add('show-header');
        }
    }

    hideHeader() {
        const header = document.querySelector('.header');
        if (header) {
            header.classList.remove('show-header');
        }
    }

    // Keyboard shortcuts in fullscreen
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (!this.isFullscreen) return;

            // F11 for native fullscreen toggle
            if (e.key === 'F11') {
                e.preventDefault();
                this.toggleFullscreen();
            }

            // Show/hide UI with specific keys
            if (e.key === 'Tab') {
                e.preventDefault();
                this.showSidebar();
                setTimeout(() => this.hideSidebar(), 3000);
            }

            // Hide UI completely with 'h' key
            if (e.key === 'h' || e.key === 'H') {
                this.hideHeader();
                this.hideSidebar();
            }
        });
    }

    destroy() {
        if (this.isFullscreen) {
            this.exitFullscreen();
        }
        
        if (this.sidebarTimer) clearTimeout(this.sidebarTimer);
        if (this.headerTimer) clearTimeout(this.headerTimer);
    }
}

// Initialize fullscreen controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.fullscreenController = new FullscreenController();
});