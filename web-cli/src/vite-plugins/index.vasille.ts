import { createIndex } from "../app-index/create-index.js";
import { watchFolder } from "../lib/watch-folder.js";

let indexContent: string;

export async function indexPlugin(routerDir: string, pagesDir: string) {
    const virtualModuleId = "/src/index.vasille.js";
    const resolvedVirtualModuleId = "\0" + virtualModuleId;

    indexContent = await createIndex(routerDir, pagesDir);

    return {
        name: "VasilleIndexJs",
        resolveId(id: string) {
            if (id === virtualModuleId) {
                return resolvedVirtualModuleId;
            }
        },
        load(id: string) {
            if (id === resolvedVirtualModuleId) {
                console.log("index updated");

                return indexContent;
            }
        },
    };
}

export async function watchForIndexUpdates(routerDir: string, pagesDir: string, restart: () => void) {
    let timer: ReturnType<typeof setTimeout> | null = null;

    function handler() {
        if (timer === null) {
            timer = setTimeout(async () => {
                timer = null;

                const newContent = await createIndex(routerDir, pagesDir);

                if (indexContent !== newContent) {
                    indexContent = newContent;
                    restart();
                }
            }, 1000);
        }
    }

    await watchFolder(routerDir, handler);
    await watchFolder(pagesDir, handler);
}
