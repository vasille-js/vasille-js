import { runTest } from "../run-test";

it("component test", function () {
  runTest(__dirname, "component");
});

it("compose test", function () {
  runTest(__dirname, "compose");
});

it("modal test", function () {
  runTest(__dirname, "modal");
});

it("model test", function () {
  runTest(__dirname, "model");
});

it("prompt test", function () {
  runTest(__dirname, "prompt");
});

it("store test", function () {
  runTest(__dirname, "store");
});

it("view test", function () {
  runTest(__dirname, "view");
});
