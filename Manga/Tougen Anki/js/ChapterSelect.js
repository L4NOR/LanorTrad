const totalChapters = 191; // Nombre total de chapitres (modifie selon ton besoin)

// Récupère le chapitre actuel depuis l'URL ou le titre de la page
let currentChapter = window.location.href.match(/Chapitre (\d+\.?\d*)/)?.[1] || 
                    document.title.match(/Chapitre (\d+\.?\d*)/)?.[1] || 1;

if (currentChapter.includes('.')) {
    currentChapter = parseFloat(currentChapter);
} else {
    currentChapter = parseInt(currentChapter);
}

function changeChapter(direction) {
    let newChapter;
    
    if (currentChapter === 183 && direction === -1) {
        newChapter = 182.5;
    } else if (currentChapter === 182 && direction === 1) {
        newChapter = 182.5;
    } else if (currentChapter === 182.5 && direction === 1) {
        newChapter = 183;
    } else if (currentChapter === 182.5 && direction === -1) {
        newChapter = 182;
    } else {
        newChapter = currentChapter + direction;
    }

    // Empêche d'aller en dehors des limites de chapitres
    if (newChapter < 1) {
        alert("Il n'y a pas de chapitre précédent.");
        return;
    } else if (newChapter > totalChapters) {
        alert("Il n'y a pas de chapitre suivant actuellement. Prochain chapitre pour le 15 ou 16 Mars !");
        return;
    }

    // Met à jour le chapitre actuel
    currentChapter = newChapter;

    // Formate correctement le numéro de chapitre
    let chapterString = Number.isInteger(currentChapter) ? currentChapter : currentChapter.toFixed(1);

    // Redirige vers la page du chapitre correspondant
    window.location.href = `/Manga/Tougen Anki/Chapitre ${chapterString}.html`;
}
