import { Fragment } from "./node.js";
import { IValue } from "../core/ivalue.js";
import { IRunner } from "./runner.js";

export interface WatchOptions<
    Node,
    Element,
    TagOptions extends object,
    Runner extends IRunner<Node, Element, TagOptions>,
    T,
> {
    model: IValue<T>;
    slot?: (ctx: Fragment<Node, Element, TagOptions, Runner>, value: T) => void;
}
/**
 * Watch Node
 * @class Watch
 * @extends Fragment
 */
export class Watch<
    Node,
    Element,
    TagOptions extends object,
    T,
    Runner extends IRunner<Node, Element, TagOptions> = IRunner<Node, Element, TagOptions>,
> extends Fragment<Node, Element, TagOptions, Runner> {
    private readonly model: IValue<T>;
    private readonly slot?: (ctx: Fragment<Node, Element, TagOptions, Runner>, value: T) => void;
    private handler?: (value: T) => void;

    public constructor(input: WatchOptions<Node, Element, TagOptions, Runner, T>, runner: Runner, deep: number) {
        super(runner, deep);
        this.model = input.model;
        this.slot = input.slot;
    }

    public override compose() {
        const slot = this.slot;

        if (slot) {
            const handler = (this.handler = value => {
                this.children.forEach(child => {
                    child.destroy(child.sDeep);
                });
                this.children.splice(0);
                this.last = undefined;
                slot(this, value);
            });
            this.model.on(handler);
            handler(this.model.V);
        }
    }

    public override destroy(deep: number) {
        if (this.handler && this.model.rDeep < deep) {
            this.model.off(this.handler);
        }
        super.destroy(deep);
    }
}
