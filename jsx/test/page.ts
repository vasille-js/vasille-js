import { JSDOM } from "jsdom";
import { App, Fragment } from "vasille";

export const page = new JSDOM(`
<html>
    <head>
    </head>
    <body>
    </body>
</html>
`);

global.document = page.window.document;
global.HTMLElement = page.window.HTMLElement;

export function createNode() {
    const node = new Fragment({});

    node.parent = new App(page.window.document.body, {});

    return node;
}
