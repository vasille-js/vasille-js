import { Fragment, IValue, Reference, setErrorHandler } from "vasille";
import { mvvmView, mvcView, hybridView, mount } from "../src/index.js";
import { readValue } from "../src/components.js";
import { createNode } from "./page.js";

interface Props {
    className?: string;
    number?: number;
    slot?(node: Fragment<Node, Element, object>): void;
}

const mvvm = mvvmView(function (f, $: Props) {
    let div!: Element;

    f.tag("div", {
        slot: readValue($.slot),
        class: [readValue($.className) ?? "class"],
        callback: node => (div = node),
    });

    return { div, className: $.className };
}, "test");

const mvc = mvcView(function (f, $: Pick<Props, "className" | "slot">) {
    return { class: $.className };
}, "test");

const hybrid = hybridView(
    function (f, $: Pick<Props, "number" | "className" | "slot">) {
        return [$.className, $.number];
    },
    ["className"],
    "test",
);

it("MVVM test", function () {
    const [node, window] = createNode();
    const body = window.document.body;
    let div!: Element;

    mount(body, mvvm, node.runner, { callback: node => (div = node?.div as Element) });
    expect(div).toBeInstanceOf(window.Element);
    expect(div.children.length).toBe(0);

    mount(body, mvvm, node.runner, {
        callback: node => (div = node?.div as Element),
        slot(f: Fragment<Node, Element, object>) {
            f.tag("div", { class: ["1"] });
        },
    });

    expect(div.children.length).toBe(1);
    expect(div.children[0].className).toBe("1");
    expect(() => mvvm({})).toThrow("Vasille: Component context is missing");

    mount(body, mvvm, node.runner, {
        callback: node => {
            div = node?.div as Element;
            expect(node?.className).toBeInstanceOf(IValue);
            expect((node?.className as any)?.$).toBe("replaced");
        },
        slot(f: Fragment<Node, Element, object>) {
            mvvm({}, f, function (f: Fragment<Node, Element, object>) {
                f.tag("div", { class: ["2"] });
            });
        },
        className: "replaced",
    });

    expect(div.children.length).toBe(1);
    expect(div.className).toBe("replaced");
    expect(div.children[0].children.length).toBe(1);
    expect(div.children[0].children[0].className).toBe("2");
});

it("MVC test", function () {
    const [node, window] = createNode();
    const body = window.document.body;
    let count = 0;

    mount(body, mvc, node.runner, {
        callback: className => {
            expect(className?.class).toBe("string");
            count++;
        },
        className: "string",
    });

    mount(body, mvc, node.runner, {
        callback: className => {
            expect(className?.class).toBeUndefined();
            count++;
        },
    });

    expect(count).toBe(2);
});

it("Hybrid test", function () {
    const [node, window] = createNode();
    const body = window.document.body;
    let count = 0;

    mount(body, hybrid, node.runner, {
        callback: data => {
            expect(data?.[0]).toBe("string");
            expect(data?.[1]).toBeInstanceOf(IValue);
            expect((data?.[1] as unknown as IValue<number>).$).toBe(3);
            count++;
        },
        className: "string",
        number: 3,
    });

    mount(body, hybrid, node.runner, {
        callback: data => {
            expect(data?.[0]).toBeUndefined();
            expect(data?.[1]).toBeInstanceOf(IValue);
            count++;
        },
    });

    expect(count).toBe(2);
});

it("throw test", function () {
    const [node, window] = createNode();
    const e = new Error("test");
    const throwC = mvvmView(function ($) {
        throw e;
    }, "test");
    let handled: Error | undefined;

    setErrorHandler(e => (handled = e as Error));

    mount(window.document.body, throwC, node.runner, {});
    expect(handled).toBe(e);
});

interface IValueProps {
    string?: IValue<string>;
    number?: number;
    slot?(node: Fragment<Node, Element, object>): void;
}

const mvvmIValue = mvvmView(function (_, $: IValueProps) {
    return { test: $.string };
}, "test");

const mvcIValue = mvcView(function (f, $: IValueProps) {
    return { test: $.string };
}, "test");

const hybridIValue1 = hybridView(
    function (f, $: IValueProps) {
        return { test: $.string, number: $.number };
    },
    [],
    "test",
);

const hybridIValue2 = hybridView(
    function (f, $: IValueProps) {
        return { test: $.string, number: $.number };
    },
    ["number"],
    "test",
);

const hybridIValue3 = hybridView(
    function (f, $: IValueProps) {
        return { test: $.string, number: $.number };
    },
    ["number", "string"],
    "test",
);

it("IValue keep test", function () {
    const [node, window] = createNode();
    const body = window.document.body;
    const string = new Reference("test");
    let count = 0;

    mount(body, mvvmIValue, node.runner, {
        callback(data) {
            expect(data?.test).toBe(string);
            count++;
        },
        string: string,
    });

    mount(body, hybridIValue1, node.runner, {
        callback(data) {
            expect(data?.test).toBe(string);
            expect(data?.number).toBeInstanceOf(IValue);
            count++;
        },
        string: string,
        number: 1,
    });

    mount(body, hybridIValue2, node.runner, {
        callback(data) {
            expect(data?.test).toBe(string);
            expect(data?.number).toBe(2);
            count++;
        },
        string: string,
        number: 2,
    });

    mount(body, hybridIValue3, node.runner, {
        callback() {
            // must not be executed
            // iValue field will throw error
            count = -1;
        },
        string: string,
        number: 2,
    });

    expect(() => {
        mount(body, mvcIValue, node.runner, {
            callback() {
                count = -2;
            },
            string: string,
        });
    }).toThrow("Vasille: Field string has a reactive value");

    expect(count).toBe(3);
});
