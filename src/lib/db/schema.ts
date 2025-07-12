import { jsonb, pgTable, serial, text, uuid } from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
    id: serial("id").primaryKey(),
    userID: text("user_id").notNull().unique(),
    minecraftName: text("minecraft_name"),
    minecraftID: uuid("minecraft_id"),
    basketIdent: text("basket_ident").unique(),
});

export interface SettingsMap {
    adminIDs: string[];
    minecraftServer: {
        ip: string;
        bedrockPort: number;
        javaPort: number;
    };
    discordServer: string;
}

export const settingsTable = pgTable("settings", {
    key: text("key").$type<keyof SettingsMap>().primaryKey(),
    value: jsonb("value").$type<SettingsMap[keyof SettingsMap]>().notNull(),
});
