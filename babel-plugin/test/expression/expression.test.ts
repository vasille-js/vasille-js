import { runTest, throwTest } from "../run-test";

it("check expression", function () {
  runTest(__dirname, "check-expression");
});

it("check fragment error", function () {
  throwTest(__dirname, "jsx-fragment", "Vasille: JSX fragment is not allowed here", true);
});

it("check element error", function () {
  throwTest(__dirname, "jsx-element", "Vasille: JSX element is not allowed here", true);
});

it('check statements', function() {
  runTest(__dirname, "check-statement");
})
