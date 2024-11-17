import * as fs from "fs";
import path from "path";
import * as babel from "@babel/core";
import vasillePlugin from "../src";

export function runTest(dir: string, name: string) {
    const input = fs.readFileSync(path.join(dir, `${name}.ts`), { encoding: "utf8" });
    const result = babel.transformSync(input, { plugins: [vasillePlugin, "@babel/plugin-transform-typescript"] });
    const expected = fs.readFileSync(path.join(dir, `${name}.js`), { encoding: "utf8" });

    expect(result?.code).toBe(expected);
}

export function throwTest(dir: string, name: string, err: string) {
    const input = fs.readFileSync(path.join(dir, `err-${name}.ts`), { encoding: "utf8" });

    try {
        babel.transformSync(input, { plugins: [vasillePlugin, "@babel/plugin-transform-typescript"] });
        // Throw error if that was not done by
        throw new Error('Babel didn\'t thrown');
    }
    catch (e) {
        expect(e).toBeInstanceOf(Error);
        if (e instanceof Error) {
            expect(e.message).toContain("Vasille:");
            expect(e.message).toContain(err);
        }
    }
}

export function runJsxTest(dir: string, name: string) {
    const input = fs.readFileSync(path.join(dir, `${name}.tsx`), { encoding: "utf8" });
    const result = babel.transformSync(input, {
        plugins: [vasillePlugin, ["@babel/plugin-transform-typescript", {isTSX: true}]],
    });
    const expected = fs.readFileSync(path.join(dir, `${name}.js`), { encoding: "utf8" });

    expect(result?.code).toBe(expected);
}
