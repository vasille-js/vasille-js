import * as fs from "fs";
import path from "path";
import * as babel from "@babel/core";
import vasillePlugin from "../src/index.js";

export function runTest(dir: string, name: string, devMode = true) {
    const input = fs.readFileSync(path.join(dir, `${name}.ts`), { encoding: "utf8" });
    const result = babel.transformSync(input, { plugins: [
      [vasillePlugin, {devMode}],
        "@babel/plugin-transform-typescript"
      ] });
    const expected = fs.readFileSync(path.join(dir, `${name}.js`), { encoding: "utf8" });

    expect(result?.code).toBe(expected.replace(/\n$/, ''));
}

export function throwTest(dir: string, name: string, err: string, isTsx?: boolean) {
    const input = fs.readFileSync(path.join(dir, `err-${name}.${isTsx ? "tsx" : "ts"}`), { encoding: "utf8" });

    expect(() => {
      babel.transformSync(input, { plugins: [
          vasillePlugin,
          ["@babel/plugin-transform-typescript", {isTSX: isTsx}]
        ]});
    }).toThrow((`Vasille: ${err}`));
}

export function runJsxTest(dir: string, name: string, devMode = true) {
    const input = fs.readFileSync(path.join(dir, `${name}.tsx`), { encoding: "utf8" });
    const result = babel.transformSync(input, {
        plugins: [[vasillePlugin, {devMode}], ["@babel/plugin-transform-typescript", {isTSX: true}]],
    });
    const expected = fs.readFileSync(path.join(dir, `${name}.js`), { encoding: "utf8" });

    expect(result?.code).toBe(expected.replace(/\n$/, ''));
}
