document.addEventListener('DOMContentLoaded', function() {
    const contentDiv = document.getElementById('content');
    const toggleButton = document.getElementById('toggleButton');
    let isChapitresVisible = true; // Afficher les chapitres par défaut
    let itemsPerPage = getItemsPerPage();
    let currentPage = 1;

    function getItemsPerPage() {
        if (window.innerWidth <= 600) {
            return 3; // 1 colonne x 3 lignes sur les petits écrans
        } else if (window.innerWidth <= 900) {
            return 6; // 2 colonnes x 3 lignes sur les écrans moyens
        } else {
            return 9; // 3 colonnes x 3 lignes sur les grands écrans
        }
    }

    window.addEventListener('resize', function() {
        const newItemsPerPage = getItemsPerPage();
        if (newItemsPerPage !== itemsPerPage) {
            itemsPerPage = newItemsPerPage;
            updateContent();
        }
    });

    function createPaginationButtons(totalItems) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        let paginationHTML = '<div class="pagination">';
        
        // Bouton "Précédent"
        paginationHTML += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(-1)">❮</button>`;

        // Affichage des numéros de page
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            paginationHTML += `<button onclick="changePage(${1 - currentPage})">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span class="ellipsis">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            if (i === currentPage) {
                paginationHTML += `<button class="active">${i}</button>`;
            } else {
                paginationHTML += `<button onclick="changePage(${i - currentPage})">${i}</button>`;
            }
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span class="ellipsis">...</span>`;
            }
            paginationHTML += `<button onclick="changePage(${totalPages - currentPage})">${totalPages}</button>`;
        }

        // Bouton "Suivant"
        paginationHTML += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(1)">❯</button>`;

        paginationHTML += '</div>';
        return paginationHTML;
    }

    function createChapitresSection() {
        const chapitres = [166, 165, 164, 163, 162, 161, 160, 159];
        const totalChapitres = chapitres.length;
        const start = (currentPage - 1) * itemsPerPage;
        const end = Math.min(start + itemsPerPage, totalChapitres);
    
        let html = `
            <section class="chapters-section">
                <h2>Les derniers chapitres</h2>
                <div class="chapter-grid">
        `;
    
        for (let i = start; i < end; i++) {
            const chapitreNumber = chapitres[i];
            html += `
                <div class="chapter-card">
                    <a href="tougen%20anki/Chapitre%20${chapitreNumber}.html" class="tome-link">
                        <img src="images/TA/cover.jpg" alt="Couverture du chapitre ${chapitreNumber}">
                        <p>Chapitre ${chapitreNumber}</p>
                    </a>
                </div>
            `;
        }
    
        html += '</div>';
        html += createPaginationButtons(totalChapitres);
        html += '</section>';
    
        return html;
    }

    function createTomesSection() {
        const totalTomes = 18;
        const start = (currentPage - 1) * itemsPerPage;
        const end = Math.min(start + itemsPerPage, totalTomes);

        let html = `
            <section class="tomes-section">
                <h2>Les Tomes</h2>
                <div class="tomes-grid">
        `;

        for (let i = start; i < end; i++) {
            const tomeNumber = i + 1;
            const formattedNumber = tomeNumber < 10 ? `0${tomeNumber}` : tomeNumber;
            const link = `tougen anki/Tome ${formattedNumber}.html`;
            
            html += `
                <div class="tome-card">
                    <a href="${link}" class="tome-link">
                        <img src="images/TA/T${formattedNumber}.jpg" alt="Couverture du tome ${formattedNumber}">
                        <p>Tome ${formattedNumber}</p>
                    </a>
                </div>
            `;
        }

        html += '</div>';
        html += createPaginationButtons(totalTomes);
        html += '</section>';

        return html;
    }

    function toggleContent() {
        isChapitresVisible = !isChapitresVisible;
        currentPage = 1; // Réinitialiser à la première page lors du changement de vue
        updateContent();
        toggleButton.textContent = isChapitresVisible ? "Tous les tomes" : "Derniers chapitres";
    }

    function updateContent() {
        contentDiv.innerHTML = isChapitresVisible ? createChapitresSection() : createTomesSection();
    }

    function changePage(direction) {
        const totalItems = isChapitresVisible ? 8 : 18; // Nombre total de chapitres ou de tomes
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        currentPage += direction;
        if (currentPage < 1) currentPage = 1;
        if (currentPage > totalPages) currentPage = totalPages;
        
        updateContent();
    }

    // Exposer la fonction changePage globalement
    window.changePage = changePage;

    toggleButton.addEventListener('click', toggleContent);

    // Initialisation
    updateContent();
});

