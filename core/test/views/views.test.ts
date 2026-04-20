import {
    App,
    ArrayModel,
    ArrayView,
    Expression,
    Fragment,
    MapModel,
    MapView,
    Reference,
    SetModel,
    SetView,
    SinglePassArrayView,
} from "../../src/index.js";
import { Runner, TagOptions } from "../../src/runner/web/runner.js";
import { page } from "../page.js";

it("array view", function () {
    const window = page();
    const runner = new Runner(window.document);
    const root = new App<Node, Element, TagOptions>(window.document.body, runner);
    const array = new ArrayModel<number>([1]);
    let element!: Element;
    let view!: ArrayView<any, any, any, any, any>;

    root.tag("div", { k: node => (element = node) }, function (tag) {
        tag.create(
            (view = new ArrayView<number, Node, Element, TagOptions, typeof runner>(
                runner,
                tag.sDeep + 1,
                array,
                function (f, item) {
                    f.text(`${item}`);
                },
                v => new Reference(v),
                r => new Fragment(r, tag.sDeep + 1),
            )),
        );
    });

    expect(element.innerHTML).toBe("1");

    array.fill(0);
    expect(element.innerHTML).toBe("0");

    array.push(1);
    expect(element.innerHTML).toBe("01");

    array.unshift(2);
    expect(element.innerHTML).toBe("201");

    array.pop();
    expect(element.innerHTML).toBe("20");

    array.shift();
    expect(element.innerHTML).toBe("0");

    array.splice(0, 1, 3, 2, 1);
    expect(element.innerHTML).toBe("321");

    array.push(4);
    expect(element.innerHTML).toBe("3214");

    array.splice(array.length - 1, 1);
    expect(element.innerHTML).toBe("321");

    array.unshift(4);
    expect(element.innerHTML).toBe("4321");

    array.splice(0, 1);
    expect(element.innerHTML).toBe("321");

    array.splice(1, 1);
    expect(element.innerHTML).toBe("31");

    array.splice(1, 0, 2);
    expect(element.innerHTML).toBe("321");

    array.splice(array.indexOf(1), 1);
    expect(element.innerHTML).toBe("32");

    array.splice(0);
    expect(element.innerHTML).toBe("");

    array.push(1, 2, 3, 7);
    expect(element.innerHTML).toBe("1237");

    array.splice(1, 1, 4, 5, 6);
    expect(element.innerHTML).toBe("145637");

    view.destroy(view.sDeep);
    expect(element.innerHTML).toBe("");

    root.destroy(0);
    expect(window.document.body.children.length).toBe(0);
});

