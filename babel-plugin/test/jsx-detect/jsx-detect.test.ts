import { runJsxTest } from "../run-test";

it("has JSX", function () {
  runJsxTest(__dirname, "has-jsx");
});

it("release mode", function () {
  runJsxTest(__dirname, "release-mode", false);
});
