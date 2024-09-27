document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('intro').style.display = 'none';
        document.getElementById('main-content').style.opacity = '1';
    }, 3000);
});

function initializeChapterSelect() {
    var selectMenu = document.getElementById("chapter-select");

    function getCurrentPageItem() {
        var url = window.location.href;
        var chapterMatch = url.match(/Chapitre%20(\d+(?:\.\d+)?)/);
        var tomeMatch = url.match(/Tome%20(\d+)/);

        if (chapterMatch) {
            return { type: 'Chapitre', number: parseFloat(chapterMatch[1]) };
        } else if (tomeMatch) {
            return { type: 'Tome', number: parseInt(tomeMatch[1], 10) };
        }
        return null;
    }

    var currentPageItem = getCurrentPageItem();

    var chapters = [67, 66, 65, 64.5, 64, 63];

    chapters.forEach(function(chapter) {
        var option = document.createElement("option");
        option.value = chapter;
        option.text = "Chapitre " + chapter;
        option.dataset.redirect = "https://lanortrad.netlify.app/ao no exorcist/Tome 15/Chapitre%20" + chapter + ".html";
        if (currentPageItem && currentPageItem.type === 'Chapitre' && chapter === currentPageItem.number) {
            option.selected = true;
        }
        selectMenu.appendChild(option);
    });

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