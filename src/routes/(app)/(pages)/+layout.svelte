<script lang="ts">
    import { page } from "$app/state";
    import Header from "$lib/components/Header.svelte";

    let { data, children } = $props();
    function getData(pathname: string): {
        title: string;
        backURL: string;
    } {
        // Profile page
        if (pathname.includes("profile")) {
            return {
                title: "profile",
                backURL: "/",
            };
        } else if (pathname.includes("store")) {
            // Item page
            if (pathname.split("/")[2]) {
                return {
                    title: "store",
                    backURL: "/store",
                };
            }
            // Store main page
            else {
                return {
                    title: "store",
                    backURL: "/",
                };
            }
        } else if (pathname.includes("status")) {
            // Status page
            return {
                title: "status",
                backURL: "/",
            };
        }
        // If not recognized
        return {
            title: "mcaddon",
            backURL: "/",
        };
    }
    let { title, backURL } = $derived(getData(page.url.pathname));
</script>

<div class="grid size-full grid-cols-1 grid-rows-[auto_1fr] overflow-hidden">
    <Header user={data.user} {title} {backURL} />
    {@render children()}
</div>
