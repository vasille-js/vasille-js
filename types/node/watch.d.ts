import { Fragment } from "./node";
import { IValue } from "../core/ivalue";
import { Options } from "../functional/options";
interface WatchOptions<T> extends Options {
    model: IValue<T>;
    slot?: (node: Fragment, value: T) => void;
}
/**
 * Watch Node
 * @class Watch
 * @extends Fragment
 */
export declare class Watch<T> extends Fragment<WatchOptions<T>> {
    input: WatchOptions<T>;
    compose(input: WatchOptions<T>): void;
}
export {};
