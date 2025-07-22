export interface JavaUserInfo {
    username: string;
    uuid: string;
    skin: string;
    cape: string | null;
    linked: boolean;
    bedrock_gamertag?: string;
    bedrock_xuid?: string;
    bedrock_fuid?: string;
    type: "java";
}

export interface BedrockUserInfo {
    username: string;
    xuid: string;
    floodgateuid: string;
    icon: string;
    gamescore: number;
    accounttier: string;
    textureid: string;
    skin: string;
    linked: boolean;
    java_uuid?: string;
    java_name?: string;
    type: "bedrock";
}

export type MinecraftUserInfo = JavaUserInfo | BedrockUserInfo;
