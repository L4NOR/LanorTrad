// === SOURCE UNIQUE DE DONNEES MANGA - LanorTrad ===
// Ce fichier centralise toutes les donnees manga du site.
// Tous les autres scripts (genres.js, search.js, script.js) consomment ces donnees.

window.MANGA_DATA = [
    // === SERIES REGULIERES ===
    {
        id: "Ao No Exorcist",
        title: "Ao No Exorcist",
        type: "manga",
        genres: ["Action", "Aventure", "Fantasy", "LanorTrad"],
        status: "En cours",
        chapters: 166,
        lastUpdate: "2025-02-23",
        description: "Rin Okumura est un adolescent qui d\u00e9couvre un jour qu'il est le fils de Satan. D\u00e9termin\u00e9 \u00e0 devenir un exorciste pour vaincre Satan...",
        image: "images/Cover/AoNoExorcist.jpg",
        coverImage: "https://i.postimg.cc/qMdNHK8C/Ao-No-Exorcist.jpg",
        url: "/Manga/Ao No Exorcist.html"
    },
    {
        id: "Catenaccio",
        title: "Catenaccio",
        type: "manga",
        genres: ["Sports", "Vie Scolaire", "Collaboration"],
        status: "En cours",
        chapters: 56,
        lastUpdate: "2026-03-28",
        description: "Yataro Araki, membre de l\u2019\u00e9quipe de football du lyc\u00e9e T\u014dj\u014d, nourrit de grandes ambitions : dans dix ans, il se voit d\u00e9j\u00e0 au sommet du football europ\u00e9en...",
        image: "images/Cover/Catenaccio.png",
        coverImage: "https://i.postimg.cc/5Nq64t37/Catenaccio.png",
        url: "/Manga/Catenaccio.html"
    },
    {
        id: "Satsudou",
        title: "Satsudou",
        type: "manga",
        genres: ["Aventure", "Com\u00e9die", "Arts Martiaux", "LanorTrad"],
        status: "En cours",
        chapters: 18,
        lastUpdate: "2025-02-23",
        description: "Akamori Mitsuo veut \u00eatre un salari\u00e9 ordinaire mais... C'est un meurtrier de g\u00e9nie n\u00e9 dans une famille qui pratique l'art ancien de tuer...",
        image: "images/Cover/Satsudou.jpg",
        coverImage: "https://i.postimg.cc/Hs4VYLzH/Satsudou.jpg",
        url: "/Manga/Satsudou.html"
    },
    {
        id: "Tokyo Underworld",
        title: "Tokyo Underworld",
        type: "manga",
        genres: ["Horreur", "Myst\u00e9rieux", "LanorTrad"],
        status: "En cours",
        chapters: 38,
        lastUpdate: "2025-02-23",
        description: "Selon la l\u00e9gende urbaine, les coupables sont condamn\u00e9s \u00e0 tomber dans les Enfers de Tokyo. L\u00e0, ils ne b\u00e9n\u00e9ficient d'aucune piti\u00e9 et...",
        image: "images/Cover/TokyoUnderworld.jpg",
        coverImage: "https://i.postimg.cc/tCtYqg5w/Tokyo-Underworld.jpg",
        url: "/Manga/Tokyo Underworld.html"
    },
    {
        id: "Tougen Anki",
        title: "Tougen Anki",
        type: "manga",
        genres: ["Action", "Drame", "Fantasy", "LanorTrad"],
        status: "En cours",
        chapters: 230,
        lastUpdate: "2025-02-23",
        description: "Ichinose Shiki, h\u00e9ritier du sang d'Oni, a pass\u00e9 toute son enfance sans se rendre compte de ce fait. Cependant, lorsqu'un inconnu se...",
        image: "images/Cover/TougenAnki.jpg",
        coverImage: "https://i.postimg.cc/4Nbmf35F/Tougen-Anki.jpg",
        url: "/Manga/Tougen Anki.html"
    },

    // === ONESHOTS ===
    {
        id: "Countdown",
        title: "Countdown",
        type: "oneshot",
        genres: ["Spectres", "Surnaturel", "Oneshot"],
        status: "Termin\u00e9",
        chapters: 1,
        description: "V\u00eatements noirs, yeux noirs, cheveux noirs... et si vous rencontriez cela...?!",
        image: "images/Cover/Countdown.jpg",
        coverImage: "images/Cover/Countdown.jpg",
        url: "/Manga/Countdown/Oneshot.html"
    },
    {
        id: "Gestation of Kalavinka",
        title: "Gestation of Kalavinka",
        type: "oneshot",
        genres: ["R\u00e9incarnation", "Surnaturel", "Oneshot"],
        status: "Termin\u00e9",
        chapters: 1,
        description: "Apr\u00e8s avoir perdu sa femme, Dawei accomplit le rituel de l'enterrement c\u00e9leste sur son corps afin de faire son deuil..",
        image: "images/Cover/Gestation of Kalavinka.jpg",
        coverImage: "images/Cover/Gestation of Kalavinka.jpg",
        url: "/Manga/Gestation of Kalavinka/Oneshot.html"
    },
    {
        id: "In the White",
        title: "In the White",
        type: "oneshot",
        genres: ["Psychologie", "Romance", "Oneshot"],
        status: "Termin\u00e9",
        chapters: 1,
        description: "Une petite araign\u00e9e vient perturber la vie d'un auteur d\u00e9sesp\u00e9r\u00e9.",
        image: "images/Cover/In the White.jpg",
        coverImage: "images/Cover/In the White.jpg",
        url: "/Manga/In the White/Oneshot.html"
    },
    {
        id: "Sake to Sakana",
        title: "Sake to Sakana",
        type: "oneshot",
        genres: ["Drame", "Fantaisie", "Horreur", "Myst\u00e8re", "Oneshot"],
        status: "Termin\u00e9",
        chapters: 1,
        description: "Fumi et Haru sont deux amies d'universit\u00e9 qui partagent une passion pour la natation, jusqu'\u00e0 ce que l'h\u00e9ritage \"unique\" de Fumi vienne compliquer les choses.",
        image: "images/Cover/Sake to Sakana.jpg",
        coverImage: "images/Cover/Sake to Sakana.jpg",
        url: "/Manga/Sake to Sakana/Oneshot.html"
    },
    {
        id: "Second Coming",
        title: "Second Coming",
        type: "oneshot",
        genres: ["Drame", "Horreur", "Myst\u00e8re", "Trag\u00e9die", "Oneshot"],
        status: "Termin\u00e9",
        chapters: 1,
        description: "Un forgeron perd sa fille lors d'un sacrifice et attend 40 ans pour se venger.",
        image: "images/Cover/Second Coming.jpg",
        coverImage: "images/Cover/Second Coming.jpg",
        url: "/Manga/Second Coming/Oneshot.html"
    }
];
