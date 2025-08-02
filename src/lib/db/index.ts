import { dev } from "$app/environment";
import { DATABASE_URL } from "$env/static/private";
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export const connectPGDatabase = () => {
    if (!DATABASE_URL) {
        throw new Error("DATABASE_URL is not defined. Please set it in your environment variables.");
    }
    const client = postgres(DATABASE_URL!);
    return drizzle(client, { schema, logger: dev });
};

export type DB = PostgresJsDatabase<typeof schema> & {
    $client: postgres.Sql<{}>;
};
