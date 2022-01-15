import { Fragment } from "./node";
import { Slot } from "../core/slot";
import { IValue } from "../core/ivalue";
/**
 * Watch Node
 * @class Watch
 * @extends Fragment
 */
export declare class Watch<T> extends Fragment {
    /**
     * Default slot
     * @type Slot
     */
    slot: Slot<Fragment, T>;
    /**
     * iValue to watch
     * @type IValue
     */
    model: IValue<T>;
    constructor();
    $createWatchers(): void;
    $compose(): void;
}
