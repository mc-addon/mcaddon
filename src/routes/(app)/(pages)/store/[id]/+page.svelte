<script lang="ts">
    import { page } from "$app/state";
    import Button from "$lib/components/ui/Button.svelte";
    import Seo from "$lib/components/ui/Seo.svelte";
    import { basketStore } from "$lib/stores/basket";
    import { basketCooldownManager, buyNow } from "$lib/tebex";
    import { error } from "@sveltejs/kit";
    import { toast } from "svelte-sonner";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    if (!data.pkg) {
        throw error(404, "Package not found");
    }

    let basket = $state(data.basket);
    let buyNowLoading = $state<boolean>(false);
    const isSpecial = data.specialPkgIDs?.includes(data.pkg.id) || false;

    // Subscribe to basket store updates
    basketStore.subscribe((newBasket) => {
        if (newBasket) {
            basket = newBasket;
        }
    });

    async function handleBuyNow() {
        buyNowLoading = true;
        try {
            await buyNow(data.pkg.id, data.pkg.name, basket.ident);
        } finally {
            buyNowLoading = false;
        }
    }
</script>

<Seo
    title={data.pkg.name}
    image={data.pkg.image || ""}
    description={`ID: ${data.pkg.id}
Category: ${data.pkg.category.name}
Price: ${data.pkg.total_price} ${data.pkg.currency}
${data.pkg.expiration_date ? `Expiration Date: ${data.pkg.expiration_date}` : ""}`}
/>

<div class="size-full overflow-y-auto p-2 md:overflow-hidden">
    <div class="{isSpecial ? 'border-transparent' : 'border-neutral-700'} size-full border-2" class:special-card={isSpecial}>
        <div
            class="p-base grid size-full grid-cols-1 grid-rows-[auto_1fr] gap-5 overflow-x-hidden bg-neutral-800 md:h-full md:grid-cols-[1fr_30%] md:grid-rows-none"
            style={isSpecial ? "background-image: url(/textures/special_card.webp);" : ""}
        >
            <!-- Info section - appears first on mobile, second on desktop -->
            <div class="order-1 flex flex-col items-start justify-between gap-5 md:order-2 md:h-full">
                <div class="flex w-full flex-col gap-5">
                    <div class="aspect-video bg-neutral-700 bg-cover bg-center bg-no-repeat" style="background-image: url({data.pkg.image});"></div>
                    <div class="flex flex-col text-left">
                        <p>
                            ID: <span class="font-bold text-yellow-400">{data.pkg.id}</span>
                        </p>
                        <p>
                            Category: <span class="font-bold text-yellow-400">{data.pkg.category.name}</span>
                        </p>
                        <p>
                            Price: <span class="font-bold text-yellow-400">{data.pkg.total_price} {data.pkg.currency}</span>
                        </p>
                        {#if data.pkg.expiration_date}
                            <p>
                                Expiration Date: <span class="font-bold text-yellow-400">{data.pkg.expiration_date}</span>
                            </p>
                        {/if}
                    </div>
                </div>
                <div class="flex w-full flex-col gap-2">
                    <Button
                        iconName="chest"
                        disabled={basketCooldownManager.isOnCooldown(data.pkg.id) || !data.user || !data.inGuild}
                        onclick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            basketCooldownManager.addToBasketWithCooldown(basket.ident, data.pkg.id, data.pkg.name);
                        }}
                    >
                        Add to Basket
                    </Button>
                    <Button
                        onclick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigator.clipboard.writeText(`${page.url.origin}/store/${data.pkg.id}`);
                            toast.success("Link copied to clipboard", {
                                description: "You can now share this link with others.",
                            });
                        }}
                    >
                        Share
                    </Button>
                    <Button
                        loading={buyNowLoading}
                        disabled={!data.user || !data.inGuild}
                        onclick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            await handleBuyNow();
                        }}
                    >
                        {buyNowLoading ? "Processing..." : "Buy Now"}
                    </Button>
                </div>
            </div>

            <!-- Description section - appears second on mobile, first on desktop -->
            <div class="order-2 md:order-1 md:h-full md:overflow-hidden">
                <h2 class="font-minecrafter text-left text-2xl leading-tight md:text-4xl">{data.pkg.name}</h2>
                <br />
                <p class="h-full overflow-y-auto text-left text-sm leading-relaxed md:max-h-full">
                    {@html data.pkg.description}
                </p>
            </div>
        </div>
    </div>
</div>
