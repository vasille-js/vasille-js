import { Fragment } from "./node";
import { IValue } from "../core/ivalue";
import { Options } from "../functional/options";

interface WatchOptions<T> extends Options {
    model : IValue<T>
    slot ?: (node : Fragment, value : T) => void;
}
/**
 * Watch Node
 * @class Watch
 * @extends Fragment
 */
export class Watch<T> extends Fragment<WatchOptions<T>> {

    input !: WatchOptions<T>

    public compose (input : WatchOptions<T>) {
        this.watch((value) => {
            this.children.forEach(child => {
                child.destroy();
            });
            this.children.clear();
            input.slot && input.slot(this, value);
        }, input.model);

        input.slot(this, input.model.$);
    }
}
