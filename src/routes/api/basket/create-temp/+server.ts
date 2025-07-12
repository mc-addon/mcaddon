import { fetchUser } from "$lib/db/funcs";
import { json } from "@sveltejs/kit";
import type { Basket } from "tebex_headless";

export const POST = async ({ locals, url }) => {
    const user = locals.user;
    if (!user) {
        return json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Fetch user data from database to get minecraft name
        const userData = await fetchUser(locals.db, user.id);

        if (!userData?.minecraftName) {
            return json({ error: "Minecraft name not set. Please set your Minecraft name in your profile." }, { status: 400 });
        }

        // Create a temporary basket for single-item purchases
        const basket: Basket = await locals.tebex.createMinecraftBasket(userData.minecraftName, url.origin, url.origin);
        return json(basket, { status: 200 });
    } catch (error: any) {
        const data = error.response;
        return json({ error: data?.data?.detail || "Failed to create temporary basket" }, { status: data?.data?.status || 500 });
    }
};
