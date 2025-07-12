<script lang="ts">
    import { onMount } from "svelte";

    interface Props {
        ip: string | undefined;
        javaPort?: number | undefined;
        bedrockPort?: number | undefined;
        refreshInterval?: number;
    }

    let { ip, javaPort = 25565, bedrockPort = 19132, refreshInterval = 5000 }: Props = $props();

    type PingStatus = "checking" | "good" | "medium" | "bad" | "offline";

    let javaPingStatus: PingStatus = $state("checking");
    let bedrockPingStatus: PingStatus = $state("checking");
    let javaResponseTime: number | null = $state(null);
    let bedrockResponseTime: number | null = $state(null);
    let intervalId: NodeJS.Timeout | null = $state(null);

    async function ping(isJava: boolean) {
        const statusSetter = isJava ? (s: PingStatus) => (javaPingStatus = s) : (s: PingStatus) => (bedrockPingStatus = s);
        const timeSetter = isJava ? (t: number | null) => (javaResponseTime = t) : (t: number | null) => (bedrockResponseTime = t);

        if (!ip || (!isJava && !bedrockPort)) {
            statusSetter("offline");
            timeSetter(null);
            return;
        }

        statusSetter("checking");
        const start = Date.now();

        try {
            const controller = new AbortController();
            setTimeout(() => controller.abort(), 10000);

            const url = isJava ? `https://api.mcsrvstat.us/3/${ip}` : `https://api.mcsrvstat.us/bedrock/3/${ip}:${bedrockPort}`;

            const response = await fetch(url, { signal: controller.signal });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            const time = Date.now() - start;

            if (data.online) {
                timeSetter(time);
                statusSetter(time < 150 ? "good" : time < 500 ? "medium" : "bad");
            } else {
                statusSetter("offline");
                timeSetter(null);
            }
        } catch {
            statusSetter("offline");
            timeSetter(null);
        }
    }

    function startPinging() {
        ping(true);
        ping(false);
        intervalId = setInterval(() => {
            ping(true);
            ping(false);
        }, refreshInterval);
    }

    onMount(() => {
        startPinging();
        return () => intervalId && clearInterval(intervalId);
    });

    const getColor = (status: PingStatus) =>
        ({
            good: "text-green-400",
            medium: "text-yellow-400",
            bad: "text-orange-400",
            offline: "text-red-400",
            checking: "text-gray-400",
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

    const servers = $derived([
        {
            status: javaPingStatus,
            time: javaResponseTime,
            name: "Java Edition",
            port: String(javaPort || 25565),
        },
        {
            status: bedrockPingStatus,
            time: bedrockResponseTime,
            name: "Bedrock Edition",
            port: String(bedrockPort || 19132),
        },
    ]);
</script>

<div class="flex flex-col gap-2 border-2 border-neutral-700 bg-neutral-800 p-2">
    {#each servers as server}
        <div class="flex items-center gap-2">
            <span class="text-lg {getColor(server.status)}">{getIcon(server.status)}</span>
            <div class="flex flex-col">
                <span class="text-sm font-semibold">{server.name}</span>
                <span class="text-xs">{ip}:{server.port}</span>
                <span class="text-xs {getColor(server.status)}">
                    {getText(server.status)}{server.time ? ` (${server.time}ms)` : ""}
                </span>
            </div>
        </div>
    {/each}
</div>
