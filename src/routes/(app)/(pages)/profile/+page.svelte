<script lang="ts">
    import { goto, invalidateAll } from "$app/navigation";
    import Button from "$lib/components/ui/Button.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import PixelatedImage from "$lib/components/ui/PixelatedImage.svelte";
    import Popup from "$lib/components/ui/Popup.svelte";
    import Select from "$lib/components/ui/Select.svelte";
    import Seo from "$lib/components/ui/Seo.svelte";
    import { getUserAvatar } from "$lib/discord/user";
    import { toast } from "svelte-sonner";
    import type { Package } from "tebex_headless";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    let loading: boolean = $state(false);
    async function logout() {
        loading = true;
        try {
            goto("/");
            await fetch("/auth/logout");
            invalidateAll();
        } catch {
            return;
        }
        loading = false;
    }

    // Admin settings state
    let javaServerIP: string = $derived(data.settings?.minecraftJavaIP || "");
    let bedrockServerIP: string = $derived(data.settings?.minecraftBedrockIP || "");
    let bedrockServerPort: number = $derived(data.settings?.minecraftBedrockPort || 19132);
    let discordInvite: string = $derived(data.settings?.guildInvite || "");
    let discordID: string = $derived(data.settings?.guildId || "");
    let specialPkgIDs: number[] = $derived(data.settings?.specialPkgIDs || []);
    let specialPkgs: Package[] = $derived(data.pkgs?.filter((pkg) => specialPkgIDs.includes(pkg.id)) || []);
    let adminUserInput: string = $state("");
    let selectedPkgID: string = $state(""); // For select popup

    async function updateServerSettings() {
        if (!javaServerIP.trim()) {
            toast.error("Java server IP cannot be empty.");
            return;
        }
        if (!bedrockServerIP.trim()) {
            toast.error("Bedrock server IP cannot be empty.");
            return;
        }

        const bedrockPort = Number(bedrockServerPort);
        if (isNaN(bedrockPort) || bedrockPort < 1 || bedrockPort > 65535) {
            toast.error("Bedrock port must be a valid number between 1 and 65535.");
            return;
        }

        const promise = Promise.all([
            fetch("/api/admin/settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ key: "minecraftJavaIP", value: javaServerIP.trim() }),
            }),
            fetch("/api/admin/settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ key: "minecraftBedrockIP", value: bedrockServerIP.trim() }),
            }),
            fetch("/api/admin/settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ key: "minecraftBedrockPort", value: bedrockPort }),
            }),
        ]).then(async (responses) => {
            for (const response of responses) {
                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.error || "An error occurred while updating server settings.");
                }
            }
            invalidateAll();
            return { success: true };
        });

        toast.promise(promise, {
            loading: "Updating server settings...",
            success: "Server settings updated successfully!",
            error: (error) => (error instanceof Error ? error.message : "An unexpected error occurred."),
        });
    }

    async function updateDiscordSettings() {
        if (!discordInvite.trim()) {
            toast.error("Discord invite cannot be empty.");
            return;
        }

        const promise = Promise.all([
            fetch("/api/admin/settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ key: "guildInvite", value: discordInvite.trim() }),
            }),
            fetch("/api/admin/settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ key: "guildId", value: discordID.trim() }),
            }),
        ]).then(async (responses) => {
            for (const response of responses) {
                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.error || "An error occurred while updating Discord settings.");
                }
            }
            invalidateAll();
            return { success: true };
        });

        toast.promise(promise, {
            loading: "Updating Discord settings...",
            success: "Discord settings updated successfully!",
            error: (error) => (error instanceof Error ? error.message : "An unexpected error occurred."),
        });
    }

    async function addAdmin() {
        const userID = adminUserInput.trim();
        if (!userID) {
            toast.error("User ID cannot be empty.");
            return;
        }

        // Check if user ID is already an admin
        const currentAdmins = data.settings?.adminIDs || [];
        if (currentAdmins.includes(userID)) {
            toast.error("User is already an admin.");
            return;
        }

        // First verify the user exists
        const promise = fetch("/api/admin/user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userID }),
        }).then(async (response) => {
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "User not found.");
            }

            // User exists, now add them as admin
            const updateResponse = await fetch("/api/admin/settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    key: "adminIDs",
                    value: [...currentAdmins, userID],
                }),
            });

            const updateResult = await updateResponse.json();

            if (!updateResponse.ok) {
                throw new Error(updateResult.error || "Failed to add admin.");
            }

            adminUserInput = "";
            invalidateAll();
            return updateResult;
        });

        toast.promise(promise, {
            loading: "Adding admin...",
            success: "Admin added successfully!",
            error: (error) => (error instanceof Error ? error.message : "An unexpected error occurred."),
        });
    }

    async function removeAdmin(userID: string) {
        const currentAdmins = data.settings?.adminIDs || [];
        const updatedAdmins = currentAdmins.filter((id: string) => id !== userID);

        if (updatedAdmins.length === currentAdmins.length) {
            toast.error("User is not an admin.");
            return;
        }

        // Don't allow removing yourself
        if (userID === data.user?.id) {
            toast.error("You cannot remove yourself as an admin.");
            return;
        }

        const promise = fetch("/api/admin/settings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                key: "adminIDs",
                value: updatedAdmins,
            }),
        }).then(async (response) => {
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to remove admin.");
            }

            invalidateAll();
            return result;
        });

        toast.promise(promise, {
            loading: "Removing admin...",
            success: "Admin removed successfully!",
            error: (error) => (error instanceof Error ? error.message : "An unexpected error occurred."),
        });
    }

    async function addSpecialPkg() {
        const pkgID = Number(selectedPkgID);
        if (!pkgID || isNaN(pkgID)) {
            toast.error("Please select a valid package.");
            return;
        }
        if (specialPkgIDs.includes(pkgID)) {
            toast.error("Package already added.");
            return;
        }
        const newIDs = [...specialPkgIDs, pkgID];
        const promise = fetch("/api/admin/settings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                key: "specialPkgIDs",
                value: newIDs,
            }),
        }).then(async (response) => {
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || "Failed to add special package.");
            }
            selectedPkgID = "";
            invalidateAll();
            return result;
        });
        toast.promise(promise, {
            loading: "Adding special package...",
            success: "Special package added!",
            error: (error) => (error instanceof Error ? error.message : "An unexpected error occurred."),
        });
    }

    async function removeSpecialPkg(pkgID: number) {
        if (!specialPkgIDs.includes(pkgID)) {
            toast.error("Package not in special list.");
            return;
        }
        const newIDs = specialPkgIDs.filter((id) => id !== pkgID);
        const promise = fetch("/api/admin/settings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                key: "specialPkgIDs",
                value: newIDs,
            }),
        }).then(async (response) => {
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || "Failed to remove special package.");
            }
            invalidateAll();
            return result;
        });
        toast.promise(promise, {
            loading: "Removing special package...",
            success: "Special package removed!",
            error: (error) => (error instanceof Error ? error.message : "An unexpected error occurred."),
        });
    }
