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

it("fragment", function () {
  runJsxTest(__dirname, "fragment");
});

it("children", function () {
  runJsxTest(__dirname, "children");
});

it("nested", function () {
  runJsxTest(__dirname, "nested");
});

it("nested-slots", function () {
  runJsxTest(__dirname, "nested-slots");
});

it("loop", function () {
  runJsxTest(__dirname, "loop");
});

it("reactive object proxy", function () {
  runJsxTest(__dirname, "rop");
});
