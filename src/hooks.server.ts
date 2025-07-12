import { JWT_SECRET, TEBEX_PRIVATE_KEY } from "$env/static/private";
import { PUBLIC_TEBEX_TOKEN } from "$env/static/public";
import { db } from "$lib/db";
import { verifyData } from "$lib/discord/jwt";
import { redirect, type Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import type { APIUser } from "discord-api-types/v10";
import { TebexHeadless } from "tebex_headless";

const handleRefreshHook: Handle = async ({ event, resolve }) => {
    const accessToken: string | undefined = event.cookies.get("access_token");
    const refreshToken: string | undefined = event.cookies.get("refresh_token");

    if (!accessToken && refreshToken && event.url.pathname !== "/auth/refresh") {
        redirect(302, "/auth/refresh");
    }

    return resolve(event);
};

const setLocalsHook: Handle = async ({ event, resolve }) => {
    const user: string | undefined = event.cookies.get("user");

    if (user) {
        const data = await verifyData<APIUser>(user, JWT_SECRET);
        event.locals.user = data;
    }
    event.locals.db = db;
    event.locals.tebex = new TebexHeadless(PUBLIC_TEBEX_TOKEN, TEBEX_PRIVATE_KEY);

    return resolve(event);
};

export const handle = sequence(handleRefreshHook, setLocalsHook);
