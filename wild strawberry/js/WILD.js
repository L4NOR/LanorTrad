document.addEventListener('DOMContentLoaded', function() {
    const contentDiv = document.getElementById('content');
    const toggleButton = document.getElementById('toggleButton');
    let isChapitresVisible = true; // Afficher les chapitres par défaut
    let itemsPerPage = getItemsPerPage();
    let currentPage = 1;

    function getItemsPerPage() {
        if (window.innerWidth <= 600) {
            return 3; // 1 colonne x 3 lignes sur les petits écrans
        } else if (window.innerWidth <= 900) {
            return 6; // 2 colonnes x 3 lignes sur les écrans moyens
        } else {
            return 9; // 3 colonnes x 3 lignes sur les grands écrans
        }
    }

    window.addEventListener('resize', function() {
        const newItemsPerPage = getItemsPerPage();
        if (newItemsPerPage !== itemsPerPage) {
            itemsPerPage = newItemsPerPage;
            updateContent();
        }
    });

    function createPaginationButtons(totalItems) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        let paginationHTML = '<div class="pagination">';
        
        // Bouton "Précédent"
        paginationHTML += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(-1)">❮</button>`;

        // Affichage des numéros de page
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            paginationHTML += `<button onclick="changePage(${1 - currentPage})">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span class="ellipsis">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            if (i === currentPage) {
                paginationHTML += `<button class="active">${i}</button>`;
            } else {
                paginationHTML += `<button onclick="changePage(${i - currentPage})">${i}</button>`;
            }
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span class="ellipsis">...</span>`;
            }
            paginationHTML += `<button onclick="changePage(${totalPages - currentPage})">${totalPages}</button>`;
        }

        // Bouton "Suivant"
        paginationHTML += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(1)">❯</button>`;

        paginationHTML += '</div>';
        return paginationHTML;
    }

    function createChapitresSection() {
        const chapitres = [8, 7, 6, 5];
        const totalChapitres = chapitres.length;
        const start = (currentPage - 1) * itemsPerPage;
        const end = Math.min(start + itemsPerPage, totalChapitres);
    
        let html = `
            <section class="chapters-section">
                <h2>Les derniers chapitres</h2>
                <div class="chapter-grid">
        `;
    
        for (let i = start; i < end; i++) {
            const chapitreNumber = chapitres[i];
            html += `
                <div class="chapter-card">
                    <a href="Chapitre%20${chapitreNumber}.html" class="tome-link">
                        <img src="images/WILD/cover WILD.jpg" alt="Couverture du chapitre ${chapitreNumber}">
                        <p>Chapitre ${chapitreNumber}</p>
                    </a>
                </div>
            `;
        }
    
        html += '</div>';
        html += createPaginationButtons(totalChapitres);
        html += '</section>';
    
        return html;
    }

    function createTomesSection() {
        const totalTomes = 1;
        const start = (currentPage - 1) * itemsPerPage;
        const end = Math.min(start + itemsPerPage, totalTomes);

        let html = `
            <section class="tomes-section">
                <h2>Les Tomes</h2>
                <div class="tomes-grid">
        `;

        for (let i = start; i < end; i++) {
            const tomeNumber = i + 1;
            const formattedNumber = tomeNumber < 10 ? `0${tomeNumber}` : tomeNumber;
            const link = `Tome ${formattedNumber}.html`;
            
            html += `
                <div class="tome-card">
                    <a href="${link}" class="tome-link">
                        <img src="images/WILD/T${formattedNumber}.png" alt="Couverture du tome ${formattedNumber}">
                        <p>Tome ${formattedNumber}</p>
                    </a>
                </div>
            `;
        }

        html += '</div>';
        html += createPaginationButtons(totalTomes);
        html += '</section>';

        return html;
    }

    function toggleContent() {
        isChapitresVisible = !isChapitresVisible;
        currentPage = 1; // Réinitialiser à la première page lors du changement de vue
        updateContent();
        toggleButton.textContent = isChapitresVisible ? "Tous les tomes" : "Derniers chapitres";
    }

    function updateContent() {
        contentDiv.innerHTML = isChapitresVisible ? createChapitresSection() : createTomesSection();
    }

    function changePage(direction) {
        const totalItems = isChapitresVisible ? 8 : 19; // Nombre total de chapitres ou de tomes
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        currentPage += direction;
        if (currentPage < 1) currentPage = 1;
        if (currentPage > totalPages) currentPage = totalPages;
        
        updateContent();
    }

    // Exposer la fonction changePage globalement
    window.changePage = changePage;

    toggleButton.addEventListener('click', toggleContent);

    // Initialisation
    updateContent();
});
