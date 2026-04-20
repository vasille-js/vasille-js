import { IRunner } from "../../src/node/runner.js";
import { Runner, TagOptions } from "../../src/runner/web/runner.js";
import { page } from "../page.js";
import { App, ArrayModel, ArrayView, Expression, Fragment, Reference, SwitchedNode, Watch } from "../../src/index.js";

class MyApp extends App<Node, Element, TagOptions> {
    div!: HTMLDivElement;
    /**
     * root:
     * - ref_0
     * - frag_1
     *   - ref_1
     *   - frag_1_1
     *     - ref_1_1
     * - frag_2
     *   - ref_2
     *   - frag_2_1
     *     - ref_2_2
     * */
    ref_0!: Reference<number>;
    ref_1!: Reference<number>;
    ref_1_1!: Reference<number>;
    ref_1_1_1!: Reference<number>;
    ref_2!: Reference<number>;
    ref_2_1!: Reference<number>;
    ref_2_1_1!: Reference<number>;
    expr_1!: Expression<number, [number]>;
    expr_1_1!: Expression<number, [number, number]>;
    expr_1_1_1!: Expression<number, [number, number]>;
    expr_2!: Expression<number, [number, number]>;
    expr_2_1!: Expression<number, [number, number]>;
    expr_2_1_1!: Expression<number, [number, number]>;
    frag_1!: Fragment<Node, Element, TagOptions>;
    frag_1_1!: Fragment<Node, Element, TagOptions>;
    frag_1_1_1!: Fragment<Node, Element, TagOptions>;
    frag_2!: Fragment<Node, Element, TagOptions>;
    frag_2_1!: Fragment<Node, Element, TagOptions>;
    frag_2_1_1!: Fragment<Node, Element, TagOptions>;

    public constructor(node: Element, runner: IRunner<Node, Element, TagOptions>) {
        super(node, runner);
        this.ref_0 = new Reference(1, this);
    }

    public compose(triple?: boolean, runOnDestroy?: () => void) {
        this.tag("div", { k: node => (this.div = node as HTMLDivElement) });

        this.create(new Fragment<Node, Element, TagOptions>(this.runner, this.sDeep + 1), ctx => {
            this.frag_1 = ctx;
            this.ref_1 = new Reference(1, ctx);
            this.expr_1 = new Expression(n => n, [this.ref_1], ctx);

            ctx.create(new Fragment<Node, Element, TagOptions>(this.runner, ctx.sDeep + 1), ctx => {
                this.frag_1_1 = ctx;
                this.ref_1_1 = new Reference(11, ctx);
                this.expr_1_1 = new Expression((n, m) => n + m, [this.ref_1_1, this.ref_1], ctx);

                if (triple) {
                    ctx.create(new Fragment<Node, Element, TagOptions>(this.runner, ctx.sDeep + 1), ctx => {
                        this.frag_1_1_1 = ctx;
                        this.ref_1_1_1 = new Reference(111, ctx);
                        this.expr_1_1_1 = new Expression((n, m) => n, [this.ref_1_1_1, this.expr_1_1], ctx);
                    });
                }
                if (runOnDestroy) {
                    ctx.runOnDestroy(runOnDestroy);
                }
            });
        });
        this.create(new Fragment<Node, Element, TagOptions>(this.runner, this.sDeep + 1), ctx => {
            this.frag_2 = ctx;
            this.ref_2 = new Reference(2, ctx);

            if (!triple) {
                this.expr_2 = new Expression((n, m) => n + m, [this.ref_0, this.ref_2], ctx);
            }

            ctx.create(new Fragment<Node, Element, TagOptions>(this.runner, ctx.sDeep + 1), ctx => {
                this.frag_2_1 = ctx;
                this.ref_2_1 = new Reference(21, ctx);

                if (!triple) {
                    this.expr_2_1 = new Expression((n, m) => n + m, [this.ref_0, this.ref_2_1], ctx);
                }

                if (triple) {
                    ctx.create(new Fragment<Node, Element, TagOptions>(this.runner, ctx.sDeep + 1), ctx => {
                        this.frag_2_1_1 = ctx;
                        this.ref_2_1_1 = new Reference(211, ctx);
                        this.expr_2_1_1 = new Expression((n, m) => n + m, [this.ref_0, this.ref_2_1_1], ctx);
                    });
                }
            });
        });
    }
}

