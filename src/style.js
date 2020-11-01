// @flow
import type {IValue} from "./interfaces/ivalue";

import {BaseNode}       from "./node";
import {Bind1, Binding} from "./bind";
import {Callable}       from "./interfaces/idefinition";
import {datify}         from "./data";



/**
 * Represent a value bound to an style attribute
 */
export function stylify(
    rt    : BaseNode,
    ts    : BaseNode,
    name  : string,
    value : ?string | ?IValue = null,
    func  : ?Callable = null
) : Bind1 {
    let v = datify(rt, ts, value, func);

    let watch = function (value: IValue) {
        window.requestAnimationFrame(function () {
            if (ts.el) ts.el.style.setProperty(name, value.get());
        });
    };

    watch(v);
    return new Bind1(watch, v);
}

/**
 * Describes a style attribute
 */
export class StyleBinding extends Binding {
    /**
     * Constructs a style binding attribute
     * @param rt is root component
     * @param ts is this component
     * @param name is the name of style property
     * @param func is the function to calc style value
     * @param values is the value to be synced
     */
    constructor(
        rt        : BaseNode,
        ts        : BaseNode,
        name      : string,
        func      : Function,
        ...values : Array<IValue>
    ) {
        super(rt, ts, name, func, ...values);
    }

    /**
     * Generates a function to update style property value
     * @returns {*} a function to update style property
     */
    bound (name : string) : Function {
        return function (rt : BaseNode, ts : BaseNode, v : IValue) {
            window.requestAnimationFrame(function () {
                if (ts.el) ts.el.style.setProperty(name, v.get());
            });

            return v.get();
        };
    }
}
