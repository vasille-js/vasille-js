import { DOMWindow } from "jsdom";
import { App, Expression, Fragment, IValue, Reference, SwitchedNode, Tag } from "../../src/index.js";
import { Runner, TagOptions } from "../../src/runner/web/runner.js";
import { page } from "../page.js";

let compose = false;

class FragmentTest extends Fragment<Node, Element, object> {
    override compose() {
        super.compose();
        compose = true;
    }
}

it("Fragment", function () {
    const window = page();
    const runner = new Runner(window.document);
    const root = new App<Node, Element, TagOptions>(window.document.body, runner);

    root.create(new FragmentTest(runner));
    expect(root.children.length).toBe(1);
    expect(compose).toBe(true);

    root.destroy();
});

it("Tag", function () {
    const window = page();
    const root = new App<Node, Element, TagOptions>(window.document.body, new Runner(window.document));
    const text = new Reference("test");

    root.tag("div", {}, function (div) {
        div.text(text);
        expect(div.node!.childNodes.length).toBe(1);
        expect(div.node!.innerHTML.trim()).toBe("test");
        text.V = "new";
        expect(div.node!.innerHTML.trim()).toBe("new");

        div.text("test");
        expect(div.node!.childNodes[1] instanceof window.Text).toBe(true);
        expect(div.node!.childNodes[1]!.textContent).toBe("test");

        const textRef = new Reference<string | null>(null);
        div.text(textRef);
        expect(div.node!.childNodes[2] instanceof window.Text).toBe(true);
        expect(div.node!.childNodes[2]!.textContent).toBe("");
        textRef.V = "ok";
        expect(div.node!.childNodes[2]!.textContent).toBe("ok");
        textRef.V = null;
        expect(div.node!.childNodes[2]!.textContent).toBe("");
    });

    root.destroy();
});

it("if", function () {
    const window = page();
    const root = new App<Node, Element, TagOptions>(window.document.body, new Runner(window.document));
    let check1 = false;
    let check2 = true;

    root.create(
        new SwitchedNode<Node, Element, TagOptions>(root.runner, [
            {
                $case: new Reference(true),
                slot: (node, value) => {
                    check1 = true;
                    expect(value).toBe(true);
                },
            },
        ]),
    );
    root.create(
        new SwitchedNode<Node, Element, TagOptions>(root.runner, [
            {
                $case: new Reference(false),
                slot: () => (check2 = false),
            },
        ]),
    );

    expect(check1).toBe(true);
    expect(check2).toBe(true);
    root.destroy();
});

it("if else", function () {
    const window = page();
    const root = new App<Node, Element, TagOptions>(window.document.body, new Runner(window.document));
    const iv1 = new Reference(true);
    const iv2 = new Reference(false);

    let check1 = 1,
        check2 = 1;

    root.create(
        new SwitchedNode<Node, Element, TagOptions>(
            root.runner,
            [{ $case: iv1, slot: () => (check1 = 1) }],
            () => (check1 = 2),
        ),
    );

    root.create(
        new SwitchedNode<Node, Element, TagOptions>(
            root.runner,
            [{ $case: iv2, slot: () => (check2 = 1) }],
            () => (check2 = 2),
        ),
    );

    expect(check1).toBe(1);
    expect(check2).toBe(2);

    iv1.V = false;
    iv2.V = true;

    expect(check1).toBe(2);
    expect(check2).toBe(1);

    root.destroy();
});

it("switch", function () {
    const window = page();
    const root = new App<Node, Element, TagOptions>(window.document.body, new Runner(window.document));
    const v = new Reference(1);
    const v2 = new Reference(false);
    let check = 0;

    root.create(
        new SwitchedNode<Node, Element, TagOptions>(
            root.runner,
            [
                { $case: new Expression(v => v == 1, [v]), slot: () => (check = 1) },
                { $case: new Expression(v => v == 2, [v]), slot: () => (check = 2) },
                { $case: new Expression(v => v == 3, [v]), slot: () => (check = 3) },
                { $case: v2, slot: () => (check = -2) },
            ],
            () => (check = 4),
        ),
    );

    v2.V = true;
    expect(check).toBe(1);

    v.V = 2;
    expect(check).toBe(2);

    v.V = 3;
    expect(check).toBe(3);

    v.V = 4;
    v2.V = false;
    expect(check).toBe(4);

    root.destroy();
});

