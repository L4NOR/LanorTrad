// === NAVBAR - LanorTrad ===

function initializeNavbar() {
    injectSidebarIfNeeded();
    setupMobileMenu();
    setupScrollBehavior();
}

// Injecte le sidebar HTML dynamiquement si absent (pages chapitres etc.)
function injectSidebarIfNeeded() {
    if (document.getElementById('mobile-sidebar')) return; // Déjà présent

    // Déterminer le préfixe de chemin (root ou sous-dossier)
    const depth = getPathDepth();
    const prefix = depth === 0 ? '/' : '/';

    // Supprimer l'ancien menu mobile dropdown s'il existe
    const oldMenu = document.getElementById('mobile-menu');
    if (oldMenu) oldMenu.remove();

    // Créer l'overlay
    const overlay = document.createElement('div');
    overlay.id = 'sidebar-overlay';
    overlay.className = 'sidebar-overlay';

    // Créer le sidebar
    const sidebar = document.createElement('div');
    sidebar.id = 'mobile-sidebar';
    sidebar.className = 'mobile-sidebar';
    sidebar.innerHTML = `
        <div class="sidebar-header">
            <span class="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">LanorTrad</span>
            <button id="sidebar-close" class="sidebar-close" aria-label="Fermer le menu">&times;</button>
        </div>
        <nav class="sidebar-nav">
            <a href="${prefix}Bibliotheque.html" class="sidebar-link"><span class="sidebar-icon">📚</span> Bibliothèque</a>
            <a href="${prefix}Catalogue.html" class="sidebar-link"><span class="sidebar-icon">📖</span> Catalogue</a>
            <a href="${prefix}Planning.html" class="sidebar-link"><span class="sidebar-icon">📅</span> Planning</a>
            <a href="${prefix}%C3%89quipe.html" class="sidebar-link"><span class="sidebar-icon">👥</span> Équipe</a>
        </nav>
        <div class="sidebar-search">
            <input type="search" placeholder="Rechercher un manga..." aria-label="Rechercher un manga">
        </div>
        <div class="sidebar-footer">
            <a href="https://discord.gg/md37S7nhkZ" class="sidebar-discord">💬 Rejoindre Discord</a>
        </div>
    `;

    // Injecter dans le body
    document.body.appendChild(overlay);
    document.body.appendChild(sidebar);
}

// Détecte la profondeur du chemin actuel
function getPathDepth() {
    const path = window.location.pathname;
    const segments = path.split('/').filter(s => s.length > 0 && s.includes('.') === false);
    return segments.length;
}

// Sidebar mobile (drawer)
function setupMobileMenu() {
    const menuButton = document.getElementById('mobile-menu-button');
    const sidebar = document.getElementById('mobile-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const closeBtn = document.getElementById('sidebar-close');

    if (!menuButton || !sidebar) return;

    function openSidebar() {
        sidebar.classList.add('open');
        if (overlay) overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        menuButton.setAttribute('aria-expanded', 'true');
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
        document.body.style.overflow = '';
        menuButton.setAttribute('aria-expanded', 'false');
    }

    menuButton.addEventListener('click', openSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);

    // Fermer avec Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });
}

// Hide/show navbar on scroll
function setupScrollBehavior() {
    const navbar = document.querySelector('nav');
    const readerControls = document.querySelector('.fixed.top-20');
    const footer = document.querySelector('footer');

    if (!navbar) return;

    let lastScrollTop = 0;
    let ticking = false;

    navbar.style.transition = 'transform 0.3s ease-in-out';
    if (readerControls) readerControls.style.transition = 'transform 0.3s ease-in-out';

    function isNearFooter() {
        if (!footer) return false;
        return footer.getBoundingClientRect().top < window.innerHeight + 200;
    }

    function handleScroll() {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollDelta = currentScrollTop - lastScrollTop;
        const nearFooter = isNearFooter();

        // Only hide after scrolling down at least 10px (prevents jitter)
        if (scrollDelta > 10 && !nearFooter && currentScrollTop > 100) {
            navbar.style.transform = 'translateY(-100%)';
            if (readerControls) readerControls.style.transform = 'translateY(-100%)';
        } else if (scrollDelta < -5 || currentScrollTop <= 100) {
            navbar.style.transform = 'translateY(0)';
            if (readerControls) readerControls.style.transform = 'translateY(0)';
        }

        lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => { handleScroll(); ticking = false; });
            ticking = true;
        }
    });
}

// Scroll effect (class .scrolled on nav)
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (nav) {
        nav.classList.toggle('scrolled', window.scrollY > 20);
    }
});

// Init
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initializeNavbar, 50);
} else {
    document.addEventListener('DOMContentLoaded', initializeNavbar);
}
