const CONFIG = {
    maxChapters: 22,
    currentManga: "Catenaccio",
    chapterPrefix: "Chapitre"
};

// Generate regular chapters
const chapters = Array.from({ length: CONFIG.maxChapters }, (_, index) => {
    const number = CONFIG.maxChapters - index;
    return {
        number,
        link: `${CONFIG.currentManga}/${CONFIG.chapterPrefix} ${number}.html`
    };
});

let displayCount = 5;

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

function createChapterHTML(chapter) {
    return `
        <div class="card rounded-xl p-4 flex items-center justify-between">
            <div>
                <h3 class="text-lg font-medium">${CONFIG.chapterPrefix} ${chapter.number}</h3>
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

function initializeChapterSelect() {
    const select = document.getElementById('chapterSelect');
    if (!select) return;

    select.innerHTML = '';
    const currentChapter = getCurrentChapterFromURL();

    chapters.sort((a, b) => a.number - b.number)
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
    const currentPath = window.location.pathname;
    const lastSlashIndex = currentPath.lastIndexOf('/');
    const basePath = currentPath.substring(0, lastSlashIndex + 1);
    const newUrl = `${basePath}${CONFIG.chapterPrefix} ${chapterNumber}.html`;
    window.location.href = newUrl;
}

function changeChapter(delta) {
    const currentChapter = getCurrentChapterFromURL();
    const sortedChapters = chapters
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
    // Vérifier si JSZip est disponible
    if (typeof JSZip === 'undefined') {
        console.error('JSZip n\'est pas chargé');
        alert('Erreur: JSZip n\'est pas chargé. Veuillez vérifier que la bibliothèque est bien incluse.');
        return;
    }

    const currentChapter = getCurrentChapterFromURL();
    const zip = new JSZip();
    const imgFolder = zip.folder(`${CONFIG.currentManga} ${CONFIG.chapterPrefix} ${currentChapter}`);
    const importantFolder = imgFolder.folder("IMPORTANT");
    const imgUrls = getCurrentChapterImages();
    
    // Vérification plus détaillée des images
    console.log('Images trouvées:', imgUrls);
    
    if (imgUrls.length === 0) {
        alert('Aucune image trouvée dans ce chapitre. Vérifiez que les images sont bien chargées.');
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

        for (let i = 0; i < imgUrls.length; i++) {
            try {
                const url = imgUrls[i];
                console.log(`Téléchargement de l'image ${i + 1}:`, url);
                
                const response = await fetch(url, {
                    mode: 'cors',
                    credentials: 'same-origin',
                    headers: {
                        'Accept': 'image/jpeg,image/png,image/*'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const blob = await response.blob();
                const extension = blob.type.includes('png') ? 'png' : 'jpg';
                const filename = `${String(i + 1).padStart(3, '0')}.${extension}`;
                
                imgFolder.file(filename, blob);
                
                const progress = Math.round(((i + 1) / imgUrls.length) * 100);
                const progressBar = document.getElementById('progressBar');
                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                }
            } catch (error) {
                console.error(`Erreur pour l'image ${i + 1}:`, error);
            }
        }

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
        console.error('Erreur détaillée:', error);
        alert(`Erreur lors du téléchargement: ${error.message}`);
        if (document.querySelector('.fixed')) {
            document.querySelector('.fixed').remove();
        }
    }
}

function getCurrentChapterImages() {
    const container = document.getElementById('readerContainer');
    if (!container) {
        console.error('Container de lecture non trouvé');
        return [];
    }
    
    const images = Array.from(container.getElementsByTagName('img'));
    const filteredImages = images.filter(img => {
        const src = img.src.toLowerCase();
        // Élargi les types d'images acceptés
        return src.endsWith('.jpg') || 
               src.endsWith('.jpeg') || 
               src.endsWith('.png') ||
               img.src.startsWith('data:image/');
    });

    console.log('Images détectées:', filteredImages.length);
    return filteredImages.map(img => img.src);
}

document.addEventListener('DOMContentLoaded', () => {
    initializeChapterSelect();
    displayChapters();
});