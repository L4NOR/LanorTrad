class MangaReader {
    constructor() {
        this.currentMode = localStorage.getItem('readerMode') || 'scroll';
        this.currentPage = 0;
        this.totalPages = 0;
        this.images = [];
        this.isInitialized = false;
        this.preloadedImages = new Set();
        
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        const container = document.getElementById('readerContainer');
        if (!container) return;

        this.collectImages();
        this.createReaderUI();
        this.setupEventListeners();
        this.setMode(this.currentMode);
        this.restoreProgress();
        
        this.isInitialized = true;
    }

    collectImages() {
        const container = document.getElementById('readerContainer');
        const imgs = container.querySelectorAll('img');
        this.images = Array.from(imgs);
        this.totalPages = this.images.length;
    }

    createReaderUI() {
        const container = document.getElementById('readerContainer');
        
        // Créer le sélecteur de mode amélioré
        const modeSelector = this.createModeSelector();
        
        // Insérer le sélecteur
        const controlsBar = document.querySelector('.fixed.top-20');
        if (controlsBar) {
            const innerDiv = controlsBar.querySelector('.flex.justify-between');
            if (innerDiv) {
                innerDiv.appendChild(modeSelector);
            }
        }

        // Wrapper pour le mode scroll
        const scrollWrapper = document.createElement('div');
        scrollWrapper.id = 'scrollModeContainer';
        scrollWrapper.className = 'scroll-mode-container';
        
        this.images.forEach(img => {
            scrollWrapper.appendChild(img.cloneNode(true));
        });

        // Container pour le mode page (SANS miniatures)
        const pageContainer = this.createPageModeContainer();

        container.innerHTML = '';
        container.appendChild(scrollWrapper);
        container.appendChild(pageContainer);

        this.createShortcutsModal();
    }

    createModeSelector() {
        const selector = document.createElement('div');
        selector.className = 'reader-mode-selector';
        selector.innerHTML = `
            <button class="mode-btn ${this.currentMode === 'scroll' ? 'active' : ''}" data-mode="scroll" title="Mode défilement">
                <div class="mode-btn-bg"></div>
                <div class="mode-btn-content">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                    </svg>
                    <span>Défilement</span>
                </div>
            </button>
            <button class="mode-btn ${this.currentMode === 'page' ? 'active' : ''}" data-mode="page" title="Mode page par page">
                <div class="mode-btn-bg"></div>
                <div class="mode-btn-content">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <span>Page</span>
                </div>
            </button>
            <button class="mode-btn shortcuts-btn" id="shortcutsBtn" title="Raccourcis clavier (?)">
                <div class="mode-btn-bg"></div>
                <div class="mode-btn-content">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>
            </button>
        `;
        return selector;
    }

    createPageModeContainer() {
        const container = document.createElement('div');
        container.id = 'pageModeContainer';
        container.className = 'page-mode-container';

        // SANS miniatures pour éviter les spoils
        container.innerHTML = `
            <div class="page-display">
                <button class="page-nav-arrow prev" id="prevPageBtn" title="Page précédente (←)">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                </button>
                <div class="page-image-container">
                    <img id="currentPageImg" src="" alt="Page actuelle">
                    <div class="page-loader">
                        <div class="loader-spinner"></div>
                    </div>
                </div>
                <button class="page-nav-arrow next" id="nextPageBtn" title="Page suivante (→)">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </button>
            </div>
            
            <div class="reading-progress-container">
                <div class="progress-bar-wrapper" id="progressBar">
                    <div class="progress-bar-track"></div>
                    <div class="progress-bar-fill" style="width: 0%">
                        <div class="progress-glow"></div>
                    </div>
                    <div class="progress-handle"></div>
                </div>
                <div class="page-nav-container">
                    <div class="page-input-group">
                        <span>Page</span>
                        <input type="number" class="page-jump-input" id="pageJumpInput" min="1" max="${this.totalPages}" value="1">
                        <span>sur</span>
                        <span class="total">${this.totalPages}</span>
                    </div>
                </div>
            </div>
        `;

        return container;
    }

    createShortcutsModal() {
        const modal = document.createElement('div');
        modal.id = 'shortcutsModal';
        modal.className = 'shortcuts-modal';
        modal.innerHTML = `
            <div class="shortcuts-content">
                <div class="shortcuts-header">
                    <h3>⌨️ Raccourcis Clavier</h3>
                    <button class="close-shortcuts-x" id="closeShortcutsX">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div class="shortcuts-list">
                    <div class="shortcut-item">
                        <span class="shortcut-key">←</span>
                        <span class="shortcut-desc">Page précédente</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-key">→</span>
                        <span class="shortcut-desc">Page suivante</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-key">Home</span>
                        <span class="shortcut-desc">Première page</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-key">End</span>
                        <span class="shortcut-desc">Dernière page</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-key">M</span>
                        <span class="shortcut-desc">Changer de mode</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-key">F</span>
                        <span class="shortcut-desc">Plein écran</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-key">?</span>
                        <span class="shortcut-desc">Afficher l'aide</span>
                    </div>
                </div>
                <button class="close-shortcuts">Compris !</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    setupEventListeners() {
        // Mode buttons
        document.querySelectorAll('.mode-btn[data-mode]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setMode(btn.dataset.mode);
            });
        });

        // Shortcuts button
        const shortcutsBtn = document.getElementById('shortcutsBtn');
        if (shortcutsBtn) {
            shortcutsBtn.addEventListener('click', () => this.toggleShortcutsModal());
        }

        // Close shortcuts buttons
        const closeBtn = document.querySelector('.close-shortcuts');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.toggleShortcutsModal(false));
        }
        
        const closeX = document.getElementById('closeShortcutsX');
        if (closeX) {
            closeX.addEventListener('click', () => this.toggleShortcutsModal(false));
        }

        // Modal backdrop click
        const modal = document.getElementById('shortcutsModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.toggleShortcutsModal(false);
            });
        }

        // Page navigation buttons
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        if (prevBtn) prevBtn.addEventListener('click', () => this.goToPage(this.currentPage - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => this.goToPage(this.currentPage + 1));

        // Progress bar click
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.addEventListener('click', (e) => {
                const rect = progressBar.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                const page = Math.floor(percent * this.totalPages);
                this.goToPage(Math.max(0, Math.min(page, this.totalPages - 1)));
            });
        }

        // Page jump input
        const pageJumpInput = document.getElementById('pageJumpInput');
        if (pageJumpInput) {
            pageJumpInput.addEventListener('change', (e) => {
                const page = parseInt(e.target.value) - 1;
                if (!isNaN(page)) {
                    this.goToPage(Math.max(0, Math.min(page, this.totalPages - 1)));
                }
            });
            
            pageJumpInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const page = parseInt(e.target.value) - 1;
                    if (!isNaN(page)) {
                        this.goToPage(Math.max(0, Math.min(page, this.totalPages - 1)));
                    }
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Click on image to navigate
        const pageImg = document.getElementById('currentPageImg');
        if (pageImg) {
            pageImg.addEventListener('click', (e) => {
                if (this.currentMode !== 'page') return;
                
                const rect = pageImg.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const imgWidth = rect.width;
                
                if (clickX > imgWidth / 2) {
                    this.goToPage(this.currentPage + 1);
                } else {
                    this.goToPage(this.currentPage - 1);
                }
            });
        }

        // Scroll progress tracking
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (this.currentMode !== 'scroll') return;
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.saveScrollProgress();
            }, 500);
        });
    }

    handleKeyPress(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch(e.key) {
            case 'ArrowLeft':
                if (this.currentMode === 'page') {
                    e.preventDefault();
                    this.goToPage(this.currentPage - 1);
                }
                break;
            case 'ArrowRight':
                if (this.currentMode === 'page') {
                    e.preventDefault();
                    this.goToPage(this.currentPage + 1);
                }
                break;
            case 'Home':
                if (this.currentMode === 'page') {
                    e.preventDefault();
                    this.goToPage(0);
                }
                break;
            case 'End':
                if (this.currentMode === 'page') {
                    e.preventDefault();
                    this.goToPage(this.totalPages - 1);
                }
                break;
            case 'm':
            case 'M':
                this.toggleMode();
                break;
            case 'f':
            case 'F':
                this.toggleFullscreen();
                break;
            case '?':
                this.toggleShortcutsModal();
                break;
            case 'Escape':
                this.toggleShortcutsModal(false);
                break;
        }
    }

    setMode(mode) {
        this.currentMode = mode;
        localStorage.setItem('readerMode', mode);

        document.querySelectorAll('.mode-btn[data-mode]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        const scrollContainer = document.getElementById('scrollModeContainer');
        const pageContainer = document.getElementById('pageModeContainer');

        if (scrollContainer && pageContainer) {
            if (mode === 'scroll') {
                scrollContainer.classList.remove('hidden');
                scrollContainer.style.display = 'flex';
                pageContainer.classList.remove('active');
                pageContainer.style.display = 'none';
            } else {
                scrollContainer.classList.add('hidden');
                scrollContainer.style.display = 'none';
                pageContainer.classList.add('active');
                pageContainer.style.display = 'flex';
                this.updatePageDisplay();
            }
        }
    }

    toggleMode() {
        this.setMode(this.currentMode === 'scroll' ? 'page' : 'scroll');
    }

    goToPage(pageIndex) {
        if (pageIndex < 0 || pageIndex >= this.totalPages) return;
        
        this.currentPage = pageIndex;
        this.updatePageDisplay();
        this.savePageProgress();
        this.preloadAdjacentImages();
    }

    preloadAdjacentImages() {
        // Précharger les images adjacentes
        const pagesToPreload = [
            this.currentPage - 1,
            this.currentPage + 1,
            this.currentPage + 2
        ];

        pagesToPreload.forEach(pageIndex => {
            if (pageIndex >= 0 && pageIndex < this.totalPages && !this.preloadedImages.has(pageIndex)) {
                const img = new Image();
                img.src = this.images[pageIndex].src;
                this.preloadedImages.add(pageIndex);
            }
        });
    }

    updatePageDisplay() {
        if (this.images.length === 0) return;

        const currentImg = document.getElementById('currentPageImg');
        const pageLoader = document.querySelector('.page-loader');
        const progressFill = document.querySelector('.progress-bar-fill');
        const progressHandle = document.querySelector('.progress-handle');
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        const pageJumpInput = document.getElementById('pageJumpInput');

        // Show loader
        if (pageLoader) pageLoader.classList.add('active');

        // Update image
        if (currentImg && this.images[this.currentPage]) {
            currentImg.src = this.images[this.currentPage].src;
            currentImg.alt = `Page ${this.currentPage + 1}`;
            currentImg.onload = () => {
                if (pageLoader) pageLoader.classList.remove('active');
            };
        }

        // Update progress
        const percent = ((this.currentPage + 1) / this.totalPages) * 100;
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressHandle) progressHandle.style.left = `${percent}%`;
        if (pageJumpInput) pageJumpInput.value = this.currentPage + 1;

        // Update navigation buttons
        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 0;
            prevBtn.classList.toggle('disabled', this.currentPage === 0);
        }
        if (nextBtn) {
            nextBtn.disabled = this.currentPage === this.totalPages - 1;
            nextBtn.classList.toggle('disabled', this.currentPage === this.totalPages - 1);
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Fullscreen error:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    toggleShortcutsModal(show = null) {
        const modal = document.getElementById('shortcutsModal');
        if (!modal) return;
        
        if (show === null) {
            modal.classList.toggle('active');
        } else {
            modal.classList.toggle('active', show);
        }
    }

    // Progress saving
    getChapterKey() {
        return `reading_progress_${window.location.pathname}`;
    }

    savePageProgress() {
        localStorage.setItem(this.getChapterKey(), JSON.stringify({
            mode: 'page',
            page: this.currentPage,
            timestamp: Date.now()
        }));
    }

    saveScrollProgress() {
        const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
        localStorage.setItem(this.getChapterKey(), JSON.stringify({
            mode: 'scroll',
            scrollPercent: scrollPercent,
            timestamp: Date.now()
        }));
    }

    restoreProgress() {
        const saved = localStorage.getItem(this.getChapterKey());
        if (!saved) return;

        try {
            const data = JSON.parse(saved);
            
            // Vérifier si la progression n'est pas trop ancienne (7 jours)
            if (Date.now() - data.timestamp > 7 * 24 * 60 * 60 * 1000) {
                localStorage.removeItem(this.getChapterKey());
                return;
            }

            if (data.mode === 'page' && data.page !== undefined) {
                this.setMode('page');
                setTimeout(() => this.goToPage(data.page), 100);
            } else if (data.mode === 'scroll' && data.scrollPercent !== undefined) {
                this.setMode('scroll');
                setTimeout(() => {
                    const scrollY = data.scrollPercent * (document.body.scrollHeight - window.innerHeight);
                    window.scrollTo(0, scrollY);
                }, 100);
            }
        } catch (e) {
            console.error('Error restoring progress:', e);
        }
    }
}

// Initialize reader
const mangaReader = new MangaReader();
window.MangaReader = mangaReader;
