import { fetchUser } from "$lib/db/funcs.js";
import * as schema from "$lib/db/schema";
import { json } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export const POST = async ({ locals, request }) => {
    const user = locals.user;
    if (!user) {
        return json({ error: "Unauthorized" }, { status: 401 });
    }
    const userData = await fetchUser(locals.db, user.id);

    const body = await request.json();
    const status: "set" | "unset" = body.status;

    if (status === "set") {
        const name: string | null = body.name || null;
        if (!name) {
            return json({ error: "Name not provided" }, { status: 400 });
        }

        if (userData?.minecraftName === name) {
            return json({ success: true }, { status: 200 });
        } else {
            const info = await getNameInfo(name);
            if (!info) {
                return json({ error: "Invalid name" }, { status: 400 });
            }
            await locals.db
                .update(schema.userTable)
                .set({
                    minecraftID: info.id,
                    minecraftName: info.name,
                })
                .where(eq(schema.userTable.userID, user.id));
            return json({ success: true }, { status: 200 });
        }
    } else if (status === "unset") {
        await locals.db
            .update(schema.userTable)
            .set({
                minecraftID: null,
                minecraftName: null,
            })
            .where(eq(schema.userTable.userID, user.id));
        return json({ success: true }, { status: 200 });
    } else {
        return json({ error: "Invalid status" }, { status: 400 });
    }
};

async function getNameInfo(name: string) {
    name = encodeURIComponent(name.trim());
    const resp = await fetch(`https://crafty.gg/players/${name}.json`);
    if (resp.ok) {
        const data = await resp.json();
        return { id: data.id, name: data.username };
    } else {
        return null;
    }
}
