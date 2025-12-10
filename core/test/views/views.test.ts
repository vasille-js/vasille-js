import { App, ArrayModel, ArrayView, MapModel, MapView, SetModel, SetView } from "../../src/index.js";
import { Runner, TagOptions } from "../../src/runner/web/runner.js";
import { page } from "../page.js";

it("array view", function () {
    const window = page();
    const runner = new Runner(window.document);
    const root = new App<Node, Element, TagOptions>(window.document.body, runner);
    const array = new ArrayModel<number>([1]);
    let element!: Element;

    root.bind(array);
    root.tag("div", { k: node => (element = node) }, function (tag) {
        tag.create(
            new ArrayView<Node, Element, TagOptions, number>(
                {
                    model: array,
                    slot: function (f, item) {
                        f.text(`${item}`);
                    },
                },
                runner,
            ),
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

    root.destroy();
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

    root.bind(model);
    root.tag("div", { k: node => (element = node as HTMLElement) }, function (tag) {
        tag.create(
            new MapView<Node, Element, TagOptions, number, number>(
                {
                    model,
                    slot: function (f, item) {
                        f.text(`${item}`);
                    },
                },
                runner,
            ),
        );
    });

    expect(element.innerHTML).toBe("234");

    model.delete(3);
    expect(element.innerHTML).toBe("23");

    model.set(1, 4);
    expect(element.innerHTML).toBe("34");

    model.set(3, 5);
    expect(element.innerHTML).toBe("345");

    root.destroy();
});

it("set view", function () {
    const window = page();
    const runner = new Runner(window.document);
    const root = new App<Node, Element, TagOptions>(window.document.body, runner);
    const model = new SetModel([1, 2, 3]);
    let element!: HTMLElement;

    root.bind(model);
    root.tag("div", { k: node => (element = node as HTMLElement) }, function (f) {
        f.create(
            new SetView<Node, Element, TagOptions, number>(
                {
                    model,
                    slot: function (f, item) {
                        f.text(`${item}`);
                    },
                },
                runner,
            ),
        );
    });

    expect(element.innerHTML).toBe("123");

    model.delete(2);
    expect(element.innerHTML).toBe("13");

    model.clear();
    expect(element.innerHTML).toBe("");

    root.destroy();
});

it("view timeout test", function (done) {
    const window = page();
    const runner = new Runner(window.document);
    const root = new App<Node, Element, TagOptions>(window.document.body, runner);
    const model = new SetModel([1, 2, 3]);
    let element!: HTMLElement;

    root.bind(model);
    root.tag("div", { k: node => (element = node as HTMLElement) }, function (f) {
        f.create(
            new SetView<Node, Element, TagOptions, number>(
                {
                    model,
                    slot: function (f, item) {
                        setTimeout(() => {
                            f.text(`${item}`);
                        }, 0);
                    },
                },
                runner,
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
            root.destroy();
            done();
        }, 0);
    }, 0);
});
