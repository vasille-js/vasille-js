// @flow
import { VasilleNode }                                   from "./interfaces/core";
import { IValue }                                        from "./interfaces/ivalue.js";
import { ArrayModel, MapModel, ObjectModel, SetModel }                       from "./models.js";
import { AppNode, BaseNode, RepeatNodeItem, ExtensionNode, BaseNodePrivate } from "./node.js";
import { Reference }                                                         from "./value.js";



class RepeatNodePrivate extends BaseNodePrivate {
    /**
     * Children node hash
     * @type {Map<*, ExtensionNode>}
     */
    nodes : Map<any, ExtensionNode> = new Map();

    /**
     * Call-back function to create a children pack
     * @type {function(RepeatNodeItem, ?*) : void}
     */
    cb : (node : RepeatNodeItem, v : ?any) => void;
}

/**
 * Repeat node repeats its children
 */
export class RepeatNode extends ExtensionNode {
    $ : any = new RepeatNodePrivate();

    /**
     * Sets call-back function
     * @param cb {function(RepeatNodeItem, ?*) : void}
     */
    setCallback (cb : (node : RepeatNodeItem, v : ?any) => void) {
        this.$.cb = cb;
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
        let current = this.$.nodes.get(id);
        let node = new RepeatNodeItem(id);
        let $ = node.$;

        this.destroyChild(id, item);

        $.parent = this;
        if (current) {
            $.next = current.$.next;
            $.prev = current.$.prev;
            if ($.next) {
                $.next.$.prev = node;
            }
            if ($.prev) {
                $.prev.$.next = node;
            }
            this.$children.splice(this.$children.indexOf(current), 1, node);
        }
        else if (before) {
            $.next = before;
            $.prev = before.$.prev;
            before.$.prev = node;
            if ($.prev) {
                $.prev.$.next = node;
            }
            this.$children.splice(this.$children.indexOf(before) - 1, 0, node);
        }
        else {
            let lastChild = this.$children[this.$children.length - 1];

            if (lastChild) {
                lastChild.$.next = node;
            }
            $.prev = lastChild;
            this.$children.push(node);
        }

        node.$$preinitShadow(this.$.app, this.$.rt, this, before || (
            current ? current.$.next : null
        ));

        node.$init({});
        this.$.app.$run.callCallback(() => {
            this.$.cb(node, item.$);
            node.$ready();
        });

        this.$.nodes.set(id, node);
    };

    /**
     * Destroy a old child
     * @param id {*} id of children pack
     * @param item {IValue<*>} value of children pack
     */
    destroyChild (id : any, item : IValue<any>) {
        let child = this.$.nodes.get(id);

        if (child) {
            let $ = child.$;

            if ($.prev) {
                $.prev.$.next = $.next;
            }
            if ($.next) {
                $.next.$.prev = $.prev;
            }
            child.$destroy();
            this.$.nodes.delete(id);
            this.$children.splice(this.$children.indexOf(child), 1);
        }
    };
}

class RepeaterPrivate extends RepeatNodePrivate {
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
    count : IValue<number> = new Reference(0);

}

/**
 * The simplest repeat node interpretation, repeat children pack a several times
 */
export class Repeater extends RepeatNode {
    $ : any = new RepeaterPrivate();

    /**
     * Changes the children count
     * @param number {number} The new children count
     */
    changeCount (number : number) {
        let $ = this.$;

        if (number > $.currentCount) {
            for (let i = $.currentCount; i < number; i++) {
                let item = new Reference(i);
                this.createChild(i, item);
                $.orderNumber.push(item);
            }
        }
        else {
            for (let i = $.currentCount - 1; i >= number; i--) {
                this.destroyChild(i, $.orderNumber[i]);
            }
            $.orderNumber.splice(number);
        }
        $.currentCount = number;
    }



    /**
     * Handles created event
     */
    $created () {
        let $ = this.$;

        super.$created();

        $.updateHandler = (value : number) => {
            this.changeCount(value);
        };
        $.count.on($.updateHandler);
    }

    /**
     * Handles ready event
     */
    $ready () {
        this.changeCount(this.$.count.$);
    }

    /**
     * Handles destroy event
     */
    $destroy () {
        super.$destroy();
        this.$.count.off(this.$.updateHandler);
    }
}

class BaseViewPrivate extends RepeatNodePrivate {
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
}

/**
 * Base class of default views
 */
export class BaseView extends RepeatNode {
    $ : any = new BaseViewPrivate;

    /**
     * Sets up model and handlers
     */
    constructor () {
        super();
        let $ = this.$;

        $.model = new Reference();

        $.addHandler = (id : *, item : IValue<any>) => {
            this.createChild(id, item);
        };
        $.removeHandler = (id : *, item : IValue<any>) => {
            this.destroyChild(id, item);
        };
    }

    /**
     * Creates a child when user adds new values
     * @param id {*} id of children pack
     * @param item {IValue<*>} Reference of children pack
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
        let $ = this.$;

        $.model.$.listener.onAdd($.addHandler);
        $.model.$.listener.onRemove($.removeHandler);
        super.$ready();
    }

    /**
     * Handles destroy event
     */
    $destroy () {
        let $ = this.$;

        $.model.$.listener.offAdd($.addHandler);
        $.model.$.listener.offRemove($.removeHandler);
        super.$destroy();
    }
}

class ArrayViewPrivate extends BaseViewPrivate {
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
}

