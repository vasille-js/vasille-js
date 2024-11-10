import * as Babel from "@babel/core";
import { trProgram } from "./transformer";
import jsx from "@babel/plugin-syntax-jsx";

export default function (): Babel.PluginObj<{ devMode: unknown }> {
  return {
    name: "Vasille",
    visitor: {
      Program(path, params) {
        trProgram(path, params.devMode !== false);
      },
    },
    inherits: jsx,
  };
}
