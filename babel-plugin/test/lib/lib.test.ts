import { throwTest } from "../run-test";

it("incorrect number of arguments error", function () {
  throwTest(__dirname, "incorrect-args-number", "Incorrect number of arguments");
});

it("incorrect number of properties error", function () {
  throwTest(__dirname, "incorrect-props-number", "Argument of calculate cannot have parameters");
});

it("first argument id not a function error", function () {
  throwTest(__dirname, "arg-not-func", "Argument of calculate must be a function");
});
