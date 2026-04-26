import { runTest } from "../run-test";

it("HMR", function () {
  runTest(__dirname, "Hmr", true, false, { hmr: true });
});
