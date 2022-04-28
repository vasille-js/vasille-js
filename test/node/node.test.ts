import {
    App,
    Component,
    Expression,
    Extension,
    Fragment, INode,
    Reference, Tag, TagOptions
} from "../../src";
import {page} from "../page";
import {DebugNode, TextNode} from "../../src/node/node";

let ready = false;
let compose = false;

class FragmentTest extends Fragment {
    ready() {
        super.ready();
        ready = true;
    }
    compose() {
        super.compose({});
        compose = true;
    }
}

it('Fragment', function () {
    const root = new App(page.window.document.body, {});

    root.init();

    root.create(new FragmentTest({}));
    expect(root.children.size).toBe(1);
    expect(ready).toBe(true);
    expect(compose).toBe(true);

    root.destroy();
});

it('Tag', function () {
    const root = new App(page.window.document.body, { debugUi: true });
    const text = new Reference("test");

    root.init();

    root.tag("div", {}, (div : Tag<'div'>) => {
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
    const root = new App(page.window.document.body, {});
    let check1 = false;
    let check2 = true;

    root.init();

    root.if(new Reference(true), () => check1 = true);
    root.if(new Reference(false), () => check2 = false);

    expect(check1).toBe(true);
    expect(check2).toBe(true);
    root.destroy();
});

it('if else', function () {
    const root = new App(page.window.document.body, {});
    const iv1 = new Reference(true);
    const iv2 = new Reference(false);

    root.init();

    let check1 = 1, check2 = 1;

    root.if(iv1, () => check1 = 1);
    root.else(() => check1 = 2);

    root.if(iv2, () => check2 = 1);
    root.else(() => check2 = 2);

    expect(check1).toBe(1);
    expect(check2).toBe(2);

    iv1.$ = false;
    iv2.$ = true;

    expect(check1).toBe(2);
    expect(check2).toBe(1);

    root.destroy();
});

it('switch', function () {
    const root = new App(page.window.document.body, {});
    const v = new Reference(1);
    const v2 = new Reference(false);
    let check = 0;

    root.init();

    root.if(new Expression(v => v == 1, true, v), () => check = 1);
    root.elif(new Expression(v => v == 2, true, v), () => check = 2);
    root.elif(new Expression(v => v == 3, true, v), () => check = 3);
    root.elif(v2, () => check = -2);
    root.else(() => check = 4);

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

it('INode', function () {
    const root = new App(page.window.document.body, {});

    root.create(new Fragment({}), (test : Fragment) => {
        // attr
        (function (){
            const attrName = "data-attr";
            const attrValue = new Reference("test");
            const el = test.tag("div", {
                "v:attr": {
                    "data-checked": true,
                    "data-checked2": root.ref(true),
                    "data-set": "test",
                    [attrName]: attrValue,
                    "data-bind": root.expr((str : string) => {
                        return str.length > 1 ? str : "alternative";
                    }, attrValue)
                }
            });

            const data = el.dataset;

            expect(data.set).toBe("test");
            expect(data.attr).toBe("test");
            expect(data.bind).toBe("test");

            attrValue.$ = "";

            expect(data.attr).toBeUndefined();
            expect(data.bind).toBe("alternative");
            expect(test.parent).toBe(root);
            expect(test.app).toBe(root);
        })();

        // class
        (function () {
            const dyn = new Reference("dyn");
            const cond = new Reference(false);

            const el = test.tag("div", {
                class: [
                    'c1', 'c2', 'c3',
                    dyn,
                    { float: cond }
                ]
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
            const num = new Expression(x => parseFloat(x) + 10, true, dyn);
            const el = test.tag("div", {
                style: {
                    display: 'none',
                    margin: dyn,
                    padding: [num, 'px'],
                    width: [300, 'px']
                }
            }, (div) => {
                const error = "non-html-element";

                div.tag('circle', {}, (nonHTML : INode) => {
                    // eslint-disable-next-line
                    // @ts-ignore
                    nonHTML.$.node = document.createComment('test');
                    expect(() => {
                        nonHTML.setStyle('display', 'none');
                    }).toThrow(error);
                    expect(() => {
                        nonHTML.style('--p', dyn);
                    }).toThrow(error);
                });
            });

            expect(el.style.display).toBe('none');
            expect(el.style.margin).toBe('0px');
            expect(el.style.padding).toBe('10px');
            expect(el.style.width).toBe('300px');

            dyn.$ = '100px';
            expect(el.style.margin).toBe('100px');
            expect(el.style.padding).toBe('110px');
        })();
    });

    root.destroy();
});

it('Extension test', function () {
    const root = new App(page.window.document.body, {});

    const div = root.tag("div", {
        style: { display: 'block' },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        class: { $: [], 'xxx': true }
    }, node => {
        node.create(new Fragment({}), node1 => {
            const yyy = new Reference('yyy');

            node1.create(new Extension<TagOptions<any>>({
                style: { display: 'none' },
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                class: { $: [yyy], 'xxx': false }
            }));
        });
    });

    expect(div.style.display).toBe('none');
    expect(div.className).toBe('yyy');

    root.destroy();
})


it('INode Events', function () {
    let test = false;
    const root = new App(page.window.document.body, {});
    const handler = () => test = true;

    root.init();

    const element = root.tag<'button'>('button', { "v:events": { click: handler } });
    element.click();
    expect(test).toBe(true);

    root.destroy();
});

it('Freeze test', function () {
    const show = new Reference(true);
    const mount = new Reference(true);
    const root = new App(page.window.document.body, {});

    const showEl = root.tag("div", {}, (showTag : Tag<'div'>) => {
        showTag.bindShow(show);

        showTag.tag("div", {}, (mountTag : Tag<'div'>) => {
            mountTag.bindMount(mount);
        });

        showTag.tag("div", {}, (div : Tag<'div'>) => {
            div.addClass('second');
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

it('bind DON api test', function () {
    const root = new App(page.window.document.body, {});
    const html = new Reference("test me now");
    const bool = new Reference(true);
    const num = new Reference(0.1);

    global.HTMLInputElement = page.window.HTMLInputElement;
    global.HTMLTextAreaElement = page.window.HTMLTextAreaElement;
    global.HTMLInputElement = page.window.HTMLInputElement;
    global.HTMLMediaElement = page.window.HTMLMediaElement;

    const el = root.tag('div', {
        "v:bind": {
            'innerHTML': html
        }
    });

    const input = root.tag('textarea', { "v:bind": { value: html } }) as HTMLTextAreaElement;
    const checkbox = root.tag('input', { "v:attr": { type: 'checkbox' }, "v:bind": { checked: bool } } ) as HTMLInputElement;
    const media = root.tag('audio', { "v:bind": { volume: num } }) as HTMLAudioElement;
    const media2 = root.tag('audio', { "v:set": { volume: 0.75 } }) as HTMLAudioElement;

    expect(el.innerHTML).toBe("test me now");

    html.$ = '<b>b</b><i>i</i>';
    expect(el.innerHTML).toBe("<b>b</b><i>i</i>");

    html.$ = '1';
    expect(input.value).toBe('1');
    input.value = '2';
    input.oninput(1 as any);
    expect(html.$).toBe('2');

    bool.$ = false;
    expect(checkbox.checked).toBe(false);
    checkbox.checked = true;
    checkbox.oninput(2 as any);
    expect(bool.$).toBe(true);

    num.$ = 1;
    expect(media.volume).toBe(1);
    media.volume = 0.5;
    expect(num.$).toBe(0.5);

    expect(media2.volume).toBe(0.75);

    root.destroy();
});

it('Error threading', function () {
    const root = new App(page.window.document.body, {});
    const bool = new Reference(true);
    const text = new Reference('text');
    const frag = new Fragment({});
    const ext = new Extension({});
    const debug = new DebugNode();
    const textNode = new TextNode();

    root.tag('div', {}, test => {
        // eslint-disable-next-line
        // @ts-ignore
        test.$.node = null;
        expect(() => test.bindShow(bool)).toThrow("bind-show");
        expect(() => test.bindDomApi('innerHtml', text)).toThrow("dom-error");
        expect(() => test.preinit(root, root, null)).toThrow("internal-error");
        expect(() => ext.preinit(root, frag)).toThrow("virtual-dom");
        expect(() => debug.preinit(root, frag, null)).toThrow("internal-error");
        expect(() => textNode.preinit(root, frag, null)).toThrow("internal-error");
        expect(() => root.else(() => 0)).toThrow('logic-error');
        expect(() => root.elif(bool, () => 0)).toThrow("logic-error");
    });
});

class ZeroChildrenComponent extends Component<TagOptions<any>> {
}

class OneChildComponent extends Component<TagOptions<any>> {
    compose() {
        this.create(new Fragment({}));
    }
}

class MultiChildrenComponent extends Component<TagOptions<any>> {
    compose() {
        this.tag('div', {});
        this.tag('div', {});
    }
}

class CorrectComponent extends Component<TagOptions<any>> {
    compose() {
        this.tag('div', {});
    }
}

it('Component test', function () {
    const root = new App(page.window.document.body, {});

    expect(() => root.create(new ZeroChildrenComponent({}))).toThrow("dom-error");
    expect(() => root.create(new OneChildComponent({}))).toThrow("dom-error");
    expect(() => root.create(new MultiChildrenComponent({}))).toThrow("dom-error");

    root.create(new CorrectComponent({}));
});

it('INode unmount/mount advanced', function () {
    const root = new App(page.window.document.body, {});
    const mount = new Reference(true);

    const body = root.tag('div', {}, (main) => {
        main.create(new Fragment({}), l1 => {
            l1.create(new Fragment({}), l2 => {
                l2.create(new Fragment({}), l3 => {
                    l3.tag("div", { class: ['0'] }, div => {
                        div.bindMount(mount);
                    });
                });
                l2.create(new Fragment({}));
            });
            l1.create(new Fragment({}));
            l1.create(new Fragment({}), l2 => {
                l2.create(new Fragment({}), l3 => {
                    l3.create(new Fragment({}));
                    l3.tag('div', { class: ['1'] }, div => {
                        div.bindMount(mount);
                    });
                    l3.create(new Fragment({}), l4 => {
                        l4.tag('div', { class: ['2'] });
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
    expect(body.innerHTML).toBe(
        '<div class="0"></div>' +
        '<div class="1"></div>' +
        '<div class="2"></div>');
});

it('INode unmount/mount advanced 2', function () {
    const root = new App(page.window.document.body, {});
    const mount = new Reference(true);

    const body = root.tag('div', {}, (main) => {
        main.create(new Fragment({}), l1 => {
            l1.create(new Fragment({}), l2 => {
                l2.tag("div", { class: ['0'] }, div => {
                    div.bindMount(mount);
                });
                l2.tag("div", { class: ['1'] }, div => {
                    div.bindMount(mount);
                });
                l2.tag("div", { class: ['2'] }, div => {
                    div.bindMount(mount);
                });
            });
            l1.create(new Fragment({}), l2 => {
                l2.tag("div", { class: ['3'] });
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
