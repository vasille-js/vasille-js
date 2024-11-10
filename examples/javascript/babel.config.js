import plugin from 'vasille-babel-plugin';

export default function (api) {
  api.cache(true);

  const presets = [];
  const plugins = ["@babel/plugin-syntax-jsx", plugin];

  return {
    presets,
    plugins,
    sourceMaps: "inline",
  };
}