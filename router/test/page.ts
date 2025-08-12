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

    if (process.env.VASILLE_TARGET === "es5") {
        page.window.onpopstate = function () {};
        // @ts-ignore
        delete page.window.URL;
        Object.defineProperty(page.window, "history", { value: null });
        // @ts-ignore
        Object.entries = null;
    }

    return page.window;
}
