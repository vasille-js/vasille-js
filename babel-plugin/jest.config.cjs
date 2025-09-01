const { createDefaultEsmPreset } = require("ts-jest");

const preset = createDefaultEsmPreset({
  compiler: "typescript",
  tsconfig: "./test/tsconfig.json",
})

/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  ...preset,
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  coverageReporters: ['lcov', 'text'],
};
