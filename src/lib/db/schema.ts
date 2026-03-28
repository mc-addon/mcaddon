import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";

export const settingsTable = pgTable("settings", {
    id: serial("id").primaryKey(), // Only one row expected
    adminIDs: text("admin_ids").array().notNull().default([]),
    guildId: text("guild_id"),
    guildInvite: text("guild_invite"),
    minecraftJavaIP: text("minecraft_java_ip"),
    minecraftBedrockIP: text("minecraft_bedrock_ip"),
    minecraftBedrockPort: integer("minecraft_bedrock_port"),
    specialPkgIDs: integer("special_pkg_ids").array().default([]),
});

export type InsertSettings = typeof settingsTable.$inferInsert;
export type SelectSettings = typeof settingsTable.$inferSelect;
export type SettingsKeys = keyof SelectSettings;
