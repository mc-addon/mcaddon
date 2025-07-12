import { writable } from "svelte/store";

// To add a new popup, simply add it to this interface
// Example: showNewPopup: boolean;
export interface PopupsStore {
    basketPopup: boolean;
    // Add more popups here as needed
    // showNewPopup: boolean;
}

// Store with initial state - all popups closed by default
export const store = writable<PopupsStore>({
    basketPopup: false,
    // Add more popups with default false values
    // showNewPopup: false,
});

// Generic functions for any popup
export function showPopup(popupName: keyof PopupsStore) {
    store.update((s) => ({ ...s, [popupName]: true }));
}

export function hidePopup(popupName: keyof PopupsStore) {
    store.update((s) => ({ ...s, [popupName]: false }));
}

export function togglePopup(popupName: keyof PopupsStore) {
    store.update((s) => ({ ...s, [popupName]: !s[popupName] }));
}

// Close all popups
export function hideAllPopups() {
    store.update((s) => {
        const newState = { ...s };
        Object.keys(newState).forEach((key) => {
            newState[key as keyof PopupsStore] = false;
        });
        return newState;
    });
}

// Reset store to initial state
export function resetPopups() {
    store.set({
        basketPopup: false,
        // Add more popups with default false values when you add them
        // showNewPopup: false,
    });
}
