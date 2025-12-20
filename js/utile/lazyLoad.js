class LazyLoader {
    constructor() {
        this.imageObserver = null;
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            this.observeImages();
        } else {
            // Fallback pour navigateurs anciens
            this.loadAllImages();
        }
    }

    observeImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => this.imageObserver.observe(img));
    }

    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;

        // Ajouter un placeholder pendant le chargement
        img.classList.add('loading');
        
        const tempImg = new Image();
        tempImg.onload = () => {
            img.src = src;
            img.classList.remove('loading');
            img.classList.add('loaded');
        };
        tempImg.onerror = () => {
            img.classList.remove('loading');
            img.classList.add('error');
            img.src = 'images/placeholder-error.jpg'; // Image d'erreur par défaut
        };
        tempImg.src = src;
    }

    loadAllImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => this.loadImage(img));
    }

    // Pour ajouter de nouvelles images dynamiquement
    observe(img) {
        if (this.imageObserver) {
            this.imageObserver.observe(img);
        } else {
            this.loadImage(img);
        }
    }
}

// Instance globale
const lazyLoader = new LazyLoader();