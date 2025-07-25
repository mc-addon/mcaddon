import { PUBLIC_DISCORD_URL } from "$env/static/public";
import type { DB } from "$lib/db";
import { fetchSettings } from "$lib/db/funcs";
import { error } from "@sveltejs/kit";
import type { APIGuild, APIUser } from "discord-api-types/v10";

export async function getNewAccessToken(refreshToken: string, clientID: string, clientSecret: string) {
    const resp = await fetch(`${PUBLIC_DISCORD_URL}/oauth2/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: clientID,
            client_secret: clientSecret,
            grant_type: "refresh_token",
            refresh_token: refreshToken,
        }).toString(),
    });

    const data = await resp.json();
    if (resp.ok) {
        return data;
    } else {
        return null;
    }
}

export async function getUserData(access_token: string): Promise<APIUser> {
    const userDataResponse = await fetch(`${PUBLIC_DISCORD_URL}/users/@me`, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
    if (!userDataResponse.ok) {
        error(userDataResponse.status, userDataResponse.statusText);
    }

    const userData: APIUser = await userDataResponse.json();

    return userData;
}

export async function getGuildData(baseURI: string, botToken: string, guildID: string) {
    const resp = await fetch(`${baseURI}/guilds/${guildID}`, {
        headers: {
            Authorization: `Bot ${botToken}`,
        },
    });

    if (!resp.ok) {
        return { error: true, status: resp.status, message: await resp.text() };
    }

    return (await resp.json()) as APIGuild;
}

export function getUserAvatar(
    userID: string | null | undefined,
    avatarHash: string | null | undefined,
    ext: "webp" | "png" | "jpg" | "gif" = "webp",
): string {
    if (!userID || !avatarHash) {
        return `https://cdn.discordapp.com/embed/avatars/0.png`;
    }
    return `https://cdn.discordapp.com/avatars/${userID}/${avatarHash}.${ext}`;
}

export async function isAdmin(db: DB, userID: string): Promise<boolean> {
    const adminIDs = await fetchSettings(db, "adminIDs");
    if (!adminIDs) {
        return false;
    }
    return adminIDs.includes(userID);
}

export async function fetchUserData(baseURI: string, botToken: string, id: string) {
    const resp = await fetch(`${baseURI}/users/${id}`, {
        headers: {
            Authorization: `Bot ${botToken}`,
        },
    });
    if (!resp.ok) {
        return { error: true };
    }
    return (await resp.json()) as APIUser;
}

export async function checkIfUserInGuild(fetch: typeof globalThis.fetch): Promise<boolean> {
    const resp = await fetch("/api/discord");
    const data = await resp.json();
    if (resp.ok) {
        return data.inGuild;
    }
    if (data.error) {
        return false;
    }
    return false;
}

export async function changeNickname(
    baseURI: string,
    botToken: string,
    db: DB,
    userID: string,
    nickname: string | null,
    fetch: typeof globalThis.fetch,
) {
    const guild = await fetchSettings(db, "guild");
    const guildID = guild?.id;
    if (guildID) {
        const inGuild = await checkIfUserInGuild(fetch);
        if (!inGuild) {
            return { error: true, status: 403, message: "User is not in the guild" };
        }
        const resp = await fetch(`${baseURI}/guilds/${guildID}/members/${userID}`, {
            method: "PATCH",
            headers: {
                Authorization: `Bot ${botToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ nick: nickname }),
        });
        if (!resp.ok) {
            return { error: true, status: resp.status, message: await resp.text() };
        }
        return { success: true };
    }
}

export async function resetNickname(baseURI: string, botToken: string, db: DB, userID: string, fetch: typeof globalThis.fetch) {
    const guild = await fetchSettings(db, "guild");
    const guildID = guild?.id;
    if (guildID) {
        const resp = await fetch(`${baseURI}/guilds/${guildID}/members/${userID}`, {
            method: "PATCH",
            headers: {
                Authorization: `Bot ${botToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ nick: null }),
        });
        if (!resp.ok) {
            return { error: true, status: resp.status, message: await resp.text() };
        }
        return { success: true };
    }
}
