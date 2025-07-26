import { updateBasket } from "$lib/stores/basket";
import { hideAllPopups } from "$lib/stores/popup";
import { toast } from "svelte-sonner";
import type { ApplyType, Basket } from "tebex_headless";

// Utility for managing add to basket cooldown
export class BasketCooldownManager {
    private cooldowns = new Set<number>();
    private cooldownDuration: number;

    constructor(cooldownDuration: number = 2000) {
        this.cooldownDuration = cooldownDuration;
    }

    isOnCooldown(pkgID: number): boolean {
        return this.cooldowns.has(pkgID);
    }

    addToCooldown(pkgID: number): void {
        if (this.cooldowns.has(pkgID)) {
            toast.error("Please wait before adding this item again.");
            return;
        }

        this.cooldowns.add(pkgID);
        setTimeout(() => {
            this.cooldowns.delete(pkgID);
        }, this.cooldownDuration);
    }

    async addToBasketWithCooldown(ident: string, pkgID: number, pkgName: string): Promise<Basket | null> {
        if (this.isOnCooldown(pkgID)) {
            toast.error("Please wait before adding this item again.");
            return null;
        }

        this.addToCooldown(pkgID);
        return await addToBasket(ident, pkgID, pkgName);
    }
}

// Global cooldown manager instance
export const basketCooldownManager = new BasketCooldownManager();

// Create a temporary basket for single-item purchases
export async function createTempBasket(): Promise<Basket> {
    const response = await fetch(`/api/basket/create-temp`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create temporary basket");
    }

    return await response.json();
}

// One-click buy function using temporary basket
export async function buyNow(pkgID: number, pkgName: string): Promise<void> {
    try {
        // Create a temporary basket for this single purchase
        const tempBasket = await createTempBasket();

        // Add the item to the temporary basket
        await addToBasket(tempBasket.ident, pkgID, pkgName, false, false);

        // Setup checkout for the temporary basket
        setupTebexCheckout(tempBasket.ident);

        // Immediately initiate checkout
        await initiateCheckout();
    } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        console.error("Buy now error:", error);
        toast.error(error || "Failed to complete purchase. Please try again.");
    }
}

