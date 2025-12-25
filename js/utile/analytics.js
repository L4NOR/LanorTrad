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
            readingDates: [],
            nightReadingCount: 0,
            weekendReadingCount: 0,
            marathonSessions: 0,
            diverseReadingCount: 0,
            oneshotsRead: [] // ✨ NOUVEAU : Liste des oneshots lus
        }));
    }

    saveStats() {
        localStorage.setItem('lanortrad_stats', JSON.stringify(this.stats));
    }

    trackChapterRead(mangaId, chapterNumber, readingTime = 5) {
        // ✅ Gérer les oneshots différemment
        const isOneshot = chapterNumber === 'oneshot' || chapterNumber === '1' && this.isOneshotManga(mangaId);
        
        this.stats.totalChaptersRead++;
        this.stats.totalReadingTime += readingTime;
        
        // ✨ Si c'est un oneshot, l'ajouter à la liste
        if (isOneshot) {
            if (!this.stats.oneshotsRead) this.stats.oneshotsRead = [];
            if (!this.stats.oneshotsRead.includes(mangaId)) {
                this.stats.oneshotsRead.push(mangaId);
            }
        }
        
        // Stats par manga
        if (!this.stats.mangaStats[mangaId]) {
            this.stats.mangaStats[mangaId] = {
                chaptersRead: 0,
                readingTime: 0,
                lastRead: Date.now(),
                isOneshot: isOneshot // ✨ Marquer si c'est un oneshot
            };
        }
        
        this.stats.mangaStats[mangaId].chaptersRead++;
        this.stats.mangaStats[mangaId].readingTime += readingTime;
        this.stats.mangaStats[mangaId].lastRead = Date.now();
        
        // Ajouter la date de lecture
        const today = new Date().toDateString();
        if (!this.stats.readingDates) this.stats.readingDates = [];
        if (!this.stats.readingDates.includes(today)) {
            this.stats.readingDates.push(today);
        }

        // Tracker lecture nocturne (22h - 6h)
        const hour = new Date().getHours();
        if (hour >= 22 || hour < 6) {
            this.stats.nightReadingCount = (this.stats.nightReadingCount || 0) + 1;
        }

        // Tracker lecture weekend
        const day = new Date().getDay();
        if (day === 0 || day === 6) {
            this.stats.weekendReadingCount = (this.stats.weekendReadingCount || 0) + 1;
        }

        // Tracker diversité de lecture
        const uniqueMangas = Object.keys(this.stats.mangaStats).length;
        this.stats.diverseReadingCount = uniqueMangas;
        
        this.updateStreak();
        this.checkAchievements();
        this.saveStats();
    }

    // ✨ NOUVEAU : Vérifier si un manga est un oneshot
    isOneshotManga(mangaId) {
        const oneshots = [
            'Countdown',
            'Gestation of Kalavinka',
            'Gestation Of Kalavinka',
            'In the White',
            'Sake to Sakana',
            'Sake To Sakana',
            'Second Coming'
        ];
        return oneshots.includes(mangaId);
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
            // Succès basiques
            {
                id: 'first_chapter',
                title: 'Premier pas',
                description: 'Lire votre premier chapitre',
                condition: () => this.stats.totalChaptersRead >= 1,
                icon: '🎯'
            },
            {
                id: 'chapter_5',
                title: 'Prise en main',
                description: 'Lire 5 chapitres',
                condition: () => this.stats.totalChaptersRead >= 5,
                icon: '📖'
            },
            {
                id: 'chapter_10',
                title: 'Lecteur assidu',
                description: 'Lire 10 chapitres',
                condition: () => this.stats.totalChaptersRead >= 10,
                icon: '📚'
            },
            {
                id: 'chapter_25',
                title: 'Collectionneur',
                description: 'Lire 25 chapitres',
                condition: () => this.stats.totalChaptersRead >= 25,
                icon: '📕'
            },
            {
                id: 'chapter_50',
                title: 'Dévoreur de mangas',
                description: 'Lire 50 chapitres',
                condition: () => this.stats.totalChaptersRead >= 50,
                icon: '📗'
            },
            {
                id: 'chapter_100',
                title: 'Otaku confirmé',
                description: 'Lire 100 chapitres',
                condition: () => this.stats.totalChaptersRead >= 100,
                icon: '🏆'
            },
            {
                id: 'chapter_200',
                title: 'Maître lecteur',
                description: 'Lire 200 chapitres',
                condition: () => this.stats.totalChaptersRead >= 200,
                icon: '👑'
            },
            {
                id: 'chapter_500',
                title: 'Légende vivante',
                description: 'Lire 500 chapitres',
                condition: () => this.stats.totalChaptersRead >= 500,
                icon: '⭐'
            },

            // ✨ NOUVEAU : Succès oneshots
            {
                id: 'first_oneshot',
                title: 'Histoire courte',
                description: 'Lire votre premier oneshot',
                condition: () => (this.stats.oneshotsRead || []).length >= 1,
                icon: '⭐'
            },
            {
                id: 'oneshot_collector',
                title: 'Collectionneur de oneshots',
                description: 'Lire 3 oneshots différents',
                condition: () => (this.stats.oneshotsRead || []).length >= 3,
                icon: '🌟'
            },
            {
                id: 'oneshot_master',
                title: 'Maître des oneshots',
                description: 'Lire tous les oneshots disponibles',
                condition: () => (this.stats.oneshotsRead || []).length >= 5,
                icon: '✨'
            },

            // Succès de série (streak)
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
                id: 'streak_14',
                title: 'Deux semaines !',
                description: 'Lire pendant 14 jours consécutifs',
                condition: () => this.stats.readingStreak >= 14,
                icon: '🎖️'
            },
            {
                id: 'streak_30',
                title: 'Lecteur quotidien',
                description: 'Lire pendant 30 jours consécutifs',
                condition: () => this.stats.readingStreak >= 30,
                icon: '🌟'
            },
            {
                id: 'streak_100',
                title: 'Centurion',
                description: 'Lire pendant 100 jours consécutifs',
                condition: () => this.stats.readingStreak >= 100,
                icon: '💎'
            },

            // Succès de temps
            {
                id: 'time_30',
                title: 'Demi-heure',
                description: 'Cumuler 30 minutes de lecture',
                condition: () => this.stats.totalReadingTime >= 30,
                icon: '⏱️'
            },
            {
                id: 'time_60',
                title: 'Une heure de lecture',
                description: 'Cumuler 60 minutes de lecture',
                condition: () => this.stats.totalReadingTime >= 60,
                icon: '⏰'
            },
            {
                id: 'time_180',
                title: 'Après-midi lecture',
                description: 'Cumuler 3 heures de lecture',
                condition: () => this.stats.totalReadingTime >= 180,
                icon: '☀️'
            },
            {
                id: 'time_300',
                title: 'Marathon de lecture',
                description: 'Cumuler 5 heures de lecture',
                condition: () => this.stats.totalReadingTime >= 300,
                icon: '🏃'
            },
            {
                id: 'time_600',
                title: 'Demi-journée',
                description: 'Cumuler 10 heures de lecture',
                condition: () => this.stats.totalReadingTime >= 600,
                icon: '🌙'
            },
            {
                id: 'time_1440',
                title: 'Journée entière',
                description: 'Cumuler 24 heures de lecture',
                condition: () => this.stats.totalReadingTime >= 1440,
                icon: '🌍'
            },

            // Succès de diversité
            {
                id: 'diverse_2',
                title: 'Explorateur',
                description: 'Lire 2 mangas différents',
                condition: () => this.stats.diverseReadingCount >= 2,
                icon: '🧭'
            },
            {
                id: 'diverse_3',
                title: 'Curieux',
                description: 'Lire 3 mangas différents',
                condition: () => this.stats.diverseReadingCount >= 3,
                icon: '🔍'
            },
            {
                id: 'diverse_5',
                title: 'Polyvalent',
                description: 'Lire 5 mangas différents',
                condition: () => this.stats.diverseReadingCount >= 5,
                icon: '🎨'
            },

            // Succès spéciaux
            {
                id: 'night_owl_10',
                title: 'Oiseau de nuit',
                description: 'Lire 10 chapitres entre 22h et 6h',
                condition: () => (this.stats.nightReadingCount || 0) >= 10,
                icon: '🦉'
            },
            {
                id: 'night_owl_25',
                title: 'Vampire',
                description: 'Lire 25 chapitres entre 22h et 6h',
                condition: () => (this.stats.nightReadingCount || 0) >= 25,
                icon: '🧛'
            },
            {
                id: 'weekend_10',
                title: 'Weekend warrior',
                description: 'Lire 10 chapitres le weekend',
                condition: () => (this.stats.weekendReadingCount || 0) >= 10,
                icon: '🎮'
            },
            {
                id: 'weekend_25',
                title: 'Roi du weekend',
                description: 'Lire 25 chapitres le weekend',
                condition: () => (this.stats.weekendReadingCount || 0) >= 25,
                icon: '👑'
            },

            // Succès par manga spécifique
            {
                id: 'manga_complete_10',
                title: 'Fan dévoué',
                description: 'Lire 10 chapitres d\'un même manga',
                condition: () => {
                    return Object.values(this.stats.mangaStats).some(
                        manga => manga.chaptersRead >= 10 && !manga.isOneshot
                    );
                },
                icon: '❤️'
            },
            {
                id: 'manga_complete_50',
                title: 'Super fan',
                description: 'Lire 50 chapitres d\'un même manga',
                condition: () => {
                    return Object.values(this.stats.mangaStats).some(
                        manga => manga.chaptersRead >= 50 && !manga.isOneshot
                    );
                },
                icon: '💖'
            },
            {
                id: 'manga_complete_100',
                title: 'Ultra fan',
                description: 'Lire 100 chapitres d\'un même manga',
                condition: () => {
                    return Object.values(this.stats.mangaStats).some(
                        manga => manga.chaptersRead >= 100 && !manga.isOneshot
                    );
                },
                icon: '💝'
            },

            // Succès de vitesse
            {
                id: 'speed_reader',
                title: 'Lecteur rapide',
                description: 'Lire 5 chapitres en une journée',
                condition: () => {
                    const today = new Date().toDateString();
                    return this.stats.lastReadDate === today && 
                           this.stats.totalChaptersRead >= 5;
                },
                icon: '⚡'
            },

            // Succès nostalgique
            {
                id: 'comeback',
                title: 'De retour !',
                description: 'Revenir après une pause',
                condition: () => {
                    if (!this.stats.lastReadDate) return false;
                    const daysSinceLastRead = Math.floor(
                        (Date.now() - new Date(this.stats.lastReadDate).getTime()) / 86400000
                    );
                    return daysSinceLastRead >= 7 && this.stats.totalChaptersRead > 5;
                },
                icon: '🔄'
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
            achievements: this.stats.achievements,
            nightReadingCount: this.stats.nightReadingCount || 0,
            weekendReadingCount: this.stats.weekendReadingCount || 0,
            diverseReadingCount: this.stats.diverseReadingCount || 0,
            oneshotsRead: this.stats.oneshotsRead || [] // ✨ Inclure les oneshots lus
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