/* ========================================
   LANORTRAD READER v4.0
   Mode défilement / page + Zoom + Gestes tactiles
   ======================================== */

class MangaReader {
    constructor() {
        // Préférences persistées
        this.currentMode  = localStorage.getItem('readerMode')  || 'scroll';   // scroll | page
        this.widthPreset  = localStorage.getItem('readerWidth') || 'normal';   // compact | normal | wide | full
        this.fitMode      = localStorage.getItem('readerFit')   || 'width';    // width | height

        // État de lecture
        this.currentPage = 0;
        this.totalPages = 0;
        this.images = [];
        this.preloadedImages = new Set();
        this.isInitialized = false;

        // État zoom (mode page)
        this.zoom = 1;
        this.minZoom = 1;
        this.maxZoom = 4;
        this.zoomStep = 0.25;

        // État gestes tactiles
        this._touch = {
            startX: 0, startY: 0, startTime: 0,
            lastTap: 0,
            pinchStart: 0, pinchInitialZoom: 1,
            isPinching: false,
            isPanning: false,
            panStartX: 0, panStartY: 0,
            scrollStartLeft: 0, scrollStartTop: 0
        };

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

        this.applyWidthPreset(this.widthPreset);
        this.optimizeLayout();
        this.collectImages();
        this.createReaderUI();
        this.setupEventListeners();
        this.setupTouchGestures();
        this.setupAutoHideControls();
        this.setMode(this.currentMode);
        this.applyFitMode(this.fitMode);
        this.restoreProgress();
        this.addMangaPageLink();

        this.isInitialized = true;
    }

    optimizeLayout() {
        // La barre de contrôles native devient transparente : nos boutons fournissent leur propre fond
        const controlsBar = document.querySelector('.fixed.top-20');
        if (controlsBar) {
            controlsBar.style.background = 'transparent';
            controlsBar.style.backdropFilter = 'none';
            controlsBar.style.webkitBackdropFilter = 'none';
        }
    }

