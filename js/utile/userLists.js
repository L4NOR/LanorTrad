class UserLists {
    constructor() {
        this.lists = this.loadLists();
        this.sharedLists = this.loadSharedLists();
        this.init();
    }

    init() {
        this.checkImportedList();
    }

    // === GESTION DES LISTES ===
    loadLists() {
        return JSON.parse(localStorage.getItem('lanortrad_lists') || JSON.stringify([
            {
                id: 'reading',
                name: 'En cours de lecture',
                icon: '📖',
                isDefault: true,
                mangas: [],
                createdAt: Date.now()
            },
            {
                id: 'to-read',
                name: 'À lire plus tard',
                icon: '📚',
                isDefault: true,
                mangas: [],
                createdAt: Date.now()
            },
            {
                id: 'completed',
                name: 'Terminés',
                icon: '✅',
                isDefault: true,
                mangas: [],
                createdAt: Date.now()
            }
        ]));
    }

    saveLists() {
        localStorage.setItem('lanortrad_lists', JSON.stringify(this.lists));
    }

    loadSharedLists() {
        return JSON.parse(localStorage.getItem('lanortrad_shared_lists') || '[]');
    }

    saveSharedLists() {
        localStorage.setItem('lanortrad_shared_lists', JSON.stringify(this.sharedLists));
    }

    createList(name, icon = '📝') {
        if (!name || name.trim().length === 0) {
            if (window.toast) window.toast.error('Le nom de la liste ne peut pas être vide');
            return null;
        }

        // Vérifier si une liste avec ce nom existe déjà
        if (this.lists.some(list => list.name.toLowerCase() === name.toLowerCase())) {
            if (window.toast) window.toast.error('Une liste avec ce nom existe déjà');
            return null;
        }

        const newList = {
            id: this.generateId(),
            name: name.trim(),
            icon: icon,
            isDefault: false,
            mangas: [],
            createdAt: Date.now()
        };

        this.lists.push(newList);
        this.saveLists();

        if (window.toast) window.toast.success(`✨ Liste "${name}" créée !`);
        return newList;
    }

    deleteList(listId) {
        const list = this.lists.find(l => l.id === listId);
        
        if (!list) return false;
        
        if (list.isDefault) {
            if (window.toast) window.toast.error('Les listes par défaut ne peuvent pas être supprimées');
            return false;
        }

        this.lists = this.lists.filter(l => l.id !== listId);
        this.saveLists();

        if (window.toast) window.toast.success(`🗑️ Liste "${list.name}" supprimée`);
        return true;
    }

    renameList(listId, newName) {
        const list = this.lists.find(l => l.id === listId);
        
        if (!list) return false;
        
        if (list.isDefault) {
            if (window.toast) window.toast.error('Les listes par défaut ne peuvent pas être renommées');
            return false;
        }

        list.name = newName.trim();
        this.saveLists();

        if (window.toast) window.toast.success('✏️ Liste renommée');
        return true;
    }

    // === GESTION DES MANGAS DANS LES LISTES ===
    addMangaToList(listId, mangaData) {
        const list = this.lists.find(l => l.id === listId);
        if (!list) return false;

        // Vérifier si le manga est déjà dans la liste
        if (list.mangas.some(m => m.id === mangaData.id)) {
            if (window.toast) window.toast.info(`"${mangaData.title}" est déjà dans "${list.name}"`);
            return false;
        }

        list.mangas.push({
            id: mangaData.id,
            title: mangaData.title,
            image: mangaData.image,
            addedAt: Date.now()
        });

        this.saveLists();

        if (window.toast) window.toast.success(`➕ "${mangaData.title}" ajouté à "${list.name}"`);
        return true;
    }

    removeMangaFromList(listId, mangaId) {
        const list = this.lists.find(l => l.id === listId);
        if (!list) return false;

        const manga = list.mangas.find(m => m.id === mangaId);
        list.mangas = list.mangas.filter(m => m.id !== mangaId);
        
        this.saveLists();

        if (window.toast && manga) {
            window.toast.info(`➖ "${manga.title}" retiré de "${list.name}"`);
        }
        return true;
    }

    moveManga(mangaId, fromListId, toListId) {
        const fromList = this.lists.find(l => l.id === fromListId);
        const toList = this.lists.find(l => l.id === toListId);
        
        if (!fromList || !toList) return false;

        const manga = fromList.mangas.find(m => m.id === mangaId);
        if (!manga) return false;

        // Retirer de l'ancienne liste
        fromList.mangas = fromList.mangas.filter(m => m.id !== mangaId);
        
        // Ajouter à la nouvelle liste si pas déjà présent
        if (!toList.mangas.some(m => m.id === mangaId)) {
            toList.mangas.push({
                ...manga,
                addedAt: Date.now()
            });
        }

        this.saveLists();

        if (window.toast) {
            window.toast.success(`📦 "${manga.title}" déplacé vers "${toList.name}"`);
        }
        return true;
    }

    isMangaInList(listId, mangaId) {
        const list = this.lists.find(l => l.id === listId);
        if (!list) return false;
        return list.mangas.some(m => m.id === mangaId);
    }

    getMangaLists(mangaId) {
        return this.lists.filter(list => 
            list.mangas.some(m => m.id === mangaId)
        );
    }

    // === PARTAGE DE LISTES ===
    shareList(listId) {
        const list = this.lists.find(l => l.id === listId);
        if (!list) return null;

        const shareData = {
            id: this.generateShareId(),
            listName: list.name,
            listIcon: list.icon,
            mangas: list.mangas.map(m => ({
                id: m.id,
                title: m.title,
                image: m.image
            })),
            sharedBy: 'Utilisateur',
            sharedAt: Date.now()
        };

        // Générer le lien de partage
        const shareUrl = `${window.location.origin}${window.location.pathname}?importList=${shareData.id}`;
        
        // Sauvegarder dans le localStorage pour permettre l'import
        const sharedLists = JSON.parse(localStorage.getItem('lanortrad_public_shares') || '{}');
        sharedLists[shareData.id] = shareData;
        localStorage.setItem('lanortrad_public_shares', JSON.stringify(sharedLists));

        return {
            url: shareUrl,
            shareId: shareData.id,
            data: shareData
        };
    }

    importList(shareId) {
        const sharedLists = JSON.parse(localStorage.getItem('lanortrad_public_shares') || '{}');
        const shareData = sharedLists[shareId];

        if (!shareData) {
            if (window.toast) window.toast.error('Liste partagée introuvable');
            return null;
        }

        // Créer une nouvelle liste avec les données partagées
        const importedList = {
            id: this.generateId(),
            name: `${shareData.listName} (importée)`,
            icon: shareData.listIcon,
            isDefault: false,
            mangas: shareData.mangas.map(m => ({
                ...m,
                addedAt: Date.now()
            })),
            createdAt: Date.now(),
            importedFrom: shareData.sharedBy,
            importedAt: Date.now()
        };

        this.lists.push(importedList);
        this.saveLists();

        if (window.toast) {
            window.toast.success(`📥 Liste "${shareData.listName}" importée avec ${shareData.mangas.length} manga(s)`);
        }

        return importedList;
    }

    checkImportedList() {
        const urlParams = new URLSearchParams(window.location.search);
        const importId = urlParams.get('importList');

        if (importId) {
            // Nettoyer l'URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Importer la liste
            setTimeout(() => {
                this.importList(importId);
            }, 500);
        }
    }

    exportListAsJSON(listId) {
        const list = this.lists.find(l => l.id === listId);
        if (!list) return null;

        const exportData = {
            name: list.name,
            icon: list.icon,
            mangas: list.mangas,
            exportedAt: Date.now(),
            version: '1.0'
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${list.name.replace(/\s+/g, '_')}_LanorTrad.json`;
        link.click();
        
        URL.revokeObjectURL(url);

        if (window.toast) {
            window.toast.success(`💾 Liste "${list.name}" exportée`);
        }
    }

    // === UTILITAIRES ===
    generateId() {
        return 'list_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateShareId() {
        return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    getAllLists() {
        return this.lists;
    }

    getList(listId) {
        return this.lists.find(l => l.id === listId);
    }

    getStats() {
        return {
            totalLists: this.lists.length,
            customLists: this.lists.filter(l => !l.isDefault).length,
            totalMangas: this.lists.reduce((sum, list) => sum + list.mangas.length, 0)
        };
    }
}

// Initialiser
const userLists = new UserLists();
window.userLists = userLists;
