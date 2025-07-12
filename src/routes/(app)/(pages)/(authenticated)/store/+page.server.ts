import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    return {
        categories: locals.tebex.getCategories(true),
    };
};
