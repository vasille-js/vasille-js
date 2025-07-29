import { fileURLToPath } from "node:url";
import path from "path";
import { runTest, throwTest } from "../run-test";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

it("nested observable error", function () {
  throwTest(__dirname, "nested-observable", "The reactive/observable value is nested");
});

it("local observable error", function () {
  throwTest(
    __dirname,
    "local-observable",
    "This node cannot be processed, the root of expression is a local variable",
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
