import { JSDOM } from "jsdom";

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
