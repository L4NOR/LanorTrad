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
        var chapterMatch = url.match(/Chapitre%20([\d\.]+)/);
        var tomeMatch = url.match(/Tome%20(\d+)/);
        
        if (chapterMatch) {
            return { type: 'Chapitre', number: chapterMatch[1] };
        } else if (tomeMatch) {
            return { type: 'Tome', number: parseInt(tomeMatch[1], 10) };
        }
        return null;
    }

    var currentPageItem = getCurrentPageItem();

    // Définir le chapitre spécial 64.5
    var specialChapter = {
        value: "64.5",
        text: "Chapitre 64.5",
        url: "https://lanortrad.netlify.app/ao no exorcist/Tome 15/Chapitre%2064.5.html"
    };

    // Ajouter les chapitres normaux et le chapitre spécial dans l'ordre
    for (var i = 67; i >= 63; i--) {
        if (i === 65) {
            var option = document.createElement("option");
            option.value = specialChapter.value;
            option.text = specialChapter.text;
            option.dataset.redirect = specialChapter.url;
            if (currentPageItem && currentPageItem.type === 'Chapitre' && currentPageItem.number === specialChapter.value) {
                option.selected = true;
            }
            selectMenu.appendChild(option);
        }

        var option = document.createElement("option");
        option.value = i;
        option.text = "Chapitre " + i;
        option.dataset.redirect = "https://lanortrad.netlify.app/ao no exorcist/Tome 15/Chapitre%20" + i + ".html";
        if (currentPageItem && currentPageItem.type === 'Chapitre' && i.toString() === currentPageItem.number) {
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

document.addEventListener("DOMContentLoaded", function() {
    initializeChapterSelect();
    window.onscroll = scrollFunction;
});