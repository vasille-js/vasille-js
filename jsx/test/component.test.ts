import { Expression, Fragment, Reference } from "vasille";
import { Adapter, Debug, Delay, Else, ElseIf, For, If, Mount, Show, Slot, Watch } from "../src";
import { ContextArray, ContextMap, ContextSet } from "../src/models";
import { createNode } from "./page";

it("Adapter", function () {
    const node = createNode();
    const frag = new Fragment({});
    let test = false;

    Adapter.call(node, {
        node: frag,
        slot(this: Fragment) {
            expect(this).toBe(frag);
            test = true;
        },
    });

    expect(test).toBe(true);
});

it("Slot", function () {
    const node = createNode();
    let slotTest = false;
    let modelTest = false;
    let modelTest2 = false;

    Slot.call(node, {});
    Slot.call(node, {
        slot() {
            slotTest = true;
        },
    });
    Slot.call(node, {
        model() {
            modelTest = true;
        },
    });
    Slot.call(node, {
        model() {
            modelTest2 = true;
        },
        slot() {
            modelTest2 = false;
        },
    });

    expect(slotTest).toBe(true);
    expect(modelTest).toBe(true);
    expect(modelTest2).toBe(true);
});

it("If - ElseIf - Else", function () {
    const node = createNode();
    const cond = new Reference(1);
    const ifCont = new Expression((v: number) => v === 1, cond);
    const elseCond = new Expression((v: number) => v === 2, cond);
    let executed = "none";

    If.call(node, {
        condition: ifCont,
        slot() {
            executed = "if";
        },
    });
    ElseIf.call(node, {
        condition: elseCond,
        slot() {
            executed = "else-if";
        },
    });
    Else.call(node, {
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
    If.call(node, {});
    ElseIf.call(node, {});
    If.call(node, { condition: true });
    If.call(node, {});
    ElseIf.call(node, { condition: true });

    let executed2 = "none";

    If.call(node, {
        condition: false,
        slot() {
            executed2 = "if";
        },
    });
    Else.call(node, {
        condition: true,
        slot() {
            executed2 = "else-if";
        },
    });

    expect(executed2).toBe("else-if");
});

it("For", function () {
    const node = createNode();
    let counter = 0;

    function slot() {
        counter++;
    }

    expect(() => For.call(this, { of: 3, slot })).toThrow("wrong-model");
    For.call(node, { of: 3 });
    expect(counter).toBe(0);
    For.call(node, { of: new ContextArray([1, 2, 3]), slot });
    expect(counter).toBe(3);
    For.call(node, { of: new ContextSet([1, 1]), slot });
    expect(counter).toBe(4);
    For.call(node, {
        of: new ContextMap([
            [1, 1],
            [2, 2],
        ]),
        slot,
    });
    expect(counter).toBe(6);
    For.call(node, { of: [1, 2, 3], slot });
    expect(counter).toBe(9);
    For.call(node, { of: new Set([1, 2, 1]), slot });
    expect(counter).toBe(11);
    For.call(node, { of: new Map([[1, 1]]), slot });
    expect(counter).toBe(12);

    const ref = new Reference(new ContextArray([1, 2]));

    For.call(node, { of: ref, slot });
    expect(counter).toBe(14);
    ref.$ = new ContextArray<number>([4]);
    expect(counter).toBe(15);
});

it("Watch", function () {
    const node = createNode();
    const ref = new Reference(1);
    let counter = 0;

    function slot() {
        counter++;
    }

    Watch.call(node, { model: ref, slot });

    expect(counter).toBe(1);
    ref.$ = 2;
    expect(counter).toBe(2);
});

it("Debug", function () {
    const node = createNode();
    const ref = new Reference(0);
    let element!: Element;

    node.tag("div", {
        callback: n => (element = n),
        slot() {
            Debug.call(this, { model: ref });
            Debug.call(this, { model: "x" });
        },
    });

    expect(element.childNodes.length).toBe(2);
    expect((element.childNodes[0] as Comment).textContent).toBe("0");
    expect((element.childNodes[1] as Comment).textContent).toBe("x");
    ref.$ = 1;
    expect((element.childNodes[0] as Comment).textContent).toBe("1");
});

it("Mount", function () {
    const node = createNode();
    const ref = new Reference(true);
    let element!: Element;

    node.tag("div", { callback: n => (element = n) }, function () {
        this.tag("div", {}, function () {
            Mount.call(this, { bind: ref });
        });
        this.tag("div", {}, function () {
            Mount.call(this, { bind: false });
        });
    });

    expect(element.children.length).toBe(1);

    ref.$ = false;
    expect(element.children.length).toBe(0);
    ref.$ = true;
    expect(element.children.length).toBe(1);

    expect(() => Mount.call(null, {})).toThrow("context-mismatch");
});

it("Show", function () {
    const node = createNode();
    const ref = new Reference(true);
    let element!: HTMLElement;

    node.tag("div", { callback: n => (element = n as HTMLElement) }, function () {
        this.tag("div", { style: { display: "block" } }, function () {
            Show.call(this, { bind: ref });
        });
        this.tag("div", {}, function () {
            Show.call(this, { bind: false });
        });
    });

    expect((element.children[0] as HTMLElement).style.display).toBe("block");
    expect((element.children[1] as HTMLElement).style.display).toBe("none");

    ref.$ = false;
    expect((element.children[0] as HTMLElement).style.display).toBe("none");
    ref.$ = true;
    expect((element.children[0] as HTMLElement).style.display).toBe("block");

    expect(() => Show.call(null, {})).toThrow("context-mismatch");
});

it("Delay", function (done) {
    const node = createNode();
    let element!: HTMLElement;

    node.tag("div", { callback: n => (element = n as HTMLElement) }, function () {
        Delay.call(this, {
            time: 10,
            slot(this: Fragment) {
                this.tag("div", {});
            },
        });
        Delay.call(this, {
            time: 20,
            slot(this: Fragment) {
                this.tag("div", {});
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
