import view, { runViewDirectly, controller } from "./view.js";
import modal, { runModalDirectly } from "./modal.js";
import { runTest } from "../run-test.js";
import { mount, prompt } from "../../src/index.js";

it("view component", async function () {
    await runTest(view, "compose/view");
    expect(() => controller?.promptError()).toThrow("User input is not supported in SSG");
});

it("view component throw", function () {
    expect(() => runViewDirectly()).toThrow("Vasille: Component context is missing");
});

it("modal component", async function () {
    await runTest(modal, "compose/modal");
});

it("modal throw", function () {
    expect(() => runModalDirectly()).toThrow("Vasille: Modal context is missing");
});

it("mount throw", function () {
    expect(() => mount()).toThrow("SSG app can not be mounted");
});
