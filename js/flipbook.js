// Flipbook Animation Controller
class FlipbookController {
    constructor(container) {
        this.container = container;
        this.pages = [];
        this.currentPageIndex = 0;
        this.isAnimating = false;
        this.flipDuration = 600;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.isAnimating) return;
            
            switch (e.key) {
                case 'ArrowLeft':
                case 'PageUp':
                    e.preventDefault();
                    this.previousPage();
                    break;
                case 'ArrowRight':
                case 'PageDown':
                    e.preventDefault();
                    this.nextPage();
                    break;
            }
        });

        // Touch/swipe gestures
        this.setupTouchGestures();
    }

    setupTouchGestures() {
        let startX = 0;
        let startY = 0;
        let startTime = 0;

        this.container.addEventListener('touchstart', (e) => {
            if (this.isAnimating || e.touches.length !== 1) return;
            
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            startTime = Date.now();
        }, { passive: true });

        this.container.addEventListener('touchend', (e) => {
            if (this.isAnimating || e.changedTouches.length !== 1) return;
            
            const touch = e.changedTouches[0];
            const endX = touch.clientX;
            const endY = touch.clientY;
            const endTime = Date.now();
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const deltaTime = endTime - startTime;
            
            // Check if it's a valid swipe gesture
            if (Math.abs(deltaX) > Math.abs(deltaY) && 
                Math.abs(deltaX) > 50 && 
                deltaTime < 500) {
                
                if (deltaX > 0) {
                    this.previousPage(); // Swipe right = previous page
                } else {
                    this.nextPage(); // Swipe left = next page
                }
            }
        }, { passive: true });
    }

    addPage(pageElement) {
        this.pages.push(pageElement);
        this.updatePageStates();
    }

    removePage(index) {
        if (index >= 0 && index < this.pages.length) {
            this.pages.splice(index, 1);
            
            if (this.currentPageIndex >= this.pages.length) {
                this.currentPageIndex = Math.max(0, this.pages.length - 1);
            }
            
            this.updatePageStates();
        }
    }

    nextPage() {
        if (this.isAnimating || this.currentPageIndex >= this.pages.length - 1) return;
        
        this.flipToPage(this.currentPageIndex + 1, 'next');
    }

    previousPage() {
        if (this.isAnimating || this.currentPageIndex <= 0) return;
        
        this.flipToPage(this.currentPageIndex - 1, 'previous');
    }

    flipToPage(targetIndex, direction = 'next') {
        if (this.isAnimating || 
            targetIndex < 0 || 
            targetIndex >= this.pages.length || 
            targetIndex === this.currentPageIndex) return;

        this.isAnimating = true;
        const oldIndex = this.currentPageIndex;
        this.currentPageIndex = targetIndex;

        // Perform the flip animation
        this.performFlipAnimation(oldIndex, targetIndex, direction)
            .then(() => {
                this.isAnimating = false;
                this.onPageChange();
            });
    }

    async performFlipAnimation(fromIndex, toIndex, direction) {
        const fromPage = this.pages[fromIndex];
        const toPage = this.pages[toIndex];
        
        if (!fromPage || !toPage) return;

        // Set initial states
        fromPage.classList.add('current');
        fromPage.classList.remove('previous', 'next');
        
        toPage.classList.remove('current', 'previous', 'next');
        
        if (direction === 'next') {
            toPage.classList.add('next');
        } else {
            toPage.classList.add('previous');
        }

        // Force reflow
        fromPage.offsetHeight;
        toPage.offsetHeight;

        // Start animation
        return new Promise((resolve) => {
            setTimeout(() => {
                if (direction === 'next') {
                    fromPage.classList.remove('current');
                    fromPage.classList.add('previous');
                    toPage.classList.remove('next');
                    toPage.classList.add('current');
                } else {
                    fromPage.classList.remove('current');
                    fromPage.classList.add('next');
                    toPage.classList.remove('previous');
                    toPage.classList.add('current');
                }

                setTimeout(resolve, this.flipDuration);
            }, 50);
        });
    }

    updatePageStates() {
        this.pages.forEach((page, index) => {
            page.classList.remove('current', 'previous', 'next');
            
            if (index === this.currentPageIndex) {
                page.classList.add('current');
            } else if (index < this.currentPageIndex) {
                page.classList.add('previous');
            } else {
                page.classList.add('next');
            }
        });
    }

    getCurrentPageIndex() {
        return this.currentPageIndex;
    }

    getTotalPages() {
        return this.pages.length;
    }

    onPageChange() {
        // Override this method to handle page change events
        // This will be called when the page flip animation completes
        
        // Dispatch custom event
        const event = new CustomEvent('pagechange', {
            detail: {
                currentPage: this.currentPageIndex,
                totalPages: this.pages.length
            }
        });
        this.container.dispatchEvent(event);
    }

    // 3D Flip Animation (Alternative more realistic book flip)
    performAdvanced3DFlip(fromIndex, toIndex, direction) {
        const fromPage = this.pages[fromIndex];
        const toPage = this.pages[toIndex];
        
        if (!fromPage || !toPage) return Promise.resolve();

        return new Promise((resolve) => {
            // Apply 3D transforms
            fromPage.style.transformStyle = 'preserve-3d';
            toPage.style.transformStyle = 'preserve-3d';
            
            const keyframes = direction === 'next' ? [
                { transform: 'perspective(1000px) rotateY(0deg)', offset: 0 },
                { transform: 'perspective(1000px) rotateY(-90deg)', offset: 0.5 },
                { transform: 'perspective(1000px) rotateY(-180deg)', offset: 1 }
            ] : [
                { transform: 'perspective(1000px) rotateY(-180deg)', offset: 0 },
                { transform: 'perspective(1000px) rotateY(-90deg)', offset: 0.5 },
                { transform: 'perspective(1000px) rotateY(0deg)', offset: 1 }
            ];

            const animation = fromPage.animate(keyframes, {
                duration: this.flipDuration,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                fill: 'forwards'
            });

            // Halfway through, swap the visible page
            setTimeout(() => {
                fromPage.style.display = 'none';
                toPage.style.display = 'block';
                toPage.style.transform = direction === 'next' 
                    ? 'perspective(1000px) rotateY(-90deg)'
                    : 'perspective(1000px) rotateY(90deg)';

                const toKeyframes = direction === 'next' ? [
                    { transform: 'perspective(1000px) rotateY(-90deg)', offset: 0 },
                    { transform: 'perspective(1000px) rotateY(0deg)', offset: 1 }
                ] : [
                    { transform: 'perspective(1000px) rotateY(90deg)', offset: 0 },
                    { transform: 'perspective(1000px) rotateY(0deg)', offset: 1 }
                ];

                toPage.animate(toKeyframes, {
                    duration: this.flipDuration / 2,
                    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                    fill: 'forwards'
                });

            }, this.flipDuration / 2);

            animation.onfinish = () => {
                // Reset transforms
                fromPage.style.transform = '';
                fromPage.style.transformStyle = '';
                toPage.style.transform = '';
                toPage.style.transformStyle = '';
                
                resolve();
            };
        });
    }

    // Page curl effect
    addPageCurlEffect() {
        this.pages.forEach(page => {
            page.addEventListener('mouseenter', (e) => {
                if (this.isAnimating) return;
                
                const rect = page.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Add subtle curl effect based on mouse position
                const curlX = (x / rect.width - 0.5) * 10;
                const curlY = (y / rect.height - 0.5) * 10;
                
                page.style.transform = `perspective(1000px) rotateX(${curlY}deg) rotateY(${curlX}deg)`;
                page.style.transition = 'transform 0.3s ease';
            });

            page.addEventListener('mouseleave', () => {
                page.style.transform = '';
                page.style.transition = 'transform 0.3s ease';
            });
        });
    }

    // Parallax effect for depth
    addParallaxEffect() {
        window.addEventListener('scroll', () => {
            const scrollY = window.pageYOffset;
            
            this.pages.forEach((page, index) => {
                if (index === this.currentPageIndex) return;
                
                const offset = scrollY * 0.3;
                page.style.transform = `translateY(${offset}px)`;
            });
        });
    }

    destroy() {
        // Clean up event listeners and references
        this.pages = [];
        this.container = null;
    }
}

