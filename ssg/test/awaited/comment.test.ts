import {runTest} from "../run-test.js";
import comment from "./comment.js";

it("comment test", async () => {
  await runTest(comment, "awaited/comment");
});
