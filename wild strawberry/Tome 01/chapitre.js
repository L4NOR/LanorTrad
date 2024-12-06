document.getElementById('image-size').addEventListener('input', function() {
    const size = this.value;
    document.querySelectorAll('#chapter-images img').forEach(img => {
        img.style.width = size + '%'; 
    });
});

document.querySelector('.dropbtn').addEventListener('click', function() {
    document.querySelector('.dropdown').classList.toggle('show');
});

document.getElementById('chapter-select').addEventListener('change', function() {
    const selectedChapter = this.value;
    console.log('Chapitre sélectionné :', selectedChapter);
});

let isScanByScanMode = false;

function displayImage(index) {
    const images = document.querySelectorAll('#chapter-images img');
    images.forEach(img => {
        img.style.display = 'none';
    });
    images[index].style.display = 'block';
}

function nextImage() {
    const images = document.querySelectorAll('#chapter-images img');
    if (currentImageIndex < images.length - 1) {
        currentImageIndex++;
        displayImage(currentImageIndex);
    }
}

function previousImage() {
    if (currentImageIndex > 0) {
        currentImageIndex--;
        displayImage(currentImageIndex);
    }
}

document.getElementById('scan-by-scan').addEventListener('click', function() {
    console.log('Mode Scan par scan activé');
    isScanByScanMode = true;
    currentImageIndex = 0;
    displayImage(currentImageIndex);
    toggleNavigationButtons(true);
});

document.getElementById('all-in-one').addEventListener('click', function() {
    console.log('Mode Tout dans une page activé');
    isScanByScanMode = false;
    const images = document.querySelectorAll('#chapter-images img');
    images.forEach(img => {
        img.style.display = 'block';
    });
    toggleNavigationButtons(false);
});

document.getElementById('chapter-images').addEventListener('click', (event) => {
    if (isScanByScanMode && event.target.tagName === 'IMG') {
        const clickX = event.offsetX;
        const imgWidth = event.target.offsetWidth;
        
        if (clickX < imgWidth / 2) {
            previousImage();
        } else {
            nextImage();
        }
    }
});

window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName('dropdown-content');
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

const chapterImagesDiv = document.getElementById('chapter-images');
const images = chapterImagesDiv.querySelectorAll('img');
let currentImageIndex = 0;

document.getElementById('prev-chapter').addEventListener('click', () => {
    if (currentImageIndex > 0) {
        currentImageIndex--;
        displayImage(currentImageIndex);
    }
});

document.getElementById('next-chapter').addEventListener('click', () => {
    if (currentImageIndex < images.length - 1) {
        currentImageIndex++;
        displayImage(currentImageIndex);
    }
});

const parentElement = document.getElementById('chapter-images');
const divsToRemove = parentElement.querySelectorAll('div');
divsToRemove.forEach(div => {
    const imgChild = div.querySelector('img');
    if (div.childNodes.length === 1 && imgChild !== null) {
        parentElement.removeChild(div);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const scanByScanButton = document.getElementById('scan-by-scan');
    const allInOneButton = document.getElementById('all-in-one');
    const navigationDiv = document.querySelector('.navigation');

    function toggleNavigationButtons(visible) {
        navigationDiv.style.display = visible ? 'flex' : 'none';
    }

    scanByScanButton.click();
    console.log('Mode Scan par scan activé par défaut');
});

window.onload = function() {

    const images = document.getElementsByTagName('img');

    for (let i = 0; i < images.length; i++) {
        if (!images[i].complete) {
            images[i].addEventListener('load', function() {
                console.log('Image chargée :', images[i].src);
            });
        } else {
            console.log('Image déjà chargée :', images[i].src);
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {

    const images = document.getElementsByTagName('img');

    for (let i = 0; i < images.length; i++) {
        if (!images[i].complete) {
            images[i].addEventListener('load', function() {
                console.log('Image chargée :', images[i].src);
            });
        } else {
            console.log('Image déjà chargée :', images[i].src);
        }
    }
});