// === SCROLL REVEAL - LanorTrad ===
// Anime les elements .reveal quand ils entrent dans le viewport
// Utilise IntersectionObserver avec fallback scroll

(function () {
    'use strict';

    function revealElement(el) {
        el.classList.add('active');
        // Stagger children cards animation
        var cards = el.querySelectorAll('.manga-card, .card, .list-item, .timeline-item, .planning-item');
        cards.forEach(function (child, i) {
            child.style.animationDelay = (i * 80) + 'ms';
        });
    }

    function init() {
        var reveals = document.querySelectorAll('.reveal:not(.active)');
        if (reveals.length === 0) return;

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        revealElement(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.08,
                rootMargin: '0px 0px -60px 0px'
            });

            reveals.forEach(function (el) { observer.observe(el); });
        } else {
            // Fallback
            var ticking = false;
            function check() {
                var wh = window.innerHeight;
                document.querySelectorAll('.reveal:not(.active)').forEach(function (el) {
                    if (el.getBoundingClientRect().top < wh - 80) {
                        revealElement(el);
                    }
                });
            }
            window.addEventListener('scroll', function () {
                if (!ticking) {
                    window.requestAnimationFrame(function () { check(); ticking = false; });
                    ticking = true;
                }
            }, { passive: true });
            check();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 100); });
    } else {
        setTimeout(init, 100);
    }
})();
