import { runJsxTest, runTest } from "../run-test";

it("assign operator", function () {
  runTest(__dirname, "assign-operator");
});

it("spaces in jsx", function () {
  runJsxTest(__dirname, "spaces-in-jsx");
});
