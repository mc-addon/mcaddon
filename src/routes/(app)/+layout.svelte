<script lang="ts">
    import Panorama from "$lib/components/panorama";
    import { Toaster } from "svelte-sonner";

    let { children } = $props();
</script>

<Toaster
    richColors
    position="top-right"
    theme="dark"
    style="z-index: 1000;"
    toastOptions={{
        unstyled: false,
        classes: {
            toast: "font-minecraftia !border-2 !rounded-none",
            title: "text-sm",
            description: "text-[0.65rem]",
            icon: "!size-6",
            loader: "size-full",
        },
    }}
>
    {#snippet successIcon()}
        <img src="/icons/success.webp" alt="Success" />
    {/snippet}
    {#snippet errorIcon()}
        <img src="/icons/error.webp" alt="Error" />
    {/snippet}
    {#snippet warningIcon()}
        <img src="/icons/warning.webp" alt="Warning" />
    {/snippet}
    {#snippet infoIcon()}
        <img src="/icons/info.webp" alt="Info" />
    {/snippet}
    {#snippet loadingIcon()}
        <img src="/icons/loading.webp" alt="Loading" />
    {/snippet}
</Toaster>

<Panorama />

<div class="size-full overflow-hidden">
    {@render children()}
</div>
