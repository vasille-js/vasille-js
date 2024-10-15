import { page } from "../page";
import { App } from "../../src";
import { Portal } from "../../src/node/app";

class MyApp extends App {
    div: HTMLDivElement;

    protected compose(input) {
        super.compose(input);

        const div = this.tag("div", {});

        this.create(new Portal({ node: div }), node => {
            node.tag("span", {});
        });

        this.div = div as HTMLDivElement;
        return {};
    }
}

it("App", function () {
    const app = new MyApp(page.window.document.body, { debugUi: true });

    expect(app.div.childElementCount).toBe(1);
    expect(app.children.size).toBe(2);
});
