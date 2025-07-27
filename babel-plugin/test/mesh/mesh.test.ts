import { runJsxTest, runTest } from "../run-test";

it("compose function", function () {
  runJsxTest(__dirname, "compose");
});

it("mesh statement function", function () {
  runTest(__dirname, "mesh-statement", false);
});

it("export default class", function () {
  runTest(__dirname, "default-class", false);
});

it("export default function", function () {
  runTest(__dirname, "default-fn", false);
});

it("export default expression", function () {
  runTest(__dirname, "default-expr", false);
});

it("state function", function () {
  runJsxTest(__dirname, "state");
});
