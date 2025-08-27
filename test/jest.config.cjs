/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  transform: {
    "\\.tsx?$": ["babel-jest", {
      plugins: [
        "@babel/plugin-syntax-jsx",
        ["vasille", {devMode: true, strictFolders: false}],
        ["@babel/plugin-transform-typescript", {isTSX: true}],
      ]
    }],
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
