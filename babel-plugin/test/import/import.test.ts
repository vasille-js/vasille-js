import { fileURLToPath } from "node:url";
import path from "path";
import { runTest } from "../run-test";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

it("global import", function () {
  runTest(__dirname, "global");
});

it("selective import", function () {
  runTest(__dirname, "selective");
});

it("override global", function () {
  runTest(__dirname, "override-global");
});

it("override by let", function () {
  runTest(__dirname, "override-by-let");
});

it("override by function", function () {
  runTest(__dirname, "override-by-function");
});

it("override by function expression", function () {
  runTest(__dirname, "override-by-fn-expr");
});
