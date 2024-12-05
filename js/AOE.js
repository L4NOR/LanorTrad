document.addEventListener('DOMContentLoaded', function() {
    const contentDiv = document.getElementById('content');
    const toggleButton = document.getElementById('toggleButton');
    let isChapitresVisible = true;
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

        // Numéros de page
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
            paginationHTML += `<button ${i === currentPage ? 'class="active"' : ''} onclick="changePage(${i - currentPage})">${i}</button>`;
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
        const chapitres = [154, 153, 152, 151]; // Seulement les chapitres 152 et 151
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
                    <a href="ao%20no%20exorcist/Chapitre%20${chapitreNumber}.html" class="tome-link">
                        <img src="images/AOE/cover.png" alt="Couverture du chapitre ${chapitreNumber}">
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
        const totalTomes = 31; // Nombre total de tomes
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
            const link = `ao no exorcist/Tome ${formattedNumber}.html`;
            
            html += `
                <div class="tome-card">
                    <a href="${link}" class="tome-link">
                        <img src="images/AOE/T${formattedNumber}.jpg" alt="Couverture du tome ${formattedNumber}">
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
        const totalItems = isChapitresVisible ? 2 : 31; // 2 chapitres ou 31 tomes
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
    1: "Le rire Satanique",
    2: "Deux frères",
    3: "Le jardin d'Amahara",
    4: "L'enfant du temple maudit",
    5: "De nouveaux amis",
    6: "Il y avait un malade",
    7: "Trauma",
    8: "Le chat noir",
    9: "Démons en action",
    10: "La Preuve",
    11: "Une joyeuse excursion",
    12: "Piège à papillons",
    13: "Sympathie",
    14: "Un Pari",
    15: "Pas un pour racheter l'autre",
    16: "Prélude",
    17: "Kyôto, nous voilà !",
    18: "Discorde",
    19: "Le fiston ivre",
    20: "Le traître",
    21: "Bouleversement",
    22: "Ignition",
    23: "Confidence Paternelle",
    "23.1": "Le train fantôme",
    "23.2": "La fugue de Kuro",
    24: "Le sabre abandonné",
    25: "Le Fujô-ô",
    26: "Le feu intérieur",
    27: "La bataille du mont Kongô",
    28: "Feu Ardent",
    29: "L'incantation de la barrière",
    30: "Fatalité",
    31: "L'entrée dans le Nirvâna",
    32: "L'Abîme",
    33: "Dilacération",
    34: "Dénouement",
    35: "L'immensité de l'océan",
    36: "La vague bleue",
    37: "La lune se couche, le soleil se lève",
    38: "Exorciste",
    39: "Règles de bienséance Démoniaque",
    40: "Les Sept mystères de l'Académie de la Croix-Vraie",
    41: "L'antre du secret",
    "41.5" : "Kinzo et son groupe sans concession",
    42: "Un monde grouillant",
    43: "Amitié",
    44: "Les facéties de Méphisto",
    45: "Zombifiés",
    46: "Échecs et Sentiments",
    47: "Le Cross Festival Première partie",
    48: "Le Cross Festival Deuxième partie",
    49: "Le Cross Festival Troisième partie",
    50: "L'être le plus cher",
    51: "Débile",
    52: "Personne sur qui compter",
    53: "La vraie moi",
    54: "Je coupe les ponts",
    55: "Comme des frères",
    56: "Interlude",
    57: "Entrée en matière",
    58: "Développement",
    59: "Conclusion",
    60: "Ensemble",
    61: "Mon trésor",
    62: "Expurgation",
    63: "Au revoir",
    64: "À Bientôt",
    64.5: "Retrouvailles",
    65: "Pink Spider (1)",
    66: "Pink Spider (2)",
    67: "Pink Spider (3)",
    68: "Tous à poil",
    69: "Réunion au sommet",
    70: "Motivation",
    71: "Flash",
    72: "Chacun sa route",
    73: "Is this love ?",
    74: "Hachinohe sous la neige",
    75: "Le serpent du froid",
    76: "Adieux",
    77: "Point de non-retour",
    78: "Les larmes aux yeux",
    79: "Adieu",
    80: "Aomori sous la neige",
    81: "Rhizome",
    82: "Le Jingzhe",
    83: "Bourgeonnement",
    84: "Racines",
    85: "Hétérophyllie",
    86: "L'éveil de la conscience",
    87: "Embryon",
    88: "Joyeux anniv-Noël !",
    89: "Joyeux anniv-Noël - Jour J",
    90: "Les noces Première partie",
    91: "Les noces Deuxième partie",
    92: "Sous la neige (1)",
    93: "Sous la neige (2)",
    94: "Sous la neige (3)",
    95: "Sous la neige (4)",
    96: "Sous la neige (5)",
    97: "Sous la neige (6)",
    98: "Sous la neige (7)",
    99: "Sous la neige (8)",
    100: "SsC00:40",
    101: "SsC04:36",
    102: "SsC05:35",
    103: "SsC11:29",
    104: "SsC20:20",
    105: "SsC21:19",
    106: "SsC23:17A",
    107: "SsC23:17B",
    108: "SsC23:17C",
    109: "SsC23:17D",
    110: "SsC40:00A",
    111: "SsC40:00B",
    112: "SsC40:00C",
    113: "SsC40:00D",
    114: "SsC23:17E",
    115: "SsC23:17F",
    116: "SsC23:17G",
    117: "SsC23:17H",
    118: "SsC23:17I",
    119: "SsC24:16",
    120: "SsC40:00E",
    121: "Face-à-Face - Prélude",
    122: "Face-à-Face - Ignition",
    123: "Face-à-Face - Déchaînement",
    124: "Face-à-Face - Embrasement",
    125: "Face-à-Face - Zizanie",
    126: "Face-à-Face - Rupture",
    127: "Face-à-Face - Fusion",
    128: "Face-à-Face - Éblouissement",
    129: "Face-à-Face - Congratulations",
    130: "Face-à-Face - Flamboiement",
    131: "Face-à-Face - Clarification",
    132: "Face-à-Face - Éruption",
    133: "Face-à-Face - Tourbillon",
    134: "Face-à-Face - Illumination",
    135: "Face-à-Face - Éveil",
    136: "D'un seul tissu - Coupure",
    137: "D'un seul tissu - Affligence",
    138: "D'un seul tissu - Destruction",
    138.5: "Prendre soin de Kuro Chapitre Bonus",
    139: "D'un seul tissu - À partir de maintenant Partie 1",
    140: "D'un seul tissu - À partir de maintenant Partie 2",
    141: "La représentation d'un seul tissu",
    142: "D'un seul tenant - Rassembler et Combattre",
    143: "D'un seul signe",
    144: "D'un seul signe, Partie 2",
    145: "D'un seul signe - Affrontement",
    146: "D'un même tissu - Avoir une audience",
    147: "Le sens incomparable de la vie",
    148: "Une compétence de combat",
    149: "Perdurer",
    150: "Une mort soudaine",
    151: "La mort",
    152: "Partout"
};

// Liste des chapitres avec le chemin du fichier PDF, incluant les chapitres bonus
const chapters = [];

for (let i = 1; i <= 152; i++) {
    if (i === 23) {
        chapters.push({
            number: i,
            title: customTitles[i] || `Ao No Exorcist Chapitre ${i}`,
            filePath: `images/AOE/pdf/Ao No Exorcist Chapitre ${i.toString().padStart(3, '0')}.pdf`
        });
        
        // Ajout des chapitres bonus après le chapitre 23
        chapters.push({
            number: "23.1",
            title: "Le train fantôme",
            filePath: `images/AOE/pdf/Ao No Exorcist Chapitre 023.1.pdf`
        });
        chapters.push({
            number: "23.2",
            title: "La fugue de Kuro",
            filePath: `images/AOE/pdf/Ao No Exorcist Chapitre 023.2.pdf`
        });
    } else if (i === 41) {
        chapters.push({
            number: i,
            title: customTitles[i] || `Ao No Exorcist Chapitre ${i}`,
            filePath: `images/AOE/pdf/Ao No Exorcist Chapitre ${i.toString().padStart(3, '0')}.pdf`
        });
        
        // Ajout du chapitre bonus 41.5
        chapters.push({
            number: "41.5",
            title: "Kinzo et son groupe sans concession",
            filePath: `images/AOE/pdf/Ao No Exorcist Chapitre 041.5.pdf`
        });
        } else if (i === 64) {
        chapters.push({
            number: i,
            title: customTitles[i] || `Ao No Exorcist Chapitre ${i}`,
            filePath: `images/AOE/pdf/Ao No Exorcist Chapitre ${i.toString().padStart(3, '0')}.pdf`
        });
        
        // Ajout du chapitre bonus 41.5
        chapters.push({
            number: "64.5",
            title: "Retrouvailles",
            filePath: `images/AOE/pdf/Ao No Exorcist Chapitre 064.5.pdf`
        });
    } else if (i === 138) {
        chapters.push({
            number: i,
            title: customTitles[i] || `Ao No Exorcist Chapitre ${i}`,
            filePath: `images/AOE/pdf/Ao No Exorcist Chapitre ${i.toString().padStart(3, '0')}.pdf`
        });
        
        // Ajout du chapitre bonus 41.5
        chapters.push({
            number: "138.5",
            title: "Prendre soin de Kuro",
            filePath: `images/AOE/pdf/Ao No Exorcist Chapitre 138.5.pdf`
        });
    } else {
        chapters.push({
            number: i,
            title: customTitles[i] || `Ao No Exorcist Chapitre ${i}`,
            filePath: `images/AOE/pdf/Ao No Exorcist Chapitre ${i.toString().padStart(3, '0')}.pdf`
        });
    }
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
    link.download = `Ao No Exorcist Chapitre ${chapterNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log(`Téléchargement du chapitre ${chapterNumber} depuis ${filePath}`);
}
