import { fetchSettings } from "$lib/db/funcs";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    const settings = await fetchSettings(locals.db);
    return {
        server: {
            ip: settings.minecraftServer?.ip,
            javaPort: settings.minecraftServer?.javaPort,
            bedrockPort: settings.minecraftServer?.bedrockPort,
        },
    };
};
