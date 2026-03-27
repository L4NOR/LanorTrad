const CONFIG = {
    maxChapters: 230,
    currentManga: "Tougen Anki",
    chapterPrefix: "Chapitre",
    baseDate: new Date(2025, 0, 1)
};

// Bonus chapters definition
const bonusChapters = [
    { number: 181.5},
    { number: 181.6}
].map(ch => ({
    ...ch,
    date: CONFIG.baseDate,
    link: `${CONFIG.currentManga}/${CONFIG.chapterPrefix} ${ch.number}.html`
}));

// Generate regular chapters
const regularChapters = Array.from({ length: CONFIG.maxChapters }, (_, index) => {
    const number = CONFIG.maxChapters - index;
    return {
        number,
        date: CONFIG.baseDate,
        link: `${CONFIG.currentManga}/${CONFIG.chapterPrefix} ${number}.html`
    };
});

// Combine and sort all chapters
const chapters = [...regularChapters, ...bonusChapters].sort((a, b) => b.number - a.number);

let displayCount = 5;

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
            if (chapter >= 1 && chapter <= CONFIG.maxChapters) {
                return chapter;
            }
        }
    }
    return 1;
}

function findMangaKey(obj, mangaName) {
    if (obj[mangaName]) return mangaName;
    const lower = mangaName.toLowerCase();
    return Object.keys(obj).find(k => k.toLowerCase() === lower) || mangaName;
}

function isChapterRead(chapterNumber) {
    try {
        const readChapters = JSON.parse(localStorage.getItem('lanortrad_read_chapters') || '{}');
        const key = findMangaKey(readChapters, CONFIG.currentManga);
        if (readChapters[key] && readChapters[key].includes(String(chapterNumber))) {
            return true;
        }
        const history = JSON.parse(localStorage.getItem('lanortrad_history') || '[]');
        const lower = CONFIG.currentManga.toLowerCase();
        return history.some(h => h.mangaId.toLowerCase() === lower && String(h.chapter) === String(chapterNumber));
    } catch (e) { return false; }
}

function getReadChaptersCount() {
    try {
        const readChapters = JSON.parse(localStorage.getItem('lanortrad_read_chapters') || '{}');
        const key = findMangaKey(readChapters, CONFIG.currentManga);
        return (readChapters[key] || []).length;
    } catch (e) { return 0; }
}

function getLastReadChapter() {
    try {
        const history = JSON.parse(localStorage.getItem('lanortrad_history') || '[]');
        const lower = CONFIG.currentManga.toLowerCase();
        const mangaHistory = history.filter(h => h.mangaId.toLowerCase() === lower && h.chapter !== 'oneshot');
        return mangaHistory.length > 0 ? mangaHistory[0] : null;
    } catch (e) { return null; }
}

function createChapterHTML(chapter) {
    const read = isChapterRead(chapter.number);
    return `
        <div class="card rounded-xl p-4 flex items-center justify-between${read ? ' border-green-500/20 bg-green-500/5' : ''}">
            <div class="flex items-center gap-3">
                ${read ? '<span class="text-green-400 text-sm" title="Lu">&#10003;</span>' : '<span class="text-gray-600 text-sm">&#9679;</span>'}
                <h3 class="text-lg font-medium${read ? ' text-gray-400' : ''}">${CONFIG.chapterPrefix} ${chapter.number}</h3>
                ${read ? '<span class="text-xs text-green-400/60 ml-1">Lu</span>' : ''}
            </div>
            <div class="flex gap-4">
                <a href="${chapter.link}" class="px-4 py-2 rounded-lg ${read ? 'bg-gray-700 hover:bg-gray-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white text-sm font-medium transition-colors">
                    ${read ? 'Relire' : 'Lire'}
                </a>
            </div>
        </div>
    `;
}

function showResumeReading() {
    const lastRead = getLastReadChapter();
    if (!lastRead) return;

    const readCount = getReadChaptersCount();
    const totalChapters = CONFIG.maxChapters;
    const progressPercent = Math.round((readCount / totalChapters) * 100);

    const container = document.querySelector('#chapters-container');
    if (!container) return;

    const resumeHTML = `
        <div class="card rounded-xl p-5 mb-6 border-indigo-500/30 bg-indigo-500/5">
            <div class="flex items-center justify-between mb-3">
                <div>
                    <h3 class="text-lg font-bold text-white flex items-center gap-2">
                        <span class="text-indigo-400">&#9654;</span> Reprendre la lecture
                    </h3>
                    <p class="text-sm text-gray-400 mt-1">Dernier chapitre lu : <span class="text-indigo-400">Chapitre ${lastRead.chapter}</span></p>
                </div>
                <a href="${CONFIG.currentManga}/${CONFIG.chapterPrefix} ${lastRead.chapter}.html" class="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors">
                    Reprendre &rarr;
                </a>
            </div>
            <div class="flex items-center gap-3">
                <div class="flex-1 bg-gray-800 rounded-full h-2">
                    <div class="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all" style="width: ${progressPercent}%"></div>
                </div>
                <span class="text-xs text-gray-400 whitespace-nowrap">${readCount}/${totalChapters} chapitres (${progressPercent}%)</span>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforebegin', resumeHTML);
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

// ✅ CORRECTION : Utiliser un chemin relatif au lieu d'absolu
function navigateToChapter(chapterNumber) {
    const newUrl = `${CONFIG.chapterPrefix} ${chapterNumber}.html`;
    window.location.href = newUrl;
}

function changeChapter(delta) {
    const currentChapter = getCurrentChapterFromURL();
    const sortedChapters = [...regularChapters, ...bonusChapters]
        .sort((a, b) => a.number - b.number)
        .map(ch => ch.number);
    
    const currentIndex = sortedChapters.indexOf(currentChapter);
    if (currentIndex === -1) return;
    
    const newIndex = currentIndex + delta;
    if (newIndex >= 0 && newIndex < sortedChapters.length) {
        navigateToChapter(sortedChapters[newIndex]);
    }
}

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

// Tracker la lecture du chapitre
function trackChapterReading() {
    if (!window.readingAnalytics) return;
    
    const currentChapter = getCurrentChapterFromURL();
    const mangaId = CONFIG.currentManga;
    
    // Temps de lecture estimé : 5 minutes par chapitre
    const readingTime = 5;
    
    // Tracker uniquement si pas déjà tracké dans cette session
    const sessionKey = `tracked_${mangaId}_${currentChapter}`;
    if (!sessionStorage.getItem(sessionKey)) {
        window.readingAnalytics.trackChapterRead(mangaId, currentChapter, readingTime);
        sessionStorage.setItem(sessionKey, 'true');
        console.log(`📊 Chapitre ${currentChapter} de ${mangaId} tracké`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeChapterSelect();
    displayChapters();
    showResumeReading();

    // Appeler apr\u00e8s un court d\u00e9lai pour s'assurer que l'utilisateur lit vraiment
    setTimeout(trackChapterReading, 3000);
});