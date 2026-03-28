import { fetchSettings } from "$lib/db/funcs";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    const settings = await fetchSettings(locals.db);
    return {
        javaIP: settings?.minecraftJavaIP || "",
        bedrockIP: settings?.minecraftBedrockIP || "",
        bedrockPort: settings?.minecraftBedrockPort || 19132,
    };
};
