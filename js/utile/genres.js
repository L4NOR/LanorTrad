// Structure de données des mangas
const mangas = [
    {
        id: "Ao No Exorcist",
        title: "Ao No Exorcist",
        genres: ["Action", "Aventure", "Fantasy"],
        status: "En cours",
        chapters: 157,
        description: "Rin Okumura est un adolescent qui découvre un jour qu'il est le fils de Satan. Déterminé à devenir un exorciste pour vaincre Satan...",
        image: "images/cover/AoNoExorcist.jpg"
    },
    {
        id: "Satsudou",
        title: "Satsudou",
        genres: ["Aventure", "Comédie", "Arts Martiaux"],
        status: "En cours",
        chapters: 17,
        description: "Akamori Mitsuo veut être un salarié ordinaire mais... C'est un meurtrier de génie né dans une famille qui pratique l'art ancien de tuer...",
        image: "images/cover/Satsudou.jpg"
    },
    {
        id: "Tokyo Underworld",
        title: "Tokyo Underworld",
        genres: ["Horreur", "Mystérieux"],
        status: "En cours",
        chapters: 29.5,
        description: "Selon la légende urbaine, les coupables sont condamnés à tomber dans les Enfers de Tokyo. Là, ils ne bénéficient d'aucune pitié et...",
        image: "images/cover/TokyoUnderworld.jpg"
    },
    {
        id: "Tougen Anki",
        title: "Tougen Anki",
        genres: ["Action", "Drame", "Fantasy"],
        status: "En cours",
        chapters: 188,
        description: "Ichinose Shiki, héritier du sang d'Oni, a passé toute son enfance sans se rendre compte de ce fait. Cependant, lorsqu'un inconnu se...",
        image: "images/cover/TougenAnki.jpg"
    },
    {
        id: "Wild Strawberry",
        title: "Wild Strawberry",
        genres: ["Action", "Drame", "Fantasy"],
        status: "En cours",
        chapters: 9,
        description: "Les plantes ont évolué. Elles peuvent désormais se nourrir d'humains et devenir de terribles monstres connus sous le nom de Jinka...",
        image: "images/cover/WildStrawberry.jpg"
    }
];

// Créer une carte manga
function createMangaCard(manga) {
    const mangaLink = manga.id === "Satsudou" ? `/Manga/${manga.id}.html` : `/Manga/${manga.title}.html`;
    
    return `
        <div class="card rounded-xl overflow-hidden glow">
            <div class="relative">
                <img src="${manga.image}" alt="${manga.title}" class="w-full h-64 object-cover">
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
                        <span class="px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-xs">${genre}</span>
                    `).join('')}
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-400">${manga.chapters} chapitres</span>
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

// Filtrer les mangas
function filterMangas() {
    const selectedGenre = document.getElementById('genre-filter').value;
    const selectedStatus = document.getElementById('status-filter').value;
    
    const filteredMangas = mangas.filter(manga => {
        const genreMatch = selectedGenre === 'Tous les genres' || manga.genres.includes(selectedGenre);
        const statusMatch = selectedStatus === 'Statut' || manga.status === selectedStatus;
        return genreMatch && statusMatch;
    });
    
    const container = document.querySelector('.grid');
    container.innerHTML = filteredMangas.map(manga => createMangaCard(manga)).join('');
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('genre-filter').addEventListener('change', filterMangas);
    document.getElementById('status-filter').addEventListener('change', filterMangas);
    filterMangas();
});