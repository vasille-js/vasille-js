import { cp, mkdir, opendir, readFile, rm, writeFile } from "node:fs/promises";
import { Dirent, statSync } from "node:fs";
import path, { dirname } from "node:path";
import { transformAsync } from "@babel/core";
import pluginJsxSyntax from "@babel/plugin-syntax-jsx";
import vasillePlugin from "babel-plugin-vasille";
import typeScriptPlugin from "@babel/plugin-transform-typescript";
import { watchFolder } from "./watch-folder.js";

export async function compileComponentsLib(srcDir: string, outputDir: string): Promise<boolean> {
    await mkdir(outputDir, { recursive: true });

    const components: string[] = [];
    const componentsDir = await opendir(path.join(srcDir, "components"));
    let it: Dirent | null = null;

    while ((it = await componentsDir.read()) !== null) {
        if (it.isFile() && (it.name.endsWith(".tsx") || it.name.endsWith(".jsx"))) {
            components.push(it.name.replace(/\.[jt]sx?$/, ".js"));
        }
    }

    await writeFile(
        path.join(outputDir, "index.js"),
        components.map(item => `import "./components/${item}";`).join("\n"),
        { encoding: "utf-8" },
    );

    return await compileComponentsDir(srcDir, srcDir, outputDir);
}

async function compileComponentsDir(srcDir: string, source: string, output: string): Promise<boolean> {
    const relative = source.slice(srcDir.length);
    const libName = relative === "/components" ? "vasille-shadow" : "vasille-web";
    const dir = await opendir(source);
    let it: Dirent | null = null;
    let ret = true;

    while ((it = await dir.read()) !== null) {
        const sourcePath = path.join(source, it.name);
        const outputPath = path.join(output, it.name);

        if (it.isDirectory()) {
            await mkdir(outputPath, { recursive: true });
            ret &&= await compileComponentsDir(srcDir, sourcePath, outputPath);
        } else if (it.isFile()) {
            ret &&= await compileFile(sourcePath, it.name, output, libName);
        }
    }
    await dir.close();

    return ret;
}

export async function compileLib(inputDir: string, outputDir: string, libName: string): Promise<boolean> {
    await mkdir(outputDir, { recursive: true });

    return await compileDir(inputDir, outputDir, libName);
}

export async function watchLib(inputDir: string, outputDir: string, libName: string): Promise<void> {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const files = new Set<string>();

    function update(filename: string) {
        files.add(filename);

        if (timer === null) {
            timer = setTimeout(async () => {
                const toCompile = [...files];

                timer = null;
                files.clear();

                for (const file of toCompile) {
                    const dir = dirname(file);
                    const absolutePath = path.join(inputDir, file);
                    const stats = statSync(absolutePath, { throwIfNoEntry: false });

                    if (stats?.isFile()) {
                        await compileFile(absolutePath, path.basename(file), path.join(outputDir, dir), libName);
                    } else if (!stats) {
                        await rm(path.join(outputDir, file), { recursive: true, force: true });
                    }
                }
            }, 5000);
        }
    }

    await compileLib(inputDir, outputDir, libName);
    await watchFolder(inputDir, filename => {
        if (filename) {
            update(filename);
        }
    });
}

async function compileDir(source: string, output: string, libName: string): Promise<boolean> {
    const dir = await opendir(source);
    let it: Dirent | null = null;
    let ret = true;

    while ((it = await dir.read()) !== null) {
        const sourcePath = path.join(source, it.name);
        const outputPath = path.join(output, it.name);

        if (it.isDirectory()) {
            await mkdir(outputPath, { recursive: true });
            ret &&= await compileDir(sourcePath, outputPath, libName);
        } else if (it.isFile()) {
            ret &&= await compileFile(sourcePath, it.name, output, libName);
        }
    }
    await dir.close();

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
                    [
                        vasillePlugin,
                        {
                            replaceWeb: libName,
                            devLayer: libName === "steel-frame",
                            shadow: libName === "vasille-shadow",
                        },
                    ],
                    ...(isTsx || isTs ? [[typeScriptPlugin, { isTSX: isTsx }]] : []),
                ],
                filename: sourcePath,
                sourceFileName: name,
                sourceMaps: "inline",
            });

            if (result?.code) {
                const binaryPath = path.join(outputDirPath, name.replace(/\.[jt]sx?$/, ".js"));
                const state = statSync(binaryPath, { throwIfNoEntry: false });
                const content = state?.isFile() && (await readFile(binaryPath, { encoding: "utf-8" }));

                // don't override the content if it is the same
                // don't trigger false updates in hot reload mode
                if (!content || result.code !== content) {
                    await writeFile(binaryPath, result.code, { encoding: "utf-8" });
                }
            }
        } catch (e) {
            ret = false;
        }
    } else {
        await cp(sourcePath, path.join(outputDirPath, name));
    }

    return ret;
}
