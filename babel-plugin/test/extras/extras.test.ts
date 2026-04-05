import { runJsxTest, runTest } from "../run-test";
import path from "path";
import fs from "fs";
import * as babel from "@babel/core";
import vasillePlugin, { CompilationErrorReports } from "../../src";

it("SlotTest.tsx", function () {
  runJsxTest(__dirname, "SlotTest");
});

it("set-model.tsx", function () {
  runJsxTest(__dirname, "set-model");
});

it("calculate.tsx", function () {
  runJsxTest(__dirname, "calculate");
});

it("function assigment patter", function () {
  runTest(__dirname, "function-assigment-pattern");
});

it("throw test", function () {
  const fileName = path.join(__dirname, "err.tsx");
  const input = fs.readFileSync(fileName, { encoding: "utf8" });

  expect(() => {
    babel.transformSync(input, {
      plugins: [
        [
          vasillePlugin,
          {
            reporter: (errors: CompilationErrorReports) => {
              expect(errors.reports.length).toBe(7);
              expect(errors.reports[0].message).toBe(
                "RulesOfVasille: The component name must start with a uppercase letter",
              );
              expect(errors.reports[1].message).toMatch(/Malformed component detected/);
              expect(errors.reports[2].message).toBe("IncompatibleContext: JSX element is not allowed here");
              expect(errors.reports[3].message).toBe("IncompatibleContext: JSX fragment is not allowed here");
              expect(errors.reports[4].message).toBe("RulesOfVasille: Reactive variable name must start with $");
              expect(errors.reports[5].message).toBe("IncompatibleContext: JSX element is not allowed here");
              expect(errors.reports[6].message).toBe("IncompatibleContext: JSX fragment is not allowed here");
            },
          },
        ],
        ["@babel/plugin-transform-typescript", { isTSX: true }],
      ],
      filename: fileName,
    });
  }).toThrow(/\bCompilation failed$/);
});
