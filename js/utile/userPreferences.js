class UserPreferences {
  constructor() {
    this.favorites = this.loadFavorites();
    this.history = this.loadHistory();
    this.init();
  }

  init() {
    this.setupFavoriteButtons();
    this.trackReadingHistory();
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
      this.showToast("✨ Ajouté aux favoris !");
    } else {
      this.favorites.splice(index, 1);
      this.showToast("❌ Retiré des favoris");
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
    // Supprimer l'ancienne entrée si elle existe
    this.history = this.history.filter(
      (h) => !(h.mangaId === mangaId && h.chapter === chapterNumber)
    );

    // Ajouter en première position
    this.history.unshift({
      mangaId,
      chapter: chapterNumber,
      title: mangaData.title,
      image: mangaData.image,
      type: mangaData.type || "manga",
      readAt: Date.now(),
    });

    // Limiter à 50 entrées
    this.history = this.history.slice(0, 50);
    this.saveHistory();
  }

  trackReadingHistory() {
    const currentPath = decodeURIComponent(window.location.pathname);

    // Chapitres normaux
    const chapterMatch = currentPath.match(
      /\/Manga\/([^\/]+)\/Chapitre\s*(\d+(?:\.\d+)?)/i
    );

    // ✅ ONESHOT (CORRECTION FINALE)
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

      if (window.readingAnalytics) {
        window.readingAnalytics.trackChapterRead(mangaId, chapterNumber, 10);
      }
    }

    // ✅ ONESHOT = LECTURE COMPLÈTE
    else if (oneshotMatch) {
      const mangaId = decodeURIComponent(oneshotMatch[1]);

      console.log("📖 Oneshot ajouté à l'historique :", mangaId);

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

  getMangaImage(mangaId) {
    const mangaImages = {
      // Séries régulières
      "Ao No Exorcist": "images/cover/AoNoExorcist.jpg",
      "Tougen Anki": "images/cover/TougenAnki.jpg",
      "Tokyo Underworld": "images/cover/TokyoUnderworld.jpg",
      Satsudou: "images/cover/Satsudou.jpg",
      Catenaccio: "images/cover/Catenaccio.png",

      // ✅ CORRECTION : Chemins corrigés pour les oneshots
      Countdown: "images/cover/Countdown.jpg",
      "Gestation of Kalavinka": "/images/cover/Gestation Of Kalavinka.jpg",
      "Gestation Of Kalavinka": "/images/cover/Gestation Of Kalavinka.jpg",
      "In the White": "/images/cover/In the White.jpg",
      "Sake to Sakana": "/images/cover/Sake To Sakana.jpg",
      "Sake To Sakana": "/images/cover/Sake To Sakana.jpg",
      "Second Coming": "/images/cover/Second Coming.jpg",
    };
    return mangaImages[mangaId] || "images/default-cover.jpg";
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
      btn.innerHTML = "❤️ Dans mes favoris";
    } else {
      btn.className =
        "favorite-btn w-full mb-4 py-2 px-4 rounded-lg border-2 border-gray-600 text-gray-400 transition-all duration-300 hover:border-pink-500 hover:text-pink-400";
      btn.innerHTML = "🤍 Ajouter aux favoris";
    }
  }

  updateFavoriteButtons() {
    document.querySelectorAll(".favorite-btn").forEach((btn) => {
      const mangaId = btn.dataset.mangaId;
      this.updateFavoriteButton(btn, this.isFavorite(mangaId));
    });
  }

  // Obtenir les données "Reprendre la lecture" (derniers chapitres par manga unique)
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
        const mangaPath = entry.mangaId === 'Satsudou' ? entry.mangaId : entry.mangaId;
        chapterLink = `/Manga/${mangaPath}/Chapitre ${entry.chapter}.html`;
      }

      resume.push({
        mangaId: entry.mangaId,
        title: entry.title || entry.mangaId,
        chapter: entry.chapter,
        image: entry.image || this.getMangaImage(entry.mangaId),
        link: chapterLink,
        readAt: entry.readAt,
        type: entry.type
      });

      if (resume.length >= limit) break;
    }

    return resume;
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