it("single pass array view", function () {
    const window = page();
    const runner = new Runner(window.document);
    const root = new App<Node, Element, TagOptions>(window.document.body, runner);
    const array = new Reference<{ id: number; value: number }[]>([{ id: 0, value: 1 }]);
    let element!: Element;
    let view!: Fragment<any, any, any>;

    root.tag("div", { k: node => (element = node) }, function (tag) {
        tag.create(
            (view = new SinglePassArrayView<{ id: number; value: number }, Node, Element, TagOptions, typeof runner>(
                runner,
                tag.sDeep + 1,
                array,
                item => item.id,
                function (f, item, index) {
                    f.text(new Expression((item, index) => `(${index}:${item.value})`, [item, index]));
                },
                v => new Reference(v),
                v => new Reference(v),
                r => new Fragment(r, tag.sDeep + 1),
            )),
        );
    });

    const firstChild = element.firstChild;

    expect(element.innerHTML).toBe("(0:1)");

    array.V = [{ id: 0, value: 2 }];
    expect(element.innerHTML).toBe("(0:2)");
    expect(firstChild).toBe(element.firstChild);

    array.V = [
        { id: 0, value: 2 },
        { id: 2, value: 3 },
    ];
    expect(element.innerHTML).toBe("(0:2)(1:3)");
    expect(firstChild).toBe(element.firstChild);

    array.V = [
        { id: 2, value: 3 },
        { id: 0, value: 2 },
    ];
    expect(element.innerHTML).toBe("(0:3)(1:2)");
    expect(firstChild).toBe(element.childNodes[1]);

    array.V = [
        { id: 6, value: 3 },
        { id: 5, value: 2 },
        { id: 4, value: 5 },
        { id: 3, value: 4 },
        { id: 2, value: 3 },
        { id: 0, value: 2 },
    ];
    expect(element.innerHTML).toBe("(0:3)(1:2)(2:5)(3:4)(4:3)(5:2)");
    expect(firstChild).toBe(element.childNodes[5]);

    array.V = [
        { id: 0, value: 2 },
        { id: 6, value: 3 },
        { id: 5, value: 2 },
        { id: 4, value: 5 },
        { id: 3, value: 4 },
        { id: 2, value: 3 },
    ];
    expect(element.innerHTML).toBe("(0:2)(1:3)(2:2)(3:5)(4:4)(5:3)");
    expect(firstChild).toBe(element.childNodes[0]);

    array.V = [
        { id: 0, value: 2 },
        { id: 2, value: 3 },
    ];
    expect(element.innerHTML).toBe("(0:2)(1:3)");
    expect(firstChild).toBe(element.childNodes[0]);

    array.V = [];
    expect(element.innerHTML).toBe("");

    array.V = [
        { id: 0, value: 2 },
        { id: 2, value: 3 },
    ];
    expect(element.innerHTML).toBe("(0:2)(1:3)");

    view.destroy(view.sDeep);
    expect(element.innerHTML).toBe("");

    root.destroy(0);
    expect(window.document.body.children.length).toBe(0);
});

it("multiple text remount", function () {
    const window = page();
    const runner = new Runner(window.document);
    const root = new App<Node, Element, TagOptions>(window.document.body, runner);
    const array = new Reference<{ id: number; value: number }[]>([
        { id: 0, value: 1 },
        { id: 10, value: 11 },
    ]);
    let element!: Element;

    root.tag("div", { k: node => (element = node) }, function (tag) {
        tag.create(
            new SinglePassArrayView<{ id: number; value: number }, Node, Element, TagOptions, typeof runner>(
                runner,
                tag.sDeep + 1,
                array,
                item => item.id,
                function (f, item, index) {
                    f.text(index);
                    f.text(":");
                    f.text(new Expression(item => item.id, [item]));
                    f.text("=");
                    f.text(new Expression(item => item.value, [item]));
                    f.text("|");
                },
                v => new Reference(v),
                v => new Reference(v),
                r => new Fragment(r, tag.sDeep + 1),
            ),
        );
    });

    expect(element.innerHTML).toBe("0:0=1|1:10=11|");

    array.V = [array.V[1]!, array.V[0]!];
    expect(element.innerHTML).toBe("0:10=11|1:0=1|");

    root.destroy(0);
});

it("multiple tag remount", function () {
    const window = page();
    const runner = new Runner(window.document);
    const root = new App<Node, Element, TagOptions>(window.document.body, runner);
    const array = new Reference<{ id: number; value: number }[]>([
        { id: 0, value: 1 },
        { id: 10, value: 11 },
    ]);
    let element!: Element;

    root.tag("div", { k: node => (element = node) }, function (tag) {
        tag.create(
            new SinglePassArrayView<{ id: number; value: number }, Node, Element, TagOptions, typeof runner>(
                runner,
                tag.sDeep + 1,
                array,
                item => item.id,
                function (f, item, index) {
                    f.tag("div", {}, ctx => {
                        ctx.text(new Expression(item => item.id, [item]));
                    });
                    f.tag("div", {}, ctx => {
                        ctx.text(new Expression(item => item.value, [item]));
                    });
                },
                v => new Reference(v),
                v => new Reference(v),
                r => new Fragment(r, tag.sDeep + 1),
            ),
        );
    });

    expect(element.innerHTML).toBe("<div>0</div><div>1</div><div>10</div><div>11</div>");

    array.V = [array.V[1]!, array.V[0]!];
    expect(element.innerHTML).toBe("<div>10</div><div>11</div><div>0</div><div>1</div>");

    root.destroy(0);
});

