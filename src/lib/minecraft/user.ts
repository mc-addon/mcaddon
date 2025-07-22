import { PUBLIC_MC_API } from "$env/static/public";
import type { BedrockUserInfo, JavaUserInfo, MinecraftUserInfo } from "./types";

export async function getJavaUser(username: string): Promise<JavaUserInfo | null> {
    const resp = await fetch(`${PUBLIC_MC_API}/java/username/${username}`);
    if (!resp.ok) {
        return null;
    }
    const data = await resp.json();
    data.type = "java";
    return data as JavaUserInfo;
}

export async function getBedrockUser(gamertag: string): Promise<BedrockUserInfo | null> {
    const resp = await fetch(`${PUBLIC_MC_API}/bedrock/gamertag/${gamertag}`);
    if (!resp.ok) {
        return null;
    }
    const data = await resp.json();
    data.type = "bedrock";
    data.username = data.gamertag; // Ensure compatibility with existing code
    delete data.gamertag; // Remove the gamertag field to avoid confusion
    return data as BedrockUserInfo;
}

export async function getUserInfo(username: string, type: "java" | "bedrock"): Promise<MinecraftUserInfo | null> {
    if (type === "java") {
        return await getJavaUser(username);
    } else if (type === "bedrock") {
        return await getBedrockUser(username);
    }
    return null;
}
