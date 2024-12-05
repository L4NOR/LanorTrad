document.addEventListener('DOMContentLoaded', () => {
  // Masquer l'intro et afficher le contenu principal après 3 secondes
  setTimeout(() => {
      const intro = document.getElementById('intro');
      const mainContent = document.getElementById('main-content');
      if (intro) intro.style.display = 'none';
      if (mainContent) mainContent.style.opacity = '1';
  }, 3000);

  // Initialiser les fonctionnalités de la page
  initializeChapterSelect();
  scrollFunction();
});

// Initialiser le menu déroulant des chapitres
function initializeChapterSelect() {
  const selectMenu = document.getElementById("chapter-select");
  const prevButton = document.getElementById("prevChapter");
  const nextButton = document.getElementById("nextChapter");

  // Obtenir le chapitre actuel à partir de l'URL
  function getCurrentPageItem() {
      const url = window.location.href;
      const match = url.match(/chapitre%20(\d+)/i);
      return match ? parseInt(match[1], 10) : null;
  }

  // Formater les numéros de chapitre (ex: 01, 02, ...)
  function formatNumber(number) {
      return number < 10 ? `0${number}` : `${number}`;
  }

  // Naviguer entre les chapitres
  function navigateChapter(direction) {
      const currentIndex = selectMenu.selectedIndex;
      const newIndex = currentIndex + direction;

      if (newIndex >= 0 && newIndex < selectMenu.options.length) {
          selectMenu.selectedIndex = newIndex;
          const selectedOption = selectMenu.options[newIndex];
          if (selectedOption && selectedOption.dataset.redirect) {
              window.location.href = selectedOption.dataset.redirect;
          }
      }
  }

  // Ajouter les options de chapitre si le menu est vide
  function populateChapterOptions() {
      if (selectMenu.options.length === 0) {
          for (let i = 178; i >= 178; i--) {
              const option = document.createElement("option");
              const formattedNumber = formatNumber(i);
              option.value = formattedNumber;
              option.text = `Chapitre ${formattedNumber}`;
              option.dataset.redirect = `https://lanortrad.netlify.app/tougen%20anki/tome%2021/chapitre%20${formattedNumber}`;

              if (i === currentChapter) {
                  option.selected = true;
              }

              selectMenu.appendChild(option);
          }
      }
  }

  const currentChapter = getCurrentPageItem();
  populateChapterOptions();

  // Ajouter un gestionnaire pour le changement de chapitre via le menu déroulant
  selectMenu.addEventListener("change", () => {
      const selectedOption = selectMenu.options[selectMenu.selectedIndex];
      if (selectedOption && selectedOption.dataset.redirect) {
          window.location.href = selectedOption.dataset.redirect;
      }
  });

  // Gestionnaires pour les boutons Précédent et Suivant
  if (prevButton) prevButton.addEventListener("click", () => navigateChapter(-1));
  if (nextButton) nextButton.addEventListener("click", () => navigateChapter(1));
}

// Fonction pour remonter en haut de la page
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Afficher ou cacher le bouton de remontée
function scrollFunction() {
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");

  if (scrollToTopBtn) {
      if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
          scrollToTopBtn.style.display = "block";
      } else {
          scrollToTopBtn.style.display = "none";
      }
  }
}

// Écouter les événements de défilement
window.onscroll = scrollFunction;

// Ajouter la vérification Google
const meta = document.createElement('meta');
meta.name = "google-site-verification";
meta.content = "eImJAYI9qcdg0xDVXhoI6EWU97AaJQgT0-S9vOgLXFs";
document.head.appendChild(meta);
