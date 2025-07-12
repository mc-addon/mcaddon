<script lang="ts">
    import { goto, invalidateAll } from "$app/navigation";
    import Button from "$lib/components/ui/Button.svelte";
    import Seo from "$lib/components/ui/Seo.svelte";
    import Title from "$lib/components/ui/Title.svelte";
    import UserButton from "$lib/components/UserButton.svelte";
    import { toast } from "svelte-sonner";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    let loading: boolean = $state(false);
    async function logout() {
        loading = true;
        try {
            await fetch("/auth/logout");
            invalidateAll();
        } catch {
            return;
        }
        loading = false;
    }
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
                if (!data.user || !data.userData) {
                    e.preventDefault();
                    e.stopPropagation();
                    toast.warning("Login to access marketplace");
                } else if (!data.userData.minecraftName) {
                    e.preventDefault();
                    e.stopPropagation();
                    toast.warning("Link your Minecraft account to access marketplace");
                    goto("/profile");
                }
            }}
        >
            Marketplace
        </Button>
        <Button href={data.discord}>Discord Server</Button>
        <div class="flex w-full flex-col-reverse items-center justify-center gap-2 md:flex-row md:gap-5">
            {#if data.user}
                <Button iconName="error" {loading} onclick={logout}>Logout</Button>
            {/if}
            <UserButton user={data.user} />
        </div>
    </div>
</div>

<div class="fixed bottom-0 left-0 w-full text-xs text-neutral-400 md:text-sm">
    Not affiliated with Mojang or Microsoft.<br />All rights reserved.
</div>
