import head from "./head.js";
import body from "./body.js";
import { runTest } from "../run-test.js";

it("head test", async () => {
    await runTest(head, "extra-tags/head");
});

it("body test", async () => {
    await runTest(body, "extra-tags/body");
});
