import { fileURLToPath } from "node:url";
import path from "path";
import { runTest, throwTest } from "../run-test.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

it("string literal", function () {
  runTest(__dirname, "string-literal");
});

it("constant", function () {
  runTest(__dirname, "constant");
});

it("css", function () {
  runTest(__dirname, "css");
});

it("require context", function () {
  runTest(__dirname, "require-context");
});

it("awaited expect array pattern", function () {
  throwTest(__dirname, "awaited-not-arr", "Expected array pattern");
});
