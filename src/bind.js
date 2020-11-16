// @flow
import { IBind }  from "./interfaces/ibind.js";
import { IValue } from "./interfaces/ivalue.js";

import { Value } from "./value.js";



/**
 * A binding engine core
 * @implements IBind
 */
export class Bind1 extends IBind {
    /**
     * The value which will trigger recalculation
     * @type {IValue}
     */
    value : IValue<any>;

    /**
     * The function which will calc the new bind value
     * @type {Function}
     */
    func : Function;

    /**
     * The current linking state of bind
     * @type {boolean}
     */
    linked : boolean;

    /**
     * The buffer to keep value between calculations
     * @type {Value}
     */
    sync : Value<any> = new Value ( null );

    /**
     * Constructs a binding engine
     * @param func {Function} Function to run on value change
     * @param value {IValue} Value to bind
     * @param link {Boolean} If true links immediately
     */
    constructor (
        func : Function,
        value : IValue<any>,
        link : boolean = true
    ) {
        super ();
        let handler = function () {
            this.sync.set ( func ( value.get () ) );
        }.bind ( this );

        this.value = value;
        this.func = handler;
        this.linked = !link;

        if (link) {
            this.link ();
            this.func.call ();
        }

        value.on ( this.func );
        this.sync.set ( func ( value.get () ) );
    }

    /**
     * Gets the last calculated value of bind
     * @return {*} The last calculated value
     */
    get () : any {
        return this.sync.get ();
    }

    /**
     * Force sets a new value to buffer
     * @param value {*} The value to set to buffer
     * @return {Bind1} A pointer too this
     */
    set ( value : any ) : this {
        this.sync.set ( value );
        return this;
    }

    /**
     * Adds a new handler to value change event
     * @param handler {Function} The user defined handler
     * @return {Bind1} A pointer to this
     */
    on ( handler : Function ) : this {
        this.sync.on ( handler );
        return this;
    }

    /**
     * Removes a handler from value change event
     * @param handler {Function} The user installed handler
     * @return {Bind1} A pointer to this
     */
    off ( handler : Function ) : this {
        this.sync.off ( handler );
        return this;
    }

    /**
     * Ensure the binding to be bound
     * @returns {Bind1} A pointer to this
     */
    link () : Bind1 {
        if (!this.linked) {
            this.value.on ( this.func );
            this.linked = true;
        }
        return this;
    }

    /**
     * Ensure the binding to be unbound
     * @returns {Bind1} A pointer to this
     */
    unlink () : Bind1 {
        if (this.linked) {
            this.value.off ( this.func );
            this.linked = false;
        }
        return this;
    }

    /**
     * Provides garbage collection
     */
    destroy () : void {
        this.unlink ();
    }
}

/**
 * Bind some values to one function
 * @implements IBind
 */
export class BindN extends IBind {
    /**
     * The array of value which will trigger recalculation
     * @type {Array<IValue>}
     */
    values : Array<IValue<any>>;

    /**
     * The function which will be executed on recalculation
     * @type {Function}
     */
    func : Function;

    /**
     * The current linking state
     * @type {boolean}
     */
    linked : boolean;

    /**
     * The buffer to keep the last calculated value
     * @type {Value}
     */
    sync : Value<any> = new Value ( null );

    /**
     * Creates a function bounded to N value
     * @param func {Function} The function to bound
     * @param values {Array<IValue>} Values to bound to
     * @param link {Boolean} If true links immediately
     */
    constructor (
        func : Function,
        values : Array<IValue<any>>,
        link : boolean = true
    ) {
        super ();
        let handler = function () {
            this.sync.set ( func ( values.map ( v => v.get () ) ) );
        }.bind ( this );

        this.values = values;
        this.func = handler;
        this.linked = false;

        if (link) {
            this.link ();
            this.func.call ();
        }

        this.sync.set ( func ( values.map ( v => v.get () ) ) );
    }

    /**
     * Gets the last calculated value
     * @return {*} The last calculated value
     */
    get () : any {
        return this.sync.get ();
    }

    /**
     * Sets the last calculated value in manual mode
     * @param value {*} New value for last calculated value
     * @return {BindN} A pointer to this
     */
    set ( value : any ) : this {
        this.sync.set ( value );
        return this;
    }

    /**
     * Sets a user handler on value change
     * @param handler {Function} User defined handler
     * @return {BindN} A pointer to this
     */
    on ( handler : Function ) : this {
        this.sync.on ( handler );
        return this;
    }

    /**
     * Unsets a user handler from value change
     * @param handler {Function} User installed handler
     * @return {BindN} A pointer to this
     */
    off ( handler : Function ) : this {
        this.sync.off ( handler );
        return this;
    }

    /**
     * Binds function to each value
     * @returns {BindN} A pointer to this
     */
    link () : BindN {
        if (!this.linked) {
            for (let value of this.values) {
                value.on ( this.func );
            }
            this.linked = true;
        }
        return this;
    }

    /**
     * Unbind function from each value
     * @returns {BindN} A pointer to this
     */
    unlink () : BindN {
        if (this.linked) {
            for (let value of this.values) {
                value.off ( this.func );
            }
            this.linked = false;
        }
        return this;
    }

    /**
     * Clear bindings on destroy
     */
    destroy () : void {
        this.unlink ();
    }
}

/**
 * Describe a common binding logic
 * @implements IValue
 */
export class Binding extends IValue<any> {
    binding : IValue<any>;
    func : Function;

    /**
     * Constructs a common binding logic
     * @param rt {BaseNode} Root component
     * @param ts {BaseNode} This component
     * @param name {String} Name of property/attribute
     * @param func {?Function} A function to run on value change
     * @param values {Array<IValue>} values array to bind
     */
    constructor (
        rt : any,
        ts : any,
        name : string,
        func : ?Function,
        ...values : Array<IValue<any>>
    ) {
        super ();
        if (!func && values.length === 1) {
            this.binding = values[0];
        }
        else if (func && values.length) {
            this.binding = values.length > 1 ? new BindN ( func, values ) : new Bind1 ( func, values[0] );
        }
        else {
            throw "There must be a value as minimum";
        }

        this.func = this.bound ( name ).bind ( null, rt, ts, this.binding );
        this.binding.on ( this.func );
        this.func ();
    }

    /**
     * Is a virtual function to get the specific bind function
     * @param name {String} The name of attribute/property
     * @returns {Function} A function to update attribute/property value
     * @throws Always trows and must be overloaded in child class
     */
    bound ( name : string ) : Function {
        throw "Must be implemented in child class";
    };

    /**
     * Gets the binding value
     * @return {*} The binding value
     */
    get () : any {
        return this.binding.get ();
    }

    /**
     * Sets the binding value
     * @param any {*} The new binding value
     * @return {Binding} A pointer to this
     */
    set ( any : any ) : this {
        this.binding.set ( any );
        return this;
    }

    /**
     * Adds a user handler to the binding value change event
     * @param func {Function} User defined handler
     * @return {Binding} A pointer to this
     */
    on ( func : Function ) : this {
        this.binding.on ( func );
        return this;
    }

    /**
     * Removes a user handler from binding value change event
     * @param func {Function} User installed handler
     * @return {Binding} A pointer to this
     */
    off ( func : Function ) : this {
        this.binding.off ( func );
        return this;
    }

    /**
     * Just clear bindings
     */
    destroy () {
        this.binding.off ( this.bound );
    }
}
