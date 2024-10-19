import { App, Expression, Extension, Fragment, INode, Reference, Tag } from "../../src";
import { page } from "../page";

let compose = false;

class FragmentTest extends Fragment {
    compose() {
        super.compose();
        compose = true;
    }
}

it("Fragment", function () {
    const root = new App(page.window.document.body, {});

    root.create(new FragmentTest({}));
    expect(root.children.size).toBe(1);
    expect(compose).toBe(true);

    root.destroy();
});

it("Tag", function () {
    const root = new App(page.window.document.body, { debugUi: true });
    const text = new Reference("test");

    root.tag("div", {}, function () {
        this.text(text);
        expect(this.element.childNodes.length).toBe(1);
        expect(this.element.innerHTML.trim()).toBe("test");
        text.$ = "new";
        expect(this.element.innerHTML.trim()).toBe("new");

        this.text("test");
        expect(this.element.childNodes[1] instanceof page.window.Text).toBe(true);
        expect(this.element.childNodes[1].textContent).toBe("test");
        this.debug(new Reference<string>("debug"));
        expect(this.element.childNodes.length).toBe(3);
        expect(this.element.childNodes[2] instanceof page.window.Comment).toBe(true);
        expect(this.element.childNodes[2].textContent).toBe("debug");

        const debugRef = new Reference<string | null>(null);
        this.debug(debugRef);
        expect(this.element.childNodes[3] instanceof page.window.Comment).toBe(true);
        expect(this.element.childNodes[3].textContent).toBe("");
        debugRef.$ = "err";
        expect(this.element.childNodes[3].textContent).toBe("err");

        const textRef = new Reference<string | null>(null);
        this.text(textRef);
        expect(this.element.childNodes[4] instanceof page.window.Text).toBe(true);
        expect(this.element.childNodes[4].textContent).toBe("");
        textRef.$ = "ok";
        expect(this.element.childNodes[4].textContent).toBe("ok");
    });

    root.destroy();
});

it("if", function () {
    const root = new App(page.window.document.body, {});
    let check1 = false;
    let check2 = true;

    root.if(new Reference(true), () => (check1 = true));
    root.if(new Reference(false), () => (check2 = false));

    expect(check1).toBe(true);
    expect(check2).toBe(true);
    root.destroy();
});

