/* ========================================
   NOTIFICATION SCHEDULER - LanorTrad
   Vrais rappels navigateur pour les sorties
   ======================================== */

class NotificationScheduler {
    constructor() {
        this.STORAGE_KEY = 'lanortrad_scheduled_notifications';
        this.CHECK_INTERVAL = 60000; // 1 minute
        this.scheduled = this.load();
        this.startChecking();
    }

    load() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
        } catch {
            return {};
        }
    }

    save() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.scheduled));
    }

    schedule(dateStr, time, mangaTitle) {
        const key = `${dateStr}-${mangaTitle}`;

        // Parse le créneau horaire (ex: "17:00-18:00")
        let hours = 12, minutes = 0;
        if (time) {
            const startTime = time.split('-')[0].trim();
            const parts = startTime.split(':');
            if (parts.length === 2) {
                hours = parseInt(parts[0]) || 12;
                minutes = parseInt(parts[1]) || 0;
            }
        }

        const releaseDate = new Date(dateStr + 'T00:00:00');
        releaseDate.setHours(hours, minutes, 0, 0);

        this.scheduled[key] = {
            releaseTimestamp: releaseDate.getTime(),
            mangaTitle: mangaTitle,
            dateStr: dateStr,
            notifiedBefore: false,
            notifiedAt: false
        };
        this.save();
    }

    unschedule(dateStr, mangaTitle) {
        const key = `${dateStr}-${mangaTitle}`;
        delete this.scheduled[key];
        this.save();
    }

    startChecking() {
        this.check();
        this._interval = setInterval(() => this.check(), this.CHECK_INTERVAL);
    }

    check() {
        const now = Date.now();
        let changed = false;

        Object.keys(this.scheduled).forEach(key => {
            const notif = this.scheduled[key];
            if (!notif || !notif.releaseTimestamp) return;

            const timeDiff = notif.releaseTimestamp - now;

            // 1h avant : notification de rappel
            if (!notif.notifiedBefore && timeDiff > 0 && timeDiff <= 3600000) {
                const minutesLeft = Math.round(timeDiff / 60000);
                this.sendNotification(
                    `${notif.mangaTitle} sort bientôt !`,
                    `Sortie dans ${minutesLeft} minutes sur LanorTrad`
                );
                notif.notifiedBefore = true;
                changed = true;
            }

            // Au moment de la sortie (fenêtre de 5 min)
            if (!notif.notifiedAt && timeDiff <= 0 && timeDiff > -300000) {
                this.sendNotification(
                    `${notif.mangaTitle} est disponible !`,
                    `Le nouveau chapitre est maintenant disponible sur LanorTrad`
                );
                notif.notifiedAt = true;
                changed = true;
            }

            // Nettoyage : supprimer les notifications passées (> 1 jour)
            if (timeDiff < -86400000) {
                delete this.scheduled[key];
                changed = true;
            }
        });

        if (changed) this.save();
    }

    async sendNotification(title, body) {
        if (!('Notification' in window)) return;
        if (Notification.permission !== 'granted') return;

        try {
            // Service Worker notification (fonctionne en arrière-plan de l'onglet)
            if ('serviceWorker' in navigator) {
                const reg = await navigator.serviceWorker.ready;
                if (reg.showNotification) {
                    await reg.showNotification(title, {
                        body: body,
                        icon: '/images/icons/icon-192x192.png',
                        badge: '/images/icons/icon-72x72.png',
                        tag: 'lanortrad-release-' + Date.now(),
                        renotify: true,
                        vibrate: [200, 100, 200]
                    });
                    return;
                }
            }
        } catch (e) {
            // Fallback ci-dessous
        }

        // Fallback : Notification API classique
        try {
            new Notification(title, {
                body: body,
                icon: '/images/icons/icon-192x192.png'
            });
        } catch (e) {
            console.warn('Notification failed:', e);
        }
    }
}

// Initialisation globale
window.notificationScheduler = new NotificationScheduler();
