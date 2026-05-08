// Netlify Function: proxie l'avatar Discord d'un utilisateur en temps réel.
// Usage : /api/discord-avatar?id=<discord_user_id>
// Requiert la variable d'env DISCORD_BOT_TOKEN (token d'un bot dans le serveur).

const ID_RE = /^\d{17,20}$/;

export default async (req) => {
    const url = new URL(req.url);
    const userId = url.searchParams.get("id");
    const size = url.searchParams.get("size") || "512";

    if (!userId || !ID_RE.test(userId)) {
        return new Response("Invalid id", { status: 400 });
    }

    const token = Netlify.env.get("DISCORD_BOT_TOKEN");
    if (!token) {
        return new Response("Missing DISCORD_BOT_TOKEN", { status: 500 });
    }

    let avatarUrl;
    try {
        const userRes = await fetch(`https://discord.com/api/v10/users/${userId}`, {
            headers: { Authorization: `Bot ${token}` },
        });

        if (userRes.ok) {
            const user = await userRes.json();
            if (user.avatar) {
                const ext = user.avatar.startsWith("a_") ? "gif" : "png";
                avatarUrl = `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.${ext}?size=${size}`;
            }
        }
    } catch {
        // tombe en fallback ci-dessous
    }

    if (!avatarUrl) {
        // Avatar par défaut Discord (sur l'index dérivé du snowflake)
        const idx = Number((BigInt(userId) >> 22n) % 6n);
        avatarUrl = `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
    }

    const imgRes = await fetch(avatarUrl);
    if (!imgRes.ok) {
        return new Response("Avatar fetch failed", { status: 502 });
    }

    return new Response(imgRes.body, {
        status: 200,
        headers: {
            "Content-Type": imgRes.headers.get("content-type") || "image/png",
            // Cache 1h côté CDN Netlify, 5min navigateur
            "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
        },
    });
};

export const config = {
    path: "/api/discord-avatar",
};
