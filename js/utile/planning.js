// calendar.js
document.addEventListener('DOMContentLoaded', function() {
    // Simulation des données de sorties
    const releases = {
        "2025-03-01": [
            { title: "Catenaccio", chapter: "9", type: "Manga"},
            { title: "Tougen Anki", chapter: "187 & 188", type: "Manga"}
        ],
        "2025-03-03": [
            { title: "Tokyo Underworld", chapter: "29 & 29.5", type: "Manga"}
        ],
        "2025-03-05": [
            { title: "Wild Strawberry", chapter: "9", type: "Manga"},
            { title: "Satsudou", chapter: "17", type: "Manga"}
        ],
        "2025-03-07": [
            { title: "Tokyo Underworld", chapter: "30", type: "Manga"}
        ],
        "2025-03-08": [
            { title: "Catenaccio", chapter: "10", type: "Manga"},
            { title: "Tougen Anki", chapter: "189", type: "Manga"}
        ],
        "2025-03-10": [
            { title: "Tokyo Underworld", chapter: "31", type: "Manga"}
        ],
        "2025-03-12": [
            { title: "Wild Strawberry", chapter: "10", type: "Manga"},
            { title: "Satsudou", chapter: "18", type: "Manga"}
        ],
        "2025-03-14": [
            { title: "Tokyo Underworld", chapter: "32", type: "Manga"}
        ],
    };

    // Éléments DOM
    const calendarDays = document.getElementById('calendarDays');
    const currentMonthDisplay = document.getElementById('currentMonth');
    const releasesContainer = document.getElementById('releasesContainer');
    const releasesDate = document.getElementById('releasesDate');
    const releasesList = document.getElementById('releasesList');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');

    // État actuel
    let currentDate = new Date(2025, 2); // Mars 2025
    let selectedDate = null;

    // Initialisation
    renderCalendar();
    hideLoading();

    // Gestionnaires d'événements
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        currentMonthDisplay.textContent = new Intl.DateTimeFormat('fr-FR', {
            month: 'long',
            year: 'numeric'
        }).format(currentDate);

        calendarDays.innerHTML = '';
        
        // Jours vides du début
        for (let i = 0; i < firstDay; i++) {
            addDayToCalendar('', true);
        }

        // Jours du mois
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasReleases = releases[dateStr] !== undefined;
            addDayToCalendar(day, false, hasReleases, dateStr);
        }
    }

    function addDayToCalendar(day, isEmpty, hasReleases = false, dateStr = '') {
        const dayElement = document.createElement('div');
        dayElement.className = `calendar-day ${isEmpty ? 'empty' : ''} ${hasReleases ? 'has-releases' : ''}`;
        dayElement.textContent = day;

        if (!isEmpty) {
            dayElement.addEventListener('click', () => showReleases(dateStr));
        }

        calendarDays.appendChild(dayElement);
    }

    function showReleases(dateStr) {
        const dayReleases = releases[dateStr];
        if (!dayReleases) return;

        const [year, month, day] = dateStr.split('-');
        releasesDate.textContent = `Sorties du ${day} ${new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(new Date(year, month - 1))}`;
        
        releasesList.innerHTML = dayReleases.map(release => `
            <div class="release-card">
                <div class="release-card-header">
                    <h3 class="release-title">${release.title}</h3>
                </div>
                <div class="release-info">
                    <span>Chapitre ${release.chapter}</span>
                </div>
            </div>
        `).join('');

        releasesContainer.classList.remove('hidden');
    }

    function hideLoading() {
        setTimeout(() => {
            document.querySelector('.loading-container').style.display = 'none';
        }, 2000);
    }
});