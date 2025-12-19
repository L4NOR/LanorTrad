/**
 * LanorTrad Comments System v2.0
 * Système de commentaires avec Firebase Firestore
 * Les commentaires persistent entre les déploiements et sont partagés entre utilisateurs
 */

// ============================================
// CONFIGURATION FIREBASE
// ============================================
// IMPORTANT: Remplace ces valeurs par ta propre configuration Firebase
// Va sur https://console.firebase.google.com/ pour créer un projet gratuit

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDscyIPMdiBVYl795ScrjdHeqTTvwJVA9I",
    authDomain: "lanortrad-88faf.firebaseapp.com",
    projectId: "lanortrad-88faf",
    storageBucket: "lanortrad-88faf.firebasestorage.app",
    messagingSenderId: "1065105299857",
    appId: "1:1065105299857:web:8304a8ad3e3aca8672a230"
};

// ============================================
// INITIALISATION FIREBASE (CDN)
// ============================================
let db = null;
let firebaseInitialized = false;

async function initFirebase() {
    if (firebaseInitialized) return true;
    
    try {
        // Vérifier si Firebase est déjà chargé
        if (typeof firebase === 'undefined') {
            // Charger Firebase depuis CDN
            await loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
            await loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js');
        }
        
        // Vérifier si la config est valide
        if (FIREBASE_CONFIG.apiKey === "AIzaSyDscyIPMdiBVYl795ScrjdHeqTTvwJVA9I") {
            console.warn('⚠️ Firebase non configuré - Mode localStorage activé');
            return false;
        }
        
        // Initialiser Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(FIREBASE_CONFIG);
        }
        
        db = firebase.firestore();
        firebaseInitialized = true;
        console.log('✅ Firebase initialisé avec succès');
        return true;
    } catch (error) {
        console.error('❌ Erreur Firebase:', error);
        return false;
    }
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// ============================================
// CLASSE PRINCIPALE
// ============================================
class CommentsSystem {
    constructor() {
        this.comments = [];
        this.currentUser = this.loadUserInfo();
        this.sortOrder = 'newest';
        this.maxCommentLength = 1000;
        this.useFirebase = false;
        this.unsubscribe = null;
        
        this.init();
    }

