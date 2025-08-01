import { toast } from "svelte-sonner";

export async function setMC(username: string, type: "java" | "bedrock") {
    const promise = fetch("/api/minecraft", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            action: "set",
            type,
            username,
        }),
    }).then(async (resp) => {
        const data = await resp.json();
        if (!data.success) {
            throw new Error(data.error || "Failed to set Minecraft name");
        }
    });

    toast.promise(promise, {
        loading: `Setting Minecraft ${type} account...`,
        success: `Minecraft ${type} account successfully set to ${username}!`,
        error: (err) => {
            if (err instanceof Error) {
                return err.message;
            }
            return "Failed to set Minecraft account";
        },
    });

    return promise;
}

export async function unsetMC() {
    const promise = fetch("/api/minecraft", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            action: "unset",
        }),
    }).then(async (resp) => {
        const data = await resp.json();
        if (!data.success) {
            throw new Error(data.error || "Failed to unset Minecraft name");
        }
    });
    toast.promise(promise, {
        loading: "Unsetting Minecraft account...",
        success: "Minecraft account successfully unset!",
        error: (err) => {
            if (err instanceof Error) {
                return err.message;
            }
            return "Failed to unset Minecraft account";
        },
    });
    return promise;
}
