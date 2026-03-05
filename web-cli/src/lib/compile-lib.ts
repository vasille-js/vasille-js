import {cp, mkdir, opendir, readFile, rm, stat, statfs, writeFile} from "node:fs/promises";
import {Dirent, statSync} from "node:fs";
import path from "node:path";
import { transformAsync } from "@babel/core";
import pluginJsxSyntax from "@babel/plugin-syntax-jsx";
import vasillePlugin from "babel-plugin-vasille";
import typeScriptPlugin from "@babel/plugin-transform-typescript";

export async function compileLib(inputDir: string, outputDir: string, libName: string): Promise<boolean> {
    await mkdir(outputDir, { recursive: true });

    return await compileDir(inputDir, outputDir, libName);
}

async function compileDir(source: string, output: string, libName: string): Promise<boolean> {
    const dir = await opendir(source);
    let it: Dirent | null = null;
    let ret = true;

    while ((it = await dir.read()) !== null) {
        const sourcePath = path.join(source, it.name);
        const outputPath = path.join(output, it.name);

        if (it.isDirectory()) {
            await mkdir(outputPath, {recursive: true});
            ret &&= await compileDir(sourcePath, outputPath, libName);
        } else if (it.isFile()) {
            ret &&= await compileFile(sourcePath, it.name, output, libName);
        }
    }

    return ret;
}

async function compileFile(sourcePath: string, name: string, outputDirPath: string, libName: string): Promise<boolean> {
    const isTsx = name.endsWith(".tsx");
    const isTs = name.endsWith(".ts");
    const isJsx = name.endsWith(".jsx");
    const isJs = name.endsWith(".js");
    let ret = true;

    if (isTsx || isTs || isJsx || isJs) {
        const sourceCode = await readFile(sourcePath, { encoding: "utf-8" });

        console.log("Compiling: ", sourcePath);

        try {
            const result = await transformAsync(sourceCode, {
                plugins: [
                    ...(isJsx ? [pluginJsxSyntax] : []),
                    [vasillePlugin, { replaceWeb: libName, devLayer: libName === "steel-frame" }],
                    ...(isTsx || isTs ? [[typeScriptPlugin, { isTSX: isTsx }]] : []),
                ],
                filename: sourcePath,
                sourceFileName: name,
                sourceMaps: "inline",
            });

            if (result?.code) {
                const binaryPath = path.join(outputDirPath, name.replace(/\.[jt]sx?$/, ".js"));
                const state = statSync(binaryPath, {throwIfNoEntry: false});
                const content = state?.isFile() && await readFile(binaryPath, {encoding: "utf-8"});

                // don't override the content if it is the same
                // don't trigger false updates in hot reload mode
                if (!content || result.code !== content) {
                    await writeFile(binaryPath, result.code, {encoding: "utf-8"});
                }
            }
        } catch (e) {
            console.error(e);
            ret = false;
        }
    } else {
        await cp(sourcePath, path.join(outputDirPath, name));
    }

    return ret;
}
