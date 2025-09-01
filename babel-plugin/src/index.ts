import * as Babel from "@babel/core";
import { transformProgram } from "./transformer.js";

export default function (): Babel.PluginObj<{
  file: { opts: { filename: string } };
  opts: {
    devMode: unknown;
    strictFolders: unknown;
  };
}> {
  return {
    name: "Vasille",
    visitor: {
      Program(path, params) {
        transformProgram(path, params.file.opts.filename, {
          devMode: params.opts.devMode !== false,
          strictFolders: params.opts.strictFolders !== false,
        });
      },
    },
  };
}