const showChaptersButton = document.getElementById('show-chapters-button');
const chaptersOverlay = document.getElementById('chapters-overlay');
const chapterList = document.getElementById('chapter-list');
            
const customTitles = {
    1: "Sang d'oni",
    2: "L'agence Momotarô",
    3: "Dommage pour toi",
    4: "Des graines de qualité",
    5: "Il vous faudra enchaîner les victoires",
    6: "Hémocorrosion : Effusion",
    7: "Elle vous tuera",
    8: "Je ne peux pas t'abandonner !",
    9: "Les choses sérieuses ne font que commencer !",
    10: "C'est pas mes oignons",
    11: "Ton Père",
    12: "Collaboration",
    13: "Fonce vers la ligne d'arrivée",
    14: "Les détraqués",
    15: "Kyôya Oiranzaka",
    16: "Mon champ de bataille",
    17: "À la limite du supportable",
    18: "La cruauté a des limites",
    19: "Je préfère être du côté des méchants",
    20: "Belle et redoutable",
    21: "Tout est prêt",
    22: "Dévouement maladif",
    23: "I love, un amour insensé",
    24: "Impossible, Impossible, Impossible",
    25: "Chronique d'un héros raté",
    26: "J'ai pas la classe ?",
    27: "Tu flippes ?",
    28: "Que va donner la colère du jour ?",
    29: "Le problème, c'est que tu n'essayes même pas de changer",
    30: "L'âme d'un momotarô",
    31: "L'héritier de kishin",
    32: "Parce que j'ai un coeur",
    33: "Courage !!",
    34: "Je hais ce type",
    35: "Merci !",
    36: "Répartition des chambres",
    37: "Mikado, la porte des Dieux",
    38: "Et si...",
    39: "Ma propre règle",
    40: "Tant mieux !",
    41: "Les troupes de l'arrondissement de Nerima",
    42: "Détermination",
    43: "Ça Avance",
    44: "Trouvés !",
    45: "Tête-à-Tête",
    46: "Ondées à profusion",
    47: "Le clair de lune sera témoin de ta mort",
    48: "C'est pas si mal",
    49: "Tout se déroule comme je l'espérais",
    50: "L'oni vengeur",
    51: "Doutes",
    52: "Le doute s'installe",
    53: "Peine",
    54: "La voix des faibles",
    55: "Tournant",
    56: "Bidonne-toi !",
    57: "Je m'occupe de tout !",
    58: "Colère VS Colère",
    59: "On va danser !",
    60: "La nuit est encore longue",
    61: "La perfection de la Divination",
    62: "Ils n'ont d'yeux que pour moi",
    63: "Une allure de Dieu",
    64: "C'est pas possible",
    65: "Combat stérile",
    66: "Mes limites",
    67: "Adieu",
    68: "Mon pote",
    69: "Pas si mal",
    70: "Démon",
    71: "Un imbécile",
    72: "Ne meurs pas !",
    73: "Ce que je peux faire",
    74: "Ce que je désirais",
    75: "Responsabilité",
    76: "Pour la prochaine fois",
    77: "À jamais inachevé",
    78: "Go ! Go ! La montagne enneigée !",
    79: "Innami",
    80: "Imprévu",
    81: "Comment devenir fort",
    82: "Persévérance",
    83: "Vivre, c'est grandir en permanence",
    84: "Cicatrice",
    85: "Assurance",
    86: "Impasse",
    87: "Coopération",
    88: "Poursuite",
    89: "L'auditoire",
    90: "Le vent est ma cape, la brise est ma dague",
    91: "Au Revoir",
    92: "Fils Prodigue",
    93: "Le sang frais",
    94: "Combat Nocturne",
    95: "En tant que Père",
    96: "Perte d'attention",
    97: "Ce n'est pas juste",
    98: "La décision de Todoroki",
    99: "Extermination Terminée",
    100: "Ne baisse pas ta garde ! Tiens bon !!",
    101: "Le retour du Capitaine !",
    102: "Les ailes tachées de sang",
    103: "Une telle douleur (dans le cul)",
    104: "L'arrivée",
    105: "Chacun son chemin",
    106: "Prends-moi avec toi !",
    107: "La légende des 100 meurtres",
    108: "Bruit",
    109: "Les sons de la musique",
    110: "Quelque chose d'invisible",
    111: "Ouverture",
    112: "Illuminé par les projecteurs",
    113: "La Mallette Transportable",
    114: "Destin",
    115: "Roméo et Juliette",
    116: "Trop Cool",
    117: "Je te protégerai !",
    118: "Future",
    119: "Un câlin écorché",
    120: "Flashback",
    121: "Recherche",
    122: "Stimulation",
    123: "Statues Dorées",
    124: "Les Elevator Boys",
    125: "Les capacités du pervers",
    126: "Ce pourquoi je suis née !!",
    127: "Mauvaise vie",
    128: "Tout est libre",
    129: "Bye Bye",
    130: "La racaille et le chercheur de merde",
    131: "Moustique",
    132: "Commencer à bouger",
    133: "Réunion",
    134: "Bons amis",
    135: "Mon ami",
    136: "Souvenirs",
    137: "Seul",
    138: "Amusant",
    139: "Renaissance",
    140: "Le devoir de chacun",
    141: "Un coeur enragé",
    142: "Ego",
    143: "L'unité kikoku",
    144: "Ne te retourne jamais",
    145: "Amis",
    146: "Ennemi Naturel",
    147: "Distorsion",
    148: "Vide Néant",
    149: "Traversée",
    150: "Je veux m'appuyer sur toi",
    151: "Tenma",
    152: "Tendresse",
    153: "Clef de la réussite",
    154: "Biplace",
    155: "Compte sur moi",
    156: "Mamagoto",
    157: "Une colère brûlante",
    158: "La chute du dirigeable",
    159: "Chute",
    160: "La première fois",
    161: "Nouveau Monde",
    162: "Changement et évolution",
    163: "Porter",
    164: "Plan",
    165: "Doute",
    166: "Punition",
    167: "Transmission",
    168: "Réflexions"
};

// Liste des chapitres avec le chemin du fichier PDF, incluant les chapitres bonus
const chapters = [];

for (let i = 1; i <= 168; i++) {
    chapters.push({
        number: i,
        title: customTitles[i] || `Chapitre ${i}`,
        filePath: `images/Manga/pdf/Chapitre ${i.toString().padStart(3, '0')}.pdf`
    });
}

// Affichage de la liste des chapitres
showChaptersButton.addEventListener('click', () => {
    chaptersOverlay.style.display = 'block';
    document.body.style.overflow = 'hidden';

    chapterList.innerHTML = chapters.map(chapter =>
        `<div class="chapter-item">
            <span>Chapitre ${chapter.number} : ${chapter.title}</span>
            <button class="download-button" onclick="downloadChapter('${chapter.filePath}', '${chapter.number}')">
                Télécharger
            </button>
        </div>`
    ).join('');
});

function closeChapters() {
    chaptersOverlay.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Fonction de téléchargement du chapitre en PDF
function downloadChapter(filePath, chapterNumber) {
    const link = document.createElement('a');
    link.href = filePath;
    link.download = `Tougen Anki Chapitre ${chapterNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log(`Téléchargement du chapitre ${chapterNumber} depuis ${filePath}`);
}