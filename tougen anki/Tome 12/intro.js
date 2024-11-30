document.addEventListener('DOMContentLoaded', () => { 
  setTimeout(() => {
      document.getElementById('intro').style.display = 'none';
      document.getElementById('main-content').style.opacity = '1';
  }, 3000);
});

function initializeNavbar() {
  const navbar = document.getElementById('main-navbar');

  // Effacer le contenu précédent de la navbar
  navbar.innerHTML = '';

  // Définir les liens de navigation
  const navLinks = [
      { text: 'Accueil', url: 'https://lanortrad.netlify.app/' },
      { text: 'Chapitres', url: 'https://lanortrad.netlify.app/tougen%20anki' },
      { text: 'Réseaux', url: 'https://linktr.ee/l4nor' },
  ];

  // Ajouter les liens à la navbar
  const ul = document.createElement('ul');
  ul.classList.add('navbar-links');
  navLinks.forEach(link => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = link.url;
      a.textContent = link.text;
      li.appendChild(a);
      ul.appendChild(li);
  });

  // Ajouter la liste générée au navbar
  navbar.appendChild(ul);
}

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
      for (var i = 105; i >= 97; i--) {
          var option = document.createElement("option");
          var formattedNumber = formatNumber(i);
          option.value = formattedNumber;
          option.text = "Chapitre " + formattedNumber;
          option.dataset.redirect = `https://lanortrad.netlify.app/tougen%20anki/tome%2012/chapitre%20${formattedNumber}`;

          if (i === currentChapter || (currentChapter === null && i === 6)) {
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
document.addEventListener("DOMContentLoaded", () => {
  initializeNavbar();
  initializeChapterSelect();
});

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

// Ajouter la vérification Google
var meta = document.createElement('meta');
meta.name = "google-site-verification";
meta.content = "eImJAYI9qcdg0xDVXhoI6EWU97AaJQgT0-S9vOgLXFs";
document.getElementsByTagName('head')[0].appendChild(meta);