it("INode", function () {
    const window = page();
    const runner = new Runner(window.document);
    const root = new App<Node, Element, TagOptions>(window.document.body, runner);

    root.create(new Fragment<Node, Element, TagOptions>(runner), function (test) {
        // attr
        (function () {
            const attrName = "data-attr";
            const attrValue = new Reference("test");
            let el!: Element;

            test.tag("div", {
                a: {
                    "data-checked": true,
                    "data-checked2": new Reference(true),
                    "data-set": "test",
                    [attrName]: attrValue,
                    "data-bind": new Expression(
                        (str: string) => {
                            return str.length > 1 ? str : "alternative";
                        },
                        [attrValue],
                    ),
                },
                k: node => (el = node),
            });

            const data = (el as HTMLElement).dataset;

            expect(data.set).toBe("test");
            expect(data.attr).toBe("test");
            expect(data.bind).toBe("test");

            attrValue.V = "";

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
                c: ["c1", "c2", "c3", dyn, { float: cond }],
                k: node => (el = node),
            });

            expect(el.className).toBe("c1 c2 c3 dyn");

            dyn.V = "test";
            expect(el.className).toBe("c1 c2 c3 test");

            cond.V = true;
            expect(el.className).toBe("c1 c2 c3 test float");

            cond.V = false;
            expect(el.className).toBe("c1 c2 c3 test");
        })();

        //style
        (function () {
            const dyn = new Reference("0px");
            const num = new Expression(x => parseFloat(x) + 10, [dyn]);
            let el!: HTMLElement;

            test.tag("div", {
                s: {
                    display: "none",
                    margin: dyn,
                    padding: num,
                    width: 300,
                    inset: [12, 23],
                },
                k: node => (el = node as HTMLElement),
            });

            expect(el.style.display).toBe("none");
            expect(el.style.margin).toBe("0px");
            expect(el.style.padding).toBe("10px");
            expect(el.style.width).toBe("300px");
            expect(el.style.inset).toBe("12px 23px");

            dyn.V = "100px";
            expect(el.style.margin).toBe("100px");
            expect(el.style.padding).toBe("110px");
        })();
    });

    root.destroy();
});

it("INode Events 1", function () {
    let test = false;
    const window = page();
    const root = new App<Node, Element, TagOptions>(window.document.body, new Runner(window.document));
    const handler = () => (test = true);
    let element!: HTMLElement;

    root.tag("button", {
        e: { click: handler },
        k: node => (element = node as HTMLElement),
    });
    element.click();
    expect(test).toBe(true);

    root.destroy();
});

it("INode Events 2", function () {
    let test = false;
    const window = page();
    const root = new App<Node, Element, TagOptions>(window.document.body, new Runner(window.document));
    const handler = () => (test = true);
    let element!: HTMLElement;

    root.tag("button", {
        e: { click: [handler, { once: true }] },
        k: node => (element = node as HTMLElement),
    });
    element.click();
    expect(test).toBe(true);

    root.destroy();
});

it("bind DOM api test", function () {
    const window = page();
    const root = new App<Node, Element, TagOptions>(window.document.body, new Runner(window.document));
    const html = new Reference("test me now");
    const bool = new Reference(true);
    const num = new Reference(0.1);
    let el!: Element;

    root.tag("div", {
        b: {
            innerHTML: html,
        },
        k: node => (el = node),
    });

    let input!: HTMLTextAreaElement;
    root.tag("textarea", {
        b: { value: html },
        k: node => (input = node as HTMLTextAreaElement),
    });
    let checkbox!: HTMLInputElement;
    root.tag("input", {
        a: { type: "checkbox" },
        b: { checked: bool },
        k: node => (checkbox = node as HTMLInputElement),
    });
    let media!: HTMLAudioElement;
    root.tag("audio", {
        b: { volume: num },
        k: node => (media = node as HTMLAudioElement),
    });
    let media2!: HTMLAudioElement;
    root.tag("audio", {
        b: { volume: 0.75 },
        k: node => (media2 = node as HTMLAudioElement),
    });

    expect(el.innerHTML).toBe("test me now");

    html.V = "<i>i</i><b>b</b>";
    expect(el.innerHTML).toBe("<i>i</i><b>b</b>");

    html.V = "1";
    expect(input.value).toBe("1");
    html.V = "2";
    expect(input.value).toBe("2");

    bool.V = false;
    expect(checkbox.checked).toBe(false);
    bool.V = true;
    expect(checkbox.checked).toBe(true);

    num.V = 1;
    expect(media.volume).toBe(1);
    num.V = 0.5;
    expect(media.volume).toBe(0.5);

    expect(media2.volume).toBe(0.75);

    root.destroy();
});

