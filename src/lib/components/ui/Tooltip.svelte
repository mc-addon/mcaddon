<script lang="ts">
    import { cn } from "$lib/utils/cn";
    import { Tooltip } from "bits-ui";
    import type { Snippet } from "svelte";
    import { fly } from "svelte/transition";

    interface Props {
        side?: "top" | "right" | "bottom" | "left" | undefined;
        class?: string;
        triggerClass?: string;
        disabled?: boolean;
        trigger: Snippet;
        children: Snippet;
    }
    let { side = undefined, class: className, triggerClass, disabled = false, trigger, children }: Props = $props();
</script>

<Tooltip.Provider>
    <Tooltip.Root delayDuration={100} {disabled}>
        <Tooltip.Trigger class={cn(triggerClass)}>
            {@render trigger()}
        </Tooltip.Trigger>
        <Tooltip.Content {side} sideOffset={8} class={cn("z-50 border-2 border-neutral-700 bg-neutral-900 p-1 text-white", className)} forceMount>
            {#snippet child({ wrapperProps, props, open })}
                {#if open}
                    <div {...wrapperProps}>
                        <div {...props} transition:fly={{ duration: 100 }}>
                            {@render children()}
                        </div>
                    </div>
                {/if}
            {/snippet}
        </Tooltip.Content>
    </Tooltip.Root>
</Tooltip.Provider>
