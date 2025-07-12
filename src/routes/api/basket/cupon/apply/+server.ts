import { json } from "@sveltejs/kit";
import type { ApplyType, Basket } from "tebex_headless";

export const GET = async ({ locals, url }) => {
    const user = locals.user;
    if (!user) {
        return json({ error: "Unauthorized" }, { status: 401 });
    }

    const ident = url.searchParams.get("ident");
    if (!ident) {
        return json({ error: "ID parameter is required" }, { status: 400 });
    }
    const applyType = url.searchParams.get("type");
    if (!applyType || !["coupons", "giftcards", "creator-codes"].includes(applyType)) {
        return json({ error: "Invalid type parameter" }, { status: 400 });
    }

    try {
        // Get the code from URL params
        const code = url.searchParams.get("code");
        if (!code) {
            return json({ error: "Code parameter is required" }, { status: 400 });
        }

        // Create the appropriate body based on the type
        let body: any;
        if (applyType === "coupons") {
            body = { coupon_code: code };
        } else if (applyType === "giftcards") {
            body = { card_number: code };
        } else if (applyType === "creator-codes") {
            body = { creator_code: code };
        }

        await locals.tebex.apply(ident, applyType as ApplyType, body);
        const basket: Basket = await locals.tebex.getBasket(ident);
        return json(basket, { status: 200 });
    } catch (error: any) {
        const data = error.response;
        return json({ error: data.data.detail }, { status: data.data.status || 500 });
    }
};
