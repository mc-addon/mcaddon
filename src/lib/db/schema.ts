import { jsonb, pgTable, text } from "drizzle-orm/pg-core";

export interface SettingsMap {
    adminIDs: string[];
    guild: {
        id: string;
        invite: string;
    };
    minecraftServer: {
        java: {
            ip: string;
        };
        bedrock: {
            ip: string;
            port: number;
        };
    };
    specialPkgIDs: number[];
    discordBot: {
        ipCommand: boolean;
        serverMaintenance: boolean;
    };
}
// NOTE: If you are adding new settings, ensure to update the SettingsMap interface accordingly
// Also update the validation logic in the API handler in /api/admin/settings

export const settingsTable = pgTable("settings", {
    key: text("key").$type<keyof SettingsMap>().primaryKey(),
    value: jsonb("value").$type<SettingsMap[keyof SettingsMap]>().notNull(),
});
