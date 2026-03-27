class ReadingAnalytics {
  constructor() {
    console.log("📊 ReadingAnalytics initialisé");

    // ✅ INITIALISATION DES STATS
    this.stats = this.loadStats();

    // Sécurité absolue
    if (!this.stats.mangaStats) this.stats.mangaStats = {};
    if (!this.stats.achievements) this.stats.achievements = [];
    if (!this.stats.readingDates) this.stats.readingDates = [];
    if (!this.stats.oneshotsRead) this.stats.oneshotsRead = [];

    console.log("📊 Stats chargées :", this.stats);
  }

  loadStats() {
    return JSON.parse(
      localStorage.getItem("lanortrad_stats") ||
        JSON.stringify({
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
          oneshotsRead: [], // ✨ Liste des oneshots lus
        })
    );
  }

  saveStats() {
    localStorage.setItem("lanortrad_stats", JSON.stringify(this.stats));
  }

  _normalizeMangaId(mangaId) {
    if (window.MANGA_DATA) {
      const lower = mangaId.toLowerCase();
      const manga = window.MANGA_DATA.find(m => m.id.toLowerCase() === lower || m.title.toLowerCase() === lower);
      if (manga) return manga.id;
    }
    return mangaId;
  }

  _findMangaKey(mangaId) {
    const normalized = this._normalizeMangaId(mangaId);
    if (this.stats.mangaStats[normalized]) return normalized;
    const lower = mangaId.toLowerCase();
    const existing = Object.keys(this.stats.mangaStats).find(k => k.toLowerCase() === lower);
    return existing || normalized;
  }

  trackChapterRead(mangaId, chapterNumber, readingTime = 5) {
    if (!this.stats) {
      console.warn("⚠️ Stats non initialisées, rechargement...");
      this.stats = this.loadStats();
    }

    if (!this.stats.mangaStats) this.stats.mangaStats = {};
    if (!this.stats.oneshotsRead) this.stats.oneshotsRead = [];

    if (!mangaId || !chapterNumber) return;

    // Normaliser le mangaId pour eviter les doublons de casse
    mangaId = this._findMangaKey(mangaId);

    const isOneshot =
      chapterNumber === "oneshot" || this.isOneshotManga(mangaId);

    console.log(
      `📊 Tracking: ${mangaId} - ${chapterNumber} | Oneshot: ${isOneshot}`
    );

    // Sécurité stats
    if (!this.stats.mangaStats[mangaId]) {
      this.stats.mangaStats[mangaId] = {
        chaptersRead: 0,
        readingTime: 0,
        lastRead: null,
        isOneshot: isOneshot,
      };
    }

    // ✅ ONESHOT = COMPTÉ UNE SEULE FOIS
    if (isOneshot) {
      if (!this.stats.oneshotsRead.includes(mangaId)) {
        this.stats.oneshotsRead.push(mangaId);
        this.stats.totalChaptersRead++;
        console.log(`⭐ Oneshot ajouté: ${mangaId}`);
      }
      this.stats.mangaStats[mangaId].chaptersRead = 1;
    } else {
      this.stats.totalChaptersRead++;
      this.stats.mangaStats[mangaId].chaptersRead++;
    }

    this.stats.totalReadingTime += readingTime;
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
      this.stats.weekendReadingCount =
        (this.stats.weekendReadingCount || 0) + 1;
    }

    // Tracker diversité de lecture
    const uniqueMangas = Object.keys(this.stats.mangaStats).length;
    this.stats.diverseReadingCount = uniqueMangas;

    this.updateStreak();
    this.checkAchievements();
    this.saveStats();

    console.log(
      `✅ Stats sauvegardées - Oneshots lus: ${
        (this.stats.oneshotsRead || []).length
      }`
    );
  }

  // ✨ Liste complète des oneshots
  isOneshotManga(mangaId) {
    const oneshots = [
      "countdown",
      "gestation of kalavinka",
      "in the white",
      "sake to sakana",
      "second coming",
    ];
    return oneshots.includes(mangaId.toLowerCase());
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
        id: "first_chapter",
        title: "Premier pas",
        description: "Lire votre premier chapitre",
        condition: () => this.stats.totalChaptersRead >= 1,
        icon: "🎯",
      },
      {
        id: "chapter_5",
        title: "Prise en main",
        description: "Lire 5 chapitres",
        condition: () => this.stats.totalChaptersRead >= 5,
        icon: "📖",
      },
      {
        id: "chapter_10",
        title: "Lecteur assidu",
        description: "Lire 10 chapitres",
        condition: () => this.stats.totalChaptersRead >= 10,
        icon: "📚",
      },
      {
        id: "chapter_25",
        title: "Collectionneur",
        description: "Lire 25 chapitres",
        condition: () => this.stats.totalChaptersRead >= 25,
        icon: "📕",
      },
      {
        id: "chapter_50",
        title: "Dévoreur de mangas",
        description: "Lire 50 chapitres",
        condition: () => this.stats.totalChaptersRead >= 50,
        icon: "📗",
      },
      {
        id: "chapter_100",
        title: "Otaku confirmé",
        description: "Lire 100 chapitres",
        condition: () => this.stats.totalChaptersRead >= 100,
        icon: "🏆",
      },
      {
        id: "chapter_200",
        title: "Maître lecteur",
        description: "Lire 200 chapitres",
        condition: () => this.stats.totalChaptersRead >= 200,
        icon: "👑",
      },
      {
        id: "chapter_500",
        title: "Légende vivante",
        description: "Lire 500 chapitres",
        condition: () => this.stats.totalChaptersRead >= 500,
        icon: "⭐",
      },

      // ✨ Succès oneshots
      {
        id: "first_oneshot",
        title: "Histoire courte",
        description: "Lire votre premier oneshot",
        condition: () => {
          const count = (this.stats.oneshotsRead || []).length;
          console.log(`🏆 Vérification first_oneshot: ${count} oneshots lus`);
          return count >= 1;
        },
        icon: "⭐",
      },
      {
        id: "oneshot_collector",
        title: "Collectionneur de oneshots",
        description: "Lire 3 oneshots différents",
        condition: () => {
          const count = (this.stats.oneshotsRead || []).length;
          console.log(
            `🏆 Vérification oneshot_collector: ${count} oneshots lus`
          );
          return count >= 3;
        },
        icon: "🌟",
      },
      {
        id: "oneshot_master",
        title: "Maître des oneshots",
        description: "Lire tous les oneshots disponibles (5)",
        condition: () => {
          const count = (this.stats.oneshotsRead || []).length;
          console.log(`🏆 Vérification oneshot_master: ${count} oneshots lus`);
          return count >= 5;
        },
        icon: "✨",
      },

      // Succès de série (streak)
      {
        id: "streak_3",
        title: "Régularité",
        description: "Lire pendant 3 jours consécutifs",
        condition: () => this.stats.readingStreak >= 3,
        icon: "🔥",
      },
      {
        id: "streak_7",
        title: "Une semaine complète",
        description: "Lire pendant 7 jours consécutifs",
        condition: () => this.stats.readingStreak >= 7,
        icon: "💪",
      },
      {
        id: "streak_14",
        title: "Deux semaines !",
        description: "Lire pendant 14 jours consécutifs",
        condition: () => this.stats.readingStreak >= 14,
        icon: "🎖️",
      },
      {
        id: "streak_30",
        title: "Lecteur quotidien",
        description: "Lire pendant 30 jours consécutifs",
        condition: () => this.stats.readingStreak >= 30,
        icon: "🌟",
      },
      {
        id: "streak_100",
        title: "Centurion",
        description: "Lire pendant 100 jours consécutifs",
        condition: () => this.stats.readingStreak >= 100,
        icon: "💎",
      },

      // Succès de temps
      {
        id: "time_30",
        title: "Demi-heure",
        description: "Cumuler 30 minutes de lecture",
        condition: () => this.stats.totalReadingTime >= 30,
        icon: "⏱️",
      },
      {
        id: "time_60",
        title: "Une heure de lecture",
        description: "Cumuler 60 minutes de lecture",
        condition: () => this.stats.totalReadingTime >= 60,
        icon: "⏰",
      },
      {
        id: "time_180",
        title: "Après-midi lecture",
        description: "Cumuler 3 heures de lecture",
        condition: () => this.stats.totalReadingTime >= 180,
        icon: "☀️",
      },
      {
        id: "time_300",
        title: "Marathon de lecture",
        description: "Cumuler 5 heures de lecture",
        condition: () => this.stats.totalReadingTime >= 300,
        icon: "🏃",
      },
      {
        id: "time_600",
        title: "Demi-journée",
        description: "Cumuler 10 heures de lecture",
        condition: () => this.stats.totalReadingTime >= 600,
        icon: "🌙",
      },
      {
        id: "time_1440",
        title: "Journée entière",
        description: "Cumuler 24 heures de lecture",
        condition: () => this.stats.totalReadingTime >= 1440,
        icon: "🌍",
      },

      // Succès de diversité
      {
        id: "diverse_2",
        title: "Explorateur",
        description: "Lire 2 mangas différents",
        condition: () => this.stats.diverseReadingCount >= 2,
        icon: "🧭",
      },
      {
        id: "diverse_3",
        title: "Curieux",
        description: "Lire 3 mangas différents",
        condition: () => this.stats.diverseReadingCount >= 3,
        icon: "🔍",
      },
      {
        id: "diverse_5",
        title: "Polyvalent",
        description: "Lire 5 mangas différents",
        condition: () => this.stats.diverseReadingCount >= 5,
        icon: "🎨",
      },

      // Succès spéciaux
      {
        id: "night_owl_10",
        title: "Oiseau de nuit",
        description: "Lire 10 chapitres entre 22h et 6h",
        condition: () => (this.stats.nightReadingCount || 0) >= 10,
        icon: "🦉",
      },
      {
        id: "night_owl_25",
        title: "Vampire",
        description: "Lire 25 chapitres entre 22h et 6h",
        condition: () => (this.stats.nightReadingCount || 0) >= 25,
        icon: "🧛",
      },
      {
        id: "weekend_10",
        title: "Weekend warrior",
        description: "Lire 10 chapitres le weekend",
        condition: () => (this.stats.weekendReadingCount || 0) >= 10,
        icon: "🎮",
      },
      {
        id: "weekend_25",
        title: "Roi du weekend",
        description: "Lire 25 chapitres le weekend",
        condition: () => (this.stats.weekendReadingCount || 0) >= 25,
        icon: "👑",
      },

      // Succès par manga spécifique
      {
        id: "manga_complete_10",
        title: "Fan dévoué",
        description: "Lire 10 chapitres d'un même manga",
        condition: () => {
          return Object.values(this.stats.mangaStats).some(
            (manga) => manga.chaptersRead >= 10 && !manga.isOneshot
          );
        },
        icon: "❤️",
      },
      {
        id: "manga_complete_50",
        title: "Super fan",
        description: "Lire 50 chapitres d'un même manga",
        condition: () => {
          return Object.values(this.stats.mangaStats).some(
            (manga) => manga.chaptersRead >= 50 && !manga.isOneshot
          );
        },
        icon: "💖",
      },
      {
        id: "manga_complete_100",
        title: "Ultra fan",
        description: "Lire 100 chapitres d'un même manga",
        condition: () => {
          return Object.values(this.stats.mangaStats).some(
            (manga) => manga.chaptersRead >= 100 && !manga.isOneshot
          );
        },
        icon: "💝",
      },

      // Succès de vitesse
      {
        id: "speed_reader",
        title: "Lecteur rapide",
        description: "Lire 5 chapitres en une journée",
        condition: () => {
          const today = new Date().toDateString();
          return (
            this.stats.lastReadDate === today &&
            this.stats.totalChaptersRead >= 5
          );
        },
        icon: "⚡",
      },

      // Succès nostalgique
      {
        id: "comeback",
        title: "De retour !",
        description: "Revenir après une pause",
        condition: () => {
          if (!this.stats.lastReadDate) return false;
          const daysSinceLastRead = Math.floor(
            (Date.now() - new Date(this.stats.lastReadDate).getTime()) /
              86400000
          );
          return daysSinceLastRead >= 7 && this.stats.totalChaptersRead > 5;
        },
        icon: "🔄",
      },
    ];

    achievements.forEach((achievement) => {
      const achievementData = this.stats.achievements.find(
        (a) => a.id === achievement.id
      );

      if (achievement.condition() && !achievementData) {
        const newAchievement = {
          id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          unlockedAt: Date.now(),
        };

        this.stats.achievements.push(newAchievement);
        this.showAchievementUnlocked(newAchievement);
        console.log(`🏆 SUCCÈS DÉBLOQUÉ: ${achievement.title}`);
      }
    });
  }

  showAchievementUnlocked(achievement) {
    if (window.toast) {
      window.toast.success(
        `${achievement.icon} Succès débloqué : ${achievement.title}`,
        5000
      );
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
      oneshotsRead: this.stats.oneshotsRead || [],
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
