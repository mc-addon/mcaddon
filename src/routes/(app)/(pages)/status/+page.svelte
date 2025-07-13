<script lang="ts">
    import Button from "$lib/components/ui/Button.svelte";
    import Select from "$lib/components/ui/Select.svelte";
    import Seo from "$lib/components/ui/Seo.svelte";
    import Toggle from "$lib/components/ui/Toggle.svelte";
    import { getRelativeTime } from "$lib/utils/time";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    type PingStatus = "checking" | "good" | "medium" | "bad" | "offline";

    interface ServerData {
        ip?: string;
        port?: string;
        online: boolean;
        players?: {
            online: number;
            max: number;
            list?: string[];
        };
        version?: string;
        motd?: {
            html: string[];
        };
    }

    interface ServerInfo {
        name: string;
        status: PingStatus;
        responseTime: number | null;
        data: ServerData | null;
        port: number;
        available: boolean;
    }

    let javaPingStatus: PingStatus = $state("checking");
    let bedrockPingStatus: PingStatus = $state("checking");
    let javaResponseTime: number | null = $state(null);
    let bedrockResponseTime: number | null = $state(null);
    let javaServerData: ServerData | null = $state(null);
    let bedrockServerData: ServerData | null = $state(null);
    let intervalId: NodeJS.Timeout | null = $state(null);
    let lastUpdated: Date | null = $state(null);
    let refreshInterval = $state(30000); // 30 seconds
    let refreshDisabled = $state(false);
    let autoUpdateEnabled = $state(true);

    $effect(() => {
        cooldownRefresh();
        if (autoUpdateEnabled) {
            startPinging();
        } else {
            stopPinging();
        }
    });

    const intervalOptions = [
        { value: "5000", label: "5s" },
        { value: "10000", label: "10s" },
        { value: "30000", label: "30s" },
        { value: "60000", label: "1min" },
        { value: "300000", label: "5mins" },
    ];

    async function ping(isBedrock: boolean) {
        const statusSetter = (s: PingStatus) => {
            if (isBedrock) {
                bedrockPingStatus = s;
            } else {
                javaPingStatus = s;
            }
        };

        const timeSetter = (t: number | null) => {
            if (isBedrock) {
                bedrockResponseTime = t;
            } else {
                javaResponseTime = t;
            }
        };

        const dataSetter = (d: ServerData | null) => {
            if (isBedrock) {
                bedrockServerData = d;
            } else {
                javaServerData = d;
            }
        };

        // Check if the server IP and port are set
        if (!data.server?.ip || (!isBedrock && !data.server?.javaPort) || (isBedrock && !data.server?.bedrockPort)) {
            statusSetter("offline");
            timeSetter(null);
            dataSetter(null);
            return;
        }

        statusSetter("checking");
        const start = Date.now();

        try {
            const controller = new AbortController();
            setTimeout(() => controller.abort(), 15000);

            const port = isBedrock ? data.server?.bedrockPort : data.server?.javaPort;
            const url = isBedrock
                ? `https://api.mcsrvstat.us/bedrock/3/${data.server?.ip}:${port}`
                : `https://api.mcsrvstat.us/3/${data.server?.ip}:${port}`;

            const response = await fetch(url, { signal: controller.signal });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const serverData = await response.json();
            const time = Date.now() - start;

            if (serverData.online) {
                timeSetter(time);
                statusSetter(time < 150 ? "good" : time < 500 ? "medium" : "bad");
                dataSetter(serverData);
            } else {
                statusSetter("offline");
                timeSetter(null);
                dataSetter(null);
            }

            lastUpdated = new Date();
        } catch {
            statusSetter("offline");
            timeSetter(null);
            dataSetter(null);
        }
    }

    function startPinging() {
        ping(false); // Java
        ping(true); // Bedrock
        intervalId = setInterval(() => {
            ping(false);
            ping(true);
        }, refreshInterval);
    }

    function stopPinging() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    function handleIntervalChange(newInterval: string) {
        refreshInterval = parseInt(newInterval);
        if (autoUpdateEnabled) {
            startPinging();
        }
    }

    function cooldownRefresh() {
        refreshDisabled = true;
        setTimeout(() => {
            refreshDisabled = false;
        }, 1000); // 1 second cooldown
    }

    function manualRefresh() {
        cooldownRefresh();
        ping(false);
        ping(true);
    }

    onMount(() => {
        startPinging();
        return () => {
            stopPinging();
        };
    });

    const getStatusColor = (status: PingStatus) =>
        ({
            good: "text-green-400",
            medium: "text-yellow-400",
            bad: "text-orange-400",
            offline: "text-red-400",
            checking: "text-neutral-400",
        })[status];

    const getIcon = (status: PingStatus) => (status === "checking" ? "○" : "●");

    const getText = (status: PingStatus) =>
        ({
            good: "Excellent",
            medium: "Good",
            bad: "Poor",
            offline: "Offline",
            checking: "Checking...",
        })[status];

    const servers = $derived<ServerInfo[]>([
        {
            name: "Java Edition",
            status: javaPingStatus,
            responseTime: javaResponseTime,
            data: javaServerData,
            port: data.server?.javaPort || 25565, // Default port if settings are null
            available: !!data.server?.ip && !!data.server?.javaPort,
        },
        {
            name: "Bedrock Edition",
            status: bedrockPingStatus,
            responseTime: bedrockResponseTime,
            data: bedrockServerData,
            port: data.server?.bedrockPort || 19132, // Default port if settings are null
            available: !!data.server?.ip && !!data.server?.bedrockPort,
        },
    ]);
