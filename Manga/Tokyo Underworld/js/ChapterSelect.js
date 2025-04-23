// Mettre à jour le nombre total de chapitres pour inclure les décimaux
const totalChapters = 34; // Nombre total de chapitres

// Récupérer le chapitre actuel depuis l'URL ou le titre de la page en supportant les décimaux
let currentChapter = parseFloat(window.location.href.match(/Chapitre (\d+\.?\d*)/)?.[1]) || 
                    parseFloat(document.title.match(/Chapitre (\d+\.?\d*)/)?.[1]) || 1;

function changeChapter(direction) {
    // Définir les chapitres disponibles dans un tableau pour gérer les numéros décimaux
    const availableChapters = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 
        11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 
        21, 22, 23, 24, 24.5, 25, 26, 26.5, 27, 28, 29, 29.5,
        30, 31, 32, 32.5, 33, 34
    ];
    
    // Trouver l'index du chapitre actuel
    const currentIndex = availableChapters.indexOf(currentChapter);
    
    if (currentIndex === -1) {
        console.error("Chapitre actuel non trouvé dans la liste des chapitres disponibles");
        return;
    }
    
    // Calculer le nouvel index
    const newIndex = currentIndex + direction;
    
    // Vérifier les limites
    if (newIndex < 0) {
        alert("Il n'y a pas de chapitre précédent.");
        return;
    } else if (newIndex >= availableChapters.length) {
        alert("Il n'y a pas de chapitre suivant actuellement. Prochain chapitre pour le 21 Mars !");
        return;
    }
    
    // Obtenir le nouveau numéro de chapitre
    const newChapter = availableChapters[newIndex];
    
    // Rediriger vers la page du chapitre correspondant
    window.location.href = `/Manga/Tokyo Underworld/Chapitre ${newChapter}.html`;
}