<script lang="ts">
    import { cn } from "$lib/utils/cn";

    interface Props {
        title?: string;
        class?: string;
    }

    let { title = "mcaddon", class: className = "" }: Props = $props();
</script>

<h1 class="block p-2">
    <img src="/titles/{title}.webp" alt={title} class={cn("size-full object-cover", className)} loading="lazy" />
</h1>
