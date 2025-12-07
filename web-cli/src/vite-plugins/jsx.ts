import pluginJsxSyntax from "@babel/plugin-syntax-jsx";
import pluginVasille from "babel-plugin-vasille";
import pluginTypescript from "@babel/plugin-transform-typescript";
import babel from "vite-plugin-babel";

export function getVitePlugins(target: "steel-frame" | "vasille-web" | "vasille-ssg") {
    return [
        // @ts-expect-error
        babel({
            loader: "js",
            filter: /\.[tj]sx?$/,
            include: ["src/**/*", "vasille-app/**/*"],
            exclude: ["node_modules/**/*"],
            babelConfig: {
                presets: [],
                plugins: [
                    pluginJsxSyntax,
                    [pluginVasille, { replaceWeb: target, devLayer: target === "steel-frame" }],
                    [pluginTypescript, { isTSX: true }],
                ],
                sourceMaps: "inline",
                configFile: false,
                babelrc: false,
            },
        }),
    ];
}
