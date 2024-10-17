import { AcceptedTagsMap, IValue, Reference, TagOptions, current } from "vasille";
import { Expression } from "./expression";
import { getCurrent, readValue, setValue } from "./inline";
import { propertyExtractor, reactiveObject, readProperty, writeValue } from "./objects";
import { ContextArray, ContextMap, ContextSet } from "./models";

export const internal = {
    /**
     * translate compose local `let a = v` to `const a = $.let(v)`
     */
    let(v: unknown): unknown {
        if (!current) {
            return readValue(v);
        }

        if (v instanceof IValue) {
            return v;
        }

        return current.ref(v);
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
     * translate compose local `let c = a + b` to `const c = $.expr((a, b) => a+b, [a, b])`
     */
    expr(func: (...args: unknown[]) => unknown, values: unknown[]): unknown {
        if (!current) {
            return func.apply(
                null,
                values.map(v => readValue(v)),
            );
        }

        if (values.some(item => item instanceof IValue)) {
            const expr = new Expression(func, values);

            current.register(expr);

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
     * translate `{...}` to `$.ro({...})`
     */
    ro: reactiveObject,
    /**
     * translate jsx `<div />` to `$.tag("div", {})`
     */
    tag<K extends keyof AcceptedTagsMap>(tagName: K, options: TagOptions<K>, slot?: () => void) {
        getCurrent().tag(
            tagName,
            options,
            slot
                ? node => {
                      node.runFunctional(slot);
                  }
                : undefined,
        );
    },
    /**
     * translate jsx text to `$.txt(...)`
     */
    txt(text: unknown) {
        getCurrent().text(text);
    },
    /**
     * translate `new Set(#)` to `$.sm(#)`
     */
    sm(data?: unknown[]) {
        const set = new ContextSet(data);

        if (current) {
            current.register(set);
        }

        return set;
    },
    /**
     * translate `new Map(#)` to `$.mm(#)`
     */
    mm(data?: [unknown, unknown][]) {
        const map = new ContextMap(data);

        if (current) {
            current.register(map);
        }

        return map;
    },
    /**
     * translate `[...]` to `$.am([...])`
     */
    am(data?: unknown[]) {
        const arr = new ContextArray(data);

        if (current) {
            current.register(arr);
        }

        return arr;
    },
};

/**
 * Working with context
 *
 * // module.js
 *
 * var v1 = 23;       <- Global Reactive
 * var arr1 = [2, 34] <- Self-contexted object
 *                    <- JSX throw error
 *
 * function a () {
 *   let v1 = 12;       <- cannot be reactive
 *   let arr2 = [2, 45] <- cannot be reactive
 *                      <- JSX throw error
 * }
 *
 * export a = compose(() => {
 *   let v2 = 1;      <- bind to a component
 *   let arr = [1, 2] <- bind to a component
 *
 *   let callback = () => {
 *      // cannot be reactive
 *      // JSX throw error
 *   }
 *
 *   <div>
 *     <For of={arr} slot={() => {
 *          // context available here
 *          // JSX accepted
 *          // local expression are reactive
 *     }}/>
 *   </div>
 * })
 */
