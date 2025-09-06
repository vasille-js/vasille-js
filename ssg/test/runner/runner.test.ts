import { runTest } from "../run-test.js";
import attr from "./attr.js";
import classScreen from "./class.js";
import styleScreen from "./style.js";

it("attribute test", async () => {
    await runTest(attr, "runner/attr");
});

it("class test", async () => {
    await runTest(classScreen, "runner/class");
});

it("style test", async () => {
    await runTest(styleScreen, "runner/style");
});
