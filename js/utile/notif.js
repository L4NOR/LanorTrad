// Vérification du support des notifications
function checkNotificationSupport() {
    if (!('Notification' in window)) {
        alert('Votre navigateur ne supporte pas les notifications');
        return false;
    }
    return true;
}

// Demande de permission pour les notifications
async function requestNotificationPermission() {
    if (!checkNotificationSupport()) return;
    
    try {
        const permission = await Notification.requestPermission();
        updateButtonState(permission);
        return permission;
    } catch (error) {
        console.error('Erreur lors de la demande de permission:', error);
        alert('Une erreur est survenue lors de la demande de permission');
        return 'denied';
    }
}

// Mise à jour de l'état du bouton
function updateButtonState(permission) {
    const button = document.getElementById('notifButton');
    if (!button) return;
    
    if (permission === 'granted') {
        button.textContent = 'Notifications activées';
        button.classList.add('bg-green-600');
        button.classList.remove('bg-indigo-600');
        localStorage.setItem('notificationsEnabled', 'true');
    } else {
        button.textContent = 'Activer les notifications';
        button.classList.remove('bg-green-600');
        button.classList.add('bg-indigo-600');
        localStorage.removeItem('notificationsEnabled');
    }
}

// Fonction d'envoi de notification
function sendCustomNotification(title, message) {
    if (!checkNotificationSupport()) return;
    
    if (Notification.permission !== 'granted') {
        alert('Les notifications ne sont pas autorisées');
        return;
    }
    
    try {
        new Notification(title, {
            body: message,
            icon: '/images/Lanor/Logo.jpg',
            badge: '/images/Lanor/Logo.jpg'
        });
    } catch (error) {
        console.error('Erreur lors de l\'envoi de la notification:', error);
        alert('Une erreur est survenue lors de l\'envoi de la notification');
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    const notifButton = document.getElementById('notifButton');
    
    if (notifButton) {
        updateButtonState(Notification.permission);
        notifButton.addEventListener('click', requestNotificationPermission);
    }
});

// Exposition des fonctions pour l'admin
window.LanorNotifications = {
    send: sendCustomNotification,
    request: requestNotificationPermission
};