// Classe pour gérer les favoris sur les dernières sorties
class LatestReleasesFavorites {
    constructor() {
        this.init();
    }

    init() {
        // Attendre que userPrefs soit chargé
        if (window.userPrefs) {
            this.setupFavoriteButtons();
        } else {
            setTimeout(() => this.init(), 100);
        }
    }

    setupFavoriteButtons() {
        // Configuration des mangas dans les dernières sorties
        const mangasData = {
            'Tougen Anki': {
                id: 'Tougen Anki',
                title: 'Tougen Anki',
                image: 'https://i.postimg.cc/4Nbmf35F/Tougen-Anki.jpg'
            },
            'Ao No Exorcist': {
                id: 'Ao No Exorcist',
                title: 'Ao No Exorcist',
                image: 'https://i.postimg.cc/qMdNHK8C/Ao-No-Exorcist.jpg'
            },
            'Tokyo Underworld': {
                id: 'Tokyo Underworld',
                title: 'Tokyo Underworld',
                image: 'https://i.postimg.cc/tCtYqg5w/Tokyo-Underworld.jpg'
            },
            'Satsudou': {
                id: 'Satsudou',
                title: 'Satsudou',
                image: 'https://i.postimg.cc/Hs4VYLzH/Satsudou.jpg'
            },
            'Catenaccio': {
                id: 'Catenaccio',
                title: 'Catenaccio',
                image: 'https://i.postimg.cc/5Nq64t37/Catenaccio.png'
            }
        };

        // Sélectionner tous les boutons favoris dans la section
        const favoriteButtons = document.querySelectorAll('.featured-card button, .manga-card button');
        
        favoriteButtons.forEach(button => {
            // Identifier le bouton favori (celui qui contient "Favoris")
            if (button.textContent.includes('Favoris') || button.textContent.includes('favoris')) {
                // Trouver le titre du manga parent
                const card = button.closest('.featured-card, .manga-card');
                if (!card) return;

                const titleElement = card.querySelector('h3, h4');
                if (!titleElement) return;

                const mangaTitle = titleElement.textContent.trim();
                const mangaData = mangasData[mangaTitle];

                if (!mangaData) return;

                // Configurer le bouton
                button.dataset.mangaId = mangaData.id;
                
                // État initial
                this.updateButtonState(button, mangaData.id);

                // Ajouter l'event listener
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleFavorite(mangaData, button);
                });
            }
        });
    }

    toggleFavorite(mangaData, button) {
        if (!window.userPrefs) return;

        window.userPrefs.toggleFavorite(mangaData.id, {
            title: mangaData.title,
            image: mangaData.image
        });

        this.updateButtonState(button, mangaData.id);
    }

    updateButtonState(button, mangaId) {
        if (!window.userPrefs) return;

        const isFavorite = window.userPrefs.isFavorite(mangaId);

        if (isFavorite) {
            // Style pour manga déjà en favoris
            button.className = 'px-6 py-3 rounded-xl border-2 border-pink-500 bg-pink-500/20 text-pink-400 font-medium transition-all hover:scale-105 hover:bg-pink-500/30';
            button.innerHTML = '❤️ Dans mes favoris';
        } else {
            // Style pour ajouter aux favoris
            button.className = 'px-6 py-3 rounded-xl border-2 border-indigo-500/50 hover:border-indigo-500 text-indigo-400 hover:text-indigo-300 font-medium transition-all hover:scale-105';
            button.innerHTML = '🤍 + Favoris';
        }
    }
}

// Initialiser quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    new LatestReleasesFavorites();
});

// Aussi essayer d'initialiser immédiatement si le DOM est déjà chargé
if (document.readyState !== 'loading') {
    new LatestReleasesFavorites();
}