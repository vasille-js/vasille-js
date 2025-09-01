import compat from "eslint-plugin-compat";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";

export default tseslint.config(
    tseslint.configs.base,
    {
        name: "compat check",
        files: ["src/**/*.ts", "src/**/*.tsx"],
        plugins: { compat },
        rules: {
            "compat/compat": "error",
        },
        settings: {
            polyfills: [],
        },
        languageOptions: {
            parserOptions: {
                projectService: false,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    globalIgnores(["node_modules", "lib/**/*", "types", "coverage/**/*"]),
);
