import { Fragment } from "./node.js";
import { IValue } from "../core/ivalue.js";
import { IRunner } from "./runner.js";

export interface WatchOptions<Node, Element, TagOptions extends object, T> {
    model: IValue<T>;
    slot?: (ctx: Fragment<Node, Element, TagOptions>, value: T) => void;
}
/**
 * Watch Node
 * @class Watch
 * @extends Fragment
 */
export class Watch<Node, Element, TagOptions extends object, T> extends Fragment<Node, Element, TagOptions> {
    private readonly model: IValue<T>;
    private readonly slot?: (ctx: Fragment<Node, Element, TagOptions>, value: T) => void;
    private handler?: (value: T) => void;

    public constructor(input: WatchOptions<Node, Element, TagOptions, T>, runner: IRunner<Node, Element, TagOptions>) {
        super(runner);
        this.model = input.model;
        this.slot = input.slot;
    }

    public override compose() {
        const slot = this.slot;

        if (slot) {
            const handler = (this.handler = value => {
                this.children.forEach(child => {
                    child.destroy();
                });
                this.children.clear();
                this.lastChild = undefined;
                slot(this, value);
            });
            this.model.on(handler);
            handler(this.model.V);
        }
    }

    public override destroy() {
        if (this.handler) {
            this.model.off(this.handler);
        }
        super.destroy();
    }
}
