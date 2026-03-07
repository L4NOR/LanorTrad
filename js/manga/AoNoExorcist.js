const CONFIG = {
    maxChapters: 166,
    currentManga: "Ao No Exorcist",
    chapterPrefix: "Chapitre"
};

// Bonus chapters definition
const bonusChapters = [
    { number: 138.5 }, { number: 64.5 }, { number: 41.5 },
    { number: 23.5 }, { number: 23.6 }
].map(ch => ({
    ...ch,
    link: `${CONFIG.currentManga}/${CONFIG.chapterPrefix} ${ch.number}.html`
}));

// Generate regular chapters
const regularChapters = Array.from({ length: CONFIG.maxChapters }, (_, index) => {
    const number = CONFIG.maxChapters - index;
    return {
        number,
        link: `${CONFIG.currentManga}/${CONFIG.chapterPrefix} ${number}.html`
    };
});

// Combine and sort all chapters
const chapters = [...regularChapters, ...bonusChapters].sort((a, b) => b.number - a.number);

let displayCount = 5;

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function formatDate(date) {
    return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
}

/**
 * Récupère le numéro de chapitre depuis l'URL
 * Supporte les chapitres réguliers ET bonus (avec décimales)
 */
function getCurrentChapterFromURL() {
    const path = decodeURIComponent(window.location.pathname);
    const patterns = [
        /chapitre[^\d]*(\d+\.?\d*)/i,
        /chapitre%20(\d+\.?\d*)/i,
        /chapitre_(\d+\.?\d*)/i,
        /[\\/](\d+\.?\d*)\.html?$/i
    ];

    for (const pattern of patterns) {
        const match = path.match(pattern);
        if (match && match[1]) {
            const chapter = parseFloat(match[1]);
            
            // Vérifier si le chapitre existe dans notre liste
            const allChapters = [...regularChapters, ...bonusChapters];
            const exists = allChapters.some(ch => ch.number === chapter);
            
            if (exists || (chapter >= 1 && chapter <= CONFIG.maxChapters)) {
                return chapter;
            }
        }
    }
    return 1;
}

// ============================================
// NAVIGATION DES CHAPITRES - VERSION CORRIGÉE
// ============================================

/**
 * Change de chapitre (suivant/précédent)
 * @param {number} delta - Direction: 1 pour suivant, -1 pour précédent
 */
window.changeChapter = function(delta) {
    console.log('🔄 Changement de chapitre demandé:', delta > 0 ? 'Suivant' : 'Précédent');
    
    // Récupérer le chapitre actuel
    const currentChapter = getCurrentChapterFromURL();
    console.log('📖 Chapitre actuel:', currentChapter);
    
    // Récupérer tous les chapitres (réguliers + bonus)
    const allChapters = [...regularChapters, ...bonusChapters];
    
    // Trier par ordre croissant
    const sortedChapters = allChapters
        .sort((a, b) => a.number - b.number)
        .map(ch => ch.number);
    
    console.log('📚 Total chapitres disponibles:', sortedChapters.length);
    
    // Trouver l'index du chapitre actuel
    const currentIndex = sortedChapters.indexOf(currentChapter);
    console.log('📍 Position actuelle:', currentIndex + 1, '/', sortedChapters.length);
    
    if (currentIndex === -1) {
        console.error('❌ Chapitre actuel introuvable:', currentChapter);
        alert('Erreur: Impossible de déterminer le chapitre actuel.');
        return;
    }
    
    // Calculer le nouvel index
    const newIndex = currentIndex + delta;
    console.log('🎯 Nouvelle position:', newIndex + 1, '/', sortedChapters.length);
    
    // Vérifier les limites
    if (newIndex < 0) {
        console.log('⚠️ Début de la série atteint');
        alert("Il n'y a pas de chapitre précédent.");
        return;
    }
    
    if (newIndex >= sortedChapters.length) {
        console.log('⚠️ Fin de la série atteinte');
        alert("Il n'y a pas de chapitre suivant actuellement. Prochain chapitre bientôt !");
        return;
    }
    
    // Récupérer le nouveau numéro de chapitre
    const newChapterNumber = sortedChapters[newIndex];
    console.log('✅ Navigation vers le chapitre:', newChapterNumber);
    
    // Construire la nouvelle URL
    const currentPath = window.location.pathname;
    const lastSlashIndex = currentPath.lastIndexOf('/');
    const basePath = currentPath.substring(0, lastSlashIndex + 1);
    
    // Formater le numéro (garder les décimales si c'est un bonus)
    const formattedChapter = Number.isInteger(newChapterNumber) 
        ? newChapterNumber 
        : newChapterNumber.toFixed(1);
    
    const newUrl = `${CONFIG.chapterPrefix} ${formattedChapter}.html`;
    console.log('🔗 Nouvelle URL:', newUrl);
    
    // Arrêter le tracking avant de naviguer
    if (window.readingAnalytics && typeof window.readingAnalytics.endReading === 'function') {
        console.log('📊 Arrêt du tracking');
        window.readingAnalytics.endReading();
    }
    
    // Naviguer vers le nouveau chapitre
    window.location.href = newUrl;
};

