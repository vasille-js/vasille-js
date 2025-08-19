import { runJsxTest, runTest, throwTest } from "../run-test";

it("compose function", function () {
  runJsxTest(__dirname, "compose");
});

it("mesh statement function", function () {
  runTest(__dirname, "mesh-statement", false);
});

it("mesh expression function", function () {
  runTest(__dirname, "mesh-expression", false);
});

it("export default class", function () {
  runTest(__dirname, "default-class", false);
});

it("export default function", function () {
  runTest(__dirname, "default-fn", false);
});

it("export default expression", function () {
  runTest(__dirname, "default-expr", false);
});

it("run on destroy", function () {
  runTest(__dirname, "run-on-destroy", false);
});

it("reactive field set", function () {
  runTest(__dirname, "reactive-field-set", false);
});

it("store function", function () {
  runJsxTest(__dirname, "store");
});

it("reactive object status track", function () {
  runJsxTest(__dirname, "reactive-object");
});

it("invalid compose call error", function () {
  throwTest(__dirname, "invalid-compose-call", "Invalid arguments");
});

it("style hint error", function () {
  throwTest(__dirname, "style-hint", "Usage of hints is restricted here");
});

it("calculate call error", function () {
  throwTest(__dirname, "calculate-call", "Argument of calculate must be a function");
});

it("store reactive value name error", function () {
  throwTest(__dirname, "store-reactive-value", "Reactive field name must start with $");
});

it("store not reactive value name error", function () {
  throwTest(__dirname, "store-not-reactive-value", "Method name can not start with $");
});

it("jsx fragment error", function () {
  throwTest(__dirname, "jsx-fragment", "JSX fragment is not allowed here", true);
});

it("jsx element error", function () {
  throwTest(__dirname, "jsx-element", "JSX element is not allowed here", true);
});

it("store jsx error", function () {
  throwTest(__dirname, "store-jsx", "JSX is not allowed in states", true);
});

it("array model not const error", function () {
  throwTest(__dirname, "array-model-const", "Array models must be declared as constants");
});

it("map model not const error", function () {
  throwTest(__dirname, "map-model-const", "Map models must be declared as constants");
});

it("set model not const error", function () {
  throwTest(__dirname, "set-model-const", "Set models must be declared as constants");
});

it("array not const error", function () {
  throwTest(__dirname, "array-const", "Arrays must be must be declared as constants");
});

it("map not const error", function () {
  throwTest(__dirname, "map-const", "Map models must be declared as constants");
});

it("set not const error", function () {
  throwTest(__dirname, "set-const", "Set models must be declared as constants");
});

it("compose wrong arg number error", function () {
  throwTest(__dirname, "compose-arg-number", "Extra parameters are not allowed", true);
});

it("compose nested destruction error", function () {
  throwTest(__dirname, "compose-nested-destruction", "You can not destruct a reactive value");
});

it("run on destroy error", function () {
  throwTest(__dirname, "run-on-destroy", "Stores in Vasille.JS are not destroyable");
});

it("param name starts with $", function () {
  throwTest(__dirname, "param-name", "Non-reactive variable name must not start with $");
});

it("param name in array destruction starts with $", function () {
  throwTest(__dirname, "param-name-destruction", "Non-reactive variable name must not start with $");
});

it("param name of rest element starts with $", function () {
  throwTest(__dirname, "param-name-rest", "Non-reactive variable name must not start with $");
});

it("param name with default value starts with $", function () {
  throwTest(__dirname, "param-name-with-default-value", "Non-reactive variable name must not start with $");
});

it("function name starts with $", function () {
  throwTest(__dirname, "function-name", "Non-reactive variable name must not start with $");
});

it("class name starts with $", function () {
  throwTest(__dirname, "class-name", "Non-reactive variable name must not start with $");
});

it("class expression name starts with $", function () {
  throwTest(__dirname, "class-name-expression", "Non-reactive variable name must not start with $");
});
