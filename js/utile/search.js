// === ENHANCED SEARCH - LanorTrad ===
// Recherche instantanee avec keyboard nav, highlight, glassmorphism dropdown
// Utilise la source unique de donnees manga (mangaData.js)

(function () {
    'use strict';

    // Construire la liste de recherche depuis la source unique
    function getSearchableMangas() {
        var data = window.MANGA_DATA || [];
        return data.map(function (m) {
            return {
                title: m.title,
                url: m.url,
                coverImage: m.coverImage || m.image,
                genres: m.genres.filter(function (g) {
                    return g !== 'LanorTrad' && g !== 'Collaboration';
                }),
                chapters: m.chapters,
                synopsis: m.description
            };
        });
    }

    // =====================================================================
    // CSS
    // =====================================================================
    function injectSearchCSS() {
        if (document.getElementById('lt-search-css')) return;
        var style = document.createElement('style');
        style.id = 'lt-search-css';
        style.textContent = [
            '.lt-search-dropdown{position:absolute;top:calc(100% + 8px);left:0;right:0;min-width:320px;background:rgba(17,24,39,.97);border:1px solid rgba(99,102,241,.25);border-radius:14px;max-height:420px;overflow-y:auto;display:none;z-index:9999;backdrop-filter:blur(16px);box-shadow:0 20px 60px rgba(0,0,0,.5),0 0 30px rgba(99,102,241,.1);animation:ltSearchSlideIn .2s ease}',
            '.lt-search-dropdown.open{display:block}',
            '@keyframes ltSearchSlideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}',
            '.lt-search-item{display:flex;gap:.75rem;padding:.75rem 1rem;cursor:pointer;transition:all .15s ease;border-bottom:1px solid rgba(255,255,255,.04)}',
            '.lt-search-item:last-child{border-bottom:none}',
            '.lt-search-item:hover,.lt-search-item.active{background:rgba(99,102,241,.12)}',
            '.lt-search-item.active{border-left:3px solid #818cf8}',
            '.lt-search-item img{width:48px;height:64px;object-fit:cover;border-radius:8px;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.3)}',
            '.lt-search-item-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:.25rem}',
            '.lt-search-item-title{font-weight:600;font-size:.9rem;color:#e5e7eb;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
            '.lt-search-item-title mark{background:rgba(99,102,241,.35);color:#c7d2fe;border-radius:2px;padding:0 1px}',
            '.lt-search-item-meta{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}',
            '.lt-search-item-genre{font-size:.7rem;padding:2px 7px;background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);border-radius:6px;color:#a5b4fc}',
            '.lt-search-item-chapters{font-size:.75rem;color:#818cf8;font-weight:500;margin-left:auto;white-space:nowrap}',
            '.lt-search-item-synopsis{font-size:.75rem;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
            '.lt-search-empty{padding:2rem;text-align:center;color:#6b7280}',
            '.lt-search-empty-icon{font-size:2rem;margin-bottom:.5rem;opacity:.4}',
            '.lt-search-empty-text{font-size:.85rem}',
            '.lt-search-hint-bar{padding:.5rem 1rem;font-size:.7rem;color:#4b5563;border-top:1px solid rgba(255,255,255,.04);display:flex;justify-content:space-between;align-items:center}',
            '.lt-search-hint-bar kbd{font-family:ui-monospace,monospace;padding:1px 5px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:3px;font-size:.65rem;margin:0 1px}',
            // Scrollbar for dropdown
            '.lt-search-dropdown::-webkit-scrollbar{width:6px}',
            '.lt-search-dropdown::-webkit-scrollbar-track{background:transparent}',
            '.lt-search-dropdown::-webkit-scrollbar-thumb{background:rgba(99,102,241,.3);border-radius:3px}',
            '.lt-search-dropdown::-webkit-scrollbar-thumb:hover{background:rgba(99,102,241,.5)}'
        ].join('\n');
        document.head.appendChild(style);
    }

    // =====================================================================
    // HIGHLIGHT MATCHING TEXT
    // =====================================================================
    function highlightText(text, query) {
        if (!query) return text;
        var escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var regex = new RegExp('(' + escaped + ')', 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    // =====================================================================
    // CREATE DROPDOWN FOR AN INPUT
    // =====================================================================
    function setupSearchInput(input) {
        var wrapper = input.parentElement;
        if (!wrapper) return;

        // Ensure wrapper is positioned
        var pos = window.getComputedStyle(wrapper).position;
        if (pos !== 'relative' && pos !== 'absolute' && pos !== 'fixed') {
            wrapper.style.position = 'relative';
        }

        // Create dropdown
        var dropdown = document.createElement('div');
        dropdown.className = 'lt-search-dropdown';
        wrapper.appendChild(dropdown);

        var activeIndex = -1;
        var currentResults = [];

        function renderResults(query) {
            var availableMangas = getSearchableMangas();
            dropdown.innerHTML = '';
            activeIndex = -1;

            if (!query) {
                dropdown.classList.remove('open');
                return;
            }

            var q = query.toLowerCase();
            currentResults = availableMangas.filter(function (m) {
                return m.title.toLowerCase().indexOf(q) !== -1 ||
                       m.synopsis.toLowerCase().indexOf(q) !== -1 ||
                       m.genres.some(function (g) { return g.toLowerCase().indexOf(q) !== -1; });
            });

            if (currentResults.length === 0) {
                dropdown.innerHTML = '<div class="lt-search-empty"><div class="lt-search-empty-icon">&#x2715;</div><div class="lt-search-empty-text">Aucun manga trouv\u00e9</div></div>';
                dropdown.classList.add('open');
                return;
            }

            var frag = document.createDocumentFragment();
            currentResults.forEach(function (manga, idx) {
                var item = document.createElement('div');
                item.className = 'lt-search-item';
                item.setAttribute('data-index', idx);

                var img = document.createElement('img');
                img.src = manga.coverImage;
                img.alt = 'Couverture de ' + manga.title;
                img.loading = 'lazy';
                img.onerror = function () { this.style.display = 'none'; };

                var info = document.createElement('div');
                info.className = 'lt-search-item-info';

                var title = document.createElement('div');
                title.className = 'lt-search-item-title';
                title.innerHTML = highlightText(manga.title, query);

                var meta = document.createElement('div');
                meta.className = 'lt-search-item-meta';
                manga.genres.forEach(function (g) {
                    var tag = document.createElement('span');
                    tag.className = 'lt-search-item-genre';
                    tag.textContent = g;
                    meta.appendChild(tag);
                });
                var chap = document.createElement('span');
                chap.className = 'lt-search-item-chapters';
                chap.textContent = manga.chapters === 1 ? 'Oneshot' : manga.chapters + ' ch.';
                meta.appendChild(chap);

                var synopsis = document.createElement('div');
                synopsis.className = 'lt-search-item-synopsis';
                synopsis.textContent = manga.synopsis;

                info.appendChild(title);
                info.appendChild(meta);
                info.appendChild(synopsis);

                item.appendChild(img);
                item.appendChild(info);

                item.addEventListener('click', function () {
                    navigateToManga(manga);
                });

                item.addEventListener('mouseenter', function () {
                    setActive(idx);
                });

                frag.appendChild(item);
            });

            // Keyboard hints bar
            var hints = document.createElement('div');
            hints.className = 'lt-search-hint-bar';
            hints.innerHTML = '<span><kbd>\u2191</kbd><kbd>\u2193</kbd> naviguer</span><span><kbd>Enter</kbd> ouvrir</span><span><kbd>Esc</kbd> fermer</span>';
            frag.appendChild(hints);

            dropdown.appendChild(frag);
            dropdown.classList.add('open');
        }

        function setActive(idx) {
            var items = dropdown.querySelectorAll('.lt-search-item');
            items.forEach(function (item) { item.classList.remove('active'); });
            activeIndex = idx;
            if (idx >= 0 && idx < items.length) {
                items[idx].classList.add('active');
                // Scroll into view
                items[idx].scrollIntoView({ block: 'nearest' });
            }
        }

        function navigateToManga(manga) {
            window.location.href = manga.url;
        }

        // Event: input
        input.addEventListener('input', function () {
            renderResults(input.value.trim());
        });

        // Event: focus
        input.addEventListener('focus', function () {
            if (input.value.trim()) {
                renderResults(input.value.trim());
            }
        });

        // Event: keyboard navigation
        input.addEventListener('keydown', function (e) {
            if (!dropdown.classList.contains('open')) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                var nextIdx = activeIndex + 1;
                if (nextIdx >= currentResults.length) nextIdx = 0;
                setActive(nextIdx);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                var prevIdx = activeIndex - 1;
                if (prevIdx < 0) prevIdx = currentResults.length - 1;
                setActive(prevIdx);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (activeIndex >= 0 && activeIndex < currentResults.length) {
                    navigateToManga(currentResults[activeIndex]);
                }
            } else if (e.key === 'Escape') {
                dropdown.classList.remove('open');
                input.blur();
            }
        });

        // Event: click outside
        document.addEventListener('click', function (e) {
            if (!wrapper.contains(e.target)) {
                dropdown.classList.remove('open');
            }
        });
    }

    // =====================================================================
    // INIT
    // =====================================================================
    function init() {
        injectSearchCSS();
        var inputs = document.querySelectorAll('input[type="search"]');
        inputs.forEach(setupSearchInput);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
