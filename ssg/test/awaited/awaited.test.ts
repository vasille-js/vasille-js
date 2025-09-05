import throwJs from "./throw.js";
import throwSync from "./throw-sync.js";
import {runTest} from "../run-test.js";

it("throw test", async () => {
  await runTest(throwJs, "awaited/throw");
});

it("sync throw test", async () => {
  await runTest(throwSync, "awaited/throw-sync");
});
