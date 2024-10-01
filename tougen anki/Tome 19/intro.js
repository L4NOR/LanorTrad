document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('intro').style.display = 'none';
        document.getElementById('main-content').style.opacity = '1';
    }, 3000);
});

function initializeChapterSelect() { 
    var selectMenu = document.getElementById("chapter-select");

    // Fonction pour obtenir le chapitre ou tome actuel à partir de l'URL
    function getCurrentPageItem() {
        var url = window.location.href;
        var chapterMatch = url.match(/Chapitre%20(\d+)/); // Match l'URL avec "Chapitre" suivi d'un nombre

        if (chapterMatch) {
            return { type: 'Chapitre', number: parseInt(chapterMatch[1], 10) };
        }
        return null;
    }

    // Fonction pour formater les numéros à deux chiffres (ex: 01, 02, ...)
    function formatNumber(number) {
        return number < 10 ? '0' + number : number;
    }

    var currentPageItem = getCurrentPageItem();

    // Crée les options du chapitre entre 159 et 166 (modifiable selon vos besoins)
    for (var i = 167; i >= 159; i--) {
        var option = document.createElement("option");
        var formattedNumber = formatNumber(i);
        option.value = formattedNumber;
        option.text = "Chapitre " + formattedNumber;
        option.dataset.redirect = "https://lanortrad.netlify.app/tougen%20anki/Chapitre%20/tome 19/" + formattedNumber + ".html";

        // Si l'URL actuelle correspond à un chapitre, sélectionnez-le par défaut
        if (currentPageItem && currentPageItem.type === 'Chapitre' && i === currentPageItem.number) {
            option.selected = true;
        }

        // Ajoute l'option au menu déroulant
        selectMenu.appendChild(option);
    }

    // Écouteur d'événement pour rediriger vers la page sélectionnée
    selectMenu.addEventListener("change", function() {
        var selectedOption = selectMenu.options[selectMenu.selectedIndex];
        if (selectedOption && selectedOption.dataset.redirect) {
            window.location.href = selectedOption.dataset.redirect;
        }
    });
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