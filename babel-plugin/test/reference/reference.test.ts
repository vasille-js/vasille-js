import { runTest, throwTest } from "../run-test";

it("const", function () {
  runTest(__dirname, "const");
});

it("let", function () {
  runTest(__dirname, "let");
});

it("let update", function () {
  runTest(__dirname, "let-update");
});

it("awaited", function () {
  runTest(__dirname, "awaited");
});

it("static expression", function () {
  runTest(__dirname, "expr-const");
});

it("dynamical expression", function () {
  runTest(__dirname, "expr-let");
});

it("meta expressions", function () {
  runTest(__dirname, "expr-meta");
});

it("watch", function () {
  runTest(__dirname, "watch");
});

it("models", function () {
  runTest(__dirname, "models");
});

it("const optional expr", function () {
  runTest(__dirname, "expr-const-optional");
});

it("local reactive in raw", function () {
  runTest(__dirname, "local-reactive");
});

it("error internal reactive", function () {
  throwTest(
    __dirname,
    "internal-reactive",
    "This value looks like a reactive but is not. Move code to standalone function or wrap value in raw call.",
  );
});
