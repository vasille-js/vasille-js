import path from "node:path";
import { cwd } from "node:process";

export function workingDirs() {
    const srcDir = path.join(cwd(), "src");
    const routerDir = path.join(srcDir, "router");
    const pagesDir = path.join(srcDir, "pages");
    const cacheDir = path.join(srcDir, ".cache");

    return { srcDir, routerDir, pagesDir, cacheDir };
}
