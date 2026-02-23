// ============================================
// Configuration des publicités - LanorTrad
// ============================================
//
// CHOISIS TON SERVICE DE PUBS :
//
// ► OPTION 1 : EZOIC (recommandé - meilleurs revenus)
//   1. Crée un compte sur https://www.ezoic.com
//   2. Ajoute ton site et vérifie-le
//   3. Crée des "Placeholders" dans le dashboard Ezoic
//   4. Change provider en 'ezoic' ci-dessous
//   5. Remplace les IDs dans ezoicPlaceholders
//
// ► OPTION 2 : GOOGLE ADSENSE
//   1. Va sur https://www.google.com/adsense/
//   2. Crée des blocs d'annonces "Display"
//   3. Change provider en 'adsense' ci-dessous
//   4. Remplace les IDs dans adsenseSlots
//
// ============================================

const ADS_CONFIG = {
    // ===== CHOISIS ICI =====
    provider: 'ezoic', // 'ezoic' ou 'adsense'
    enabled: true,      // false pour désactiver toutes les pubs

    // --- Config Ezoic ---
    ezoicPlaceholders: {
        // Remplace par tes vrais IDs de placeholders Ezoic
        // (les numéros que tu obtiens dans Monetization > Placeholders)
        banner: 101,
        rectangle: 102,
        reader_top: 103,
        reader_bottom: 104
    },

    // --- Config AdSense ---
    adsenseClient: 'ca-pub-5673170839903363',
    adsenseSlots: {
        // Remplace par tes vrais data-ad-slot AdSense
        banner: 'REMPLACER_PAR_TON_SLOT_ID',
        rectangle: 'REMPLACER_PAR_TON_SLOT_ID',
        reader_top: 'REMPLACER_PAR_TON_SLOT_ID',
        reader_bottom: 'REMPLACER_PAR_TON_SLOT_ID'
    }
};

// ============================================
// NE TOUCHE PAS EN DESSOUS (sauf si tu sais ce que tu fais)
// ============================================

function initAds() {
    if (!ADS_CONFIG.enabled) return;

    if (ADS_CONFIG.provider === 'ezoic') {
        initEzoic();
    } else if (ADS_CONFIG.provider === 'adsense') {
        initAdSense();
    }
}

// --- EZOIC ---
function initEzoic() {
    const adContainers = document.querySelectorAll('.ad-container');
    const placeholderIds = [];

    adContainers.forEach(container => {
        const slotType = container.dataset.adType || 'banner';
        const placeholderId = ADS_CONFIG.ezoicPlaceholders[slotType];

        if (!placeholderId) {
            container.style.display = 'none';
            return;
        }

        // Créer le div placeholder Ezoic
        const ezoicDiv = document.createElement('div');
        ezoicDiv.id = 'ezoic-pub-ad-placeholder-' + placeholderId;
        container.appendChild(ezoicDiv);

        placeholderIds.push(placeholderId);
    });

    // Déclencher l'affichage des pubs Ezoic
    if (placeholderIds.length > 0 && typeof ezstandalone !== 'undefined') {
        if (typeof ezstandalone.showAds === 'function') {
            ezstandalone.showAds();
        }
    }
}

// --- ADSENSE ---
function initAdSense() {
    const adContainers = document.querySelectorAll('.ad-container');

    adContainers.forEach(container => {
        const slotType = container.dataset.adType || 'banner';
        const slotId = ADS_CONFIG.adsenseSlots[slotType];

        // Ne pas insérer si le slot n'est pas configuré
        if (!slotId || slotId === 'REMPLACER_PAR_TON_SLOT_ID') {
            container.style.display = 'none';
            return;
        }

        // Créer l'élément AdSense
        const ins = document.createElement('ins');
        ins.className = 'adsbygoogle';
        ins.style.display = 'block';
        ins.setAttribute('data-ad-client', ADS_CONFIG.adsenseClient);
        ins.setAttribute('data-ad-slot', slotId);
        ins.setAttribute('data-ad-format', 'auto');
        ins.setAttribute('data-full-width-responsive', 'true');

        container.appendChild(ins);

        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            // AdSense pas chargé ou bloqué
        }
    });
}

// Initialiser quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAds);
} else {
    initAds();
}
