<script lang="ts">
    import { goto } from "$app/navigation";
    import { getUserAvatar } from "$lib/discord/user";
    import { playSound } from "$lib/stores/sounds";
    import { cn } from "$lib/utils/cn";
    import type { APIUser } from "discord-api-types/v10";
    import PixelatedImage from "./ui/PixelatedImage.svelte";

    interface Props {
        user: APIUser | null;
        title: string;
        class?: string;
        backURL?: string;
    }
    let { user, title, class: className = "", backURL = "" }: Props = $props();
</script>

<div
    class={cn(
        "bg-neutral-500 bg-[length:20em] bg-left shadow-[inset_0.14em_0.14em_0_var(--color-neutral-400)] [image-rendering:pixelated]",
        "text-shadow-mc",
        "relative flex items-center justify-center",
        "outline-2 outline-neutral-950",
        "after:pointer-events-none after:absolute after:top-0 after:left-0 after:block after:size-full after:shadow-[inset_-0.14em_-0.25em_0_var(--color-neutral-600)]",
        "top-0 flex w-full items-center justify-between p-2",
        className,
    )}
>
    <button
        class="text-shadow-mc flex cursor-pointer items-center justify-center gap-2"
        onmousedown={() => {
            playSound("click");
        }}
        onclick={() => goto(backURL || "/")}
    >
        <img src="/icons/arrow_left.webp" alt="Back" class="h-6" />
        <p class="text-lg">Back</p>
    </button>
    <img src="/titles/{title}.webp" alt="Logo" class="hidden h-8 md:block" />
    <svelte:element
        this={user ? "a" : "div"}
        href={user ? "/profile" : undefined}
        onclick={() => {
            if (user) {
                playSound("click");
            }
        }}
        role={user ? "link" : "button"}
        class="flex items-center gap-2"
    >
        {#if user}
            <PixelatedImage src={getUserAvatar(user.id, user.avatar)} alt="User Avatar" class="size-8" />
            <p>{user?.global_name || user.username}</p>
        {/if}
    </svelte:element>
</div>
