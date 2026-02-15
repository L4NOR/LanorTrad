const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 3456;

// Root of the site project (parent of tools/)
const ROOT = path.resolve(__dirname, '..');

// Multer config for image uploads
const upload = multer({ dest: path.join(__dirname, 'tmp-uploads') });

app.use(express.json());
app.use(express.static(__dirname));

// Serve site images (covers, etc.) from project root
app.get('/site-image', (req, res) => {
    const imgPath = req.query.path;
    if (!imgPath) return res.status(400).send('Missing path');
    const fullPath = path.join(ROOT, imgPath);
    if (!fullPath.startsWith(ROOT)) return res.status(403).send('Forbidden');
    res.sendFile(fullPath, err => { if (err) res.status(404).send('Not found'); });
});

// ─── Manga config mapping ───────────────────────────────────────────
const MANGA_CONFIG = {
    'Ao No Exorcist': { configFile: 'AoNoExorcist.js', coverImage: 'images/cover/AoNoExorcist.jpg', affiche: 'images/Affiche/Affiche Ao No Exorcist.png' },
    'Catenaccio':     { configFile: 'Catenaccio.js',    coverImage: 'images/cover/Catenaccio.png',    affiche: 'images/Affiche/Affiche Catenaccio.png' },
    'Satsudou':       { configFile: 'Satsudou.js',      coverImage: 'images/cover/Satsudou.jpg',      affiche: 'images/Affiche/Affiche Satsudou.png' },
    'Tokyo Underworld': { configFile: 'Tokyo.js',       coverImage: 'images/cover/TokyoUnderworld.jpg', affiche: 'images/Affiche/Affiche Tokyo Underworld.png' },
    'Tougen Anki':    { configFile: 'Tougen.js',        coverImage: 'images/cover/TougenAnki.jpg',     affiche: 'images/Affiche/Affiche Tougen Anki.png' },
};

