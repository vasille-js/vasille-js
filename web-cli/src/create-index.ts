import fs from "fs/promises";
import { checkDir } from "./fs.js";
import path from "node:path";
import { Dirent } from "node:fs";
import { watchFolder } from "./watch-folder.js";

const initializationFields = ["getAccessLevel", "fallbackScreen", "errorScreen", "loadingScreen", "loadingOverlay"];

export async function createIndex(routerDir: string, pagesDir: string): Promise<string> {
    const indexJs: string[] = [];
    const present: string[] = [];

    if (await checkDir(routerDir)) {
        const dir = await fs.opendir(routerDir, { encoding: "utf-8" });
        let item: Dirent | null;

        while ((item = await dir.read())) {
            if (item.isFile()) {
                for (const field of initializationFields) {
                    if (item.name.startsWith(field) && /^\w+\.[tj]sx?$/.test(item.name)) {
                        present.push(field);
                        indexJs.push(`import ${field} from "${path.join(item.parentPath, item.name)}";`);
                    }
                }
            }
        }

        await dir.close();
    }

    if (await checkDir(pagesDir)) {
        const dir = await fs.opendir(pagesDir, { recursive: true, encoding: "utf-8" });

        let item: Dirent | null;

        indexJs.push('import { routerApp } from "vasille-web";');
        indexJs.push("const app = routerApp({");

        for (const setting of present) {
            indexJs.push(`  ${setting},`);
        }
        indexJs.push("  routes: {");

        while ((item = await dir.read())) {
            if (item.isFile() && /\.[jt]sx?$/.test(item.name)) {
                let name = item.name.replace(/\.[tj]sx?$/, "");

                if (name === "index" || name === "index.html") {
                    name = "";
                }

                const filePath = path.join(item.parentPath, item.name).replace(/\.[tj]sx?$/, "");
                const screenPath = path.join(item.parentPath, name).slice(pagesDir.length) || "/";
                const fileContent = await fs.readFile(path.join(item.parentPath, item.name), { encoding: "utf-8" });
                const match = /\bexport const minAccessLevel ?= ?(\d+);/.exec(fileContent);

                console.log("Route path:", screenPath);

                indexJs.push(`    "${screenPath}": {`);
                indexJs.push(`      async screen(a, b){ (await import("${filePath}")).default(a, b) },`);

                if (match) {
                    indexJs.push(`      minAccessLevel: ${match[1]}`);
                }

                indexJs.push("    },");
            }
        }

        indexJs.push("  }", "});");
        await dir.close();
    }

    return indexJs.join("\n");
}

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
