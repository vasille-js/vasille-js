import { runTest, throwTest } from "../run-test";

it("router test", function () {
  runTest(__dirname, "router");
});

it("bridge/router global import", function () {
  runTest(__dirname, "global-import");
});

it("bind test", function () {
  runTest(__dirname, "bind");
});

it("module level reactivity test", function () {
  runTest(__dirname, "module-level-reactivity");
});

it("object property key-value match test", function () {
  runTest(__dirname, "object-property-match");
});

it("router outside of compose error", function () {
  throwTest(__dirname, "router", "Usage of hints is restricted here");
});

it("router in store error 1", function () {
  throwTest(__dirname, "router-in-store-1", "The router is not available in stores");
});

it("router in store error 2", function () {
  throwTest(__dirname, "router-in-store-2", "The router is not available in stores");
});

it("router in store error 3", function () {
  throwTest(__dirname, "router-in-store-3", "The router is not available in stores");
});

it("bind in object error", function () {
  throwTest(__dirname, "bind-in-object", "Objects can not contains bind expressions");
});

it("field renaming error", function () {
  throwTest(__dirname, "field-renaming", 'Property "$a" can not be renamed to "a": rename it to "$a"');
});

it("field renaming error 2", function () {
  throwTest(__dirname, "field-renaming-2", 'Property "a" can not be renamed to "$a": rename it to "a"');
});

it("property is not reactive error", function () {
  throwTest(__dirname, "prop-not-reactive", "This property is not a reactive");
});

it("raw without args error", function () {
  throwTest(__dirname, "raw-no-args", "Failed to parse raw value");
});

it("beforeMount arg error", function () {
  throwTest(__dirname, "before-mount-arg", "Incorrect hint argument");
});
