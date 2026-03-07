// === ENHANCEMENTS - LanorTrad ===
// Scroll-to-top, scroll progress, active nav, Ctrl+K, card tilt, parallax
// Vanilla JS, self-initializing IIFE

(function () {
    'use strict';

    var isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // =====================================================================
    // CSS INJECTION
    // =====================================================================
    function injectStyles() {
        var style = document.createElement('style');
        style.setAttribute('data-lt-enhancements', '');
        style.textContent = [
            // Scroll progress bar
            '#lt-scroll-progress{position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,var(--primary),var(--accent),var(--accent-light));z-index:99999;pointer-events:none;border-radius:0 2px 2px 0;box-shadow:0 0 10px rgba(var(--accent-rgb),.5);transition:width .1s linear}',
            // Scroll-to-top button
            '#lt-scroll-top{position:fixed;bottom:90px;right:24px;width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,var(--primary),var(--accent-light));border:1px solid rgba(255,255,255,.15);color:#fff;cursor:pointer;z-index:9998;display:flex;align-items:center;justify-content:center;opacity:0;transform:translateY(20px) scale(.8);transition:all .35s cubic-bezier(.4,0,.2,1);pointer-events:none;box-shadow:0 4px 20px rgba(var(--primary-rgb),.4)}',
            '#lt-scroll-top.visible{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}',
            '#lt-scroll-top:hover{transform:translateY(-3px) scale(1.08);box-shadow:0 8px 30px rgba(var(--primary-rgb),.6)}',
            '#lt-scroll-top:active{transform:translateY(0) scale(.95)}',
            '#lt-scroll-top svg{width:22px;height:22px;transition:transform .2s}',
            '#lt-scroll-top:hover svg{transform:translateY(-2px)}',
            // Active nav link
            '.nav-link.nav-active{color:var(--text-heading)!important}',
            '.nav-link.nav-active::after{width:100%!important;background:linear-gradient(to right,var(--primary),var(--accent))!important}',
            '.sidebar-link.nav-active{background:rgba(var(--accent-rgb),.12);color:var(--text-heading);border-left-color:var(--primary)}',
            // Ctrl+K hint
            '.lt-search-hint{position:absolute;right:10px;top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:2px;pointer-events:none;opacity:.45;transition:opacity .2s}',
            '.lt-search-hint kbd{font-family:ui-monospace,monospace;font-size:.65rem;padding:2px 5px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:4px;color:var(--text-secondary);line-height:1}',
            'input[type="search"]:focus~.lt-search-hint{opacity:0}',
            // Custom scrollbar
            '::-webkit-scrollbar{width:8px}',
            '::-webkit-scrollbar-track{background:var(--bg-base)}',
            '::-webkit-scrollbar-thumb{background:linear-gradient(180deg,var(--primary),var(--accent-light));border-radius:4px}',
            '::-webkit-scrollbar-thumb:hover{background:linear-gradient(180deg,var(--primary-light),var(--accent))}',
            // Selection color
            '::selection{background:rgba(var(--accent-rgb),.3);color:#fff}',
            // Focus visible
            ':focus-visible{outline:2px solid var(--accent);outline-offset:2px}',
            // Smooth scroll
            'html{scroll-behavior:smooth}',
            // Reading time badge
            '.lt-reading-time{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .7rem;background:rgba(var(--accent-rgb),.1);border:1px solid rgba(var(--accent-rgb),.2);border-radius:8px;color:var(--accent);font-size:.75rem;font-weight:500;margin-left:.5rem}',
            // Mobile responsive
            '@media(max-width:768px){#lt-scroll-top{bottom:80px;right:16px;width:44px;height:44px;border-radius:12px}}'
        ].join('\n');
        document.head.appendChild(style);
    }

    // =====================================================================
    // 1. SCROLL PROGRESS BAR
    // =====================================================================
    function initScrollProgress() {
        var bar = document.createElement('div');
        bar.id = 'lt-scroll-progress';
        bar.style.width = '0%';
        document.body.appendChild(bar);

        function update() {
            var scrollTop = window.scrollY;
            var docHeight = document.documentElement.scrollHeight - window.innerHeight;
            var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            bar.style.width = pct + '%';
        }

        window.addEventListener('scroll', update, { passive: true });
        update();
    }

    // =====================================================================
    // 2. SCROLL-TO-TOP BUTTON
    // =====================================================================
    function initScrollToTop() {
        var btn = document.createElement('button');
        btn.id = 'lt-scroll-top';
        btn.setAttribute('aria-label', 'Retour en haut');
        btn.innerHTML = '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        document.body.appendChild(btn);

        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        function toggle() {
            btn.classList.toggle('visible', window.scrollY > 400);
        }

        window.addEventListener('scroll', toggle, { passive: true });
        toggle();
    }

    // =====================================================================
    // 3. ACTIVE NAV LINK
    // =====================================================================
    function initActiveNav() {
        var path = window.location.pathname.toLowerCase();
        var pageName = path.split('/').pop() || 'index.html';

        // Normalize encoded chars
        try { pageName = decodeURIComponent(pageName); } catch (e) {}

        var mapping = {
            'index.html': 'index',
            '': 'index',
            'bibliotheque.html': 'bibliotheque',
            'catalogue.html': 'catalogue',
            'planning.html': 'planning',
            'Équipe.html': 'equipe'
        };

        var currentKey = mapping[pageName] || '';

        // Desktop nav links
        document.querySelectorAll('.nav-link').forEach(function (link) {
            var href = (link.getAttribute('href') || '').toLowerCase();
            try { href = decodeURIComponent(href); } catch (e) {}
            var linkPage = href.split('/').pop();
            var linkKey = mapping[linkPage] || '';
            if (linkKey && linkKey === currentKey) {
                link.classList.add('nav-active');
            }
        });

        // Sidebar links
        document.querySelectorAll('.sidebar-link').forEach(function (link) {
            var href = (link.getAttribute('href') || '').toLowerCase();
            try { href = decodeURIComponent(href); } catch (e) {}
            var linkPage = href.split('/').pop();
            var linkKey = mapping[linkPage] || '';
            if (linkKey && linkKey === currentKey) {
                link.classList.add('nav-active');
            }
        });
    }

    // =====================================================================
    // 4. CTRL+K SEARCH SHORTCUT
    // =====================================================================
    function initSearchShortcut() {
        // Add Ctrl+K hint to desktop search
        var desktopSearches = document.querySelectorAll('nav input[type="search"]');
        desktopSearches.forEach(function (input) {
            var parent = input.parentElement;
            if (!parent) return;
            // Only add hint if parent is relative positioned
            var pos = window.getComputedStyle(parent).position;
            if (pos !== 'relative' && pos !== 'absolute') {
                parent.style.position = 'relative';
            }
            var hint = document.createElement('div');
            hint.className = 'lt-search-hint';
            var isMac = navigator.platform && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            hint.innerHTML = '<kbd>' + (isMac ? '\u2318' : 'Ctrl') + '</kbd><kbd>K</kbd>';
            parent.appendChild(hint);
        });

        document.addEventListener('keydown', function (e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                // Focus the first visible desktop search
                var input = document.querySelector('nav .hidden.md\\:flex input[type="search"]') ||
                            document.querySelector('nav input[type="search"]');
                if (input) {
                    input.focus();
                    input.select();
                }
            }
        });
    }

    // =====================================================================
    // 5. CARD 3D TILT EFFECT (desktop only)
    // =====================================================================
    function initCardTilt() {
        if (isTouchDevice) return;

        document.querySelectorAll('.manga-card, .featured-card').forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                var rect = card.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;
                var cx = rect.width / 2;
                var cy = rect.height / 2;
                var rotX = ((y - cy) / cy) * -4;
                var rotY = ((x - cx) / cx) * 4;
                card.style.transform = 'perspective(800px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) scale(1.02)';
            });

            card.addEventListener('mouseleave', function () {
                card.style.transform = '';
            });
        });
    }

    // =====================================================================
    // 6. HERO PARALLAX
    // =====================================================================
    function initParallax() {
        var hero = document.querySelector('.hero-gradient');
        if (!hero) return;

        window.addEventListener('scroll', function () {
            var y = window.scrollY;
            if (y < window.innerHeight) {
                hero.style.transform = 'translateY(' + (y * 0.25) + 'px)';
                hero.style.opacity = Math.max(0, 1 - (y / (window.innerHeight * 1.1)));
            }
        }, { passive: true });
    }

    // =====================================================================
    // 7. COUNTER ANIMATION (for equipe stats)
    // =====================================================================
    function initCounterAnimation() {
        // Target the stat numbers in equipe page
        var statCards = document.querySelectorAll('.card .text-4xl.font-black');
        if (statCards.length === 0) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                var target = parseInt(el.textContent.replace(/[^\d]/g, ''), 10);
                if (isNaN(target) || target === 0) return;

                var duration = 1200;
                var steps = 50;
                var increment = target / steps;
                var current = 0;
                var step = 0;

                var timer = setInterval(function () {
                    step++;
                    current = Math.min(Math.round(increment * step), target);
                    el.textContent = current;
                    if (step >= steps) {
                        clearInterval(timer);
                        el.textContent = target;
                    }
                }, duration / steps);

                observer.unobserve(el);
            });
        }, { threshold: 0.5 });

        statCards.forEach(function (el) { observer.observe(el); });
    }

    // =====================================================================
    // 8. READING TIME ESTIMATE (reader pages)
    // =====================================================================
    function initReadingTime() {
        var container = document.querySelector('.scroll-mode-container') ||
                        document.getElementById('readerContainer');
        if (!container) return;

        setTimeout(function () {
            var images = container.querySelectorAll('img');
            if (images.length === 0) return;

            var minutes = Math.max(1, Math.ceil(images.length * 0.5));
            var badge = document.createElement('span');
            badge.className = 'lt-reading-time';
            badge.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> ~' + minutes + ' min';

            var topBar = document.querySelector('.reader-top-bar-content');
            if (topBar) topBar.appendChild(badge);
        }, 1500);
    }

    // =====================================================================
    // 9. LAZY LOADING ATTRIBUTE
    // =====================================================================
    function initImageOptimization() {
        document.querySelectorAll('img:not([loading])').forEach(function (img) {
            if (!img.closest('.loading-container')) {
                img.setAttribute('loading', 'lazy');
            }
        });
    }

    // =====================================================================
    // INIT
    // =====================================================================
    function init() {
        injectStyles();
        initScrollProgress();
        initScrollToTop();
        initActiveNav();
        initSearchShortcut();
        initCardTilt();
        initParallax();
        initCounterAnimation();
        initReadingTime();
        initImageOptimization();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
