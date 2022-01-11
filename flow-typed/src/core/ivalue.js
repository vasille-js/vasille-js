// @flow
import { Destroyable } from "./destroyable.js";


/**
 * A interface which describes a value
 * @interface
 * @extends Destroyable
 */
declare export class IValue<T> extends Destroyable {
    isEnabled : boolean;

    constructor (isEnabled ?: boolean) : void;
    get $ () : T;
    set $ (value : T) : this;
    on (handler : (value : T) => void) : this;
    off (handler : (value : T) => void) : this;
    enable () : this;
    disable () : this;
}
