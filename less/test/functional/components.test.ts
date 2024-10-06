import {
    app,
    arrayModel, component,
    extension,
    fragment, mapModel, objectModel,
    ref, setModel,
    tag, text,
    v,
    VApp, VComponent,
    VExtension,
    VFragment,
    VxExtend, VxFor, VxPortal,
    VxSlot,
    VxWatch
} from "../../src";
import {page} from "../page";
import {FragmentOptions, TagOptions} from "vasille";

it ("vx-watch", function () {
    const App : VApp = app(() => {
        const [r] = ref(0);
        let test = -1;

        VxWatch({ model: r, slot: value => {
            test = value;
        }});

        expect(test).toBe(0);

        r.$ = 1;
        expect(test).toBe(1);

        return {};
    })

    App(page.window.document.body, {});
})

it ("vx-extend", function () {
    const Extension : VExtension<TagOptions<"div">> = extension(() => {
        VxExtend({
            model: "div",
            class: ['extension']
        })

        return {};
    })
    const App : VApp = app(() => {
        const div = tag("div", {}, () => Extension({})).node;

        expect(div.className).toBe("extension");

        return {};
    })

    App(page.window.document.body, {});
})

it ("vx-component", function () {
    const Component : VComponent<TagOptions<"div">> = component(() => {
        tag("div", {class: ['test-class']}, () => {
            text('Text text');
        });

        return {};
    })
    const App : VApp = app(() => {
        const div = tag("div", {}, () => Component({})).node;

        expect(div.children[0].className).toBe("test-class");
        expect(div.children[0].innerHTML).toBe("Text text");

        return {};
    })

    App(page.window.document.body, {});
})

interface Options extends FragmentOptions {
    slot?: () => void,
    slot2?: (options : { x: number, y: number }) => void;
}

it ('vx-slot', function () {
    let test1 = 0;
    let test2 = 0;

    const Fragment : VFragment<Options> = fragment(({slot, slot2}) => {
        VxSlot({
            model: slot,
            slot: () => {
                test1 = 1;
            }
        })

        VxSlot({
            model: slot2,
            slot: () => {
                test2 = 3 + 4;
            },
            x: 3,
            y: 4
        })

        return {};
    })

    const App : VApp = app(() => {
        Fragment({});

        expect(test1).toBe(1);
        expect(test2).toBe(7);

        Fragment({
            slot: () => test1 = 2,
            slot2: ({x, y}) => test2 = x * y,
        })

        expect(test1).toBe(2);
        expect(test2).toBe(12);

        Fragment({}, () => {
            test1 = 3;
        })

        expect(test1).toBe(3);
        expect(test2).toBe(7);

        return {};
    })

    App(page.window.document.body, {});
})

it('vx-for', function () {
    const App : VApp = app(() => {
        const a = arrayModel([1, 2, 3]);
        const o = objectModel({0:1, 1:2, 2:3});
        const s = setModel([1, 2, 3]);
        const m = mapModel([[0,1], [1,2], [2,3]]);

        const at = tag('div', {}, () => {
            VxFor({ model: a, slot: i => v.text(`${i}`) });
        });
        const ot = tag('div', {}, () => {
            VxFor({ model: o, slot: (i,k) => v.text(`${k}${i}`) });
        });
        const st = tag('div', {}, () => {
            VxFor({ model: s, slot: i => v.text(`${i}`) });
        });
        const mt = tag('div', {}, () => {
            VxFor({ model: m, slot: (i,k) => v.text(`${k}${i}`) });
        });

        expect(at.node.innerHTML).toBe('123');
        expect(ot.node.innerHTML).toBe('011223');
        expect(st.node.innerHTML).toBe('123');
        expect(mt.node.innerHTML).toBe('011223');

        a.replace(1, 5);
        expect(at.node.innerHTML).toBe('153');

        expect(() => v.for(2 as any, () => 0)).toThrow('wrong-model');

        return {};
    });

    App(page.window.document.body, {});
})

it('vx-portal', function () {
    const App : VApp = app(() => {
        const div = tag("div", {}).node;

        VxPortal({
            node: div,
            slot: () => {
                tag("span", {});
            }
        })

        expect(div.childElementCount).toBe(1);

        return {};
    })

    App(page.window.document.body, {});
})
