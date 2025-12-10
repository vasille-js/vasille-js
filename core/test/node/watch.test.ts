import { App, Fragment, Reference, Watch } from "../../src/index.js";
import { Runner, TagOptions } from "../../src/runner/web/runner.js";
import { page } from "../page.js";

it("Watch Test", function () {
    const model = new Reference(false);
    const window = page();
    const runner = new Runner(window.document);
    const body = window.document.body;
    const root = new App<Node, Element, TagOptions>(body, runner);

    root.create(
        new Watch<Node, Element, TagOptions, boolean>(
            {
                model,
                slot: function (node, input) {
                    node.create(new Fragment<Node, Element, TagOptions>(runner), ctx => {
                        ctx.tag("div", {}, ctx => {
                            ctx.text(input);
                        });
                    });
                },
            },
            runner,
        ),
    );

    root.create(new Watch<Node, Element, TagOptions, boolean>({ model }, runner));

    expect(body.children.length).toBe(1);
    expect(body.children[0].innerHTML).toBe("false");
    model.V = true;
    expect(body.children[0].innerHTML).toBe("true");
    expect(root.children.size).toBe(2);

    root.destroy();

    expect(body.children.length).toBe(0);
});