it("if else", function () {
    const root = new App(page.window.document.body, {});
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
    const root = new App(page.window.document.body, {});
    const v = new Reference(1);
    const v2 = new Reference(false);
    let check = 0;

    root.if(new Expression(v => v == 1, v), () => (check = 1));
    root.elif(new Expression(v => v == 2, v), () => (check = 2));
    root.elif(new Expression(v => v == 3, v), () => (check = 3));
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
    const root = new App(page.window.document.body, {});

    root.create(new Fragment({}), function () {
        const test = this;
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
                    "data-bind": root.expr((str: string) => {
                        return str.length > 1 ? str : "alternative";
                    }, attrValue),
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
            const num = new Expression(x => parseFloat(x) + 10, dyn);
            let el!: HTMLElement;

            test.tag(
                "div",
                {
                    style: {
                        display: "none",
                        margin: dyn,
                        padding: num,
                        width: 300,
                        inset: [12, 23],
                    },
                    callback: node => (el = node as HTMLElement),
                },
                function () {
                    const error = "non-html-element";

                    this.tag("circle", {}, function () {
                        // eslint-disable-next-line
                        // @ts-ignore
                        this.node = document.createComment("test");
                        expect(() => {
                            this.setStyle("display", "none");
                        }).toThrow(error);
                        expect(() => {
                            this.style("--p", dyn);
                        }).toThrow(error);
                    });
                },
            );

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

class MyExtension extends Extension {
    public compose() {
        this.tag("div", {
            class: ["ext"],
        });
    }
}

it("Extension test", function () {
    const root = new App(page.window.document.body, {});
    let div!: HTMLElement;

    root.tag(
        "div",
        {
            style: { display: "block" },
            class: [{ xxx: true }],
            callback: node => (div = node as HTMLElement),
        },
        function () {
            this.create(new Fragment({}), function () {
                const yyy = new Reference("yyy");

                this.create(new MyExtension({}), function () {
                    this.tag("div", {
                        style: { display: "none" },
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        class: [yyy, { xxx: false }],
                        slot: function () {
                            this.setAttr("data-s", "s");
                        },
                    });
                });
            });
        },
    );

    expect(div.style.display).toBe("none");
    expect(div.className).toBe("ext yyy");
    expect(div.dataset.s).toBe("s");

    root.destroy();
});

it("INode Events", function () {
    let test = false;
    const root = new App(page.window.document.body, {});
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

it("Mount/Show test", function () {
    const show = new Reference(true);
    const mount = new Reference(true);
    const root = new App(page.window.document.body, {});
    let showEl!: HTMLElement;

    root.tag("div", { callback: node => (showEl = node as HTMLElement) }, function () {
        this.bindShow(show);

        this.tag("div", {}, function () {
            this.bindMount(mount);
        });

        this.tag("div", {}, function () {
            this.addClass("second");
        });

        // exception test
    });

    show.$ = false;
    expect(showEl.style.display).toBe("none");

    show.$ = true;
    expect(showEl.style.display).toBe("");

    mount.$ = false;
    expect(showEl.childNodes.length).toBe(1);

    mount.$ = true;
    expect(showEl.childNodes.length).toBe(2);

    expect(showEl.innerHTML).toBe(`<div></div><div class="second"></div>`);

    mount.$ = false;
    expect(showEl.childNodes.length).toBe(1);
    expect(showEl.innerHTML).toBe(`<div class="second"></div>`);

    mount.$ = true;
    expect(showEl.childNodes.length).toBe(2);
    expect(showEl.innerHTML).toBe(`<div></div><div class="second"></div>`);

    root.destroy();
});

it("bind DON api test", function () {
    const root = new App(page.window.document.body, {});
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

    html.$ = "<b>b</b><i>i</i>";
    expect(el.innerHTML).toBe("<b>b</b><i>i</i>");

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
    const root = new App(page.window.document.body, {});
    const bool = new Reference(true);
    const text = new Reference("text");

    root.tag("div", {}, function () {
        // eslint-disable-next-line
        // @ts-ignore
        this.node = null;
        expect(() => this.bindShow(bool)).toThrow("bind-show");
        expect(() => this.bindDomApi("innerHtml", text)).toThrow("dom-error");
        expect(() => this.else(() => 0)).toThrow("logic-error");
        expect(() => this.elif(bool, () => 0)).toThrow("logic-error");
        expect(() => this.tag("" as unknown as "a", {})).toThrow("internal-error");
    });
});

it("INode unmount/mount advanced", function () {
    const root = new App(page.window.document.body, {});
    const mount = new Reference(true);
    let body!: Element;

    root.tag("div", { callback: node => (body = node) }, function () {
        this.create(new Fragment({}), function () {
            this.create(new Fragment({}), function () {
                this.create(new Fragment({}), function () {
                    this.tag("div", { class: ["0"] }, function () {
                        this.bindMount(mount);
                    });
                });
                this.create(new Fragment({}));
            });
            this.create(new Fragment({}));
            this.create(new Fragment({}), function () {
                this.create(new Fragment({}), function () {
                    this.create(new Fragment({}));
                    this.tag("div", { class: ["1"] }, function () {
                        this.bindMount(mount);
                    });
                    this.create(new Fragment({}), function () {
                        this.tag("div", { class: ["2"] });
                    });
                });
            });
        });
    });

    // check the unmount process result
    mount.$ = false;
    expect(body.children.length).toBe(1);
    expect(body.innerHTML.trim()).toBe(`<div class="2"></div>`);

    // check the mount order
    mount.$ = true;
    expect(body.children.length).toBe(3);
    expect(body.innerHTML).toBe('<div class="0"></div>' + '<div class="1"></div>' + '<div class="2"></div>');
});

it("INode unmount/mount advanced 2", function () {
    const root = new App(page.window.document.body, {});
    const mount = new Reference(true);
    let body!: Element;

    root.tag("div", { callback: node => (body = node) }, function () {
        this.create(new Fragment({}), function () {
            this.create(new Fragment({}), function () {
                this.tag("div", { class: ["0"] }, function () {
                    this.bindMount(mount);
                });
                this.tag("div", { class: ["1"] }, function () {
                    this.bindMount(mount);
                });
                this.tag("div", { class: ["2"] }, function () {
                    this.bindMount(mount);
                });
            });
            this.create(new Fragment({}), function () {
                this.tag("div", { class: ["3"] });
            });
        });
    });

    // check the unmount process result
    mount.$ = false;
    expect(body.children.length).toBe(1);
    expect(body.innerHTML.trim()).toBe(`<div class="3"></div>`);

    // check the mount order
    mount.$ = true;
    expect(body.children.length).toBe(4);
    expect(body.innerHTML).toBe(
        '<div class="0"></div>' + '<div class="1"></div>' + '<div class="2"></div>' + '<div class="3"></div>',
    );
});
