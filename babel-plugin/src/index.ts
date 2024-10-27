import * as Babel from "@babel/core";
import * as JsxSyntax from "babel-plugin-syntax-jsx";
import TypeScript from "@babel/plugin-transform-typescript";
import { trProgram } from "./transformer";

export default function (): Babel.PluginObj {
    return {
        name: "Vasille",
        visitor: {
            Program(path) {
                if (path.node.sourceType !== "module") {
                    return;
                }

                trProgram(path);
            },
        },
        inherits: TypeScript,
    };
}
