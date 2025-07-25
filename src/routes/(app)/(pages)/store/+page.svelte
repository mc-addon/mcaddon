<script lang="ts">
    import Button from "$lib/components/ui/Button.svelte";
    import Seo from "$lib/components/ui/Seo.svelte";
    import Tooltip from "$lib/components/ui/Tooltip.svelte";
    import { basketStore } from "$lib/stores/basket";
    import { playSound } from "$lib/stores/sounds";
    import { basketCooldownManager, buyNow } from "$lib/tebex";
    import type { Basket } from "tebex_headless";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    let basket = $state<Basket>(data.basket);
    let buyNowLoading = $state<Record<number, boolean>>({});

    // Subscribe to basket store updates
    basketStore.subscribe((newBasket) => {
        if (newBasket) {
            basket = newBasket;
        }
    });

    async function handleBuyNow(pkgId: number, pkgName: string) {
        buyNowLoading[pkgId] = true;
        try {
            await buyNow(pkgId, pkgName);
        } finally {
            buyNowLoading[pkgId] = false;
        }
    }
</script>

<Seo title="Marketplace" />
<div class="p-base flex flex-1 flex-col gap-5 overflow-x-hidden overflow-y-auto md:gap-10 lg:gap-20">
    {#await data.categories}
        {#each Array(2) as _, categoryIndex (categoryIndex)}
            <div class="flex flex-col gap-2">
                <div class="mx-auto h-8 w-1/4 animate-pulse bg-neutral-700 md:mx-0"></div>
                <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
                    {#each Array(3) as _, i (i)}
                        <div
                            class="flex h-120 w-full cursor-pointer flex-col gap-2 border-2 border-neutral-700 bg-neutral-800 p-4 transition-colors duration-200 select-none hover:border-neutral-500"
                        >
                            <div class="h-60 w-full animate-pulse bg-neutral-700"></div>
                            <div class="flex flex-1 flex-col gap-2">
                                <div class="mx-auto h-6 w-3/4 animate-pulse bg-neutral-700"></div>
                                <div class="mt-2 flex-1 space-y-2">
                                    <div class="h-4 w-full animate-pulse bg-neutral-700"></div>
                                    <div class="h-4 w-5/6 animate-pulse bg-neutral-700"></div>
                                    <div class="h-4 w-4/5 animate-pulse bg-neutral-700"></div>
                                    <div class="h-4 w-2/3 animate-pulse bg-neutral-700"></div>
                                </div>
                            </div>
                            <div class="h-4 w-32 animate-pulse bg-neutral-700"></div>
                            <div class="flex w-full items-center justify-between gap-2">
                                <div class="h-12 w-14 animate-pulse bg-neutral-700"></div>
                                <div class="h-12 w-full animate-pulse bg-neutral-700"></div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {/each}
    {:then categories}
        {#each categories as category (category.id)}
            <div class="flex flex-col gap-2">
                <h1 class="font-minecrafter text-center text-3xl md:text-left">{category.name}</h1>
                <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
                    {#each category.packages as pkg (pkg.id)}
                        <a
                            class="flex h-120 w-full cursor-pointer flex-col gap-2 border-2 border-neutral-700 bg-neutral-800 p-4 transition-colors duration-200 select-none hover:border-neutral-500"
                            href={`/store/${pkg.id}`}
                            onmousedown={() => playSound("click")}
                        >
                            <div class="h-60 w-full bg-neutral-700 bg-cover bg-center bg-no-repeat" style="background-image: url({pkg.image});"></div>
                            <div class="flex flex-1 flex-col gap-2">
                                <h2 class="font-minecrafter text-center text-xl leading-tight">{pkg.name}</h2>
                                <div class="flex-1">
                                    <p class="line-clamp-4 text-left text-sm leading-relaxed">
                                        {@html pkg.description}
                                    </p>
                                </div>
                            </div>
                            <p class="text-left text-sm">
                                Price: <span class="font-bold text-yellow-400">{pkg.total_price} {pkg.currency}</span>
                            </p>
                            <div class="flex w-full items-center justify-between gap-2">
                                <Tooltip>
                                    {#snippet trigger()}
                                        <Button
                                            iconName="chest"
                                            disabled={basketCooldownManager.isOnCooldown(pkg.id) || !data.user || !data.inGuild}
                                            onclick={async (e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                basketCooldownManager.addToBasketWithCooldown(data.basket.ident, pkg.id, pkg.name);
                                            }}
                                        />
                                    {/snippet}
                                    Add to Basket
                                </Tooltip>
                                <Button
                                    loading={buyNowLoading[pkg.id]}
                                    disabled={!data.user || !data.inGuild}
                                    onclick={async (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        await handleBuyNow(pkg.id, pkg.name);
                                    }}
                                >
                                    {buyNowLoading[pkg.id] ? "Processing..." : "Buy Now"}
                                </Button>
                            </div>
                        </a>
                    {/each}
                </div>
            </div>
        {/each}
    {/await}
</div>
