// @flow
import { Binding } from "./binding";
import type { INode } from "../node/node";
import type { IValue } from "../core/ivalue";



/**
 * Represents a HTML class binding description
 * @extends Binding
 */
export class ClassBinding extends Binding<string | boolean> {
    current : ? string | boolean = null;

    /**
     * Constructs a HTML class binding description
     * @param rt {INode} is root component
     * @param ts {INode} is this component
     * @param name {String} is the name of attribute
     * @param value
     */
    constructor (
        rt : INode,
        ts : INode,
        name : string,
        value : IValue<string | boolean>
    ) {
        super(rt, ts, name, value);
        this.$seal();
    }

    /**
     * Generates a function which updates the html class value
     * @param name {String} The name of attribute
     * @returns {Function} a function which will update attribute value
     */
    bound (name : string) : (rt : INode, ts : INode, value : string | boolean) => void {

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
        };
    }
}
