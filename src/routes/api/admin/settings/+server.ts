import { DISCORD_BOT_TOKEN } from "$env/static/private";
import { PUBLIC_DISCORD_URL } from "$env/static/public";
import * as schema from "$lib/db/schema";
import { getGuildData, isAdmin } from "$lib/discord/user";
import { json } from "@sveltejs/kit";

async function validateSettingValue(key: keyof schema.SettingsMap, value: any): Promise<string | null> {
    switch (key) {
        case "adminIDs":
            if (!Array.isArray(value) || !value.every((id) => typeof id === "string")) {
                return "Admin IDs must be an array of strings";
            }
            break;
        case "minecraftServer":
            if (
                typeof value !== "object" ||
                typeof value.java !== "object" ||
                typeof value.bedrock !== "object" ||
                typeof value.java.ip !== "string" ||
                typeof value.bedrock.ip !== "string" ||
                typeof value.bedrock.port !== "number"
            ) {
                return "Invalid server configuration: must have java and bedrock objects with ip (string) and port (number)";
            }
            if (value.bedrock.port < 1 || value.bedrock.port > 65535) {
                return "Bedrock port must be between 1 and 65535";
            }
            break;
        case "guild":
            if (typeof value !== "object" || typeof value.id !== "string" || typeof value.invite !== "string") {
                return "Guild must be an object with id (string) and invite (string)";
            }
            if (!value.id || !value.invite) {
                return "Guild id and invite cannot be empty";
            }
            if (value.id) {
                const guildData = await getGuildData(PUBLIC_DISCORD_URL, DISCORD_BOT_TOKEN, value.id);
                if ("error" in guildData) {
                    return "Invalid Discord Guild ID";
                }
            }
            break;
        case "specialPkgIDs":
            if (!Array.isArray(value) || !value.every((id) => typeof id === "number")) {
                return "Special package IDs must be an array of numbers";
            }
            break;
        case "discordBot":
            if (typeof value.ipCommand !== "boolean" || typeof value.serverMaintenance !== "boolean") {
                return "Discord bot settings must include ipCommand and serverMaintenance as booleans";
            }
            break;
        default:
            return "Unknown setting key";
    }
    return null;
}

// Get valid keys from SettingsMap interface
// NOTE: When adding new settings to SettingsMap, update this array and add validation in validateSettingValue
function getValidSettingKeys(): (keyof schema.SettingsMap)[] {
    return ["adminIDs", "minecraftServer", "guild", "specialPkgIDs", "discordBot"];
}

function isValidSettingKey(key: string): key is keyof schema.SettingsMap {
    return getValidSettingKeys().includes(key as keyof schema.SettingsMap);
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

    // Validate the key is a valid setting key by checking against SettingsMap
    if (!isValidSettingKey(key)) {
        return json({ error: "Invalid setting key" }, { status: 400 });
    }

    // Validate the value based on the key type from SettingsMap
    const validationError = await validateSettingValue(key, value);
    if (validationError) {
        return json({ error: validationError }, { status: 400 });
    }

    try {
        await locals.db.insert(schema.settingsTable).values({ key, value }).onConflictDoUpdate({
            target: schema.settingsTable.key,
            set: { value },
        });

        return json({ success: true });
    } catch (error) {
        console.error("Error updating settings:", error);
        return json({ error: "Failed to update settings" }, { status: 500 });
    }
};
