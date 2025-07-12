import { readdir, writeFile } from "fs/promises";
import { join } from "path";

const STATIC_DIR = "./static";
const OUTPUT_FILE = "./static/assets.json";
const EXCLUDED_DIRS = ["fonts"]; // Exclude fonts directory

interface AssetsData {
    version: number;
    totalAssets: number;
    assets: string[];
}

/**
 * Recursively scan a directory and return all file paths
 */
async function scanDirectory(dir: string, basePath: string = ""): Promise<string[]> {
    const files: string[] = [];

    try {
        const entries = await readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            const relativePath = join(basePath, entry.name);

            if (entry.isDirectory()) {
                // Skip excluded directories
                if (EXCLUDED_DIRS.includes(entry.name)) {
                    console.log(`Skipping directory: ${entry.name}`);
                    continue;
                }

                // Recursively scan subdirectories
                const subFiles = await scanDirectory(fullPath, relativePath);
                files.push(...subFiles);
            } else if (entry.isFile()) {
                // Skip the assets.json file itself
                if (entry.name === "assets.json") {
                    continue;
                }

                // Convert to web path format
                const webPath = "/" + relativePath.replace(/\\/g, "/");
                files.push(webPath);
            }
        }
    } catch (error) {
        console.error(`Error scanning directory ${dir}:`, error);
    }

    return files;
}

/**
 * Main function to sync assets
 */
async function syncAssets(): Promise<void> {
    console.log("🔄 Syncing assets from static directory...");

    try {
        // Scan the static directory
        const assetPaths = await scanDirectory(STATIC_DIR);

        // Sort paths for consistent output
        assetPaths.sort();

        // Create the assets object
        const assetsData: AssetsData = {
            version: Date.now(), // Version timestamp for cache busting
            totalAssets: assetPaths.length,
            assets: assetPaths,
        };

        // Write to assets.json
        await writeFile(OUTPUT_FILE, JSON.stringify(assetsData, null, 4));

        console.log(`✅ Successfully synced ${assetPaths.length} assets to ${OUTPUT_FILE}`);
        console.log("📄 Assets included:");

        // Group by directory for better output
        const grouped: Record<string, string[]> = {};
        assetPaths.forEach((path) => {
            const dir = path.split("/")[1] || "root";
            if (!grouped[dir]) grouped[dir] = [];
            grouped[dir].push(path);
        });

        Object.entries(grouped).forEach(([dir, files]) => {
            console.log(`  📁 ${dir}: ${files.length} files`);
        });
    } catch (error) {
        console.error("❌ Error syncing assets:", error);
        process.exit(1);
    }
}

// Run the sync
syncAssets();
