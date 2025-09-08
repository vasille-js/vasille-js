import fs from "fs/promises";

export const commonExtensions = ["tsx", "ts", "jsx", "js"];

export async function resolveFile(url: string, extensions: string[]) {
    for (const extension of extensions) {
        try {
            const path = url + "." + extension;
            const stats = await fs.stat(path);

            if (stats.isFile()) {
                return path;
            }
        } catch (e) {}
    }
}
