import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, JWT_SECRET } from "$env/static/private";
import { getNewAccessToken, getUserData } from "$lib/discord/user";
import { signData } from "$lib/utils/jwt";
import { error, redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ fetch, cookies }) => {
    const refreshToken: string | undefined = cookies.get("refresh_token");

    if (!refreshToken) {
        error(401, "No refresh token found");
    }

    const newToken = await getNewAccessToken(refreshToken, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET);

    if (newToken) {
        cookies.set("access_token", newToken.access_token, {
            path: "/",
            maxAge: newToken.expires_in,
            sameSite: "none",
            httpOnly: true,
            secure: true,
        });
        cookies.set("refresh_token", newToken.refresh_token, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365, // 1 year
            sameSite: "none",
            httpOnly: true,
            secure: true,
        });

        const userData = await getUserData(newToken.access_token);
        const token = await signData(userData, JWT_SECRET, `${newToken.expires_in}s`);

        cookies.set("user", token, {
            path: "/",
            maxAge: newToken.expires_in,
            sameSite: "none",
            httpOnly: true,
            secure: true,
        });
    } else {
        await fetch("/auth/logout");
    }

    return redirect(302, "/");
};
