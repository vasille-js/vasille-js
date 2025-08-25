import { throwTest } from "../run-test";

it("component not uppercase error", function () {
  throwTest(__dirname, "component-not-uppercase", "The component name must start with a uppercase letter", false, true);
});

it("components folder test", function () {
  throwTest(__dirname, "components-folder", "Components must be placed in a folder named `components`", false, true);
});

it("export filename error", function () {
  throwTest(
    __dirname,
    "export",
    "File name is not correct, expected MyView.ts, MyView.tsx, MyView.js or MyView.jsx",
    false,
    false,
  );
});

it("modal missing suffix error", function () {
  throwTest(__dirname, "modal-missing-suffix", "The modal component name must end with `Modal`", false, true);
});

it("modal not uppercase error", function () {
  throwTest(
    __dirname,
    "modal-not-uppercase",
    "The modal component name must start with a uppercase letter",
    false,
    true,
  );
});

it("modals folder test", function () {
  throwTest(__dirname, "modals-folder", "Modals must be placed in a folder named `modals`", false, true);
});

it("model missing suffix error", function () {
  throwTest(
    __dirname,
    "model-missing-suffix",
    "The model constructor function name must end with `Model`",
    false,
    true,
  );
});

it("model not lowercase error", function () {
  throwTest(
    __dirname,
    "model-not-lowercase",
    "The model constructor function name must start with a lowercase letter",
    false,
    true,
  );
});

it("models folder test", function () {
  throwTest(__dirname, "models-folder", "Models must be placed in a folder named `models`", false, true);
});

it("page named export error", function () {
  throwTest(__dirname, "page", "Use export default instead", false, true);
});

it("prompt missing prefix error", function () {
  throwTest(__dirname, "prompt-missing-prefix", "The prompt function name must start with `prompt`", false, true);
});

it("prompts folder test", function () {
  throwTest(__dirname, "prompts-folder", "Prompts must be placed in a folder named `prompts`", false, true);
});

it("store missing suffix error", function () {
  throwTest(__dirname, "store-missing-suffix", "The store name must end with `Store`", false, true);
});

it("store not lowercase error", function () {
  throwTest(__dirname, "store-not-lowercase", "The store name must start with a lowercase letter", false, true);
});

it("stores folder test", function () {
  throwTest(__dirname, "stores-folder", "Stores must be placed in a folder named `stores`", false, true);
});

it("view missing suffix error", function () {
  throwTest(__dirname, "view-missing-suffix", "The view name must end with `View`", false, true);
});

it("view not uppercase error", function () {
  throwTest(__dirname, "view-not-uppercase", "The view name must start with a uppercase letter", false, true);
});

it("views folder test", function () {
  throwTest(__dirname, "views-folder", "Views must be placed in a folder named `views`", false, true);
});