function handlersCount(ref: Reference<unknown> | Expression<unknown, unknown[]>) {
    if (ref instanceof Expression) {
        // @ts-expect-error
        return handlersCount(ref.sync);
    }

    // @ts-expect-error
    if (ref.onChange) {
        // @ts-expect-error
        return ref.onChange.size;
    }
    // @ts-expect-error
    if (ref.handler2) {
        return 2;
    }
    // @ts-expect-error
    if (ref.handler1) {
        return 1;
    }
    return 0;
}

it("destroy root", function () {
    const window = page();
    const app = new MyApp(window.document.body, new Runner(window.document));

    app.compose();
    expect(handlersCount(app.ref_0)).toBe(2);
    expect(handlersCount(app.ref_1)).toBe(2);
    expect(handlersCount(app.ref_2)).toBe(1);
    // deep is equal to self deep (sDeep)
    expect(app.ref_1.rDeep).toBe(app.frag_1.sDeep);
    expect(app.ref_1_1.rDeep).toBe(app.frag_1_1.sDeep);
    // expression deep is equal to the parent fragment deep
    expect(app.expr_1_1.rDeep).toBe(app.frag_1.sDeep);
    // fragments and expressions deep are equal to the root app deep
    expect(app.frag_2.rDeep).toBe(app.sDeep);
    expect(app.frag_2_1.rDeep).toBe(app.sDeep);
    expect(app.expr_2.rDeep).toBe(app.sDeep);
    expect(app.expr_2_1.rDeep).toBe(app.sDeep);
    // destroy root
    app.destroy(0);
    // all bindings are kept
    expect(handlersCount(app.ref_0)).toBe(2);
    expect(handlersCount(app.ref_1)).toBe(2);
    expect(handlersCount(app.ref_2)).toBe(1);
});

it("destroy root children", function () {
    const window = page();
    const app = new MyApp(window.document.body, new Runner(window.document));

    app.compose();
    // destroy root children
    app.children.forEach(child => child.destroy(1));
    // all bindings (except owned bindings and children bindings) are removed
    expect(handlersCount(app.ref_0)).toBe(0);
    expect(handlersCount(app.ref_1)).toBe(2);
    expect(handlersCount(app.ref_1_1)).toBe(1);
    expect(handlersCount(app.ref_2)).toBe(0);
    expect(handlersCount(app.ref_2_1)).toBe(0);
});

it("destroy root children with infinity", function () {
    const window = page();
    const app = new MyApp(window.document.body, new Runner(window.document));

    app.compose();
    // destroy with infinity
    app.destroy(Infinity);
    // all bindings (except owned bindings) are removed
    expect(handlersCount(app.ref_0)).toBe(0);
    expect(handlersCount(app.ref_1)).toBe(1);
    expect(handlersCount(app.ref_1_1)).toBe(0);
    expect(handlersCount(app.ref_2)).toBe(0);
    expect(handlersCount(app.ref_2_1)).toBe(0);
});

it("recursive rDeep index update", function () {
    const window = page();
    const app = new MyApp(window.document.body, new Runner(window.document));

    app.compose(true);
    // check handlers count
    expect(handlersCount(app.ref_0)).toBe(1);
    // check deep
    expect(app.frag_2.rDeep).toBe(app.sDeep);
    expect(app.frag_2_1.rDeep).toBe(app.sDeep);
    expect(app.frag_2_1_1.rDeep).toBe(app.sDeep);
    // destroy frag 2
    app.frag_2.destroy(app.frag_2.sDeep);
    // all bindings (except owned bindings) are removed
    expect(handlersCount(app.ref_0)).toBe(0);
    expect(handlersCount(app.ref_2_1_1)).toBe(0);
});

it("has runOnDestroy handler", function () {
    const window = page();
    const app = new MyApp(window.document.body, new Runner(window.document));
    let test = false;

    app.compose(false, () => (test = true));
    // runOnDestroy handler set rDeep to 0
    expect(app.frag_1.rDeep).toBe(0);
    expect(app.frag_1_1.rDeep).toBe(0);
    // destroy frag1
    app.frag_1.destroy(app.frag_1.sDeep);
    // check if your handler was executed
    expect(test).toBe(true);
});

