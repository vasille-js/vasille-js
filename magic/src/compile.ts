import * as ts from "typescript";
import {transform} from "./ts";
import * as fs from "fs";

const CJS_CONFIG: ts.CompilerOptions = {
    experimentalDecorators: true,
    jsx: ts.JsxEmit.ReactNative,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    noEmitOnError: false,
    noUnusedLocals: true,
    noUnusedParameters: true,
    stripInternal: true,
    declaration: true,
    baseUrl: __dirname,
    target: ts.ScriptTarget.ES2016,
    "paths": { "vasille-magic": [__dirname] },
    "jsxFactory": "v.tag",
};

export function compile(fileNames: string[], options: ts.CompilerOptions = CJS_CONFIG): void {
    Error.stackTraceLimit = 1000;
    let program = ts.createProgram(fileNames, options);
    let emitResult = program.emit(
        undefined,
        (fileName, data) => {
            console.log(fileName, 'file');
            !fileName.includes('index') && !fileName.includes('.d.ts') &&
            fs.writeFileSync(__dirname + '/../test/test_result.ts', data);
        },
        undefined,
        undefined,
        {
            before: [transform(program)]
        }
    );

    let allDiagnostics = ts
        .getPreEmitDiagnostics(program)
        .concat(emitResult.diagnostics);

    allDiagnostics.forEach(diagnostic => {
        if (diagnostic.file) {
            let { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
            let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
            console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
        } else {
            console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
        }
    });

    let exitCode = emitResult.emitSkipped ? 1 : 0;
    console.log(`Process exiting with code '${exitCode}'.`);
    process.exit(exitCode);
}
