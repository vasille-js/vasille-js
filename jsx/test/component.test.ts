import { Expression, Fragment, IValue, Reference } from "vasille";
import { Debug, Delay, Else, ElseIf, For, If, Slot, Watch } from "../src/index.js";
import { ContextArray, ContextMap, ContextSet } from "../src/models.js";
import { createNode } from "./page.js";

it("Slot", function () {
    const [node] = createNode();
    let slotTest = false;
    let modelTest = false;
    let modelTest2 = false;
    let mustBeValue: unknown = null;
    let mustBeRef: unknown = null;

    Slot({}, node);
    Slot(
        {
            slot() {
                slotTest = true;
            },
        },
        node,
    );
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
            slot() {
                modelTest2 = false;
            },
        },
        node,
    );
    Slot(
        {
            model(o: object) {
                mustBeValue = "a" in o && o.a;
            },
            a: new Reference(2),
        } as any,
        node,
    );
    Slot(
        {
            model(o: object, node: unknown) {
                mustBeRef = "a" in o && o.a;
            },
            a: 2,
        } as any,
        node,
    );

    expect(slotTest).toBe(true);
    expect(modelTest).toBe(true);
    expect(modelTest2).toBe(true);
    expect(mustBeValue).toBe(2);
    expect(mustBeRef instanceof IValue).toBe(true);
});

it("If - ElseIf - Else", function () {
    const [node] = createNode();
    const cond = new Reference(1);
    const ifCont = new Expression((v: number) => v === 1, [cond]);
    const elseCond = new Expression((v: number) => v === 2, [cond]);
    let executed = "none";

    If(
        {
            condition: ifCont,
            slot() {
                executed = "if";
            },
        },
        node,
    );
    ElseIf(
        {
            condition: elseCond,
            slot() {
                executed = "else-if";
            },
        },
        node,
    );
    Else(
        {
            slot() {
                executed = "else";
            },
        },
        node,
    );

    expect(executed).toBe("if");
    cond.$ = 2;
    expect(executed).toBe("else-if");
    cond.$ = 3;
    expect(executed).toBe("else");

    // must not trigger errors
    If({ condition: undefined }, node);
    ElseIf({ condition: undefined }, node);
    If({ condition: true }, node);
    If({ condition: undefined }, node);
    ElseIf({ condition: true }, node);

    let executed2 = "none";

    If(
        {
            condition: false,
            slot() {
                executed2 = "if";
            },
        },
        node,
    );
    Else(
        {
            slot() {
                executed2 = "else-if";
            },
        },
        node,
    );

    expect(executed2).toBe("else-if");
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
    For({ of: new ContextArray([1, 2, 3]), slot }, node);
    expect(counter).toBe(3);
    For({ of: new ContextSet([1, 1]), slot }, node);
    expect(counter).toBe(4);
    For(
        {
            of: new ContextMap([
                [1, 1],
                [2, 2],
            ]),
            slot,
        },
        node,
    );
    expect(counter).toBe(6);
    For({ of: [1, 2, 3], slot }, node);
    expect(counter).toBe(9);
    For({ of: new Set([1, 2, 1]), slot }, node);
    expect(counter).toBe(11);
    For({ of: new Map([[1, 1]]), slot }, node);
    expect(counter).toBe(12);

    const ref = new Reference(new ContextArray([1, 2]));

    For({ of: ref, slot }, node);
    expect(counter).toBe(14);
    ref.$ = new ContextArray<number>([4]);
    expect(counter).toBe(15);
});

it("Watch", function () {
    const [node] = createNode();
    const ref = new Reference(1);
    let counter = 0;

    function slot() {
        counter++;
    }

    Watch({ model: ref, slot }, node);

    expect(counter).toBe(1);
    ref.$ = 2;
    expect(counter).toBe(2);
});

it("Debug", function () {
    const [node] = createNode();
    const ref = new Reference(0);
    let element!: Element;

    node.tag("div", {
        callback: n => (element = n),
        slot(node) {
            Debug({ model: ref }, node);
            Debug({ model: "x" }, node);
        },
    });

    expect(element.childNodes.length).toBe(2);
    expect((element.childNodes[0] as Comment).textContent).toBe("0");
    expect((element.childNodes[1] as Comment).textContent).toBe("x");
    ref.$ = 1;
    expect((element.childNodes[0] as Comment).textContent).toBe("1");
});

it("Delay", function (done) {
    const [node] = createNode();
    let element!: HTMLElement;

    node.tag("div", { callback: n => (element = n as HTMLElement) }, function (f) {
        Delay(
            {
                time: 10,
                slot(f: Fragment<Node, Element, object>) {
                    f.tag("div", {});
                },
            },
            f,
        );
        Delay(
            {
                time: 20,
                slot(f: Fragment<Node, Element, object>) {
                    f.tag("div", {});
                },
            },
            f,
        );
    });

    expect(element.children.length).toBe(0);
    setTimeout(() => {
        expect(element.children.length).toBe(1);
        node.destroy();
        setTimeout(() => {
            expect(element.children.length).toBe(0);
            done();
        }, 20);
    }, 10);
});