/**
 * Represents a view of a array model
 */
export class ArrayView extends BaseView {
    $ : any = new ArrayViewPrivate;

    /**
     * Sets up model with a default value
     */
    constructor () {
        super();

        this.$.model.$ = new ArrayModel();
    }



    /**
     * Overrides child created and generate random id for children
     */
    createChild (id : *, item : IValue<*>, before : ?VasilleNode) {
        let $ = this.$;
        let next = typeof id === "number" ? $.nodes.get($.buffer[id]) : null;
        let handler = super.createChild(item, item, before || next);

        $.handlers.set(item, handler);
        $.buffer.splice(id, 0, item);
    }

    /**
     * Removes a children pack
     */
    destroyChild (id : *, item : IValue<any>) {
        let $ = this.$;
        let index = typeof id === "number" ? id : $.buffer.indexOf(item);

        if (index === -1) {
            return;
        }

        item.off($.handlers.get(item));
        $.handlers.delete(item);
        super.destroyChild(item, item);
        $.buffer.splice(index, 1);
    }



    /**
     * Handle ready event
     */
    $ready () {
        let $ = this.$;
        let arr = $.model.$;

        for (let i = 0; i < arr.length; i++) {
            $.app.$run.callCallback(() => {
                this.createChild(i, arr[i]);
            });
        }

        super.$ready();
    }

    /**
     * Handle destroy event
     */
    $destroy () {
        for (let it of this.$.handlers) {
            it[0].off(it[1]);
        }

        super.$destroy();
    }
}

class ObjectViewPrivate extends BaseViewPrivate {
    /**
     * Handler of property changes
     * @type {Object<string, function>}
     */
    handlers : { [key : string] : Function } = {};
}

/**
 * Create a children pack for each object field
 */
export class ObjectView extends BaseView {
    $ : any = new ObjectViewPrivate;

    /**
     * Sets up model
     */
    constructor () {
        super();
        this.$.model.$ = new ObjectModel;
    }



    /**
     * Saves the child handler
     */
    createChild (id : string, item : IValue<*>, before : ?VasilleNode) {
        this.$.handlers[id] = super.createChild(id, item, before);
    }

    /**
     * Disconnects the child handler
     */
    destroyChild (id : string, item : IValue<*>) {
        item.off(this.$.handlers[id]);
        delete this.$.handlers[id];
        super.destroyChild(id, item);
    }



    /**
     * Handler ready event
     */
    $ready () {
        let $ = this.$;
        let obj = $.model.$;

        for (let i in obj) {
            if (obj.hasOwnProperty(i) && obj.get(i) instanceof IValue) {
                $.app.$run.callCallback(() => {
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
        let $ = this.$;
        let obj = $.model.$;

        for (let i in obj) {
            if (obj.hasOwnProperty(i)) {
                obj.get(i).off($.handlers[i]);
            }
        }

        super.$destroy();
    }
}

class MapViewPrivate extends BaseViewPrivate {
    /**
     * Contains update handler for each value
     * @type {Map<*, Function>}
     */
    handlers : Map<*, Function> = new Map();
}

/**
 * Create a children pack for each map value
 */
export class MapView extends BaseView {
    $ : any = new MapViewPrivate;

    /**
     * Sets up model
     */
    constructor () {
        super();
        this.$.model.$ = new MapModel;
    }



    /**
     * Saves the child handler
     */
    createChild (id : *, item : IValue<*>, before : ?VasilleNode) {
        this.$.handlers.set(id, super.createChild(id, item, before));
    }

    /**
     * Disconnects the child handler
     */
    destroyChild (id : *, item : IValue<*>) {
        item.off(this.$.handlers.get(id));
        this.$.handlers.delete(id);
        super.destroyChild(id, item);
    }



    /**
     * Handler ready event
     */
    $ready () {
        let $ = this.$;
        let map = $.model.$;

        for (let it of map) {
            $.app.$run.callCallback(() => {
                this.createChild(it[0], it[1]);
            });
        }

        super.$ready();
    }

    /**
     * Handler destroy event
     */
    $destroy () {
        let $ = this.$;
        let map = $.model.$;

        for (let it of map) {
            it[1].off($.handlers.get(it[0]));
        }

        super.$destroy();
    }
}

class SetViewPrivate extends BaseViewPrivate {
    /**
     * Contains update handler for each value
     * @type {Map<IValue<*>, Function>}
     */
    handlers : Map<IValue<*>, Function> = new Map();
}

/**
 * Create a children pack for each set value
 */
export class SetView extends BaseView {
    $ : any = new SetViewPrivate;

    /**
     * Sets up model
     */
    constructor () {
        super();
        this.$.model.$ = new SetModel;
    }



    /**
     * Saves the child handler
     */
    createChild (id : *, item : IValue<*>, before : ?VasilleNode) {
        this.$.handlers.set(item, super.createChild(id, item, before));
    }

    /**
     * Disconnects the child handler
     */
    destroyChild (id : *, item : IValue<*>) {
        item.off(this.$.handlers.get(item));
        this.$.handlers.delete(item);
        super.destroyChild(id, item);
    }



    /**
     * Handler ready event
     */
    $ready () {
        let set = this.$.model.$;

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
        let set = this.$.model.$;

        for (let it of set) {
            it.off(this.$.handlers.get(it));
        }

        super.$destroy();
    }
}
