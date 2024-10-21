import { page } from "../page";
import { App, Portal } from "../../src";

class MyApp extends App {
    div!: HTMLDivElement;

    public compose() {
        this.tag("div", { callback: node => (this.div = node as HTMLDivElement) });

        this.create(new Portal({ node: this.div }), function () {
            this.tag("span", {});
        });
    }
}

it("App", function () {
    const app = new MyApp(page.window.document.body, { debugUi: true });

    app.compose();
    expect(app.div.childElementCount).toBe(1);
    expect(app.children.size).toBe(2);
});
