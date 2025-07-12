<script lang="ts">
    import { playSound } from "$lib/stores/sounds";
    import { cn } from "$lib/utils/cn";
    import { Select } from "bits-ui";

    interface SelectItem {
        value: string;
        label: string;
        disabled?: boolean;
        iconName?: string;
    }

    interface Props {
        value?: string;
        items: SelectItem[];
        placeholder?: string;
        disabled?: boolean;
        class?: string;
        onValueChange?: (value: string) => void;
    }

    let { value = $bindable(""), items, placeholder = "Select an option", disabled = false, class: className, onValueChange }: Props = $props();

    let open = $state(false);
    let selectFocus = $state(false);

    const selectedItem = $derived(items.find((item) => item.value === value));
    const selectedLabel = $derived(() => {
        return selectedItem ? selectedItem.label : placeholder;
    });

    const isPlaceholder = $derived(!value || !selectedItem);

    function handleValueChange(newValue: string) {
        value = newValue;
        onValueChange?.(newValue);
    }
</script>

<Select.Root bind:value bind:open onValueChange={handleValueChange} {disabled} type="single">
    <Select.Trigger
        class={cn(
            "flex h-10 w-full items-center justify-between gap-2 border-2 border-neutral-700 bg-neutral-800 px-3 py-2 text-white transition-colors duration-200 focus:outline-none",
            (selectFocus || open) && "!border-neutral-500",
            disabled && "cursor-not-allowed opacity-50",
            className,
        )}
        {disabled}
        onfocusin={() => (selectFocus = true)}
        onfocusout={() => (selectFocus = false)}
        onmousedown={() => {
            playSound("click");
        }}
    >
        <div class="flex items-center gap-2">
            {#if selectedItem?.iconName}
                <img src="/icons/{selectedItem.iconName}.webp" alt="{selectedItem.label} icon" class="h-4" />
            {/if}
            <span class={cn("truncate", isPlaceholder && "text-neutral-400")}>
                {selectedLabel()}
            </span>
        </div>
        <div class="flex items-center">
            <img src="/icons/arrow_up.webp" alt="Arrow" class={cn("h-3 transition-transform duration-200", open ? "" : "rotate-180")} />
        </div>
    </Select.Trigger>

    <Select.Portal>
        <Select.Content
            class="z-[1000] min-w-[var(--bits-select-anchor-width)] overflow-hidden border-2 border-neutral-700 bg-neutral-800 shadow-lg"
            sideOffset={4}
        >
            <Select.ScrollUpButton class="flex h-6 items-center justify-center bg-neutral-800 transition-colors duration-200 hover:bg-neutral-700">
                <img src="/icons/arrow_up.webp" alt="Scroll up" class="h-3" />
            </Select.ScrollUpButton>

            <Select.Viewport class="max-h-60 overflow-y-auto p-1">
                {#each items as item (item.value)}
                    <Select.Item
                        value={item.value}
                        label={item.label}
                        disabled={item.disabled}
                        class={cn(
                            "relative flex h-10 w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-white transition-colors duration-200 select-none hover:bg-neutral-700 focus:bg-neutral-700 focus:outline-none",
                            item.disabled && "cursor-not-allowed opacity-50 hover:bg-neutral-800",
                            "data-[highlighted]:bg-neutral-600 data-[selected]:bg-neutral-600",
                        )}
                    >
                        {#snippet children({ selected })}
                            {#if item.iconName}
                                <img src="/icons/{item.iconName}.webp" alt="{item.label} icon" class="h-4" />
                            {/if}
                            <span class="flex-1 truncate">{item.label}</span>
                            {#if selected}
                                <div class="ml-auto flex items-center">
                                    <img src="/icons/success.webp" alt="Selected" class="h-4" />
                                </div>
                            {/if}
                        {/snippet}
                    </Select.Item>
                {/each}
            </Select.Viewport>

            <Select.ScrollDownButton class="flex h-6 items-center justify-center bg-neutral-800 transition-colors duration-200 hover:bg-neutral-700">
                <img src="/icons/arrow_down.webp" alt="Scroll down" class="h-3" />
            </Select.ScrollDownButton>
        </Select.Content>
    </Select.Portal>
</Select.Root>
