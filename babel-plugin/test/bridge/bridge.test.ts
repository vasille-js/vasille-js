import { runJsxTest, runTest, throwTest } from "../run-test";

it("bridge test", function () {
  runTest(__dirname, "bridge");
});

it("bridge jsx test", function () {
  runJsxTest(__dirname, "jsx");
});

it("router test", function () {
  runTest(__dirname, "router");
});

it("bridge/router global import", function () {
  runTest(__dirname, "global-import");
});

it("router outside of compose error", function () {
  throwTest(__dirname, "router", 'Usage of hint "router" is restricted here');
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

it("bridge not 1 arg error", function () {
  throwTest(__dirname, "bridge-not-1-arg", "Expected 1 argument");
});

it("bridge not 2 args error", function () {
  throwTest(__dirname, "bridge-not-2-args", "Expected 2 arguments");
});

it("bridge method not found error", function () {
  throwTest(__dirname, "bridge-not-found", 'Unknown bridge method "value2"');
});
