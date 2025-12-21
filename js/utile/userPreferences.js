class UserPreferences {
    constructor() {
        this.favorites = this.loadFavorites();
        this.history = this.loadHistory();
        this.init();
    }

    init() {
        this.setupFavoriteButtons();
        this.trackReadingHistory();
    }

    // Gestion des favoris
    loadFavorites() {
        return JSON.parse(localStorage.getItem('lanortrad_favorites') || '[]');
    }

    saveFavorites() {
        localStorage.setItem('lanortrad_favorites', JSON.stringify(this.favorites));
    }

    toggleFavorite(mangaId, mangaData) {
        const index = this.favorites.findIndex(f => f.id === mangaId);
        
        if (index === -1) {
            this.favorites.push({
                id: mangaId,
                title: mangaData.title,
                image: mangaData.image,
                addedAt: Date.now()
            });
            this.showToast('✨ Ajouté aux favoris !');
        } else {
            this.favorites.splice(index, 1);
            this.showToast('❌ Retiré des favoris');
        }
        
        this.saveFavorites();
        this.updateFavoriteButtons();
    }

    isFavorite(mangaId) {
        return this.favorites.some(f => f.id === mangaId);
    }

    // Historique de lecture
    loadHistory() {
        return JSON.parse(localStorage.getItem('lanortrad_history') || '[]');
    }

    saveHistory() {
        localStorage.setItem('lanortrad_history', JSON.stringify(this.history));
    }

    addToHistory(mangaId, chapterNumber, mangaData) {
        // Supprimer l'ancienne entrée si elle existe
        this.history = this.history.filter(h => !(h.mangaId === mangaId && h.chapter === chapterNumber));
        
        // Ajouter en première position
        this.history.unshift({
            mangaId,
            chapter: chapterNumber,
            title: mangaData.title,
            image: mangaData.image,
            readAt: Date.now()
        });
        
        // Limiter à 50 entrées
        this.history = this.history.slice(0, 50);
        this.saveHistory();
    }

    trackReadingHistory() {
        // Détecter automatiquement la lecture
        const currentPath = window.location.pathname;
        const chapterMatch = currentPath.match(/\/Manga\/([^\/]+)\/Chapitre\s*(\d+(?:\.\d+)?)/i);
    
        if (chapterMatch) {
            const mangaId = chapterMatch[1];
            const chapterNumber = chapterMatch[2];
        
            // Récupérer les infos du manga depuis le titre de la page
            const pageTitle = document.title.split('-')[0].trim();
        
            this.addToHistory(mangaId, chapterNumber, {
                title: pageTitle,
                image: this.getMangaImage(mangaId)
            });
        }
    }

    getMangaImage(mangaId) {
        const mangaImages = {
            'Ao No Exorcist': 'images/cover/AoNoExorcist.jpg',
            'Tougen Anki': 'images/cover/TougenAnki.jpg',
            'Tokyo Underworld': 'images/cover/TokyoUnderworld.jpg',
            'Satsudou': 'images/cover/Satsudou.jpg',
            'Catenaccio': 'images/cover/Catenaccio.png'
        };
        return mangaImages[mangaId] || 'images/default-cover.jpg';
    }

    // UI Components
    setupFavoriteButtons() {
        document.querySelectorAll('[data-manga-id]').forEach(card => {
            const mangaId = card.dataset.mangaId;
            const isFav = this.isFavorite(mangaId);
            
            let favBtn = card.querySelector('.favorite-btn');
            if (!favBtn) {
                favBtn = this.createFavoriteButton(mangaId);
                card.querySelector('.p-6').insertBefore(favBtn, card.querySelector('.flex.justify-between'));
            }
            
            this.updateFavoriteButton(favBtn, isFav);
        });
    }

    createFavoriteButton(mangaId) {
        const btn = document.createElement('button');
        btn.className = 'favorite-btn w-full mb-4 py-2 px-4 rounded-lg border-2 transition-all duration-300';
        btn.dataset.mangaId = mangaId;
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = e.target.closest('[data-manga-id]');
            this.toggleFavorite(mangaId, {
                title: card.querySelector('h3').textContent,
                image: card.querySelector('img').src
            });
        });
        return btn;
    }

    updateFavoriteButton(btn, isFav) {
        if (isFav) {
            btn.className = 'favorite-btn w-full mb-4 py-2 px-4 rounded-lg border-2 border-pink-500 bg-pink-500/10 text-pink-400 transition-all duration-300 hover:bg-pink-500/20';
            btn.innerHTML = '❤️ Dans mes favoris';
        } else {
            btn.className = 'favorite-btn w-full mb-4 py-2 px-4 rounded-lg border-2 border-gray-600 text-gray-400 transition-all duration-300 hover:border-pink-500 hover:text-pink-400';
            btn.innerHTML = '🤍 Ajouter aux favoris';
        }
    }

    updateFavoriteButtons() {
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            const mangaId = btn.dataset.mangaId;
            this.updateFavoriteButton(btn, this.isFavorite(mangaId));
        });
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-24 right-4 bg-gray-900 border border-indigo-500 text-white px-6 py-3 rounded-lg shadow-xl z-[9999] animate-slide-in';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialiser
const userPrefs = new UserPreferences();window.userPrefs = userPrefs;
