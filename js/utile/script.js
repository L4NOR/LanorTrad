// Données des mangas
const mangaData = {
    'Tokyo Underworld': {
        currentChapter: 34,
        description: 'Selon la légende urbaine, les coupables sont condamnés à tomber dans les Enfers de Tokyo. Là, ils ne bénéficient d\'aucune pitié et...',
        genres: ['Horreur', 'Mystérieux'],
        image: 'images/affiche/TokyoUnderworld.png',
        link: 'https://lanortrad.netlify.app/tokyo-underworld'
    },
    'Tougen Anki': {
        currentChapter: 193,
        description: 'Ichinose Shiki, héritier du sang d\'Oni, a passé toute son enfance sans se rendre compte de ce fait. Cependant, lorsqu\'un inconnu se...',
        genres: ['Action', 'Drame', 'Fantaisie'],
        image: 'images/affiche/TougenAnki.jpg',
        link: 'https://lanortrad.netlify.app/tougen-anki'
    },
    'Satsudou': {
        currentChapter: 18,
        description: 'Akamori Mitsuo veut être un salarié ordinaire mais... C\'est un meurtrier de génie né dans une famille qui pratique l\'art ancien de tuer...',
        genres: ['Action', 'Comédie', 'Arts Martiaux'],
        image: 'images/affiche/Satsudou.png',
        link: 'https://lanortrad.netlify.app/satsudou'
    },
    'Ao No Exorcist': {
        currentChapter: 157,
        description: 'Rin Okumura est un adolescent qui découvre un jour qu\'il est le fils de Satan. Déterminé à devenir un exorciste pour vaincre Satan...',
        genres: ['Action', 'Aventure', 'Fantaisie'],
        image: 'images/affiche/AoNoExorcist.jpg',
        href: 'https://lanortrad.netlify.app/ao-no-exorcist'
    }
};

// Stats initiales
const stats = {
    monthlyReaders: '8,5K',
    translatedChapters: 206,
    ongoingSeries: 5
};

// Fonction pour mettre à jour le chapitre d'un manga
function updateMangaChapter(mangaTitle, newChapter) {
    if (mangaData[mangaTitle]) {
        const oldChapter = mangaData[mangaTitle].currentChapter;
        mangaData[mangaTitle].currentChapter = newChapter;
        
        // Mettre à jour le nombre total de chapitres traduits
        stats.translatedChapters += (newChapter - oldChapter);
        
        // Mettre à jour l'affichage
        updateDisplay();
    }
}

// Fonction pour mettre à jour l'affichage
function updateDisplay() {
    // Mettre à jour les cartes de manga
    Object.entries(mangaData).forEach(([title, data]) => {
        const mangaCard = document.querySelector(`[data-manga="${title}"]`);
        if (mangaCard) {
            const chapterElement = mangaCard.querySelector('.text-sm.font-medium.text-indigo-400');
            if (chapterElement) {
                chapterElement.textContent = `Ch. ${data.currentChapter}`;
            }
        }
    });

    // Mettre à jour les statistiques
    document.querySelector('[data-stat="readers"]').textContent = stats.monthlyReaders;
    document.querySelector('[data-stat="chapters"]').textContent = stats.translatedChapters;
    document.querySelector('[data-stat="series"]').textContent = stats.ongoingSeries;
}

// Fonction pour ajouter un nouveau manga
function addNewManga(title, initialChapter, description, genres, image) {
    mangaData[title] = {
        currentChapter: initialChapter,
        description,
        genres,
        image
    };
    stats.ongoingSeries += 1;
    stats.translatedChapters += initialChapter;
    updateDisplay();
}

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    // Ajouter les attributs data-* nécessaires aux éléments HTML
    const statsElements = document.querySelectorAll('.text-4xl.font-bold.text-white.mb-2');
    statsElements[0].setAttribute('data-stat', 'readers');
    statsElements[1].setAttribute('data-stat', 'chapters');
    statsElements[2].setAttribute('data-stat', 'series');

    // Ajouter les attributs data-manga aux cartes
    const mangaCards = document.querySelectorAll('.card');
    mangaCards.forEach(card => {
        const title = card.querySelector('.text-xl.font-bold.text-white').textContent;
        card.setAttribute('data-manga', title);
    });

    // Initialiser l'affichage
    updateDisplay();
});