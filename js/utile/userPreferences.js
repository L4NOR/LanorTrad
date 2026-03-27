class UserPreferences {
  constructor() {
    this.favorites = this.loadFavorites();
    this.history = this.loadHistory();
    this.init();
  }

  init() {
    this.setupFavoriteButtons();
    this.trackReadingHistory();
    this.trackPageView();
  }

  // Gestion des favoris
  loadFavorites() {
    return JSON.parse(localStorage.getItem("lanortrad_favorites") || "[]");
  }

  saveFavorites() {
    localStorage.setItem("lanortrad_favorites", JSON.stringify(this.favorites));
  }

  toggleFavorite(mangaId, mangaData) {
    const index = this.favorites.findIndex((f) => f.id === mangaId);

    if (index === -1) {
      this.favorites.push({
        id: mangaId,
        title: mangaData.title,
        image: mangaData.image,
        type: mangaData.type || "manga",
        addedAt: Date.now(),
      });
      this.showToast("Ajout\u00e9 aux favoris !");
    } else {
      this.favorites.splice(index, 1);
      this.showToast("Retir\u00e9 des favoris");
    }

    this.saveFavorites();
    this.updateFavoriteButtons();
  }

  isFavorite(mangaId) {
    return this.favorites.some((f) => f.id === mangaId);
  }

  // Historique de lecture
  loadHistory() {
    return JSON.parse(localStorage.getItem("lanortrad_history") || "[]");
  }

  saveHistory() {
    localStorage.setItem("lanortrad_history", JSON.stringify(this.history));
  }

  addToHistory(mangaId, chapterNumber, mangaData) {
    // Supprimer l'ancienne entr\u00e9e si elle existe
    this.history = this.history.filter(
      (h) => !(h.mangaId === mangaId && h.chapter === chapterNumber)
    );

    // Ajouter en premi\u00e8re position
    this.history.unshift({
      mangaId,
      chapter: chapterNumber,
      title: mangaData.title,
      image: this.getMangaImage(mangaId),
      type: mangaData.type || "manga",
      readAt: Date.now(),
    });

    // Limiter \u00e0 100 entr\u00e9es
    this.history = this.history.slice(0, 100);
    this.saveHistory();
  }

  // Suivi de navigation - tracker chaque page visit\u00e9e
  trackPageView() {
    const currentPath = decodeURIComponent(window.location.pathname);
    const pageViews = JSON.parse(localStorage.getItem("lanortrad_pageviews") || "[]");

    pageViews.unshift({
      path: currentPath,
      title: document.title,
      timestamp: Date.now(),
    });

    // Garder les 200 derni\u00e8res pages vues
    localStorage.setItem("lanortrad_pageviews", JSON.stringify(pageViews.slice(0, 200)));

    // Tracker le temps pass\u00e9 sur la page pr\u00e9c\u00e9dente
    this.trackTimeOnPage();
  }

  // Mesurer le temps r\u00e9el pass\u00e9 sur chaque page
  trackTimeOnPage() {
    const startTime = Date.now();
    const currentPath = decodeURIComponent(window.location.pathname);

    const saveTime = () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      if (timeSpent < 2) return; // Ignorer les visites < 2s

      const readingTimes = JSON.parse(localStorage.getItem("lanortrad_reading_times") || "{}");

      // Extraire le manga depuis le path
      const mangaMatch = currentPath.match(/\/Manga\/([^\/]+)\//i);
      if (mangaMatch) {
        const mangaId = decodeURIComponent(mangaMatch[1]);
        if (!readingTimes[mangaId]) readingTimes[mangaId] = 0;
        readingTimes[mangaId] += timeSpent;
      }

      // Temps total
      readingTimes._total = (readingTimes._total || 0) + timeSpent;
      localStorage.setItem("lanortrad_reading_times", JSON.stringify(readingTimes));
    };

    window.addEventListener("beforeunload", saveTime, { once: true });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") saveTime();
    }, { once: true });
  }

  trackReadingHistory() {
    const currentPath = decodeURIComponent(window.location.pathname);

    // Chapitres normaux
    const chapterMatch = currentPath.match(
      /\/Manga\/([^\/]+)\/Chapitre\s*(\d+(?:\.\d+)?)/i
    );

    // Oneshots
    const oneshotMatch = currentPath.match(
      /\/Manga\/([^\/]+)\/Oneshot\.html$/i
    );

    const pageTitle = document.title.split("-")[0].trim();

    if (chapterMatch) {
      const mangaId = decodeURIComponent(chapterMatch[1]);
      const chapterNumber = chapterMatch[2];

      this.addToHistory(mangaId, chapterNumber, {
        title: pageTitle,
        image: this.getMangaImage(mangaId),
        type: "manga",
      });

      // Tracker le chapitre lu pour le manga (pour la page manga)
      this.markChapterAsRead(mangaId, chapterNumber);

      if (window.readingAnalytics) {
        window.readingAnalytics.trackChapterRead(mangaId, chapterNumber, 10);
      }
    }

    else if (oneshotMatch) {
      const mangaId = decodeURIComponent(oneshotMatch[1]);

      this.addToHistory(mangaId, "oneshot", {
        title: pageTitle,
        image: this.getMangaImage(mangaId),
        type: "oneshot",
      });

      if (window.readingAnalytics) {
        window.readingAnalytics.trackChapterRead(mangaId, "oneshot", 15);
      }
    }
  }

  // Marquer un chapitre comme lu pour un manga sp\u00e9cifique
  markChapterAsRead(mangaId, chapterNumber) {
    const readChapters = JSON.parse(localStorage.getItem("lanortrad_read_chapters") || "{}");
    if (!readChapters[mangaId]) readChapters[mangaId] = [];
    const chapterStr = String(chapterNumber);
    if (!readChapters[mangaId].includes(chapterStr)) {
      readChapters[mangaId].push(chapterStr);
    }
    localStorage.setItem("lanortrad_read_chapters", JSON.stringify(readChapters));
  }

  // V\u00e9rifier si un chapitre a \u00e9t\u00e9 lu
  isChapterRead(mangaId, chapterNumber) {
    const readChapters = JSON.parse(localStorage.getItem("lanortrad_read_chapters") || "{}");
    if (!readChapters[mangaId]) return false;
    return readChapters[mangaId].includes(String(chapterNumber));
  }

  // Obtenir les chapitres lus pour un manga
  getReadChapters(mangaId) {
    const readChapters = JSON.parse(localStorage.getItem("lanortrad_read_chapters") || "{}");
    return readChapters[mangaId] || [];
  }

  // Obtenir le dernier chapitre lu pour un manga
  getLastReadChapter(mangaId) {
    const history = this.loadHistory();
    const mangaHistory = history.filter(h => h.mangaId === mangaId && h.chapter !== "oneshot");
    if (mangaHistory.length === 0) return null;
    return mangaHistory[0]; // Le plus r\u00e9cent
  }

  getMangaImage(mangaId) {
    // Utiliser MANGA_DATA (CDN coverImage) si disponible pour un chargement fiable
    if (window.MANGA_DATA) {
      const manga = window.MANGA_DATA.find(m => m.id === mangaId || m.title === mangaId);
      if (manga) return manga.coverImage || manga.image;
    }

    // Fallback avec URLs CDN directes
    const cdnImages = {
      "Ao No Exorcist": "https://i.postimg.cc/qMdNHK8C/Ao-No-Exorcist.jpg",
      "Tougen Anki": "https://i.postimg.cc/4Nbmf35F/Tougen-Anki.jpg",
      "Tokyo Underworld": "https://i.postimg.cc/tCtYqg5w/Tokyo-Underworld.jpg",
      "Satsudou": "https://i.postimg.cc/Hs4VYLzH/Satsudou.jpg",
      "Catenaccio": "https://i.postimg.cc/5Nq64t37/Catenaccio.png",
    };
    if (cdnImages[mangaId]) return cdnImages[mangaId];

    // Fallback local pour les oneshots
    const base = this.getBaseUrl();
    const mangaImages = {
      "Countdown": base + "images/Cover/Countdown.jpg",
      "Gestation of Kalavinka": base + "images/Cover/Gestation of Kalavinka.jpg",
      "Gestation Of Kalavinka": base + "images/Cover/Gestation of Kalavinka.jpg",
      "In the White": base + "images/Cover/In the White.jpg",
      "Sake to Sakana": base + "images/Cover/Sake to Sakana.jpg",
      "Sake To Sakana": base + "images/Cover/Sake to Sakana.jpg",
      "Second Coming": base + "images/Cover/Second Coming.jpg",
    };
    return mangaImages[mangaId] || base + "images/icons/icon-192x192.png";
  }

  getBaseUrl() {
    if (window.location.protocol === 'file:') {
      const path = decodeURIComponent(window.location.pathname);
      const idx = path.toLowerCase().indexOf('/lanortrad/');
      if (idx !== -1) {
        const nextSlash = path.indexOf('/', idx + '/LanorTrad/'.length);
        if (nextSlash !== -1) {
          return path.substring(0, nextSlash + 1);
        }
      }
      // Fallback: remonter depuis le dossier courant
      const parts = path.split('/');
      parts.pop(); // remove filename
      if (parts[parts.length - 1] === 'Manga' || path.includes('/Manga/')) {
        // On est dans /Manga/ ou /Manga/xxx/ - remonter
        while (parts.length > 0 && parts[parts.length - 1] !== 'LanorTrad') parts.pop();
        return parts.join('/') + '/';
      }
      return parts.join('/') + '/';
    }
    return '/';
  }

  // UI Components
  setupFavoriteButtons() {
    document.querySelectorAll("[data-manga-id]").forEach((card) => {
      const mangaId = card.dataset.mangaId;
      const isFav = this.isFavorite(mangaId);

      let favBtn = card.querySelector(".favorite-btn");
      if (!favBtn) {
        favBtn = this.createFavoriteButton(mangaId, card.dataset.type);
        const container = card.querySelector(".p-6");
        if (container) {
          const insertBefore = container.querySelector(".flex.justify-between");
          if (insertBefore) {
            container.insertBefore(favBtn, insertBefore);
          }
        }
      }

      this.updateFavoriteButton(favBtn, isFav);
    });
  }

  createFavoriteButton(mangaId, mangaType = "manga") {
    const btn = document.createElement("button");
    btn.className =
      "favorite-btn w-full mb-4 py-2 px-4 rounded-lg border-2 transition-all duration-300";
    btn.dataset.mangaId = mangaId;
    btn.dataset.mangaType = mangaType;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const card = e.target.closest("[data-manga-id]");
      const titleEl = card.querySelector("h3");
      const imgEl = card.querySelector("img");

      this.toggleFavorite(mangaId, {
        title: titleEl ? titleEl.textContent : mangaId,
        image: imgEl ? imgEl.src : this.getMangaImage(mangaId),
        type: mangaType,
      });
    });
    return btn;
  }

  updateFavoriteButton(btn, isFav) {
    if (isFav) {
      btn.className =
        "favorite-btn w-full mb-4 py-2 px-4 rounded-lg border-2 border-pink-500 bg-pink-500/10 text-pink-400 transition-all duration-300 hover:bg-pink-500/20";
      btn.innerHTML = "\u2764\uFE0F Dans mes favoris";
    } else {
      btn.className =
        "favorite-btn w-full mb-4 py-2 px-4 rounded-lg border-2 border-gray-600 text-gray-400 transition-all duration-300 hover:border-pink-500 hover:text-pink-400";
      btn.innerHTML = "\uD83E\uDD0D Ajouter aux favoris";
    }
  }

  updateFavoriteButtons() {
    document.querySelectorAll(".favorite-btn").forEach((btn) => {
      const mangaId = btn.dataset.mangaId;
      this.updateFavoriteButton(btn, this.isFavorite(mangaId));
    });
  }

  // Obtenir les donn\u00e9es "Reprendre la lecture" (derniers chapitres par manga unique)
  getResumeData(limit = 4) {
    const history = this.loadHistory();
    const seen = new Set();
    const resume = [];

    for (const entry of history) {
      if (seen.has(entry.mangaId)) continue;
      seen.add(entry.mangaId);

      // Construire le lien vers le chapitre
      let chapterLink;
      if (entry.type === 'oneshot' || entry.chapter === 'oneshot') {
        chapterLink = `/Manga/${entry.mangaId}/Oneshot.html`;
      } else {
        chapterLink = `/Manga/${entry.mangaId}/Chapitre ${entry.chapter}.html`;
      }

      resume.push({
        mangaId: entry.mangaId,
        title: entry.title || entry.mangaId,
        chapter: entry.chapter,
        image: this.getMangaImage(entry.mangaId),
        link: chapterLink,
        readAt: entry.readAt,
        type: entry.type
      });

      if (resume.length >= limit) break;
    }

    return resume;
  }

  // Statistiques globales de l'utilisateur
  getUserStats() {
    const history = this.loadHistory();
    const readingTimes = JSON.parse(localStorage.getItem("lanortrad_reading_times") || "{}");
    const pageViews = JSON.parse(localStorage.getItem("lanortrad_pageviews") || "[]");
    const readChapters = JSON.parse(localStorage.getItem("lanortrad_read_chapters") || "{}");

    // Mangas uniques lus
    const uniqueMangas = new Set(history.map(h => h.mangaId));

    // Chapitres uniques lus au total
    let totalUniqueChapters = 0;
    for (const mangaId in readChapters) {
      totalUniqueChapters += readChapters[mangaId].length;
    }

    // Temps total de lecture en secondes
    const totalReadingTime = readingTimes._total || 0;

    // Manga le plus lu
    const mangaReadCounts = {};
    history.forEach(h => {
      mangaReadCounts[h.mangaId] = (mangaReadCounts[h.mangaId] || 0) + 1;
    });
    const mostReadManga = Object.entries(mangaReadCounts).sort((a, b) => b[1] - a[1])[0];

    // Jours actifs
    const activeDays = new Set(history.map(h => new Date(h.readAt).toDateString()));

    // Heures de lecture pr\u00e9f\u00e9r\u00e9es
    const hourCounts = new Array(24).fill(0);
    history.forEach(h => {
      const hour = new Date(h.readAt).getHours();
      hourCounts[hour]++;
    });
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

    return {
      totalChaptersRead: totalUniqueChapters,
      totalReadingTimeSeconds: totalReadingTime,
      uniqueMangasRead: uniqueMangas.size,
      mostReadManga: mostReadManga ? { id: mostReadManga[0], count: mostReadManga[1] } : null,
      activeDays: activeDays.size,
      totalPageViews: pageViews.length,
      peakReadingHour: peakHour,
      readChaptersPerManga: readChapters,
      readingTimesPerManga: readingTimes,
      historyCount: history.length,
    };
  }

  showToast(message) {
    if (window.toast) {
      window.toast.success(message);
      return;
    }

    const toast = document.createElement("div");
    toast.className =
      "fixed top-24 right-4 bg-gray-900 border border-indigo-500 text-white px-6 py-3 rounded-lg shadow-xl z-[9999] animate-slide-in";
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(400px)";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialiser
const userPrefs = new UserPreferences();
window.userPrefs = userPrefs;
