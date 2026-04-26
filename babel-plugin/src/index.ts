import * as Babel from "@babel/core";
import { transformProgram } from "./transformer.js";
import { CompilationErrorReporter } from "./communication";

export default function (): Babel.PluginObj<{
  file: { opts: { filename: string } };
  opts: {
    devLayer: unknown;
    strictFolders: unknown;
    replaceWeb: unknown;
    headTag: unknown;
    bodyTag: unknown;
    shadow: unknown;
    throwAtFirstError: unknown;
    reporter: unknown;
    hmr: unknown;
  };
}> {
  return {
    name: "Vasille",
    visitor: {
      Program(path, params) {
        transformProgram(path, params.file.opts.filename, {
          devLayer: params.opts.devLayer === true,
          strictFolders: params.opts.strictFolders !== false,
          replaceWeb: typeof params.opts.replaceWeb === "string" ? params.opts.replaceWeb : undefined,
          headTag: !!params.opts.headTag,
          bodyTag: !!params.opts.bodyTag,
          shadow: !!params.opts.shadow,
          throwAtFirstError: !!params.opts.throwAtFirstError,
          reporter:
            typeof params.opts.reporter === "function" ? (params.opts.reporter as CompilationErrorReporter) : undefined,
          hmr: params.opts.hmr === true,
        });
      },
    },
  };
}

export type { CompilationErrorReporter, CompilationErrorReport, CompilationErrorReports } from "./communication";
