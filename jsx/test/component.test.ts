import { ArrayModel, Fragment, IValue, MapModel, Reference, setErrorHandler, SetModel } from "vasille";
import {
    arrayModel,
    ArrayModelView,
    ArrayView,
    Delay,
    For,
    mapModel,
    MapModelView,
    QueuedRender,
    ref,
    setModel,
    SetModelView,
    Slot,
    Switch,
    Watch,
} from "../src/index.js";
import { createNode } from "./page.js";

it("Slot", function () {
    const [node] = createNode();
    let slotTest = false;
    let modelTest = false;
    let modelTest2 = false;
    let modelTest2_1 = false;
    let mustBeValue: unknown = null;
    let mustBeRef: unknown = null;

    Slot({}, node);
    Slot({}, node, () => {
        slotTest = true;
    });
    Slot(
        {
            model() {
                modelTest = true;
            },
        },
        node,
    );
    Slot(
        {
            model() {
                modelTest2 = true;
            },
        },
        node,
        () => {
            modelTest2 = false;
        },
    );
    Slot(
        {
            slot() {
                modelTest2_1 = true;
            },
        },
        node,
    );
    Slot(
        {
            model(o: object) {
                mustBeValue = "a" in o && o.a;
            },
            a: 2,
        } as any,
        node,
    );
    Slot(
        {
            model(o: object) {
                mustBeRef = "a" in o && o.a;
            },
            a: new Reference(2),
        } as any,
        node,
    );

    expect(slotTest).toBe(true);
    expect(modelTest).toBe(true);
    expect(modelTest2).toBe(true);
    expect(modelTest2_1).toBe(true);
    expect(mustBeValue).toBe(2);
    expect(mustBeRef instanceof IValue).toBe(true);

    let handled = false;
    const error = new Error();

    setErrorHandler(e => {
        handled = true;
        expect(e).toBe(error);
    });
    Slot(
        {
            model() {
                throw error;
            },
        },
        node,
    );
    expect(handled).toBe(true);
});

it("For", function () {
    const [node] = createNode();
    let counter = 0;

    function slot() {
        counter++;
    }

    expect(() => For({ of: 3 as any, slot }, this)).toThrow("wrong-model");
    For({ of: 3 as any }, node);
    expect(counter).toBe(0);
    For({ of: arrayModel(undefined, [1, 2, 3]), slot }, node);
    expect(counter).toBe(3);
    For({ of: setModel(undefined, [1, 1]), slot }, node);
    expect(counter).toBe(4);
    For(
        {
            of: mapModel(undefined, [
                [1, 1],
                [2, 2],
            ]),
        },
        node,
        slot,
    );
    expect(counter).toBe(6);
    For({ of: [1, 2, 3], slot }, node);
    expect(counter).toBe(9);
    For({ of: new Set([1, 2, 1]), slot }, node);
    expect(counter).toBe(11);
    For({ of: new Map([[1, 1]]), slot }, node);
    expect(counter).toBe(12);
});

it("Watch", function () {
    const [node] = createNode();
    const ref = new Reference(1);
    let counter = 0;

    function slot() {
        counter++;
    }

    Watch({ $model: ref }, node, slot);

    expect(counter).toBe(1);
    ref.V = 2;
    expect(counter).toBe(2);
});

it("Delay", function (done) {
    const [node, window] = createNode();
    let element!: HTMLElement;

    node.tag("div", { k: n => (element = n as HTMLElement) }, function (f) {
        Delay({ time: 10 }, f, (f: Fragment<Node, Element, object>) => {
            f.tag("div", {});
        });
        Delay({ time: 20 }, f, (f: Fragment<Node, Element, object>) => {
            f.tag("div", {});
        });
    });

    expect(element.children.length).toBe(0);
    setTimeout(() => {
        expect(element.children.length).toBe(1);
        node.destroy();
        setTimeout(() => {
            expect(element.children.length).toBe(1);
            expect(window.document.body.children.length).toBe(0);
            done();
        }, 20);
    }, 10);
});

