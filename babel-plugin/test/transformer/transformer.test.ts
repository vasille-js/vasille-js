import { fileURLToPath } from "node:url";
import path from "path";
import { runTest } from "../run-test";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

it("no import", function () {
  runTest(__dirname, "no-import");
});

it("web global import", function () {
  runTest(__dirname, "web-global");
});

it("web style only import", function () {
  runTest(__dirname, "web-partial");
});
