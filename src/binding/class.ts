import { Binding } from "./binding";
import type { INode } from "../node/node";
import type { IValue } from "../core/ivalue";



/**
 * Represents a HTML class binding description
 * @class ClassBinding
 * @extends Binding
 */
export class ClassBinding extends Binding<string | boolean> {
    /**
     * Constructs an HTML class binding description
     * @param node {INode} the vasille node
     * @param name {String} the name of class
     * @param value {IValue} the value to bind
     */
    public constructor (
        node : INode,
        name : string,
        value : IValue<string | boolean>
    ) {
        super(node, name, value);
        this.$seal();
    }

    /**
     * Generates a function which updates the html class value
     * @param name {String} The name of attribute
     * @returns {Function} a function which will update attribute value
     */
    protected bound (name : string) : (node : INode, value : string | boolean) => void {

        let current : string | boolean = null;

        function addClass (node : INode, cl : string) {
            node.app.$run.addClass(node.node, cl);
        }

        function removeClass (node : INode, cl : string) {
            node.app.$run.removeClass(node.node, cl);
        }

        return (node : INode, value : string | boolean) => {

            if (value !== current) {
                if (typeof current === "string" && current !== "") {
                    removeClass(node, current);
                }
                if (typeof value === "boolean") {
                    if (value) {
                        addClass(node, name);
                    }
                    else {
                        removeClass(node, name);
                    }
                }
                else if (typeof value === "string" && value !== "") {
                    addClass(node, value);
                }
                current = value;
            }
        };
    }
}
