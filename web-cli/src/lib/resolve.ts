import fs from "fs/promises";

export const commonExtensions = ["tsx", "ts", "jsx", "js"];

export async function resolveFile(url: string, extensions: string[]) {
    if (url.endsWith(".js")) {
        url = url.substring(0, url.length - 3);
    }
    if (url.startsWith("file://")) {
        url = url.substring(7);
    }
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
