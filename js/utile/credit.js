function addCredits() {
    const readerContainer = document.getElementById('readerContainer');
    
    // Création du crédit d'ouverture
    const openingCredit = document.createElement('img');
    openingCredit.src = 'https://i.postimg.cc/SRMgHZZF/Tougen-Anki-Affiche.png';
    openingCredit.alt = 'Crédit d\'ouverture LanorTrad';
    openingCredit.className = 'manga-page';
    openingCredit.style.width = '85%'; // Ajout d'une largeur spécifique
    openingCredit.style.maxWidth = '800px'; // Limite la largeur maximale
    
    // Création du crédit de fermeture
    const closingCredit = document.createElement('img');
    closingCredit.src = 'https://i.postimg.cc/HL6vM8JK/recrutement-lanortrad.png';
    closingCredit.alt = 'Crédit de fermeture LanorTrad';
    closingCredit.className = 'manga-page';
    closingCredit.style.width = '55%'; // Ajout d'une largeur spécifique
    closingCredit.style.maxWidth = '1000px'; // Limite la largeur maximale

    // Insertion des crédits
    readerContainer.insertBefore(openingCredit, readerContainer.firstChild);
    readerContainer.appendChild(closingCredit);
}

// Exécute la fonction une fois que le DOM est chargé
document.addEventListener('DOMContentLoaded', addCredits);