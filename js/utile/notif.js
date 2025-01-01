// Remplacez les XXX par vos informations Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDscyIPMdiBVYl795ScrjdHeqTTvwJVA9I",
    authDomain: "lanortrad-88faf.firebaseapp.com",
    projectId: "lanortrad-88faf",
    storageBucket: "lanortrad-88faf.firebasestorage.app",
    messagingSenderId: "1065105299857",
    appId: "1:1065105299857:web:55c69231d7b4944472a230"
};

// Initialisation de Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Fonction pour demander la permission et configurer les notifications
async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            // Obtention du token Firebase
            const token = await messaging.getToken();
            console.log('Token Firebase:', token);
            
            // Mise à jour du bouton
            const button = document.getElementById('notifButton');
            button.textContent = 'Notifications activées';
            button.classList.add('bg-green-600');
            button.classList.remove('bg-indigo-600');
            
            // Stockage du statut
            localStorage.setItem('notificationsEnabled', 'true');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de l\'activation des notifications');
    }
}

// Gestion des notifications quand le site est ouvert
messaging.onMessage((payload) => {
    const notification = new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/images/Lanor/Logo.jpg',
        badge: '/images/Lanor/Logo.jpg',
        requireInteraction: true
    });
});

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    const notifButton = document.getElementById('notifButton');
    if (notifButton) {
        notifButton.addEventListener('click', requestNotificationPermission);
        
        // Restauration de l'état des notifications
        if (localStorage.getItem('notificationsEnabled') === 'true') {
            notifButton.textContent = 'Notifications activées';
            notifButton.classList.add('bg-green-600');
            notifButton.classList.remove('bg-indigo-600');
        }
    }
});