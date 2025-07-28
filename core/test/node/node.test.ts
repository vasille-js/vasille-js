import { DOMWindow } from "jsdom";
import { App, Expression, Fragment, IValue, Reference, Tag } from "../../src";
import { DebugNode, Runner } from "../../src/runner/web/runner";
import { page } from "../page";

let compose = false;

class FragmentTest extends Fragment<Node, Element, object> {
    compose() {
        super.compose();
        compose = true;
    }
}

it("Fragment", function () {
    const window = page();
    const runner = new Runner(true, window.document);
    const root = new App(window.document.body, runner, {});

    root.create(new FragmentTest({}, runner));
    expect(root.children.size).toBe(1);
    expect(compose).toBe(true);

    root.destroy();
});

it("Tag", function () {
    const window = page();
    const root = new App(window.document.body, new Runner(true, window.document), {});
    const text = new Reference("test");

    root.tag("div", {}, function (div) {
        div.text(text);
        expect(div.element.childNodes.length).toBe(1);
        expect(div.element.innerHTML.trim()).toBe("test");
        text.$ = "new";
        expect(div.element.innerHTML.trim()).toBe("new");

        div.text("test");
        expect(div.element.childNodes[1] instanceof window.Text).toBe(true);
        expect(div.element.childNodes[1].textContent).toBe("test");
        div.debug(new Reference<string>("debug"));
        expect(div.element.childNodes.length).toBe(3);
        expect(div.element.childNodes[2] instanceof window.Comment).toBe(true);
        expect(div.element.childNodes[2].textContent).toBe("debug");

        const debugRef = new Reference<string | null>(null);
        div.debug(debugRef);
        expect(div.element.childNodes[3] instanceof window.Comment).toBe(true);
        expect(div.element.childNodes[3].textContent).toBe("");
        debugRef.$ = "err";
        expect(div.element.childNodes[3].textContent).toBe("err");

        const textRef = new Reference<string | null>(null);
        div.text(textRef);
        expect(div.element.childNodes[4] instanceof window.Text).toBe(true);
        expect(div.element.childNodes[4].textContent).toBe("");
        textRef.$ = "ok";
        expect(div.element.childNodes[4].textContent).toBe("ok");
        textRef.$ = null;
        expect(div.element.childNodes[4].textContent).toBe("");
    });

    root.destroy();
});

it("if", function () {
    const window = page();
    const root = new App(window.document.body, new Runner(true, window.document), {});
    let check1 = false;
    let check2 = true;

    root.if(new Reference(true), () => (check1 = true));
    root.if(new Reference(false), () => (check2 = false));

    expect(check1).toBe(true);
    expect(check2).toBe(true);
    root.destroy();
});

it("if else", function () {
    const window = page();
    const root = new App(window.document.body, new Runner(true, window.document), {});
    const iv1 = new Reference(true);
    const iv2 = new Reference(false);

    let check1 = 1,
        check2 = 1;

    root.if(iv1, () => (check1 = 1));
    root.else(() => (check1 = 2));

    root.if(iv2, () => (check2 = 1));
    root.else(() => (check2 = 2));

    expect(check1).toBe(1);
    expect(check2).toBe(2);

    iv1.$ = false;
    iv2.$ = true;

    expect(check1).toBe(2);
    expect(check2).toBe(1);

    root.destroy();
});

it("switch", function () {
    const window = page();
    const root = new App(window.document.body, new Runner(true, window.document), {});
    const v = new Reference(1);
    const v2 = new Reference(false);
    let check = 0;

    root.if(new Expression(v => v == 1, [v]), () => (check = 1));
    root.elif(new Expression(v => v == 2, [v]), () => (check = 2));
    root.elif(new Expression(v => v == 3, [v]), () => (check = 3));
    root.elif(v2, () => (check = -2));
    root.else(() => (check = 4));

    v2.$ = true;
    expect(check).toBe(1);

    v.$ = 2;
    expect(check).toBe(2);

    v.$ = 3;
    expect(check).toBe(3);

    v.$ = 4;
    v2.$ = false;
    expect(check).toBe(4);

    root.destroy();
});

