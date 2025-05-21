// Fonction principale qui regroupe toutes les fonctionnalités de la navbar
function initializeNavbar() {
  // 1. Gestion du menu mobile
  setupMobileMenu();
  
  console.log("Initialisation de la navbar terminée");
}

// Configuration du menu mobile
function setupMobileMenu() {
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");
  
  if (mobileMenuButton && mobileMenu) {
      mobileMenuButton.addEventListener("click", () => {
          const isExpanded = mobileMenuButton.getAttribute("aria-expanded") === "true";
          mobileMenuButton.setAttribute("aria-expanded", !isExpanded);
          mobileMenu.classList.toggle("hidden");
      });
      console.log("Menu mobile configuré");
  } else {
      console.warn("Éléments du menu mobile non trouvés");
  }
}

// Initialisation de la navbar selon l'état du chargement du document
function initNavbarOnLoad() {
  // Si le document est déjà chargé ou en cours de chargement interactif
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
      // Petit délai pour s'assurer que le DOM est complètement accessible
      setTimeout(initializeNavbar, 50);
  } else {
      // Attendre le chargement complet du DOM
      document.addEventListener('DOMContentLoaded', initializeNavbar);
  }
}

// Démarrer l'initialisation
initNavbarOnLoad();

// Gestion des effets de scroll pour la navbar (optionnel)
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  if (nav) {
      if (window.scrollY > 20) {
          nav.classList.add('scrolled');
      } else {
          nav.classList.remove('scrolled');
      }
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const navbar = document.querySelector('nav');
  const readerControls = document.querySelector('.fixed.top-20'); // Sélectionne les contrôles du lecteur
  const footer = document.querySelector('footer');
  
  let lastScrollTop = 0;
  let ticking = false;
  
  // Fonction pour déterminer si l'utilisateur est près du footer
  function isNearFooter() {
      if (!footer) return false;
      
      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Si le haut du footer est visible ou proche d'être visible
      return footerRect.top < windowHeight + 200; // 200px avant d'atteindre le footer
  }
  
  // Gestion du défilement
  function handleScroll() {
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Détermine la direction du défilement
      const isScrollingDown = currentScrollTop > lastScrollTop;
      // Vérifie si l'utilisateur est près du footer
      const nearFooter = isNearFooter();
      
      // Cache la navbar lors du défilement vers le bas et montre-la près du footer ou en défilant vers le haut
      if (isScrollingDown && !nearFooter && currentScrollTop > 100) {
          // Cacher la navbar et les contrôles du lecteur
          navbar.style.transform = 'translateY(-100%)';
          if (readerControls) {
              readerControls.style.transform = 'translateY(-100%)';
          }
      } else {
          // Montrer la navbar et les contrôles du lecteur
          navbar.style.transform = 'translateY(0)';
          if (readerControls) {
              readerControls.style.transform = 'translateY(0)';
          }
      }
      
      lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
      ticking = false;
  }
  
  // Écoute l'événement de défilement avec throttling pour de meilleures performances
  window.addEventListener('scroll', function() {
      if (!ticking) {
          window.requestAnimationFrame(function() {
              handleScroll();
              ticking = false;
          });
          ticking = true;
      }
  });
  
  // Ajout des styles de transition pour la navbar
  if (navbar) {
      navbar.style.transition = 'transform 0.3s ease-in-out';
  }
  if (readerControls) {
      readerControls.style.transition = 'transform 0.3s ease-in-out';
  }
});