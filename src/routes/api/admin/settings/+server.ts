import * as schema from "$lib/db/schema";
import { isAdmin } from "$lib/discord/user";
import { json } from "@sveltejs/kit";

function validateSettingValue(key: keyof schema.SettingsMap, value: any): string | null {
    switch (key) {
        case "adminIDs":
            if (!Array.isArray(value) || !value.every((id) => typeof id === "string")) {
                return "Admin IDs must be an array of strings";
            }
            break;
        case "minecraftServer":
            if (typeof value !== "object" || !value.ip || typeof value.bedrockPort !== "number" || typeof value.javaPort !== "number") {
                return "Invalid server configuration - must have ip (string), bedrockPort (number), and javaPort (number)";
            }
            if (value.bedrockPort < 1 || value.bedrockPort > 65535) {
                return "Bedrock port must be between 1 and 65535";
            }
            if (value.javaPort < 1 || value.javaPort > 65535) {
                return "Java port must be between 1 and 65535";
            }
            break;
        case "discordServer":
            if (typeof value !== "string") {
                return "Discord server must be a string";
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
    return ["adminIDs", "minecraftServer", "discordServer"];
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
    const validationError = validateSettingValue(key, value);
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
