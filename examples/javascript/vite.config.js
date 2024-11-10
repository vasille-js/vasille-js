import { defineConfig } from 'vite';
import babel from 'vite-plugin-babel';

export default defineConfig({
  esbuild: false,
    plugins: [
      babel({
        loader: "js",
      }),
    ],
})