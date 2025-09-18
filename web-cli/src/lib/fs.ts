import fs from "fs/promises";

export async function checkDir(dir: string) {
    try {
        return (await fs.stat(dir)).isDirectory();
    } catch (err) {
        return false;
    }
}

export async function checkFile(path: string) {
    try {
        return (await fs.stat(path)).isFile();
    } catch (err) {
        return false;
    }
}
