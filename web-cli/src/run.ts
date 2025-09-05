#!/usr/bin/env node
import {cwd, exit} from "node:process";
import path from "node:path";
import {build as viteBuild, createServer} from "vite";
import inspect from "vite-plugin-inspect";
import {compress} from "./vite-plugins/compress.js";
import {getVitePlugins} from "./vite-plugins/jsx.js";
import {processArgs} from "./lib/process-args.js";
import {register} from "node:module";
import {indexPlugin, watchForIndexUpdates} from "./vite-plugins/index.vasille.js";
import {workingDirs} from "./lib/working-dirs.js";

async function run() {
    const {routerDir, pagesDir} = workingDirs();
    const { build, dev, spa, ssg, help } = await processArgs();

    if (build) {
        if (spa) {
            if (help) {
                console.log("\nCommand shortcut is vasille-web build spa\n");
            }

            await viteBuild({
                configFile: false,
                root: cwd(),
                esbuild: false,
                appType: "spa",
                build: {
                    outDir: "dist/spa",
                    emptyOutDir: true,
                },
                plugins: [await indexPlugin(routerDir, pagesDir), ...getVitePlugins(true), compress()],
            });
        }
        if (ssg) {
            if (help) {
                console.log("\nCommand shortcut is vasille-web build static\n");
            }

            register("file:"+path.join(import.meta.dirname, "./node-hooks/index.vasille.js"));
            register("file:"+path.join(import.meta.dirname, "./node-hooks/jsx.vasille.js"));

            // @ts-expect-error
            await (await import("index.vasille.js")).router.render(path.join(cwd(), "out/static"));
        }

        exit(0);
    }
    if (dev) {
        if (help) {
            console.log("\nCommand shortcut is vasille-web dev\n");
        }

        const server = await createServer({
            configFile: false,
            root: cwd(),
            esbuild: false,
            appType: "spa",
            command: "serve",
            plugins: [await indexPlugin(routerDir, pagesDir), ...getVitePlugins(true), inspect()],
        });

        await server.listen();

        await watchForIndexUpdates(routerDir, pagesDir, () => {
            server.restart();
        });

        server.printUrls();
        server.bindCLIShortcuts({ print: true });
    }
    if (!dev) {
        exit(0);
    }
}

run().catch(e => {
    console.log(e);
    exit(1);
});