</script>

<Seo title={data.user?.global_name || data.user?.username} />

<div class="size-full overflow-y-auto p-2 md:overflow-hidden">
    <div
        class="p-base grid size-full grid-cols-1 grid-rows-[auto_1fr] gap-5 overflow-x-hidden border-2
               border-neutral-700 bg-neutral-800
               md:h-full md:grid-cols-[1fr_300px] md:grid-rows-[auto_1fr]"
    >
        <!-- Info section - appears first on mobile, second on desktop -->
        <div class="order-1 flex flex-col items-start justify-between gap-5 md:order-2 md:h-full">
            <div class="flex w-full flex-col gap-5">
                <PixelatedImage class="w-full bg-neutral-700" src={getUserAvatar(data.user?.id, data.user?.avatar)} alt="Profile Picture" />
                <div class="border-2 border-neutral-700 bg-neutral-900 p-4">
                    <h3 class="font-minecrafter mb-2 text-lg">Account Info</h3>
                    <div class="flex flex-col gap-2 text-left">
                        <div class="flex items-center gap-2">
                            <img src="/icons/discord.webp" alt="Discord" class="h-6" />
                            <div>
                                <p class="text-xs text-neutral-400">Discord Name</p>
                                <p class="font-bold text-yellow-400">{data.user?.global_name || data.user?.username}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <img src="/icons/info.webp" alt="Info" class="h-6" />
                            <div>
                                <p class="text-xs text-neutral-400">Discord ID</p>
                                <p class="font-bold text-yellow-400">{data.user?.id}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <Button iconName="error" {loading} onclick={logout}>Logout</Button>
            </div>
        </div>

        <!-- Main content section - appears second on mobile, first on desktop -->
        <div class="order-2 md:order-1 md:h-full md:overflow-y-auto">
            <div class="flex flex-col gap-5">
                {#if data.isAdmin}
                    <div class="flex flex-col gap-2">
                        <h2 class="font-minecrafter text-2xl">Admin Settings</h2>

                        <!-- Server Settings -->
                        <div class="border-2 border-neutral-700 bg-neutral-900 p-4">
                            <h3 class="font-minecrafter mb-2 text-lg">Minecraft Server</h3>
                            <div class="flex flex-col gap-2 text-left">
                                <div class="flex items-center gap-2">
                                    <img src="/icons/mc_java.webp" alt="Java" class="h-6" />
                                    <div>
                                        <p class="text-xs text-neutral-400">Java Edition</p>
                                        <p class="font-bold text-yellow-400">
                                            {data.settings?.minecraftJavaIP || "0.0.0.0"}
                                        </p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <img src="/icons/mc_bedrock.webp" alt="Bedrock" class="h-6" />
                                    <div>
                                        <p class="text-xs text-neutral-400">Bedrock Edition</p>
                                        <p class="font-bold text-yellow-400">
                                            {data.settings?.minecraftBedrockIP || "0.0.0.0"}
                                            :
                                            {data.settings?.minecraftBedrockPort || "19132"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Popup title="MC Server Settings">
                            {#snippet trigger()}
                                <Button>Update Server Settings</Button>
                            {/snippet}
                            <div class="flex w-full flex-col gap-2">
                                <div class="flex items-center justify-start gap-2">
                                    <img src="/icons/mc_java.webp" alt="Java" class="h-6" />
                                    <p class="text-xs text-neutral-200">Java Edition</p>
                                </div>
                                <Input bind:value={javaServerIP} placeholder="Enter Java server IP (e.g., play.example.com)" />
                                <div class="flex items-center justify-start gap-2">
                                    <img src="/icons/mc_bedrock.webp" alt="Bedrock" class="h-6" />
                                    <p class="text-xs text-neutral-200">Bedrock Edition</p>
                                </div>
                                <Input bind:value={bedrockServerIP} placeholder="Enter Bedrock server IP (e.g., play.example.com)" />
                                <Input bind:value={bedrockServerPort} placeholder="Enter Bedrock port (default: 19132)" />
                                <Button onclick={updateServerSettings}>Update Server Settings</Button>
                            </div>
                        </Popup>

                        <!-- Special Packages Settings -->
                        <div class="border-2 border-neutral-700 bg-neutral-900 p-4">
                            <h3 class="font-minecrafter mb-2 text-lg">Special Packages</h3>
                            <div class="flex flex-col gap-2">
                                {#each specialPkgs as pkg (pkg.id)}
                                    <div class="flex items-center justify-between gap-2 border-2 border-neutral-700 bg-neutral-800 p-2">
                                        <span>{pkg.name}</span>
                                        <Button iconName="error" size="sm" onclick={() => removeSpecialPkg(pkg.id)} />
                                    </div>
                                {/each}
                                {#if specialPkgs.length === 0}
                                    <span class="text-xs text-neutral-400">No special packages set.</span>
                                {/if}
                            </div>
                        </div>

                        <Popup title="Add Special Package">
                            {#snippet trigger()}
                                <Button>Add Special Package</Button>
                            {/snippet}
                            <div class="flex w-full flex-col gap-2">
                                <Select
                                    value={selectedPkgID}
                                    items={data.pkgs
                                        .filter((pkg) => !specialPkgIDs.includes(pkg.id))
                                        .map((pkg) => ({
                                            value: String(pkg.id),
                                            label: pkg.name,
                                        }))}
                                    onValueChange={(v) => (selectedPkgID = v)}
                                />
                                <Button onclick={addSpecialPkg}>Add</Button>
                            </div>
                        </Popup>

                        <!-- Discord Settings -->
                        <div class="border-2 border-neutral-700 bg-neutral-900 p-4">
                            <h3 class="font-minecrafter mb-2 text-lg">Discord Server</h3>
                            <div class="flex flex-col gap-2 text-left">
                                <div class="flex items-center gap-2">
                                    <img src="/icons/discord.webp" alt="Discord" class="h-6" />
                                    <div>
                                        <p class="text-xs text-neutral-400">Discord Invite</p>
                                        <p class="font-bold text-yellow-400">{data.settings?.guildInvite || "Not set"}</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <img src="/icons/info.webp" alt="Discord" class="h-6" />
                                    <div>
                                        <p class="text-xs text-neutral-400">Discord Guild ID</p>
                                        <p class="font-bold text-yellow-400">{data.settings?.guildId || "Not set"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Popup title="Discord Settings">
                            {#snippet trigger()}
                                <Button>Update Discord Settings</Button>
                            {/snippet}
                            <div class="flex w-full flex-col gap-2">
                                <Input bind:value={discordInvite} placeholder="Enter Discord invite URL" onEnter={updateDiscordSettings} />
                                <Input bind:value={discordID} placeholder="Enter Discord Guild ID" onEnter={updateDiscordSettings} />
                                <Button onclick={updateDiscordSettings}>Update Discord Settings</Button>
                            </div>
                        </Popup>

                        <!-- Admin Management -->
                        <div class="border-2 border-neutral-700 bg-neutral-900 p-4">
                            <h3 class="font-minecrafter mb-2 text-lg">Admin Management</h3>
                            <div class="flex flex-col gap-2 text-left">
                                <div class="flex items-center gap-2">
                                    <img src="/icons/cmd_block.webp" alt="Admin Count" class="h-6" />
                                    <div>
                                        <p class="text-xs text-neutral-400">Total Admins</p>
                                        <p class="font-bold text-yellow-400">{data.settings?.adminIDs?.length || 0}</p>
                                    </div>
                                </div>

                                <div class="mt-2 flex flex-col gap-2">
                                    {#if data.adminsPromises}
                                        <p class="text-xs text-neutral-400">Current Admins</p>
                                        {#each data.adminsPromises as adminPromise, index (index)}
                                            {#await adminPromise}
                                                <div class="flex items-center justify-between gap-2 border-2 border-neutral-700 bg-neutral-800 p-2">
                                                    <div class="flex items-center gap-2">
                                                        <div class="h-8 w-8 animate-pulse bg-neutral-700"></div>
                                                        <div class="flex flex-col gap-1">
                                                            <div class="h-4 w-24 animate-pulse bg-neutral-700"></div>
                                                            <div class="h-3 w-32 animate-pulse bg-neutral-700"></div>
                                                        </div>
                                                    </div>
                                                    <div class="size-8 animate-pulse bg-neutral-700"></div>
                                                </div>
                                            {:then admin}
                                                {#if admin}
                                                    <div
                                                        class="flex items-center justify-between gap-2 border-2 border-neutral-700 bg-neutral-800 p-2"
                                                    >
                                                        <div class="flex items-center gap-2">
                                                            <PixelatedImage
                                                                class="h-8 w-8 bg-neutral-700"
                                                                src={getUserAvatar(admin.id, admin.avatar)}
                                                                alt="Admin Avatar"
                                                            />
                                                            <div>
                                                                <p class="text-sm font-bold text-white">
                                                                    {admin?.global_name || admin.username}
                                                                </p>
                                                                <p class="text-xs text-neutral-400">{admin.id}</p>
                                                            </div>
                                                        </div>
                                                        {#if admin.id !== data.user?.id}
                                                            <Button iconName="error" onclick={() => removeAdmin(admin.id)} size="sm" />
                                                        {:else}
                                                            <span class="text-xs text-yellow-400">You</span>
                                                        {/if}
                                                    </div>
                                                {/if}
                                            {:catch error}
                                                <div class="flex items-center justify-start gap-2 border-2 border-neutral-700 bg-neutral-800 p-2">
                                                    <img src="/icons/error.webp" alt="Error" class="h-6" />
                                                    <p class="text-xs text-red-400">Failed to load admin</p>
                                                </div>
                                            {/await}
                                        {/each}
                                    {/if}
                                </div>
                            </div>
                        </div>

                        <Popup title="Add Admin">
                            {#snippet trigger()}
                                <Button>Add Admin</Button>
                            {/snippet}
                            <div class="flex w-full flex-col gap-2">
                                <Input bind:value={adminUserInput} placeholder="Enter Discord User ID" onEnter={addAdmin} />
                                <Button onclick={addAdmin}>Add Admin</Button>
                            </div>
                        </Popup>
                    </div>
                {:else}
                    <div class="flex size-full items-center justify-center p-10">
                        <p class="text-2xl">Welcome {data.user?.global_name || data.user?.username}!</p>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>
