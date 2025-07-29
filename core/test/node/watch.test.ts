import { App, Fragment, Reference, Watch } from "../../src/index.js";
import { Runner } from "../../src/runner/web/runner.js";
import { page } from "../page.js";

it("Watch Test", function () {
    const model = new Reference(false);
    const window = page();
    const runner = new Runner(true, window.document);
    const root = new App(window.document.body, runner, {});
    let test = true;

    root.create(
        new Watch(
            {
                model,
                slot: function (node, input) {
                    node.create(new Fragment({}, runner), () => (test = input));
                },
            },
            runner,
        ),
    );

    root.create(new Watch({ model }, runner));

    expect(test).toBe(false);
    model.$ = true;
    expect(test).toBe(true);
    expect(root.children.size).toBe(2);
});
