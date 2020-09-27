// @flow
import type {IDefinition} from "./interfaces/idefinition";
import {Value} from "./value";
import {ComponentCore} from "./interfaces/core";



/**
 * Defines a Component property
 */
export class PropertyDefinition implements IDefinition {
    #name : string;
    #Type : Function;
    #init : Array<any>;

    /**
     * Construct a property definition
     * @param name {String} is the property name
     * @param _type {Function} is the property constructor
     * @param init {args} are arguments to initialize the type
     */
    constructor(name : string, _type : Function, ...init : Array<any>) {
        this.#name = name;
        this.#Type = _type;
        this.#init = init;
    }

    /**
     * Gets the name of property
     * @returns {string} the name of property
     */
    get name () : string {
        return this.#name;
    }

    /**
     * Gets the property constructor
     * @returns {Function} property constructor
     */
    get type () : Function {
        return this.#Type;
    }

    /**
     * Gets the constructor arguments
     * @returns {Array<*>} constructor arguments
     */
    get initial () : Array<any> {
        return this.#init;
    }

    /**
     * Create a value of property
     * @returns {Value} a property value object
     */
    create (rt : ComponentCore, ts : ComponentCore) : Value {
        return new Value(new this.#Type(...this.#init));
    }
}
