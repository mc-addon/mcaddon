import { browser } from "$app/environment";
import { writable } from "svelte/store";

export interface SoundStore {
    click: HTMLAudioElement | null;
}

export const store = writable<SoundStore>({
    click: browser ? new Audio("/sounds/click.ogg") : null,
});

export const playSound = (type: keyof SoundStore, loop: boolean = false) => {
    if (!browser) return;

    store.update((state) => {
        const sound = state[type];
        if (sound) {
            sound.currentTime = 0; // Reset the sound to the beginning
            sound.loop = loop; // Set loop if specified
            sound.play().catch((error) => {
                console.error(`Error playing ${type} sound:`, error);
            });
        }
        return state;
    });
};

export const pauseSound = (type: keyof SoundStore) => {
    if (!browser) return;

    store.update((state) => {
        const sound = state[type];
        if (sound) {
            sound.pause();
        }
        return state;
    });
};
