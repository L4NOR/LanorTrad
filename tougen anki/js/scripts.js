document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('intro').style.display = 'none';
        document.getElementById('main-content').style.opacity = '1';
    }, 3000);
});

document.querySelectorAll('.manga-card').forEach(card => {
    card.addEventListener('mouseover', () => {
        card.style.transform = 'scale(1.05)';
    });
    card.addEventListener('mouseout', () => {
        card.style.transform = 'scale(1)';
    });
});

const mangaImages = [
    'url("https://zupimages.net/up/24/18/cr1e.jpg")',
    'url("https://zupimages.net/up/23/31/n9ph.png")',
    'url("https://zupimages.net/up/24/18/1l8n.png")',
    'url("https://zupimages.net/up/24/18/hirq.jpg")',
    'url("https://zupimages.net/up/24/39/9vcs.png")',
    'url("https://zupimages.net/up/24/29/boqk.jpg")'
];

document.querySelectorAll('.manga-image').forEach((image, index) => {
    image.style.backgroundImage = mangaImages[index % mangaImages.length];
});