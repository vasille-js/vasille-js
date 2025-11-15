import { Binding } from "./binding.js";
import type { INode } from "../../../node/node.js";
import type { IValue } from "../../../core/ivalue.js";

export function addClass(node: INode<Node, Element, object>, cl: string) {
    node.element.classList.add(cl);
}

export function removeClass(node: INode<Node, Element, object>, cl: string) {
    node.element.classList.remove(cl);
}

export class StaticClassBinding extends Binding<boolean> {
    private current = false;

    constructor(node: INode<Node, Element, object>, name: string, value: IValue<boolean>) {
        super(value);
        this.init((value: boolean) => {
            if (value !== this.current) {
                if (value) {
                    addClass(node, name);
                } else {
                    removeClass(node, name);
                }
                this.current = value;
            }
        });
    }
}

export class DynamicalClassBinding extends Binding<string> {
    private current = "";

    constructor(node: INode<Node, Element, object>, value: IValue<string>) {
        super(value);
        this.init((value: string) => {
            /* istanbul ignore else */
            if (this.current != value) {
                if (this.current.length) {
                    removeClass(node, this.current);
                }
                /* istanbul ignore else */
                if (value.length) {
                    addClass(node, value);
                }
                this.current = value;
            }
        });
    }
}
