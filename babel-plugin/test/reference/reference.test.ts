import { runTest } from "../run-test";

it("const", function () {
    runTest(__dirname, "const");
});

it("let", function () {
    runTest(__dirname, "let");
});

it("let update", function () {
    runTest(__dirname, "let-update");
});
