import { fetchUser } from "$lib/db/funcs";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
    const user = locals.user;
    const mc = locals.mc;
    let userData = null;
    if (user) {
        userData = await fetchUser(locals.db, user.id);
    }
    return { user, mc, userData };
};
