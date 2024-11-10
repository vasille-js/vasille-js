import { Fragment, IValue, Reference, setErrorHandler } from "vasille";
import { compose, extend, mount } from "../src";
import { page } from "./page";
import { readValue } from "../src/components";

interface Props {
    className?: IValue<string>;
    slot?(node: Fragment): void;
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
    const body = page.window.document.body;
    let div!: Element;

    mount(body, component, { callback: node => (div = node as Element) });
    expect(div instanceof page.window.Element).toBe(true);
    expect(div.children.length).toBe(0);

    mount(body, component, {
        callback: node => (div = node as Element),
        slot(f: Fragment) {
            f.tag("div", { class: ["1"] });
        },
    });

    expect(div.children.length).toBe(1);
    expect(div.children[0].className).toBe("1");

    mount(body, component, {
        callback: node => (div = node as Element),
        slot(f: Fragment) {
            component(f, {}, function (f: Fragment) {
                f.tag("div", { class: ["2"] });
            });
        },
    });

    expect(div.children.length).toBe(1);
    expect(div.children[0].children.length).toBe(1);
    expect(div.children[0].children[0].className).toBe("2");
});

it("extend test", function () {
    const extension = extend(function (f) {
        f.tag("div", { class: ["ext"] });
    }, "extension");
    const body = page.window.document.body;
    let div!: Element;

    mount(body, component, {
        callback: node => (div = node as Element),
        className: new Reference("class2"),
        slot(f: Fragment) {
            extension(f, {});
        },
    });

    expect(div.className).toBe("class2 ext");
});

it("throw test", function () {
    const e = new Error("test");
    const throwC = compose(function ($) {
        throw e;
    }, "test");
    let handled: Error | undefined;

    setErrorHandler(e => (handled = e as Error));

    mount(page.window.document.body, throwC, {});
    expect(handled).toBe(e);
});
