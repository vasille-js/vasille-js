import * as Babel from "@babel/core";
import { trProgram } from "./transformer.js";

export default function (): Babel.PluginObj<{
  file: { opts: { filename: string } };
  opts: { devMode: unknown };
}> {
  return {
    name: "Vasille",
    visitor: {
      Program(path, params) {
        trProgram(path, params.file.opts.filename, params.opts.devMode !== false);
      },
    },
  };
}