it("array view remount", function () {
    const window = page();
    const runner = new Runner(window.document);
    const root = new App<Node, Element, TagOptions>(window.document.body, runner);
    const array = new Reference<{ id: number; value: number }[]>([
        { id: 0, value: 1 },
        { id: 10, value: 11 },
    ]);
    let element!: Element;

    root.tag("div", { k: node => (element = node) }, function (tag) {
        tag.create(
            new SinglePassArrayView<{ id: number; value: number }, Node, Element, TagOptions, typeof runner>(
                runner,
                tag.sDeep + 1,
                array,
                item => item.id,
                function (f, item, index) {
                    f.create(
                        new SinglePassArrayView<
                            { id: number; value: number },
                            Node,
                            Element,
                            TagOptions,
                            typeof runner
                        >(
                            runner,
                            f.sDeep + 1,
                            new Reference([item.V]),
                            i => i.id,
                            function (f, item, index) {
                                f.tag("div", {}, ctx => {
                                    ctx.text(new Expression(item => item.id, [item]));
                                });
                                f.tag("div", {}, ctx => {
                                    ctx.text(new Expression(item => item.value, [item]));
                                });
                            },
                            v => new Reference(v),
                            v => new Reference(v),
                            r => new Fragment(r, f.sDeep + 1),
                        ),
                    );
                },
                v => new Reference(v),
                v => new Reference(v),
                r => new Fragment(r, tag.sDeep + 1),
            ),
        );
    });

    expect(element.innerHTML).toBe("<div>0</div><div>1</div><div>10</div><div>11</div>");

    array.V = [array.V[1]!, array.V[0]!];
    expect(element.innerHTML).toBe("<div>10</div><div>11</div><div>0</div><div>1</div>");

    root.destroy(0);
});

it("map view", function () {
    const window = page();
    const runner = new Runner(window.document);
    const root = new App<Node, Element, TagOptions>(window.document.body, runner);
    const model = new MapModel<number, number>([
        [1, 2],
        [2, 3],
        [3, 4],
    ]);
    let element!: HTMLElement;
    let view!: Fragment<any, any, any>;

    root.tag("div", { k: node => (element = node as HTMLElement) }, function (tag) {
        tag.create(
            (view = new MapView<number, number, Node, Element, TagOptions, typeof runner>(
                runner,
                tag.sDeep + 1,
                model,
                function (f, item) {
                    f.text(item);
                },
                v => new Reference(v),
                r => new Fragment(r, tag.sDeep + 1),
            )),
        );
    });

    expect(element.innerHTML).toBe("234");

    model.delete(3);
    expect(element.innerHTML).toBe("23");

    model.set(1, 4);
    expect(element.innerHTML).toBe("43");

    model.set(3, 5);
    expect(element.innerHTML).toBe("435");

    model.clear();
    expect(element.innerHTML).toBe("");

    model.set(1, 1);
    view.destroy(view.sDeep);
    expect(element.innerHTML).toBe("");

    root.destroy(0);
    expect(window.document.body.children.length).toBe(0);
});

it("map view remount", function () {
    const window = page();
    const runner = new Runner(window.document);
    const root = new App<Node, Element, TagOptions>(window.document.body, runner);
    const array = new Reference<{ id: number; value: number }[]>([
        { id: 0, value: 1 },
        { id: 10, value: 11 },
    ]);
    let element!: Element;

    root.tag("div", { k: node => (element = node) }, function (tag) {
        tag.create(
            new SinglePassArrayView<{ id: number; value: number }, Node, Element, TagOptions, typeof runner>(
                runner,
                tag.sDeep + 1,
                array,
                item => item.id,
                function (f, item) {
                    f.create(
                        new MapView<number, number, Node, Element, TagOptions, typeof runner>(
                            runner,
                            f.sDeep + 1,
                            new MapModel([[item.V.id, item.V.value]]),
                            function (f, item, key) {
                                f.tag("div", {}, ctx => {
                                    ctx.text(key);
                                });
                                f.tag("div", {}, ctx => {
                                    ctx.text(item);
                                });
                            },
                            v => new Reference(v),
                            r => new Fragment(r, f.sDeep + 1),
                        ),
                    );
                },
                v => new Reference(v),
                v => new Reference(v),
                r => new Fragment(r, tag.sDeep + 1),
            ),
        );
    });

    expect(element.innerHTML).toBe("<div>0</div><div>1</div><div>10</div><div>11</div>");

    array.V = [array.V[1]!, array.V[0]!];
    expect(element.innerHTML).toBe("<div>10</div><div>11</div><div>0</div><div>1</div>");

    root.destroy(0);
});

