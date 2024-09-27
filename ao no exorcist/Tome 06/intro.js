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
        var bonusMatch = url.match(/Chapitre%20Bonus%20\((\d+)\)/);
        
        if (bonusMatch) {
            return { type: 'Bonus', number: parseInt(bonusMatch[1], 10) };
        } else if (chapterMatch) {
            return { type: 'Chapitre', number: parseInt(chapterMatch[1], 10) };
        } else if (tomeMatch) {
            return { type: 'Tome', number: parseInt(tomeMatch[1], 10) };
        }
        return null;
    }

    var currentPageItem = getCurrentPageItem();

    // Ajouter les chapitres bonus
    var bonusChapters = [
        { value: "bonus2", text: "Chapitre Bonus (2)", url: "https://lanortrad.netlify.app/ao no exorcist/Tome 06/Chapitre%20Bonus%20(2).html" },
        { value: "bonus1", text: "Chapitre Bonus (1)", url: "https://lanortrad.netlify.app/ao no exorcist/Tome 06/Chapitre%20Bonus%20(1).html" }
    ];

    bonusChapters.forEach(function(chapter) {
        var option = document.createElement("option");
        option.value = chapter.value;
        option.text = chapter.text;
        option.dataset.redirect = chapter.url;
        if (currentPageItem && currentPageItem.type === 'Bonus' && chapter.text.includes(`(${currentPageItem.number})`)) {
            option.selected = true;
        }
        selectMenu.appendChild(option);
    });

    // Ajouter les chapitres normaux
    for (var i = 23; i >= 20; i--) {
        var option = document.createElement("option");
        option.value = i;
        option.text = "Chapitre " + i;
        option.dataset.redirect = "https://lanortrad.netlify.app/ao no exorcist/Tome 06/Chapitre%20" + i + ".html";
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