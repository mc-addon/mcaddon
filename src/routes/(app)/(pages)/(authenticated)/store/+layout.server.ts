import { fetchUser } from "$lib/db/funcs";
import * as schema from "$lib/db/schema";
import { redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import type { Basket } from "tebex_headless";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, url }) => {
    const user = locals.user;
    if (!user) {
        redirect(303, "/");
    }
    const userData = await fetchUser(locals.db, user.id);
    if (!userData?.minecraftName) {
        redirect(303, "/");
    }

    let basket: Basket;
    if (userData.basketIdent) {
        let searchBasket = await locals.tebex.getBasket(userData.basketIdent);
        if (searchBasket) {
            basket = searchBasket;
        }
    }

    // If no existing basket is found, create a new one
    basket = await locals.tebex.createMinecraftBasket(userData.minecraftName, url.origin, url.origin);
    await locals.db
        .update(schema.userTable)
        .set({
            basketIdent: basket.ident,
        })
        .where(eq(schema.userTable.userID, user.id));
    return { basket };
};
