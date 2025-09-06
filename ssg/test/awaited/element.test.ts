import { runTest } from "../run-test.js";
import element from "./element.js";

it("element test", async () => {
    await runTest(element, "awaited/element");
});
