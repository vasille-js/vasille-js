#!/usr/bin/env node
import { cwd, exit } from "node:process";
import path from "node:path";
import { build as viteBuild, createServer } from "vite";
import inspect from "vite-plugin-inspect";
import { compress } from "./vite-plugins/compress.js";
import { getVitePlugins } from "./vite-plugins/jsx.js";
import { processArgs } from "./lib/process-args.js";
import { register } from "node:module";
import { indexPlugin, watchForIndexUpdates } from "./vite-plugins/index.vasille.js";
import { workingDirs } from "./lib/working-dirs.js";
import fs from "fs/promises";
import { checkFile } from "./lib/fs.js";
import { readdir } from "node:fs/promises";
import { vasilleWebPlugin } from "./vite-plugins/vasille-web.js";
import { startProxyServer } from "./proxy/dev-proxy.js";
import { compileComponentsLib, compileLib, watchLib } from "./lib/compile-lib.js";

async function run() {
    const { routerDir, pagesDir, srcDir } = workingDirs();
    const { build, dev, spa, ssg, help, lib, components, md, mdHtml } = await processArgs();
    const resolve = {
        alias: {
            "@": srcDir,
        },
    } as const;

    if (build) {
        if (spa) {
            const assetsDir = path.join(cwd(), "/dist/spa/assets");

            if (help) {
                console.log("\nCommand shortcut is web build spa\n");
            }

            await viteBuild({
                configFile: false,
                root: cwd(),
                esbuild: false,
                appType: "spa",
                build: {
                    outDir: "dist/spa",
                    emptyOutDir: true,
                    rollupOptions: {
                        external: ["vasille-web"],
                    },
                },
                plugins: [
                    await indexPlugin(routerDir, pagesDir, "vasille-web"),
                    ...getVitePlugins("vasille-web"),
                    compress(),
                ],
                resolve,
            });

            const files = (await readdir(path.join(cwd(), "dist/spa/assets"))).filter(item => item.endsWith(".js"));
            const imported = new Set<string>();
            const hash = Math.random().toFixed(10).slice(2);

            for (const file of files) {
                const content = await fs.readFile(path.join(assetsDir, file), "utf-8");
                const match = /import\{([^{}]*)}from"vasille-web"/.exec(content);

                if (match) {
                    const items = match[1].split(",");

                    for (const item of items) {
                        imported.add(item.split(" as ")[0]);
                    }
                    await fs.writeFile(
                        path.join(assetsDir, file),
                        content.replace(`"vasille-web"`, `"./vasille-web.js?${hash}"`),
                    );
                }
            }
            await viteBuild({
                configFile: false,
                root: cwd(),
                esbuild: false,
                build: {
                    lib: {
                        entry: `/web.vasille.js`,
                        formats: ["es"],
                        fileName: "vasille-web",
                    },
                    outDir: "dist/spa/assets",
                    emptyOutDir: false,
                    rollupOptions: {
                        treeshake: true,
                    },
                    sourcemap: false,
                },
                plugins: [compress(), vasilleWebPlugin(imported)],
            });
        }
        if (lib) {
            if (help) {
                console.log("\nCommand shortcut is web build lib\n");
            }

            if (!(await compileLib(srcDir, path.join(srcDir, "../dist/lib"), "vasille-web"))) {
                console.log("Failed to compile library");
                exit(1);
            } else {
                console.log("Library compiled successfully");
            }
        }
        if (components) {
            if (help) {
                console.log("\nCommand shortcut is web build components\n");
            }

            if (!(await compileComponentsLib(srcDir, path.join(srcDir, "../dist/components")))) {
                console.log("Failed to compile web components library");
                exit(1);
            } else {
                console.log("Web Components Library compiled successfully");
            }
        }

        async function renderStatics(dir: string, suffix = "") {
            // @ts-expect-error
            const routes: Record<string, string> = await (await import("index.vasille.js")).router.render();
            const outPath = path.join(cwd(), `dist/${dir}`);

            for (const key in routes) {
                const filePath = path.join(outPath, key) + suffix;

                await fs.mkdir(path.dirname(filePath), { recursive: true });
                await fs.writeFile(filePath, routes[key], "utf8");
            }
        }

        if (ssg) {
            if (help) {
                console.log("\nCommand shortcut is web build html\n");
            }

            register("file:" + path.join(import.meta.dirname, "./node-hooks/index.vasille.js"));
            register("file:" + path.join(import.meta.dirname, "./node-hooks/jsx.vasille.js"));

            await renderStatics("html");
        }
        if (md) {
            if (help) {
                console.log("\nCommand shortcut is web build md\n");
            }

            register("file:" + path.join(import.meta.dirname, "./node-hooks/index.md.vasille.js"));
            register("file:" + path.join(import.meta.dirname, "./node-hooks/jsx.vasille.js"));

            await renderStatics("md", ".md");
        }
        if (mdHtml) {
            if (help) {
                console.log("\nCommand shortcut is web build md+html\n");
            }

            register("file:" + path.join(import.meta.dirname, "./node-hooks/index.doc.vasille.js"));
            register("file:" + path.join(import.meta.dirname, "./node-hooks/jsx.vasille.js"));

            await renderStatics("doc", ".md");
        }

        exit(0);
    }
    if (dev) {
        if (help) {
            if (lib) {
                console.log("\nCommand shortcut is web dev+lib\n");
            } else {
                console.log("\nCommand shortcut is web dev\n");
            }
        }

        if (lib) {
            await watchLib(srcDir, path.join(srcDir, "../dist/lib"), "steel-frame");
        } else {
            const { ideServer } = startProxyServer();
            const server = await createServer({
                configFile: false,
                root: cwd(),
                esbuild: false,
                appType: "spa",
                command: "serve",
                plugins: [
                    await indexPlugin(routerDir, pagesDir, "steel-frame"),
                    ...getVitePlugins("steel-frame", reports => {
                        ideServer.clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify(["reportErrors", reports]));
                            }
                        });
                    }),
                    inspect(),
                ],
                resolve,
                optimizeDeps: {
                    include: [],
                    force: true,
                },
                server: {
                    cors: true,
                },
                build: {
                    sourcemap: true,
                },
            });

            await server.listen();

            await watchForIndexUpdates(routerDir, pagesDir, "steel-frame", () => {
                server.restart();
            });

            server.printUrls();
            server.bindCLIShortcuts({ print: true });
        }
    }
    if (!dev) {
        exit(0);
    }
}

run().catch(e => {
    console.log(e);
    exit(1);
});
