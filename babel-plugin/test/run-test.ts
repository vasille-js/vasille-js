import * as fs from "fs";
import path from "path";
import * as babel from "@babel/core";
import vasillePlugin from "../src/index.js";

export function runTest(dir: string, name: string, devMode = true, strictFolders = false) {
  const input = fs.readFileSync(path.join(dir, `${name}.ts`), { encoding: "utf8" });
  const result = babel.transformSync(input, {
    plugins: [[vasillePlugin, { devMode, strictFolders }], "@babel/plugin-transform-typescript"],
    filename: path.join(dir, `${name}.ts`),
    sourceFileName: `${name}.js`,
  });
  const expected = fs.readFileSync(path.join(dir, `${name}.js`), { encoding: "utf8" });

  expect(result?.code).toBe(expected.replace(/\n$/, ""));
}

export function throwTest(dir: string, name: string, err: string, isTsx?: boolean) {
  const fileName = path.join(dir, `err-${name}.${isTsx ? "tsx" : "ts"}`);
  const input = fs.readFileSync(fileName, { encoding: "utf8" });

  expect(() => {
    babel.transformSync(input, {
      plugins: [
        [vasillePlugin, { strictFolders: false }],
        ["@babel/plugin-transform-typescript", { isTSX: isTsx }],
      ],
      filename: fileName,
    });
  }).toThrow(new RegExp(`Vasille\\\[\\d+]\{\\w+}: ${RegExp.escape(err)}`));
}

export function runJsxTest(dir: string, name: string, devMode = true) {
  const input = fs.readFileSync(path.join(dir, `${name}.tsx`), { encoding: "utf8" });
  const result = babel.transformSync(input, {
    plugins: [
      [vasillePlugin, { devMode, strictFolders: false }],
      ["@babel/plugin-transform-typescript", { isTSX: true }],
    ],
    filename: path.join(dir, `${name}.tsx`),
  });
  const expected = fs.readFileSync(path.join(dir, `${name}.js`), { encoding: "utf8" });

  expect(result?.code).toBe(expected.replace(/\n$/, ""));
}
