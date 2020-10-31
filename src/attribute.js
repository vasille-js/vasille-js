// @flow
import type {Callable} from "./interfaces/idefinition";
import type {IValue} from "./interfaces/ivalue";
import {Bind1x1, Binding} from "./bind";
import {Value} from "./value";
import {datify} from "./data";
import {BaseNode} from "./node";


/**
 * Creates a attribute 1 to 1 bind
 * @param rt is the root component
 * @param ts is the this component
 * @param name is attribute name
 * @param value is attribute value
 * @param func is attribute value calculation function
 * @returns {Bind1x1} attribute 1 to 1 bind
 */
export function attributify(
    rt: BaseNode, ts: BaseNode,
    name: string,
    value: ?any = null,
    func: ?Callable = null): Bind1x1 {

    let v = datify(rt, ts, value, func);
    let watch = function (value: IValue) {
        if (value.get()) {
            window.requestAnimationFrame(function () {
                if (ts.el) ts.el.setAttribute(name, value.get());
            });
        } else {
            window.requestAnimationFrame(function () {
                if (ts.el) ts.el.removeAttribute(name);
            });
        }
        return value.get();
    };

    watch(v);
    return new Bind1x1(watch, v);
}

/**
 * Represents a Attribute binding description
 */
export class AttributeBinding extends Binding {
    /**
     * Constructs a attribute binding description
     * @param rt is root component
     * @param ts is this component
     * @param name {string} is the name of attribute
     * @param func {Function} is the function to bound
     * @param values {Array<Value>} is the array of value to bind to
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
     * Updates element attribute by name
     * @returns {*} a function which will update attribute value
     */
    bound(name : string): Function {
        return function (rt: BaseNode, ts: BaseNode, v: IValue) {
            let value: string = v.get();

            if (value) {
                window.requestAnimationFrame(function () {
                    if (ts.el) ts.el.setAttribute(name, value);
                });
            } else {
                window.requestAnimationFrame(function () {
                    if (ts.el) ts.el.removeAttribute(name);
                });
            }

            return v.get();
        };
    }
}
