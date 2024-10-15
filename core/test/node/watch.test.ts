import { App, Fragment, Reference } from "../../src";
import { page } from "../page";
import { Watch } from "../../src/node/watch";

it("Watch Test", function () {
    const model = new Reference(false);
    const root = new App(page.window.document.body, {});
    let test = true;

    root.create(new Watch({ model }), (node, input) => {
        node.create(new Fragment({}), () => (test = input));
    });

    expect(test).toBe(false);
    model.$ = true;
    expect(test).toBe(true);
});
