import { JWT_SECRET } from "$env/static/private";
import { userTable } from "$lib/db/schema.js";
import type { MinecraftUserInfo } from "$lib/minecraft/types";
import { getUserInfo } from "$lib/minecraft/user.js";
import { signData } from "$lib/utils/jwt.js";
import { json, type Cookies } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

async function setMinecraftAccount(type: "java" | "bedrock", username: string, cookies: Cookies) {
    const info = await getUserInfo(username, type);
    if (!info) {
        return json({ error: "User not found" }, { status: 404 });
    } else {
        const expiresIn = 60 * 60 * 24 * 365; // 1 year
        const token = await signData(info, JWT_SECRET, `${expiresIn}s`);
        cookies.set("mc", token, {
            path: "/",
            maxAge: expiresIn,
            sameSite: "none",
            httpOnly: true,
            secure: true,
        });
        return json({ success: true, info, type }, { status: 200 });
    }
}

async function unsetMinecraftAccount(cookies: Cookies) {
    cookies.delete("mc", { path: "/" });
    return json({ success: true }, { status: 200 });
}

async function linkMinecraftAccount(locals: App.Locals, action: "link" | "unlink") {
    const user = locals.user;
    if (!user) {
        return json({ error: "Unauthorized" }, { status: 401 });
    }

    const mc: MinecraftUserInfo | null = locals.mc;

    if (action === "unlink") {
        await locals.db.update(userTable).set({ minecraft: null }).where(eq(userTable.userID, user.id));
        return json({ success: true });
    } else if (action === "link") {
        if (!mc) {
            return json({ error: "No Minecraft account set" }, { status: 400 });
        }
        await locals.db.update(userTable).set({ minecraft: mc }).where(eq(userTable.userID, user.id));
        return json({ success: true });
    } else {
        return json({ error: "Invalid action" }, { status: 400 });
    }
}

export async function POST({ locals, request, cookies }) {
    const { action, type, username } = await request.json();

    if (!action || !["link", "unlink", "set", "unset"].includes(action)) {
        return json({ error: "Invalid action" }, { status: 400 });
    }

    if (action === "set") {
        if (!type || !username) {
            return json({ error: `Missing ${!type ? "type" : "username"} parameter` }, { status: 400 });
        }
        return await setMinecraftAccount(type as "java" | "bedrock", username, cookies);
    } else if (action === "unset") {
        return await unsetMinecraftAccount(cookies);
    } else if (action === "unlink" || action === "link") {
        return await linkMinecraftAccount(locals, action);
    }
}
