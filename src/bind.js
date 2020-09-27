// @flow
import type {IBind} from "./interfaces/ibind";
import type {Destroyable} from "./interfaces/destroyable";
import type {IValue} from "./interfaces/ivalue";
import type {IDefinition} from "./interfaces/idefinition";
import {ComponentCore} from "./interfaces/core";
import {JitValue, Value} from "./value";



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
        this.#value = value;
        this.#func = func.bind(this.#sync, value);
        this.#linked = !link;
        if (link) this.link();
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
        this.#values = values;
        this.#func = func.bind(null, ...values);
        this.#linked = false;
        if (link) this.link();
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
export class BindingDescription implements IDefinition {
    #name   : string;
    #func   : Function;
    #values : Array<JitValue>;

    /**
     * Constructs a common binding logic
     * @param name {string} is a name of property/attribute
     * @param func {Function} is a function to run to bind
     * @param values {Array<JitValue>} is a values array to bind
     */
    constructor(
        name : string,
        func: Function,
        ...values : Array<JitValue>
    ) {
        this.#name   = name;
        this.#values = values;
        this.#func   = func;
    }

    /**
     * Gets name of abstraction
     * @returns {string} the name of abstraction
     */
    get name () : string {
        return this.#name;
    }

    /**
     * Gets bound function
     * @returns {Function} the bound function
     */
    get func () : Function {
        return this.#func;
    }

    /**
     * Gets bind value array
     * @returns {Array<JitValue>} bind value array
     */
    get values () : Array<JitValue> {
        return this.#values;
    }

    /**
     * Is a virtual function to get the specific bind function
     * @param rt is the root component
     * @param ts is the this component
     */
    bound(rt : ComponentCore, ts : ComponentCore) : Function {
        throw "Must be implemented in child class";
    };

    /**
     * Creates a bind to live update attribute/property value
     * @param rt is the root component
     * @param ts is the this component
     * @returns {IBind} the new created bind
     */
    create (rt : ComponentCore, ts : ComponentCore) : Bind1x1 | Bind1xN {
        let bound  = this.bound(rt, ts);
        let values : Array<IValue> = [];

        for (let v of this.#values) {
            values.push(v.create(rt, ts));
        }

        bound();
        if (this.#values.length === 1) {
            return new Bind1x1(bound, values[0]);
        }
        else if (this.#values.length > 1) {
            return new Bind1xN(bound, values);
        }

        throw "There must be a value as minimum";
    }
}
