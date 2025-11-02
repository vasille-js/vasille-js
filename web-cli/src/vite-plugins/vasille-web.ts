export async function vasilleWebPlugin(imported: Set<string>) {
    const virtualModuleId = "/web.vasille.js";
    const resolvedVirtualModuleId = "\0" + virtualModuleId;

    return {
        name: "VasilleWebEntryJs",
        resolveId(id: string) {
            if (id === virtualModuleId) {
                return resolvedVirtualModuleId;
            }
        },
        load(id: string) {
            if (id === resolvedVirtualModuleId) {
                return `export {${[...imported].join(",")}} from "vasille-web";`;
            }
        },
    };
}
