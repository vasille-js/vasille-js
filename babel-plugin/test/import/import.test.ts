import { runTest } from "../run-test";

it("global import", function () {
    runTest(__dirname, "global");
});

it("selective import", function () {
    runTest(__dirname, "selective");
});