// ============================================
// AFFICHAGE DES CHAPITRES
// ============================================

function isChapterRead(chapterNumber) {
    try {
        const history = JSON.parse(localStorage.getItem('lanortrad_history') || '[]');
        return history.some(h => h.mangaId === CONFIG.currentManga && String(h.chapter) === String(chapterNumber));
    } catch (e) { return false; }
}

function createChapterHTML(chapter) {
    const read = isChapterRead(chapter.number);
    return `
        <div class="card rounded-xl p-4 flex items-center justify-between${read ? ' border-indigo-500/30' : ''}">
            <div class="flex items-center gap-3">
                ${read ? '<span class="text-green-400 text-sm" title="Lu">&#10003;</span>' : '<span class="text-gray-600 text-sm">&#9679;</span>'}
                <h3 class="text-lg font-medium${read ? ' text-gray-400' : ''}">${CONFIG.chapterPrefix} ${chapter.number}</h3>
            </div>
            <div class="flex gap-4">
                <a href="${chapter.link}" class="px-4 py-2 rounded-lg ${read ? 'bg-gray-700 hover:bg-gray-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white text-sm font-medium transition-colors">
                    ${read ? 'Relire' : 'Lire'}
                </a>
            </div>
        </div>
    `;
}

function displayChapters() {
    const container = document.querySelector('#chapters-container');
    if (!container) return;
    
    const chaptersToShow = chapters.slice(0, displayCount);
    container.innerHTML = chaptersToShow.map(chapter => createChapterHTML(chapter)).join('');
    
    const loadMoreButton = document.querySelector('#load-more');
    if (loadMoreButton) {
        loadMoreButton.style.display = displayCount >= chapters.length ? 'none' : 'block';
    }
}

function loadMore() {
    displayCount += 500;
    displayChapters();
}

// ============================================
// SÉLECTEUR DE CHAPITRES
// ============================================

function initializeChapterSelect() {
    const select = document.getElementById('chapterSelect');
    if (!select) return;

    select.innerHTML = '';
    const currentChapter = getCurrentChapterFromURL();

    [...regularChapters, ...bonusChapters].sort((a, b) => a.number - b.number)
        .forEach(chapter => {
            const option = document.createElement('option');
            option.value = chapter.number;
            option.textContent = `${CONFIG.chapterPrefix} ${chapter.number}`;
            option.selected = currentChapter === chapter.number;
            select.appendChild(option);
        });

    select.addEventListener('change', e => navigateToChapter(e.target.value));
}

function navigateToChapter(chapterNumber) {
    const newUrl = `${CONFIG.chapterPrefix} ${chapterNumber}.html`;
    window.location.href = newUrl;
}

// ============================================
// TÉLÉCHARGEMENT DE CHAPITRE
// ============================================

