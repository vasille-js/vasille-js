import { JSDOM } from "jsdom";
import { setIndex, setMobileMaxWidth, setTabletMaxWidth, setLaptopMaxWidth, webStyleSheet } from "../src";
const page = new JSDOM(`
<html>
    <head>
    </head>
    <body>
    </body>
</html>
`);

global.document = page.window.document;
global.HTMLElement = page.window.HTMLElement;

it("calculted style test", function () {
    setIndex(0);
    setMobileMaxWidth(400);
    setTabletMaxWidth(800);
    setLaptopMaxWidth(1200);

    const classes = webStyleSheet({
        test: [
            "{} { color: #000 }",
            [1, "{} { color: #f00 }"],
            [2, "{} { color: #0f0 }"],
            [3, "{} { color: #00f }"],
            [4, "{} { color: #ff0 }"],
            [5, "{} { color: #0ff }"],
        ],
    });

    expect(classes.test).toBe("v-1");

    function style(index: number) {
        return page.window.document.head.children[index] as unknown as { media: string };
    }

    expect(page.window.document.head.children.length).toBe(6);
    expect(style(0).media).toBe("");
    expect(style(1).media).toBe("(max-width:400px)");
    expect(style(2).media).toBe("(min-width:400px)and(max-width:800px)");
    expect(style(3).media).toBe("(min-width:800px)and(max-width:1200px)");
    expect(style(4).media).toBe("(prefers-color-scheme:dark)");
    expect(style(5).media).toBe("(prefers-color-scheme:light)");

    function sheet(index: number) {
        return page.window.document.styleSheets[index] as unknown as { cssRules: { style: { color: string } }[] };
    }

    expect(sheet(0).cssRules.length).toBe(1);
    expect(sheet(0).cssRules[0].style.color).toBe("#000");
    expect(sheet(1).cssRules.length).toBe(1);
    expect(sheet(1).cssRules[0].style.color).toBe("#f00");
    expect(sheet(2).cssRules.length).toBe(1);
    expect(sheet(2).cssRules[0].style.color).toBe("#0f0");
    expect(sheet(3).cssRules.length).toBe(1);
    expect(sheet(3).cssRules[0].style.color).toBe("#00f");
    expect(sheet(4).cssRules.length).toBe(1);
    expect(sheet(4).cssRules[0].style.color).toBe("#ff0");
    expect(sheet(5).cssRules.length).toBe(1);
    expect(sheet(5).cssRules[0].style.color).toBe("#0ff");
});