    addMangaPageLink() {
        const pathParts = window.location.pathname.split('/');
        const fileName = decodeURIComponent(pathParts[pathParts.length - 1]);
        const mangaFolder = decodeURIComponent(pathParts[pathParts.length - 2]);
        const mangaPageUrl = `../${encodeURIComponent(mangaFolder)}.html`;
        const isOneshot = fileName.toLowerCase().includes('oneshot');
        const label = isOneshot ? 'Page du oneshot' : 'Page du manga';

        const controlsDiv = document.querySelector('.reader-controls .flex');
        if (controlsDiv) {
            controlsDiv.querySelectorAll('a.control-button').forEach(a => {
                if (a.textContent.includes('Fin du oneshot')) a.remove();
            });

            const link = document.createElement('a');
            link.href = mangaPageUrl;
            link.className = 'control-button';
            link.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                <span>${label}</span>
            `;
            controlsDiv.appendChild(link);
        }
    }

    collectImages() {
        const container = document.getElementById('readerContainer');
        const imgs = container.querySelectorAll('img');
        this.images = Array.from(imgs);
        this.totalPages = this.images.length;
    }

    createReaderUI() {
        const container = document.getElementById('readerContainer');

        // Toolbar (mode + paramètres + raccourcis)
        const toolbar = this.createToolbar();
        const controlsBar = document.querySelector('.fixed.top-20');
        if (controlsBar) {
            const innerDiv = controlsBar.querySelector('.flex.justify-between');
            if (innerDiv) {
                innerDiv.appendChild(toolbar);
            }
        }

        // Panneau de paramètres
        this.createSettingsPanel();

        // Wrapper mode défilement
        const scrollWrapper = document.createElement('div');
        scrollWrapper.id = 'scrollModeContainer';
        scrollWrapper.className = 'scroll-mode-container';
        this.images.forEach(img => scrollWrapper.appendChild(img.cloneNode(true)));

        // Container mode page
        const pageContainer = this.createPageModeContainer();

        container.innerHTML = '';
        container.appendChild(scrollWrapper);
        container.appendChild(pageContainer);

        this.createShortcutsModal();
    }

    createToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'reader-toolbar';

        // Sélecteur de mode
        const selector = document.createElement('div');
        selector.className = 'reader-mode-selector';
        selector.innerHTML = `
            <button class="mode-btn ${this.currentMode === 'scroll' ? 'active' : ''}" data-mode="scroll" title="Mode défilement">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                </svg>
                <span>Défilement</span>
            </button>
            <button class="mode-btn ${this.currentMode === 'page' ? 'active' : ''}" data-mode="page" title="Mode page par page">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <span>Page</span>
            </button>
            <button class="mode-btn settings-btn" id="settingsBtn" title="Paramètres de lecture">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
            </button>
            <button class="mode-btn shortcuts-btn" id="shortcutsBtn" title="Raccourcis clavier (?)">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            </button>
        `;
        toolbar.appendChild(selector);
        return toolbar;
    }

    createSettingsPanel() {
        // Évite la duplication si setup rejoué
        const existing = document.getElementById('readerSettingsPanel');
        if (existing) existing.remove();

        const panel = document.createElement('div');
        panel.id = 'readerSettingsPanel';
        panel.className = 'reader-settings-panel';
        panel.innerHTML = `
            <div class="settings-section">
                <h4 class="settings-section-title">Largeur de lecture</h4>
                <div class="settings-options" data-group="width">
                    <button class="settings-option" data-value="compact">Étroit</button>
                    <button class="settings-option" data-value="normal">Normal</button>
                    <button class="settings-option" data-value="wide">Large</button>
                    <button class="settings-option" data-value="full">Pleine</button>
                </div>
            </div>
            <div class="settings-section" data-page-only>
                <h4 class="settings-section-title">Ajustement (mode page)</h4>
                <div class="settings-options" data-group="fit">
                    <button class="settings-option" data-value="width">Largeur</button>
                    <button class="settings-option" data-value="height">Hauteur</button>
                </div>
            </div>
            <div class="settings-section" data-page-only>
                <h4 class="settings-section-title">Zoom</h4>
                <div class="zoom-toolbar">
                    <button class="zoom-btn" id="zoomOutBtn" title="Zoom -">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                        </svg>
                    </button>
                    <span class="zoom-level" id="zoomLevel" title="Réinitialiser le zoom">100%</span>
                    <button class="zoom-btn" id="zoomInBtn" title="Zoom +">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                    </button>
                    <button class="zoom-btn" id="zoomResetBtn" title="Réinitialiser (0)">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v6h6M20 20v-6h-6M4 20l5-5M20 4l-5 5"/>
                        </svg>
                    </button>
                    <button class="zoom-btn" id="fullscreenBtn" title="Plein écran (F)">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4"/>
                        </svg>
                    </button>
                </div>
            </div>
            <button class="settings-reset-btn" id="resetReaderPrefs">Réinitialiser les préférences</button>
        `;
        document.body.appendChild(panel);
        this.updateSettingsUI();
    }

    createPageModeContainer() {
        const container = document.createElement('div');
        container.id = 'pageModeContainer';
        container.className = 'page-mode-container fit-width';

        container.innerHTML = `
            <div class="page-display">
                <button class="page-nav-arrow prev" id="prevPageBtn" title="Page précédente (←)">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                </button>
                <div class="page-image-container" id="pageImageContainer">
                    <img id="currentPageImg" src="" alt="Page actuelle" draggable="false">
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
        const existing = document.getElementById('shortcutsModal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'shortcutsModal';
        modal.className = 'shortcuts-modal';
        modal.innerHTML = `
            <div class="shortcuts-content">
                <div class="shortcuts-header">
                    <h3>⌨️ Raccourcis & Gestes</h3>
                    <button class="close-shortcuts-x" id="closeShortcutsX">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div class="shortcuts-list">
                    <div class="shortcut-item"><span class="shortcut-key">← / →</span><span class="shortcut-desc">Page précédente / suivante</span></div>
                    <div class="shortcut-item"><span class="shortcut-key">Home / End</span><span class="shortcut-desc">Première / dernière page</span></div>
                    <div class="shortcut-item"><span class="shortcut-key">+ / -</span><span class="shortcut-desc">Zoom avant / arrière</span></div>
                    <div class="shortcut-item"><span class="shortcut-key">0</span><span class="shortcut-desc">Réinitialiser le zoom</span></div>
                    <div class="shortcut-item"><span class="shortcut-key">Ctrl + molette</span><span class="shortcut-desc">Zoom à la souris</span></div>
                    <div class="shortcut-item"><span class="shortcut-key">W</span><span class="shortcut-desc">Changer la largeur</span></div>
                    <div class="shortcut-item"><span class="shortcut-key">M</span><span class="shortcut-desc">Changer de mode</span></div>
                    <div class="shortcut-item"><span class="shortcut-key">F</span><span class="shortcut-desc">Plein écran</span></div>
                    <div class="shortcut-item"><span class="shortcut-key">?</span><span class="shortcut-desc">Afficher l'aide</span></div>
                    <div class="shortcut-item"><span class="shortcut-key">Tactile</span><span class="shortcut-desc">Pinch = zoom · Double-tap = 1×/2× · Swipe = page</span></div>
                </div>
                <button class="close-shortcuts">Compris !</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    setupEventListeners() {
        // Sélection de mode
        document.querySelectorAll('.mode-btn[data-mode]').forEach(btn => {
            btn.addEventListener('click', () => this.setMode(btn.dataset.mode));
        });

        // Boutons toolbar
        const shortcutsBtn = document.getElementById('shortcutsBtn');
        if (shortcutsBtn) shortcutsBtn.addEventListener('click', () => this.toggleShortcutsModal());

        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleSettingsPanel();
        });

        // Fermer le panneau paramètres au clic en dehors
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('readerSettingsPanel');
            if (!panel || !panel.classList.contains('active')) return;
            if (panel.contains(e.target)) return;
            if (e.target.closest('#settingsBtn')) return;
            panel.classList.remove('active');
        });

        // Panneau paramètres : largeur + fit
        const panel = document.getElementById('readerSettingsPanel');
        if (panel) {
            panel.querySelectorAll('.settings-options').forEach(group => {
                group.addEventListener('click', (e) => {
                    const btn = e.target.closest('.settings-option');
                    if (!btn) return;
                    const groupName = group.dataset.group;
                    const value = btn.dataset.value;
                    if (groupName === 'width') this.applyWidthPreset(value);
                    if (groupName === 'fit')   this.applyFitMode(value);
                });
            });
            const resetBtn = panel.querySelector('#resetReaderPrefs');
            if (resetBtn) resetBtn.addEventListener('click', () => this.resetPreferences());

            // Boutons zoom
            const zoomIn   = panel.querySelector('#zoomInBtn');
            const zoomOut  = panel.querySelector('#zoomOutBtn');
            const zoomRst  = panel.querySelector('#zoomResetBtn');
            const zoomLvl  = panel.querySelector('#zoomLevel');
            const fsBtn    = panel.querySelector('#fullscreenBtn');
            if (zoomIn)  zoomIn.addEventListener('click', () => this.setZoom(this.zoom + this.zoomStep));
            if (zoomOut) zoomOut.addEventListener('click', () => this.setZoom(this.zoom - this.zoomStep));
            if (zoomRst) zoomRst.addEventListener('click', () => this.setZoom(1));
            if (zoomLvl) zoomLvl.addEventListener('click', () => this.setZoom(1));
            if (fsBtn)   fsBtn.addEventListener('click', () => this.toggleFullscreen());
        }

        // Fermer modal raccourcis
        const closeBtn = document.querySelector('.close-shortcuts');
        if (closeBtn) closeBtn.addEventListener('click', () => this.toggleShortcutsModal(false));
        const closeX = document.getElementById('closeShortcutsX');
        if (closeX) closeX.addEventListener('click', () => this.toggleShortcutsModal(false));
        const modal = document.getElementById('shortcutsModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.toggleShortcutsModal(false);
            });
        }

        // Navigation page
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        if (prevBtn) prevBtn.addEventListener('click', () => this.goToPage(this.currentPage - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => this.goToPage(this.currentPage + 1));

        // Barre de progression
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.addEventListener('click', (e) => {
                const rect = progressBar.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                const page = Math.floor(percent * this.totalPages);
                this.goToPage(Math.max(0, Math.min(page, this.totalPages - 1)));
            });
        }

        // Saut de page
        const pageJumpInput = document.getElementById('pageJumpInput');
        if (pageJumpInput) {
            const jump = (e) => {
                const page = parseInt(e.target.value) - 1;
                if (!isNaN(page)) {
                    this.goToPage(Math.max(0, Math.min(page, this.totalPages - 1)));
                }
            };
            pageJumpInput.addEventListener('change', jump);
            pageJumpInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') jump(e); });
        }

        // Raccourcis clavier
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Clic sur image en mode page (navigation gauche/droite)
        const pageImg = document.getElementById('currentPageImg');
        if (pageImg) {
            pageImg.addEventListener('click', (e) => {
                if (this.currentMode !== 'page') return;
                if (this.zoom > 1) return; // pas de navigation quand zoomé
                const rect = pageImg.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                if (clickX > rect.width / 2) {
                    this.goToPage(this.currentPage + 1);
                } else {
                    this.goToPage(this.currentPage - 1);
                }
            });
        }

        // Zoom à la molette + Ctrl/Cmd
        const pageImageContainer = document.getElementById('pageImageContainer');
        if (pageImageContainer) {
            pageImageContainer.addEventListener('wheel', (e) => {
                if (this.currentMode !== 'page') return;
                if (!e.ctrlKey && !e.metaKey) return;
                e.preventDefault();
                const delta = e.deltaY < 0 ? this.zoomStep : -this.zoomStep;
                this.setZoom(this.zoom + delta);
            }, { passive: false });
        }

        // Tracking scroll (mode défilement)
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (this.currentMode !== 'scroll') return;
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => this.saveScrollProgress(), 500);
        });

        // Réajustement à la rotation/redimensionnement
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleResize(), 200);
        });
    }

    setupTouchGestures() {
        const target = document.getElementById('pageImageContainer');
        if (!target) return;

        target.addEventListener('touchstart', (e) => {
            // Pinch
            if (e.touches.length === 2) {
                this._touch.isPinching = true;
                this._touch.pinchStart = this._touchDistance(e.touches);
                this._touch.pinchInitialZoom = this.zoom;
                e.preventDefault();
                return;
            }

            if (e.touches.length === 1) {
                const t = e.touches[0];
                this._touch.startX = t.clientX;
                this._touch.startY = t.clientY;
                this._touch.startTime = Date.now();

                // Détection double-tap
                const now = Date.now();
                if (now - this._touch.lastTap < 300) {
                    e.preventDefault();
                    this._handleDoubleTap(t);
                    this._touch.lastTap = 0;
                } else {
                    this._touch.lastTap = now;
                }

                // Préparation pan si zoomé
                if (this.zoom > 1) {
                    this._touch.isPanning = true;
                    this._touch.panStartX = t.clientX;
                    this._touch.panStartY = t.clientY;
                    this._touch.scrollStartLeft = target.scrollLeft;
                    this._touch.scrollStartTop  = target.scrollTop;
                }
            }
        }, { passive: false });

        target.addEventListener('touchmove', (e) => {
            if (this._touch.isPinching && e.touches.length === 2) {
                const d = this._touchDistance(e.touches);
                const scale = d / this._touch.pinchStart;
                this.setZoom(this._touch.pinchInitialZoom * scale, false);
                e.preventDefault();
                return;
            }

            if (this._touch.isPanning && e.touches.length === 1 && this.zoom > 1) {
                const t = e.touches[0];
                const dx = t.clientX - this._touch.panStartX;
                const dy = t.clientY - this._touch.panStartY;
                target.scrollLeft = this._touch.scrollStartLeft - dx;
                target.scrollTop  = this._touch.scrollStartTop  - dy;
                e.preventDefault();
            }
        }, { passive: false });

        target.addEventListener('touchend', (e) => {
            if (this._touch.isPinching) {
                this._touch.isPinching = false;
                return;
            }

            // Swipe horizontal (mode page, non zoomé)
            if (this.currentMode === 'page' && this.zoom <= 1 && e.changedTouches.length === 1) {
                const t = e.changedTouches[0];
                const dx = t.clientX - this._touch.startX;
                const dy = t.clientY - this._touch.startY;
                const dt = Date.now() - this._touch.startTime;
                if (Math.abs(dx) > 60 && Math.abs(dy) < 80 && dt < 600) {
                    if (dx < 0) this.goToPage(this.currentPage + 1);
                    else        this.goToPage(this.currentPage - 1);
                }
            }

            this._touch.isPanning = false;
        }, { passive: true });

        target.addEventListener('touchcancel', () => {
            this._touch.isPinching = false;
            this._touch.isPanning  = false;
        });
    }

    setupAutoHideControls() {
        // Masque la barre du bas en défilement vers le bas (mobile), réaffiche en haut
        const controls = document.querySelector('.reader-controls');
        if (!controls) return;

        let lastY = window.scrollY;
        let ticking = false;

        const update = () => {
            const y = window.scrollY;
            const isMobile = window.innerWidth < 768;
            if (isMobile && y > 200 && y > lastY + 6) {
                controls.classList.add('hidden-bar');
            } else if (y < lastY - 6 || y < 100) {
                controls.classList.remove('hidden-bar');
            }
            lastY = y;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        }, { passive: true });
    }

    _touchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.hypot(dx, dy);
    }

    _handleDoubleTap() {
        if (this.zoom > 1.01) this.setZoom(1);
        else this.setZoom(2);
    }

    handleKeyPress(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.altKey) return;

        switch(e.key) {
            case 'ArrowLeft':
                if (this.currentMode === 'page') { e.preventDefault(); this.goToPage(this.currentPage - 1); }
                break;
            case 'ArrowRight':
                if (this.currentMode === 'page') { e.preventDefault(); this.goToPage(this.currentPage + 1); }
                break;
            case 'Home':
                if (this.currentMode === 'page') { e.preventDefault(); this.goToPage(0); }
                break;
            case 'End':
                if (this.currentMode === 'page') { e.preventDefault(); this.goToPage(this.totalPages - 1); }
                break;
            case '+':
            case '=':
                e.preventDefault();
                this.setZoom(this.zoom + this.zoomStep);
                break;
            case '-':
            case '_':
                e.preventDefault();
                this.setZoom(this.zoom - this.zoomStep);
                break;
            case '0':
                e.preventDefault();
                this.setZoom(1);
                break;
            case 'w':
            case 'W':
                this.cycleWidthPreset();
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
                this.toggleSettingsPanel(false);
                break;
        }
    }

    /* ============ MODE ============ */
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
                this.setZoom(1, false); // pas pertinent en scroll
            } else {
                scrollContainer.classList.add('hidden');
                scrollContainer.style.display = 'none';
                pageContainer.classList.add('active');
                pageContainer.style.display = 'flex';
                this.goToPage(0);
            }
        }

        // Affiche/masque les sections page-only dans le panneau paramètres
        document.querySelectorAll('[data-page-only]').forEach(el => {
            el.style.display = (mode === 'page') ? '' : 'none';
        });
    }

    toggleMode() {
        this.setMode(this.currentMode === 'scroll' ? 'page' : 'scroll');
    }

    /* ============ LARGEUR / FIT ============ */
    applyWidthPreset(preset) {
        const valid = ['compact', 'normal', 'wide', 'full'];
        if (!valid.includes(preset)) preset = 'normal';
        this.widthPreset = preset;
        localStorage.setItem('readerWidth', preset);

        const html = document.documentElement;
        valid.forEach(p => html.classList.remove('reader-width-' + p));
        html.classList.add('reader-width-' + preset);

        this.updateSettingsUI();
    }

    cycleWidthPreset() {
        const order = ['compact', 'normal', 'wide', 'full'];
        const i = order.indexOf(this.widthPreset);
        this.applyWidthPreset(order[(i + 1) % order.length]);
    }

    applyFitMode(mode) {
        const valid = ['width', 'height'];
        if (!valid.includes(mode)) mode = 'width';
        this.fitMode = mode;
        localStorage.setItem('readerFit', mode);

        const pageContainer = document.getElementById('pageModeContainer');
        if (pageContainer) {
            valid.forEach(m => pageContainer.classList.remove('fit-' + m));
            pageContainer.classList.add('fit-' + mode);
        }

        this.updateSettingsUI();
    }

    updateSettingsUI() {
        const panel = document.getElementById('readerSettingsPanel');
        if (!panel) return;
        panel.querySelectorAll('.settings-options').forEach(group => {
            const value = group.dataset.group === 'width' ? this.widthPreset : this.fitMode;
            group.querySelectorAll('.settings-option').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.value === value);
            });
        });
    }

    /* ============ ZOOM ============ */
    setZoom(newZoom, animate = true) {
        const clamped = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom));
        const changed = Math.abs(clamped - this.zoom) > 0.001;
        this.zoom = clamped;

        document.documentElement.style.setProperty('--reader-zoom', this.zoom);

        const img = document.getElementById('currentPageImg');
        const container = document.getElementById('pageImageContainer');

        if (img) {
            img.style.transition = animate ? 'transform 0.2s ease' : 'none';
            img.style.transform = `scale(${this.zoom})`;
        }
        if (container) {
            container.classList.toggle('zoomed', this.zoom > 1.01);
        }

        const display = document.getElementById('zoomLevel');
        if (display) display.textContent = Math.round(this.zoom * 100) + '%';

        const zoomOut = document.getElementById('zoomOutBtn');
        const zoomIn  = document.getElementById('zoomInBtn');
        if (zoomOut) zoomOut.disabled = this.zoom <= this.minZoom + 0.001;
        if (zoomIn)  zoomIn.disabled  = this.zoom >= this.maxZoom - 0.001;

        return changed;
    }

    handleResize() {
        // Si on est zoomé, on garde le niveau mais on s'assure que le scroll reste cohérent
        const container = document.getElementById('pageImageContainer');
        if (container && this.zoom > 1) {
            container.scrollLeft = Math.min(container.scrollLeft, container.scrollWidth - container.clientWidth);
            container.scrollTop  = Math.min(container.scrollTop,  container.scrollHeight - container.clientHeight);
        }
    }

    /* ============ PAGE ============ */
    goToPage(pageIndex) {
        if (pageIndex < 0 || pageIndex >= this.totalPages) return;

        this.currentPage = pageIndex;
        // Reset du zoom et du scroll de l'image à chaque changement de page
        this.setZoom(1, false);
        const container = document.getElementById('pageImageContainer');
        if (container) {
            container.scrollLeft = 0;
            container.scrollTop = 0;
        }

        this.updatePageDisplay();
        this.savePageProgress();
        this.preloadAdjacentImages();

        window.dispatchEvent(new CustomEvent('readerPageChanged', {
            detail: {
                currentPage: this.currentPage,
                totalPages: this.totalPages,
                isLastPage: this.currentPage === this.totalPages - 1,
                mode: this.currentMode
            }
        }));
    }

    preloadAdjacentImages() {
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

        if (pageLoader) pageLoader.classList.add('active');

        if (currentImg && this.images[this.currentPage]) {
            currentImg.src = this.images[this.currentPage].src;
            currentImg.alt = `Page ${this.currentPage + 1}`;
            currentImg.onload = () => {
                if (pageLoader) pageLoader.classList.remove('active');
            };
            currentImg.onerror = () => {
                if (pageLoader) pageLoader.classList.remove('active');
            };
        }

        const percent = ((this.currentPage + 1) / this.totalPages) * 100;
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressHandle) progressHandle.style.left = `${percent}%`;
        if (pageJumpInput) pageJumpInput.value = this.currentPage + 1;

        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 0;
            prevBtn.classList.toggle('disabled', this.currentPage === 0);
        }
        if (nextBtn) {
            nextBtn.disabled = this.currentPage === this.totalPages - 1;
            nextBtn.classList.toggle('disabled', this.currentPage === this.totalPages - 1);
        }
    }

    /* ============ FULLSCREEN / MODALS ============ */
    toggleFullscreen() {
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            const el = document.documentElement;
            (el.requestFullscreen?.() || el.webkitRequestFullscreen?.())
                ?.catch?.(err => console.log('Fullscreen error:', err));
        } else {
            (document.exitFullscreen?.() || document.webkitExitFullscreen?.());
        }
    }

    toggleShortcutsModal(show = null) {
        const modal = document.getElementById('shortcutsModal');
        if (!modal) return;
        if (show === null) modal.classList.toggle('active');
        else modal.classList.toggle('active', show);
    }

    toggleSettingsPanel(show = null) {
        const panel = document.getElementById('readerSettingsPanel');
        if (!panel) return;
        if (show === null) panel.classList.toggle('active');
        else panel.classList.toggle('active', show);
    }

    /* ============ PRÉFÉRENCES ============ */
    resetPreferences() {
        this.applyWidthPreset('normal');
        this.applyFitMode('width');
        this.setZoom(1);
    }

    /* ============ PROGRESSION ============ */
    getChapterKey() {
        return `reading_progress_${window.location.pathname}`;
    }

    savePageProgress() {
        if (this.currentPage > 0) {
            localStorage.setItem(this.getChapterKey(), JSON.stringify({
                mode: 'page',
                page: this.currentPage,
                timestamp: Date.now()
            }));
        }
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
            if (Date.now() - data.timestamp > 7 * 24 * 60 * 60 * 1000) {
                localStorage.removeItem(this.getChapterKey());
                return;
            }

            if (data.mode === 'page' && data.page !== undefined) {
                // Démarrage toujours à la page 1 (volontaire)
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

// Initialisation
const mangaReader = new MangaReader();
window.MangaReader = mangaReader;

// Scroll vers le haut animé
function scrollToTop() {
    const start = window.scrollY;
    if (start === 0) return;
    const duration = Math.min(800, 300 + start * 0.05);
    const startTime = performance.now();

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        window.scrollTo(0, start * (1 - easeOutCubic(progress)));
        if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

// === ENGAGEMENT FEATURES LOADER ===
(function loadEngagement() {
    const scripts = document.querySelectorAll('script[src*="reader.js"]');
    if (scripts.length === 0) return;
    const readerSrc = scripts[0].getAttribute('src');
    const basePath = readerSrc.substring(0, readerSrc.lastIndexOf('/') + 1);

    const cssPath = basePath.replace(/js\/utile\/?$/, 'css/').replace(/js\\utile\\?$/, 'css/');

    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = cssPath + 'engagement.css';
    document.head.appendChild(css);

    const script = document.createElement('script');
    script.src = basePath + 'engagement.js';
    script.defer = true;
    document.head.appendChild(script);
})();
