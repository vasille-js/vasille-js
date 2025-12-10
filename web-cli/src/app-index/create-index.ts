import { findRoutes } from "./find-routes.js";

export async function createIndex(routerDir: string, pagesDir: string, replaceWeb: string): Promise<string> {
    const indexJs: string[] = [];
    const { present, paths } = await findRoutes(routerDir, pagesDir);

    for (const item of present) {
        indexJs.push(`import ${item.component} from "${item.file}";`);
    }

    indexJs.push(`import { routerApp } from "${replaceWeb}";`);
    indexJs.push("const app = routerApp({");

    for (const item of present) {
        indexJs.push(`  ${item.component},`);
    }
    indexJs.push("  routes: {");

    for (const { urlPath, filePath } of paths) {
        indexJs.push(`    "${urlPath}": {`);
        indexJs.push(`      async screen(a, b){ (await import("${filePath}")).default(a, b) },`);
        indexJs.push("    },");
    }

    indexJs.push("  }", "});");

    return indexJs.join("\n");
}
