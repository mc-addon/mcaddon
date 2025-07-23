import type { MinecraftUserInfo } from "$lib/minecraft/types";
import { jsonb, pgTable, serial, text } from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
    id: serial("id").primaryKey(),
    userID: text("user_id").notNull().unique(),
    minecraft: jsonb("minecraft").$type<MinecraftUserInfo | null>().default(null),
    basketIdent: text("basket_ident").unique(),
});

export interface SettingsMap {
    adminIDs: string[];
    minecraftServer: {
        java: {
            ip: string;
            port: number;
        };
        bedrock: {
            ip: string;
            port: number;
        };
    };
    discordServer: string;
}
// NOTE: If you are adding new settings, ensure to update the SettingsMap interface accordingly
// Also update the validation logic in the API handler in /api/admin/settings

export const settingsTable = pgTable("settings", {
    key: text("key").$type<keyof SettingsMap>().primaryKey(),
    value: jsonb("value").$type<SettingsMap[keyof SettingsMap]>().notNull(),
});
