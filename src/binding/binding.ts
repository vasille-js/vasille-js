import { Destroyable } from "../core/destroyable";
import type { IValue } from "../core/ivalue";
import type { INode } from "../node/node";
import { notOverwritten } from "../core/errors";


/**
 * Describe a common binding logic
 * @implements IValue
 */
export class Binding<T> extends Destroyable {
    private binding : IValue<T>;
    private readonly updateFunc : (value: T) => void;

    /**
     * Constructs a common binding logic
     * @param rt {INode} Root component
     * @param ts {INode} This component
     * @param name {String} Name of property/attribute
     * @param func {?Function} A function to run on value change
     */
    public constructor (
        node : INode,
        name : string,
        value : IValue<T>
    ) {
        super ();

        this.updateFunc = this.bound (name).bind (null, node);
        this.binding = value;

        this.binding.on (this.updateFunc);
        this.updateFunc (this.binding.$);

        this.$seal ();
    }

    /**
     * Is a virtual function to get the specific bind function
     * @param name {String} The name of attribute/property
     * @returns {Function} A function to update attribute/property value
     * @throws Always trows and must be overloaded in child class
     */
    protected bound (name : string) : (node : INode, value : T) => void {
        throw notOverwritten ();
    };

    /**
     * Just clear bindings
     */
    public $destroy () {
        this.binding.off (this.updateFunc);
    }
}
