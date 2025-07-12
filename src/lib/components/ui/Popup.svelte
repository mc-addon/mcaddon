<script lang="ts">
    import { playSound } from "$lib/stores/sounds";
    import { createMobileMediaQuery } from "$lib/utils/mobile";
    import { Dialog } from "bits-ui";
    import type { Snippet } from "svelte";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import Drawer from "./Drawer.svelte";

    interface Props {
        title: string;
        open?: boolean;
        drawerDismissible?: boolean;
        trigger?: Snippet;
        description?: Snippet;
        children: Snippet;
        actions?: Snippet;
    }
    let { title, open = $bindable(false), drawerDismissible = true, trigger, description, children, actions }: Props = $props();

    let isMobile = $state(false);

    onMount(() => {
        const cleanup = createMobileMediaQuery((mobile) => {
            isMobile = mobile;
        });
        return cleanup;
    });
</script>

{#if isMobile}
    <!-- Mobile: Use Drawer -->
    {#if trigger}
        <button
            class="flex w-full items-center justify-center"
            onclick={() => {
                open = true;
            }}
        >
            {@render trigger()}
        </button>
    {/if}

    <Drawer
        bind:open
        {title}
        maxHeight="max-h-[80vh]"
        showHandle={true}
        dismissible={drawerDismissible}
        class="bg-neutral-900"
        headerClass="text-neutral-200"
    >
        <div class="flex flex-col gap-5">
            {#if description}
                <div class="text-neutral-200">
                    {@render description()}
                </div>
            {/if}

            <div class="flex items-center justify-center">
                <div class="size-full">
                    {@render children()}
                </div>
            </div>

            {#if actions}
                <div class="flex flex-col items-center justify-between gap-2">
                    {@render actions()}
                </div>
            {/if}
        </div>
    </Drawer>
{:else}
    <!-- Desktop: Use Dialog -->
    <Dialog.Root bind:open>
        {#if trigger}
            <Dialog.Trigger class="flex w-full items-center justify-center">
                {@render trigger()}
            </Dialog.Trigger>
        {/if}
        <Dialog.Portal>
            <Dialog.Overlay class="fixed inset-0 z-50 flex size-full items-center justify-center bg-neutral-950/50" forceMount>
                {#snippet child({ props, open })}
                    {#if open}
                        <div {...props} transition:fade={{ duration: 100 }}>
                            <Dialog.Content
                                class="flex max-h-[90%] max-w-[90%] flex-col overflow-y-auto border-2 border-neutral-700 bg-neutral-900 p-5 text-sm"
                            >
                                <div class="flex flex-col gap-2 text-left">
                                    <div class="flex items-center justify-between gap-2">
                                        <Dialog.Title class="font-minecrafter text-xl">{title}</Dialog.Title>
                                        <Dialog.Close
                                            onmousedown={() => {
                                                playSound("click");
                                            }}
                                            class="cursor-pointer transition-all duration-200 outline-none hover:brightness-80"
                                        >
                                            <img src="/icons/error.webp" alt="Close" class="size-5" />
                                        </Dialog.Close>
                                    </div>
                                    {#if description}
                                        <Dialog.Description class="mt-2 text-neutral-200">
                                            {@render description()}
                                        </Dialog.Description>
                                    {/if}
                                    <div class="flex items-center justify-center">
                                        <div class="size-full">
                                            {@render children()}
                                        </div>
                                    </div>
                                    {#if actions}
                                        <div class="flex flex-col items-center justify-between gap-2 md:flex-row md:gap-5">
                                            {@render actions()}
                                        </div>
                                    {/if}
                                </div>
                            </Dialog.Content>
                        </div>
                    {/if}
                {/snippet}
            </Dialog.Overlay>
        </Dialog.Portal>
    </Dialog.Root>
{/if}
