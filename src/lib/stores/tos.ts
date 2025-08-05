import { writable } from "svelte/store";

export interface TosStore {
    hasAgreed: boolean;
    isProcessing: boolean;
}

// Initialize store - always starts as false, requiring agreement for each purchase
export const tosStore = writable<TosStore>({ hasAgreed: false, isProcessing: false });

// Function to record TOS agreement (valid only for current purchase)
export function agreeTos() {
    tosStore.set({ hasAgreed: true, isProcessing: false });
}

// Function to set processing state
export function setTosProcessing(processing: boolean) {
    tosStore.update((state) => ({ ...state, isProcessing: processing }));
}

// Function to check if TOS agreement is needed
export function requiresTosAgreement(): boolean {
    let requires = true;

    const unsubscribe = tosStore.subscribe((state) => {
        requires = !state.hasAgreed;
    });

    // Immediately unsubscribe since we only need the current value
    unsubscribe();

    return requires;
}

// Function to reset TOS agreement (resets to false, requiring new agreement)
export function resetTosAgreement() {
    tosStore.set({ hasAgreed: false, isProcessing: false });
}
