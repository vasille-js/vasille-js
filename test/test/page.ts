import {JSDOM} from "jsdom"

export const page = new JSDOM(`
        <html>
            <head>
            </head>
            <body>
            </body>
        </html>
    `);

// @ts-ignore
global.window = page.window;
global.document = page.window.document;
global.location = page.window.location;
global.HTMLElement = page.window.HTMLElement;
