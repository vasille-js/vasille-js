import { styleSheet } from "vasille-css";
import { App } from "../../src/index.js";
import { Runner, TagOptions } from "../../src/runner/web/runner.js";
import { page } from "../page.js";

const styles = styleSheet({
    field: ["{}{display: none}"],
});

class MyApp extends App<Node, Element, TagOptions> {
    public compose() {
        this.tag("div", {
            c: [styles.field],
        });
    }
}

it("has css stylesheet", function () {
    const window = page();
    const app = new MyApp(window.document.body, new Runner(window.document));

    global.document = window.document;
    app.compose();

    expect(window.document.body.children.length).toBe(1);
    expect(window.document.body.children[0]!.className).toBe("vasille-2");
});
