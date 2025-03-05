const totalChapters = 17; // Nombre total de chapitres (modifie selon ton besoin)

// Récupère le chapitre actuel depuis l'URL ou le titre de la page
let currentChapter = parseInt(window.location.href.match(/Chapitre (\d+)/)?.[1]) || 
                    parseInt(document.title.match(/Chapitre (\d+)/)?.[1]) || 1;

function changeChapter(direction) {
    let newChapter = currentChapter + direction;

    // Empêche d'aller en dehors des limites de chapitres
    if (newChapter < 1) {
        alert("Il n'y a pas de chapitre précédent.");
        return;
    } else if (newChapter > totalChapters) {
        alert("Il n'y a pas de chapitre suivant actuellement. Prochain chapitre pour le 12 Mars !");
        return;
    }

    // Met à jour le chapitre actuel
    currentChapter = newChapter;

    // Redirige vers la page du chapitre correspondant
    window.location.href = `/Manga/Satsudou/Chapitre ${currentChapter}.html`;
}
