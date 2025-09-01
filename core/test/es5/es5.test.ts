import { App, Reference } from "../../src/index.js";
import { Runner, Tag, TagOptions } from "../../src/runner/web/runner.js";
import { page } from "../page.js";

class ES5Tag extends Tag {
    public compose() {
        if (!this.name) {
            throw "no name";
        }

        const node = this.runner.document.createElement(this.name);

        Object.defineProperty(node, "classList", { value: null });
        this.node = node;
        this.applyOptions(this.options);
        this.parent.appendNode(node);
        this.options.callback?.(this.node);
        this.options.slot?.(this);
    }
}

class ES5Runner extends Runner {
    public tag(
        tagName: string,
        input: TagOptions,
        cb?:
            | {
                  (ctx: Tag): void;
              }
            | undefined,
    ): Tag {
        if (cb) {
            input.slot = cb;
        }

        return new ES5Tag(input, this, tagName);
    }
}

it("ES5 test", function () {
    process.env.VASILLE_TARGET = "es5";

    let test = false;
    const window = page();
    const body = window.document.body;
    const root = new App(body, new ES5Runner(true, window.document));
    const add = new Reference(true);

    root.tag("button", {
        class: ["before", { classTest: add }, "after"],
    });

    expect(body.children.length).toBe(1);
    expect(body.children[0].className).toEqual("before classTest after");
    add.V = false;
    expect(body.children[0].className).toEqual("before after");
    add.V = true;
    expect(body.children[0].className).toEqual("before after classTest");

    root.destroy();
});
