<script lang="ts">
    import Button from "$lib/components/ui/Button.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Popup from "$lib/components/ui/Popup.svelte";
    import Select from "$lib/components/ui/Select.svelte";
    import Tooltip from "$lib/components/ui/Tooltip.svelte";
    import { basketStore, updateBasket } from "$lib/stores/basket";
    import { hidePopup, store as popupStore, showPopup } from "$lib/stores/popup";
    import { applyCoupon, getBasket, initiateCheckout, removeCoupon, removeFromBasket, setupTebexCheckout, updateQuantity } from "$lib/tebex";
    import { onMount } from "svelte";
    import { fade, fly } from "svelte/transition";
    import type { ApplyType, Basket, BasketPackage } from "tebex_headless";
    import type { LayoutData } from "./$types";

    let { data, children }: { data: LayoutData; children: any } = $props();

    let basket = $state<Basket>(data.basket);
    let couponCode = $state<string>("");
    let applyCouponLoading = $state<boolean>(false);
    let couponType = $state<ApplyType>("coupons");
    let inputQtyLoading = $state<Record<number, boolean>>({});

    // Subscribe to basket store updates
    basketStore.subscribe((newBasket) => {
        if (newBasket) {
            basket = newBasket;
        }
    });

    onMount(() => {
        // Initialize the basket store with the server data
        if (data.basket) {
            updateBasket(data.basket);
        }

        // Setup Tebex checkout
        setupTebexCheckout(data.basket.ident);
    });

    const couponTypeOptions = [
        { value: "coupons", label: "Coupon", iconName: "cupon" },
        { value: "giftcards", label: "Gift Card", iconName: "gift" },
        { value: "creator-codes", label: "Creator Code", iconName: "youtube" },
    ];

    async function handleApplyCoupon() {
        applyCouponLoading = true;
        try {
            await applyCoupon(basket.ident, couponType, couponCode);
            couponCode = "";
        } finally {
            applyCouponLoading = false;
        }
    }

    async function handleQty(pkg: BasketPackage) {
        inputQtyLoading[pkg.id] = true;
        try {
            await updateQuantity(basket.ident, pkg.id, pkg.in_basket.quantity, pkg.name);
        } finally {
            inputQtyLoading[pkg.id] = false;
        }
    }
</script>

{@render children()}

