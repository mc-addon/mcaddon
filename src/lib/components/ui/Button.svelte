<script lang="ts">
    import { playSound } from "$lib/stores/sounds";
    import { cn } from "$lib/utils/cn";
    import type { Snippet } from "svelte";
    import PixelatedImage from "./PixelatedImage.svelte";

    interface Props {
        class?: string;
        iconName?: string;
        iconClass?: string;
        img?: {
            src: string;
            alt?: string;
        };
        size?: "sm" | "md" | "lg" | "xl" | "";
        type?: "default" | "div";
        flow?: boolean;
        href?: string;
        disabled?: boolean;
        loading?: boolean;
        onclick?: (event: MouseEvent) => void;
        children?: Snippet;
    }

    let {
        class: className = "",
        iconName = "",
        iconClass = "",
        img = undefined,
        size = "md",
        type = "default",
        flow = true,
        href = "",
        disabled = $bindable(false),
        loading = $bindable(false),
        onclick = (event: MouseEvent) => {},
        children,
    }: Props = $props();

    // Determine if this is an icon-only button
    let isIconOnly: boolean = $derived(Boolean(!children && (iconName || img?.src)));

    // Size configuration object for better maintainability
    const sizeConfig = {
        sm: {
            text: "text-md md:text-lg",
            padding: "px-2 py-1",
            iconSize: "h-7",
            iconOffset: "right-1",
            buttonSize: "min-w-8 min-h-8",
        },
        md: {
            text: "text-lg md:text-xl",
            padding: "px-3 py-2",
            iconSize: "h-10",
            iconOffset: "right-2",
            buttonSize: "min-w-12 min-h-12",
        },
        lg: {
            text: "text-xl md:text-2xl",
            padding: "px-4 py-3",
            iconSize: "h-14",
            iconOffset: "right-3",
            buttonSize: "min-w-16 min-h-16",
        },
        xl: {
            text: "text-2xl md:text-3xl",
            padding: "px-6 py-4",
            iconSize: "h-19",
            iconOffset: "right-5",
            buttonSize: "min-w-20 min-h-20",
        },
    };

    let buttonClasses: string = $derived.by(() => {
        const config = sizeConfig[size as keyof typeof sizeConfig];
        if (!config) return "";

        const classes = [];

        if (children) {
            // Button with text
            classes.push(config.text, config.padding);
        }
        classes.push(config.buttonSize);

        return classes.join(" ");
    });

    let config = $derived(sizeConfig[size as keyof typeof sizeConfig]);

    let iconClasses: string = $derived.by(() => {
        const config = sizeConfig[size as keyof typeof sizeConfig];
        if (!config) return "";

        const classes = [config.iconSize];

        if (children) {
            // Icon with text - position to the right
            classes.push("absolute", config.iconOffset);
        } else {
            // Icon-only - center the icon
            classes.push("relative");
        }

        return classes.join(" ");
    });
</script>

<svelte:element
    this={type === "default" ? (href ? "a" : "button") : type}
    role={type === "default" ? (href ? "link" : "button") : type}
    tabindex="0"
    onmousedown={() => {
        if (!disabled && !loading) {
            playSound("click");
        } else {
            return undefined;
        }
    }}
    class={cn(
        "bg-neutral-500 bg-[url('/textures/button.webp')] bg-size-[20em] bg-left shadow-[inset_0.14em_0.14em_0_var(--color-neutral-400)] [image-rendering:pixelated]",
        "text-shadow-mc",
        "relative flex items-center justify-center",
        "outline-2 outline-neutral-950",
        "after:absolute after:top-0 after:left-0 after:block after:size-full after:shadow-[inset_-0.14em_-0.25em_0_var(--color-neutral-600)]",
        buttonClasses,
        className,
    )}
    class:cursor-not-allowed={disabled}
    class:opacity-50={disabled || loading}
    class:cursor-wait={loading}
    class:cursor-pointer={!disabled && !loading}
    class:w-full={flow && !isIconOnly}
    class:hover:outline-white={!disabled && !loading}
    class:focus:outline-white={!disabled && !loading}
    onclick={!disabled && !loading ? onclick : undefined}
    {href}
    {disabled}
    data-sveltekit-preload-data="hover"
>
    {@render children?.()}
    {#if img?.src}
        <PixelatedImage
            src={img.src}
            alt={img.alt || ""}
            class={cn("inline-block p-1 align-middle", iconClasses)}
            width={config?.iconSize === "h-7" ? 28 : config?.iconSize === "h-10" ? 40 : config?.iconSize === "h-14" ? 56 : 76}
            height={config?.iconSize === "h-7" ? 28 : config?.iconSize === "h-10" ? 40 : config?.iconSize === "h-14" ? 56 : 76}
            pixelSize={2}
        />
    {:else if iconName}
        <img src="/icons/{iconName}.webp" alt={iconName} class={cn("inline-block p-1.5 align-middle", iconClasses, iconClass)} />
    {/if}
</svelte:element>
