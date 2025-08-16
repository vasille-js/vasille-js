import { runJsxTest, throwTest } from "../run-test";

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

it("spread child error", function () {
  throwTest(__dirname, "spread-child", "Spread child is not supported", true);
});

it("expected event handler error", function () {
  throwTest(__dirname, "expected-event-handler", "Expected event handler", true);
});

it("method in class object error", function () {
  throwTest(__dirname, "method-class-object", "Methods are not allowed here", true);
});

it("method in style object error", function () {
  throwTest(__dirname, "method-style-object", "Methods are not allowed here", true);
});

it("wrong namespace error", function () {
  throwTest(__dirname, "wrong-namespace", "Only bind namespace is supported", true);
});

it("tag spread attribute error", function () {
  throwTest(__dirname, "tag-spread-attr", "Spread attribute is not allowed on HTML tags", true);
});

it("namespaced props error", function () {
  throwTest(__dirname, "namespace-props", "Namespaced attributes names are not supported", true);
});

it("namespaced tag name error", function () {
  throwTest(
    __dirname,
    "namespaced-name",
    "Unsupported tag detected, html lowercase tag names and components are accepted",
    true,
  );
});
