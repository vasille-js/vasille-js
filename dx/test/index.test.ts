import { JSDOM } from "jsdom";
import { Fragment, IValue } from "vasille";
import { Runner } from "vasille/web-runner";
import { compose, mount, Slot, Watch, awaited, $, ElseIf, For, If, Else, Delay, Debug } from "../src/index.js";

function page() {
    const page = new JSDOM(`
        <html>
            <head>
            </head>
            <body>
            </body>
        </html>
    `);

    global.HTMLElement = page.window.HTMLElement;

    return page.window;
}

/**
 * This test is to ensure that all required functional is imported from vasille-jsx
 */
it("test exported functions", function (done) {
    let el!: HTMLElement;
    const window = page();
    const runner = new Runner(true, window.document);
    const component = compose(function (
        f: Fragment<Node, Element, object>,
        p: { slot: (o: object, f: Fragment<Node, Element, object>) => void },
    ) {
        f.tag("div", { callback: n => (el = n as HTMLElement) }, function (f) {
            Slot(f, { model: p.slot });
        });
        Debug(f, {} as any);
        Delay(f, {} as any);
        If(f, {} as any);
        ElseIf(f, {} as any);
        Else(f, {} as any);
        For(f, {} as any);
        Watch(f, {} as any);
    }, "test");

    mount(window.document.body, component, runner, {
        slot(o, f) {},
    });

    expect(el.className).toBe("");

    const frag = new Fragment({}, runner);
    const promise = new Promise(rv => {
        rv(2);
    });
    const a = $.r(1);
    const [err, result] = awaited(frag, promise);

    expect((a as IValue<unknown>).$).toBe(1);

    setTimeout(() => {
        expect(err.$).toBe(undefined);
        expect(result.$).toBe(2);
        done();
    });
});
