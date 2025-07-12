<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { getUserAvatar } from "$lib/discord/user";
    import { error } from "@sveltejs/kit";
    import type { APIUser } from "discord-api-types/v10";
    import Button from "./ui/Button.svelte";

    let { user }: { user: APIUser | null } = $props();
    let loginPopup: Window | null = null;

    function handleMessage(event: MessageEvent) {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === "LOGIN_SUCCESS") {
            if (loginPopup) {
                loginPopup.close();
                loginPopup = null;
            }
            invalidateAll();
        } else if (event.data.type === "LOGIN_ERROR") {
            console.error("Login error:", event.data.error);
            if (loginPopup) {
                loginPopup.close();
                loginPopup = null;
            }
            error(500, "Login failed: " + event.data.error);
        }
    }

    $effect(() => {
        window.addEventListener("message", handleMessage);
        return () => {
            window.removeEventListener("message", handleMessage);
            if (loginPopup && !loginPopup.closed) {
                loginPopup.close();
            }
        };
    });

    async function handleLogin() {
        try {
            const response = await fetch("/auth/login");
            const data = await response.json();
            if (data.url) {
                loginPopup = window.open(
                    data.url,
                    "discord-login",
                    "width=500,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no",
                );

                if (loginPopup) {
                    loginPopup.focus();
                }
            }
        } catch (err) {
            console.error("Login failed:", err);
        }
    }
</script>

<div class="flex w-full items-center justify-center">
    {#if user}
        <Button
            img={{
                src: getUserAvatar(user.id, user.avatar),
                alt: "User Avatar",
            }}
            href="/profile"
        >
            Profile
        </Button>
    {:else}
        <Button onclick={handleLogin} iconName="discord">Login</Button>
    {/if}
</div>
