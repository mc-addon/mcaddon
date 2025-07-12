<script lang="ts">
    import { playSound } from "$lib/stores/sounds";
    import { cn } from "$lib/utils/cn";

    interface Props {
        status: boolean;
        disabled?: boolean;
        class?: string;
        onclick?: (e: MouseEvent) => void;
    }
    let { status = $bindable(false), disabled = false, class: className, onclick }: Props = $props();
</script>

<button
    onmousedown={() => playSound("click")}
    onclick={(e) => {
        onclick?.(e);
        status = !status;
    }}
    class={cn("h-8 cursor-pointer focus:outline-none disabled:cursor-not-allowed disabled:opacity-50", className)}
    {disabled}
>
    {#if status}
        <img src="/icons/switch_on.webp" alt="Toggle On" class="size-full" />
    {:else}
        <img src="/icons/switch_off.webp" alt="Toggle Off" class="size-full" />
    {/if}
</button>
