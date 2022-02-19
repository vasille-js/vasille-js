import { Binding } from "./binding";
import type { INode } from "../node/node";
import type { IValue } from "../core/ivalue";



function addClass (node : INode, cl : string) {
    node.app.run.addClass(node.node, cl);
}

function removeClass (node : INode, cl : string) {
    node.app.run.removeClass(node.node, cl);
}

export class StaticClassBinding extends Binding<boolean> {
    private current = false;

    constructor(node : INode, name : string, value : IValue<boolean>) {
        super(value);
        this.init((value : boolean) => {
            if (value !== this.current) {
                if (value) {
                    addClass(node, name);
                }
                else {
                    removeClass(node, name);
                }
                this.current = value;
            }
        });
        this.seal();
    }
}

export class DynamicalClassBinding extends Binding<string> {
    private current = "";

    constructor(node : INode, value : IValue<string>) {
        super(value);
        this.init((value : string) => {
            if (this.current != value) {
                if (this.current.length) {
                    removeClass(node, this.current);
                }
                if (value.length) {
                    addClass(node, value);
                }
                this.current = value;
            }
        });
        this.seal();
    }
}
