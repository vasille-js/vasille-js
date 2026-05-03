import { JSDOM, DOMWindow } from "jsdom";
import { Expression, IValue, KindOfIValue, Reactive, Reference } from "../src/index.js";

export function page() {
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

export class TestExpression<T, Args extends unknown[]> extends Expression<T, Args> {
    public constructor(func: (...args: Args) => T, values: KindOfIValue<Args>, ctx?: Reactive) {
        super(func, args => new Reference(func.apply(null, args)), values, ctx);
    }
}
