import { get, writable } from "svelte/store";
import type { Basket } from "tebex_headless";

export const basketStore = writable<Basket | null>(null);

export function updateBasket(newBasket: Basket) {
    basketStore.set(newBasket);
}

export function getCurrentBasket(): Basket | null {
    return get(basketStore);
}
