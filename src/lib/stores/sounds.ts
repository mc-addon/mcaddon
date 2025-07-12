import { browser } from "$app/environment";
import { writable } from "svelte/store";

export interface PopupsStore {
    click: {
        audio: HTMLAudioElement | null;
        paused: boolean;
    };
}

export const store = writable<PopupsStore>({
    click: {
        audio: browser ? new Audio("/sounds/click.ogg") : null,
        paused: false,
    },
});

export const playSound = (type: keyof PopupsStore, loop: boolean = false) => {
    if (!browser) return;

    store.update((state) => {
        const sound = state[type].audio;
        if (sound && !state[type].paused) {
            sound.currentTime = 0; // Reset the sound to the beginning
            sound.loop = loop; // Set loop if specified
            sound.play().catch((error) => {
                console.error(`Error playing ${type} sound:`, error);
            });
        }
        return state;
    });
};

export const pauseSound = (type: keyof PopupsStore) => {
    if (!browser) return;

    store.update((state) => {
        const sound = state[type].audio;
        if (sound) {
            sound.pause();
            state[type].paused = true;
        }
        return state;
    });
};
