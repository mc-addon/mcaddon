<script lang="ts">
    import { onNavigate } from "$app/navigation";
    import LoadingScreen from "$lib/components/LoadingScreen.svelte";
    import { isAssetsLoaded } from "$lib/stores/loadingScreen";
    import { onMount } from "svelte";
    import "../app.css";

    let { children } = $props();
    let showLoadingScreen = $state(true);

    onNavigate((navigation) => {
        if (!document.startViewTransition) return;

        return new Promise((resolve) => {
            document.startViewTransition(async () => {
                resolve();
                await navigation.complete;
            });
        });
    });

    onMount(() => {
        // Check if assets were already loaded
        if (isAssetsLoaded()) {
            showLoadingScreen = false;
        }
        // $loadingScreenStore.isLoading = true;
    });
</script>

{#if showLoadingScreen}
    <LoadingScreen
        onComplete={() => {
            showLoadingScreen = false;
        }}
    />
{/if}

<div class="h-screen w-screen transition-opacity duration-300 ease-in-out" class:opacity-0={showLoadingScreen} class:opacity-100={!showLoadingScreen}>
    {@render children()}
</div>
