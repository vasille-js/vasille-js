import { fileURLToPath } from "node:url";
import path from "path";
import { runJsxTest } from "../run-test";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

it("has JSX", function () {
  runJsxTest(__dirname, "has-jsx");
});

it("release mode", function () {
  runJsxTest(__dirname, "release-mode", false);
});
