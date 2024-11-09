import { App, ArrayModel, ArrayView, config, Fragment, MapModel, MapView, SetModel, SetView } from "../../src";
import { page } from "../page";

it("array view", function () {
    const root = new App(page.window.document.body, {});
    const array = new ArrayModel<number>([1]);
    let element!: Element;

    root.register(array);
    root.tag("div", { callback: node => (element = node) }, function (tag) {
        tag.create(
            new ArrayView({
                model: array,
                slot: function (f, item) {
                    f.text(`${item}`);
                },
            }),
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
    const root = new App(page.window.document.body, {});
    const model = new MapModel<number, number>([
        [1, 2],
        [2, 3],
        [3, 4],
    ]);
    let element!: HTMLElement;

    root.register(model);
    root.tag("div", { callback: node => (element = node as HTMLElement) }, function (tag) {
        tag.create(
            new MapView({
                model,
                slot: function (f, item) {
                    f.text(`${item}`);
                },
            }),
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
    const root = new App(page.window.document.body, {});
    const model = new SetModel([1, 2, 3]);
    let element!: HTMLElement;

    root.register(model);
    root.tag("div", { callback: node => (element = node as HTMLElement) }, function (f) {
        f.create(
            new SetView({
                model,
                slot: function (f, item) {
                    f.text(`${item}`);
                },
            }),
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
    const root = new App(page.window.document.body, {});
    const model = new SetModel([1, 2, 3]);
    let element!: HTMLElement;

    // @ts-ignore
    global.window = page.window;

    root.register(model);
    root.tag("div", { callback: node => (element = node as HTMLElement) }, function (f) {
        f.create(
            new SetView({
                model,
                slot: function (f, item) {
                    setTimeout(() => {
                        f.text(`${item}`);
                    }, 0);
                },
            }),
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

it("view item id test", function () {
    const root = new App(page.window.document.body, {});
    const model = new SetModel<unknown>();
    let id: unknown;
    let run = false;

    root.register(model);
    root.tag("div", {}, function (f) {
        f.create(
            new SetView({
                model,
                slot: function (f, item) {
                    expect(f.name).toBe(id);
                    run = true;
                },
            }),
        );
    });

    id = "field";
    run = false;
    model.add({ id: "field" });
    expect(run).toBe(true);

    id = '{"v":2}';
    run = false;
    model.add({ v: 2 });
    expect(run).toBe(true);

    id = "2";
    run = false;
    model.add(2);
    expect(run).toBe(true);

    id = "[object Object]";
    run = false;
    config.debugUi = false;
    model.add({ v: 2 });
    expect(run).toBe(true);
});
