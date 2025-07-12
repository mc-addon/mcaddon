<script lang="ts">
    interface Props {
        title?: string;
        description?: string;
        image?: string;
        author?: string;
    }
    let {
        title = "",
        description = "Welcome to the official hub of MC Addon Network — a competitive, community-driven Lifesteal Minecraft Network with thrilling mechanics, epic events, and intense mini-games! Whether you're here to grind, fight, build, or just vibe with friends — you're in the right place.",
        image = "/favicon.webp",
        author = "MC Addon Network",
    }: Props = $props();
</script>

<svelte:head>
    <title>MC Addon {title ? `| ${title}` : ""}</title>
    <meta name="description" content={description} />
    <meta name="theme-color" content="#0EA5E9" />
    <meta name="background-color" content="#020617" />
    <meta name="author" content={author} />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title ? `${title}` : "MC Addon"} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={image} />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary" />
    <meta property="twitter:title" content={title ? `${title}` : "MC Addon"} />
    <meta property="twitter:description" content={description} />
    <meta property="twitter:image" content={image} />
</svelte:head>
