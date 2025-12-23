// chapitres.js - Version corrigée (délègue à AoNoExorcist.js)
let currentZoom = 1;
let isFullscreen = false;

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

function setupEventListeners() {
    const chapterSelect = document.getElementById('chapterSelect');
    if (chapterSelect) {
        chapterSelect.addEventListener('change', handleChapterChange);
    }
    
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', toggleSettings);
    }
    
    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('wheel', handleWheel, { passive: false });
}

// ❌ RETIRE CETTE FONCTION - Elle sera utilisée depuis AoNoExorcist.js
// function changeChapter(direction) { ... }

function handleChapterChange() {
    const chapterNumber = document.getElementById('chapterSelect').value;
    window.location.href = `Chapitre ${chapterNumber}.html`;
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function handleKeyPress(e) {
    // Gestion des raccourcis clavier
}

function handleWheel(e) {
    // Gestion du scroll
}

function toggleSettings() {
    // Toggle settings panel
}