const availableMangas = [
    {
        title: 'Ao No Exorcist',
        url: 'https://lanortrad.netlify.app/Manga/Ao%20No%20Exorcist',
        coverImage: 'images/cover/AoNoExorcist.jpg',
        genres: ['Action', 'Aventure', 'Fantaisie'],
        chapters: 160,
        synopsis: 'Rin Okumura est un adolescent qui découvre un jour qu\'il est le fils de Satan. Déterminé à devenir un exorciste pour vaincre Satan...'
    },
    {
        title: 'Catenaccio',
        url: 'https://lanortrad.netlify.app/manga/Catenaccio',
        coverImage: 'images/cover/Catenaccio.png',
        genres: ['Sports', 'Vie Scolaire', 'Collaboration'],
        chapters: 26,
        synopsis: 'Yataro Araki, membre de l’équipe de football du lycée Tōjō, nourrit de grandes ambitions : dans dix ans, il se voit déjà au sommet du football européen...'
    },
    {
        title: 'Satsudou',
        url: 'https://lanortrad.netlify.app/manga/Satsudou',
        coverImage: 'images/cover/Satsudou.jpg',
        genres: ['Action', 'Comédie', 'Arts Martiaux'],
        chapters: 18,
        synopsis: 'Akamori Mitsuo veut être un salarié ordinaire mais... C\'est un meurtrier de génie né dans une famille qui pratique l\'art ancien de tuer...'
    },
    {
        title: 'Tokyo Underworld',
        url: 'https://lanortrad.netlify.app/Manga/Tokyo%20Underworld',
        coverImage: 'images/cover/TokyoUnderworld.jpg',
        genres: ['Horreur', 'Mystérieux'],
        chapters: 34,
        synopsis: 'Selon la légende urbaine, les coupables sont condamnés à tomber dans les Enfers de Tokyo. Là, ils ne bénéficient d\'aucune pitié et...'
    },
    {
        title: 'Tougen Anki',
        url: 'https://lanortrad.netlify.app/Manga/Tougen%20Anki',
        coverImage: 'images/cover/TougenAnki.jpg',
        genres: ['Action', 'Drame', 'Fantaisie'],
        chapters: 200,
        synopsis: 'Ichinose Shiki, héritier du sang d\'Oni, a passé toute son enfance sans se rendre compte de ce fait. Cependant, lorsqu\'un inconnu se...'
    }
];

function createSuggestionsContainer() {
    const container = document.createElement('div');
    container.id = 'search-suggestions';
    container.style.cssText = `
        position: absolute;
        top: calc(100% + 0.5rem);
        left: 0;
        right: 0;
        background: rgba(17, 24, 39, 0.95);
        border: 1px solid rgba(79, 70, 229, 0.1);
        border-radius: 0.75rem;
        margin-top: 0.5rem;
        max-height: 400px;
        overflow-y: auto;
        display: none;
        z-index: 50;
        backdrop-filter: blur(12px);
        box-shadow: 0 4px 20px rgba(79, 70, 229, 0.1);
    `;
    return container;
}

function createSuggestionElement(manga) {
    const div = document.createElement('div');
    div.className = 'p-4 hover:bg-gray-800/50 cursor-pointer transition-all duration-200 border-b border-gray-700/50 last:border-0';
    
    div.innerHTML = `
        <div class="flex gap-4">
            <div class="flex-shrink-0">
                <img src="${manga.coverImage}" alt="${manga.title}" class="w-16 h-24 object-cover rounded-lg shadow-md"/>
            </div>
            <div class="flex-grow min-w-0">
                <div class="flex items-center justify-between mb-1">
                    <h3 class="font-medium text-white truncate">${manga.title}</h3>
                    <span class="text-sm text-indigo-400 whitespace-nowrap ml-2">Ch. ${manga.chapters}</span>
                </div>
                <div class="flex flex-wrap gap-2 mb-2">
                    ${manga.genres.map(genre => 
                        `<span class="px-2 py-0.5 text-xs bg-gray-800/80 text-gray-300 rounded-full border border-gray-700/50">${genre}</span>`
                    ).join('')}
                </div>
                <p class="text-sm text-gray-400 line-clamp-2">${manga.synopsis}</p>
            </div>
        </div>
    `;
    
    div.addEventListener('click', () => {
        window.location.href = manga.url;
    });
    
    return div;
}

function createNoResultsElement() {
    const div = document.createElement('div');
    div.className = 'p-8 text-gray-400 text-center';
    div.innerHTML = `
        <span class="block mb-2">✖</span>
        <span class="text-sm">Aucun manga trouvé</span>
    `;
    return div;
}

function enhanceSearchInput(searchInput) {
    const wrapper = document.createElement('div');
    wrapper.className = 'relative group';
    
    const searchIcon = document.createElement('span');
    searchIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    `;

    searchInput.className = `
        w-64 pl-12 pr-4 py-2.5 bg-gray-900/80 rounded-lg
        border border-gray-700 text-gray-300 text-sm
        placeholder-gray-400 backdrop-blur-lg
        transition-all duration-300
        focus:border-indigo-500/50 focus:shadow-lg focus:shadow-indigo-500/20
        focus:outline-none focus:ring-0
    `;
    
    searchInput.parentNode.insertBefore(wrapper, searchInput);
    wrapper.appendChild(searchInput);
    wrapper.insertBefore(searchIcon, searchInput);
}

document.addEventListener('DOMContentLoaded', () => {
    const searchInputs = document.querySelectorAll('input[type="search"]');
    
    searchInputs.forEach(searchInput => {
        enhanceSearchInput(searchInput);
        const suggestionsContainer = createSuggestionsContainer();
        searchInput.parentElement.style.position = 'relative';
        searchInput.parentElement.appendChild(suggestionsContainer);

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            suggestionsContainer.innerHTML = '';

            const iconEl = searchInput.parentElement.querySelector('svg');
            iconEl.classList.toggle('text-indigo-400', searchTerm.length > 0);

            if (searchTerm.length > 0) {
                const matches = availableMangas.filter(manga => 
                    manga.title.toLowerCase().includes(searchTerm) ||
                    manga.synopsis.toLowerCase().includes(searchTerm) ||
                    manga.genres.some(genre => genre.toLowerCase().includes(searchTerm))
                );

                if (matches.length > 0) {
                    matches.forEach(manga => {
                        suggestionsContainer.appendChild(createSuggestionElement(manga));
                    });
                } else {
                    suggestionsContainer.appendChild(createNoResultsElement());
                }
                suggestionsContainer.style.display = 'block';
            } else {
                suggestionsContainer.style.display = 'none';
            }
        });

        searchInput.addEventListener('focus', () => {
            searchInput.parentElement.classList.add('focusing');
            if (searchInput.value.trim().length > 0) {
                suggestionsContainer.style.display = 'block';
            }
        });

        searchInput.addEventListener('blur', () => {
            searchInput.parentElement.classList.remove('focusing');
        });

        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                suggestionsContainer.style.display = 'none';
            }
        });
    });
});