</script>

<Seo
    title="Server Status"
    description="
Java Server: {data.server?.ip}:{servers[0].port}
Bedrock Server: {data.server?.ip}:{servers[1].port}
"
/>

<div class="p-base flex flex-1 flex-col gap-2 overflow-x-hidden overflow-y-auto md:gap-5">
    <!-- Server Status Cards -->
    <div class="grid grid-cols-1 gap-2 md:gap-5 lg:grid-cols-2">
        {#each servers as server (server.name)}
            <div class="flex flex-col gap-2 border-2 border-neutral-700 bg-neutral-800 p-4">
                <!-- Server Header -->
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <img src="/icons/{server.name === 'Java Edition' ? 'creeper_head' : 'bedrock'}.webp" alt="Server Icon" class="h-8" />
                        <h2 class="font-minecrafter text-xl">{server.name}</h2>
                    </div>
                    <div class="flex items-center gap-2 {getStatusColor(server.status)}">
                        {getIcon(server.status)}
                        <p>{getText(server.status)}</p>
                        {#if server.responseTime}
                            <span>({server.responseTime}ms)</span>
                        {/if}
                    </div>
                </div>

                <!-- Server Details -->
                {#if server.available}
                    <div class="flex flex-col gap-2 text-sm">
                        <button
                            class="flex cursor-copy justify-between"
                            onclick={() => {
                                const address = `${data.server?.ip}:${server.port}`;
                                navigator.clipboard
                                    .writeText(address)
                                    .then(() => {
                                        toast.success(`Copied address`);
                                    })
                                    .catch((err) => {
                                        console.error("Failed to copy: ", err);
                                    });
                            }}
                        >
                            <span class="text-neutral-200">Address:</span>
                            <span class="font-mono text-yellow-400">{data.server?.ip}:{server.port}</span>
                        </button>

                        {#if server.data}
                            <!-- Player Information -->
                            {#if server.data.players}
                                <div class="flex justify-between">
                                    <span class="text-neutral-200">Players Online:</span>
                                    <span class="text-yellow-400">
                                        {server.data.players.online}/{server.data.players.max}
                                    </span>
                                </div>
                            {/if}

                            <!-- Version Information -->
                            {#if server.data.version}
                                <div class="flex justify-between">
                                    <span class="text-neutral-200">Version:</span>
                                    <span class="text-yellow-400">{server.data.version}</span>
                                </div>
                            {/if}

                            <!-- MOTD -->
                            {#if server.data.motd?.html?.length}
                                <div class="mt-2">
                                    <span class="text-neutral-200">Message of the Day [MOTD]:</span>
                                    <div class="mt-1 border-2 border-neutral-700 bg-neutral-900 p-2">
                                        {#each server.data.motd.html as line}
                                            <p class="text-xs">{@html line}</p>
                                        {/each}
                                    </div>
                                </div>
                            {/if}

                            <!-- Player List (if available and not too many) -->
                            {#if server.data.players?.list && server.data.players.list.length > 0 && server.data.players.list.length <= 10}
                                <div class="mt-2">
                                    <span class="text-neutral-200">Online Players:</span>
                                    <div class="mt-1 flex flex-wrap gap-1">
                                        {#each server.data.players.list as player}
                                            <span class="bg-neutral-700 px-2 py-1 text-xs text-neutral-400">
                                                {player}
                                            </span>
                                        {/each}
                                    </div>
                                </div>
                            {/if}
                        {/if}
                    </div>
                {:else}
                    <div class="flex items-center justify-center py-4">
                        <span class="text-neutral-400">Server not configured</span>
                    </div>
                {/if}
            </div>
        {/each}
    </div>

    <!-- Panel -->
    <section class="flex flex-col gap-2 border-2 border-neutral-700 bg-neutral-800 p-4">
        <header class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
                <img src="/icons/cmd_block.webp" alt="Panel Icon" class="h-8" />
                <span class="font-minecrafter text-xl">Panel</span>
            </div>
            <span class="flex items-center gap-1 text-xs text-neutral-400">
                {#if lastUpdated}
                    <span>Last Updated:</span>
                    <span class="text-yellow-400">{getRelativeTime(lastUpdated)}</span>
                {/if}
            </span>
        </header>
        <div class="flex flex-col gap-2">
            <!-- Auto Update Toggle -->
            <div class="flex items-center gap-2">
                <span class="text-sm text-neutral-200">Auto Update:</span>
                <div class="flex items-center gap-1">
                    <Toggle bind:status={autoUpdateEnabled} disabled={refreshDisabled} />
                    <span class="text-sm {autoUpdateEnabled ? 'text-green-400' : 'text-red-400'} font-minecraftia">
                        {autoUpdateEnabled ? "Enabled" : "Disabled"}
                    </span>
                </div>
            </div>
            <!-- Interval Selector -->
            <div class="flex items-center gap-2">
                <span class="text-sm text-neutral-200">Interval:</span>
                <Select value={refreshInterval.toString()} items={intervalOptions} onValueChange={handleIntervalChange} disabled={refreshDisabled} />
            </div>
            <!-- Manual Controls -->
            <div class="flex flex-col gap-2 sm:flex-row sm:gap-5">
                <Button onclick={manualRefresh} disabled={refreshDisabled}>Refresh Now</Button>
            </div>
        </div>
    </section>
</div>