export async function addToBasket(
    ident: string,
    pkgID: number,
    pkgName: string,
    updateMainBasket: boolean = true,
    showToast: boolean = true,
): Promise<Basket> {
    const promise = fetch(`/api/basket/add?ident=${ident}&pkgID=${pkgID}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then(async (resp) => {
        if (resp.ok) {
            const bask: Basket = await resp.json();
            // Only update the main basket store if this is not a temporary basket
            if (updateMainBasket) {
                updateBasket(bask);
            }
            return bask;
        } else {
            const error = await resp.json();
            throw new Error(error.error || "An unknown error occurred.");
        }
    });

    if (showToast) {
        toast.promise(promise, {
            loading: `Adding ${pkgName} to basket...`,
            success: updateMainBasket ? `${pkgName} has been added to your basket.` : `${pkgName} added to checkout.`,
            error: (err) => (err instanceof Error ? err.message : "An unexpected error occurred."),
        });
    }

    return promise;
}

export async function removeFromBasket(ident: string, pkgID: number, pkgName: string): Promise<Basket> {
    const promise = fetch(`/api/basket/remove?ident=${ident}&pkgID=${pkgID}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then(async (resp) => {
        if (resp.ok) {
            const bask: Basket = await resp.json();
            updateBasket(bask);
            return bask;
        } else {
            const error = await resp.json();
            throw new Error(error.error || "An unknown error occurred.");
        }
    });

    toast.promise(promise, {
        loading: `Removing ${pkgName} from basket...`,
        success: `${pkgName} has been removed from your basket.`,
        error: (err) => (err instanceof Error ? err.message : "An unexpected error occurred."),
    });

    return promise;
}

export async function updateQuantity(ident: string, pkgID: number, quantity: number, pkgName: string): Promise<Basket> {
    const promise = fetch(`/api/basket/update?ident=${ident}&pkgID=${pkgID}&qty=${quantity}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then(async (resp) => {
        if (resp.ok) {
            const bask: Basket = await resp.json();
            updateBasket(bask);
            return bask;
        } else {
            const error = await resp.json();
            throw new Error(error.error || "An unknown error occurred.");
        }
    });

    toast.promise(promise, {
        loading: `Updating ${pkgName} quantity...`,
        success: `${pkgName} quantity updated.`,
        error: (err) => (err instanceof Error ? err.message : "An unexpected error occurred."),
    });

    return promise;
}

export async function applyCoupon(basketIdent: string, couponType: ApplyType, couponCode: string): Promise<Basket> {
    if (!couponCode.trim()) {
        toast.error(`Please enter a ${couponType === "coupons" ? "coupon code" : couponType === "giftcards" ? "gift card number" : "creator code"}.`);
        throw new Error("Invalid coupon code");
    }

    const promise = fetch(`/api/basket/cupon/apply?ident=${basketIdent}&type=${couponType}&code=${encodeURIComponent(couponCode)}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then(async (resp) => {
        if (resp.ok) {
            const updatedBasket: Basket = await resp.json();
            updateBasket(updatedBasket);
            return updatedBasket;
        } else {
            const error = await resp.json();
            throw new Error(
                error.error || `Failed to apply ${couponType === "coupons" ? "coupon" : couponType === "giftcards" ? "gift card" : "creator code"}.`,
            );
        }
    });

    toast.promise(promise, {
        loading: `Applying ${couponType === "coupons" ? "coupon" : couponType === "giftcards" ? "gift card" : "creator code"}...`,
        success: `${couponType === "coupons" ? "Coupon" : couponType === "giftcards" ? "Gift card" : "Creator code"} applied successfully!`,
        error: (err) =>
            err instanceof Error
                ? err.message
                : `An unexpected error occurred while applying the ${couponType === "coupons" ? "coupon" : couponType === "giftcards" ? "gift card" : "creator code"}.`,
    });

    return promise;
}

export async function removeCoupon(basketIdent: string, code: string, type: ApplyType): Promise<Basket> {
    const promise = fetch(`/api/basket/cupon/remove?ident=${basketIdent}&type=${type}&code=${encodeURIComponent(code)}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then(async (resp) => {
        if (resp.ok) {
            const updatedBasket: Basket = await resp.json();
            updateBasket(updatedBasket);
            return updatedBasket;
        } else {
            const error = await resp.json();
            throw new Error(
                error.error || `Failed to remove ${type === "coupons" ? "coupon" : type === "giftcards" ? "gift card" : "creator code"}.`,
            );
        }
    });

    toast.promise(promise, {
        loading: `Removing ${type === "coupons" ? "coupon" : type === "giftcards" ? "gift card" : "creator code"}...`,
        success: `${type === "coupons" ? "Coupon" : type === "giftcards" ? "Gift card" : "Creator code"} removed successfully!`,
        error: (err) =>
            err instanceof Error
                ? err.message
                : `An unexpected error occurred while removing the ${type === "coupons" ? "coupon" : type === "giftcards" ? "gift card" : "creator code"}.`,
    });

    return promise;
}

export async function getBasket(basketIdent: string): Promise<Basket> {
    const promise = fetch(`/api/basket/get?ident=${basketIdent}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }).then(async (resp) => {
        if (resp.ok) {
            const basket: Basket = await resp.json();
            updateBasket(basket);
            return basket;
        } else {
            const error = await resp.json();
            throw new Error(error.error || "An unknown error occurred while fetching the basket.");
        }
    });

    toast.promise(promise, {
        loading: "Fetching your basket...",
        success: "Basket fetched successfully!",
        error: (err) => (err instanceof Error ? err.message : "An unexpected error occurred while fetching the basket."),
    });

    return promise;
}

export async function initiateCheckout(): Promise<void> {
    try {
        // Hide all popups
        hideAllPopups();

        // Import Tebex dynamically to avoid SSR issues
        const { default: Tebex } = await import("@tebexio/tebex.js");

        // Launch Tebex checkout
        Tebex.checkout.launch();
    } catch (error) {
        console.error("Checkout error:", error);
        toast.error("Failed to initiate checkout. Please try again.");
    }
}

export function setupTebexCheckout(basketIdent: string) {
    // Import Tebex dynamically to avoid SSR issues
    import("@tebexio/tebex.js")
        .then(({ default: Tebex }) => {
            Tebex.checkout.init({
                ident: basketIdent,
                closeOnClickOutside: true,
                closeOnEsc: true,
                theme: "dark",
                colors: [
                    { name: "primary", color: "#FACC15" }, // yellow-400
                    { name: "secondary", color: "#0A0A0A" }, // neutral-950
                ],
            });
            Tebex.checkout.on("payment:complete", () => {
                toast.success("Payment completed successfully!");
            });
            Tebex.checkout.on("payment:error", (error) => {
                console.error("Payment error:", error);
                toast.error("An error occurred during payment. Please try again.");
            });
        })
        .catch((error) => {
            console.error("Failed to setup Tebex checkout:", error);
            toast.error("Failed to setup checkout. Please try again.");
        });
}
