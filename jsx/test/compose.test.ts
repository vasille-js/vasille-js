import { Fragment, IValue, Reactive, Reference, setErrorHandler } from "vasille";
import { model } from "../src/compose.js";
import { view, mount, ref, expr } from "../src/index.js";
import { createNode } from "./page.js";

interface Props {
    className?: string;
    number?: number;
    slot?(node: Fragment<Node, Element, object>): void;
}

const mvc = view(function (f, $: Pick<Props, "className" | "slot">) {
    return { c: $.className };
});

const mvvm = view(function (f, $: Props) {
    let div!: Element;

    f.tag("div", {
        l: $.slot,
        c: [$.className ?? "class"],
        k: node => (div = node),
    });

    return { div, className: $.className };
});

const hybrid = view(function (f, $: Pick<Props, "number" | "className" | "slot">) {
    return [$.className, $.number];
});

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
            f.tag("div", { c: ["1"] });
        },
    });

    expect(div.children.length).toBe(1);
    expect(div.children[0].className).toBe("1");
    expect(() => mvvm({})).toThrow("Vasille: Component context is missing");

    mount(body, mvvm, node.runner, {
        callback: node => {
            div = node?.div as Element;
            expect(node?.className).toBe("replaced");
        },
        slot(f: Fragment<Node, Element, object>) {
            mvvm({}, f, function (f: Fragment<Node, Element, object>) {
                f.tag("div", { c: ["2"] });
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
            expect(className?.c).toBe("string");
            count++;
        },
        className: "string",
    });

    mount(body, mvc, node.runner, {
        callback: className => {
            expect(className?.c).toBeUndefined();
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
            expect(data?.[1]).toBe(3);
            count++;
        },
        className: "string",
        number: 3,
    });

    mount(body, hybrid, node.runner, {
        callback: data => {
            expect(data?.[0]).toBeUndefined();
            expect(data?.[1]).toBeUndefined();
            count++;
        },
    });

    expect(count).toBe(2);
});

it("throw test", function () {
    const [node, window] = createNode();
    const e = new Error("test");
    const throwC = view(function ($) {
        throw e;
    });
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

const mvvmIValue = view(function (_, $: IValueProps) {
    return { test: $.string };
});

const hybridIValue1 = view(function (f, $: IValueProps) {
    return { test: $.string, number: $.number };
});

const hybridIValue2 = view(function (f, $: IValueProps) {
    return { test: $.string, number: $.number };
});

it("IValue keep test", function () {
    const [node, window] = createNode();
    const body = window.document.body;
    const string = new Reference("test");
    let count = 0;

    mount(body, mvvmIValue, node.runner, {
        callback(data) {
            expect(data?.test).toBe(string);
            count += 1;
        },
        string: string,
    });

    mount(body, hybridIValue1, node.runner, {
        callback(data) {
            expect(data?.test).toBe(string);
            expect(data?.number).toBe(1);
            count += 10;
        },
        string: string,
        number: 1,
    });

    mount(body, hybridIValue2, node.runner, {
        callback(data) {
            expect(data?.test).toBe(string);
            expect(data?.number).toBe(2);
            count += 100;
        },
        string: string,
        number: 2,
    });

    expect(count).toBe(111);
});

const Model = model((ctx, { x }: { x: Reference<number> }) => {
    const a = ref(2);
    const b = expr(ctx, (a, x) => a + x, [a, x]);

    return { a, b, c: 10 };
});

it("model", function () {
    const root = new Reactive(0);
    const m1 = Model({ x: new Reference(1) }, root);
    const m2 = Model({ x: new Reference(1) });

    expect(m1.a).toBeInstanceOf(IValue);
    expect(m1.b).toBeInstanceOf(IValue);

    expect(m1.a.V).toBe(2);
    expect(m1.b.V).toBe(3);
    expect(m1.c).toBe(10);

    m1.a.V = 4;
    expect(m1.a.V).toBe(4);
    expect(m1.b.V).toBe(5);

    root.destroy(Infinity);
    m1.a.V = 7;
    m2.a.V = 7;
    expect(m1.a.V).toBe(7);
    // ok when value was not updated
    expect(m1.b.V).toBe(5);
    // of when value was updates
    expect(m2.b.V).toBe(8);
});
