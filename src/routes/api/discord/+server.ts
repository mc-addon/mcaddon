import { DISCORD_BOT_TOKEN } from "$env/static/private";
import { PUBLIC_DISCORD_URL } from "$env/static/public";
import { fetchSettings } from "$lib/db/funcs";
import { json } from "@sveltejs/kit";

export async function GET({ locals, setHeaders }) {
    setHeaders({
        "Cache-Control": "max-age=20, s-maxage=20",
    });
    const user = locals.user;
    if (!user) {
        return json({ error: "Unauthorized" }, { status: 401 });
    }
    const guildID = await fetchSettings(locals.db, "guildId");

    if (!guildID) {
        return json({ error: "Guild ID not found in settings" }, { status: 404 });
    }

    const resp = await fetch(`${PUBLIC_DISCORD_URL}/guilds/${guildID}/members/${user.id}`, {
        headers: {
            Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
    });
    if (resp.status === 404) {
        return json({ inGuild: false, data: await resp.json() }, { status: 404 });
    } else if (!resp.ok) {
        return json({ error: "Failed to check guild membership" }, { status: resp.status });
    }

    return json({ inGuild: true });
}
