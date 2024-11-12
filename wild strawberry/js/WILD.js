document.addEventListener('DOMContentLoaded', function() {
    const contentDiv = document.getElementById('content');
    
    function createChapitresSection() {
        let html = `
            <section class="chapters-section">
                <h2>Les derniers chapitres</h2>
                <div class="chapter-grid">
                    <div class="chapter-card">
                        <a href="Chapitre%203.html" class="tome-link">
                            <img src="images/WILD/cover WILD.jpg" alt="Couverture du chapitre 3">
                            <p>Chapitre 3</p>
                        </a>
                    </div>
                    <div class="chapter-card">
                        <a href="Chapitre%202.html" class="tome-link">
                            <img src="images/WILD/cover WILD.jpg" alt="Couverture du chapitre 2">
                            <p>Chapitre 2</p>
                        </a>
                    </div>
                    <div class="chapter-card">
                        <a href="Chapitre%201.html" class="tome-link">
                            <img src="images/WILD/cover WILD.jpg" alt="Couverture du chapitre 1">
                            <p>Chapitre 1</p>
                        </a>
                    </div>
                </div>
            </section>
        `;
        return html;
    }

    // Ne pas afficher les tomes ni de pagination
    function updateContent() {
        contentDiv.innerHTML = createChapitresSection();
    }

    // Initialisation
    updateContent();
});

