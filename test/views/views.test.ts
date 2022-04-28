import {
    App,
    ArrayModel,
    ArrayView, Fragment, libV,
    MapModel,
    MapView,
    ObjectModel,
    ObjectView,
    Reference,
    SetModel,
    SetView
} from "../../src";
import {page} from "../page";



it('array view', function () {
    const root = new App(page.window.document.body, {});
    const array = new ArrayModel<number>([1]);

    const element = root.tag('div', {}, (node) => {
        node.create(new ArrayView({ model: array }), (node, item) => {
            node.text(`${item}`);
        });
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

    array.append(4);
    expect(element.innerHTML).toBe("3214");

    array.removeLast();
    expect(element.innerHTML).toBe("321");

    array.prepend(4);
    expect(element.innerHTML).toBe("4321");

    array.removeFirst();
    expect(element.innerHTML).toBe("321");

    array.removeAt(1);
    expect(element.innerHTML).toBe("31");

    array.insert(1, 2);
    expect(element.innerHTML).toBe("321");

    array.removeOne(1);
    expect(element.innerHTML).toBe("32");

    array.clear();
    expect(element.innerHTML).toBe("");

    array.push(1, 2, 3, 7);
    expect(element.innerHTML).toBe("1237");

    array.splice(1, 1, 4, 5, 6);
    expect(element.innerHTML).toBe("145637");

    array.disableReactivity();
    array.clear();
    expect(element.innerHTML).toBe("145637");

    array.enableReactivity();
    expect(element.innerHTML).toBe("");

    array.push(34);

    root.destroy();
});

it('map view', function () {
    const root = new App(page.window.document.body, {});
    const model = new MapModel<number, number>([[1, 2], [2, 3], [3, 4]]);

    const element = root.tag('div', {}, (node) => {
        node.create(new MapView({model}), (node, item) => {
            node.text(`${item}`);
        });
    });

    expect(element.innerHTML).toBe("234");

    model.delete(3);
    expect(element.innerHTML).toBe("23");

    model.set(1, 4);
    expect(element.innerHTML).toBe("34");

    model.set(3, 5);
    expect(element.innerHTML).toBe("345");

    model.disableReactivity();
    model.clear();
    expect(element.innerHTML).toBe("345");

    model.enableReactivity();
    expect(element.innerHTML).toBe("");

    root.destroy();
});

it('object view', function () {
    const root = new App(page.window.document.body, {});
    const model = new ObjectModel({0: 1, 1: 2, 2: 3});
    const proxy = model.proxy();

    const element = root.tag('div', {}, (node) => {
        node.create(new ObjectView({model}), (node, item) => {
            node.text(`${item}`);
        });
    });

    expect(element.innerHTML).toBe("123");

    delete proxy['2'];
    expect(element.innerHTML).toBe("12");

    proxy[0] = 4;
    expect(element.innerHTML).toBe('24');

    model.disableReactivity();
    proxy[3] = 3;
    expect(element.innerHTML).toBe('24');

    model.enableReactivity();
    expect(element.innerHTML).toBe('243');

    Reflect.ownKeys(proxy).forEach((item, index) => {
        void proxy[index];
    });

    root.destroy();
});

it('set view', function () {
    const root = new App(page.window.document.body, {});
    const model = new SetModel([1, 2, 3]);

    const element = root.tag('div', {}, (node) => {
        node.create(new SetView({model}), (node, item) => {
            node.text(`${item}`);
        });
    });

    expect(element.innerHTML).toBe("123");

    model.delete(2);
    expect(element.innerHTML).toBe("13");

    model.disableReactivity();
    model.add(2);
    expect(element.innerHTML).toBe("13");

    model.enableReactivity();
    expect(element.innerHTML).toBe("132");

    model.clear();
    expect(element.innerHTML).toBe("");

    root.destroy();
});

class ReactivityTest extends Fragment {
    set : SetModel<number>;

    constructor() {
        super({});

        this.set = this.register(new SetModel([1, 2, 3]));
    }

    compose(input) {
        super.compose(input);

        this.create(new SetView({model : this.set}), (node, item) => {
            node.text(`${item}`);
        });
    }
}

it('views reactivity', function () {
    const root = new App(page.window.document.body, {});
    const test = new ReactivityTest();

    const element = root.tag('div', {}, (node) => {
        node.create(test);
    });

    expect(element.innerHTML).toBe("123");

    test.disable();
    test.set.add(4);
    expect(element.innerHTML).toBe("123");

    test.enable();
    expect(element.innerHTML).toBe("1234");

    root.destroy();
});

it('view timeout test', function (done) {
    const root = new App(page.window.document.body, {});
    const model = new SetModel([1, 2, 3]);

    // @ts-ignore
    global.window = page.window;

    const element = root.tag('div', {}, (node) => {
        node.create(new SetView({model}), (node, item) => {
            setTimeout(() => {
                node.text(`${item}`);
            }, 0);
        });
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
