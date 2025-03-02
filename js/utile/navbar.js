// Fonction principale qui regroupe toutes les fonctionnalités de la navbar
function initializeNavbar() {
  // 1. Gestion du menu mobile
  setupMobileMenu();
  
  // 2. Mise à jour des liens Discord
  updateDiscordLinks();
  
  // 3. Changement des liens "Nouveautés" en "Planning"
  updateNouveautesLinks();
  
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

// Fonction pour mettre à jour les liens Discord
function updateDiscordLinks() {
  // Nouveau code d'invitation Discord
  const newInviteCode = 'KKsp4AG8BV';
  
  // Base des URLs Discord
  const discordInviteUrl = 'https://discord.com/invite/';
  const discordGGUrl = 'https://discord.gg/';
  
  // Recherche tous les éléments qui contiennent un lien Discord (les deux formats)
  const discordElements = document.querySelectorAll(`a[href*="${discordInviteUrl}"], a[href*="${discordGGUrl}"]`);
  
  // Met à jour chaque lien
  let updatedCount = 0;
  discordElements.forEach(element => {
      element.href = discordGGUrl + newInviteCode;
      updatedCount++;
  });
  
  // Met également à jour le lien dans la meta tag oembed si elle existe
  const oembedLink = document.querySelector('link[rel="alternate"][type="application/json+oembed"]');
  if (oembedLink) {
      oembedLink.href = discordGGUrl + newInviteCode;
      updatedCount++;
  }
  
  console.log(`Liens Discord mis à jour (${updatedCount}): ${discordGGUrl}${newInviteCode}`);
}

// Fonction pour mettre à jour les liens Nouveautés vers Planning
function updateNouveautesLinks() {
  // Sélectionner tous les liens contenant "Nouveautés" dans leur href, en tenant compte des chemins relatifs
  const nouveautesLinks = document.querySelectorAll('a[href*="Nouveautés.html"]');
  
  let updatedCount = 0;
  // Mettre à jour chaque lien
  nouveautesLinks.forEach(link => {
      // Conserver le chemin relatif tout en remplaçant le nom du fichier
      const newHref = link.getAttribute('href').replace('Nouveautés.html', 'Planning.html');
      link.textContent = 'Planning';
      link.setAttribute('href', newHref);
      updatedCount++;
  });
  
  console.log(`Liens Nouveautés mis à jour vers Planning (${updatedCount})`);
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