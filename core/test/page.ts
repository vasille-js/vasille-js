import { JSDOM, DOMWindow } from "jsdom";

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
