// See https://svelte.dev/docs/kit/types#app.d.ts

import type { DB } from "$lib/db";
import type { MinecraftUserInfo } from "$lib/minecraft/types";
import type { APIUser } from "discord-api-types/v10";
import type { TebexHeadless } from "tebex_headless";

// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            db: DB;
            mc: MinecraftUserInfo | null;
            user: APIUser | null;
            tebex: TebexHeadless;
        }
        // interface PageState {}
        // interface Platform {}
    }
}

export {};
