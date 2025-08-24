import { browser } from "$app/environment";
import { writable } from "svelte/store";

export interface LoadingScreenStore {
    isLoaded: boolean;
    progress: number;
    loadingText: string;
    totalAssets: number;
    loadedAssets: number;
    isLoading: boolean;
}

export const loadingScreenStore = writable<LoadingScreenStore>({
    isLoaded: false,
    progress: 0,
    loadingText: "Loading assets...",
    totalAssets: 0,
    loadedAssets: 0,
    isLoading: true,
});

// Function to load asset paths from assets.json
async function loadAssetPaths(): Promise<string[]> {
    try {
        const response = await fetch("/assets.json");
        const data = await response.json();
        return data.assets || [];
    } catch (error) {
        console.error("Failed to load assets.json:", error);
        // Fallback to empty array if assets.json fails to load
        return [];
    }
}

const loadingMessages = [
    "Loading textures...",
    "Generating terrain...",
    "Loading assets...",
    "Building chunks...",
    "Preparing world...",
    "Loading resources...",
    "Initializing game...",
    "Loading sounds...",
    "Setting up environment...",
];

function preloadAsset(url: string, maxRetries: number = 3): Promise<void> {
    return new Promise((resolve) => {
        let retries = 0;

        const attemptLoad = () => {
            if (url.endsWith(".ogg")) {
                // Handle audio files
                const audio = new Audio();
                const timeout = setTimeout(() => {
                    audio.src = "";
                    if (retries < maxRetries) {
                        retries++;
                        setTimeout(attemptLoad, Math.pow(2, retries) * 1000); // Exponential backoff
                    } else {
                        resolve(); // Give up after max retries
                    }
                }, 10000); // 10 second timeout

                audio.oncanplaythrough = () => {
                    clearTimeout(timeout);
                    resolve();
                };
                audio.onerror = () => {
                    clearTimeout(timeout);
                    if (retries < maxRetries) {
                        retries++;
                        setTimeout(attemptLoad, Math.pow(2, retries) * 1000);
                    } else {
                        resolve(); // Don't fail on audio errors
                    }
                };
                audio.src = url;
            } else {
                // Handle image files
                const img = new Image();
                const timeout = setTimeout(() => {
                    img.src = "";
                    if (retries < maxRetries) {
                        retries++;
                        setTimeout(attemptLoad, Math.pow(2, retries) * 1000);
                    } else {
                        resolve(); // Give up after max retries
                    }
                }, 10000); // 10 second timeout

                img.onload = () => {
                    clearTimeout(timeout);
                    resolve();
                };
                img.onerror = () => {
                    clearTimeout(timeout);
                    if (retries < maxRetries) {
                        retries++;
                        setTimeout(attemptLoad, Math.pow(2, retries) * 1000);
                    } else {
                        resolve(); // Don't fail on missing images
                    }
                };
                img.src = url;
            }
        };

        attemptLoad();
    });
}

export const initializeLoadingScreen = async (): Promise<void> => {
    if (!browser) return;

    // Load asset paths from assets.json
    const assetPaths = await loadAssetPaths();

    // If no assets loaded, mark as complete
    if (assetPaths.length === 0) {
        loadingScreenStore.update((state) => ({
            ...state,
            isLoaded: true,
            isLoading: false,
            progress: 100,
            loadedAssets: 0,
            totalAssets: 0,
            loadingText: "Done!",
        }));
        return;
    }

    // Start loading process
    loadingScreenStore.update((state) => ({
        ...state,
        totalAssets: assetPaths.length,
        loadedAssets: 0,
        progress: 0,
        isLoading: true,
        isLoaded: false,
    }));

    let loadedCount = 0;

    // Function to get loading message based on progress percentage
    const getLoadingMessage = (progress: number): string => {
        const messageIndex = Math.floor((progress / 100) * loadingMessages.length);
        return loadingMessages[Math.min(messageIndex, loadingMessages.length - 1)];
    };

    // Load assets with limited concurrency to avoid overwhelming slow connections
    const loadAssetsInBatches = async (assetPaths: string[], batchSize: number = 3) => {
        for (let i = 0; i < assetPaths.length; i += batchSize) {
            const batch = assetPaths.slice(i, i + batchSize);

            const batchPromises = batch.map(async (path: string) => {
                await preloadAsset(path);
                loadedCount++;
                const progress = Math.round((loadedCount / assetPaths.length) * 100);

                loadingScreenStore.update((state) => ({
                    ...state,
                    loadedAssets: loadedCount,
                    progress: progress,
                    loadingText: getLoadingMessage(progress),
                }));
            });

            await Promise.all(batchPromises);
        }
    };

    await loadAssetsInBatches(assetPaths);

    // Final update - keep isLoading true until we're completely done
    loadingScreenStore.update((state) => ({
        ...state,
        loadingText: "Done!",
        progress: 100,
        isLoaded: true,
    }));

    // Brief pause before completing, then set isLoading to false
    await new Promise((resolve) => setTimeout(resolve, 200));

    loadingScreenStore.update((state) => ({
        ...state,
        isLoading: false,
    }));
};

export const resetLoadingScreen = () => {
    if (!browser) return;

    loadingScreenStore.update((state) => ({
        ...state,
        isLoaded: false,
        progress: 0,
        loadingText: "Loading assets...",
        totalAssets: 0,
        loadedAssets: 0,
        isLoading: true,
    }));
};