// ─── API: List mangas ────────────────────────────────────────────────
app.get('/api/mangas', async (req, res) => {
    try {
        const genresPath = path.join(ROOT, 'js', 'utile', 'genres.js');
        const content = await fs.readFile(genresPath, 'utf-8');

        // Extract manga array from genres.js
        const match = content.match(/const\s+mangas\s*=\s*\[([\s\S]*?)\];/);
        if (!match) return res.status(500).json({ error: 'Cannot parse genres.js' });

        // Parse the array using Function constructor (safe for local use)
        const mangas = new Function(`return [${match[1]}];`)();

        // Only return regular mangas (not oneshots)
        const regularMangas = mangas.filter(m => m.type === 'manga');
        res.json(regularMangas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── API: List chapters for a manga ─────────────────────────────────
app.get('/api/manga/:id/chapters', async (req, res) => {
    try {
        const mangaId = decodeURIComponent(req.params.id);
        const mangaDir = path.join(ROOT, 'Manga', mangaId);

        if (!await fs.pathExists(mangaDir)) {
            return res.status(404).json({ error: `Manga folder not found: ${mangaId}` });
        }

        const files = await fs.readdir(mangaDir);
        const chapters = files
            .filter(f => f.match(/^Chapitre\s+[\d.]+\.html$/i))
            .map(f => {
                const num = f.match(/Chapitre\s+([\d.]+)\.html/i);
                return num ? parseFloat(num[1]) : null;
            })
            .filter(n => n !== null)
            .sort((a, b) => b - a);

        res.json({ mangaId, chapters });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── API: Add chapter ────────────────────────────────────────────────
app.post('/api/manga/:id/add-chapter', upload.array('images', 200), async (req, res) => {
    try {
        const mangaId = decodeURIComponent(req.params.id);
        const { chapterNumber, pageCount, folderPath } = req.body;
        const chapterNum = parseInt(chapterNumber);
        const pages = parseInt(pageCount);

        if (!mangaId || !chapterNum || !pages) {
            return res.status(400).json({ error: 'Missing chapterNumber or pageCount' });
        }

        const config = MANGA_CONFIG[mangaId];
        if (!config) {
            return res.status(400).json({ error: `Unknown manga: ${mangaId}` });
        }

        const mangaDir = path.join(ROOT, 'Manga', mangaId);
        const chapterHtmlPath = path.join(mangaDir, `Chapitre ${chapterNum}.html`);
        const chapterImgDir = path.join(mangaDir, 'Chapitres', `Chapitre ${chapterNum}`);

        // Check if chapter already exists
        if (await fs.pathExists(chapterHtmlPath)) {
            return res.status(400).json({ error: `Le chapitre ${chapterNum} existe deja` });
        }

        // 1. Create image directory
        await fs.ensureDir(chapterImgDir);

        // 2. Copy images from uploaded files or from folder path
        if (req.files && req.files.length > 0) {
            // Sort uploaded files by original name
            const sortedFiles = req.files.sort((a, b) =>
                a.originalname.localeCompare(b.originalname, undefined, { numeric: true })
            );
            for (let i = 0; i < sortedFiles.length; i++) {
                const destName = String(i + 1).padStart(3, '0') + '.jpg';
                await fs.move(sortedFiles[i].path, path.join(chapterImgDir, destName), { overwrite: true });
            }
        } else if (folderPath) {
            // Copy from local folder
            const srcDir = folderPath.trim();
            if (!await fs.pathExists(srcDir)) {
                return res.status(400).json({ error: `Dossier source introuvable: ${srcDir}` });
            }
            const srcFiles = (await fs.readdir(srcDir))
                .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
                .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

            for (let i = 0; i < srcFiles.length; i++) {
                const destName = String(i + 1).padStart(3, '0') + '.jpg';
                await fs.copy(path.join(srcDir, srcFiles[i]), path.join(chapterImgDir, destName));
            }
        }

        // 3. Generate chapter HTML file
        const chapterHtml = generateChapterHtml(mangaId, chapterNum, pages, config);
        await fs.writeFile(chapterHtmlPath, chapterHtml, 'utf-8');

        // 4. Update manga config JS (maxChapters)
        await updateMangaConfig(mangaId, config, chapterNum);

        // 5. Update search.js chapter count
        await updateSearchJs(mangaId, chapterNum);

        // 6. Update genres.js chapter count
        await updateGenresJs(mangaId, chapterNum);

        // 7. Update index.html featured release
        await updateIndexHtml(mangaId, chapterNum);

        // Clean up tmp uploads
        await fs.emptyDir(path.join(__dirname, 'tmp-uploads'));

        res.json({
            success: true,
            message: `Chapitre ${chapterNum} de ${mangaId} cree avec succes`,
            files: {
                html: `Manga/${mangaId}/Chapitre ${chapterNum}.html`,
                images: `Manga/${mangaId}/Chapitres/Chapitre ${chapterNum}/`,
                updated: ['search.js', 'genres.js', `${config.configFile}`, 'index.html']
            }
        });
    } catch (err) {
        // Clean up on error
        await fs.emptyDir(path.join(__dirname, 'tmp-uploads')).catch(() => {});
        res.status(500).json({ error: err.message });
    }
});

// ─── API: Delete chapter ─────────────────────────────────────────────
app.post('/api/manga/:id/delete-chapter', async (req, res) => {
    try {
        const mangaId = decodeURIComponent(req.params.id);
        const { chapterNumber } = req.body;
        const chapterNum = parseInt(chapterNumber);

        const config = MANGA_CONFIG[mangaId];
        if (!config) return res.status(400).json({ error: `Unknown manga: ${mangaId}` });

        const mangaDir = path.join(ROOT, 'Manga', mangaId);
        const chapterHtmlPath = path.join(mangaDir, `Chapitre ${chapterNum}.html`);
        const chapterImgDir = path.join(mangaDir, 'Chapitres', `Chapitre ${chapterNum}`);

        const deleted = [];

        // Delete HTML file
        if (await fs.pathExists(chapterHtmlPath)) {
            await fs.remove(chapterHtmlPath);
            deleted.push(`Chapitre ${chapterNum}.html`);
        }

        // Delete image folder
        if (await fs.pathExists(chapterImgDir)) {
            await fs.remove(chapterImgDir);
            deleted.push(`Chapitres/Chapitre ${chapterNum}/`);
        }

        // Find new max chapter
        const files = await fs.readdir(mangaDir);
        const chapters = files
            .filter(f => f.match(/^Chapitre\s+\d+\.html$/i))
            .map(f => parseInt(f.match(/Chapitre\s+(\d+)\.html/i)[1]))
            .sort((a, b) => b - a);

        const newMax = chapters[0] || 0;

        // Update config files with new max
        await updateMangaConfig(mangaId, config, newMax, true);
        await updateSearchJs(mangaId, newMax, true);
        await updateGenresJs(mangaId, newMax, true);

        res.json({ success: true, deleted, newMaxChapters: newMax });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── API: Modify chapter ─────────────────────────────────────────────
app.post('/api/manga/:id/modify-chapter', upload.array('images', 200), async (req, res) => {
    try {
        const mangaId = decodeURIComponent(req.params.id);
        const { chapterNumber, pageCount, folderPath } = req.body;
        const chapterNum = parseInt(chapterNumber);
        const pages = parseInt(pageCount);

        const config = MANGA_CONFIG[mangaId];
        if (!config) return res.status(400).json({ error: `Unknown manga: ${mangaId}` });

        const mangaDir = path.join(ROOT, 'Manga', mangaId);
        const chapterHtmlPath = path.join(mangaDir, `Chapitre ${chapterNum}.html`);
        const chapterImgDir = path.join(mangaDir, 'Chapitres', `Chapitre ${chapterNum}`);

        // Update image count in HTML
        if (pages) {
            let html = await fs.readFile(chapterHtmlPath, 'utf-8');
            html = html.replace(
                /for\s*\(\s*let\s+i\s*=\s*1\s*;\s*i\s*<=\s*\d+\s*;/,
                `for (let i = 1; i <= ${pages};`
            );
            await fs.writeFile(chapterHtmlPath, html, 'utf-8');
        }

        // Replace images if provided
        if (req.files && req.files.length > 0) {
            await fs.emptyDir(chapterImgDir);
            const sortedFiles = req.files.sort((a, b) =>
                a.originalname.localeCompare(b.originalname, undefined, { numeric: true })
            );
            for (let i = 0; i < sortedFiles.length; i++) {
                const destName = String(i + 1).padStart(3, '0') + '.jpg';
                await fs.move(sortedFiles[i].path, path.join(chapterImgDir, destName), { overwrite: true });
            }
        } else if (folderPath) {
            await fs.emptyDir(chapterImgDir);
            const srcDir = folderPath.trim();
            const srcFiles = (await fs.readdir(srcDir))
                .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
                .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

            for (let i = 0; i < srcFiles.length; i++) {
                const destName = String(i + 1).padStart(3, '0') + '.jpg';
                await fs.copy(path.join(srcDir, srcFiles[i]), path.join(chapterImgDir, destName));
            }
        }

        await fs.emptyDir(path.join(__dirname, 'tmp-uploads'));
        res.json({ success: true, message: `Chapitre ${chapterNum} modifie` });
    } catch (err) {
        await fs.emptyDir(path.join(__dirname, 'tmp-uploads')).catch(() => {});
        res.status(500).json({ error: err.message });
    }
});

// ─── Helper: Generate chapter HTML ───────────────────────────────────
function generateChapterHtml(mangaName, chapterNum, pageCount, config) {
    const configJs = config.configFile;
    const coverImage = config.coverImage;
    const affiche = config.affiche || '';

    let afficheStart = '';
    if (affiche) {
        afficheStart = `
            // Ajoute l'affiche en premiere position
            let firstImg = document.createElement('img');
            firstImg.src = '../../${affiche}';
            firstImg.alt = 'Affiche ${mangaName}';
            firstImg.style.marginBottom = '5px';
            container.appendChild(firstImg);`;
    }

    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${mangaName} - Chapitre ${chapterNum} - LanorTrad</title>
    <link rel="icon" href="https://www.creativefabrica.com/wp-content/uploads/2019/03/Monogram-LT-Logo-Design-by-Greenlines-Studios-580x387.jpg">

    <!-- MetaTags -->
    <meta name="description" content="Lisez ${mangaName} - Chapitre ${chapterNum} en francais grace a LanorTrad.">
    <meta name="keywords" content="${mangaName} Chapitre ${chapterNum}, manga, scantrad francais, LanorTrad">
    <meta name="author" content="LanorTrad">
    <meta name="robots" content="index, follow">
    <meta name="language" content="French">

    <!-- Open Graph -->
    <meta property="og:site_name" content="LanorTrad">
    <meta property="og:title" content="${mangaName} - Chapitre ${chapterNum} Traduit par LanorTrad">
    <meta property="og:description" content="Lisez ${mangaName} - Chapitre ${chapterNum} en francais grace a LanorTrad.">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="fr_FR">
    <meta property="og:image" content="../../${coverImage}">
    <meta property="og:url" content="https://lanortrad.netlify.app/Manga/${encodeURIComponent(mangaName)}/Chapitre%20${chapterNum}.html">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@LanorTrad">
    <meta name="twitter:title" content="${mangaName} - Chapitre ${chapterNum} - LanorTrad">
    <meta name="twitter:description" content="Lisez ${mangaName} - Chapitre ${chapterNum} en francais grace a LanorTrad.">
    <meta name="twitter:image" content="../../${coverImage}">

    <meta name="theme-color" content="#6B46C1">
    <link rel="alternate" type="application/json+oembed" href="https://discord.gg/md37S7nhkZ">

    <!--Styles-->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>
    <link rel="stylesheet" href="../../css/chapitres.css">
    <link rel="stylesheet" href="../../css/style.css">
    <link rel="stylesheet" href="../../css/intros-chapitre.css">
    <link rel="stylesheet" href="../../css/reader.css">

    <!--Scripts-->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-2MZGH30P4J"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-2MZGH30P4J');
    </script>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5673170839903363" crossorigin="anonymous"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
    <meta name="google-site-verification" content="eImJAYI9qcdg0xDVXhoI6EWU97AaJQgT0-S9vOgLXFs"/>
    <div id="gift-notification-root"></div>
    <script type="module"></script>
    <script src="../../js/utile/navbar.js"></script>
    <script src="../../js/utile/toast.js"></script>
    <script src="../../js/utile/analytics.js"></script>
    <script src="../../js/manga/${configJs}"></script>
    <script src="../../js/utile/search.js"></script>
    <script src="../../js/utile/reader.js"></script>

</head>

<div class="loading-container">
    <div class="background-animation">
      <div class="circle"></div>
      <div class="circle"></div>
      <div class="circle"></div>
    </div>
    <div class="loading-content">
      <div class="logo">LanorTrad</div>
      <div class="loading-bar"></div>
      <div class="loading-text">Chargement du chapitre...</div>
    </div>
</div>

<body class="min-h-screen">
    <!-- Navbar -->
    <nav class="fixed w-full z-50 top-0 nav-blur border-b border-gray-800/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-20">
                <div class="flex items-center">
                    <a href="../../index.html" class="flex items-center space-x-3">
                        <span class="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                            LanorTrad
                        </span>
                    </a>
                </div>

                <div class="md:hidden flex items-center">
                    <button id="mobile-menu-button" type="button" class="text-gray-300 hover:text-white" aria-controls="mobile-menu" aria-expanded="false">
                        <span class="sr-only">Ouvrir le menu</span>
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                <div class="hidden md:flex items-center space-x-8">
                    <a href="../../Bibliotheque.html" class="nav-link text-base text-gray-300 hover:text-white transition-colors">Bibliotheque</a>
                    <a href="../../Catalogue.html" class="nav-link text-base text-gray-300 hover:text-white transition-colors">Catalogue</a>
                    <a href="../../Équipe.html" class="nav-link text-base text-gray-300 hover:text-white transition-colors">Equipe</a>
                    <div class="relative">
                        <input type="search" placeholder="Rechercher un manga..."
                               class="w-64 px-4 py-2 bg-gray-900/80 rounded-lg border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm placeholder-gray-400">
                    </div>
                    <a href="https://discord.com/invite/Dafg53Dx39">
                        <button class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors">
                            Rejoindre
                        </button>
                    </a>
                </div>
            </div>

            <div id="mobile-menu" class="hidden md:hidden">
                <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <a href="../../Bibliotheque.html" class="block px-3 py-2 rounded-md text-base text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">Bibliotheque</a>
                    <a href="../../Catalogue.html" class="block px-3 py-2 rounded-md text-base text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">Catalogue</a>
                    <a href="../../Équipe.html" class="block px-3 py-2 rounded-md text-base text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">Equipe</a>
                    <div class="px-3 py-2">
                        <input type="search" placeholder="Rechercher un manga..."
                               class="w-full px-4 py-2 bg-gray-900/80 rounded-lg border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm placeholder-gray-400">
                    </div>
                    <div class="px-3 py-2">
                        <a href="https://discord.com/invite/Dafg53Dx39" class="block">
                            <button class="w-full px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors">
                                Rejoindre
                            </button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <!-- Reader Controls -->
    <div class="fixed top-20 left-0 right-0 z-40 bg-gray-900/80 backdrop-blur">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div class="flex justify-between items-center">
                <select id="chapterSelect" class="px-4 py-2 bg-gray-900/80 rounded-lg border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-gray-300">

                </select>
            </div>
        </div>
    </div>

    <br><br><br>
    <!-- Reader Container -->
    <div class="pt-36 pb-20 px-4">
        <div id="readerContainer" class="max-w-4xl mx-auto">
            <!-- Les images seront chargees ici par le JavaScript -->
        </div>
    </div>

    <!-- Controles du lecteur -->
    <div class="reader-controls">
        <div class="flex items-center gap-4">
            <button onclick="changeChapter(-1)" class="control-button">
                <i class="fas fa-arrow-left"></i>
                <span>Precedent</span>
            </button>

            <button onclick="scrollToTop()" class="control-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                    <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
            </button>

            <button onclick="downloadChapter()" class="control-button flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
            </button>
        </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-900/50 mt-20 py-12 border-t border-gray-800/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div class="col-span-2">
                    <span class="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                        LanorTrad
                    </span>
                    <p class="mt-4 text-gray-400">
                        Une equipe passionnee qui traduit vos mangas preferes avec precision et creativite.
                    </p>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-white mb-4">Liens rapides</h3>
                    <ul class="space-y-2">
                        <li><a href="../../Catalogue.html" class="text-gray-400 hover:text-white transition-colors">Catalogue</a></li>
                        <li><a href="../../equipe.html" class="text-gray-400 hover:text-white transition-colors">Equipe</a></li>
                        <li><a href="../../Bibliotheque.html" class="text-gray-400 hover:text-white transition-colors">Bibliotheque</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-white mb-4">Reseaux sociaux</h3>
                    <ul class="space-y-2">
                        <li><a href="https://discord.gg/invite/Dafg53Dx39" class="text-gray-400 hover:text-white transition-colors">Discord</a></li>
                        <li><a href="https://x.com/LanorTrad" class="text-gray-400 hover:text-white transition-colors">Twitter</a></li>
                    </ul>
                </div>
            </div>
            <div class="mt-12 pt-8 border-t border-gray-800/50 text-center text-gray-400">
                <p>&copy; 2024 LanorTrad. Tous droits reserves.</p>
            </div>
        </div>
    </footer>

    <script>
        function generateImages() {
            const container = document.getElementById('readerContainer');
${afficheStart}

            for (let i = 1; i <= ${pageCount}; i++) {
                let num = i.toString().padStart(3, '0');
                let imgElement = document.createElement('img');
                imgElement.src = \`Chapitres/Chapitre ${chapterNum}/\${num}.jpg\`;
                imgElement.alt = \`${mangaName} Chapitre ${chapterNum} Page \${num}\`;
                container.appendChild(imgElement);
            }

            // Ajoute l'image de recrutement en derniere position
            let lastImg = document.createElement('img');
            lastImg.src = '../../images/Affiche/recrutement lanortrad.png';
            lastImg.alt = 'Recrutement LanorTrad';
            lastImg.style.marginTop = '5px';
            container.appendChild(lastImg);
        }

        generateImages();
    </script>
    <script src="../../js/utile/reader.js"></script>
</body>
</html>`;
}

// ─── Helper: Update manga config JS ─────────────────────────────────
async function updateMangaConfig(mangaId, config, chapterNum, setExact = false) {
    const configPath = path.join(ROOT, 'js', 'manga', config.configFile);
    let content = await fs.readFile(configPath, 'utf-8');

    if (setExact) {
        content = content.replace(
            /maxChapters:\s*\d+/,
            `maxChapters: ${chapterNum}`
        );
    } else {
        // Set to the new chapter number if it's higher than current
        const currentMax = parseInt(content.match(/maxChapters:\s*(\d+)/)?.[1] || '0');
        if (chapterNum > currentMax) {
            content = content.replace(
                /maxChapters:\s*\d+/,
                `maxChapters: ${chapterNum}`
            );
        }
    }

    await fs.writeFile(configPath, content, 'utf-8');
}

// ─── Helper: Update search.js ────────────────────────────────────────
async function updateSearchJs(mangaId, chapterNum, setExact = false) {
    const searchPath = path.join(ROOT, 'js', 'utile', 'search.js');
    let content = await fs.readFile(searchPath, 'utf-8');

    // Find the manga entry and update its chapters count
    // Pattern: title: 'MangaName', ... chapters: XX
    const escapedTitle = mangaId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(
        `(title:\\s*'${escapedTitle}'[\\s\\S]*?chapters:\\s*)\\d+`,
        'i'
    );

    if (setExact) {
        content = content.replace(regex, `$1${chapterNum}`);
    } else {
        const match = content.match(regex);
        if (match) {
            const currentChapters = parseInt(content.match(new RegExp(`title:\\s*'${escapedTitle}'[\\s\\S]*?chapters:\\s*(\\d+)`, 'i'))?.[1] || '0');
            if (chapterNum > currentChapters) {
                content = content.replace(regex, `$1${chapterNum}`);
            }
        }
    }

    await fs.writeFile(searchPath, content, 'utf-8');
}

// ─── Helper: Update genres.js ────────────────────────────────────────
async function updateGenresJs(mangaId, chapterNum, setExact = false) {
    const genresPath = path.join(ROOT, 'js', 'utile', 'genres.js');
    let content = await fs.readFile(genresPath, 'utf-8');

    const escapedId = mangaId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(
        `(id:\\s*"${escapedId}"[\\s\\S]*?chapters:\\s*)\\d+`,
        'i'
    );

    if (setExact) {
        content = content.replace(regex, `$1${chapterNum}`);
    } else {
        const match = content.match(regex);
        if (match) {
            const currentChapters = parseInt(content.match(new RegExp(`id:\\s*"${escapedId}"[\\s\\S]*?chapters:\\s*(\\d+)`, 'i'))?.[1] || '0');
            if (chapterNum > currentChapters) {
                content = content.replace(regex, `$1${chapterNum}`);
            }
        }
    }

    await fs.writeFile(genresPath, content, 'utf-8');
}

// ─── Helper: Update index.html ───────────────────────────────────────
async function updateIndexHtml(mangaId, chapterNum) {
    const indexPath = path.join(ROOT, 'index.html');
    let content = await fs.readFile(indexPath, 'utf-8');

    // Get manga info from search.js
    const searchPath = path.join(ROOT, 'js', 'utile', 'search.js');
    const searchContent = await fs.readFile(searchPath, 'utf-8');

    // Extract cover image URL for this manga
    const escapedTitle = mangaId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const coverMatch = searchContent.match(new RegExp(`title:\\s*'${escapedTitle}'[\\s\\S]*?coverImage:\\s*'([^']+)'`));
    const coverUrl = coverMatch ? coverMatch[1] : '';

    // Extract genres
    const genresMatch = searchContent.match(new RegExp(`title:\\s*'${escapedTitle}'[\\s\\S]*?genres:\\s*\\[([^\\]]+)\\]`));
    const genres = genresMatch ? genresMatch[1].match(/'([^']+)'/g)?.map(g => g.replace(/'/g, '')) || [] : [];

    // Extract synopsis
    const synopsisMatch = searchContent.match(new RegExp(`title:\\s*'${escapedTitle}'[\\s\\S]*?synopsis:\\s*'([^']*(?:\\\\'[^']*)*)'`));
    const synopsis = synopsisMatch ? synopsisMatch[1].replace(/\\'/g, "'") : '';

    // Get today's date in French
    const months = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'];
    const now = new Date();
    const dateStr = `${now.getDate()} ${months[now.getMonth()]}`;

    // Update the featured release section
    // Replace the featured card content
    const featuredRegex = /<!-- Featured Release[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\n\s*<!-- Grid des autres sorties/;

    // Simpler approach: update specific elements
    // Update featured image
    content = content.replace(
        /(<div class="featured-card[\s\S]*?<img src=")[^"]*(")/,
        `$1${coverUrl}$2`
    );
    content = content.replace(
        /(<div class="featured-card[\s\S]*?alt=")[^"]*(")/,
        `$1${mangaId}$2`
    );

    // Update chapter badge in featured
    content = content.replace(
        /(<span class="chapter-badge[\s\S]*?>)\s*Chapitre\s+\d+\s*(<\/span>)/,
        `$1\n                            Chapitre ${chapterNum}\n                        $2`
    );

    // Update date badge
    content = content.replace(
        /(<span class="time-badge[\s\S]*?>)\s*[^<]*(<\/span>)/,
        `$1\n                            \uD83D\uDD52 ${dateStr}\n                        $2`
    );

    // Update featured manga title
    content = content.replace(
        /(<h3 class="text-3xl font-black mb-3">)[^<]*(<\/h3>)/,
        `$1${mangaId}$2`
    );

    // Update synopsis
    const shortSynopsis = synopsis.length > 120 ? synopsis.substring(0, 120) + '...' : synopsis;
    content = content.replace(
        /(<p class="text-gray-300 mb-4 leading-relaxed">)\s*[\s\S]*?(<\/p>)/,
        `$1\n                        ${shortSynopsis}\n                    $2`
    );

    // Update genre tags in featured
    const genreTags = genres.slice(0, 3).map(g =>
        `<span class="genre-tag px-3 py-1 rounded-lg text-xs font-medium">${g}</span>`
    ).join('\n                        ');
    content = content.replace(
        /(<div class="flex flex-wrap gap-2 mb-6">)\s*[\s\S]*?(<\/div>)/,
        `$1\n                        ${genreTags}\n                    $2`
    );

    // Update "Lire maintenant" link
    content = content.replace(
        /(<a href="..\/Manga\/)[^"]*(">\s*<button class="flex-1)/,
        `$1${mangaId}/Chapitre ${chapterNum}.html$2`
    );

    await fs.writeFile(indexPath, content, 'utf-8');
}

// ─── Start server ────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n  LanorTrad Manager running at http://localhost:${PORT}`);
    console.log(`  Project root: ${ROOT}\n`);

    // Try to open browser
    const startCmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    exec(`${startCmd} http://localhost:${PORT}/manager.html`);
});
