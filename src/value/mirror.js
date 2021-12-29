// @flow
import { IValue } from "../core/ivalue";
import { Reference } from "./reference";



/**
 * Declares a notifiable bind to a value
 * @extends IValue
 */
export class Mirror<T> extends Reference<T> {
    /**
     * value of pointer
     * @type {IValue<*>}
     */
    pointedValue : IValue<T>;

    /**
     * Collection of handlers
     * @type {Set<Function>}
     */
    handler : (value : T) => void;

    forwardOnly : boolean;

    /**
     * Constructs a notifiable bind to a value
     * @param value {IValue} is initial value
     */
    constructor (value : IValue<T>, forwardOnly : boolean = false) {
        super (value.$);
        this.handler = (v : T) => {
            this.$ = v;
        };
        this.pointedValue = value;
        this.forwardOnly = forwardOnly;

        value.on (this.handler);
        this.$seal ();
    }

    get $ () : T {
        return super.$;
    }

    set $ (v : T) {
        super.$ = v;
        if (!this.forwardOnly) {
            this.pointedValue.$ = v;
        }
    }

    enable () : this {
        this.pointedValue.on(this.handler);
        this.$ = this.pointedValue.$;
        return this;
    }
    disable () : this {
        this.pointedValue.off(this.handler);
        return this;
    }

    /**
     * Removes all bounded functions
     */
    $destroy () {
        this.disable();
        super.$destroy();
    }
}
