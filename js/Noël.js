document.addEventListener('DOMContentLoaded', () => {
    const snowflakesContainer = document.querySelector('.snowflakes');
    for (let i = 0; i < 50; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        snowflake.textContent = '❄';
        snowflake.style.left = `${Math.random() * 100}vw`;
        snowflake.style.animationDuration = `${Math.random() * 5 + 5}s`;
        snowflakesContainer.appendChild(snowflake);
    }
});

// Ajoutez ceci dans votre fichier JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const notification = document.getElementById('gift-notification');
    const closeButton = notification.querySelector('.close-button');
    const giftButton = notification.querySelector('.gift-button');

    function checkNotificationStatus() {
        const lastShown = localStorage.getItem('lastGiftNotificationDate');
        const today = new Date().toDateString();
        
        if (lastShown !== today) {
            setTimeout(() => {
                notification.style.display = 'block';
                localStorage.setItem('lastGiftNotificationDate', today);
            }, 1500);
        }
    }

    closeButton.addEventListener('click', () => {
        notification.style.display = 'none';
    });

    giftButton.addEventListener('click', () => {
        window.location.href = './cadeau.html';
    });

    checkNotificationStatus();
});

