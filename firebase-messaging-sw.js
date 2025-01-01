importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Remplacez les XXX par vos informations Firebase
firebase.initializeApp({
    apiKey: "AIzaSyDscyIPMdiBVYl795ScrjdHeqTTvwJVA9I",
    authDomain: "lanortrad-88faf.firebaseapp.com",
    projectId: "lanortrad-88faf",
    storageBucket: "lanortrad-88faf.firebasestorage.app",
    messagingSenderId: "1065105299857",
    appId: "1:1065105299857:web:55c69231d7b4944472a230"
});

const messaging = firebase.messaging();

// Gestion des notifications en arrière-plan
messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/images/Lanor/Logo.jpg',
        badge: '/images/Lanor/Logo.jpg',
        requireInteraction: true
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});