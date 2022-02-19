import {
    App,
    Binding,
    Component,
    Expression,
    Extension,
    Fragment,
    InterceptorNode,
    Reference,
    Signal
} from "../../src";
import {page} from "../page";
import {DebugNode, TextNode} from "../../src/node/node";

let created = false;
let mounted = false;
let ready = false;
let createWatchers = false;
let compose = false;

class FragmentTest extends Fragment {
    created() {
        super.created();
        created = true;
    }
    mounted() {
        super.mounted();
        mounted = true;
    }
    ready() {
        super.ready();
        ready = true;
    }
    createWatchers() {
        super.createWatchers();
        createWatchers = true;
    }
    compose() {
        super.compose();
        compose = true;
    }
}

it('Fragment', function () {
    const root = new App(page.window.document.body).init();

    root.create(new FragmentTest, frag => {
        void(frag);
    });
    expect(root.children.size).toBe(1);
    expect(created).toBe(true);
    expect(mounted).toBe(true);
    expect(ready).toBe(true);
    expect(createWatchers).toBe(true);
    expect(compose).toBe(true);

    root.destroy();
});

it('Tag', function () {
    const root = new App(page.window.document.body, { debugUi: true }).init();
    const text = new Reference("test");

    root.tag("div", div => {
        div.text(text, () => {
            expect(div.node.childNodes.length).toBe(1);
            expect(div.node.innerHTML.trim()).toBe("test");
            text.$ = "new";
            expect(div.node.innerHTML.trim()).toBe("new");
        });
        div.text("test");
        div.debug(new Reference<string>("debug"));
        expect(div.node.childNodes.length).toBe(3);
        expect(div.node.childNodes[2] instanceof page.window.Comment).toBe(true);
    });

    root.destroy();
});

it('if', function () {
    const root = new App(page.window.document.body).init();
    let check1 = false;
    let check2 = true;

    root.if(new Reference(true), () => check1 = true);
    root.if(new Reference(false), () => check2 = false);

    expect(check1).toBe(true);
    expect(check2).toBe(true);
    root.destroy();
});

it('if else', function () {
    const root = new App(page.window.document.body).init();
    const iv1 = new Reference(true);
    const iv2 = new Reference(false);

    let check1 = 1, check2 = 1;

    root.if_else(iv1, () => check1 = 1, () => check1 = 2);
    root.if_else(iv2, () => check2 = 1, () => check2 = 2);

    expect(check1).toBe(1);
    expect(check2).toBe(2);

    iv1.$ = false;
    iv2.$ = true;

    expect(check1).toBe(2);
    expect(check2).toBe(1);

    root.destroy();
});