// Enhanced Page Transition Effects
class PageTransitionEffects {
    static slideEffect(fromPage, toPage, direction) {
        const slideDistance = direction === 'next' ? '-100%' : '100%';
        
        return Promise.all([
            fromPage.animate([
                { transform: 'translateX(0)' },
                { transform: `translateX(${slideDistance})` }
            ], {
                duration: 500,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                fill: 'forwards'
            }).finished,
            
            toPage.animate([
                { transform: `translateX(${direction === 'next' ? '100%' : '-100%'})` },
                { transform: 'translateX(0)' }
            ], {
                duration: 500,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                fill: 'forwards'
            }).finished
        ]);
    }

    static fadeEffect(fromPage, toPage) {
        return Promise.all([
            fromPage.animate([
                { opacity: 1 },
                { opacity: 0 }
            ], {
                duration: 300,
                easing: 'ease-out',
                fill: 'forwards'
            }).finished,
            
            toPage.animate([
                { opacity: 0 },
                { opacity: 1 }
            ], {
                duration: 300,
                easing: 'ease-in',
                delay: 150,
                fill: 'forwards'
            }).finished
        ]);
    }

    static flipEffect(fromPage, toPage, direction) {
        const rotateDirection = direction === 'next' ? 'rotateY(-180deg)' : 'rotateY(180deg)';
        
        return fromPage.animate([
            { transform: 'rotateY(0deg)' },
            { transform: rotateDirection }
        ], {
            duration: 600,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            fill: 'forwards'
        }).finished.then(() => {
            fromPage.style.display = 'none';
            toPage.style.display = 'block';
            
            return toPage.animate([
                { transform: direction === 'next' ? 'rotateY(180deg)' : 'rotateY(-180deg)' },
                { transform: 'rotateY(0deg)' }
            ], {
                duration: 600,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                fill: 'forwards'
            }).finished;
        });
    }
}