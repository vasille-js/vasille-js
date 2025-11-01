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

it("callback", function () {
  runJsxTest(__dirname, "callback");
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

it("backward", function () {
  runJsxTest(__dirname, "backward");
});

it("forward", function () {
  runJsxTest(__dirname, "forward");
});

it("default prop value", function () {
  runJsxTest(__dirname, "default-prop");
});

it("conditions test", function () {
  runJsxTest(__dirname, "conditions");
});

it("conditional binary", function () {
  runJsxTest(__dirname, "conditional-binary");
});

it("conditional ternary", function () {
  runJsxTest(__dirname, "conditional-ternary");
});

it("conditional mixed", function () {
  runJsxTest(__dirname, "conditional-mixed");
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

it("backward const value error", function () {
  throwTest(__dirname, "backward-const", "The backward argument is not reactive", true);
});

it("backward forward-only value error", function () {
  throwTest(
    __dirname,
    "backward-forward-only",
    "A reactive variable or object field expected, reactive expression are forward only",
    true,
  );
});

it("backward missing argument error", function () {
  throwTest(__dirname, "backward-missing-argument", "The argument is missing", true);
});

it("forward const value error", function () {
  throwTest(__dirname, "forward-const", "A reactive expression expected, argument value is constant", true);
});

it("forward missing argument error", function () {
  throwTest(__dirname, "forward-missing-argument", "The argument is missing", true);
});

it("condition spread attribute error", function () {
  throwTest(
    __dirname,
    "conditions-spread",
    "If, Else and ElseIf are syntax sugar, use Switch if you need more runtime elasticity",
    true,
  );
});

it("condition unexpected else error", function () {
  throwTest(__dirname, "conditions-else", "Malformed JSX If tag is missing", true);
});

it("condition unexpected else-if error", function () {
  throwTest(__dirname, "conditions-else-if", "Malformed JSX If tag is missing", true);
});
