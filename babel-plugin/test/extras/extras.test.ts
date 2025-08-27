import { runJsxTest } from "../run-test";

it("SlotTest.tsx", function () {
  runJsxTest(__dirname, "SlotTest");
});

it("set-model.tsx", function () {
  runJsxTest(__dirname, "set-model");
});

it("calculate.tsx", function () {
  runJsxTest(__dirname, "calculate");
});
