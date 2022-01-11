import { Fragment } from "./node";
import { Slot } from "../core/slot";
import { IValue } from "../core/ivalue";
/**
 * Watch Node
 * @class Watch
 * @extends Fragment
 */
export declare class Watch extends Fragment {
    /**
     * Default slot
     * @type Slot
     */
    slot: Slot;
    /**
     * iValue to watch
     * @type IValue
     */
    model: IValue<unknown>;
    constructor();
    $createWatchers(): void;
    $compose(): void;
}
