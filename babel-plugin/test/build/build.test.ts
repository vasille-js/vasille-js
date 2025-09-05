import { runTest } from "../run-test";

it("SSG test", function() {
  runTest(__dirname, "ssg", true, false, {replaceWeb: "vasille-ssg"});
});
