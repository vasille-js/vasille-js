import { AcceptedTagsMap, IValue, Reference, TagOptions, Fragment } from "vasille";
import { Expression } from "./expression";
import { asFragment, readValue, setValue } from "./inline";
import { propertyExtractor, reactiveObject, readProperty, writeValue } from "./objects";
import { ContextArray, ContextMap, ContextSet } from "./models";

export const internal = {
    /**
     * translate compose local `let a = v` to `const a = $.let(this, v)`
     */
    let(node: unknown, v: unknown): unknown {
        if (!(node instanceof Fragment)) {
            return readValue(v);
        }

        if (v instanceof IValue) {
            return v;
        }

        return node.ref(v);
    },
    /**
     * translate module `var a = v` to `const a = $.var(v)`
     */
    var(v: unknown): unknown {
        if (v instanceof IValue) {
            return new Reference(v.$);
        }

        return new Reference(v);
    },
    /**
     * translate compose local `let c = a + b` to `const c = $.expr(this, (a, b) => a+b, [a, b])`
     */
    expr(node: unknown, func: (...args: unknown[]) => unknown, values: unknown[]): unknown {
        if (!(node instanceof Fragment)) {
            return func.apply(
                null,
                values.map(v => readValue(v)),
            );
        }

        if (values.some(item => item instanceof IValue)) {
            const expr = new Expression(func, values);

            node.register(expr);

            return expr;
        } else {
            return func.apply(null, values);
        }
    },
    /**
     * translate object property read from `x.b.c` to `$.rp(x, ['b', 'c'])`
     */
    rp: readProperty,
    /**
     * translate object property write from `x.b.c = v` to `$.wp(x, ['b', 'c'], v)`
     */
    wp: writeValue,
    /**
     * translate compose local `let c = x.n.m + b` to `const c = $.expr(_, [$.pe(x, ['n', 'm']), b])`
     */
    pe: propertyExtractor,
    /**
     * translate constant initialization `const c = a + b` to `const c = $.rv(a) + $.rv(b)`
     */
    rv: readValue,
    /**
     * translate assigment from 'a = b' to `$.sv(a, b)`
     */
    sv: setValue,
    /**
     * translate `{...}` to `$.ro(this, {...})`
     */
    ro: reactiveObject,
    /**
     * translate jsx `<div />` to `this.tag("div", {}, slot)`
     */
    // function removed
    /**
     * translate jsx text to `this.txt(...)`
     */
    // function removed
    /**
     * translate `new Set(#)` to `$.sm(this, #)`
     */
    sm(node: unknown, data?: unknown[]) {
        const set = new ContextSet(data);

        if (node instanceof Fragment) {
            node.register(set);
        }

        return set;
    },
    /**
     * translate `new Map(#)` to `$.mm(this, #)`
     */
    mm(node: unknown, data?: [unknown, unknown][]) {
        const map = new ContextMap(data);

        if (node instanceof Fragment) {
            node.register(map);
        }

        return map;
    },
    /**
     * translate `[...]` to `$.am(this, [...])`
     */
    am(node: unknown, data?: unknown[]) {
        const arr = new ContextArray(data);

        if (node instanceof Fragment) {
            node.register(arr);
        }

        return arr;
    },
};
