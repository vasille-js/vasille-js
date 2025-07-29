import * as Babel from "@babel/core";
import { trProgram } from "./transformer.js";

export default function (): Babel.PluginObj<{ opts: { devMode: unknown } }> {
  return {
    name: "Vasille",
    visitor: {
      Program(path, params) {
        trProgram(path, params.opts.devMode !== false);
      },
    },
  };
}
