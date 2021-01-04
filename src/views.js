// @flow
import { VasilleNode }                                   from "./interfaces/core";
import { IValue }                                        from "./interfaces/ivalue.js";
import { ArrayModel, MapModel, ObjectModel, SetModel }   from "./models.js";
import { AppNode, BaseNode, RepeatNodeItem, ShadowNode } from "./node.js";
import { Value }                                         from "./value.js";



/**
 * Repeat node repeats its children
 */
export class RepeatNode extends ShadowNode {
    /**
     * Children node hash
     * @type {Map<*, ShadowNode>}
     */
    nodes : Map<any, ShadowNode> = new Map();

    /**
     * Call-back function to create a children pack
     * @type {function(RepeatNodeItem, ?*) : void}
     */
    cb : (node : RepeatNodeItem, v : ?any) => void;

    /**
     * Sets call-back function
     * @param cb {function(RepeatNodeItem, ?*) : void}
     */
    setCallback (cb : (node : RepeatNodeItem, v : ?any) => void) {
        this.cb = cb;
    }

    /**
     * Initialize the shadow node
     * @param app {AppNode} App node
     * @param rt {BaseNode} Root node
     * @param ts {BaseNode} This node
     * @param before {VasilleNode} Node to paste content before it
     */
    $$preinitShadow (app : AppNode, rt : BaseNode, ts : BaseNode, before : ?VasilleNode) {
        super.$$preinitShadow(app, rt, ts, before);
        this.$.encapsulate(ts.$.el);
    }

    /**
     * Create a children pack
     * @param id {*} id of child pack
     * @param item {IValue<*>} value for children pack
     * @param before {VasilleNode} Node to insert before it
     */
    createChild (id : any, item : IValue<any>, before : ?VasilleNode) {
        let current = this.nodes.get(id);
        let node = new RepeatNodeItem(id);

        this.destroyChild(id, item);

        node.$.parent = this;
        if (current) {
            node.$.next = current.$.next;
            node.$.prev = current.$.prev;
            if (node.$.next) {
                node.$.next.$.prev = node;
            }
            if (node.$.prev) {
                node.$.prev.$.next = node;
            }
            this.$children.splice(this.$children.indexOf(current), 1, node);
        }
        else if (before) {
            node.$.next = before;
            node.$.prev = before.$.prev;
            before.$.prev = node;
            if (node.$.prev) {
                node.$.prev.$.next = node;
            }
            this.$children.splice(this.$children.indexOf(before) - 1, 0, node);
        }
        else {
            let lastChild = this.$children[this.$children.length - 1];

            if (lastChild) {
                lastChild.$.next = node;
            }
            node.$.prev = lastChild;
            this.$children.push(node);
        }

        node.$$preinitShadow(this.$.app, this.$.rt, this, before || (
            current ? current.$.next : null
        ));

        node.$init({});
        this.$.app.$run.callCallback(() => {
            this.cb(node, item.$);
            node.$ready();
        });

        this.nodes.set(id, node);
    };

    /**
     * Destroy a old child
     * @param id {*} id of children pack
     * @param item {IValue<*>} value of children pack
     */
    destroyChild (id : any, item : IValue<any>) {
        let child = this.nodes.get(id);

        if (child) {
            if (child.$.prev) {
                child.$.prev.$.next = child.$.next;
            }
            if (child.$.next) {
                child.$.next.$.prev = child.$.prev;
            }
            child.$destroy();
            this.nodes.delete(id);
            this.$children.splice(this.$children.indexOf(child), 1);
        }
    };
}

/**
 * The simplest repeat node interpretation, repeat children pack a several times
 */
export class Repeater extends RepeatNode {
    /**
     * Handler to catch count updates
     * @type {Function}
     */
    updateHandler : Function;

    /**
     * Current count of child nodes
     * @type {number}
     */
    currentCount : number = 0;

    /**
     * Order number is used like children pack value
     * @type {Array<IValue<number>>}
     */
    orderNumber : Array<IValue<number>> = [];

