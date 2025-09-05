import comment from "./comment.js";
import element from "./element.js";
import embed from "./embed.js";
import text from "./text.js";
import throwJs from "./throw.js";
import throwSync from "./throw-sync.js";
import {runTest} from "../run-test.js";

it("comment test", async () => {
  await runTest(comment, "awaited/comment");
});

it("element test", async () => {
  await runTest(element, "awaited/element");
});

it("embed test", async () => {
  await runTest(embed, "awaited/embed");
});

it("text test", async () => {
  await runTest(text, "awaited/text");
});

it("throw test", async () => {
  await runTest(throwJs, "awaited/throw");
});

it("sync throw test", async () => {
  await runTest(throwSync, "awaited/throw-sync");
});
