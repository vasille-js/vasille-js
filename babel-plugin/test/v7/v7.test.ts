import { runJsxTest, runTest } from "../run-test";

it("HMR", function () {
  runTest(__dirname, "Hmr", true, false, { hmr: true });
});

it("composes async", function () {
  runJsxTest(__dirname, "async-composing", false, { asyncComposing: true });
});

it("has string event", function () {
  runJsxTest(__dirname, "string-event");
});
