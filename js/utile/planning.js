class PlanningManager {
    constructor() {
        this.currentView = localStorage.getItem('planningView') || 'calendar';
        // Utiliser la date actuelle au lieu d'une date fixe
        this.currentDate = new Date();
        this.selectedManga = localStorage.getItem('selectedManga') || 'all';
        this.notifications = JSON.parse(localStorage.getItem('planningNotifications') || '{}');
        
        // Sorties dynamiques - sera mis à jour automatiquement
        this.releases = this.generateReleases();
        
        this.init();
    }

    generateReleases() {
        // Génération des sorties pour le mois en cours et les suivants
        const releases = {};
        
        // Sorties pour décembre 2025
        const december2025Releases = {
            "2026-03-28": [
                { 
                    title: "Catenaccio", 
                    chapter: "47 jusqu'au 56", 
                    type: "Manga",
                    time: "17:00-18:00",
                    cover: "images/cover/Catenaccio.png",
                    url: "/Manga/Catenaccio.html"
                }
            ]
        };

        // Sorties pour janvier 2026
        const january2026Releases = {
            "2026-03-30": [
                { 
                    title: "Tokyo Underworld", 
                    chapter: "39 jusqu'au 46", 
                    type: "Manga",
                    time: "16:00-17:00",
                    cover: "images/cover/TokyoUnderworld.jpg",
                    url: "/Manga/Tokyo Underworld.html"
                }
            ]
        };

        // Test notification - sortie du jour
        const testRelease = {
            "2026-02-28": [
                {
                    title: "Ao No Exorcist",
                    chapter: "167",
                    type: "Manga",
                    time: "15:00-16:00",
                    cover: "images/cover/AoNoExorcist.jpg",
                    url: "/Manga/Ao No Exorcist.html"
                }
            ]
        };

        // Fusionner toutes les sorties
        Object.assign(releases, december2025Releases, january2026Releases, testRelease);

        return releases;
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.renderCurrentView();
        this.startCountdowns();
        this.hideLoading();
    }

    setupElements() {
        this.elements = {
            viewButtons: document.querySelectorAll('.view-btn'),
            mangaFilter: document.getElementById('mangaFilter'),
            calendarDays: document.getElementById('calendarDays'),
            currentMonth: document.getElementById('currentMonth'),
            prevMonth: document.getElementById('prevMonth'),
            nextMonth: document.getElementById('nextMonth'),
            calendarView: document.getElementById('calendarViewContainer'),
            listView: document.getElementById('listViewContainer'),
            timelineView: document.getElementById('timelineViewContainer'),
            exportBtn: document.getElementById('exportCalendar'),
            notifyBtn: document.getElementById('toggleNotifications')
        };
    }

    setupEventListeners() {
        // Vue switcher
        this.elements.viewButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchView(btn.dataset.view));
        });

        // Filtre manga
        if (this.elements.mangaFilter) {
            this.elements.mangaFilter.addEventListener('change', (e) => {
                this.selectedManga = e.target.value;
                localStorage.setItem('selectedManga', this.selectedManga);
                this.renderCurrentView();
            });
        }

        // Navigation mois
        if (this.elements.prevMonth) {
            this.elements.prevMonth.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.renderCalendar();
            });
        }

        if (this.elements.nextMonth) {
            this.elements.nextMonth.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.renderCalendar();
            });
        }

        // Export calendrier
        if (this.elements.exportBtn) {
            this.elements.exportBtn.addEventListener('click', () => this.exportCalendar());
        }

        // Notifications
        if (this.elements.notifyBtn) {
            this.elements.notifyBtn.addEventListener('click', () => this.toggleNotifications());
        }
    }

    switchView(view) {
        this.currentView = view;
        localStorage.setItem('planningView', view);
        
        // Update buttons
        this.elements.viewButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        this.renderCurrentView();
    }

    renderCurrentView() {
        // Hide all views
        [this.elements.calendarView, this.elements.listView, this.elements.timelineView].forEach(el => {
            if (el) el.style.display = 'none';
        });

        // Show selected view
        switch(this.currentView) {
            case 'calendar':
                if (this.elements.calendarView) this.elements.calendarView.style.display = 'block';
                this.renderCalendar();
                break;
            case 'list':
                if (this.elements.listView) this.elements.listView.style.display = 'block';
                this.renderList();
                break;
            case 'timeline':
                if (this.elements.timelineView) this.elements.timelineView.style.display = 'block';
                this.renderTimeline();
                break;
        }
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Mettre à jour le titre du mois
        this.elements.currentMonth.textContent = new Intl.DateTimeFormat('fr-FR', {
            month: 'long',
            year: 'numeric'
        }).format(this.currentDate);

        this.elements.calendarDays.innerHTML = '';
        
        // Empty days
        for (let i = 0; i < firstDay; i++) {
            this.addDayToCalendar('', true);
        }

        // Month days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayReleases = this.getFilteredReleases(dateStr);
            const hasReleases = dayReleases.length > 0;
            this.addDayToCalendar(day, false, hasReleases, dateStr, dayReleases.length);
        }
    }

    addDayToCalendar(day, isEmpty, hasReleases = false, dateStr = '', count = 0) {
        const dayElement = document.createElement('div');
        dayElement.className = `calendar-day ${isEmpty ? 'empty' : ''} ${hasReleases ? 'has-releases' : ''}`;
        
        if (!isEmpty) {
            const today = new Date();
            const dayDate = new Date(dateStr);
            const isToday = dayDate.toDateString() === today.toDateString();
            
            if (isToday) dayElement.classList.add('today');
            
            dayElement.innerHTML = `
                <span class="day-number">${day}</span>
                ${hasReleases ? `<span class="release-count">${count}</span>` : ''}
            `;
            
            dayElement.addEventListener('click', () => this.showDayReleases(dateStr));
        }

        this.elements.calendarDays.appendChild(dayElement);
    }

    renderList() {
        const listContainer = this.elements.listView.querySelector('.list-content');
        if (!listContainer) return;

        const allReleases = this.getAllFilteredReleases();
        
        if (allReleases.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <div class="text-6xl mb-4">📭</div>
                    <h3 class="text-2xl font-bold mb-2">Aucune sortie prévue</h3>
                    <p class="text-gray-400">Aucune sortie ne correspond à vos filtres</p>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = allReleases.map(item => {
            const countdown = this.getCountdown(item.dateStr, item.release.time);
            return `
                <div class="list-item card rounded-xl p-4" data-date="${item.dateStr}">
                    <div class="flex gap-4">
                        <img src="${item.release.cover}" alt="${item.release.title}" class="w-20 h-28 object-cover rounded-lg">
                        <div class="flex-1">
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <h3 class="font-bold text-lg">${item.release.title}</h3>
                                    <p class="text-indigo-400">Chapitre ${item.release.chapter}</p>
                                </div>
                                <div class="text-right">
                                    <div class="text-sm text-gray-400">${this.formatDate(item.dateStr)}</div>
                                    <div class="text-sm font-medium text-indigo-400">${item.release.time}</div>
                                </div>
                            </div>
                            ${countdown ? `
                                <div class="countdown-badge">
                                    ⏱️ ${countdown}
                                </div>
                            ` : ''}
                            <div class="flex gap-2 mt-3">
                                <button onclick="planningManager.toggleNotification('${item.dateStr}', '${item.release.title}')" 
                                        class="btn-notify ${this.hasNotification(item.dateStr, item.release.title) ? 'active' : ''}">
                                    🔔 Rappel
                                </button>
                                <a href="${item.release.url}" class="btn-read">
                                    📖 Voir le manga
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderTimeline() {
        const timelineContainer = this.elements.timelineView.querySelector('.timeline-content');
        if (!timelineContainer) return;

        const allReleases = this.getAllFilteredReleases();
        
        if (allReleases.length === 0) {
            timelineContainer.innerHTML = `
                <div class="empty-state">
                    <div class="text-6xl mb-4">📅</div>
                    <h3 class="text-2xl font-bold mb-2">Timeline vide</h3>
                    <p class="text-gray-400">Aucune sortie ne correspond à vos filtres</p>
                </div>
            `;
            return;
        }

        // Group by date
        const grouped = {};
        allReleases.forEach(item => {
            if (!grouped[item.dateStr]) grouped[item.dateStr] = [];
            grouped[item.dateStr].push(item.release);
        });

        timelineContainer.innerHTML = Object.entries(grouped).map(([date, releases], index) => `
            <div class="timeline-item" style="animation-delay: ${index * 0.1}s">
                <div class="timeline-marker"></div>
                <div class="timeline-content-wrapper">
                    <div class="timeline-date">${this.formatDate(date)}</div>
                    <div class="timeline-releases">
                        ${releases.map(release => {
                            const countdown = this.getCountdown(date, release.time);
                            return `
                                <div class="timeline-release card rounded-xl p-4">
                                    <div class="flex gap-3 items-center">
                                        <img src="${release.cover}" alt="${release.title}" class="w-16 h-20 object-cover rounded-lg">
                                        <div class="flex-1">
                                            <h4 class="font-bold">${release.title}</h4>
                                            <p class="text-sm text-indigo-400">Chapitre ${release.chapter}</p>
                                            <p class="text-sm text-gray-400">${release.time}</p>
                                            ${countdown ? `<div class="text-xs text-green-400 mt-1">⏱️ ${countdown}</div>` : ''}
                                        </div>
                                        <button onclick="planningManager.toggleNotification('${date}', '${release.title}')" 
                                                class="btn-notify-small ${this.hasNotification(date, release.title) ? 'active' : ''}">
                                            🔔
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    showDayReleases(dateStr) {
        const releases = this.getFilteredReleases(dateStr);
        if (releases.length === 0) return;

        const modal = document.createElement('div');
        modal.className = 'releases-modal';
        modal.innerHTML = `
            <div class="modal-content card rounded-xl">
                <div class="modal-header">
                    <h3>Sorties du ${this.formatDate(dateStr)}</h3>
                    <button class="close-modal">✕</button>
                </div>
                <div class="modal-body">
                    ${releases.map(release => {
                        const countdown = this.getCountdown(dateStr, release.time);
                        return `
                            <div class="modal-release">
                                <img src="${release.cover}" alt="${release.title}">
                                <div class="release-info">
                                    <h4>${release.title}</h4>
                                    <p>Chapitre ${release.chapter}</p>
                                    <span class="release-time">🕒 ${release.time}</span>
                                    ${countdown ? `<span class="countdown-text">⏱️ ${countdown}</span>` : ''}
                                </div>
                                <div class="release-actions">
                                    <button onclick="planningManager.toggleNotification('${dateStr}', '${release.title}')" 
                                            class="btn-notify ${this.hasNotification(dateStr, release.title) ? 'active' : ''}">
                                        🔔
                                    </button>
                                    <a href="${release.url}" class="btn-read">📖</a>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);

        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 300);
            }
        });
    }

    getFilteredReleases(dateStr) {
        const releases = this.releases[dateStr] || [];
        if (this.selectedManga === 'all') return releases;
        return releases.filter(r => r.title === this.selectedManga);
    }

    getAllFilteredReleases() {
        const all = [];
        Object.entries(this.releases).forEach(([date, releases]) => {
            const filtered = this.selectedManga === 'all' 
                ? releases 
                : releases.filter(r => r.title === this.selectedManga);
            filtered.forEach(release => {
                all.push({ dateStr: date, release });
            });
        });
        return all.sort((a, b) => new Date(a.dateStr) - new Date(b.dateStr));
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    }

    getCountdown(dateStr, time) {
        const [hours, minutes] = time.split(':');
        const releaseDate = new Date(dateStr);
        releaseDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        const now = new Date();
        const diff = releaseDate - now;
        
        if (diff < 0) return null;
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) return `Dans ${days}j ${hrs}h`;
        if (hrs > 0) return `Dans ${hrs}h ${mins}min`;
        return `Dans ${mins}min`;
    }

    startCountdowns() {
        setInterval(() => {
            if (this.currentView === 'list' || this.currentView === 'timeline') {
                this.renderCurrentView();
            }
        }, 60000); // Update every minute
    }

    toggleNotification(dateStr, mangaTitle) {
        const key = `${dateStr}-${mangaTitle}`;
        if (this.notifications[key]) {
            delete this.notifications[key];
            // Annuler le vrai rappel
            if (window.notificationScheduler) {
                window.notificationScheduler.unschedule(dateStr, mangaTitle);
            }
        } else {
            this.notifications[key] = {
                date: dateStr,
                manga: mangaTitle,
                enabled: true
            };
            // Programmer un vrai rappel navigateur
            const dayReleases = this.releases[dateStr];
            const release = dayReleases ? dayReleases.find(r => r.title === mangaTitle) : null;
            if (release && window.notificationScheduler) {
                window.notificationScheduler.schedule(dateStr, release.time, mangaTitle);
            }
        }
        localStorage.setItem('planningNotifications', JSON.stringify(this.notifications));
        this.renderCurrentView();

        if (window.toast) {
            window.toast.info(
                this.notifications[key]
                    ? `🔔 Rappel activé pour ${mangaTitle}`
                    : `🔕 Rappel désactivé pour ${mangaTitle}`
            );
        }
    }

    hasNotification(dateStr, mangaTitle) {
        return !!this.notifications[`${dateStr}-${mangaTitle}`];
    }

    async toggleNotifications() {
        if (!('Notification' in window)) {
            if (window.toast) window.toast.error('Votre navigateur ne supporte pas les notifications');
            return;
        }

        if (Notification.permission === 'granted') {
            if (window.toast) window.toast.success('Notifications déjà activées ! Utilisez les 🔔 pour programmer vos rappels.');
            return;
        }

        if (Notification.permission === 'denied') {
            if (window.toast) window.toast.error('Notifications bloquées. Réactivez-les dans les paramètres de votre navigateur.');
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                if (window.toast) window.toast.success('Notifications activées ! Vous recevrez un rappel 1h avant chaque sortie.');
                // Enregistrer le service worker
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.register('/sw.js').catch(() => {});
                }
            } else {
                if (window.toast) window.toast.warning('Notifications refusées. Vous pouvez toujours exporter vers Google Calendar.');
            }
        } catch (e) {
            if (window.toast) window.toast.error('Erreur lors de la demande de permission');
        }
    }

    exportCalendar() {
        const icsContent = this.generateICS();
        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lanortrad-planning.ics';
        a.click();
        URL.revokeObjectURL(url);
        
        if (window.toast) {
            window.toast.success('Calendrier exporté ! 📅');
        }
    }

    generateICS() {
        let ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//LanorTrad//Planning//FR
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:LanorTrad - Sorties Manga
X-WR-TIMEZONE:Europe/Paris
X-WR-CALDESC:Calendrier des sorties de chapitres LanorTrad
`;

        Object.entries(this.releases).forEach(([date, releases]) => {
            releases.forEach(release => {
                const [hours, minutes] = release.time.split(':');
                const startDate = new Date(date);
                startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                
                const endDate = new Date(startDate);
                endDate.setHours(endDate.getHours() + 1);
                
                ics += `BEGIN:VEVENT
UID:${date}-${release.title}@lanortrad.netlify.app
DTSTAMP:${this.formatICSDate(new Date())}
DTSTART:${this.formatICSDate(startDate)}
DTEND:${this.formatICSDate(endDate)}
SUMMARY:${release.title} - Chapitre ${release.chapter}
DESCRIPTION:Nouvelle sortie sur LanorTrad
LOCATION:https://lanortrad.netlify.app
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:${release.title} sort dans 1 heure !
END:VALARM
END:VEVENT
`;
            });
        });

        ics += 'END:VCALENDAR';
        return ics;
    }

    formatICSDate(date) {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }

    hideLoading() {
        setTimeout(() => {
            const loader = document.querySelector('.loading-container');
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => loader.remove(), 300);
            }
        }, 1000);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.planningManager = new PlanningManager();
});