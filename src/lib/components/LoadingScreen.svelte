<script lang="ts">
    import { initializeLoadingScreen, loadingScreenStore } from "$lib/stores/loadingScreen";
    import { onMount } from "svelte";

    let { onComplete = () => {} } = $props();

    // Subscribe to the loading screen store
    const store = loadingScreenStore;

    onMount(() => {
        let unsubscribe: (() => void) | undefined;

        initializeLoadingScreen().then(() => {
            // Watch for completion - use isLoading to determine when to hide
            unsubscribe = store.subscribe((state) => {
                if (!state.isLoading && state.isLoaded) {
                    onComplete();
                }
            });
        });

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    });
</script>

{#if $store.isLoading}
    <div class="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-neutral-950">
        <!-- Minecraft Logo -->
        <div class="mb-8">
            <h1 class="font-minecrafter text-4xl text-white md:text-6xl">MC Addon</h1>
        </div>

        <!-- Loading Bar Container -->
        <div class="mb-6 w-80 md:w-96">
            <!-- Loading Bar Background -->
            <div class="relative h-4 w-full overflow-hidden border-2 border-neutral-700 bg-neutral-800">
                <!-- Loading Bar Fill -->
                <div
                    class="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-300 ease-out"
                    style="width: {$store.progress}%"
                ></div>

                <!-- Loading Bar Highlight -->
                <div
                    class="absolute top-0 left-0 h-full bg-gradient-to-b from-white/30 to-transparent transition-all duration-300 ease-out"
                    style="width: {$store.progress}%"
                ></div>
            </div>

            <!-- Progress Text -->
            <div class="mt-2 flex justify-between text-sm text-neutral-200">
                <span>{$store.progress}%</span>
                <span>{$store.loadedAssets}/{$store.totalAssets}</span>
            </div>
        </div>

        <!-- Loading Text -->
        <div class="text-shadow-mc mb-4 text-center text-white">
            {$store.loadingText}
        </div>

        <!-- Loading Animation -->
        <div class="flex gap-2">
            {#each Array(3) as _, i}
                <div class="h-2 w-2 animate-pulse bg-white" style="animation-delay: {i * 0.2}s"></div>
            {/each}
        </div>

        <!-- Mojang Style Credit -->
        <div class="absolute bottom-8 text-xs text-neutral-400">MC Addon Official Website</div>
    </div>
{/if}

<style>
    @keyframes pulse {
        0%,
        100% {
            opacity: 0.4;
        }
        50% {
            opacity: 1;
        }
    }

    .animate-pulse {
        animation: pulse 1.5s infinite;
    }
</style>
