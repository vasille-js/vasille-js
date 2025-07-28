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

it("check statements", function () {
  runTest(__dirname, "check-statement");
});

it("nested observable error", function () {
  throwTest(__dirname, "nested-observable", "Vasille: The reactive/observable value is nested");
});

it("local observable error", function () {
  throwTest(
    __dirname,
    "local-observable",
    "Vasille: This node cannot be processed, the root of expression is a local variable",
  );
});

it("mesh lvalue", function () {
  runTest(__dirname, "mesh-lvalue");
});

it("stringify", function () {
  runTest(__dirname, "stringify");
});

it("check node", function () {
  runTest(__dirname, "check-node");
});

it("ignore locals", function () {
  runTest(__dirname, "ignore-locals");
});

it("restricted hints error", function () {
  throwTest(__dirname, "restricted-hint", "Usage of hints is restricted here");
});
