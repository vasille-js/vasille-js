import { JSDOM, DOMWindow } from "jsdom";

export function page(url?: string) {
    const page = new JSDOM(
        `
        <html>
            <head>
            </head>
            <body>
            </body>
        </html>
    `,
        { url: url ?? "http://localhost:8080" },
    );

    global.HTMLElement = page.window.HTMLElement;

    return page.window;
}
