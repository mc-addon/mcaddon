import { fetchSettings } from "$lib/db/funcs";
import { checkIfUserInGuild } from "$lib/discord/user";
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, url, fetch }) => {
    const user = locals.user;
    const mc = locals.mc;
    if (!mc || !mc?.username) {
        redirect(303, "/");
    }

    const inGuild = user ? await checkIfUserInGuild(fetch) : false;
    const basket = await locals.tebex.createMinecraftBasket(mc.username, url.origin, url.origin);
    const specialPkgIDs = await fetchSettings(locals.db, "specialPkgIDs");
    return { basket, user, inGuild, specialPkgIDs };
};
