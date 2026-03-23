import { load as loadConfigurable } from "./index.vasille.js";
export { resolve } from "./index.vasille.js";

export async function load(url, context, nextLoad) {
    return await loadConfigurable(url, context, nextLoad, "markdown");
}
