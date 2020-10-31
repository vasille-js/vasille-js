// @flow
import type {IBind} from "./interfaces/ibind";
import type {Destroyable} from "./interfaces/destroyable";
import type {IValue} from "./interfaces/ivalue";
import {Core} from "./interfaces/core";
import {Value} from "./value";


/**
 * A binding engine core
 */
export class Bind1x1 implements IBind {
    #value  : IValue;
    #func   : Function;
    #linked : boolean;
    #sync   : Value = new Value(null);

    /**
     * Constructs a binding engine
     * @param func {Function} is a function to run on value change
     * @param value {Value} is a value to bind
     * @param link links immediately
     */
    constructor (func : Function, value : IValue, link : boolean = true) {
        value.on(func);
        let bounded = func.bind(null, value);
        let handler = function () {
            this.#sync.set(bounded());
        }.bind(this);
        this.#value = value;
        this.#func = handler;
        this.#linked = !link;
        if (link) {
            this.link();
            this.#func.call();
        }
        this.#sync.set(bounded());
    }

    get () : any {
        return this.#sync.get();
    }

    set (value : any) : IValue {
        this.#sync.set(value);
        return this;
    }

    on (handler : Function) : IValue {
        this.#sync.on(handler);
        return this;
    }

    off(handler : Function) : IValue {
        this.#sync.off(handler);
        return this;
    }

    /**
     * Ensure the binding to be bound
     * @returns {Bind1x1} a pointer to this
     */
    link () : Bind1x1 {
        if (!this.#linked) {
            this.#value.on(this.#func);
            this.#linked = true;
        }
        return this;
    }

    /**
     * Ensure the binding to be unbound
     * @returns {Bind1x1} a pointer to this
     */
    unlink () : Bind1x1 {
        if (this.#linked) {
            this.#value.off(this.#func);
            this.#linked = false;
        }
        return this;
    }

    /**
     * Garbage collection
     */
    destroy () : void {
        this.unlink();
    }
}

/**
 * Bind some values to one function
 */
export class Bind1xN implements IBind, Destroyable {
    #values : Array<IValue>;
    #func   : Function;
    #linked : boolean;
    #sync   : Value = new Value(null);

    /**
     * Create a function bounded to N value
     * @param func {Function} is the function to bound
     * @param values {Array<IValue>} are values to bound to
     * @param link links immediately
     */
    constructor(func : Function, values : Array<IValue>, link : boolean = true) {
        let bounded = func.bind(this.#sync, ...values);
        let handler = function () {
            this.#sync.set(bounded());
        }.bind(this);
        this.#values = values;
        this.#func = handler;
        this.#linked = false;
        if (link) {
            this.link();
            this.#func.call();
        }
        this.#sync.set(bounded());
    }

    get () : any {
        return this.#sync.get();
    }

    set (value : any) : IValue {
        this.#sync.set(value);
        return this;
    }

    on (handler : Function) : IValue {
        this.#sync.on(handler);
        return this;
    }

    off(handler : Function) : IValue {
        this.#sync.off(handler);
        return this;
    }

    /**
     * Binds function to each value
     * @returns {Bind1xN} a pointer to this
     */
    link() : Bind1xN {
        if (!this.#linked) {
            for (let value of this.#values) {
                value.on(this.#func);
            }
            this.#linked = true;
        }
        return this;
    }

    /**
     * Unbind function from value
     * @returns {Bind1xN} a pointer to this
     */
    unlink() : Bind1xN {
        if (this.#linked) {
            for (let value of this.#values) {
                value.off(this.#func);
            }
            this.#linked = false;
        }
        return this;
    }

    /**
     * Clear bindings on destroy
     */
    destroy() : void {
        this.unlink();
    }
}

/**
 * Describe a common binding logic
 */
export class Binding implements IValue, Destroyable {
    #binding : IBind;
    #bound   : Function;

    /**
     * Constructs a common binding logic
     * @param rt is root component
     * @param ts is this component
     * @param name {string} is a name of property/attribute
     * @param func {Function} is a function to run to bind
     * @param values {Array<Value>} is a values array to bind
     */
    constructor(
        rt : Core, ts : Core,
        name : string,
        func: Function,
        ...values : Array<IValue>
    ) {
        if (values.length === 1) {
            this.#binding = new Bind1x1(func, values[0]);
        }
        else if (values.length > 1) {
            this.#binding = new Bind1xN(func, values);
        }
        else {
            throw "There must be a value as minimum";
        }

        this.#bound = this.bound(name).bind(null, rt, ts, this.#binding);
        this.#binding.on(this.#bound);
    }

    /**
     * Is a virtual function to get the specific bind function
     */
    bound(name : string) : Function {
        throw "Must be implemented in child class";
    };


    get () : any {
        return this.#binding.get();
    }

    set (any : any) : IValue {
        this.#binding.set(any);
        return this;
    }

    on (func : Function) : IValue {
        this.#binding.on(func);
        return this;
    }

    off (func : Function) : IValue {
        this.#binding.off(func);
        return this;
    }

    /**
     * Just clear bindings
     */
    destroy() {
        if (this.#binding) {
            this.#binding.destroy();
        }
    }
}
