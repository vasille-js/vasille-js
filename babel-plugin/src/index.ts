import * as Babel from "@babel/core";
import { trProgram } from "./transformer";

export default function (): Babel.PluginObj<{ noConflict: unknown }> {
    return {
        name: "Vasille",
        visitor: {
            Program(path, params) {
                if (path.node.sourceType !== "module") {
                    return;
                }

                trProgram(path, !!params.noConflict);
            },
        },
    };
}
