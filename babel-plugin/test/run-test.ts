import * as fs from "fs";
import path from "path";
import * as babel from "@babel/core";
import vasillePlugin from "../src";

export function runTest(dir: string, name: string) {
    const input = fs.readFileSync(path.join(dir, `${name}.ts`), { encoding: "utf8" });
    const result = babel.transformSync(input, { plugins: ["@babel/plugin-transform-typescript", vasillePlugin] });
    const expected = fs.readFileSync(path.join(dir, `${name}.js`), { encoding: "utf8" });

    expect(result?.code).toBe(expected);
}

export function runJsxTest(dir: string, name: string) {
    const input = fs.readFileSync(path.join(dir, `${name}.tsx`), { encoding: "utf8" });
    const result = babel.transformSync(input, {
        plugins: ["@babel/plugin-syntax-jsx", vasillePlugin, "@babel/plugin-transform-typescript"],
    });
    const expected = fs.readFileSync(path.join(dir, `${name}.js`), { encoding: "utf8" });

    expect(result?.code).toBe(expected);
}
