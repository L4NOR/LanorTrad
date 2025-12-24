// Structure de données des mangas
const mangas = [
    {
        id: "Ao No Exorcist",
        title: "Ao No Exorcist",
        genres: ["Action", "Aventure", "Fantasy", "LanorTrad"],
        status: "En cours",
        chapters: 164,
        description: "Rin Okumura est un adolescent qui découvre un jour qu'il est le fils de Satan. Déterminé à devenir un exorciste pour vaincre Satan...",
        image: "images/cover/AoNoExorcist.jpg"
    },
    {
        id: "Catenaccio",
        title: "Catenaccio",
        genres: ["Sports", "Vie Scolaire", "Collaboration"],
        status: "En cours",
        chapters: 36,
        description: "Yataro Araki, membre de l’équipe de football du lycée Tōjō, nourrit de grandes ambitions : dans dix ans, il se voit déjà au sommet du football européen...",
        image: "images/cover/Catenaccio.png"
    },
    {
        id: "Satsudou",
        title: "Satsudou",
        genres: ["Aventure", "Comédie", "Arts Martiaux", "LanorTrad"],
        status: "En cours",
        chapters: 18,
        description: "Akamori Mitsuo veut être un salarié ordinaire mais... C'est un meurtrier de génie né dans une famille qui pratique l'art ancien de tuer...",
        image: "images/cover/Satsudou.jpg"
    },
    {
        id: "Tokyo Underworld",
        title: "Tokyo Underworld",
        genres: ["Horreur", "Mystérieux", "LanorTrad"],
        status: "En cours",
        chapters: 34,
        description: "Selon la légende urbaine, les coupables sont condamnés à tomber dans les Enfers de Tokyo. Là, ils ne bénéficient d'aucune pitié et...",
        image: "images/cover/TokyoUnderworld.jpg"
    },
    {
        id: "Tougen Anki",
        title: "Tougen Anki",
        genres: ["Action", "Drame", "Fantasy", "LanorTrad"],
        status: "En cours",
        chapters: 220,
        description: "Ichinose Shiki, héritier du sang d'Oni, a passé toute son enfance sans se rendre compte de ce fait. Cependant, lorsqu'un inconnu se...",
        image: "images/cover/TougenAnki.jpg"
    },
    // 🆕 ONESHOTS
    {
        id: "Countdown",
        title: "Countdown",
        genres: ["Spectres", "Surnaturel", "Oneshot"],
        status: "Terminé",
        chapters: 1,
        description: "Vêtements noirs, yeux noirs, cheveux noirs... et si vous rencontriez cela...?!",
        image: "manga/Countdown/oneshot/001.jpg"
    },
    {
        id: "Gestation of Kalavinka",
        title: "Gestation of Kalavinka",
        genres: ["Réincarnation", "Surnaturel", "Oneshot"],
        status: "Terminé",
        chapters: 1,
        description: "Après avoir perdu sa femme, Dawei accomplit le rituel de l'enterrement céleste sur son corps afin de faire son deuil..",
        image: "manga/Gestation Of Kalavinka/oneshot/001.jpg"
    },
    {
        id: "In the White",
        title: "In the White",
        genres: ["Psychologie", "Romance", "Oneshot"],
        status: "Terminé",
        chapters: 1,
        description: "Une petite araignée vient perturber la vie d'un auteur désespéré.",
        image: "manga/In the White/oneshot/001.jpg"
    },
    {
        id: "Sake to Sakana",
        title: "Sake to Sakana",
        genres: ["Drame", "Fantaisie", "Horreur", "Mystère", "Oneshot"], 
        status: "Terminé",
        chapters: 1,
        description: "Fumi et Haru sont deux amies d'université qui partagent une passion pour la natation, jusqu'à ce que l'héritage \"unique\" de Fumi vienne compliquer les choses.",
        image: "manga/Sake To Sakana/oneshot/002.jpg"
    },
    {
        id: "Second Coming",
        title: "Second Coming",
        genres: ["Drame", "Horreur", "Mystère", "Tragédie", "Oneshot"],
        status: "Terminé",
        chapters: 1,
        description: "Un forgeron perd sa fille lors d'un sacrifice et attend 40 ans pour se venger.",
        image: "manga/Second Coming/oneshot/001.jpg"
    }
];

// Créer une carte manga
function createMangaCard(manga) {
    const mangaLink = manga.id === "Satsudou" ? `/Manga/${manga.id}.html` : `/Manga/${manga.title}.html`;
    
    return `
        <div class="card rounded-xl overflow-hidden glow" data-manga-id="${manga.id}">
            <div class="relative">
                <img src="${manga.image}" alt="${manga.title}" loading="lazy" class="w-full h-64 object-cover">
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
    const selectedTeam = document.getElementById('team-filter').value;
    
    const filteredMangas = mangas.filter(manga => {
        const genreMatch = selectedGenre === 'Tous les genres' || manga.genres.includes(selectedGenre);
        const statusMatch = selectedStatus === 'Statut' || manga.status === selectedStatus;
        const teamMatch = selectedTeam === 'Toutes les teams' || 
            (selectedTeam === 'LanorTrad' && manga.genres.includes('LanorTrad')) ||
            (selectedTeam === 'Collaboration' && manga.genres.includes('Collaboration'));
        
        return genreMatch && statusMatch && teamMatch;
    });
    
    const container = document.querySelector('.grid');
    container.innerHTML = filteredMangas.map(manga => createMangaCard(manga)).join('');
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('genre-filter').addEventListener('change', filterMangas);
    document.getElementById('status-filter').addEventListener('change', filterMangas);
    document.getElementById('team-filter').addEventListener('change', filterMangas);
    filterMangas();
});