module.exports = function (api) {
  api.cache(true);

  const presets = [];
  const plugins = ["@babel/plugin-syntax-jsx", "vasille", ["@babel/plugin-transform-typescript", {isTSX: true}]];

  return {
    presets,
    plugins,
    sourceMaps: "inline",
  };
}