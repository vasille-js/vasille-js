import { JSDOM } from "jsdom";
import { Fragment } from "vasille";
import {
    compose,
    extend,
    mount,
    Adapter,
    Slot,
    Watch,
    awaited,
    calculate,
    ensureIValue,
    forward,
    point,
    watch,
    $,
    Mount,
    Show,
    ElseIf,
    For,
    If,
    Else,
    Delay,
    Debug,
} from "../src";
const page = new JSDOM(`
<html>
    <head>
    </head>
    <body>
    </body>
</html>
`);

global.document = page.window.document;
global.HTMLElement = page.window.HTMLElement;

/**
 * This test is to ensure that all required functional is imported from vasille-jsx
 */
it("test exported functions", function (done) {
    let el!: HTMLElement;
    const component = compose(function (this: Fragment, p: { slot: () => void }) {
        this.tag("div", { callback: n => (el = n as HTMLElement) }, function () {
            Mount.call(this, { bind: true });
            Show.call(this, { bind: true });
            Slot.call(this, { model: p.slot }, {});
        });
        Adapter.call(this, { node: new Fragment({}) });
        Debug.call(this, {});
        Delay.call(this, {});
        If.call(this, {});
        ElseIf.call(this, {});
        Else.call(this, {});
        For.call(this, {});
        Watch.call(this, {});
    }, "test");
    const extension = extend(function (this: Fragment) {
        this.tag("div", { class: ["ext"] });
    }, "ext");

    mount(page.window.document.body, component, {
        slot() {
            extension.call(this, {});
        },
    });

    expect(el.className).toBe("ext");

    const frag = new Fragment({});
    const promise = new Promise(rv => {
        rv(2);
    });
    const [err, result] = awaited(frag, promise);
    const a = $.let(frag, 1);
    const b = $.let(frag, 2);
    const ab = calculate(frag, (a: number, b: number) => a + b, a, b);
    const aClone = ensureIValue(frag, a);
    const aForward = forward(frag, a);
    const aPoint = point(frag, a);

    watch(frag, () => {}, [a]);

    expect($.rv(ab)).toBe(3);
    expect($.rv(aClone)).toBe($.rv(a));
    expect($.rv(aForward)).toBe($.rv(a));
    expect($.rv(aPoint)).toBe($.rv(a));

    setTimeout(() => {
        expect($.rv(err)).toBe(undefined);
        expect($.rv(result)).toBe(2);
        done();
    });
});
