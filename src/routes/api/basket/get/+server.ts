import { json } from "@sveltejs/kit";
import type { Basket } from "tebex_headless";

export const GET = async ({ locals, url }) => {
    const user = locals.user;
    if (!user) {
        return json({ error: "Unauthorized" }, { status: 401 });
    }

    const ident = url.searchParams.get("ident");
    if (!ident) {
        return json({ error: "ID parameter is required" }, { status: 400 });
    }

    try {
        const basket: Basket = await locals.tebex.getBasket(ident);
        return json(basket, { status: 200 });
    } catch (error: any) {
        const data = error.response;
        return json({ error: data.data.detail }, { status: data.data.status || 500 });
    }
};