it("INode", function () {
    const window = page();
    const runner = new Runner(true, window.document);
    const root = new App(window.document.body, runner, {});

    root.create(new Fragment({}, runner), function (test) {
        // attr
        (function () {
            const attrName = "data-attr";
            const attrValue = new Reference("test");
            let el!: Element;

            test.tag("div", {
                attr: {
                    "data-checked": true,
                    "data-checked2": root.ref(true),
                    "data-set": "test",
                    [attrName]: attrValue,
                    "data-bind": root.expr(
                        (str: string) => {
                            return str.length > 1 ? str : "alternative";
                        },
                        [attrValue],
                    ),
                },
                callback: node => (el = node),
            });

            const data = (el as HTMLElement).dataset;

            expect(data.set).toBe("test");
            expect(data.attr).toBe("test");
            expect(data.bind).toBe("test");

            attrValue.$ = "";

            expect(data.attr).toBeUndefined();
            expect(data.bind).toBe("alternative");
            expect(test.parent).toBe(root);
        })();

        // class
        (function () {
            const dyn = new Reference("dyn");
            const cond = new Reference(false);
            let el!: Element;

            test.tag("div", {
                class: ["c1", "c2", "c3", dyn, { float: cond }],
                callback: node => (el = node),
            });

            expect(el.className).toBe("c1 c2 c3 dyn");

            dyn.$ = "test";
            expect(el.className).toBe("c1 c2 c3 test");

            cond.$ = true;
            expect(el.className).toBe("c1 c2 c3 test float");

            cond.$ = false;
            expect(el.className).toBe("c1 c2 c3 test");
        })();

        //style
        (function () {
            const dyn = new Reference("0px");
            const num = new Expression(x => parseFloat(x) + 10, [dyn]);
            let el!: HTMLElement;

            test.tag("div", {
                style: {
                    display: "none",
                    margin: dyn,
                    padding: num,
                    width: 300,
                    inset: [12, 23],
                },
                callback: node => (el = node as HTMLElement),
            });

            expect(el.style.display).toBe("none");
            expect(el.style.margin).toBe("0px");
            expect(el.style.padding).toBe("10px");
            expect(el.style.width).toBe("300px");
            expect(el.style.inset).toBe("12px 23px");

            dyn.$ = "100px";
            expect(el.style.margin).toBe("100px");
            expect(el.style.padding).toBe("110px");
        })();
    });

    root.destroy();
});

it("INode Events", function () {
    let test = false;
    const window = page();
    const root = new App(window.document.body, new Runner(true, window.document), {});
    const handler = () => (test = true);
    let element!: HTMLElement;

    root.tag("button", {
        events: { click: handler },
        callback: node => (element = node as HTMLElement),
    });
    element.click();
    expect(test).toBe(true);

    root.destroy();
});

it("bind DOM api test", function () {
    const window = page();
    const root = new App(window.document.body, new Runner(true, window.document), {});
    const html = new Reference("test me now");
    const bool = new Reference(true);
    const num = new Reference(0.1);
    let el!: Element;

    root.tag("div", {
        bind: {
            innerHTML: html,
        },
        callback: node => (el = node),
    });

    let input!: HTMLTextAreaElement;
    root.tag("textarea", {
        bind: { value: html },
        callback: node => (input = node as HTMLTextAreaElement),
    });
    let checkbox!: HTMLInputElement;
    root.tag("input", {
        attr: { type: "checkbox" },
        bind: { checked: bool },
        callback: node => (checkbox = node as HTMLInputElement),
    });
    let media!: HTMLAudioElement;
    root.tag("audio", {
        bind: { volume: num },
        callback: node => (media = node as HTMLAudioElement),
    });
    let media2!: HTMLAudioElement;
    root.tag("audio", {
        bind: { volume: 0.75 },
        callback: node => (media2 = node as HTMLAudioElement),
    });

    expect(el.innerHTML).toBe("test me now");

    html.$ = "<i>i</i><b>b</b>";
    expect(el.innerHTML).toBe("<i>i</i><b>b</b>");

    html.$ = "1";
    expect(input.value).toBe("1");
    html.$ = "2";
    expect(input.value).toBe("2");

    bool.$ = false;
    expect(checkbox.checked).toBe(false);
    bool.$ = true;
    expect(checkbox.checked).toBe(true);

    num.$ = 1;
    expect(media.volume).toBe(1);
    num.$ = 0.5;
    expect(media.volume).toBe(0.5);

    expect(media2.volume).toBe(0.75);

    root.destroy();
});

