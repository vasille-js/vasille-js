import pluginJsxSyntax from "@babel/plugin-syntax-jsx";
import pluginVasille from "babel-plugin-vasille";
import pluginTypescript from "@babel/plugin-transform-typescript";
import babel from "vite-plugin-babel";

export function getVitePlugins(devMode: boolean) {
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
    ];
}
