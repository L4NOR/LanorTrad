// Configuration globale
const CONFIG = {
    maxChapters: 16,
    currentManga: "Satsudou",
    chapterPrefix: "Chapitre",
    baseDate: new Date(2025, 0, 1) // 1er janvier 2025
};

// Générer les chapitres
const chapters = Array.from({ length: CONFIG.maxChapters }, (_, index) => {
    const number = CONFIG.maxChapters - index;
    return {
        number,
        date: CONFIG.baseDate,
        link: `${CONFIG.currentManga}/${CONFIG.chapterPrefix} ${number}.html`
    };
});

// Variables globales
let displayCount = 5;

// Fonctions utilitaires
function formatDate(date) {
    return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
}

function getCurrentChapterFromURL() {
    const path = decodeURIComponent(window.location.pathname);
    
    // Essayer plusieurs formats possibles
    const patterns = [
        /chapitre[^\d]*(\d+)/i,     // Format "Chapitre 3"
        /chapitre%20(\d+)/i,        // Format "Chapitre%203"
        /chapitre_(\d+)/i,          // Format "Chapitre_3"
        /[\\/](\d+)\.html?$/i       // Format "/3.html"
    ];

    for (const pattern of patterns) {
        const match = path.match(pattern);
        if (match && match[1]) {
            const chapter = parseInt(match[1]);
            if (chapter >= 1 && chapter <= CONFIG.maxChapters) {
                return chapter;
            }
        }
    }

    // Si aucun numéro de chapitre n'est trouvé, afficher dans la console pour le débogage
    console.log('Chemin actuel:', path);
    return 1; // Chapitre par défaut
}

// Fonctions de gestion des chapitres
function createChapterHTML(chapter) {
    return `
        <div class="card rounded-xl p-4 flex items-center justify-between">
            <div>
                <h3 class="text-lg font-medium">${CONFIG.chapterPrefix} ${chapter.number}</h3>
                <p class="text-gray-400 text-sm">Ajouté le ${formatDate(chapter.date)}</p>
            </div>
            <div class="flex gap-4">
                <a href="${chapter.link}" class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
                    Lire
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

// Fonctions du sélecteur de chapitres
function initializeChapterSelect() {
    const select = document.getElementById('chapterSelect');
    if (!select) return;

    select.innerHTML = '';
    const currentChapter = getCurrentChapterFromURL();

    for (let i = 1; i <= CONFIG.maxChapters; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${CONFIG.chapterPrefix} ${i}`;
        option.selected = currentChapter === i;
        select.appendChild(option);
    }

    select.addEventListener('change', function(e) {
        navigateToChapter(e.target.value);
    });
}

function navigateToChapter(chapterNumber) {
    const currentPath = window.location.pathname;
    const lastSlashIndex = currentPath.lastIndexOf('/');
    const basePath = currentPath.substring(0, lastSlashIndex + 1);
    const newUrl = `${basePath}${CONFIG.chapterPrefix} ${chapterNumber}.html`;
    window.location.href = newUrl;
}

function changeChapter(delta) {
    const currentChapter = getCurrentChapterFromURL();
    const newChapter = currentChapter + delta;

    if (newChapter >= 1 && newChapter <= CONFIG.maxChapters) {
        navigateToChapter(newChapter);
    }
}

// Fonctions de téléchargement
function getImageCount() {
    const container = document.getElementById('readerContainer');
    const images = container ? Array.from(container.getElementsByTagName('img')) : [];
    return images.filter(img => {
        const src = img.src.toLowerCase();
        return src.endsWith('.jpg') || src.endsWith('.jpeg');
    }).length;
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

async function downloadChapter() {
    const currentChapter = getCurrentChapterFromURL();
    const mangaName = document.title.split('-')[0].trim();
    
    const zip = new JSZip();
    const imgFolder = zip.folder(`${mangaName} ${CONFIG.chapterPrefix} ${currentChapter}`);
    const importantFolder = imgFolder.folder("IMPORTANT");
    const imgUrls = getCurrentChapterImages();
    
    if (imgUrls.length === 0) {
        alert('Aucune image trouvée dans ce chapitre.');
        return;
    }

    try {
        const downloadStatus = document.createElement('div');
        downloadStatus.className = 'fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50';
        downloadStatus.style.cssText = `
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
        `;
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

        // Contenu du fichier IMPORTANT.txt
        const importantText = `Règles de publication des chapitres :
        
1. Aucune republication autorisée sans permission explicite de notre part.
2. Si vous souhaitez partager nos traductions, vous devez retirer tous les éléments textuels (phrases dans les bulles, textes des pages, etc.).
3. Si vous reprenez les pages avec les éléments textuels, il vous est demandé de créditer à la team LanorTrad de manière claire et visible.
Tout manquement à ces règles entraînera des sanctions. Merci de respecter notre travail et de soutenir la communauté de scantrad.

LanorTrad`;

        importantFolder.file("IMPORTANT.txt", importantText);

        const downloadPromises = imgUrls.map(async (url, i) => {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Erreur lors du téléchargement de l'image ${i + 1}`);
                const blob = await response.blob();
                
                let extension = 'jpg';
                if (blob.type === 'image/png' || url.toLowerCase().endsWith('.png')) {
                    extension = 'png';
                }
                
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
        saveAs(content, `${mangaName} ${CONFIG.chapterPrefix} ${currentChapter}.zip`);

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

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initializeChapterSelect();
    displayChapters();
});