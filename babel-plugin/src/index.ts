import * as Babel from "@babel/core";
import { transformProgram } from "./transformer.js";

export default function (): Babel.PluginObj<{
  file: { opts: { filename: string } };
  opts: {
    devLayer: unknown;
    strictFolders: unknown;
    replaceWeb: unknown;
    headTag: unknown;
    bodyTag: unknown;
  };
}> {
  return {
    name: "Vasille",
    visitor: {
      Program(path, params) {
        transformProgram(path, params.file.opts.filename, {
          devLayer: params.opts.devLayer !== false,
          strictFolders: params.opts.strictFolders !== false,
          replaceWeb: typeof params.opts.replaceWeb === "string" ? params.opts.replaceWeb : undefined,
          headTag: !!params.opts.headTag,
          bodyTag: !!params.opts.bodyTag,
        });
      },
    },
  };
}
