// @flow
import { Binding }       from "./bind.js";
import { Callable }      from "./interfaces/idefinition.js";
import { IValue }        from "./interfaces/ivalue.js";
import type { BaseNode } from "./node";
import { propertify }    from "./property.js";



/**
 * Creates a class target 1 to 1 bind
 * @param rt {BaseNode} is the root component
 * @param ts {BaseNode} is the this component
 * @param name {String} is attribute name
 * @param value {?any} is attribute value
 * @param func {?Callable} is attribute value calculation function
 * @returns {AttributeBinding} 1 to 1 bind of attribute
 */
export function classify (
    rt : any,
    ts : any,
    name : string,
    value : ?any     = null,
    func : ?Callable = null
) : ClassBinding {
    return new ClassBinding ( rt, ts, name, null, propertify ( value, func ) );
}

/**
 * Represents a HTML class binding description
 * @extends Binding
 */
export class ClassBinding extends Binding {
    current : ?string = null;

    /**
     * Constructs a HTML class binding description
     * @param rt {BaseNode} is root component
     * @param ts {BaseNode} is this component
     * @param name {String} is the name of attribute
     * @param func {?Function} is the function to bound
     * @param values {Array<IValue>} is the array of values to bind to
     */
    constructor (
        rt : any,
        ts : any,
        name : string,
        func : ?Function,
        ...values : Array<IValue<any>>
    ) {
        super ( rt, ts, name, func, ...values );
    }

    /**
     * Generates a function which updates the html class value
     * @param name {String} The name of attribute
     * @returns {Function} a function which will update attribute value
     */
    bound ( name : string ) : Function {
        let binding = this;

        return function ( rt : BaseNode, ts : BaseNode, v : IValue<any> ) {
            let value : string = v.get ();
            let current : ?string = binding.current;

            if (value !== current) {
                if (current instanceof String && current !== "") {
                    rt.$app.run.addClass ( ts.el, current );
                }
                if (value instanceof Boolean) {
                    if (value) {
                        rt.$app.run.addClass ( ts.el, name );
                    }
                    else {
                        rt.$app.run.removeClass ( ts.el, name );
                    }
                }
                else if (value instanceof String && value !== "") {
                    rt.$app.run.addClass ( ts.el, value );
                }

                binding.current = value;
            }

            return value;
        };
    }
}
