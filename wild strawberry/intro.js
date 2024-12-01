document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('intro').style.display = 'none';
        document.getElementById('main-content').style.opacity = '1';
    }, 3000);
});

function initializeChapterSelect() {
    var selectMenu = document.getElementById("chapter-select");
    var prevButton = document.getElementById("prevChapter");
    var nextButton = document.getElementById("nextChapter");

    function getCurrentPageItem() {
        var url = window.location.href;
        var chapterMatch = url.match(/Chapitre%20(\d+)/i);
        if (chapterMatch) {
            return parseInt(chapterMatch[1], 10);
        }
        return null;
    }

    function formatNumber(number) {
        return number < 10 ? "0" + number : number;
    }

    function navigateChapter(direction) {
        var currentIndex = selectMenu.selectedIndex;
        var newIndex = currentIndex + direction;
        if (newIndex >= 0 && newIndex < selectMenu.options.length) {
            selectMenu.selectedIndex = newIndex;
            var selectedOption = selectMenu.options[newIndex];
            if (selectedOption && selectedOption.dataset.redirect) {
                window.location.href = selectedOption.dataset.redirect;
            }
        }
    }

    var currentChapter = getCurrentPageItem();

    // Créer les options pour les chapitres de "Wild Strawberry"
    var chapters = [
        { number: 1, url: "https://lanortrad.netlify.app/wild strawberry/Chapitre%201.html" },
        { number: 2, url: "https://lanortrad.netlify.app/wild strawberry/Chapitre%202.html" },
        { number: 3, url: "https://lanortrad.netlify.app/wild strawberry/Chapitre%203.html" },
        { number: 4, url: "https://lanortrad.netlify.app/wild strawberry/Chapitre%204.html" }
    ];

    chapters.forEach(chapter => {
        var option = document.createElement("option");
        var formattedNumber = formatNumber(chapter.number);
        option.value = formattedNumber;
        option.text = "Chapitre " + formattedNumber;
        option.dataset.redirect = chapter.url;

        if (chapter.number === currentChapter) {
            option.selected = true;
        }

        selectMenu.appendChild(option);
    });

    selectMenu.addEventListener("change", function () {
        var selectedOption = selectMenu.options[selectMenu.selectedIndex];
        if (selectedOption && selectedOption.dataset.redirect) {
            window.location.href = selectedOption.dataset.redirect;
        }
    });

    prevButton.addEventListener("click", function () {
        navigateChapter(-1);
    });

    nextButton.addEventListener("click", function () {
        navigateChapter(1);
    });
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function scrollFunction() {
    var scrollToTopBtn = document.getElementById("scrollToTopBtn");
    if (scrollToTopBtn) {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            scrollToTopBtn.style.display = "block";
        } else {
            scrollToTopBtn.style.display = "none";
        }
    }
}

window.onscroll = scrollFunction;

document.addEventListener("DOMContentLoaded", function() {
    initializeChapterSelect();
    window.onscroll = scrollFunction;
});

// Ajout de la vérification de site Google
var meta = document.createElement('meta');
meta.name = "google-site-verification";
meta.content = "eImJAYI9qcdg0xDVXhoI6EWU97AaJQgT0-S9vOgLXFs";
document.getElementsByTagName('head')[0].appendChild(meta);
