import div from "./div.js";
import divWithClass from "./div-with-class.js";
import divWithText from "./div-with-text.js";
import text from "./text.js";
import divEmbed from "./div-embed.js";
import { runTest } from "../run-test.js";

it("div test", async () => {
    await runTest(div, "core/div");
});

it("div with class test", async () => {
    await runTest(divWithClass, "core/div-with-class");
});

it("div with text test", async () => {
    await runTest(divWithText, "core/div-with-text");
});

it("text test", async () => {
    await runTest(text, "core/text");
});

it("embed test", async () => {
    await runTest(divEmbed, "core/div-embed");
});
