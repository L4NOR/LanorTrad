document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('intro').style.display = 'none';
        document.getElementById('main-content').style.opacity = '1';
    }, 3000);
});

function initializeChapterSelect() { 
    var selectMenu = document.getElementById("chapter-select");

    // Fonction pour obtenir le chapitre actuel à partir de l'URL
    function getCurrentPageItem() {
        var url = window.location.href;
        var chapterMatch = url.match(/chapitre%20(\d+)/i); // Match l'URL avec "chapitre" suivi d'un nombre, insensible à la casse

        if (chapterMatch) {
            return parseInt(chapterMatch[1], 10);
        }
        return null;
    }

    // Fonction pour formater les numéros à deux chiffres (ex: 01, 02, ...)
    function formatNumber(number) {
        return number < 10 ? '0' + number : number;
    }

    var currentChapter = getCurrentPageItem();

    // Crée les options du chapitre entre 159 et 167
    for (var i = 96; i >= 88; i--) {
        var option = document.createElement("option");
        var formattedNumber = formatNumber(i);
        option.value = formattedNumber;
        option.text = "Chapitre " + formattedNumber;
        option.dataset.redirect = `https://lanortrad.netlify.app/tougen%20anki/tome%2011/chapitre%20${formattedNumber}`;

        // Sélectionne le chapitre actuel ou le chapitre 167 par défaut
        if (i === currentChapter || (currentChapter === null && i === 167)) {
            option.selected = true;
        }

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

document.addEventListener("DOMContentLoaded", function() {
    initializeChapterSelect();
    window.onscroll = scrollFunction;
});