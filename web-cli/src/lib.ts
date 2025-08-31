import { transform } from "esbuild";

export function runBeforeProcessExit(fn: () => void) {
    process.on("SIGTERM", fn);
    process.on("SIGQUIT", fn);
    process.on("SIGINT", fn);
}

export function compress() {
    return {
        name: "minifyEs",
        renderChunk: {
            order: "post",
            async handler(code: string, chunk: any, outputOptions: any) {
                if (outputOptions.format === "es" && chunk.fileName.endsWith(".js")) {
                    return await transform(code, { minify: true });
                }
                return code;
            },
        },
    };
}
