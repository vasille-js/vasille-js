import { runJsxTest, runTest } from "../run-test";

it("SSG test", function () {
  runJsxTest(__dirname, "ssg", false, {
    replaceWeb: "vasille-ssg",
    headTag: true,
    bodyTag: true,
  });
});

it("SSG no extra tags test", function () {
  runJsxTest(__dirname, "ssg-no-extra-tags", false, {
    replaceWeb: "vasille-ssg",
    headTag: false,
    bodyTag: false,
  });
});
