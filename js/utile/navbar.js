document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");

  mobileMenuButton.addEventListener("click", () => {
    const isExpanded =
      mobileMenuButton.getAttribute("aria-expanded") === "true";
    mobileMenuButton.setAttribute("aria-expanded", !isExpanded);
    mobileMenu.classList.toggle("hidden");
  });
});

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
    discordElements.forEach(element => {
        element.href = discordGGUrl + newInviteCode;
    });
    
    // Met également à jour le lien dans la meta tag oembed si elle existe
    const oembedLink = document.querySelector('link[rel="alternate"][type="application/json+oembed"]');
    if (oembedLink) {
        oembedLink.href = discordGGUrl + newInviteCode;
    }
    
    console.log(`Liens Discord mis à jour vers: ${discordGGUrl}${newInviteCode}`);
}

// Exécute la mise à jour une fois que le DOM est chargé
document.addEventListener('DOMContentLoaded', updateDiscordLinks);
