<script lang="ts">
    import { cn } from "$lib/utils/cn";
    import type { Snippet } from "svelte";
    import { Drawer } from "vaul-svelte";

    interface Props {
        open: boolean;
        onClose?: () => void;
        title?: string;
        showHandle?: boolean;
        dismissible?: boolean;
        maxHeight?: string;
        fullScreen?: boolean;
        class?: string;
        headerClass?: string;
        contentClass?: string;
        zIndex?: number;
        children: Snippet;
    }

    let {
        open = $bindable(false),
        onClose = () => {},
        title = "",
        showHandle = true,
        dismissible = true,
        maxHeight = "max-h-96",
        fullScreen = false,
        class: className = "",
        headerClass = "",
        contentClass = "",
        zIndex = 900,
        children,
    }: Props = $props();
</script>

<Drawer.Root {onClose} bind:open {dismissible}>
    <Drawer.Portal>
        <Drawer.Overlay class="fixed inset-0 bg-black/50" style="z-index: {zIndex - 1};" />
        <Drawer.Content
            class={cn(
                "fixed inset-x-0 flex flex-col border-t-2 border-neutral-700",
                fullScreen ? "-top-4 right-0 left-0 h-[calc(100vh+1rem)]" : "bottom-0 mt-24 h-fit",
                "bg-neutral-900",
                className,
            )}
            style="z-index: {zIndex};"
        >
            <!-- Content wrapper with relative positioning -->
            <div class="relative z-10 flex h-full flex-col">
                <!-- Handle -->
                {#if showHandle}
                    <div class={cn("mx-auto h-1 w-12 bg-neutral-500", fullScreen ? "mt-6" : "mt-2")}></div>
                {/if}

                <!-- Header -->
                {#if title}
                    <div class={cn("relative flex items-center justify-center py-4", headerClass)}>
                        <h2 class="text-lg font-medium text-neutral-200">{title}</h2>
                    </div>
                {/if}

                <!-- Content -->
                <div class={cn("overflow-y-auto", fullScreen ? "flex-1 px-4 pb-4" : `px-4 pb-8 ${maxHeight}`, contentClass)}>
                    {@render children()}
                </div>
            </div>
        </Drawer.Content>
    </Drawer.Portal>
</Drawer.Root>
