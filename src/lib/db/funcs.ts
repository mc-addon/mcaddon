import { eq } from "drizzle-orm";
import type { DB } from ".";
import * as schema from "./schema";

export async function fetchSettings<K extends keyof schema.SettingsMap>(db: DB, setting: K): Promise<schema.SettingsMap[K] | null>;
export async function fetchSettings(db: DB): Promise<Partial<schema.SettingsMap>>;
export async function fetchSettings<K extends keyof schema.SettingsMap>(
    db: DB,
    setting?: K,
): Promise<schema.SettingsMap[K] | null | Partial<schema.SettingsMap>> {
    if (setting !== undefined) {
        return db.query.settingsTable
            .findFirst({
                where: eq(schema.settingsTable.key, setting),
            })
            .then((result) => result?.value as schema.SettingsMap[K] | null);
    }

    const allSettings = await db.query.settingsTable.findMany();
    const settingsObject = {} as Partial<schema.SettingsMap>;

    for (const setting of allSettings) {
        (settingsObject as Record<string, unknown>)[setting.key] = setting.value;
    }

    return settingsObject;
}
