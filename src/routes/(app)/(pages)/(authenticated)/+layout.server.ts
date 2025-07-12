import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, url }) => {
    const user = locals.user;
    if (!user) {
        redirect(303, "/");
    }
};
