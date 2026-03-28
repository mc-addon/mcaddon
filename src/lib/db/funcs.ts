import { eq } from "drizzle-orm";
import type { DB } from ".";
import * as schema from "./schema";

export async function fetchSettings<K extends schema.SettingsKeys>(db: DB, setting: K): Promise<schema.SelectSettings[K] | null>;
export async function fetchSettings(db: DB): Promise<schema.SelectSettings | null>;
export async function fetchSettings<K extends schema.SettingsKeys>(
    db: DB,
    setting?: K,
): Promise<schema.SelectSettings | schema.SelectSettings[K] | null> {
    // The settings table is expected to have a single row with id = 1.
    const result = await db.query.settingsTable.findFirst({ where: eq(schema.settingsTable.id, 1) });

    if (!result) {
        return null;
    }

    if (setting !== undefined) {
        return result[setting] ?? null;
    }

    return result;
}
