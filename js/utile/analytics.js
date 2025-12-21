class ReadingAnalytics {
    constructor() {
        this.stats = this.loadStats();
    }

    loadStats() {
        return JSON.parse(localStorage.getItem('lanortrad_stats') || JSON.stringify({
            totalChaptersRead: 0,
            totalReadingTime: 0,
            mangaStats: {},
            readingStreak: 0,
            lastReadDate: null,
            achievements: [],
            readingDates: []
        }));
    }

    saveStats() {
        localStorage.setItem('lanortrad_stats', JSON.stringify(this.stats));
    }

    trackChapterRead(mangaId, chapterNumber, readingTime = 5) {
        this.stats.totalChaptersRead++;
        this.stats.totalReadingTime += readingTime;
        
        // Stats par manga
        if (!this.stats.mangaStats[mangaId]) {
            this.stats.mangaStats[mangaId] = {
                chaptersRead: 0,
                readingTime: 0,
                lastRead: Date.now()
            };
        }
        
        this.stats.mangaStats[mangaId].chaptersRead++;
        this.stats.mangaStats[mangaId].readingTime += readingTime;
        this.stats.mangaStats[mangaId].lastRead = Date.now();
        
        // Ajouter la date de lecture
        const today = new Date().toDateString();
        if (!this.stats.readingDates.includes(today)) {
            this.stats.readingDates.push(today);
        }
        
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
                return;
            } else if (lastReadDate === yesterday) {
                this.stats.readingStreak++;
            } else {
                this.stats.readingStreak = 1;
            }
        }
        
        this.stats.lastReadDate = today;
    }

    checkAchievements() {
        const achievements = [
            {
                id: 'first_chapter',
                title: 'Premier pas',
                description: 'Lire votre premier chapitre',
                condition: () => this.stats.totalChaptersRead >= 1,
                icon: '🎯'
            },
            {
                id: 'chapter_10',
                title: 'Lecteur assidu',
                description: 'Lire 10 chapitres',
                condition: () => this.stats.totalChaptersRead >= 10,
                icon: '📖'
            },
            {
                id: 'chapter_50',
                title: 'Dévoreur de mangas',
                description: 'Lire 50 chapitres',
                condition: () => this.stats.totalChaptersRead >= 50,
                icon: '📚'
            },
            {
                id: 'chapter_100',
                title: 'Otaku confirmé',
                description: 'Lire 100 chapitres',
                condition: () => this.stats.totalChaptersRead >= 100,
                icon: '🏆'
            },
            {
                id: 'streak_3',
                title: 'Régularité',
                description: 'Lire pendant 3 jours consécutifs',
                condition: () => this.stats.readingStreak >= 3,
                icon: '🔥'
            },
            {
                id: 'streak_7',
                title: 'Une semaine complète',
                description: 'Lire pendant 7 jours consécutifs',
                condition: () => this.stats.readingStreak >= 7,
                icon: '💪'
            },
            {
                id: 'streak_30',
                title: 'Lecteur quotidien',
                description: 'Lire pendant 30 jours consécutifs',
                condition: () => this.stats.readingStreak >= 30,
                icon: '⭐'
            },
            {
                id: 'time_60',
                title: 'Une heure de lecture',
                description: 'Cumuler 60 minutes de lecture',
                condition: () => this.stats.totalReadingTime >= 60,
                icon: '⏰'
            },
            {
                id: 'time_300',
                title: 'Marathon de lecture',
                description: 'Cumuler 5 heures de lecture',
                condition: () => this.stats.totalReadingTime >= 300,
                icon: '🏃'
            }
        ];

        achievements.forEach(achievement => {
            const achievementData = this.stats.achievements.find(a => a.id === achievement.id);
            
            if (achievement.condition() && !achievementData) {
                const newAchievement = {
                    id: achievement.id,
                    title: achievement.title,
                    description: achievement.description,
                    icon: achievement.icon,
                    unlockedAt: Date.now()
                };
                
                this.stats.achievements.push(newAchievement);
                this.showAchievementUnlocked(newAchievement);
            }
        });
    }

    showAchievementUnlocked(achievement) {
        if (window.toast) {
            window.toast.success(`${achievement.icon} Succès débloqué : ${achievement.title}`, 5000);
        }
    }

    getStats() {
        return {
            totalChaptersRead: this.stats.totalChaptersRead,
            totalReadingTime: this.stats.totalReadingTime,
            mangaStats: this.stats.mangaStats,
            readingStreak: this.stats.readingStreak,
            achievements: this.stats.achievements
        };
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

// Créer l'instance globale
const readingAnalytics = new ReadingAnalytics();
window.readingAnalytics = readingAnalytics;