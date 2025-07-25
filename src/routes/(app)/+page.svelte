<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import Button from "$lib/components/ui/Button.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Popup from "$lib/components/ui/Popup.svelte";
    import Seo from "$lib/components/ui/Seo.svelte";
    import Title from "$lib/components/ui/Title.svelte";
    import Toggle from "$lib/components/ui/Toggle.svelte";
    import Tooltip from "$lib/components/ui/Tooltip.svelte";
    import UserButton from "$lib/components/UserButton.svelte";
    import { setMC, toggleLinkMC, unsetMC } from "$lib/minecraft/browser";
    import { toast } from "svelte-sonner";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    let input = $state<string>(data.mc ? data.mc.username : "");
    let inputImage = $derived(input ? { src: `https://cravatar.eu/avatar/${input}/600`, alt: input } : { src: "", alt: "" });
    let isJava = $derived(!data.mc || data.mc.type === "java");
    let loading = $state<boolean>(false);

    async function setMinecraftAcc() {
        if (input.trim()) {
            loading = true;
            try {
                await setMC(input.trim(), isJava ? "java" : "bedrock");
            } finally {
                invalidateAll();
                input = "";
                loading = false;
            }
        } else {
            toast.error("Minecraft name cannot be empty.");
        }
    }

    // Linking
    let loadingLink = $state<boolean>(false);
</script>

<Seo />
<div class="p-base flex size-full flex-col items-center justify-center gap-5 overflow-hidden lg:gap-14">
    <Title class="top-0 w-80 md:w-140 2xl:w-250" />
    <div class="flex w-80 flex-col items-center gap-2 sm:w-80 md:w-120 md:gap-5 2xl:w-220">
        <Button href="/status">Server Status</Button>
        <Button
            href="/store"
            iconName="gold_ingot"
            onclick={(e) => {
                if (!data.mc) {
                    e.preventDefault();
                    e.stopPropagation();
                    toast.warning("You need to set your Minecraft account first.");
                }
            }}
        >
            Marketplace
        </Button>
        <Button href={data.discord}>Discord Server</Button>
        <div class="relative flex w-full flex-col items-center justify-center gap-2 md:flex-row md:gap-5">
            <Popup title="Minecraft Account">
                {#snippet trigger()}
                    <Button
                        iconName={data.mc?.type ? "" : "grass_block"}
                        img={data.mc ? { src: `https://cravatar.eu/avatar/${data.mc?.username}/600`, alt: data.mc?.username } : { src: "", alt: "" }}
                    >
                        {data.mc ? data.mc.username.slice(0, 8) + "..." : "Minecraft"}
                    </Button>
                {/snippet}
                <div class="flex w-full flex-col gap-2">
                    <Input
                        bind:value={input}
                        disabled={loading}
                        placeholder="Minecraft {isJava ? 'username' : 'gamertag'}"
                        iconName="grass_block"
                        bind:img={inputImage}
                        onEnter={setMinecraftAcc}
                    />
                    <div class="flex w-full items-center justify-center gap-2">
                        <p>Bedrock</p>
                        <Toggle bind:status={isJava} />
                        <p>Java</p>
                    </div>
                    <Button {loading} size="sm" onclick={setMinecraftAcc}>Set Minecraft Account</Button>
                    {#if data.mc}
                        <Button
                            {loading}
                            size="sm"
                            onclick={async () => {
                                loading = true;
                                try {
                                    await unsetMC();
                                } finally {
                                    invalidateAll();
                                    loading = false;
                                }
                            }}>Unset Minecraft Account</Button
                        >
                    {/if}
                    {#if data.user && data.userData?.minecraft?.username && data.userData?.minecraft?.username != data.mc?.username}
                        <Button
                            {loading}
                            size="sm"
                            onclick={async () => {
                                if (!data.userData?.minecraft?.username) {
                                    toast.error("You need to link your Minecraft account first.");
                                    return;
                                }
                                loading = true;
                                try {
                                    await setMC(data.userData?.minecraft.username, data.userData?.minecraft.type);
                                } finally {
                                    invalidateAll();
                                    loading = false;
                                }
                            }}>Use linked Minecraft Account</Button
                        >
                    {/if}
                </div>
            </Popup>
            <UserButton user={data.user} />
            {#if data.user && data.mc}
                <Tooltip triggerClass="absolute">
                    {#snippet trigger()}
                        <Button
                            iconName={data.userData?.minecraft?.username == data.mc?.username && data.userData?.minecraft?.type == data.mc?.type
                                ? "powered_rail"
                                : "rail"}
                            size="sm"
                            loading={loadingLink}
                            onclick={async () => {
                                loadingLink = true;
                                try {
                                    await toggleLinkMC(
                                        data.userData?.minecraft?.username == data.mc?.username && data.userData?.minecraft?.type == data.mc?.type,
                                    );
                                } finally {
                                    invalidateAll();
                                    loadingLink = false;
                                }
                            }}
                        />
                    {/snippet}
                    {#if data.userData?.minecraft?.username == data.mc?.username && data.userData?.minecraft?.type == data.mc?.type}
                        Unlink account
                    {:else}
                        Link account
                    {/if}
                </Tooltip>
            {/if}
        </div>
    </div>
</div>

<div class="fixed bottom-0 left-0 w-full text-xs text-neutral-400 md:text-sm">
    Not affiliated with Mojang AB or Microsoft.<br />All rights reserved.
</div>
