import { Runner, TagOptions } from "../../src/runner/web/runner";
import { page } from "../page";
import { App, Portal } from "../../src";

class MyApp extends App<Node, Element, TagOptions> {
    div!: HTMLDivElement;

    public compose() {
        this.tag("div", { callback: node => (this.div = node as HTMLDivElement) });

        this.create(new Portal<Node, Element, TagOptions>({ node: this.div }, this.runner), function (f) {
            f.tag("span", {});
        });
    }
}

it("App", function () {
    const window = page();
    const app = new MyApp(window.document.body, new Runner(true, window.document), {});

    app.compose();
    expect(app.div.childElementCount).toBe(1);
    expect(app.children.size).toBe(2);
});
