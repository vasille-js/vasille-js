import {ref, expr, v, arrayModel, objectModel, setModel, mapModel, debug, AppOptions, value} from "../../src";
import {TagOptions} from "../../src";
import {page} from "../page";
import {tag} from "../../src/functional/stack";
import { Extension } from "vasille";


let fc = false;
let ac = false;
let cc = false;
let ec = false;
let el !: HTMLDivElement;

export const e = v.extension(() => {
    ec = true;
    v.create(new Extension<TagOptions<'div'>>({
        class: ['2']
    }));
    return {};
})

export const f = v.fragment(opts => {
    fc = true;
    e({}, () => 0);
    return {};
});

export const c = v.component(() => {
    cc = true;
    el = v.tag("div", {}, () => f({}, () => 0)).node;
    return {};
})

export const a = v.app(() => {
    ac = true;
    c({}, () => 0);
    return {};
})

let r0 = false, r1 = false;
export const r = v.reactive<any>(() => {
    r0 = true;
    v.runOnDestroy(() => {
        r1 = true;
    });
    return {};
});

it('Stack check', function () {
    a(page.window.document.body, {});

    expect(ec).toBe(true);
    expect(fc).toBe(true);
    expect(cc).toBe(true);
    expect(ac).toBe(true);

    expect(el.className).toBe('2');
})


it('Logic Test', function () {
    const app = v.app(() => {
        const [reactive, setReactive] = ref(0);
        let result = -1;

        v.if(expr(x => x === 1, reactive), () => {
            result = 1;
        });
        v.elif(expr(x => x === 2, reactive), () => {
            result = 2;
        });
        v.else(() => {
            result = 0;
        });

        expect(result).toBe(0);
        setReactive(1);
        expect(result).toBe(1);
        setReactive(2);
        expect(result).toBe(2);

        return {};
    });

    app(page.window.document.body, {});
})

it('Loop test', function () {

    const app = v.app(() => {
        const a = arrayModel([1, 2, 3]);
        const o = objectModel({0:1, 1:2, 2:3});
        const s = setModel([1, 2, 3]);
        const m = mapModel([[0,1], [1,2], [2,3]]);

        const at = tag('div', {}, () => {
            v.for(a, i => v.text(`${i}`));
        });
        const ot = tag('div', {}, () => {
            v.for(o, (i,k) => v.text(`${k}${i}`));
        });
        const st = tag('div', {}, () => {
            v.for(s, i => v.text(`${i}`));
        });
        const mt = tag('div', {}, () => {
            v.for(m, (i,k) => v.text(`${k}${i}`));
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

    app(page.window.document.body, {});
})

interface Opts extends AppOptions<'body'> {
    return?: {
        destructor: () => void
    }
}

it('Additional stuff', function (done) {
    let gtest = false;

    const app = v.app<Opts>(() => {
        const model = v.ref(false);
        let test = true;

        v.watch(model, (input) => {
            test = input;
        })

        expect(test).toBe(false);
        model.$ = true;
        expect(test).toBe(true);

        // eslint-disable-next-line
        // @ts-ignore
        global.window = page.window;

        const {node} = v.tag("div", {}, () => {
            v.async(() => {
                debug(v.ref("div"));
            });
        });

        setTimeout(() => {
            expect(node.childNodes.length).toBe(1);
        });

        v.runOnDestroy(() => gtest = true);

        return {
            destructor: v.destructor()
        }
    });

    const {destructor} = app(page.window.document.body, {debugUi: true});

    setTimeout(() => {
        destructor();
        expect(gtest).toBe(true);
        done();
    });
})

it('Reactive stuff', function () {
    const {destructor} = r({});
    expect(r0).toBe(true);
    expect(r1).toBe(false);
    destructor();
    expect(r1).toBe(true);
})

it('Portal', function () {
    const app = v.app(() => {
        const {node} = v.tag('div', {});
        const test = value(false);

        v.portal(node, () => {
            v.if(test, () => {
                v.tag('span', {});
            });
        });

        expect(node.childElementCount).toBe(0);
        test.$ = true;
        expect(node.childElementCount).toBe(1);
        return {};
    });

    app(page.window.document.body, {});
})