it("Error handling", function () {
    const window = page();
    const root = new App<Node, Element, TagOptions>(window.document.body, new Runner(window.document));

    root.tag("div", {}, function (f) {
        // eslint-disable-next-line
        // @ts-ignore
        f.node = null;
        expect(() => f.tag("" as unknown as "a", {})).toThrow("internal-error");
    });
});

it("Class add/removing test", function () {
    const window = page();
    const runner = new Runner(window.document);
    const root = new App<Node, Element, TagOptions>(window.document.body, runner);

    root.tag(
        "div",
        {
            c: [
                "remove",
                "keep",
                {
                    add: true,
                    remove: false,
                },
            ],
        },
        function (f) {
            expect(f.node!.className).toBe("keep add");
        },
    );
});

function checkSpanAfterDiv(node: Tag<Node, Element, object>, bool: IValue<boolean>, window: DOMWindow) {
    expect(node.node!.childNodes.length).toBe(2);
    expect(node.node!.childNodes[0]).toBeInstanceOf(window.HTMLDivElement);
    expect(node.node!.childNodes[1]).toBeInstanceOf(window.HTMLSpanElement);

    bool.V = false;
    expect(node.node!.childNodes.length).toBe(1);
    expect(node.node!.childNodes[0]).toBeInstanceOf(window.HTMLSpanElement);

    bool.V = true;
    expect(node.node!.childNodes.length).toBe(2);
    expect(node.node!.childNodes[0]).toBeInstanceOf(window.HTMLDivElement);
    expect(node.node!.childNodes[1]).toBeInstanceOf(window.HTMLSpanElement);
}

it("Insert adjacent", function () {
    const window = page();
    const runner = new Runner(window.document);
    const root = new App<Node, Element, TagOptions>(window.document.body, runner);
    const bool = new Reference(true);

    root.tag("div", {}, function (node) {
        node.create(
            new SwitchedNode<Node, Element, TagOptions>(node.runner, [
                {
                    $case: bool,
                    slot(node) {
                        node.tag("div", {});
                    },
                },
            ]),
        );
        node.tag("span", {});

        checkSpanAfterDiv(node, bool, window);
    });
});

it("Find first child of tag", function () {
    const window = page();
    const runner = new Runner(window.document);
    const root = new App<Node, Element, TagOptions>(window.document.body, runner);
    const bool = new Reference(true);

    root.tag("div", {}, function (node) {
        node.create(
            new SwitchedNode<Node, Element, TagOptions>(node.runner, [
                {
                    $case: bool,
                    slot(node) {
                        node.tag("div", {});
                    },
                },
            ]),
        );
        node.create(new Fragment<Node, Element, TagOptions>(runner), node => {
            node.tag("span", {});
        });

        checkSpanAfterDiv(node, bool, window);
    });
});

it("text", function () {
    const window = page();
    const runner = new Runner(window.document);
    const root = new App<Node, Element, TagOptions>(window.document.body, runner);

    root.tag("div", {}, function (node) {
        node.text("test");
        node.sText(() => "test 2");
        node.sText(() => {
            throw new Error("test");
        });

        expect(node.node!.childNodes.length).toBe(2);
        expect(node.node!.childNodes[0] instanceof window.Text).toBe(true);
        expect(node.node!.childNodes[0]!.textContent).toBe("test");
        expect(node.node!.childNodes[1] instanceof window.Text).toBe(true);
        expect(node.node!.childNodes[1]!.textContent).toBe("test 2");
    });
});
