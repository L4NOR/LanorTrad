const totalChapters = 18; // Nombre total de chapitres

// Liste complète des chapitres disponibles pour Satsudou
const chaptersList = Array.from({ length: 18 }, (_, i) => i + 1);

// ===== TRACKING AUTOMATIQUE =====
/**
 * Extrait le nom du manga et le numéro du chapitre depuis l'URL
 * Exemple: "/Manga/Satsudou/Chapitre 1.html" → { mangaId: "Satsudou", chapterId: "chapitre-1" }
 */
function extractChapterInfo() {
    const url = window.location.href;
    
    // Extraire le manga depuis l'URL: /Manga/NomDuManga/Chapitre X.html
    const mangaMatch = url.match(/\/Manga\/([^/]+)\//);
    const mangaId = mangaMatch ? decodeURIComponent(mangaMatch[1]) : null;
    
    // Extraire le chapitre depuis l'URL ou le titre de la page
    let chapterNumber = url.match(/Chapitre (\d+)/)?.[1] || 
                        document.title.match(/Chapitre (\d+)/)?.[1] || 
                        "1";
    
    chapterNumber = parseInt(chapterNumber);
    
    // Formater le chapterId pour analytics
    const chapterId = `chapitre-${chapterNumber}`;
    
    return { mangaId, chapterId, chapterNumber };
}

/**
 * Initialise le tracking automatiquement au chargement de la page
 */
function initializeTracking() {
    // Vérifier que analytics.js est chargé
    if (!window.readingAnalytics) {
        console.warn('⚠️ Analytics non disponible - vérifiez que analytics.js est chargé');
        return;
    }
    
    const { mangaId, chapterId, chapterNumber } = extractChapterInfo();
    
    if (!mangaId) {
        console.warn('⚠️ Impossible de détecter le manga depuis l\'URL');
        return;
    }
    
    console.log(`📊 Tracking démarré: ${mangaId} - Chapitre ${chapterNumber}`);
    
    // Démarrer le tracking
    window.readingAnalytics.startReading(mangaId, chapterId);
    
    // Arrêter le tracking quand l'utilisateur quitte la page
    window.addEventListener('beforeunload', function() {
        console.log('📊 Tracking arrêté');
        window.readingAnalytics.endReading();
    });
    
    // Arrêter le tracking quand on change de chapitre
    window.addEventListener('pagehide', function() {
        window.readingAnalytics.endReading();
    });
}

// Lancer le tracking dès que la page est chargée
document.addEventListener('DOMContentLoaded', initializeTracking);

// ===== NAVIGATION CHAPITRES =====

// Récupère le chapitre actuel
let currentChapter = extractChapterInfo().chapterNumber;

// Trouve l'index du chapitre actuel dans la liste
let currentIndex = chaptersList.findIndex(ch => ch === currentChapter);

function changeChapter(direction) {
    // Arrêter le tracking avant de changer de page
    if (window.readingAnalytics) {
        window.readingAnalytics.endReading();
    }
    
    let newIndex = currentIndex + direction;
    
    // Vérifier les limites
    if (newIndex < 0) {
        alert("Il n'y a pas de chapitre précédent.");
        return;
    } else if (newIndex >= chaptersList.length) {
        alert("Il n'y a pas de chapitre suivant actuellement. Prochain chapitre pour le 12 Mars !");
        return;
    }
    
    currentIndex = newIndex;
    const newChapter = chaptersList[currentIndex];
    
    // Récupérer le manga depuis l'URL pour construire le bon lien
    const { mangaId } = extractChapterInfo();
    
    // Rediriger vers la page du chapitre correspondant
    window.location.href = `/Manga/${mangaId}/Chapitre ${newChapter}.html`;
}