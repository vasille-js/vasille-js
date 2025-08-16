import { runJsxTest, runTest, throwTest } from "../run-test";

it("router test", function () {
  runTest(__dirname, "router");
});

it("bridge/router global import", function () {
  runTest(__dirname, "global-import");
});

it("router outside of compose error", function () {
  throwTest(__dirname, "router", 'Usage of hints is restricted here');
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
