// @flow
import { notOverwritten, typeError, wrongBinding } from "./interfaces/errors";
import { IBind }                                   from "./interfaces/ibind.js";
import { checkType }                               from "./interfaces/idefinition";
import { IValue }                                  from "./interfaces/ivalue.js";
import { Reference }                               from "./value.js";



/**
 * Bind some values to one expression
 * @implements IBind
 */
export class Expression extends IBind {
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
     * @type {Reference}
     */
    sync : Reference<any> = new Reference(null);

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
        super();
        let handler = () => {
            let value = func(...values.map(v => v.$));

            if (this.type) {
                if (!checkType(value, this.type)) {
                    throw typeError("expression returns wrong incompatible value");
                }
            }

            this.sync.$ = value;
        };

        this.values = values;
        this.func = handler;
        this.linked = false;

        if (link) {
            this.link();
        }

        handler();
    }

    /**
     * Gets the last calculated value
     * @return {*} The last calculated value
     */
    get $ () : any {
        return this.sync.$;
    }

    /**
     * Sets the last calculated value in manual mode
     * @param value {*} New value for last calculated value
     * @return {Expression} A pointer to this
     */
    set $ (value : any) : this {
        this.sync.$ = value;
        return this;
    }

    /**
     * Sets a user handler on value change
     * @param handler {Function} User defined handler
     * @return {Expression} A pointer to this
     */
    on (handler : Function) : this {
        this.sync.on(handler);
        return this;
    }

    /**
     * Unsets a user handler from value change
     * @param handler {Function} User installed handler
     * @return {Expression} A pointer to this
     */
    off (handler : Function) : this {
        this.sync.off(handler);
        return this;
    }

    /**
     * Binds function to each value
     * @returns {Expression} A pointer to this
     */
    link () : this {
        if (!this.linked) {
            for (let value of this.values) {
                value.on(this.func);
            }
            this.linked = true;
        }
        return this;
    }

    /**
     * Unbind function from each value
     * @returns {Expression} A pointer to this
     */
    unlink () : this {
        if (this.linked) {
            for (let value of this.values) {
                value.off(this.func);
            }
            this.linked = false;
        }
        return this;
    }

    /**
     * Clear bindings on destroy
     */
    $destroy () : void {
        this.unlink();
    }
}

/**
 * Describe a common binding logic
 * @implements IValue
 */
export class Binding extends IValue<any> {
    binding : IValue<any>;
    func : Function;
    owner : boolean;

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
        super();

        this.func = this.bound(name).bind(null, rt, ts);

        if (!func && values.length === 1) {
            this.binding = values[0];
            this.owner = false;
        }
        else if (func && values.length) {
            this.binding = new Expression(func, values);
            this.owner = true;
        }
        else {
            throw wrongBinding("Binding request a value as minimum");
        }

        this.binding.on(this.func);
        this.func(this.binding.$);
    }

    /**
     * Is a virtual function to get the specific bind function
     * @param name {String} The name of attribute/property
     * @returns {Function} A function to update attribute/property value
     * @throws Always trows and must be overloaded in child class
     */
    bound (name : string) : Function {
        throw notOverwritten();
    };

    /**
     * Gets the binding value
     * @return {*} The binding value
     */
    get $ () : any {
        return this.binding.$;
    }

    /**
     * Sets the binding value
     * @param any {*} The new binding value
     * @return {Binding} A pointer to this
     */
    set $ (any : any) : this {
        this.binding.$ = any;
        return this;
    }

    /**
     * Adds a user handler to the binding value change event
     * @param func {Function} User defined handler
     * @return {Binding} A pointer to this
     */
    on (func : Function) : this {
        this.binding.on(func);
        return this;
    }

    /**
     * Removes a user handler from binding value change event
     * @param func {Function} User installed handler
     * @return {Binding} A pointer to this
     */
    off (func : Function) : this {
        this.binding.off(func);
        return this;
    }

    /**
     * Just clear bindings
     */
    $destroy () {
        this.binding.off(this.func);

        if (this.owner) {
            this.binding.$destroy();
        }
    }
}
