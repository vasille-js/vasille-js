import { JSDOM } from "jsdom";
import { Fragment, IValue } from "vasille";
import {
    compose,
    extend,
    mount,
    Adapter,
    Slot,
    Watch,
    awaited,
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
    const component = compose(function (f: Fragment, p: { slot: (o: object, f: Fragment) => void }) {
        f.tag("div", { callback: n => (el = n as HTMLElement) }, function (f) {
            Mount(f, { bind: true });
            Show(f, { bind: true });
            Slot(f, { model: p.slot });
        });
        Adapter(f, { node: new Fragment({}) });
        Debug(f, {} as any);
        Delay(f, {} as any);
        If(f, {} as any);
        ElseIf(f, {} as any);
        Else(f, {} as any);
        For(f, {} as any);
        Watch(f, {} as any);
    }, "test");
    const extension = extend(function (f: Fragment) {
        f.tag("div", { class: ["ext"] });
    }, "ext");

    mount(page.window.document.body, component, {
        slot(o, f) {
            extension(f, {});
        },
    });

    expect(el.className).toBe("ext");

    const frag = new Fragment({});
    const promise = new Promise(rv => {
        rv(2);
    });
    const a = $.r(1);
    const [err, result] = awaited(frag, promise);

    expect((a as IValue<unknown>).$).toBe(1);

    setTimeout(() => {
        expect((err.$)).toBe(undefined);
        expect((result.$)).toBe(2);
        done();
    });
});
