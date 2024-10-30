import { runTest } from "../run-test";

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
