import { fetchUser } from "$lib/db/funcs";
import * as schema from "$lib/db/schema";
import { redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import type { Basket } from "tebex_headless";
import type { LayoutServerLoad } from "./$types";

// Helper function to update basketIdent for a user
async function saveBasketIdent(db: any, userId: string, basketIdent: string) {
    await db.update(schema.userTable).set({ basketIdent }).where(eq(schema.userTable.userID, userId));
}

export const load: LayoutServerLoad = async ({ locals, url }) => {
    const user = locals.user;
    const mc = locals.mc;
    if (!mc) {
        redirect(303, "/");
    }

    let basket: Basket;
    if (user) {
        const userData = await fetchUser(locals.db, user.id);
        if (userData) {
            if (userData.basketIdent) {
                try {
                    let searchBasket = await locals.tebex.getBasket(userData.basketIdent);
                    if (searchBasket) {
                        return { basket: searchBasket };
                    }
                } catch {
                    basket = await locals.tebex.createMinecraftBasket(mc.username, url.origin, url.origin);
                    await saveBasketIdent(locals.db, user.id, basket.ident);
                    return { basket };
                }
            }
        } else {
            basket = await locals.tebex.createMinecraftBasket(mc.username, url.origin, url.origin);
            await saveBasketIdent(locals.db, user.id, basket.ident);
            return { basket };
        }
    }

    // If no existing basket is found or not logged in via discord, create a new one
    basket = await locals.tebex.createMinecraftBasket(mc.username, url.origin, url.origin);
    if (user) {
        await saveBasketIdent(locals.db, user.id, basket.ident);
    }
    return { basket, user };
};
