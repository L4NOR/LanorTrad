// Utilise la source unique de donnees manga
const mangas = window.MANGA_DATA || [];

// Récupérer la progression de lecture depuis localStorage
function getReadingProgress(mangaId, totalChapters) {
    try {
        const stats = JSON.parse(localStorage.getItem('lanortrad_stats') || '{}');
        if (stats.mangaStats && stats.mangaStats[mangaId]) {
            const read = stats.mangaStats[mangaId].chaptersRead || 0;
            return { read, total: totalChapters, percent: Math.min(100, Math.round((read / totalChapters) * 100)) };
        }
    } catch (e) {}
    return null;
}

// Créer une carte manga avec bouton favoris
function createMangaCard(manga) {
    const mangaLink = manga.id === "Satsudou" ? `/Manga/${manga.id}.html` : `/Manga/${manga.title}.html`;

    // Badge spécial pour les oneshots
    const oneshotBadge = manga.type === 'oneshot'
        ? '<span class="absolute top-4 left-4 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 text-yellow-400 text-xs font-bold">⭐ Oneshot</span>'
        : '';

    // Texte du nombre de chapitres
    const chaptersText = manga.type === 'oneshot'
        ? '1 histoire complète'
        : `${manga.chapters} chapitres`;

    // Barre de progression de lecture
    const progress = getReadingProgress(manga.id, manga.chapters);
    const progressHTML = progress && progress.read > 0
        ? `<div class="manga-progress">
               <div class="manga-progress-bar">
                   <div class="manga-progress-fill" style="width: ${progress.percent}%"></div>
               </div>
               <div class="manga-progress-text">${progress.read}/${progress.total} lu${progress.read > 1 ? 's' : ''} (${progress.percent}%)</div>
           </div>`
        : '';

    return `
        <div class="card rounded-xl overflow-hidden glow" data-manga-id="${manga.id}" data-type="${manga.type}" data-title="${manga.title}" data-image="${manga.image}">
            <div class="relative">
                <img src="${manga.image}" alt="Couverture de ${manga.title}" loading="lazy" class="w-full h-64 object-cover">
                ${oneshotBadge}
                <div class="absolute top-4 right-4">
                    <span class="chapter-tag px-3 py-1 rounded-full text-white text-sm font-medium">
                        ${manga.status}
                    </span>
                </div>
            </div>
            <div class="p-6">
                <h3 class="text-xl font-bold text-white mb-2">${manga.title}</h3>
                <p class="text-gray-400 text-sm mb-4">${manga.description}</p>
                <div class="flex flex-wrap gap-2 mb-4">
                    ${manga.genres.map(genre => `
                        <span class="px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-xs">${genre}</span>`).join('')}
                </div>
                ${progressHTML}

                <!-- Bouton Favoris -->
                <button class="favorite-btn w-full mb-4 py-2 px-4 rounded-lg border-2 border-gray-600 text-gray-400 transition-all duration-300 hover:border-pink-500 hover:text-pink-400" data-manga-id="${manga.id}" data-manga-type="${manga.type}">
                    🤍 Ajouter aux favoris
                </button>

                <div class="flex justify-between items-center">
                    <div>
                        <span class="text-sm text-gray-400">${chaptersText}</span>
                        ${manga.lastUpdate ? `<div class="text-xs text-gray-500 mt-1">MAJ ${new Date(manga.lastUpdate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>` : ''}
                    </div>
                    <a href="${mangaLink}">
                        <button class="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                            Lire →
                        </button>
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Filtrer les mangas avec support du type
function filterMangas() {
    const selectedType = document.getElementById('type-filter')?.value || 'all';
    const selectedGenre = document.getElementById('genre-filter').value;
    const selectedStatus = document.getElementById('status-filter').value;
    const selectedTeam = document.getElementById('team-filter').value;

    const filteredMangas = mangas.filter(manga => {
        // Filtre par type (manga/oneshot)
        const typeMatch = selectedType === 'all' ||
                         (selectedType === 'manga' && manga.type === 'manga') ||
                         (selectedType === 'oneshot' && manga.type === 'oneshot');

        const genreMatch = selectedGenre === 'Tous les genres' || manga.genres.includes(selectedGenre);
        const statusMatch = selectedStatus === 'Statut' || manga.status === selectedStatus;
        const teamMatch = selectedTeam === 'Toutes les teams' ||
            (selectedTeam === 'LanorTrad' && manga.genres.includes('LanorTrad')) ||
            (selectedTeam === 'Collaboration' && manga.genres.includes('Collaboration'));

        return typeMatch && genreMatch && statusMatch && teamMatch;
    });

    // Tri
    const sortValue = document.getElementById('sort-filter')?.value || 'recent';
    switch (sortValue) {
        case 'az': filteredMangas.sort((a, b) => a.title.localeCompare(b.title)); break;
        case 'za': filteredMangas.sort((a, b) => b.title.localeCompare(a.title)); break;
        case 'chapters': filteredMangas.sort((a, b) => b.chapters - a.chapters); break;
        case 'recent': filteredMangas.sort((a, b) => (b.lastUpdate || '').localeCompare(a.lastUpdate || '')); break;
    }

    const container = document.querySelector('.grid');

    if (filteredMangas.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-20">
                <div class="text-6xl mb-4">🔭</div>
                <h3 class="text-2xl font-bold text-white mb-2">Aucun résultat</h3>
                <p class="text-gray-400">Aucun manga ne correspond à vos critères de recherche</p>
            </div>
        `;
    } else {
        container.innerHTML = filteredMangas.map(manga => createMangaCard(manga)).join('');

        // Réinitialiser les boutons favoris après génération
        if (window.userPrefs) {
            window.userPrefs.setupFavoriteButtons();
        }
    }

    // Mettre à jour le compteur de résultats
    updateResultCount(filteredMangas.length);
}

// Mettre à jour le compteur de résultats
function updateResultCount(count) {
    let countElement = document.getElementById('result-count');

    if (!countElement) {
        // Créer le compteur s'il n'existe pas
        const filtersSection = document.querySelector('.py-8.border-b');
        if (filtersSection) {
            const countContainer = document.createElement('div');
            countContainer.className = 'mt-4 text-center';
            countContainer.innerHTML = `
                <p class="text-sm text-gray-400">
                    <span id="result-count" class="font-semibold text-indigo-400">${count}</span>
                    résultat${count > 1 ? 's' : ''} trouvé${count > 1 ? 's' : ''}
                </p>
            `;
            filtersSection.appendChild(countContainer);
            countElement = document.getElementById('result-count');
        }
    }

    if (countElement) {
        countElement.textContent = count;
        const parentText = countElement.parentElement;
        if (parentText) {
            parentText.innerHTML = `
                <span id="result-count" class="font-semibold text-indigo-400">${count}</span>
                résultat${count > 1 ? 's' : ''} trouvé${count > 1 ? 's' : ''}
            `;
        }
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Écouter tous les filtres
    const typeFilter = document.getElementById('type-filter');
    const genreFilter = document.getElementById('genre-filter');
    const statusFilter = document.getElementById('status-filter');
    const teamFilter = document.getElementById('team-filter');

    const sortFilter = document.getElementById('sort-filter');

    if (typeFilter) typeFilter.addEventListener('change', filterMangas);
    if (genreFilter) genreFilter.addEventListener('change', filterMangas);
    if (statusFilter) statusFilter.addEventListener('change', filterMangas);
    if (teamFilter) teamFilter.addEventListener('change', filterMangas);
    if (sortFilter) sortFilter.addEventListener('change', filterMangas);

    // Affichage initial
    filterMangas();
});