    async init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            await this.setup();
        }
    }

    async setup() {
        // Tenter d'initialiser Firebase
        this.useFirebase = await initFirebase();
        
        // Créer la section commentaires
        this.createCommentsSection();
        
        // Charger les commentaires
        await this.loadComments();
        
        // Configurer les événements
        this.setupEventListeners();
        
        // Afficher les commentaires
        this.renderComments();
        
        // Si Firebase est actif, écouter les changements en temps réel
        if (this.useFirebase) {
            this.listenToComments();
        }
    }

    // ============================================
    // GESTION DES CLÉS ET IDENTIFIANTS
    // ============================================
    getChapterKey() {
        // Créer une clé unique basée sur l'URL du chapitre
        const path = window.location.pathname;
        return path.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    // ============================================
    // GESTION UTILISATEUR
    // ============================================
    loadUserInfo() {
        const saved = localStorage.getItem('lanortrad_user');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return { username: '', visitorId: this.generateId(), likedComments: [] };
            }
        }
        return { username: '', visitorId: this.generateId(), likedComments: [] };
    }

    saveUserInfo() {
        localStorage.setItem('lanortrad_user', JSON.stringify(this.currentUser));
    }

    // ============================================
    // CHARGEMENT / SAUVEGARDE COMMENTAIRES
    // ============================================
    async loadComments() {
        if (this.useFirebase) {
            try {
                const chapterKey = this.getChapterKey();
                const snapshot = await db.collection('comments')
                    .where('chapterKey', '==', chapterKey)
                    .orderBy('timestamp', 'desc')
                    .get();
                
                this.comments = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } catch (error) {
                console.error('Erreur chargement Firebase:', error);
                this.loadLocalComments();
            }
        } else {
            this.loadLocalComments();
        }
    }

    loadLocalComments() {
        const saved = localStorage.getItem(`comments_${this.getChapterKey()}`);
        if (saved) {
            try {
                this.comments = JSON.parse(saved);
            } catch (e) {
                this.comments = [];
            }
        }
    }

    async saveComment(comment) {
        if (this.useFirebase) {
            try {
                const docRef = await db.collection('comments').add({
                    ...comment,
                    chapterKey: this.getChapterKey()
                });
                comment.id = docRef.id;
            } catch (error) {
                console.error('Erreur sauvegarde Firebase:', error);
                this.saveLocalComments();
            }
        } else {
            this.saveLocalComments();
        }
    }

    async updateComment(commentId, updates) {
        if (this.useFirebase) {
            try {
                await db.collection('comments').doc(commentId).update(updates);
            } catch (error) {
                console.error('Erreur mise à jour Firebase:', error);
            }
        }
        this.saveLocalComments();
    }

    async deleteCommentFromDB(commentId) {
        if (this.useFirebase) {
            try {
                await db.collection('comments').doc(commentId).delete();
            } catch (error) {
                console.error('Erreur suppression Firebase:', error);
            }
        }
        this.saveLocalComments();
    }

    saveLocalComments() {
        localStorage.setItem(`comments_${this.getChapterKey()}`, JSON.stringify(this.comments));
    }

    // Écouter les changements en temps réel
    listenToComments() {
        if (!this.useFirebase || !db) return;
        
        const chapterKey = this.getChapterKey();
        this.unsubscribe = db.collection('comments')
            .where('chapterKey', '==', chapterKey)
            .orderBy('timestamp', 'desc')
            .onSnapshot(snapshot => {
                this.comments = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                this.renderComments();
            }, error => {
                console.error('Erreur écoute Firebase:', error);
            });
    }

    // ============================================
    // INTERFACE UTILISATEUR
    // ============================================
    createCommentsSection() {
        const footer = document.querySelector('footer');
        if (!footer) return;

        const section = document.createElement('section');
        section.id = 'commentsSection';
        section.className = 'comments-section';
        section.innerHTML = `
            <div class="comments-container">
                <div class="comments-header">
                    <div class="comments-title">
                        <div class="title-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                            </svg>
                        </div>
                        <h2>Commentaires</h2>
                        <span class="comment-count" id="commentCount">0</span>
                        ${this.useFirebase ? '<span class="live-badge">● Live</span>' : ''}
                    </div>
                    <div class="comments-sort">
                        <button class="sort-btn active" data-sort="newest">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 5v14M5 12l7-7 7 7"/>
                            </svg>
                            Récents
                        </button>
                        <button class="sort-btn" data-sort="oldest">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 19V5M5 12l7 7 7-7"/>
                            </svg>
                            Anciens
                        </button>
                        <button class="sort-btn" data-sort="popular">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                            </svg>
                            Populaires
                        </button>
                    </div>
                </div>

                <div class="comment-form">
                    <div class="form-glow"></div>
                    <div class="comment-form-inner">
                        <div class="comment-form-header">
                            <div class="avatar-container">
                                <div class="avatar-placeholder" id="userAvatar">?</div>
                                <div class="avatar-ring"></div>
                            </div>
                            <div class="username-wrapper">
                                <input type="text" 
                                       class="username-input" 
                                       id="usernameInput" 
                                       placeholder="Ton pseudo" 
                                       maxlength="30"
                                       value="${this.escapeHtml(this.currentUser.username)}">
                                <span class="input-focus-border"></span>
                            </div>
                        </div>
                        <div class="textarea-wrapper">
                            <textarea class="comment-textarea" 
                                      id="commentTextarea" 
                                      placeholder="Partage ton avis sur ce chapitre... 💭"
                                      maxlength="${this.maxCommentLength}"></textarea>
                            <span class="textarea-focus-border"></span>
                        </div>
                        <div class="comment-form-actions">
                            <div class="form-info">
                                <span class="char-count" id="charCount">0 / ${this.maxCommentLength}</span>
                                <span class="hint">Ctrl + Entrée pour publier</span>
                            </div>
                            <button class="submit-comment-btn" id="submitComment" disabled>
                                <span class="btn-content">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                                    </svg>
                                    Publier
                                </span>
                                <span class="btn-loader"></span>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="comments-list" id="commentsList">
                    <!-- Les commentaires seront insérés ici -->
                </div>
            </div>
        `;

        footer.parentNode.insertBefore(section, footer);
    }

    setupEventListeners() {
        // Username input
        const usernameInput = document.getElementById('usernameInput');
        if (usernameInput) {
            usernameInput.addEventListener('input', (e) => {
                this.currentUser.username = e.target.value.trim();
                this.saveUserInfo();
                this.updateAvatar();
                this.validateForm();
            });
        }

        // Comment textarea
        const textarea = document.getElementById('commentTextarea');
        if (textarea) {
            textarea.addEventListener('input', (e) => {
                this.updateCharCount(e.target.value.length);
                this.validateForm();
            });

            textarea.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 300) + 'px';
            });

            textarea.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    this.submitComment();
                }
            });
        }

        // Submit button
        const submitBtn = document.getElementById('submitComment');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitComment());
        }

        // Sort buttons
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.sortOrder = btn.dataset.sort;
                this.renderComments();
            });
        });

        this.updateAvatar();
    }

    updateAvatar() {
        const avatar = document.getElementById('userAvatar');
        if (avatar) {
            const username = this.currentUser.username;
            avatar.textContent = username ? username.charAt(0).toUpperCase() : '?';
            
            // Générer couleur basée sur le nom
            if (username) {
                const hue = this.stringToHue(username);
                avatar.style.background = `linear-gradient(135deg, hsl(${hue}, 70%, 50%), hsl(${hue + 30}, 70%, 60%))`;
            }
        }
    }

    updateCharCount(count) {
        const charCountEl = document.getElementById('charCount');
        if (!charCountEl) return;

        charCountEl.textContent = `${count} / ${this.maxCommentLength}`;
        charCountEl.classList.remove('warning', 'error');

        if (count > this.maxCommentLength * 0.9) {
            charCountEl.classList.add('error');
        } else if (count > this.maxCommentLength * 0.75) {
            charCountEl.classList.add('warning');
        }
    }

    validateForm() {
        const usernameInput = document.getElementById('usernameInput');
        const textarea = document.getElementById('commentTextarea');
        const submitBtn = document.getElementById('submitComment');

        if (!usernameInput || !textarea || !submitBtn) return;

        const hasUsername = usernameInput.value.trim().length >= 2;
        const hasContent = textarea.value.trim().length >= 3;
        const notTooLong = textarea.value.length <= this.maxCommentLength;

        submitBtn.disabled = !(hasUsername && hasContent && notTooLong);
    }

    async submitComment() {
        const usernameInput = document.getElementById('usernameInput');
        const textarea = document.getElementById('commentTextarea');
        const submitBtn = document.getElementById('submitComment');

        if (!usernameInput || !textarea || submitBtn.disabled) return;

        const username = usernameInput.value.trim();
        const content = textarea.value.trim();

        if (username.length < 2 || content.length < 3) return;

        // Animation de chargement
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        const comment = {
            id: this.generateId(),
            username: username,
            visitorId: this.currentUser.visitorId,
            content: content,
            timestamp: Date.now(),
            likes: 0,
            replies: []
        };

        // Sauvegarder
        await this.saveComment(comment);
        
        if (!this.useFirebase) {
            this.comments.unshift(comment);
            this.renderComments();
        }

        // Reset form
        textarea.value = '';
        textarea.style.height = 'auto';
        this.updateCharCount(0);
        submitBtn.classList.remove('loading');
        this.validateForm();

        this.showNotification('Commentaire publié ! 🎉');
    }

    // ============================================
    // RENDU DES COMMENTAIRES
    // ============================================
    renderComments() {
        const container = document.getElementById('commentsList');
        const countEl = document.getElementById('commentCount');
        if (!container) return;

        // Trier les commentaires
        let sorted = [...this.comments];
        switch (this.sortOrder) {
            case 'oldest':
                sorted.sort((a, b) => a.timestamp - b.timestamp);
                break;
            case 'popular':
                sorted.sort((a, b) => b.likes - a.likes);
                break;
            default: // newest
                sorted.sort((a, b) => b.timestamp - a.timestamp);
        }

        // Mettre à jour le compteur
        if (countEl) countEl.textContent = this.comments.length;

        // Afficher les commentaires ou le message vide
        if (sorted.length === 0) {
            container.innerHTML = `
                <div class="no-comments">
                    <div class="empty-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="64" height="64">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                        </svg>
                    </div>
                    <p>Aucun commentaire pour l'instant</p>
                    <span>Sois le premier à partager ton avis ! ✨</span>
                </div>
            `;
            return;
        }

        container.innerHTML = sorted.map(comment => this.createCommentHTML(comment)).join('');
        this.attachCommentListeners();
    }

    createCommentHTML(comment) {
        const isLiked = this.currentUser.likedComments.includes(comment.id);
        const isOwner = comment.visitorId === this.currentUser.visitorId;
        const timeAgo = this.formatTimeAgo(comment.timestamp);
        const initial = comment.username.charAt(0).toUpperCase();
        const hue = this.stringToHue(comment.username);

        let repliesHTML = '';
        if (comment.replies && comment.replies.length > 0) {
            repliesHTML = `
                <div class="comment-replies">
                    ${comment.replies.map(reply => `
                        <div class="reply-card">
                            <div class="comment-header">
                                <div class="comment-avatar small" style="background: linear-gradient(135deg, hsl(${this.stringToHue(reply.username)}, 70%, 50%), hsl(${this.stringToHue(reply.username) + 30}, 70%, 60%));">
                                    ${reply.username.charAt(0).toUpperCase()}
                                </div>
                                <div class="comment-meta">
                                    <span class="comment-author">${this.escapeHtml(reply.username)}</span>
                                    <span class="comment-date">${this.formatTimeAgo(reply.timestamp)}</span>
                                </div>
                            </div>
                            <div class="comment-content">${this.escapeHtml(reply.content)}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        return `
            <div class="comment-card" data-id="${comment.id}">
                <div class="comment-card-glow"></div>
                <div class="comment-header">
                    <div class="comment-avatar" style="background: linear-gradient(135deg, hsl(${hue}, 70%, 50%), hsl(${hue + 30}, 70%, 60%));">
                        ${initial}
                    </div>
                    <div class="comment-meta">
                        <span class="comment-author">${this.escapeHtml(comment.username)}</span>
                        <span class="comment-date">${timeAgo}</span>
                    </div>
                    ${isOwner ? '<span class="owner-badge">Vous</span>' : ''}
                </div>
                <div class="comment-content">${this.escapeHtml(comment.content)}</div>
                <div class="comment-actions">
                    <button class="comment-action-btn like-btn ${isLiked ? 'liked' : ''}" data-action="like" data-id="${comment.id}">
                        <svg fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                        <span>${comment.likes}</span>
                    </button>
                    <button class="comment-action-btn reply-toggle-btn" data-action="reply" data-id="${comment.id}">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                        </svg>
                        <span>Répondre</span>
                    </button>
                    ${isOwner ? `
                        <button class="comment-action-btn delete-btn" data-action="delete" data-id="${comment.id}">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                            <span>Supprimer</span>
                        </button>
                    ` : ''}
                </div>
                <div class="reply-form hidden" id="replyForm_${comment.id}">
                    <textarea placeholder="Ta réponse..." maxlength="500"></textarea>
                    <div class="reply-form-actions">
                        <button class="reply-btn cancel" data-action="cancelReply" data-id="${comment.id}">Annuler</button>
                        <button class="reply-btn submit" data-action="submitReply" data-id="${comment.id}">Répondre</button>
                    </div>
                </div>
                ${repliesHTML}
            </div>
        `;
    }

    attachCommentListeners() {
        document.querySelectorAll('[data-action="like"]').forEach(btn => {
            btn.addEventListener('click', () => this.likeComment(btn.dataset.id));
        });

        document.querySelectorAll('[data-action="reply"]').forEach(btn => {
            btn.addEventListener('click', () => this.toggleReplyForm(btn.dataset.id));
        });

        document.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', () => this.deleteComment(btn.dataset.id));
        });

        document.querySelectorAll('[data-action="cancelReply"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const replyForm = document.getElementById(`replyForm_${btn.dataset.id}`);
                if (replyForm) replyForm.classList.add('hidden');
            });
        });

        document.querySelectorAll('[data-action="submitReply"]').forEach(btn => {
            btn.addEventListener('click', () => this.submitReply(btn.dataset.id));
        });
    }

    async likeComment(commentId) {
        const comment = this.comments.find(c => c.id === commentId);
        if (!comment) return;

        const isLiked = this.currentUser.likedComments.includes(commentId);

        if (isLiked) {
            comment.likes--;
            this.currentUser.likedComments = this.currentUser.likedComments.filter(id => id !== commentId);
        } else {
            comment.likes++;
            this.currentUser.likedComments.push(commentId);
        }

        this.saveUserInfo();
        await this.updateComment(commentId, { likes: comment.likes });
        
        if (!this.useFirebase) {
            this.renderComments();
        }
    }

    toggleReplyForm(commentId) {
        const replyForm = document.getElementById(`replyForm_${commentId}`);
        if (replyForm) {
            replyForm.classList.toggle('hidden');
            if (!replyForm.classList.contains('hidden')) {
                replyForm.querySelector('textarea').focus();
            }
        }
    }

    async submitReply(commentId) {
        const replyForm = document.getElementById(`replyForm_${commentId}`);
        const textarea = replyForm?.querySelector('textarea');
        
        if (!textarea || !this.currentUser.username) return;

        const content = textarea.value.trim();
        if (content.length < 2) return;

        const comment = this.comments.find(c => c.id === commentId);
        if (!comment) return;

        const reply = {
            id: this.generateId(),
            username: this.currentUser.username,
            visitorId: this.currentUser.visitorId,
            content: content,
            timestamp: Date.now()
        };

        if (!comment.replies) comment.replies = [];
        comment.replies.push(reply);

        await this.updateComment(commentId, { replies: comment.replies });

        textarea.value = '';
        replyForm.classList.add('hidden');

        if (!this.useFirebase) {
            this.renderComments();
        }
        
        this.showNotification('Réponse publiée !');
    }

    async deleteComment(commentId) {
        if (!confirm('Supprimer ce commentaire ?')) return;

        await this.deleteCommentFromDB(commentId);
        this.comments = this.comments.filter(c => c.id !== commentId);
        
        if (!this.useFirebase) {
            this.renderComments();
        }
        
        this.showNotification('Commentaire supprimé');
    }

    // ============================================
    // UTILITAIRES
    // ============================================
    formatTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);

        if (minutes < 1) return 'À l\'instant';
        if (minutes < 60) return `Il y a ${minutes} min`;
        if (hours < 24) return `Il y a ${hours}h`;
        if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
        if (weeks < 4) return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
        if (months < 12) return `Il y a ${months} mois`;
        
        return new Date(timestamp).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    stringToHue(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash % 360);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message) {
        const existing = document.querySelector('.comment-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'comment-notification';
        notification.innerHTML = `
            <span class="notification-icon">✓</span>
            <span class="notification-text">${message}</span>
        `;
        document.body.appendChild(notification);

        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Nettoyage
    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}

// Initialize
const commentsSystem = new CommentsSystem();
window.CommentsSystem = commentsSystem;

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    commentsSystem.destroy();
});
