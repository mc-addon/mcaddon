import { DISCORD_BOT_TOKEN } from "$env/static/private";
import { PUBLIC_DISCORD_URL } from "$env/static/public";
import * as schema from "$lib/db/schema";
import { getGuildData, isAdmin } from "$lib/discord/user";
import { json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

async function validateSettingValue(key: schema.SettingsKeys, value: any): Promise<string | null> {
    switch (key) {
        case "adminIDs":
            if (!Array.isArray(value) || !value.every((id) => typeof id === "string")) {
                return "Admin IDs must be an array of strings";
            }
            break;
        case "guildId":
            if (typeof value !== "string") {
                return "Guild ID must be a string";
            }
            if (value) {
                const guildData = await getGuildData(PUBLIC_DISCORD_URL, DISCORD_BOT_TOKEN, value);
                if ("error" in guildData) {
                    return "Invalid Discord Guild ID";
                }
            }
            break;
        case "guildInvite":
            if (typeof value !== "string") {
                return "Guild invite must be a string";
            }
            break;
        case "minecraftJavaIP":
            if (typeof value !== "string") {
                return "Minecraft Java IP must be a string";
            }
            break;
        case "minecraftBedrockIP":
            if (typeof value !== "string") {
                return "Minecraft Bedrock IP must be a string";
            }
            break;
        case "minecraftBedrockPort":
            if (typeof value !== "number" || value < 1 || value > 65535) {
                return "Minecraft Bedrock port must be a number between 1 and 65535";
            }
            break;
        case "specialPkgIDs":
            if (!Array.isArray(value) || !value.every((id) => typeof id === "number")) {
                return "Special package IDs must be an array of numbers";
            }
            break;
        default:
            return "Unknown setting key";
    }
    return null;
}
export const POST = async ({ locals, request }) => {
    const user = locals.user;
    if (!user) {
        return json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdminUser = await isAdmin(locals.db, user.id);
    if (!isAdminUser) {
        return json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
        return json({ error: "Key and value are required" }, { status: 400 });
    }

    // Validate the value based on the key type from SettingsMap
    const validationError = await validateSettingValue(key, value);
    if (validationError) {
        return json({ error: validationError }, { status: 400 });
    }

    try {
        await locals.db
            .update(schema.settingsTable)
            .set({ [key]: value })
            .where(eq(schema.settingsTable.id, 1));

        return json({ success: true });
    } catch (error) {
        console.error("Error updating settings:", error);
        return json({ error: "Failed to update settings" }, { status: 500 });
    }
};
