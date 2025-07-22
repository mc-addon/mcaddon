import { DISCORD_BOT_TOKEN } from "$env/static/private";
import { PUBLIC_DISCORD_URL } from "$env/static/public";
import { fetchSettings } from "$lib/db/funcs";
import { isAdmin } from "$lib/discord/user";
import { redirect } from "@sveltejs/kit";
import type { APIUser } from "discord-api-types/v10";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    const user = locals.user;
    let isAdminUser = false;
    let settings = null;
    let adminsPromises: Promise<APIUser>[] | null = null;

    if (user) {
        isAdminUser = await isAdmin(locals.db, user.id);
        if (isAdminUser) {
            settings = await fetchSettings(locals.db);

            // Create promises for admin users but don't await them
            if (settings?.adminIDs) {
                adminsPromises = settings.adminIDs.map(async (adminID: string) => {
                    const resp = await fetch(`${PUBLIC_DISCORD_URL}/users/${adminID}`, {
                        headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
                    });
                    return resp.ok ? (resp.json() as Promise<APIUser>) : Promise.reject(`Failed to fetch user ${adminID}`);
                });
            }
        }
    } else {
        redirect(303, "/");
    }

    return {
        isAdmin: isAdminUser,
        settings,
        adminsPromises,
    };
};