async function downloadChapter() {
    const currentChapter = getCurrentChapterFromURL();
    const zip = new JSZip();
    const imgFolder = zip.folder(`${CONFIG.currentManga} ${CONFIG.chapterPrefix} ${currentChapter}`);
    const importantFolder = imgFolder.folder("IMPORTANT");
    const imgUrls = getCurrentChapterImages();
    
    if (imgUrls.length === 0) {
        alert('Aucune image trouvée dans ce chapitre.');
        return;
    }

    const importantText = `Règles de publication des chapitres :
    
1. Aucune republication autorisée sans permission explicite de notre part.
2. Si vous souhaitez partager nos traductions, vous devez retirer tous les éléments textuels.
3. Si vous reprenez les pages avec les éléments textuels, il vous est demandé de créditer à la team LanorTrad.
Tout manquement à ces règles entraînera des sanctions.

LanorTrad`;

    try {
        const downloadStatus = document.createElement('div');
        downloadStatus.className = 'fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50';
        downloadStatus.style.cssText = `opacity: 0; transition: opacity 0.3s ease-in-out;`;
        downloadStatus.innerHTML = `
            <div class="bg-gray-900 text-white p-6 rounded-lg shadow-xl text-center" 
                 style="transform: translateY(-20px); transition: transform 0.3s ease-out;">
                <p class="text-lg">Téléchargement en cours...</p>
                <div id="progress" class="mt-4">
                    <div class="w-full bg-gray-700 rounded-full">
                        <div id="progressBar" class="bg-green-500 h-2 rounded-full transition-all duration-300 ease-out" style="width: 0%"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(downloadStatus);
        
        requestAnimationFrame(() => {
            downloadStatus.style.opacity = '1';
            downloadStatus.querySelector('.bg-gray-900').style.transform = 'translateY(0)';
        });

        importantFolder.file("IMPORTANT.txt", importantText);

        const downloadPromises = imgUrls.map(async (url, i) => {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Erreur lors du téléchargement de l'image ${i + 1}`);
                const blob = await response.blob();
                
                const extension = blob.type === 'image/png' || url.toLowerCase().endsWith('.png') ? 'png' : 'jpg';
                const filename = `${String(i + 1).padStart(3, '0')}.${extension}`;
                imgFolder.file(filename, blob);
                
                const progress = Math.round(((i + 1) / imgUrls.length) * 100);
                const progressBar = document.getElementById('progressBar');
                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                }
            } catch (error) {
                console.error(`Erreur pour l'image ${i + 1}:`, error);
                throw error;
            }
        });

        await Promise.all(downloadPromises);
        
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `${CONFIG.currentManga} ${CONFIG.chapterPrefix} ${currentChapter}.zip`);

        const messageBox = downloadStatus.querySelector('.bg-gray-900');
        messageBox.innerHTML = `
            <p class="text-lg" style="opacity: 0; transform: translateY(-10px); transition: all 0.3s ease-out">
                Téléchargement terminé !
            </p>
        `;
        
        requestAnimationFrame(() => {
            const successText = messageBox.querySelector('p');
            successText.style.opacity = '1';
            successText.style.transform = 'translateY(0)';
        });

        setTimeout(() => {
            messageBox.style.transform = 'translateY(20px)';
            downloadStatus.style.opacity = '0';
            
            setTimeout(() => {
                if (downloadStatus.parentNode) {
                    downloadStatus.parentNode.removeChild(downloadStatus);
                }
            }, 300);
        }, 1500);
        
    } catch (error) {
        console.error('Erreur de téléchargement:', error);
        alert('Une erreur est survenue lors du téléchargement du chapitre.');
        if (document.querySelector('.fixed')) {
            document.querySelector('.fixed').remove();
        }
    }
}

function getCurrentChapterImages() {
    const container = document.getElementById('readerContainer');
    if (!container) return [];
    
    const images = Array.from(container.getElementsByTagName('img'));
    return images
        .filter(img => {
            const src = img.src.toLowerCase();
            return src.endsWith('.jpg') || src.endsWith('.jpeg');
        })
        .map(img => img.src);
}

// ============================================
// TRACKING DE LECTURE
// ============================================

function trackChapterReading() {
    if (!window.readingAnalytics) return;
    
    const currentChapter = getCurrentChapterFromURL();
    const mangaId = CONFIG.currentManga;
    const readingTime = 5;
    
    const sessionKey = `tracked_${mangaId}_${currentChapter}`;
    if (!sessionStorage.getItem(sessionKey)) {
        window.readingAnalytics.trackChapterRead(mangaId, currentChapter, readingTime);
        sessionStorage.setItem(sessionKey, 'true');
        console.log(`📊 Chapitre ${currentChapter} de ${mangaId} tracké`);
    }
}

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Initialisation du manga:', CONFIG.currentManga);
    console.log('📖 Chapitre actuel:', getCurrentChapterFromURL());
    console.log('📚 Total chapitres disponibles:', chapters.length);
    
    initializeChapterSelect();
    displayChapters();
    
    // Tracker après 3 secondes
    setTimeout(trackChapterReading, 3000);
    
    // Vérifier que changeChapter est disponible
    if (typeof window.changeChapter === 'function') {
        console.log('✅ Navigation des chapitres opérationnelle');
    } else {
        console.error('❌ Fonction changeChapter non disponible !');
    }
});
