// @flow
import { typeError }               from "./interfaces/errors";
import { checkType, isSubclassOf } from "./interfaces/idefinition";
import { IValue }                  from "./interfaces/ivalue.js";



/**
 * Declares a notifiable value
 * @implements IValue
 */
export class Reference<T> extends IValue<T> {
    /**
     * The encapsulated value
     * @type {*}
     */
    value : T;

    /**
     * Array of handlers
     * @type {Set<Function>}
     */
    onchange : Set<Function>;

    /**
     * Constructs a notifiable value
     * @param value {any} is initial value
     */
    constructor (value : T) {
        super();
        this.value = value;
        this.onchange = new Set<Function>();
    }

    /**
     * Gets the notifiable value as js value
     * @returns {any} contained value
     */
    get $ () : T {
        return this.value;
    }

    /**
     * Sets the value and notify listeners
     * @param value {any} is the new value
     * @returns {Reference} a pointer to this
     */
    set $ (value : T) : this {
        if (this.value !== value) {
            if (this.type && !checkType(value, this.type)) {
                throw typeError("Unable to set reference value");
            }

            this.value = value;

            for (let handler of this.onchange) {
                handler(value);
            }
        }

        return this;
    }

    /**
     * Adds a new handler for value change
     * @param handler {function} is a user-defined event handler
     * @returns {Reference} a pointer to this
     */
    on (handler : Function) : this {
        this.onchange.add(handler);
        return this;
    }

    /**
     * Removes a new handler for value change
     * @param handler {function} is a existing user-defined handler
     * @returns {Reference} a pointer to this
     */
    off (handler : Function) : this {
        this.onchange.delete(handler);
        return this;
    }

    $destroy () {
        super.$destroy();
        this.onchange.clear();
    }
}

/**
 * Declares a notifiable bind to a value
 * @implements IValue
 */
export class Pointer extends IValue<IValue<any>> {
    value : IValue<any>;
    onchange : Set<Function>;

    /**
     * Constructs a notifiable bind to a value
     * @param value {IValue} is initial value
     */
    constructor (value : IValue<any>) {
        super();
        this.onchange = new Set<Function>();
        this.$ = value;
    }

    /**
     * Gets the notifiable value as js value
     * @returns {any} contained value
     */
    get $ () : any {
        return this.value.$;
    }

    /**
     * Sets the value and notify listeners
     * @param value {IValue} is the new value
     * @returns {IValue} a pointer to this
     */
    set $ (value : IValue<any>) : this {
        if (this.value !== value) {
            if (this.type) {
                if (this.type !== value.type) {
                    if (value.type === null && checkType(value.$, this.type)) {
                        value.type = this.type;
                    }
                    else if (!isSubclassOf(this.type, value.type)) {
                        throw typeError("reference type incompatible with pointer type");
                    }
                }
            }

            for (let handler of this.onchange) {
                this.value.off(handler);
            }

            this.value = value;

            for (let handler of this.onchange) {
                this.value.on(handler);
            }

            if (this.value.$ !== value.$) {
                for (let handler of this.onchange) {
                    handler(this.value.$);
                }
            }
        }

        return this;
    }

    /**
     * Adds a new handler for value change
     * @param handler {function} is a user-defined event handler
     * @returns {IValue} a pointer to this
     */
    on (handler : Function) : this {
        this.onchange.add(handler);
        this.value.on(handler);
        return this;
    }

    /**
     * Removes a new handler for value change
     * @param handler {function} is a existing user-defined handler
     * @returns {IValue} a pointer to this
     */
    off (handler : Function) : this {
        if (this.onchange.has(handler)) {
            this.value.off(handler);
            this.onchange.delete(handler);
        }
        return this;
    }

    /**
     * Removes all bounded functions
     */
    $destroy () {
        for (let handler of this.onchange) {
            this.value.off(handler);
        }
    }
}
