let currentZoom = 1;
let isFullscreen = false;

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('chapterSelect').addEventListener('change', handleChapterChange);
    
    document.getElementById('settingsBtn').addEventListener('click', toggleSettings);
    
    document.addEventListener('keydown', handleKeyPress);

    document.addEventListener('wheel', handleWheel, { passive: false });
}

function changeChapter(direction) {
    const select = document.getElementById('chapterSelect');
    const currentValue = parseInt(select.value);
    const newValue = currentValue + direction;
    
    if (newValue >= 1 && newValue <= 3) { 
        select.value = newValue;
        handleChapterChange();
    }
}

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