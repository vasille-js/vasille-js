import * as Babel from "@babel/core";
import { trProgram } from "./transformer.js";

export default function (): Babel.PluginObj<{ devMode: unknown }> {
  return {
    name: "Vasille",
    visitor: {
      Program(path, params) {
        trProgram(path, params.devMode !== false);
      },
    },
  };
}
