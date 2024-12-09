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
      var chapterMatch = url.match(/chapitre%20(\d+)/i);
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
  
// Vérifier si le menu de sélection est vide avant d'ajouter les options
if (selectMenu.options.length === 0) {
  for (var i = 25; i >= 23; i--) {
    // Ajouter le chapitre 24.5 après le chapitre 25
    if (i === 24) {
      var option = document.createElement("option");
      var formattedNumber = "24.5";
      option.value = formattedNumber;
      option.text = "Chapitre " + formattedNumber;
      option.dataset.redirect = `https://lanortrad.netlify.app/tokyo%20underworld/tome%2004/chapitre%20${formattedNumber}`;
      
      // Sélectionner par défaut si l'URL correspond
      if (window.location.href.includes(`chapitre%20${formattedNumber}`)) {
        option.selected = true;
      }

      selectMenu.appendChild(option);
    }

    var option = document.createElement("option");
    var formattedNumber = formatNumber(i);
    option.value = formattedNumber;
    option.text = "Chapitre " + formattedNumber;
    option.dataset.redirect = `https://lanortrad.netlify.app/tokyo%20underworld/tome%2004/chapitre%20${formattedNumber}`;

    // Sélectionner par défaut si l'URL correspond
    if (window.location.href.includes(`chapitre%20${formattedNumber}`)) {
      option.selected = true;
    }

    selectMenu.appendChild(option);
  }
}

  
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
  
  // Appeler la fonction d'initialisation lorsque le DOM est chargé
  document.addEventListener("DOMContentLoaded", initializeChapterSelect);

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