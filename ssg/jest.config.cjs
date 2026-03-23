/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
    transform: {
        "\\.tsx?$": ["babel-jest", {
            plugins: [
                "@babel/plugin-syntax-jsx",
                ["vasille", {
                    devMode: true,
                    strictFolders: false,
                    replaceWeb: "vasille-ssg",
                    headTag: true,
                    bodyTag: true
                }],
                ["@babel/plugin-transform-typescript", {isTSX: true}],
            ],
        }],
    },
    extensionsToTreatAsEsm: [".ts", ".tsx"],
    moduleNameMapper: {
        "vasille-ssg": "<rootDir>/src/index.ts",
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
};