    // props
    /**
     * The count of children
     * @type {IValue<number>}
     */
    count : IValue<number> = new Value(0);

    /**
     * Changes the children count
     * @param number {number} The new children count
     */
    changeCount (number : number) {
        if (number > this.currentCount) {
            for (let i = this.currentCount; i < number; i++) {
                let item = new Value(i);
                this.createChild(i, item);
                this.orderNumber.push(item);
            }
        }
        else {
            for (let i = this.currentCount - 1; i >= number; i--) {
                this.destroyChild(i, this.orderNumber[i]);
            }
            this.orderNumber.splice(number);
        }
        this.currentCount = number;
    }



    /**
     * Handles created event
     */
    $created () {
        super.$created();

        this.updateHandler = (value : number) => {
            this.changeCount(value);
        };
        this.count.on(this.updateHandler);
    }

    /**
     * Handles ready event
     */
    $ready () {
        this.changeCount(this.count.$);
    }

    /**
     * Handles destroy event
     */
    $destroy () {
        super.$destroy();
        this.count.off(this.updateHandler);
    }
}

/**
 * Base class of default views
 */
export class BaseView extends RepeatNode {
    /**
     * Handler to catch values addition
     * @type {Function}
     */
    addHandler : Function;

    /**
     * Handler to catch values removes
     * @type {Function}
     */
    removeHandler : Function;

    // props
    /**
     * Property which will contain a model
     * @type {IValue<*>}
     */
    model : IValue<any>;

    /**
     * Sets up model and handlers
     */
    constructor () {
        super();
        this.model = new Value();

        this.addHandler = (id : *, item : IValue<any>) => {
            this.createChild(id, item);
        };
        this.removeHandler = (id : *, item : IValue<any>) => {
            this.destroyChild(id, item);
        };
    }

    /**
     * Creates a child when user adds new values
     * @param id {*} id of children pack
     * @param item {IValue<*>} Value of children pack
     * @param before {VasilleNode} Node to paste before it
     * @return {handler} handler must be saved and unliked on value remove
     */
    createChild (id : *, item : IValue<*>, before : ?VasilleNode) : Function {
        let handler = () => {
            this.createChild(id, item);
        };
        item.on(handler);
        super.createChild(id, item, before);

        return handler;
    }



    /**
     * Handle ready event
     */
    $ready () {
        this.model.$.listener.onAdd(this.addHandler);
        this.model.$.listener.onRemove(this.removeHandler);
        super.$ready();
    }

    /**
     * Handles destroy event
     */
    $destroy () {
        this.model.$.listener.offAdd(this.addHandler);
        this.model.$.listener.offRemove(this.removeHandler);
        super.$destroy();
    }
}

/**
 * Represents a view of a array model
 */
export class ArrayView extends BaseView {
    /**
     * Contains handlers of each child
     * @type {Map<IValue<*>, Function>}
     */
    handlers : Map<IValue<*>, Function> = new Map();

    /**
     * Contains buffered children
     * @type {Array<string>}
     */
    buffer : Array<IValue<*>> = [];

    /**
     * Sets up model with a default value
     */
    constructor () {
        super();

        this.model.$ = new ArrayModel();
    }



    /**
     * Overrides child created and generate random id for children
     */
    createChild (id : *, item : IValue<*>, before : ?VasilleNode) {
        let next = typeof id === "number" ? this.nodes.get(this.buffer[id]) : null;

        let handler = super.createChild(item, item, before || next);
        this.handlers.set(item, handler);
        this.buffer.splice(id, 0, item);
    }

    /**
     * Removes a children pack
     */
    destroyChild (id : *, item : IValue<any>) {
        let index = typeof id === "number" ? id : this.buffer.indexOf(item);

        if (index === -1) {
            return;
        }

        item.off(this.handlers.get(item));
        this.handlers.delete(item);
        super.destroyChild(item, item);
        this.buffer.splice(index, 1);
    }



    /**
     * Handle ready event
     */
    $ready () {
        let arr = this.model.$;
        for (let i = 0; i < arr.length; i++) {
            this.$.app.$run.callCallback(() => {
                this.createChild(i, arr[i]);
            });
        }

        super.$ready();
    }

