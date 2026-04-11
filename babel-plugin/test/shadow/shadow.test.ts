import { runJsxTest, runTest } from "../run-test";
import path from "path";
import fs from "fs";
import * as babel from "@babel/core";
import vasillePlugin from "../../src";

const extra = { shadow: true, replaceWeb: "vasille-shadow" };

function ts(name: string) {
  runTest(__dirname, name, false, false, extra);
}
function tsx(name: string) {
  runJsxTest(__dirname, name, false, extra);
}
export function throwTest(name: string, err: string) {
  const fileName = path.join(__dirname, `${name}.tsx`);
  const input = fs.readFileSync(fileName, { encoding: "utf8" });

  expect(() => {
    babel.transformSync(input, {
      plugins: [
        [vasillePlugin, { strictFolders: false, throwAtFirstError: true, ...extra }],
        ["@babel/plugin-transform-typescript", { isTSX: true }],
      ],
      filename: fileName,
    });
    // @ts-ignore
  }).toThrow(new RegExp(`Vasille\\\[\\d+]\{\\w+}: ${RegExp.escape(err)}`));
}

it("shadow props parsing", function () {
  ts("PropsTest");
});

it("shadow props in interface parsing", function () {
  ts("InterfaceTest");
});

it("shadow parameters type parsing", function () {
  ts("ParameterTest");
});

it("type alias parsing", function () {
  ts("TypeTest");
});

it("type union parsing", function () {
  ts("UnionTest");
});

it("slots", function () {
  tsx("SlotTest");
});

it("local components", function () {
  tsx("LocalComponent");
});

it("no - error", function () {
  throwTest("Error", "The name 'error' is not allowed by WHATWG");
});

it("restricted tag name error", function () {
  throwTest("MissingGlyph", "The name 'missing-glyph' is not allowed by WHATWG");
});

it("no type error", function () {
  throwTest("NoType", "Missing type for web component composition");
});

it("missing type error", function () {
  throwTest("MissingType", "Missing type for web component composition");
});
