document.addEventListener('DOMContentLoaded', () => {
  // Écran de chargement
  setTimeout(() => {
      document.getElementById('intro').style.display = 'none';
      document.getElementById('main-content').style.opacity = '1';
  }, 3000);

  // Initialisation de la navbar
  initializeNavbar();

  // Initialisation du menu de sélection des chapitres
  initializeChapterSelect();
});

function initializeNavbar() {
  const navbar = document.getElementById('main-navbar');

  // Supprimer l'ancien contenu de la navbar
  navbar.innerHTML = '';

  // Définir les liens de navigation
  const navLinks = [
      { text: 'Accueil', url: 'https://lanortrad.netlify.app/' },
      { text: 'Chapitres', url: 'https://lanortrad.netlify.app/tougen%20anki' },
      { text: 'Réseaux', url: 'https://linktr.ee/l4nor' },
  ];

  // Générer la liste des liens
  const ul = document.createElement('ul');
  navLinks.forEach(link => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = link.url;
      a.textContent = link.text;
      li.appendChild(a);
      ul.appendChild(li);
  });

  // Ajouter la liste au navbar
  navbar.appendChild(ul);
}

function initializeChapterSelect() {
  const selectMenu = document.getElementById('chapter-select');
  const prevButton = document.getElementById('prevChapter');
  const nextButton = document.getElementById('nextChapter');

  function getCurrentPageItem() {
      const url = window.location.href;
      const chapterMatch = url.match(/chapitre%20(\d+)/i);
      if (chapterMatch) {
          return parseInt(chapterMatch[1], 10);
      }
      return null;
  }

  function formatNumber(number) {
      return number < 10 ? '0' + number : number;
  }

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

  const currentChapter = getCurrentPageItem();

  // Vérifier si le menu de sélection est vide avant d'ajouter les options
  if (selectMenu.options.length === 0) {
      for (let i = 15; i >= 7; i--) {
          const option = document.createElement('option');
          const formattedNumber = formatNumber(i);
          option.value = formattedNumber;
          option.text = 'Chapitre ' + formattedNumber;
          option.dataset.redirect = `https://lanortrad.netlify.app/tougen%20anki/tome%2002/chapitre%20${formattedNumber}`;

          if (i === currentChapter || (currentChapter === null && i === 6)) {
              option.selected = true;
          }

          selectMenu.appendChild(option);
      }
  }

  selectMenu.addEventListener('change', () => {
      const selectedOption = selectMenu.options[selectMenu.selectedIndex];
      if (selectedOption && selectedOption.dataset.redirect) {
          window.location.href = selectedOption.dataset.redirect;
      }
  });

  prevButton.addEventListener('click', () => navigateChapter(-1));
  nextButton.addEventListener('click', () => navigateChapter(1));
}

function scrollToTop() {
  window.scrollTo({
      top: 0,
      behavior: 'smooth',
  });
}

function scrollFunction() {
  const scrollToTopBtn = document.getElementById('scrollToTopBtn');
  if (scrollToTopBtn) {
      if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
          scrollToTopBtn.style.display = 'block';
      } else {
          scrollToTopBtn.style.display = 'none';
      }
  }
}

window.onscroll = scrollFunction;

// Ajout de la vérification Google
const meta = document.createElement('meta');
meta.name = 'google-site-verification';
meta.content = 'eImJAYI9qcdg0xDVXhoI6EWU97AaJQgT0-S9vOgLXFs';
document.getElementsByTagName('head')[0].appendChild(meta);