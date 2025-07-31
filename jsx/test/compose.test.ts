import { Fragment, IValue, Reference, setErrorHandler } from "vasille";
import { compose, mount } from "../src/index.js";
import { readValue } from "../src/components.js";
import { createNode } from "./page.js";

interface Props {
    className?: IValue<string>;
    slot?(node: Fragment<Node, Element, object>): void;
}

const component = compose(function (f, $: Props) {
    let div!: Element;

    f.tag("div", {
        slot: readValue($.slot),
        class: [readValue($.className) ?? "class"],
        callback: node => (div = node),
    });

    return div;
}, "test");

it("compose test", function () {
    const [node, window] = createNode();
    const body = window.document.body;
    let div!: Element;

    mount(body, component, node.runner, { callback: node => (div = node as Element) });
    expect(div instanceof window.Element).toBe(true);
    expect(div.children.length).toBe(0);

    mount(body, component, node.runner, {
        callback: node => (div = node as Element),
        slot(f: Fragment<Node, Element, object>) {
            f.tag("div", { class: ["1"] });
        },
    });

    expect(div.children.length).toBe(1);
    expect(div.children[0].className).toBe("1");

    mount(body, component, node.runner, {
        callback: node => (div = node as Element),
        slot(f: Fragment<Node, Element, object>) {
            component(f, {}, function (f: Fragment<Node, Element, object>) {
                f.tag("div", { class: ["2"] });
            });
        },
        className: new Reference("replaced"),
    });

    expect(div.children.length).toBe(1);
    expect(div.className).toBe("replaced");
    expect(div.children[0].children.length).toBe(1);
    expect(div.children[0].children[0].className).toBe("2");
});

it("throw test", function () {
    const [node, window] = createNode();
    const e = new Error("test");
    const throwC = compose(function ($) {
        throw e;
    }, "test");
    let handled: Error | undefined;

    setErrorHandler(e => (handled = e as Error));

    mount(window.document.body, throwC, node.runner, {});
    expect(handled).toBe(e);
});