it("destroys array view", () => {
    const window = page();
    const runner = new Runner(window.document);
    const root = new App<Node, Element, TagOptions>(window.document.body, runner);
    const array = new ArrayModel<number>([1, 2, 3]);
    const ref = new Reference(0);

    root.tag("div", {}, function (tag) {
        tag.create(
            new ArrayView<number, Node, Element, TagOptions, typeof runner>(
                runner,
                tag.sDeep + 1,
                array,
                function (f, item) {
                    f.text(new Expression(a => a + item, [ref], f));
                },
                v => new Reference(v),
                r => new Fragment(r, tag.sDeep + 1),
            ),
        );
    });

    expect(handlersCount(ref)).toBe(3);
    root.destroy(Infinity);
    expect(handlersCount(ref)).toBe(0);
});

it("destroys switched node", () => {
    const window = page();
    const runner = new Runner(window.document);
    const root = new App<Node, Element, TagOptions>(window.document.body, runner);
    const ref = new Reference(0);

    root.tag("div", {}, function (tag) {
        tag.create(
            new SwitchedNode<Node, Element, TagOptions, typeof runner>(runner, tag.sDeep + 1, [
                {
                    $case: new Expression(n => n === 1, [ref], tag),
                    slot(node) {
                        node.text("2");
                    },
                },
            ]),
        );
    });

    expect(handlersCount(ref)).toBe(1);
    root.destroy(Infinity);
    expect(handlersCount(ref)).toBe(0);
});

it("destroys watch node", () => {
    const window = page();
    const runner = new Runner(window.document);
    const root = new App<Node, Element, TagOptions>(window.document.body, runner);
    const ref = new Reference(0);

    root.tag("div", {}, function (tag) {
        tag.create(
            new Watch<Node, Element, TagOptions, number, typeof runner>(
                {
                    model: ref,
                    slot(node, input) {
                        node.text(input);
                    },
                },
                runner,
                tag.sDeep + 1,
            ),
        );
    });

    expect(handlersCount(ref)).toBe(1);
    root.destroy(Infinity);
    expect(handlersCount(ref)).toBe(0);
});

it("destroys binding", () => {
    const window = page();
    const runner = new Runner(window.document);
    const root = new App<Node, Element, TagOptions>(window.document.body, runner);
    const ref = new Reference(0);

    root.tag("div", { a: { "data-value": ref } });

    expect(handlersCount(ref)).toBe(1);
    root.destroy(Infinity);
    expect(handlersCount(ref)).toBe(0);
});

it("keep binding", () => {
    const window = page();
    const runner = new Runner(window.document);
    const root = new App<Node, Element, TagOptions>(window.document.body, runner);
    const ref = new Reference(0);

    root.tag("div", { a: { "data-value": ref } });

    expect(handlersCount(ref)).toBe(1);
    root.destroy(0);
    expect(handlersCount(ref)).toBe(1);
});

it("add/remove reference handlers", function () {
    const ref = new Reference(0);
    const h1 = (n: number) => n + 1;
    const h2 = (n: number) => n + 1;
    const h3 = (n: number) => n + 1;
    const h4 = (n: number) => n + 1;

    ref.on(h1);
    expect(handlersCount(ref)).toBe(1);
    ref.on(h2);
    expect(handlersCount(ref)).toBe(2);
    ref.off(h2);
    expect(handlersCount(ref)).toBe(1);
    ref.off(h1);
    expect(handlersCount(ref)).toBe(0);
    ref.on(h1);
    ref.on(h2);
    expect(handlersCount(ref)).toBe(2);
    ref.off(h3);
    expect(handlersCount(ref)).toBe(2);
    ref.off(h1);
    expect(handlersCount(ref)).toBe(1);
    ref.on(h1);
    ref.on(h3);
    ref.on(h4);
    expect(handlersCount(ref)).toBe(4);
    ref.off(h2);
    ref.off(h3);
    expect(handlersCount(ref)).toBe(2);
});
