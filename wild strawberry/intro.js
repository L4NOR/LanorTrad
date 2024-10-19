document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('intro').style.display = 'none';
        document.getElementById('main-content').style.opacity = '1';
    }, 3000);
});

function initializeChapterSelect() {
    var selectMenu = document.getElementById("chapter-select");

    // Crée une option pour "Chapitre 1"
    var option1 = document.createElement("option");
    option1.value = "01"; // Valeur pour Chapitre 1
    option1.text = "Chapitre 1";
    option1.dataset.redirect = "https://lanortrad.netlify.app/wild strawberry/Chapitre%201.html";
    selectMenu.appendChild(option1);

    // Crée une option pour "Chapitre 2"
    var option2 = document.createElement("option");
    option2.value = "02"; // Valeur pour Chapitre 2
    option2.text = "Chapitre 2";
    option2.dataset.redirect = "https://lanortrad.netlify.app/wild strawberry/Chapitre%202.html";
    selectMenu.appendChild(option2);

    // Écouteur d'événements pour le changement de sélection
    selectMenu.addEventListener("change", function() {
        var selectedOption = selectMenu.options[selectMenu.selectedIndex];
        if (selectedOption && selectedOption.dataset.redirect) {
            window.location.href = selectedOption.dataset.redirect;
        }
    });

    // Optionnel : sélectionnez automatiquement l'option si c'est le chapitre actuel
    var currentPageItem = getCurrentPageItem();
    if (currentPageItem && currentPageItem.type === 'Chapitre') {
        if (currentPageItem.number === 1) {
            option1.selected = true;
        } else if (currentPageItem.number === 2) {
            option2.selected = true;
        }
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

var meta = document.createElement('meta');
meta.name = "google-site-verification";
meta.content = "eImJAYI9qcdg0xDVXhoI6EWU97AaJQgT0-S9vOgLXFs";
document.getElementsByTagName('head')[0].appendChild(meta);
