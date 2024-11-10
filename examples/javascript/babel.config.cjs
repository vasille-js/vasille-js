module.exports = function (api) {
  api.cache(true);

  const presets = [];
  const plugins = ["@babel/plugin-syntax-jsx", "vasille"];

  return {
    presets,
    plugins,
    sourceMaps: "inline",
  };
}