module.exports = {
    preset: 'ts-jest/presets/default-esm',
    extensionsToTreatAsEsm: ['.ts'],
    globals: {
        'ts-jest': {
            useESM: true,
            diagnostics: true,
            tsconfig: "<rootDir>/tsconfig-jest.json",
        },
    },
    moduleNameMapper: {
        'vasille': 'vasille/lib-node',
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    moduleFileExtensions: ["ts", "tsx", "js"]
}