<!-- Basket Popup -->
<Popup bind:open={$popupStore.basketPopup} title="Your Basket" drawerDismissible={false}>
    {#if basket.packages.length === 0}
        <div class="flex flex-col items-center justify-center gap-5 py-8">
            <img src="/icons/chest.webp" alt="Empty basket" class="h-16 opacity-50" />
            <p class="text-center text-neutral-400">Your basket is empty</p>
            <p class="text-center text-sm text-neutral-400">Add some items to get started!</p>
        </div>
    {:else}
        <div class="flex flex-col gap-5">
            <!-- Basket Items -->
            <div class="flex max-h-60 flex-col gap-2 overflow-y-auto" style="scrollbar-width: none;">
                {#each basket.packages as pkg (pkg.id)}
                    <div
                        in:fly={{
                            x: -200,
                            duration: 200,
                        }}
                        out:fly={{
                            x: 200,
                            duration: 200,
                        }}
                        class="flex items-center gap-2 border-2 border-neutral-700 bg-neutral-800 p-2"
                    >
                        <div
                            class="size-15 flex-shrink-0 bg-neutral-700 bg-cover bg-center bg-no-repeat"
                            style="background-image: url({pkg.image});"
                        ></div>
                        <div class="min-w-0 flex-1">
                            <h3 class="font-minecrafter truncate text-sm leading-tight">{pkg.name}</h3>
                            <div class="flex items-center gap-2">
                                <span class="text-xs text-neutral-400">Quantity:</span>
                                <Input
                                    bind:value={pkg.in_basket.quantity}
                                    disabled={inputQtyLoading[pkg.id]}
                                    class="h-6 w-16 text-xs"
                                    onEnter={async () => handleQty(pkg)}
                                />
                            </div>
                            <p class="text-xs text-neutral-400">
                                Price: <span class="text-yellow-400">{pkg.in_basket.price} {basket.currency}</span>
                            </p>
                        </div>
                        <div class="flex items-center gap-2">
                            <Tooltip>
                                {#snippet trigger()}
                                    <Button size="sm" iconName="error" onclick={() => removeFromBasket(basket.ident, pkg.id, pkg.name)} />
                                {/snippet}
                                Remove from basket
                            </Tooltip>
                        </div>
                    </div>
                {/each}
            </div>
            <div class="border-t-2 border-neutral-700"></div>
            <!-- Coupon Section -->
            <div class="space-y-2">
                <h3 class="font-minecrafter text-left text-sm">Apply Discount Code</h3>
                <div class="space-y-2">
                    <!-- Type Selector -->
                    <Select
                        bind:value={couponType}
                        items={couponTypeOptions}
                        placeholder="Select discount type"
                        onValueChange={() => {
                            couponCode = "";
                        }}
                    />
                    <!-- Input Section -->
                    <div class="flex flex-col gap-2">
                        <Input
                            bind:value={couponCode}
                            placeholder={couponType === "coupons"
                                ? "Enter coupon code"
                                : couponType === "giftcards"
                                  ? "Enter gift card number"
                                  : "Enter creator code"}
                            class="flex-1"
                            onEnter={handleApplyCoupon}
                        />
                        <Button onclick={handleApplyCoupon} loading={applyCouponLoading} disabled={!couponCode.trim()} size="sm">
                            {applyCouponLoading ? "Applying..." : "Apply"}
                        </Button>
                    </div>
                </div>

                <!-- Applied Discounts -->
                {#if basket.coupons?.length > 0 || basket.giftcards?.length > 0 || basket.creator_code}
                    <div class="space-y-2">
                        {#each couponTypeOptions as option}
                            {@const items =
                                option.value === "coupons"
                                    ? basket.coupons
                                    : option.value === "giftcards"
                                      ? basket.giftcards
                                      : basket.creator_code
                                        ? [{ code: basket.creator_code }]
                                        : []}
                            {#if items?.length > 0}
                                <div class="space-y-2">
                                    <h4 class="font-minecrafter text-left text-xs">
                                        Applied {option.label}s
                                    </h4>
                                    {#each items as item}
                                        <div
                                            in:fly={{ y: -20, duration: 200 }}
                                            out:fly={{ y: 20, duration: 200 }}
                                            class="flex items-center justify-between gap-2 border-2 border-neutral-700 bg-neutral-800 p-2"
                                        >
                                            <div class="flex items-center gap-2">
                                                <img src="/icons/{option.iconName}.webp" alt={option.label} class="h-4" />
                                                <div>
                                                    <span
                                                        class="text-xs {option.value === 'coupons'
                                                            ? 'text-green-400'
                                                            : option.value === 'giftcards'
                                                              ? 'text-yellow-400'
                                                              : 'text-blue-400'}"
                                                    >
                                                        {"code" in item ? item.code : `****${`${item.card_number}`.slice(-4)}`}
                                                    </span>
                                                    <p class="text-xs text-neutral-400">{option.label} Applied</p>
                                                </div>
                                            </div>
                                            <Tooltip>
                                                {#snippet trigger()}
                                                    <Button
                                                        size="sm"
                                                        iconName="error"
                                                        onclick={() =>
                                                            removeCoupon(
                                                                basket.ident,
                                                                "code" in item ? item.code : item.card_number,
                                                                option.value as ApplyType,
                                                            )}
                                                    />
                                                {/snippet}
                                                Remove {option.label.toLowerCase()}
                                            </Tooltip>
                                        </div>
                                    {/each}
                                </div>
                            {/if}
                        {/each}
                    </div>
                {/if}
            </div>
            <div class="border-t-2 border-neutral-700"></div>
            <!-- Total Price & Action Buttons -->
            <div>
                <div class="flex items-center justify-between rounded bg-neutral-900 p-2 text-lg">
                    <span>Total:</span>
                    <span class="text-yellow-400">
                        {basket.total_price}
                        {basket.currency}
                    </span>
                </div>
                <!-- Action Buttons -->
                <div class="flex flex-col gap-2">
                    <Button onclick={initiateCheckout} size="sm">Buy Now</Button>
                </div>
            </div>
        </div>
    {/if}
    <div class="mt-2">
        <Button
            onclick={() => {
                hidePopup("basketPopup");
            }}
            size="sm"
        >
            Continue Shopping
        </Button>
    </div>
</Popup>

<!-- Floating Basket Button -->
{#if basket.packages.length > 0}
    <div in:fade={{ duration: 200 }} class="fixed right-4 bottom-4 z-50">
        <Tooltip>
            {#snippet trigger()}
                <Button
                    iconName="chest"
                    onclick={async () => {
                        await getBasket(basket.ident);
                        showPopup("basketPopup");
                    }}
                />
            {/snippet}
            View Basket
        </Tooltip>
    </div>
{/if}
