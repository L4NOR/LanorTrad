document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('intro').style.display = 'none';
        document.getElementById('main-content').style.opacity = '1';
    }, 3000);
});

function initializeChapterSelect() {
    var selectMenu = document.getElementById("chapter-select");

    // Crée une seule option pour "Chapitre 1"
    var option = document.createElement("option");
    option.value = "01"; // Valeur pour Chapitre 1
    option.text = "Chapitre 1";
    option.dataset.redirect = "https://lanortrad.netlify.app/wild strawberry/Chapitre%201.html";

    // Ajoute l'option au menu
    selectMenu.appendChild(option);

    // Écouteur d'événements pour le changement de sélection
    selectMenu.addEventListener("change", function() {
        var selectedOption = selectMenu.options[selectMenu.selectedIndex];
        if (selectedOption && selectedOption.dataset.redirect) {
            window.location.href = selectedOption.dataset.redirect;
        }
    });

    // Optionnel : sélectionnez automatiquement l'option si c'est le chapitre actuel
    var currentPageItem = getCurrentPageItem();
    if (currentPageItem && currentPageItem.type === 'Chapitre' && currentPageItem.number === 1) {
        option.selected = true;
    }
}

// Fonction pour obtenir l'élément de la page actuelle (si nécessaire)
function getCurrentPageItem() {
    var url = window.location.href;
    var chapterMatch = url.match(/Chapitre%20(\d+)/);
    var tomeMatch = url.match(/Tome%20(\d+)/);

    if (chapterMatch) {
        return { type: 'Chapitre', number: parseInt(chapterMatch[1], 10) };
    } else if (tomeMatch) {
        return { type: 'Tome', number: parseInt(tomeMatch[1], 10) };
    }
    return null;
}


function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        document.getElementById("scrollToTopBtn").style.display = "block";
    } else {
        document.getElementById("scrollToTopBtn").style.display = "none";
    }
}

// Ajoutez ceci à la fin de votre fichier JavaScript
document.addEventListener("DOMContentLoaded", function() {
    initializeChapterSelect();
    window.onscroll = scrollFunction;
});