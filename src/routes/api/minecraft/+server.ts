import { JWT_SECRET } from "$env/static/private";
import { signData } from "$lib/utils/jwt.js";
import { json, type Cookies } from "@sveltejs/kit";

async function setMinecraftAccount(username: string, cookies: Cookies) {
    const expiresIn = 60 * 60 * 24 * 365; // 1 year
    const token = await signData({ username }, JWT_SECRET, `${expiresIn}s`);
    cookies.set("mc", token, {
        path: "/",
        maxAge: expiresIn,
        sameSite: "none",
        httpOnly: true,
        secure: true,
    });
    return json({ success: true, username }, { status: 200 });
}

async function unsetMinecraftAccount(cookies: Cookies) {
    cookies.delete("mc", { path: "/" });
    return json({ success: true }, { status: 200 });
}

export async function POST({ request, cookies }) {
    const { action, username } = await request.json();

    if (!action || !["set", "unset"].includes(action)) {
        return json({ error: "Invalid action" }, { status: 400 });
    }

    if (action === "set") {
        if (!username) {
            return json({ error: `Missing username parameter` }, { status: 400 });
        }
        return await setMinecraftAccount(username, cookies);
    } else if (action === "unset") {
        return await unsetMinecraftAccount(cookies);
    }
}
