import pluginJsxSyntax from "@babel/plugin-syntax-jsx";
import pluginVasille from "babel-plugin-vasille";
import pluginTypescript from "@babel/plugin-transform-typescript";
import pluginInlineEnv from "babel-plugin-transform-inline-environment-variables";
import babel from "vite-plugin-babel";

// @ts-expect-error
export const processEnvPlugin = babel({
    loader: "js",
    filter: /(router|class)\.js$/,
    babelConfig: {
        presets: [],
        plugins: [pluginInlineEnv],
        configFile: false,
        babelrc: false,
    },
});

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
        processEnvPlugin,
    ];
}
