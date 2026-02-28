/* ========================================
   ENGAGEMENT MODULE - LanorTrad
   Notations, Reactions, Partage, Disqus, Auto-Next
   Injecté dynamiquement par reader.js
   ======================================== */

const DISQUS_SHORTNAME = 'lanortrad'; // À modifier avec ton shortname Disqus

class EngagementManager {
    constructor() {
        this.chapterKey = this.getChapterKey();
        this.mangaName = this.getMangaName();
        this.chapterNumber = this.getChapterNumber();
        this.isOneshot = this.detectOneshot();
        this.autoNextEnabled = this.loadAutoNextPref();
        this.autoNextTriggered = false;
        this.autoNextTimer = null;

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    getChapterKey() {
        const path = decodeURIComponent(window.location.pathname);
        return path.replace(/.*\/Manga\//, '')
                   .replace(/\.html$/, '')
                   .replace(/[\/\\]+/g, '_')
                   .replace(/\s+/g, '_');
    }

    getMangaName() {
        if (typeof CONFIG !== 'undefined' && CONFIG.currentManga) {
            return CONFIG.currentManga;
        }
        const path = decodeURIComponent(window.location.pathname);
        const parts = path.split('/');
        const mangaIdx = parts.findIndex(p => p.toLowerCase() === 'manga');
        return mangaIdx >= 0 && parts[mangaIdx + 1] ? parts[mangaIdx + 1] : 'Manga';
    }

    getChapterNumber() {
        const path = decodeURIComponent(window.location.pathname);
        const match = path.match(/Chapitre\s*(\d+\.?\d*)/i);
        return match ? match[1] : null;
    }

    detectOneshot() {
        const path = decodeURIComponent(window.location.pathname).toLowerCase();
        return path.includes('oneshot') || !this.getChapterNumber();
    }

    loadAutoNextPref() {
        const saved = localStorage.getItem('lanortrad_autoNext');
        return saved !== null ? saved === 'true' : true;
    }

    saveAutoNextPref() {
        localStorage.setItem('lanortrad_autoNext', String(this.autoNextEnabled));
    }

    setup() {
        const readerContainer = document.getElementById('readerContainer');
        if (!readerContainer) return;

        this.container = document.createElement('div');
        this.container.id = 'engagementSection';
        this.container.className = 'engagement-section';

        const readerWrapper = readerContainer.closest('.pt-36') || readerContainer.parentElement;
        if (readerWrapper && readerWrapper.nextElementSibling) {
            readerWrapper.parentNode.insertBefore(this.container, readerWrapper.nextElementSibling);
        } else if (readerWrapper) {
            readerWrapper.parentNode.appendChild(this.container);
        }

        this.initRating();
        this.addSeparator();
        this.initReactions();
        this.addSeparator();
        this.initShare();
        this.addSeparator();
        this.initAutoNextToggle();
        this.addSeparator();
        this.initDisqus();

        if (!this.isOneshot) {
            this.initAutoNext();
        }
    }

    addSeparator() {
        const sep = document.createElement('div');
        sep.className = 'engagement-separator';
        this.container.appendChild(sep);
    }

    // ==========================================
    // RATING (1-5 étoiles)
    // ==========================================

    initRating() {
        const storageKey = `lanortrad_rating_${this.chapterKey}`;
        const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
        let currentRating = saved ? saved.rating : 0;

        const block = document.createElement('div');
        block.className = 'engagement-block';

        const title = document.createElement('div');
        title.className = 'engagement-block-title';
        title.textContent = 'Notez ce chapitre';
        block.appendChild(title);

        const ratingContainer = document.createElement('div');
        ratingContainer.className = 'rating-container';

        const starsDiv = document.createElement('div');
        starsDiv.className = 'rating-stars';

        const label = document.createElement('div');
        label.className = 'rating-label' + (currentRating ? ' rated' : '');

        const ratingTexts = ['', 'Bof...', 'Pas mal', 'Bien !', 'Super !', 'Chef-d\'oeuvre !'];
        label.textContent = currentRating ? ratingTexts[currentRating] : '';

        const starSVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;

        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('div');
            star.className = 'rating-star' + (i <= currentRating ? ' active' : '');
            star.innerHTML = starSVG;
            star.dataset.value = i;

            star.addEventListener('mouseenter', () => {
                starsDiv.querySelectorAll('.rating-star').forEach((s, idx) => {
                    s.classList.toggle('hover', idx < i);
                });
                label.textContent = ratingTexts[i];
                label.classList.remove('rated');
            });

            star.addEventListener('mouseleave', () => {
                starsDiv.querySelectorAll('.rating-star').forEach(s => s.classList.remove('hover'));
                label.textContent = currentRating ? ratingTexts[currentRating] : '';
                if (currentRating) label.classList.add('rated');
            });

            star.addEventListener('click', () => {
                if (currentRating === i) {
                    currentRating = 0;
                    localStorage.removeItem(storageKey);
                } else {
                    currentRating = i;
                    localStorage.setItem(storageKey, JSON.stringify({ rating: i, timestamp: Date.now() }));
                }
                starsDiv.querySelectorAll('.rating-star').forEach((s, idx) => {
                    s.classList.toggle('active', idx < currentRating);
                });
                label.textContent = currentRating ? ratingTexts[currentRating] : '';
                label.classList.toggle('rated', currentRating > 0);

                if (window.toast) {
                    if (currentRating) {
                        window.toast.success(`Note : ${currentRating}/5`);
                    } else {
                        window.toast.info('Note retirée');
                    }
                }
            });

            starsDiv.appendChild(star);
        }

        ratingContainer.appendChild(starsDiv);
        ratingContainer.appendChild(label);
        block.appendChild(ratingContainer);
        this.container.appendChild(block);
    }

    // ==========================================
    // REACTIONS (emojis)
    // ==========================================

    initReactions() {
        const storageKey = `lanortrad_reactions_${this.chapterKey}`;
        const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');

        const reactions = [
            { id: 'fire', emoji: '🔥', label: 'Feu' },
            { id: 'cry', emoji: '😢', label: 'Émotion' },
            { id: 'mindblown', emoji: '🤯', label: 'Choqué' },
            { id: 'laugh', emoji: '😂', label: 'Drôle' },
            { id: 'love', emoji: '❤️', label: 'Love' }
        ];

        const block = document.createElement('div');
        block.className = 'engagement-block';

        const title = document.createElement('div');
        title.className = 'engagement-block-title';
        title.textContent = 'Votre réaction';
        block.appendChild(title);

        const reactionsDiv = document.createElement('div');
        reactionsDiv.className = 'reactions-container';

        reactions.forEach(r => {
            const btn = document.createElement('div');
            btn.className = 'reaction-btn' + (saved[r.id] ? ' active' : '');

            const emoji = document.createElement('span');
            emoji.className = 'reaction-emoji';
            emoji.textContent = r.emoji;

            const label = document.createElement('span');
            label.className = 'reaction-label';
            label.textContent = r.label;

            btn.appendChild(emoji);
            btn.appendChild(label);

            btn.addEventListener('click', () => {
                const isActive = btn.classList.contains('active');
                if (isActive) {
                    btn.classList.remove('active');
                    delete saved[r.id];
                } else {
                    btn.classList.add('active');
                    saved[r.id] = true;
                }
                localStorage.setItem(storageKey, JSON.stringify(saved));
            });

            reactionsDiv.appendChild(btn);
        });

        block.appendChild(reactionsDiv);
        this.container.appendChild(block);
    }

    // ==========================================
    // SHARE (partage)
    // ==========================================

    initShare() {
        const pageUrl = window.location.href;
        const chapterLabel = this.chapterNumber
            ? `${this.mangaName} - Chapitre ${this.chapterNumber}`
            : this.mangaName;

        const block = document.createElement('div');
        block.className = 'engagement-block';

        const title = document.createElement('div');
        title.className = 'engagement-block-title';
        title.textContent = 'Partager';
        block.appendChild(title);

        const shareDiv = document.createElement('div');
        shareDiv.className = 'share-container';

        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'share-buttons';

        // Copier le lien
        const copyBtn = this.createShareBtn('📋', 'Copier le lien', () => {
            navigator.clipboard.writeText(pageUrl).then(() => {
                copyBtn.classList.add('copied');
                copyBtn.querySelector('.share-label').textContent = 'Copié !';
                if (window.toast) window.toast.success('Lien copié !');
                setTimeout(() => {
                    copyBtn.classList.remove('copied');
                    copyBtn.querySelector('.share-label').textContent = 'Copier le lien';
                }, 2000);
            }).catch(() => {
                // Fallback
                const ta = document.createElement('textarea');
                ta.value = pageUrl;
                ta.style.cssText = 'position:fixed;opacity:0';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                if (window.toast) window.toast.success('Lien copié !');
            });
        });
        buttonsDiv.appendChild(copyBtn);

        // Twitter/X
        const tweetBtn = this.createShareBtn('𝕏', 'Twitter', () => {
            const text = encodeURIComponent(`Je lis ${chapterLabel} sur LanorTrad !`);
            const url = encodeURIComponent(pageUrl);
            window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=550,height=420');
        });
        buttonsDiv.appendChild(tweetBtn);

        // Discord (copie texte formaté)
        const discordBtn = this.createShareBtn('💬', 'Discord', () => {
            const text = `**${chapterLabel}**\n${pageUrl}`;
            navigator.clipboard.writeText(text).then(() => {
                if (window.toast) window.toast.success('Texte Discord copié !');
            }).catch(() => {
                if (window.toast) window.toast.info('Copiez le lien manuellement');
            });
        });
        buttonsDiv.appendChild(discordBtn);

        // Web Share API (mobile)
        if (navigator.share) {
            const nativeBtn = this.createShareBtn('📤', 'Partager', () => {
                navigator.share({
                    title: chapterLabel,
                    text: `${chapterLabel} sur LanorTrad`,
                    url: pageUrl
                }).catch(() => {});
            });
            buttonsDiv.appendChild(nativeBtn);
        }

        shareDiv.appendChild(buttonsDiv);
        block.appendChild(shareDiv);
        this.container.appendChild(block);
    }

    createShareBtn(icon, labelText, onClick) {
        const btn = document.createElement('button');
        btn.className = 'share-btn';

        const iconSpan = document.createElement('span');
        iconSpan.className = 'share-icon';
        iconSpan.textContent = icon;

        const label = document.createElement('span');
        label.className = 'share-label';
        label.textContent = labelText;

        btn.appendChild(iconSpan);
        btn.appendChild(label);
        btn.addEventListener('click', onClick);
        return btn;
    }

    // ==========================================
    // AUTO-NEXT TOGGLE
    // ==========================================

    initAutoNextToggle() {
        if (this.isOneshot) return;

        const block = document.createElement('div');
        block.className = 'engagement-block';

        const toggleDiv = document.createElement('div');
        toggleDiv.className = 'auto-next-toggle';

        const labelEl = document.createElement('label');
        labelEl.textContent = 'Chapitre suivant automatique';
        labelEl.setAttribute('for', 'autoNextToggle');

        const switchLabel = document.createElement('label');
        switchLabel.className = 'toggle-switch';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'autoNextToggle';
        checkbox.checked = this.autoNextEnabled;

        const slider = document.createElement('span');
        slider.className = 'toggle-slider';

        switchLabel.appendChild(checkbox);
        switchLabel.appendChild(slider);

        checkbox.addEventListener('change', () => {
            this.autoNextEnabled = checkbox.checked;
            this.saveAutoNextPref();
            if (window.toast) {
                window.toast.info(this.autoNextEnabled ? 'Auto-next activé' : 'Auto-next désactivé');
            }
        });

        toggleDiv.appendChild(labelEl);
        toggleDiv.appendChild(switchLabel);
        block.appendChild(toggleDiv);
        this.container.appendChild(block);
    }

    // ==========================================
    // DISQUS (lazy loaded)
    // ==========================================

    initDisqus() {
        const block = document.createElement('div');
        block.className = 'engagement-block';

        const title = document.createElement('div');
        title.className = 'engagement-block-title';
        title.textContent = 'Commentaires';
        block.appendChild(title);

        const disqusContainer = document.createElement('div');
        disqusContainer.className = 'disqus-container';

        const placeholder = document.createElement('div');
        placeholder.className = 'disqus-placeholder';
        placeholder.innerHTML = '<div class="spinner"></div><br>Chargement des commentaires...';
        disqusContainer.appendChild(placeholder);

        const disqusThread = document.createElement('div');
        disqusThread.id = 'disqus_thread';
        disqusContainer.appendChild(disqusThread);

        block.appendChild(disqusContainer);
        this.container.appendChild(block);

        // Lazy load Disqus when section becomes visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    observer.disconnect();
                    this.loadDisqus(placeholder);
                }
            });
        }, { rootMargin: '200px' });

        observer.observe(block);
    }

    loadDisqus(placeholder) {
        const pageUrl = window.location.href.split('#')[0].split('?')[0];

        window.disqus_config = function () {
            this.page.url = pageUrl;
            this.page.identifier = this.chapterKey;
            this.page.title = document.title;
        }.bind(this);

        const script = document.createElement('script');
        script.src = `https://${DISQUS_SHORTNAME}.disqus.com/embed.js`;
        script.setAttribute('data-timestamp', +new Date());
        script.async = true;

        script.onload = () => {
            if (placeholder) placeholder.style.display = 'none';
        };

        script.onerror = () => {
            if (placeholder) {
                placeholder.innerHTML = '💬 Les commentaires seront bientôt disponibles !<br><small style="color:#6b7280">Créez un compte Disqus et configurez le shortname.</small>';
            }
        };

        (document.head || document.body).appendChild(script);
    }

    // ==========================================
    // AUTO-NEXT CHAPTER
    // ==========================================

    initAutoNext() {
        // Scroll mode detection
        window.addEventListener('scroll', () => {
            if (!this.autoNextEnabled || this.autoNextTriggered) return;

            const scrollBottom = window.scrollY + window.innerHeight;
            const pageHeight = document.body.scrollHeight;

            if (scrollBottom >= pageHeight - 150) {
                this.triggerAutoNext();
            }
        }, { passive: true });

        // Page mode detection (via custom event from reader.js)
        window.addEventListener('readerPageChanged', (e) => {
            if (!this.autoNextEnabled || this.autoNextTriggered) return;

            if (e.detail && e.detail.isLastPage) {
                this.triggerAutoNext();
            }
        });
    }

    triggerAutoNext() {
        // Check if changeChapter exists and we're not on last chapter
        if (typeof window.changeChapter !== 'function') return;

        this.autoNextTriggered = true;
        this.showAutoNextOverlay();
    }

    showAutoNextOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'auto-next-overlay';

        const text = document.createElement('span');
        text.className = 'auto-next-text';

        const progress = document.createElement('div');
        progress.className = 'auto-next-progress';
        const progressFill = document.createElement('div');
        progressFill.className = 'auto-next-progress-fill';
        progress.appendChild(progressFill);

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'auto-next-cancel';
        cancelBtn.textContent = 'Annuler';

        overlay.appendChild(text);
        overlay.appendChild(progress);
        overlay.appendChild(cancelBtn);
        document.body.appendChild(overlay);

        let seconds = 5;
        text.innerHTML = `Chapitre suivant dans <strong>${seconds}s</strong>`;

        // Start progress animation
        requestAnimationFrame(() => {
            progressFill.style.width = '100%';
            progressFill.style.transition = `width ${seconds}s linear`;
        });

        this.autoNextTimer = setInterval(() => {
            seconds--;
            if (seconds <= 0) {
                clearInterval(this.autoNextTimer);
                overlay.classList.add('hiding');
                setTimeout(() => {
                    overlay.remove();
                    window.changeChapter(1);
                }, 300);
            } else {
                text.innerHTML = `Chapitre suivant dans <strong>${seconds}s</strong>`;
            }
        }, 1000);

        cancelBtn.addEventListener('click', () => {
            clearInterval(this.autoNextTimer);
            overlay.classList.add('hiding');
            setTimeout(() => overlay.remove(), 300);
            // Don't re-trigger until page reload
        });
    }
}

// Initialize
window.engagementManager = new EngagementManager();
