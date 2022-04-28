import {ref, expr, v, arrayModel, objectModel, setModel, mapModel, debug, AppOptions} from "../../src/v";
import {Extension, TagOptions} from "../../src";
import {page} from "../page";
import {tag} from "../../src/functional/stack";
import {current} from "../../src/core/core";


let fc = false;
let ac = false;
let cc = false;
let ec = false;
let el !: HTMLDivElement;

const e = v.extension(() => {
    ec = true;
    v.create(new Extension<TagOptions<'div'>>({
        class: ['2']
    }));
})

const f = v.fragment(opts => {
    fc = true;
    e({}, () => 0);
});

const c = v.component(() => {
    cc = true;
    el = v.tag("div", {}, () => f({}, () => 0)).node;
})

const a = v.app(() => {
    ac = true;
    c({}, () => 0);
})

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

        a[1] = 5;
        expect(at.node.innerHTML).toBe('153');

        expect(() => v.for(2 as any, () => 0)).toThrow('wrong-model');
    });

    app(page.window.document.body, {});
})

it('stack error', function () {
    expect(() => arrayModel()).toThrow('out-of-context');
    expect(() => setModel()).toThrow('out-of-context');
    expect(() => objectModel()).toThrow('out-of-context');
    expect(() => mapModel()).toThrow('out-of-context');
    expect(() => f({})).toThrow('out-of-context');
    expect(() => c({})).toThrow('out-of-context');
    expect(() => e({})).toThrow('out-of-context');
    expect(() => v.tag("div", {})).toThrow('out-of-context');
    expect(() => v.create(new Extension({}), () => 0)).toThrow('out-of-context');
    expect(() => v.text(2 as any)).toThrow('out-of-context');
    expect(() => debug(2 as any)).toThrow('out-of-context');
    expect(() => v.if(2 as any, () => 0)).toThrow('logic-error');
    expect(() => v.elif(2 as any, () => 0)).toThrow('logic-error');
    expect(() => v.else(() => 0)).toThrow('logic-error');
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
            v.nextTick(() => {
                debug(v.ref("div"));
            });
        });

        setTimeout(() => {
            expect(node.childNodes.length).toBe(1);
        });

        v.runOnDestroy(() => gtest = true);
        global.current = current;

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