it("Error handling", function () {
    const window = page();
    const root = new App(window.document.body, new Runner(true, window.document), {});
    const bool = new Reference(true);

    root.tag("div", {}, function (f) {
        // eslint-disable-next-line
        // @ts-ignore
        f.node = null;
        expect(() => f.else(() => 0)).toThrow("logic-error");
        expect(() => f.elif(bool, () => 0)).toThrow("logic-error");
        expect(() => f.tag("" as unknown as "a", {})).toThrow("internal-error");
    });
});

it("Debug node order", function () {
    const window = page();
    const runner = new Runner(true, window.document);
    const root = new App(window.document.body, runner, {});
    const bool = new Reference(true);
    const text = new Reference<string | null>("test me now");

    root.tag("div", {}, function (f) {
        f.if(bool, node => {
            node.text(text);
        });
        f.create(new DebugNode({ text }, runner));

        expect(f.element.childNodes.length).toBe(2);
        expect(f.element.childNodes[0]).toBeInstanceOf(window.Text);
        expect(f.element.childNodes[1]).toBeInstanceOf(window.Comment);

        bool.$ = false;
        expect(f.element.childNodes.length).toBe(1);
        expect(f.element.childNodes[0]).toBeInstanceOf(window.Comment);

        bool.$ = true;
        expect(f.element.childNodes.length).toBe(2);
        expect(f.element.childNodes[0]).toBeInstanceOf(window.Text);
        expect(f.element.childNodes[1]).toBeInstanceOf(window.Comment);

        text.$ = null;
        expect(f.element.childNodes[0].textContent).toBe("");
    });
});

it("Class add/removing test", function () {
    const window = page();
    const runner = new Runner(false, window.document);
    const root = new App(window.document.body, runner, {});

    root.tag(
        "div",
        {
            class: [
                "remove",
                "keep",
                {
                    add: true,
                    remove: false,
                },
            ],
        },
        function (f) {
            expect(f.element.className).toBe("keep add");
        },
    );
});

function checkSpanAfterDiv(node: Tag<Node, Element, object>, bool: IValue<boolean>, window: DOMWindow) {
    expect(node.element.childNodes.length).toBe(2);
    expect(node.element.childNodes[0]).toBeInstanceOf(window.HTMLDivElement);
    expect(node.element.childNodes[1]).toBeInstanceOf(window.HTMLSpanElement);

    bool.$ = false;
    expect(node.element.childNodes.length).toBe(1);
    expect(node.element.childNodes[0]).toBeInstanceOf(window.HTMLSpanElement);

    bool.$ = true;
    expect(node.element.childNodes.length).toBe(2);
    expect(node.element.childNodes[0]).toBeInstanceOf(window.HTMLDivElement);
    expect(node.element.childNodes[1]).toBeInstanceOf(window.HTMLSpanElement);
}

it("Insert adjacent", function () {
    const window = page();
    const runner = new Runner(true, window.document);
    const root = new App(window.document.body, runner, {});
    const bool = new Reference(true);

    root.tag("div", {}, function (node) {
        node.if(bool, node => {
            node.tag("div", {});
        });
        node.tag("span", {});

        checkSpanAfterDiv(node, bool, window);
    });
});

it("Find first child of tag", function () {
    const window = page();
    const runner = new Runner(true, window.document);
    const root = new App(window.document.body, runner, {});
    const bool = new Reference(true);

    root.tag("div", {}, function (node) {
        node.if(bool, node => {
            node.tag("div", {});
        });
        node.create(new Fragment({}, runner), node => {
            node.tag("span", {});
        });

        checkSpanAfterDiv(node, bool, window);
    });
});
