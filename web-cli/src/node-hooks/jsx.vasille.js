import fs from "fs/promises";
import {commonExtensions, resolveFile} from "../lib/resolve.js";
import * as babel from "@babel/core";
import vasillePlugin from "babel-plugin-vasille";
import pluginJsxSyntax from "@babel/plugin-syntax-jsx";
import pluginTypescript from "@babel/plugin-transform-typescript";
import path from "node:path";
import {VASILLE_URL} from "./index.vasille.js";
import {cwd} from "node:process";
import {pathToFileURL} from "node:url";

const ssgExtensions = ["ssg.tsx", "ssg.ts", "ssg.jsx", "ssg.js", ...commonExtensions];
const srcDirUrl = pathToFileURL(path.join(cwd(), "src")) + "/";
const fakeIndexUrl = srcDirUrl + `index.vasille.js`;

export async function resolve(specifier, context, nextResolve) {
    const { parentURL } = context;

    const url = specifier.startsWith("/")
        ? specifier
        : specifier.startsWith("./") ?( parentURL ?
        new URL(specifier, parentURL).href :
        new URL(specifier).href) : undefined;

    const resolved = url && await resolveFile(url, ssgExtensions)

    if (resolved) {
        return {
            shortCircuit: true,
            url: `file://${resolved}`,
        }
    }

    return nextResolve(specifier, {
        ...context,
        parentURL: parentURL === VASILLE_URL ? fakeIndexUrl : parentURL,
    });
}

export async function load(url, context, nextLoad) {
    if (url.startsWith(srcDirUrl) && ssgExtensions.some(ext => url.endsWith(ext)) && !url.endsWith(".vasille.js")) {
        const input = await fs.readFile(new URL(url), { encoding: "utf8" });
        const plugins = [];

        if (url.endsWith(".jsx")) {
            plugins.push(pluginJsxSyntax);
        }

        plugins.push(vasillePlugin);

        if (url.endsWith(".tsx") || url.endsWith(".ts")) {
            plugins.push([pluginTypescript, {isTSX: url.endsWith("x")}]);
        }

        const result = babel.transformSync(input, {
            plugins: plugins,
            filename: url,
            sourceFileName: path.basename(url),
        });

        if (result.code) {
            return {
                format: "module",
                shortCircuit: true,
                source: result.code
            }
        }
    }

    return await nextLoad(url, context);
}