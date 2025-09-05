import fs from "fs/promises";

export async function checkDir(dir: string) {
    try {
        return (await fs.stat(dir)).isDirectory();
    } catch (err) {
        return false;
    }
}
