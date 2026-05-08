// Remplace les images des membres de l'équipe par leur avatar Discord en direct.
// Ajoute simplement data-discord-id="<id>" sur le <img> (ou un parent) pour activer.
(function () {
    const ID_RE = /^\d{17,20}$/;

    function loadAvatar(img) {
        const id = img.dataset.discordId || img.closest("[data-discord-id]")?.dataset.discordId;
        if (!id || !ID_RE.test(id)) return;

        const fallback = img.src;
        const url = `/api/discord-avatar?id=${encodeURIComponent(id)}&size=512`;

        const probe = new Image();
        probe.onload = () => {
            img.src = url;
        };
        probe.onerror = () => {
            // garde le fallback local si la fonction est indisponible
            img.src = fallback;
        };
        probe.src = url;
    }

    function init() {
        document.querySelectorAll("img[data-discord-id]").forEach(loadAvatar);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