    /**
     * Handle destroy event
     */
    $destroy () {
        for (let it of this.handlers) {
            it[0].off(it[1]);
        }

        super.$destroy();
    }
}

/**
 * Create a children pack for each object field
 */
export class ObjectView extends BaseView {
    /**
     * Handler of property changes
     * @type {Object<string, function>}
     */
    handlers : { [key : string] : Function } = {};

    /**
     * Sets up model
     */
    constructor () {
        super();
        this.model.$ = new ObjectModel;
    }



    /**
     * Saves the child handler
     */
    createChild (id : string, item : IValue<*>, before : ?VasilleNode) {
        this.handlers[id] = super.createChild(id, item, before);
    }

    /**
     * Disconnects the child handler
     */
    destroyChild (id : string, item : IValue<*>) {
        item.off(this.handlers[id]);
        delete this.handlers[id];
        super.destroyChild(id, item);
    }



    /**
     * Handler ready event
     */
    $ready () {
        let obj = this.model.$;

        for (let i in obj) {
            if (obj.hasOwnProperty(i) && obj.get(i) instanceof IValue) {
                this.$.app.$run.callCallback(() => {
                    this.createChild(i, obj.get(i));
                });
            }
        }

        super.$ready();
    }

    /**
     * Handler destroy event
     */
    $destroy () {
        let obj = this.model.$;

        for (let i in obj) {
            if (obj.hasOwnProperty(i)) {
                obj.get(i).off(this.handlers[i]);
            }
        }

        super.$destroy();
    }
}

/**
 * Create a children pack for each map value
 */
export class MapView extends BaseView {
    /**
     * Contains update handler for each value
     * @type {Map<*, Function>}
     */
    handlers : Map<*, Function> = new Map();

    /**
     * Sets up model
     */
    constructor () {
        super();
        this.model.$ = new MapModel;
    }



    /**
     * Saves the child handler
     */
    createChild (id : *, item : IValue<*>, before : ?VasilleNode) {
        this.handlers.set(id, super.createChild(id, item, before));
    }

    /**
     * Disconnects the child handler
     */
    destroyChild (id : *, item : IValue<*>) {
        item.off(this.handlers.get(id));
        this.handlers.delete(id);
        super.destroyChild(id, item);
    }



    /**
     * Handler ready event
     */
    $ready () {
        let map = this.model.$;

        for (let it of map) {
            this.$.app.$run.callCallback(() => {
                this.createChild(it[0], it[1]);
            });
        }

        super.$ready();
    }

    /**
     * Handler destroy event
     */
    $destroy () {
        let map = this.model.$;

        for (let it of map) {
            it[1].off(this.handlers.get(it[0]));
        }

        super.$destroy();
    }
}

/**
 * Create a children pack for each set value
 */
export class SetView extends BaseView {
    /**
     * Contains update handler for each value
     * @type {Map<IValue<*>, Function>}
     */
    handlers : Map<IValue<*>, Function> = new Map();

    /**
     * Sets up model
     */
    constructor () {
        super();
        this.model.$ = new SetModel;
    }



    /**
     * Saves the child handler
     */
    createChild (id : *, item : IValue<*>, before : ?VasilleNode) {
        this.handlers.set(item, super.createChild(id, item, before));
    }

    /**
     * Disconnects the child handler
     */
    destroyChild (id : *, item : IValue<*>) {
        item.off(this.handlers.get(item));
        this.handlers.delete(item);
        super.destroyChild(id, item);
    }



    /**
     * Handler ready event
     */
    $ready () {
        let set = this.model.$;

        for (let it of set) {
            this.$.app.$run.callCallback(() => {
                this.createChild(it, it);
            });
        }

        super.$ready();
    }

    /**
     * Handler destroy event
     */
    $destroy () {
        let set = this.model.$;

        for (let it of set) {
            it.off(this.handlers.get(it));
        }

        super.$destroy();
    }
}
