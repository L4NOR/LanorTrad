document.addEventListener('DOMContentLoaded', function() {
    // Mise à jour de la navbar
    const navbar = document.getElementById('main-navbar');
    if (navbar) {
        navbar.innerHTML = `
            <ul>
                <li><a href="https://lanortrad.netlify.app/">Accueil</a></li>
                <li><a href="https://linktr.ee/l4nor">Réseaux</a></li>
            </ul>
        `;
    }

    // Mise à jour du footer
    const footer = document.querySelector('footer');
    if (footer) {
        const currentYear = new Date().getFullYear();
        footer.innerHTML = `
            <p>&copy; ${currentYear} LanorTrad - Tous droits réservés.</p>
        `;
    }
});

