import * as Babel from "@babel/core";
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
    };
}
