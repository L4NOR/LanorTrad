const mangas = [
    // === SÉRIES RÉGULIÈRES ===
    {
        id: "Ao No Exorcist",
        title: "Ao No Exorcist",
        type: "manga",
        genres: ["Action", "Aventure", "Fantasy", "LanorTrad"],
        status: "En cours",
        chapters: 166,
        description: "Rin Okumura est un adolescent qui découvre un jour qu'il est le fils de Satan. Déterminé à devenir un exorciste pour vaincre Satan...",
        image: "images/cover/AoNoExorcist.jpg"
    },
    {
        id: "Catenaccio",
        title: "Catenaccio",
        type: "manga",
        genres: ["Sports", "Vie Scolaire", "Collaboration"],
        status: "En cours",
        chapters: 46,
        description: "Yataro Araki, membre de l'équipe de football du lycée Tōjō, nourrit de grandes ambitions : dans dix ans, il se voit déjà au sommet du football européen...",
        image: "images/cover/Catenaccio.png"
    },
    {
        id: "Satsudou",
        title: "Satsudou",
        type: "manga",
        genres: ["Aventure", "Comédie", "Arts Martiaux", "LanorTrad"],
        status: "En cours",
        chapters: 18,
        description: "Akamori Mitsuo veut être un salarié ordinaire mais... C'est un meurtrier de génie né dans une famille qui pratique l'art ancien de tuer...",
        image: "images/cover/Satsudou.jpg"
    },
    {
        id: "Tokyo Underworld",
        title: "Tokyo Underworld",
        type: "manga",
        genres: ["Horreur", "Mystérieux", "LanorTrad"],
        status: "En cours",
        chapters: 38,
        description: "Selon la légende urbaine, les coupables sont condamnés à tomber dans les Enfers de Tokyo. Là, ils ne bénéficient d'aucune pitié et...",
        image: "images/cover/TokyoUnderworld.jpg"
    },
    {
        id: "Tougen Anki",
        title: "Tougen Anki",
        type: "manga",
        genres: ["Action", "Drame", "Fantasy", "LanorTrad"],
        status: "En cours",
        chapters: 230,
        description: "Ichinose Shiki, héritier du sang d'Oni, a passé toute son enfance sans se rendre compte de ce fait. Cependant, lorsqu'un inconnu se...",
        image: "images/cover/TougenAnki.jpg"
    },
    
    // === ONESHOTS ===
    {
        id: "Countdown",
        title: "Countdown",
        type: "oneshot",
        genres: ["Spectres", "Surnaturel", "Oneshot"],
        status: "Terminé",
        chapters: 1,
        description: "Vêtements noirs, yeux noirs, cheveux noirs... et si vous rencontriez cela...?!",
        image: "manga/Countdown/oneshot/001.jpg"
    },
    {
        id: "Gestation of Kalavinka",
        title: "Gestation of Kalavinka",
        type: "oneshot",
        genres: ["Réincarnation", "Surnaturel", "Oneshot"],
        status: "Terminé",
        chapters: 1,
        description: "Après avoir perdu sa femme, Dawei accomplit le rituel de l'enterrement céleste sur son corps afin de faire son deuil..",
        image: "manga/Gestation Of Kalavinka/oneshot/001.jpg"
    },
    {
        id: "In the White",
        title: "In the White",
        type: "oneshot",
        genres: ["Psychologie", "Romance", "Oneshot"],
        status: "Terminé",
        chapters: 1,
        description: "Une petite araignée vient perturber la vie d'un auteur désespéré.",
        image: "manga/In the White/oneshot/001.jpg"
    },
    {
        id: "Sake to Sakana",
        title: "Sake to Sakana",
        type: "oneshot",
        genres: ["Drame", "Fantaisie", "Horreur", "Mystère", "Oneshot"], 
        status: "Terminé",
        chapters: 1,
        description: "Fumi et Haru sont deux amies d'université qui partagent une passion pour la natation, jusqu'à ce que l'héritage \"unique\" de Fumi vienne compliquer les choses.",
        image: "manga/Sake To Sakana/oneshot/002.jpg"
    },
    {
        id: "Second Coming",
        title: "Second Coming",
        type: "oneshot",
        genres: ["Drame", "Horreur", "Mystère", "Tragédie", "Oneshot"],
        status: "Terminé",
        chapters: 1,
        description: "Un forgeron perd sa fille lors d'un sacrifice et attend 40 ans pour se venger.",
        image: "manga/Second Coming/oneshot/001.jpg"
    }
];

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
    
    return `
        <div class="card rounded-xl overflow-hidden glow" data-manga-id="${manga.id}" data-type="${manga.type}" data-title="${manga.title}" data-image="${manga.image}">
            <div class="relative">
                <img src="${manga.image}" alt="${manga.title}" loading="lazy" class="w-full h-64 object-cover">
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
                
                <!-- Bouton Favoris -->
                <button class="favorite-btn w-full mb-4 py-2 px-4 rounded-lg border-2 border-gray-600 text-gray-400 transition-all duration-300 hover:border-pink-500 hover:text-pink-400" data-manga-id="${manga.id}" data-manga-type="${manga.type}">
                    🤍 Ajouter aux favoris
                </button>
                
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-400">${chaptersText}</span>
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
        
        // ✨ IMPORTANT : Réinitialiser les boutons favoris après génération
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
    
    if (typeFilter) typeFilter.addEventListener('change', filterMangas);
    if (genreFilter) genreFilter.addEventListener('change', filterMangas);
    if (statusFilter) statusFilter.addEventListener('change', filterMangas);
    if (teamFilter) teamFilter.addEventListener('change', filterMangas);
    
    // Affichage initial
    filterMangas();
});