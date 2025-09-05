import {runTest} from "../run-test.js";
import embed from "./embed.js";

it("embed test", async () => {
  await runTest(embed, "awaited/embed");
});
