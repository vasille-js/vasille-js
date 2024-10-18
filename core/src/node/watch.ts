import { Fragment } from "./node";
import { IValue } from "../core/ivalue";

interface WatchOptions<T> {
    model: IValue<T>;
    slot?: (this: Fragment, value: T) => void;
}
/**
 * Watch Node
 * @class Watch
 * @extends Fragment
 */
export class Watch<T> extends Fragment<WatchOptions<T>> {
    public constructor(parent: Fragment, input: WatchOptions<T>) {
        super(parent, input, ":watch");
    }

    public compose() {
        this.watch(value => {
            this.children.forEach(child => {
                child.destroy();
            });
            this.children.clear();
            this.lastChild = undefined;
            this.input.slot?.call(this, value);
        }, this.input.model);

        this.input.slot?.call(this, this.input.model.$);
    }
}
