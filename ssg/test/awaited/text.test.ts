import { runTest } from "../run-test.js";
import text from "./text.js";

it("text test", async () => {
    await runTest(text, "awaited/text");
});
