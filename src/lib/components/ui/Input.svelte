<script lang="ts">
    import { cn } from "$lib/utils/cn";
    import { fade } from "svelte/transition";

    interface Props {
        value: any;
        class?: string;
        placeholder?: string;
        iconName?: string;
        max?: number;
        disabled?: boolean;
        onEnter?: () => void;
    }
    let {
        value = $bindable(""),
        class: className,
        placeholder,
        iconName = $bindable(""),
        max,
        disabled = false,
        onEnter = () => {},
    }: Props = $props();

    let inputFocus: boolean = $state(false);
    let ref: HTMLInputElement | null = $state(null);
</script>

<div
    class={cn("flex h-10 items-center justify-center gap-5 border-2 border-neutral-700 bg-neutral-800 p-2 transition-colors duration-200", className)}
    class:!border-neutral-500={inputFocus}
>
    {#if iconName}
        {#if !value}
            <span in:fade={{ duration: 100 }} class="h-5 w-auto min-w-5">
                <img src="/icons/{iconName}.webp" alt="{iconName} Icon" class="size-full" />
            </span>
        {:else}
            <button
                in:fade={{ duration: 100 }}
                class="h-5 w-auto min-w-5 cursor-pointer transition-opacity duration-200 hover:opacity-80"
                onclick={() => {
                    value = "";
                    ref?.focus();
                }}
            >
                <img src="/icons/error.webp" alt="Clear input" class="size-full" />
            </button>
        {/if}
    {/if}
    <input
        type="text"
        {placeholder}
        class="w-full border-none ring-0 transition-colors outline-none not-disabled:text-white placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:text-neutral-400"
        onfocusin={() => {
            inputFocus = true;
        }}
        onfocusout={() => {
            inputFocus = false;
        }}
        bind:this={ref}
        bind:value
        maxlength={max}
        onkeydown={(e) => {
            if (e.key === "Enter") {
                onEnter();
            }
        }}
        {disabled}
    />
    {#if max}
        <span class="text-neutral-200">{value.length}/{max}</span>
    {/if}
</div>
