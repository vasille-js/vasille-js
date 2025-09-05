import css from './css.js';
import {runTest} from "../run-test.js";

it("CSS test", async () => {
  await runTest(css, "css/css");
})