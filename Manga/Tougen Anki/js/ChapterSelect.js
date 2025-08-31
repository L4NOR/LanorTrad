const totalChapters = 204; // Nombre total de chapitres

// Liste complète des chapitres, avec bonus
const chaptersList = [
    // Chapitres normaux de 1 à 180
    ...Array.from({ length: 180 }, (_, i) => i + 1),

    // Chapitre 181 et ses bonus
    181,
    181.5,
    181.6,

    // Chapitres suivants jusqu'à 196
    ...Array.from({ length: 237 - 181 }, (_, i) => i + 182)
];

// Récupère le chapitre actuel depuis l'URL ou le titre de la page
let currentChapter = window.location.href.match(/Chapitre (\d+\.?\d*)/)?.[1] || 
                     document.title.match(/Chapitre (\d+\.?\d*)/)?.[1] || "1";

currentChapter = parseFloat(currentChapter);

// Trouve l'index du chapitre actuel dans la liste
let currentIndex = chaptersList.findIndex(ch => ch === currentChapter);

function changeChapter(direction) {
    let newIndex = currentIndex + direction;

    if (newIndex < 0) {
        alert("Il n'y a pas de chapitre précédent.");
        return;
    } else if (newIndex >= chaptersList.length) {
        alert("Il n'y a pas de chapitre suivant actuellement.");
        return;
    }

    currentIndex = newIndex;
    const newChapter = chaptersList[currentIndex];

    let chapterString = Number.isInteger(newChapter) ? newChapter : newChapter.toFixed(1);

    window.location.href = `/Manga/Tougen Anki/Chapitre ${chapterString}.html`;
}
