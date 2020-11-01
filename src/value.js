// @flow
import type {Destroyable} from "./interfaces/destroyable";
import type {IValue}      from "./interfaces/ivalue";


/**
 * Declares a notifiable value
 */
export class Value implements IValue {
    #value    : any;
    #onchange : Array<Function>;

    /**
     * Constructs a notifiable value
     * @param value {any} is initial value
     */
    constructor (value : any) {
        this.#value = value;
        this.#onchange = [];
    }

    /**
     * Gets the notifiable value as js value
     * @returns {any} contained value
     */
    get () : any {
        return this.#value;
    }

    /**
     * Sets the value and notify listeners
     * @param value {any} is the new value
     * @returns {Value} a pointer to this
     */
    set (value : any) : Value {
        if (this.#value !== value) {
            this.#value = value;

            for (let handler of this.#onchange) {
                handler();
            }
        }

        return this;
    }

    /**
     * Adds a new handler for value change
     * @param handler {function} is a user-defined event handler
     * @returns {Value} a pointer to this
     */
    on (handler : Function) : Value {
        this.#onchange.push(handler);
        return this;
    }

    /**
     * Removes a new handler for value change
     * @param handler {function} is a existing user-defined handler
     * @returns {Value} a pointer to this
     */
    off (handler : Function) : Value {
        let index = this.#onchange.indexOf(handler);
        if (index !== -1) {
            this.#onchange.splice(index, 1);
        }
        return this;
    }
}

/**
 * Declares a notifiable bind to a value
 */
export class Rebind implements IValue, Destroyable {
    #value    : IValue;
    #onchange : Array<Function> = [];
    #bound    : Array<Function> = [];

    /**
     * Constructs a notifiable bind to a value
     * @param value {IValue} is initial value
     */
    constructor (value : IValue) {
        this.#onchange = [];
        this.set(value);
    }

    /**
     * Gets the notifiable value as js value
     * @returns {any} contained value
     */
    get () : any {
        return this.#value.get();
    }

    /**
     * Sets the value and notify listeners
     * @param value {IValue} is the new value
     * @returns {IValue} a pointer to this
     */
    set (value : IValue) : IValue {
        if (this.#value !== value) {
            for (let handler of this.#bound) {
                this.#value.off(handler);
            }

            this.#bound = [];
            this.#value = value;

            for (let handler of this.#onchange) {
                let bound = handler.bind(null, value);
                this.#value.on(bound);
                this.#bound.push(bound);
            }

            if (this.#value.get() !== value.get()) {
                for (let handler of this.#bound) {
                    handler();
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
    on (handler : Function) : IValue {
        let bound = handler.bind(null, this.#value);
        this.#onchange.push(handler);
        this.#bound.push(bound);
        this.#value.on(bound);
        return this;
    }

    /**
     * Removes a new handler for value change
     * @param handler {function} is a existing user-defined handler
     * @returns {IValue} a pointer to this
     */
    off (handler : Function) : IValue {
        let index = this.#onchange.indexOf(handler);
        if (index !== -1) {
            this.#value.off(this.#bound[index]);
            this.#onchange.splice(index, 1);
            this.#bound.splice(index, 1);
        }
        return this;
    }

    destroy () {
        for (let handler of this.#bound) {
            this.#value.off(handler);
        }
    }
}
