// Structure de données pour une sortie
class Release {
    constructor(title, description, timestamp, image, tags = [], buttonText = '', buttonLink = '') {
        this.title = title;
        this.description = description;
        this.timestamp = timestamp;
        this.image = image;
        this.tags = tags;
        this.buttonText = buttonText;
        this.buttonLink = buttonLink;
    }
}

// Gestionnaire des sorties
class ReleasesManager {
    constructor() {
        this.releases = [];
        this.itemsPerPage = 5;
        this.currentPage = 1;
    }

    addRelease(release) {
        this.releases.unshift(release);
        this.updateDisplay();
    }

    formatRelativeTime(timestamp) {
        const now = new Date("2025-01-01T12:00:00"); // Date fixe pour la démo
        const releaseDate = new Date(timestamp);
        const diffInMinutes = Math.floor((now - releaseDate) / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);

        if (diffInMinutes < 60) {
            return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
        } else if (diffInHours < 24) {
            return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
        } else {
            return releaseDate.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
    }

    createReleaseCard(release) {
        return `
            <div class="card rounded-xl overflow-hidden glow">
                <div class="flex flex-col md:flex-row">
                    <div class="w-full md:w-48 shrink-0">
                        <img src="${release.image}" alt="Cover" class="w-full h-48 object-cover">
                    </div>
                    <div class="p-6 flex-1">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <h3 class="text-xl font-bold text-white">${release.title}</h3>
                            </div>
                        </div>
                        <p class="text-gray-400 text-sm mb-4">${release.description}</p>
                        <div class="flex justify-between items-center">
                            <div class="flex items-center space-x-2">
                                ${release.tags.map(tag => `
                                    <span class="px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-xs">${tag}</span>
                                `).join('')}
                            </div>
                            ${release.buttonText ? `
                                <button onclick="window.location.href='${release.buttonLink}'" 
                                        class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
                                    ${release.buttonText}
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    updateDisplay() {
        const container = document.querySelector('.space-y-8');
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const displayedReleases = this.releases.slice(startIndex, endIndex);

        container.innerHTML = displayedReleases
            .map(release => this.createReleaseCard(release))
            .join('');

        const loadMoreButton = document.querySelector('.text-center button');
        if (endIndex >= this.releases.length) {
            loadMoreButton.style.display = 'none';
        } else {
            loadMoreButton.style.display = 'inline-block';
        }
    }

    loadMore() {
        this.currentPage++;
        this.updateDisplay();
    }
}

// Initialisation
const manager = new ReleasesManager();

// Exemple d'utilisation avec des timestamps réalistes
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.text-center button').addEventListener('click', () => {
        manager.loadMore();
    });

    // Mise à jour de la date dans le titre
    const dateTitle = document.querySelector('h2');
    dateTitle.innerHTML = `
        <span class="chapter-tag px-3 py-1 rounded-full text-white text-sm font-medium mr-4">
            Aujourd'hui
        </span>
        1er Janvier 2025
    `;

    // Ajout d'exemples avec des timestamps variés
    const baseDate = new Date("2025-01-01T12:00:00");
    
    // Exemple 1 - Il y a 15 minutes
    manager.addRelease(new Release(
        "Nouveau design !",
        "Une mise à jour toute récente de notre plateforme",
        new Date(baseDate - 15 * 60 * 1000),
        "/images/cover/website.png",
        ["Nouveau", "Design"],
        "Voir les détails",
        "/index.html"
    ));
});