import { fileURLToPath } from "node:url";
import path from "path";
import { runJsxTest, runTest, throwTest } from "../run-test";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

it("state function", function () {
  runJsxTest(__dirname, "state");
});

it("reactive object status track", function () {
  runJsxTest(__dirname, "reactive-object");
});

it("invalid compose call error", function () {
  throwTest(__dirname, "invalid-compose-call", "Invalid arguments");
});

it("compose hint error", function () {
  throwTest(__dirname, "compose-hint", 'Usage of hint "ref" is restricted here');
});

it("style hint error", function () {
  throwTest(__dirname, "style-hint", 'Usage of style hint "prefersDark" is restricted here');
});

it("calculate call error", function () {
  throwTest(__dirname, "calculate-call", "Incorrect calculate argument");
});

it("state reactive value name error", function () {
  throwTest(__dirname, "state-reactive-value", "Reactive value property name must start with $");
});

it("state reactive object name error", function () {
  throwTest(__dirname, "state-reactive-object", "Reactive object property name must start with $$");
});

it("state spread element error", function () {
  throwTest(__dirname, "state-spread-element", "Spread element is not allowed here");
});

it("jsx fragment error", function () {
  throwTest(__dirname, "jsx-fragment", "JSX fragment is not allowed here", true);
});

it("jsx element error", function () {
  throwTest(__dirname, "jsx-element", "JSX element is not allowed here", true);
});

it("state jsx error", function () {
  throwTest(__dirname, "state-jsx", "JSX is not allowed in states", true);
});

it("reactive object not const error", function () {
  throwTest(__dirname, "reactive-object-const", "Reactive objects must be must be declared as constants");
});

it("reactive object wrong argument error", function () {
  throwTest(__dirname, "reactive-object-arg", "reactiveObject requires object expression as argument");
});

it("array model not const error", function () {
  throwTest(__dirname, "array-model-const", "Array models must be must be declared as constants");
});

it("map model not const error", function () {
  throwTest(__dirname, "map-model-const", "Map models must be declared as constants");
});

it("set model not const error", function () {
  throwTest(__dirname, "set-model-const", "Set models must be declared as constants");
});

it("object not const error", function () {
  throwTest(__dirname, "object-const", "Objects must be must be declared as constants");
});

it("array not const error", function () {
  throwTest(__dirname, "array-const", "Arrays must be must be declared as constants");
});

it("map not const error", function () {
  throwTest(__dirname, "map-const", "Maps must be declared as constants");
});

it("set not const error", function () {
  throwTest(__dirname, "set-const", "Sets must be declared as constants");
});

it("compose wrong arg number error", function () {
  throwTest(__dirname, "compose-arg-number", "JSX component must have no more then 1 parameter", true);
});

it("compose default props error", function () {
  throwTest(__dirname, "compose-default-props", "No default value allowed here");
});

it("compose nested destruction error", function () {
  throwTest(__dirname, "compose-nested-destruction", "Value decomposition is not allowed here");
});

it("compose rest arg error", function () {
  throwTest(__dirname, "compose-rest", "Expected identifier or object pattern");
});
