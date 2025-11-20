import { runJsxTest, runTest } from "../run-test";

it("component", function () {
  runTest(__dirname, "component", true);
});

it("ref", function () {
  runTest(__dirname, "ref", true);
});

it("ref without args", function () {
  runTest(__dirname, "ref-no-args", true);
});

it("bind", function () {
  runTest(__dirname, "bind", true);
});

it("bind 2", function () {
  runTest(__dirname, "bind-2", true);
});

it("calculate", function () {
  runTest(__dirname, "calculate", true);
});

it("calculate 2", function () {
  runJsxTest(__dirname, "calculate-2", true);
});

it("object", function () {
  runTest(__dirname, "object", true);
});

it("awaited", function () {
  runTest(__dirname, "awaited", true);
});

it("awaited 2", function () {
  runTest(__dirname, "awaited-2", true);
});

it("set model", function () {
  runTest(__dirname, "set-model", true);
});

it("map model", function () {
  runTest(__dirname, "map-model", true);
});

it("array model", function () {
  runTest(__dirname, "array-model", true);
});

it("ensure", function () {
  runTest(__dirname, "ensure", true);
});

it("match", function () {
  runTest(__dirname, "match", true);
});

it("tag", function () {
  runJsxTest(__dirname, "tag", true);
});

it("text", function () {
  runJsxTest(__dirname, "text", true);
});

it("text 2", function () {
  runJsxTest(__dirname, "text-2", true);
});

it("child", function () {
  runJsxTest(__dirname, "child", true);
});

it("page", function () {
  runTest(__dirname, "page", true);
});
