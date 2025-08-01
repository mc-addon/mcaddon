import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
    const user = locals.user;
    const mc = locals.mc;
    return { user, mc };
};
