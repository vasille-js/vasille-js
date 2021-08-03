// @flow
import { Binding }    from "./bind.js";
import { Callable }   from "./interfaces/idefinition.js";
import { IValue }     from "./interfaces/ivalue.js";
import type { INode } from "./node.js";
import { propertify } from "./property.js";



/**
 * Creates a class target 1 to 1 bind
 * @param rt {INode} is the root component
 * @param ts {INode} is the this component
 * @param name {String} is attribute name
 * @param value {?any} is attribute value
 * @param func {?Callable} is attribute value calculation function
 * @returns {AttributeBinding} 1 to 1 bind of attribute
 */
export function classify (
    rt : INode,
    ts : INode,
    name : string,
    value : ?any     = null,
    func : ?Callable = null
) : ClassBinding {
    return new ClassBinding(rt, ts, name, null, propertify(value, func));
}

/**
 * Represents a HTML class binding description
 * @extends Binding
 */
export class ClassBinding extends Binding {
    current : ? string | boolean = null;

    /**
     * Constructs a HTML class binding description
     * @param rt {INode} is root component
     * @param ts {INode} is this component
     * @param name {String} is the name of attribute
     * @param func {?Function} is the function to bound
     * @param values {Array<IValue>} is the array of values to bind to
     */
    constructor (
        rt : INode,
        ts : INode,
        name : string,
        func : ?Function,
        ...values : Array<IValue<any>>
    ) {
        super(rt, ts, name, func, ...values);

        this.seal();
    }

    /**
     * Generates a function which updates the html class value
     * @param name {String} The name of attribute
     * @returns {Function} a function which will update attribute value
     */
    bound (name : string) : Function {

        function addClass (rt : INode, ts : INode, cl : string) {
            rt.$.app.$run.addClass(ts.$.el, cl);
        }

        function removeClass (rt : INode, ts : INode, cl : string) {
            rt.$.app.$run.removeClass(ts.$.el, cl);
        }

        return (rt : INode, ts : INode, value : string | boolean) => {
            let current : ? string | boolean = this.current;

            if (value !== current) {
                if (typeof current === "string" && current !== "") {
                    removeClass(rt, ts, current);
                }
                if (typeof value === "boolean") {
                    if (value) {
                        addClass(rt, ts, name);
                    }
                    else {
                        removeClass(rt, ts, name);
                    }
                }
                else if (typeof value === "string" && value !== "") {
                    addClass(rt, ts, value);
                }

                this.current = value;
            }

            return value;
        };
    }
}
