<script lang="ts">
    import { page } from "$app/state";
    import Button from "$lib/components/ui/Button.svelte";
    import Seo from "$lib/components/ui/Seo.svelte";
</script>

<Seo title="Error {page.status}" description="An error occurred while processing your request." />

<div class="flex h-screen w-screen items-center justify-center bg-green-800">
    <div class="flex flex-col items-center justify-center gap-5 text-center">
        <h1 class="font-minecrafter text-4xl">Awww.... Creeperrrrr!</h1>
        <div class="flex flex-col items-center justify-center gap-2 text-xl">
            <p>
                Error {page.status}
            </p>
            <p class="text-neutral-400">
                {page.error?.message || "An unexpected error occurred."}
            </p>
        </div>
        {#if page.status !== 500}
            <Button href="/" flow={false}>Back To Homepage</Button>
        {/if}
    </div>
</div>
