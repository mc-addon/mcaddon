import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params }) => {
    const id = Number(params.id);
    if (!id) {
        redirect(308, "/store");
    } else {
        try {
            const pkg = await locals.tebex.getPackage(id);
            return { pkg };
        } catch (e) {
            console.error("Error fetching package:", e);
            throw error(404, "Package not found");
        }
    }
};
