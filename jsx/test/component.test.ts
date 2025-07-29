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

    Slot(node, {});
    Slot(node, {
        slot() {
            slotTest = true;
        },
    });
    Slot(node, {
        model() {
            modelTest = true;
        },
    });
    Slot(node, {
        model() {
            modelTest2 = true;
        },
        slot() {
            modelTest2 = false;
        },
    });
    Slot(node, {
        model(o: object) {
            mustBeValue = "a" in o && o.a;
        },
        a: new Reference(2),
    } as any);
    Slot(node, {
        model(o: object, node: unknown) {
            mustBeRef = "a" in o && o.a;
        },
        a: 2,
    } as any);

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

    If(node, {
        condition: ifCont,
        slot() {
            executed = "if";
        },
    });
    ElseIf(node, {
        condition: elseCond,
        slot() {
            executed = "else-if";
        },
    });
    Else(node, {
        slot() {
            executed = "else";
        },
    });

    expect(executed).toBe("if");
    cond.$ = 2;
    expect(executed).toBe("else-if");
    cond.$ = 3;
    expect(executed).toBe("else");

    // must not trigger errors
    If(node, { condition: undefined });
    ElseIf(node, { condition: undefined });
    If(node, { condition: true });
    If(node, { condition: undefined });
    ElseIf(node, { condition: true });

    let executed2 = "none";

    If(node, {
        condition: false,
        slot() {
            executed2 = "if";
        },
    });
    Else(node, {
        slot() {
            executed2 = "else-if";
        },
    });

    expect(executed2).toBe("else-if");
});

it("For", function () {
    const [node] = createNode();
    let counter = 0;

    function slot() {
        counter++;
    }

    expect(() => For(this, { of: 3 as any, slot })).toThrow("wrong-model");
    For(node, { of: 3 as any });
    expect(counter).toBe(0);
    For(node, { of: new ContextArray([1, 2, 3]), slot });
    expect(counter).toBe(3);
    For(node, { of: new ContextSet([1, 1]), slot });
    expect(counter).toBe(4);
    For(node, {
        of: new ContextMap([
            [1, 1],
            [2, 2],
        ]),
        slot,
    });
    expect(counter).toBe(6);
    For(node, { of: [1, 2, 3], slot });
    expect(counter).toBe(9);
    For(node, { of: new Set([1, 2, 1]), slot });
    expect(counter).toBe(11);
    For(node, { of: new Map([[1, 1]]), slot });
    expect(counter).toBe(12);

    const ref = new Reference(new ContextArray([1, 2]));

    For(node, { of: ref, slot });
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

    Watch(node, { model: ref, slot });

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
            Debug(node, { model: ref });
            Debug(node, { model: "x" });
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
        Delay(f, {
            time: 10,
            slot(f: Fragment<Node, Element, object>) {
                f.tag("div", {});
            },
        });
        Delay(f, {
            time: 20,
            slot(f: Fragment<Node, Element, object>) {
                f.tag("div", {});
            },
        });
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
