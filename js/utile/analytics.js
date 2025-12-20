class ReadingAnalytics {
    constructor() {
        this.stats = this.loadStats();
    }

    loadStats() {
        return JSON.parse(localStorage.getItem('lanortrad_stats') || JSON.stringify({
            totalChaptersRead: 0,
            totalReadingTime: 0, // en secondes
            chaptersPerManga: {},
            readingStreak: 0,
            lastReadDate: null,
            achievements: []
        }));
    }

    saveStats() {
        localStorage.setItem('lanortrad_stats', JSON.stringify(this.stats));
    }

    trackChapterRead(mangaId, chapterNumber, readingTime) {
        this.stats.totalChaptersRead++;
        this.stats.totalReadingTime += readingTime;
        
        if (!this.stats.chaptersPerManga[mangaId]) {
            this.stats.chaptersPerManga[mangaId] = 0;
        }
        this.stats.chaptersPerManga[mangaId]++;
        
        this.updateStreak();
        this.checkAchievements();
        this.saveStats();
    }

    updateStreak() {
        const today = new Date().toDateString();
        const lastRead = this.stats.lastReadDate;
        
        if (!lastRead) {
            this.stats.readingStreak = 1;
        } else {
            const lastReadDate = new Date(lastRead).toDateString();
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            
            if (lastReadDate === today) {
                // Déjà lu aujourd'hui
                return;
            } else if (lastReadDate === yesterday) {
                // Continue la streak
                this.stats.readingStreak++;
            } else {
                // Streak cassée
                this.stats.readingStreak = 1;
            }
        }
        
        this.stats.lastReadDate = today;
    }

    checkAchievements() {
        const achievements = [
            {
                id: 'first_chapter',
                name: 'Premier pas',
                description: 'Lire votre premier chapitre',
                condition: () => this.stats.totalChaptersRead >= 1,
                icon: '🎯'
            },
            {
                id: 'marathon',
                name: 'Marathon de lecture',
                description: 'Lire 10 chapitres',
                condition: () => this.stats.totalChaptersRead >= 10,
                icon: '🏃'
            },
            {
                id: 'bookworm',
                name: 'Ver de bibliothèque',
                description: 'Lire 50 chapitres',
                condition: () => this.stats.totalChaptersRead >= 50,
                icon: '📚'
            },
            {
                id: 'streak_7',
                name: 'Une semaine complète',
                description: 'Lire pendant 7 jours consécutifs',
                condition: () => this.stats.readingStreak >= 7,
                icon: '🔥'
            }
        ];

        achievements.forEach(achievement => {
            if (achievement.condition() && !this.stats.achievements.includes(achievement.id)) {
                this.stats.achievements.push(achievement.id);
                this.showAchievementUnlocked(achievement);
            }
        });
    }

    showAchievementUnlocked(achievement) {
        if (window.toast) {
            window.toast.success(`${achievement.icon} Succès débloqué : ${achievement.name}`, 5000);
        }
    }

    getReadableTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}min`;
        }
        return `${minutes}min`;
    }
}

const analytics = new ReadingAnalytics();