import pluginJsxSyntax from "@babel/plugin-syntax-jsx";
import pluginVasille from "babel-plugin-vasille";
import pluginTypescript from "@babel/plugin-transform-typescript";
import babel from "vite-plugin-babel";
import type { CompilationErrorReporter } from "babel-plugin-vasille";

export function getVitePlugins(
    target: "steel-frame" | "vasille-web" | "vasille-ssg",
    errorsHandler?: CompilationErrorReporter,
) {
    return [
        babel({
            loader: "js",
            filter: /\.[tj]sx?$/,
            include: ["src/**/*", "vasille-app/**/*"],
            exclude: ["node_modules/**/*"],
            babelConfig: {
                presets: [],
                plugins: [
                    pluginJsxSyntax,
                    [
                        pluginVasille,
                        { replaceWeb: target, devLayer: target === "steel-frame", reporter: errorsHandler },
                    ],
                    [pluginTypescript, { isTSX: true }],
                ],
                sourceMaps: "inline",
                configFile: false,
                babelrc: false,
            },
        }),
    ];
}
