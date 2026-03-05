import { checkDir } from "./fs.js";
import fs from "fs/promises";

export async function watchFolder(path: string, handler: (filename: string | null) => void) {
    if (await checkDir(path)) {
        (async () => {
            const it = fs.watch(path, {
                persistent: true,
                recursive: true,
                maxQueue: 3,
                overflow: "ignore",
                encoding: "utf-8",
            });

            for await (const change of it) {
                handler(change.filename);
            }
        })().catch(e => {
            console.error("Watch failed", e);
        });
    }
}
