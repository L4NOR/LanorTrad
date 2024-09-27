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
        var chapterMatch = url.match(/Chapitre%20(\d+)/);
        var tomeMatch = url.match(/Tome%20(\d+)/);

        if (chapterMatch) {
            return { type: 'Chapitre', number: parseInt(chapterMatch[1], 10) };
        } else if (tomeMatch) {
            return { type: 'Tome', number: parseInt(tomeMatch[1], 10) };
        }
        return null;
    }

    var currentPageItem = getCurrentPageItem();

    for (var i = 103; i >= 99; i--) {
        var option = document.createElement("option");
        option.value = i;
        option.text = "Chapitre " + i;
        option.dataset.redirect = "https://lanortrad.netlify.app/ao no exorcist/Tome 22/Chapitre%20" + i + ".html";
        if (currentPageItem && currentPageItem.type === 'Chapitre' && i === currentPageItem.number) {
            option.selected = true;
        }
        selectMenu.appendChild(option);
    }

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