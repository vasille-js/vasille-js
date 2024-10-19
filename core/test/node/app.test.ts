import { page } from "../page";
import { App } from "../../src";
import { Portal } from "../../src/node/app";

class MyApp extends App {
    div!: HTMLDivElement;

    public compose() {
        this.tag("div", { callback: node => (this.div = node as HTMLDivElement) });

        this.create(new Portal({ node: this.div }), function () {
            this.tag("span", {});
        });

        return {};
    }
}

it("App", function () {
    const app = new MyApp(page.window.document.body, { debugUi: true });

    app.compose();
    expect(app.div.childElementCount).toBe(1);
    expect(app.children.size).toBe(2);
});
