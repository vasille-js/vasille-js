import { JSDOM } from "jsdom";
import { App, Fragment } from "vasille";
import { Runner } from "vasille/web-runner";

export function createNode() {
    const page = new JSDOM(`
        <html>
            <head>
            </head>
            <body>
            </body>
        </html>
    `);
    const runner = new Runner(true, page.window.document);
    const node = new Fragment({}, runner);

    node.parent = new App(page.window.document.body, runner, {});
    global.HTMLElement = page.window.HTMLElement;

    return [node, page.window] as const;
}
