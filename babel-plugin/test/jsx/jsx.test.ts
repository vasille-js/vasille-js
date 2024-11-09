import { runJsxTest } from "../run-test";

it("attr", function () {
  runJsxTest(__dirname, "attr");
});

it("bind", function () {
  runJsxTest(__dirname, "bind");
});

it("class", function () {
  runJsxTest(__dirname, "class");
});

it("events", function () {
  runJsxTest(__dirname, "events");
});

it("style", function () {
  runJsxTest(__dirname, "style");
});
