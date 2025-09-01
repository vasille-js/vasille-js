#!/usr/bin/env node
import { argv, cwd, exit } from "node:process";
import select from "@inquirer/select";
import path from "node:path";
import { createServer, build as viteBuild } from "vite";
import { default as babel } from "vite-plugin-babel";
import pluginJsxSyntax from "@babel/plugin-syntax-jsx";
import pluginVasille from "babel-plugin-vasille";
import pluginTypescript from "@babel/plugin-transform-typescript";
import pluginInlineEnv from "babel-plugin-transform-inline-environment-variables";
import { indexPlugin, watchForIndexUpdates } from "./create-index.js";
import inspect from "vite-plugin-inspect";
import { compress } from "./lib.js";

function checkArg(name: string) {
    return argv.indexOf(name) >= 2;
}

let dev = checkArg("dev");
let build = checkArg("build");

function getVitePlugins(devMode: boolean) {
    return [
        // @ts-expect-error
        babel({
            loader: "js",
            filter: /\.[tj]sx?$/,
            include: ["src/**/*"],
            babelConfig: {
                presets: [],
                plugins: [pluginJsxSyntax, [pluginVasille, { devMode }], [pluginTypescript, { isTSX: true }]],
                sourceMaps: "inline",
                configFile: false,
                babelrc: false,
            },
        }),
        // @ts-expect-error
        babel({
            loader: "js",
            filter: /(router|class)\.js$/,
            babelConfig: {
                presets: [],
                plugins: [pluginInlineEnv],
                configFile: false,
                babelrc: false,
            },
        }),
    ];
}

async function run() {
    const srcDir = path.join(cwd(), "src");
    const routerDir = path.join(srcDir, "router");
    const pagesDir = path.join(srcDir, "pages");

    if (!dev && !build) {
        const mode = await select<"dev" | "build">({
            message: "What do you want?",
            choices: [
                {
                    value: "dev",
                    name: "Start a development server",
                    description: "Select this option to open your application in web browser",
                },
                {
                    value: "build",
                    name: "Build your application",
                    description: "Select this option to compile your code for production",
                },
            ],
        });

        dev = mode === "dev";
        build = mode === "build";
    }

    if (build) {
        console.log("\nCommand shortcut is vasille-web build\n\n");

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

        exit(0);
    }
    if (dev) {
        console.log("\nCommand shortcut is vasille-web dev\n\n");

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
    exit(0);
});