it('switch', function () {
    const root = new App(page.window.document.body).init();
    const v = new Reference(1);
    const v2 = new Reference(false);
    let check = 0;

    root.switch(
        root.case(new Expression(v => v == 1, true, v), () => check = 1),
        root.case(new Expression(v => v == 2, true, v), () => check = 2),
        root.case(new Expression(v => v == 3, true, v), () => check = 3),
        root.case(v2, () => check = -2),
        root.default(() => check = 4)
    );

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

let createAttrs = false;
let createStyle = false;

class INodeTest extends Extension {
    createAttrs() {
        super.createAttrs();
        createAttrs = true;
    }
    createStyle() {
        super.createStyle();
        createStyle = true;
    }
}

it('INode', function () {
    const root = new App(page.window.document.body).init();

    root.create(new INodeTest, test => {
        // attr
        test.tag("div", (div, el) => {
            const attrName = "data-attr";
            const attrValue = new Reference("test");

            div.setAttr("data-set", "test");
            div.attr(attrName, attrValue);
            div.bindAttr("data-bind", str => {
                return str.length > 1 ? str : "alternative";
            }, attrValue);

            const data = el.dataset;

            expect(data.set).toBe("test");
            expect(data.attr).toBe("test");
            expect(data.bind).toBe("test");

            attrValue.$ = "";

            expect(data.attr).toBeUndefined();
            expect(data.bind).toBe("alternative");
        });

        // class
        test.tag("div", (div, el) => {
            const dyn = new Reference("dyn");
            const cond = new Reference(false);

            div.addClass('c1');
            div.addClasses('c2', 'c3');
            div.bindClass(dyn);
            div.floatingClass(cond, 'float');

            expect(el.className).toBe("c1 c2 c3 dyn");

            dyn.$ = "test";
            expect(el.className).toBe("c1 c2 c3 test");

            cond.$ = true;
            expect(el.className).toBe("c1 c2 c3 test float");

            cond.$ = false;
            expect(el.className).toBe("c1 c2 c3 test");
        });

        //style
        test.tag("div", (div, el) => {
            const dyn = new Reference("0px");

            div.setStyle('display', 'none');
            div.style('margin', dyn);
            div.bindStyle('padding', margin => {
                return parseFloat(margin) + 10 + 'px';
            }, dyn);

            expect(el.style.display).toBe('none');
            expect(el.style.margin).toBe('0px');
            expect(el.style.padding).toBe('10px');

            dyn.$ = '100px';
            expect(el.style.margin).toBe('100px');
            expect(el.style.padding).toBe('110px');

            const error = "non-html-element";

            div.tag('circle', (nonHTML) => {
                // eslint-disable-next-line
                // @ts-ignore
                nonHTML.$.node = document.createComment('test');
                expect(() => {
                    nonHTML.setStyle('display', 'none');
                }).toThrow(error);
                expect(() => {
                    nonHTML.style('--p', dyn);
                }).toThrow(error);
                expect(() => {
                    nonHTML.bindStyle('--p', () => 'trsy', dyn);
                }).toThrow(error);
            });
        });
    });

    expect(createAttrs).toBe(true);
    expect(createStyle).toBe(true);

    root.destroy();
});


it('INode Events', function () {
    let test = false;
    const root = new App(page.window.document.body).init();
    const handler = () => test = true;


    root.tag('button', (node, element) => {
        node.oncontextmenu(handler);
        node.onmousedown(handler);
        node.onmouseenter(handler);
        node.onmouseleave(handler);
        node.onmousemove(handler);
        node.onmouseout(handler);
        node.onmouseover(handler);
        node.onmouseup(handler);
        node.onclick(handler);
        node.ondblclick(handler);
        node.onblur(handler);
        node.onfocus(handler);
        node.onfocusin(handler);
        node.onfocusout(handler);
        node.onkeydown(handler);
        node.onkeyup(handler);
        node.onkeypress(handler);
        node.ontouchstart(handler);
        node.ontouchmove(handler);
        node.ontouchend(handler);
        node.ontouchcancel(handler);
        node.onwheel(handler);
        node.onabort(handler);
        node.onerror(handler);
        node.onload(handler);
        node.onloadend(handler);
        node.onloadstart(handler);
        node.onprogress(handler);
        node.ontimeout(handler);
        node.ondrag(handler);
        node.ondragend(handler);
        node.ondragenter(handler);
        node.ondragexit(handler);
        node.ondragleave(handler);
        node.ondragover(handler);
        node.ondragstart(handler);
        node.ondrop(handler);
        node.onpointerover(handler);
        node.onpointerenter(handler);
        node.onpointerdown(handler);
        node.onpointermove(handler);
        node.onpointerup(handler);
        node.onpointercancel(handler);
        node.onpointerout(handler);
        node.onpointerleave(handler);
        node.ongotpointercapture(handler);
        node.onlostpointercapture(handler);
        node.onanimationstart(handler);
        node.onanimationend(handler);
        node.onanimationiteraton(handler);
        node.onclipboardchange(handler);
        node.oncut(handler);
        node.oncopy(handler);
        node.onpaste(handler);

        element.click();
        expect(test).toBe(true);
    });
});

it('Freeze test', function () {
    const show = new Reference(true);
    const mount = new Reference(true);
    const root = new App(page.window.document.body).init();

    root.tag("div", (showTag, showEl) => {
        showTag.bindShow(show);

        show.$ = false;
        expect(showEl.style.display).toBe("none");

        show.$ = true;
        expect(showEl.style.display).toBe("");

        showTag.tag("div", mountTag => {
            mountTag.bindMount(mount);

            mount.$ = false;
            expect(showEl.childNodes.length).toBe(0);

            mount.$ = true;
            expect(showEl.childNodes.length).toBe(1);
        });

        showTag.tag("div", (div) => {
            div.addClass('second');

            expect(showEl.innerHTML).toBe(`<div></div><div class="second"></div>`);

            mount.$ = false;
            expect(showEl.childNodes.length).toBe(1);
            expect(showEl.innerHTML).toBe(`<div class="second"></div>`);

            mount.$ = true;
            expect(showEl.childNodes.length).toBe(2);
            expect(showEl.innerHTML).toBe(`<div></div><div class="second"></div>`);
        });

        // exception test
    });
});

it('raw HTML test', function () {
    const root = new App(page.window.document.body).init();
    const html = new Reference("test me now");

    root.tag('div', (node, el) => {
        node.html(html);
        expect(el.innerHTML).toBe("test me now");

        html.$ = '<b>b</b><i>i</i>';
        expect(el.innerHTML).toBe("<b>b</b><i>i</i>");
    });
});

it('Error threading', function () {
    const root = new App(page.window.document.body).init();
    const bool = new Reference(true);
    const text = new Reference('text');
    const frag = new Fragment();
    const ext = new Extension();
    const debug = new DebugNode();
    const textNode = new TextNode();

    root.tag('div', test => {
        // eslint-disable-next-line
        // @ts-ignore
        test.$.node = null;
        expect(() => test.bindShow(bool)).toThrow("bind-show");
        expect(() => test.html(text)).toThrow("dom-error");
        expect(() => test.preinit(root, root, null)).toThrow("internal-error");
        expect(() => ext.preinit(root, frag)).toThrow("virtual-dom");
        expect(() => debug.preinit(root, frag, null)).toThrow("internal-error");
        expect(() => textNode.preinit(root, frag, null)).toThrow("internal-error");
    });
});

class ZeroChildrenComponent extends Component {
}

class OneChildComponent extends Component {
    compose() {
        this.create(new Fragment());
    }
}

class MultiChildrenComponent extends Component {
    compose() {
        this.tag('div');
        this.tag('div');
    }
}

class CorrectComponent extends Component {
    compose() {
        this.tag('div');
    }
}

it('Component test', function () {
    const root = new App(page.window.document.body).init();

    expect(() => root.create(new ZeroChildrenComponent)).toThrow("dom-error");
    expect(() => root.create(new OneChildComponent)).toThrow("dom-error");
    expect(() => root.create(new MultiChildrenComponent)).toThrow("dom-error");

    root.create(new CorrectComponent);
});

it('INode unmount/mount advanced', function () {
    const root = new App(page.window.document.body).init();
    const mount = new Reference(true);

    root.tag('div', (main, body) => {
        main.create(new Fragment, l1 => {
            l1.create(new Fragment, l2 => {
                l2.create(new Fragment, l3 => {
                    l3.tag("div", div => {
                        div.bindMount(mount);
                        div.addClass('0');
                    });
                });
                l2.create(new Fragment);
            });
            l1.create(new Fragment);
            l1.create(new Fragment, l2 => {
                l2.create(new Fragment, l3 => {
                    l3.create(new Fragment);
                    l3.tag('div', div => {
                        div.bindMount(mount);
                        div.addClass('1');
                    });
                    l3.create(new Fragment, l4 => {
                        l4.tag('div', div => div.addClass('2'));
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
        expect(body.innerHTML).toBe(
            '<div class="0"></div>' +
            '<div class="1"></div>' +
            '<div class="2"></div>');
    });
});

it('INode unmount/mount advanced 2', function () {
    const root = new App(page.window.document.body).init();
    const mount = new Reference(true);

    root.tag('div', (main, body) => {
        main.create(new Fragment, l1 => {
            l1.create(new Fragment, l2 => {
                l2.tag("div", div => {
                    div.bindMount(mount);
                    div.addClass('0');
                });
                l2.tag("div", div => {
                    div.bindMount(mount);
                    div.addClass('1');
                });
                l2.tag("div", div => {
                    div.bindMount(mount);
                    div.addClass('2');
                });
            });
            l1.create(new Fragment, l2 => {
                l2.tag("div", div => {
                    div.addClass('3');
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
            '<div class="0"></div>' +
            '<div class="1"></div>' +
            '<div class="2"></div>' +
            '<div class="3"></div>');
    });
});

let interceptTest = -1;

class Receiver extends Fragment {
    receive (i : number) {
        interceptTest = i;
    }
}

class Emitter extends Fragment {
    signal = new Signal<number>();

    ready() {
        super.ready();
        this.signal.emit(23);
    }
}

it('Interceptor Node', function () {
    const root = new App(page.window.document.body).init();

    root.create(new InterceptorNode<number>(), node => node.slot.insert((node, interceptor) => {

        node.create(new Receiver(), receiver => interceptor.connect(receiver.receive));
        node.create(new Emitter(), emitter => interceptor.connect(emitter.signal));

        expect(interceptTest).toBe(23);
    }));
});
