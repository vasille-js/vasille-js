import { runJsxTest, throwTest } from "../run-test";

it("if", function () {
  runJsxTest(__dirname, "if-test");
});

it("model view", function () {
  runJsxTest(__dirname, "model-view");
});

it("iterate", function () {
  runJsxTest(__dirname, "iterate");
});

it("iterate-destructure", function () {
  runJsxTest(__dirname, "iterate-destructure");
});

it("iterate map", function () {
  runJsxTest(__dirname, "iterate-map");
});

it("throws ForEach has no slot", function () {
  throwTest(__dirname, "foreach-no-slot", "Malformed JSX ForEach tag must have value and slot", true);
});

it("throws Iterate has no params", function () {
  throwTest(
    __dirname,
    "iterate-params-number",
    "Malformed JSX Iterate tag must have value and slot with 1 param",
    true,
  );
});

it("throws ModelView has no slot", function () {
  throwTest(__dirname, "model-view-no-slot", "The slot must be a function expression", true);
});

it("throws reactive value is destructed", function () {
  throwTest(__dirname, "reactive-destruction", "The ArrayView slot must have only identifiers as parameters", true);
});

it("throws ModelView slot has too many params", function () {
  throwTest(__dirname, "too-much-params", "The ArrayView slot must have 2 arguments or less", true);
});
