import { runTest, throwTest } from "../run-test";

it("check expression", function () {
  runTest(__dirname, "check-expression");
});

it("check fragment error", function () {
  throwTest(__dirname, "jsx-fragment", "JSX fragment is not allowed here", true);
});

it("check element error", function () {
  throwTest(__dirname, "jsx-element", "JSX element is not allowed here", true);
});

it("check statements", function () {
  runTest(__dirname, "check-statement");
});

it("reactive field set", function () {
  runTest(__dirname, "reactive-field-set", false);
})

it("nested observable error", function () {
  throwTest(__dirname, "nested-observable", "The reactive/observable value is nested");
});

it("local observable error", function () {
  throwTest(__dirname, "local-observable", "Usage of hints is restricted here");
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

it("restricted hints error", function () {
  throwTest(__dirname, "restricted-hint", "Usage of hints is restricted here");
});

it("function name starts with $", function () {
  throwTest(__dirname, "function-name", "Non-reactive variable name must not start with $");
})
