import { Fragment } from "./node.js";
import { IValue } from "../core/ivalue.js";
import { Runner } from "./runner.js";

interface WatchOptions<Node, Element, TagOptions extends object, T> {
    model: IValue<T>;
    slot?: (ctx: Fragment<Node, Element, TagOptions>, value: T) => void;
}
/**
 * Watch Node
 * @class Watch
 * @extends Fragment
 */
export class Watch<Node, Element, TagOptions extends object, T> extends Fragment<
    Node,
    Element,
    TagOptions,
    WatchOptions<Node, Element, TagOptions, T>
> {
    public constructor(input: WatchOptions<Node, Element, TagOptions, T>, runner: Runner<Node, Element, TagOptions>) {
        super(input, runner, ":watch");
    }

    public compose() {
        this.watch(
            value => {
                this.children.forEach(child => {
                    child.destroy();
                });
                this.children.clear();
                this.lastChild = undefined;
                this.input.slot?.(this, value);
            },
            [this.input.model],
        );
    }
}
