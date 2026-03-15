import { JSDOM, DOMWindow } from "jsdom";
import { register } from "./components/Component.js";
import { ref } from "vasille-jsx";

it("shadow", () => {
    const page = new JSDOM(`
        <html>
            <head>
            </head>
            <body>
            </body>
        </html>
    `);

    global.HTMLElement = page.window.HTMLElement;
    global.customElements = page.window.customElements;
    global.document = page.window.document;
    global.CustomEvent = page.window.CustomEvent;

    register();

    const body = page.window.document.body;
    let tag = page.window.document.createElement("shadow-node");
    const $prop = ref(2);

    tag.setAttribute("id-number", "1");
    tag.setAttribute("name", "test");
    tag.setAttribute("visible", "");
    tag.prop = $prop;

    body.appendChild(tag);

    expect(body.children.length).toBe(1);
    expect(body.children[0].tagName).toBe("SHADOW-NODE");
    expect(tag.prop).toBe($prop.V);

    const shadow = body.children[0].shadowRoot;

    expect(!!shadow).toBe(true);
    expect(shadow.children.length).toBe(3);
    expect(shadow.children[0].innerHTML).toBe("1+2");
    expect(shadow.children[1].innerHTML).toBe("test");

    let hiddenEvent = false,
        hiddenProp = false;

    tag.addEventListener("item-hide", ev => {
        hiddenEvent = ev.detail;
    });
    tag.onItemHide = isHide => {
        hiddenProp = isHide;
    };

    tag.removeAttribute("visible");
    expect(shadow.children.length).toBe(2);
    expect(hiddenEvent).toBe(true);
    expect(hiddenProp).toBe(true);

    tag.setAttribute("id-number", "2");
    expect(shadow.children[0].innerHTML).toBe("2+2");
    tag.setAttribute("name", "test-2");
    expect(shadow.children[1].innerHTML).toBe("test-2");

    $prop.V = 4;
    expect(shadow.children[0].innerHTML).toBe("2+4");
    tag.removeAttribute("id-number");
    expect(shadow.children[0].innerHTML).toBe("0+4");

    tag.setId(4);
    expect(shadow.children[0].innerHTML).toBe("4+4");
    expect(tag.altName).toBe(undefined);
    tag.altName = "test-3";
    expect(tag.altName).toBe("test-3");
    expect(shadow.children[1].innerHTML).toBe("test-3");

    tag.remove();
    expect(body.children.length).toBe(0);
});
