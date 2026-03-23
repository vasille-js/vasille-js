import { createSsgIndex } from "../app-index/create-ssg-index.js";
import { workingDirs } from "../lib/working-dirs.js";

const VASILLE_SPECIFIER = "index.vasille.js";
export const VASILLE_URL = "vasille:index.js";

export async function resolve(specifier, context, nextResolve) {
    if (specifier === VASILLE_SPECIFIER) {
        return {
            shortCircuit: true,
            url: VASILLE_URL,
        };
    }

    return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad, mode = "html") {
    if (url === VASILLE_URL) {
        const { pagesDir, routerDir } = workingDirs();

        return {
            format: "module",
            shortCircuit: true,
            source: await createSsgIndex(routerDir, pagesDir, mode),
        };
    }

    return await nextLoad(url, context);
}