it("Switch", function () {
    const [node] = createNode();
    const ref = new Reference(true);
    let element!: Element;

    node.tag("div", {
        k: n => (element = n),
        l(node) {
            Switch(
                {
                    cases: [
                        {
                            $case: ref,
                            slot(node) {
                                node.text("true");
                            },
                        },
                    ],
                    default(node) {
                        node.text("false");
                    },
                },
                node,
            );
        },
    });

    expect(element.childNodes.length).toBe(1);
    expect((element.childNodes[0] as Text).textContent).toBe("true");
    ref.V = false;
    expect((element.childNodes[0] as Text).textContent).toBe("false");
});

it("ArrayView", function () {
    const [node, window] = createNode();
    const body = window.document.body;

    ArrayView(
        {
            of: ref([{ id: 0, value: 1 }]),
            key: i => i.id,
            slot(f: Fragment<Node, Element, object>, value) {
                f.text(value.V.value);
            },
        },
        node,
    );

    expect(body.innerHTML.trim()).toBe("1");

    node.destroy();
    expect(body.innerHTML.trim()).toBe("");
});

it("ArrayModelView", function () {
    const [node, window] = createNode();
    const body = window.document.body;

    ArrayModelView(
        {
            of: new ArrayModel([{ id: 0, value: 1 }]),
            slot(f: Fragment<Node, Element, object>, value) {
                f.text(value.value);
            },
        },
        node,
    );

    expect(body.innerHTML.trim()).toBe("1");

    node.destroy();
    expect(body.innerHTML.trim()).toBe("");
});

it("SetModelView", function () {
    const [node, window] = createNode();
    const body = window.document.body;

    SetModelView(
        {
            of: new SetModel([{ id: 0, value: 1 }]),
            slot(f: Fragment<Node, Element, object>, value) {
                f.text(value.value);
            },
        },
        node,
    );

    expect(body.innerHTML.trim()).toBe("1");

    node.destroy();
    expect(body.innerHTML.trim()).toBe("");
});

it("MapModelView", function () {
    const [node, window] = createNode();
    const body = window.document.body;

    MapModelView(
        {
            of: new MapModel([[0, { value: 1 }]]),
            slot(f: Fragment<Node, Element, object>, value) {
                f.text(value.V.value);
            },
        },
        node,
    );

    expect(body.innerHTML.trim()).toBe("1");

    node.destroy();
    expect(body.innerHTML.trim()).toBe("");
});

it("QueuedRender", function (done) {
    const [node, window] = createNode();
    const body = window.document.body;

    QueuedRender({ priority: "low" }, node, (f: Fragment<Node, Element, object>) => {
        f.text("1");
    });
    QueuedRender({ priority: "high" }, node, (f: Fragment<Node, Element, object>) => {
        f.text("2");
    });

    setTimeout(() => {
        expect(body.innerHTML.trim()).toBe("12");
        node.destroy();
        done();
    }, 10);
});

it("QueuedRender cancel", function (done) {
    const [node, window] = createNode();
    const body = window.document.body;

    QueuedRender({ priority: "low" }, node, (f: Fragment<Node, Element, object>) => {
        f.text("1");
    });
    QueuedRender({ priority: "high" }, node, (f: Fragment<Node, Element, object>) => {
        f.text("2");
    });
    node.destroy();

    setTimeout(() => {
        expect(body.children.length).toBe(0);
        done();
    }, 10);
});

it("QueuedRender split test", function (done) {
    const [node, window] = createNode();
    const body = window.document.body;

    QueuedRender({ priority: "low" }, node, (f: Fragment<Node, Element, object>) => {
        f.text("1");
    });
    QueuedRender({ priority: "high" }, node, (f: Fragment<Node, Element, object>) => {
        const time = Date.now();
        while (Date.now() - time < 12) {
            // just burn CPU 12ms
        }
        f.text("2");
    });

    setTimeout(() => {
        expect(body.innerHTML.trim()).toBe("2");
        setTimeout(() => {
            expect(body.innerHTML.trim()).toBe("12");
            node.destroy();
            done();
        }, 10);
    }, 10);
});
