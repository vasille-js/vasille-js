import { JSDOM } from "jsdom";
import { App, Fragment } from "vasille";
import { Runner, TagOptions } from "vasille/web-runner";

export function createNode() {
    const page = new JSDOM(`
        <html>
            <head>
            </head>
            <body>
            </body>
        </html>
    `);
    const runner = new Runner(page.window.document);
    const node = new Fragment(runner, 1);

    node.parent = new App<Node, Element, TagOptions>(page.window.document.body, runner);
    global.HTMLElement = page.window.HTMLElement;

    return [node, page.window] as const;
}
