import { DISCORD_BOT_TOKEN } from "$env/static/private";
import { PUBLIC_DISCORD_URL } from "$env/static/public";
import { fetchUserData, isAdmin } from "$lib/discord/user";
import { json } from "@sveltejs/kit";

export const POST = async ({ locals, request }) => {
    const user = locals.user;
    if (!user) {
        return json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdminUser = await isAdmin(locals.db, user.id);
    if (!isAdminUser) {
        return json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { userID } = body;

    if (!userID) {
        return json({ error: "User ID is required" }, { status: 400 });
    }

    try {
        const userData = await fetchUserData(PUBLIC_DISCORD_URL, DISCORD_BOT_TOKEN, userID);

        if ("error" in userData && userData.error) {
            return json({ error: "User not found" }, { status: 404 });
        }

        // Only return verification success, not full user data
        return json({ valid: true, userID });
    } catch (error) {
        console.error("Error fetching user:", error);
        return json({ error: "Failed to fetch user" }, { status: 500 });
    }
};