it("set view", function () {
    const window = page();
    const runner = new Runner(window.document);
    const root = new App<Node, Element, TagOptions>(window.document.body, runner);
    const model = new SetModel([1, 2, 3]);
    let element!: HTMLElement;
    let view!: Fragment<any, any, any>;

    root.tag("div", { k: node => (element = node as HTMLElement) }, function (f) {
        f.create(
            (view = new SetView<number, Node, Element, TagOptions, typeof runner>(
                runner,
                f.sDeep + 1,
                model,
                function (f, item) {
                    f.text(`${item}`);
                },
                r => new Fragment(r, f.sDeep + 1),
            )),
        );
    });

    expect(element.innerHTML).toBe("123");

    model.delete(2);
    expect(element.innerHTML).toBe("13");

    model.add(1);
    expect(element.innerHTML).toBe("31");

    model.clear();
    expect(element.innerHTML).toBe("");

    model.add(1);
    view.destroy(view.sDeep);
    expect(element.innerHTML).toBe("");

    root.destroy(0);

    expect(window.document.body.children.length).toBe(0);
});

it("view timeout test", function (done) {
    const window = page();
    const runner = new Runner(window.document);
    const root = new App<Node, Element, TagOptions>(window.document.body, runner);
    const model = new SetModel([1, 2, 3]);
    let element!: HTMLElement;

    root.tag("div", { k: node => (element = node as HTMLElement) }, function (f) {
        f.create(
            new SetView<number, Node, Element, TagOptions, typeof runner>(
                runner,
                f.sDeep + 1,
                model,
                function (f, item) {
                    setTimeout(() => {
                        f.text(`${item}`);
                    }, 0);
                },
                r => new Fragment(r, f.sDeep + 1),
            ),
        );
    });

    expect(element.innerHTML).toBe("");

    setTimeout(() => {
        expect(element.innerHTML).toBe("123");

        model.add(4);
        expect(element.innerHTML).toBe("123");

        setTimeout(() => {
            expect(element.innerHTML).toBe("1234");
            root.destroy(0);
            done();
        }, 0);
    }, 0);
});

it("set view remount", function () {
    const window = page();
    const runner = new Runner(window.document);
    const root = new App<Node, Element, TagOptions>(window.document.body, runner);
    const array = new Reference<{ id: number; value: number }[]>([
        { id: 0, value: 1 },
        { id: 10, value: 11 },
    ]);
    let element!: Element;

    root.tag("div", { k: node => (element = node) }, function (tag) {
        tag.create(
            new SinglePassArrayView<{ id: number; value: number }, Node, Element, TagOptions, typeof runner>(
                runner,
                tag.sDeep + 1,
                array,
                item => item.id,
                function (f, item) {
                    f.create(
                        new SetView<number, Node, Element, TagOptions, typeof runner>(
                            runner,
                            f.sDeep + 1,
                            new SetModel([item.V.id, item.V.value]),
                            function (f, item) {
                                f.tag("div", {}, ctx => {
                                    ctx.text(item);
                                });
                            },
                            r => new Fragment(r, f.sDeep + 1),
                        ),
                    );
                },
                v => new Reference(v),
                v => new Reference(v),
                r => new Fragment(r, tag.sDeep + 1),
            ),
        );
    });

    expect(element.innerHTML).toBe("<div>0</div><div>1</div><div>10</div><div>11</div>");

    array.V = [array.V[1]!, array.V[0]!];
    expect(element.innerHTML).toBe("<div>10</div><div>11</div><div>0</div><div>1</div>");

    root.destroy(0);
});
