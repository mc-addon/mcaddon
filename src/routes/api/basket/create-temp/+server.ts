import { json } from "@sveltejs/kit";
import type { Basket } from "tebex_headless";

export const POST = async ({ locals, url }) => {
    const user = locals.user;
    const mc = locals.mc;
    if (!user) {
        return json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        if (!mc?.username) {
            return json({ error: "Minecraft name not set. Please set your Minecraft name in your profile." }, { status: 400 });
        }

        // Create a temporary basket for single-item purchases
        const basket: Basket = await locals.tebex.createMinecraftBasket(mc.username, url.origin, url.origin);
        return json(basket, { status: 200 });
    } catch (error: any) {
        const data = error.response;
        return json({ error: data?.data?.detail || "Failed to create temporary basket" }, { status: data?.data?.status || 500 });
    }
};
