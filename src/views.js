// @flow
import { VasilleNode }                                            from "./interfaces/core";
import { IValue }                                                 from "./interfaces/ivalue.js";
import { ArrayModel, MapModel, ObjectModel, SetModel }            from "./models.js";
import { App, INode, BaseNodePrivate, Extension, RepeatNodeItem } from "./node.js";
import { Reference }                                              from "./value.js";



export class RepeatNodePrivate extends BaseNodePrivate {
    /**
     * Children node hash
     * @type {Map<*, Extension>}
     */
    nodes : Map<any, Extension> = new Map();

    /**
     * Call-back function to create a children pack
     * @type {function(RepeatNodeItem, ?*) : void}
     */
    cb : (node : RepeatNodeItem, v : ?any) => void;

    constructor () {
        super ();
        this.seal();
    }
}

/**
 * Repeat node repeats its children
 */
export class RepeatNode extends Extension {

    constructor ($ : ?RepeatNodePrivate) {
        super($ || new RepeatNodePrivate);
    }

    /**
     * Sets call-back function
     * @param cb {function(RepeatNodeItem, ?*) : void}
     */
    setCallback (cb : (node : RepeatNodeItem, v : ?any) => void) {
        (this.$ : RepeatNodePrivate).cb = cb;
    }

    /**
     * Initialize the shadow node
     * @param app {App} App node
     * @param rt {INode} Root node
     * @param ts {INode} This node
     * @param before {VasilleNode} Node to paste content before it
     */
    $$preinitShadow (app : App, rt : INode, ts : INode, before : ?VasilleNode) {
        let $ : RepeatNodePrivate = this.$;

        super.$$preinitShadow(app, rt, ts, before);
        $.encapsulate($.el);
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
        let $ : RepeatNodePrivate = node.$;

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

        node.$init();
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
            let $ : BaseNodePrivate = child.$;

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

/**
 * Private part of repeater
 */
export class RepeaterPrivate extends RepeatNodePrivate {
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

    constructor () {
        super ();
        this.seal();
    }
}

/**
 * The simplest repeat $node interpretation, repeat children pack a several times
 */
export class Repeater extends RepeatNode {

    /**
     * The count of children
     * @type {IValue<number>}
     */
    count : IValue<number> = new Reference(0);

    constructor ($ : ?RepeaterPrivate) {
        super($ || new RepeaterPrivate);
        this.seal();
    }

    /**
     * Changes the children count
     * @param number {number} The new children count
     */
    changeCount (number : number) {
        let $ : RepeaterPrivate = this.$;

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
        let $ : RepeaterPrivate = this.$;

        super.$created();

        $.updateHandler = (value : number) => {
            this.changeCount(value);
        };
        this.count.on($.updateHandler);
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
        let $ : RepeaterPrivate = this.$;

        super.$destroy();
        this.count.off($.updateHandler);
    }
}

/**
 * Private part of BaseView
 */
export class BaseViewPrivate extends RepeatNodePrivate {
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

    constructor () {
        super ();
        this.seal();
    }
}

/**
 * Base class of default views
 */
export class BaseView extends RepeatNode {

    // props
    /**
     * Property which will contain a model
     * @type {IValue<*>}
     */
    model : IValue<any>;

    /**
     * Sets up model and handlers
     */
    constructor ($1 : ?BaseViewPrivate) {
        super($1 || new BaseViewPrivate);

        let $ : BaseViewPrivate = this.$;
        $.addHandler = (id : *, item : IValue<any>) => {
            this.createChild(id, item);
        };
        $.removeHandler = (id : *, item : IValue<any>) => {
            this.destroyChild(id, item);
        };

        this.seal();
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
        let $ : BaseViewPrivate = this.$;

        this.model.$.listener.onAdd($.addHandler);
        this.model.$.listener.onRemove($.removeHandler);
        super.$ready();
    }

    /**
     * Handles destroy event
     */
    $destroy () {
        let $ : BaseViewPrivate = this.$;

        this.model.$.listener.offAdd($.addHandler);
        this.model.$.listener.offRemove($.removeHandler);
        super.$destroy();
    }
}

/**
 * Private part of array view
 */
export class ArrayViewPrivate extends BaseViewPrivate {
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

    constructor () {
        super ();
        this.seal();
    }
}

/**
 * Represents a view of a array model
 */
export class ArrayView extends BaseView {

    /**
     * model of view
     * @type {IValue<ArrayModel<*>>}
     */
    model : IValue<ArrayModel<*>>;

    /**
     * Sets up model with a default value
     */
    constructor ($ : ?ArrayViewPrivate) {
        super($ || new ArrayViewPrivate);

        this.model = this.$prop(ArrayModel);
        this.seal();
    }



    /**
     * Overrides child created and generate random id for children
     */
    createChild (id : *, item : IValue<*>, before : ?VasilleNode) {
        let $ : ArrayViewPrivate = this.$;
        let next = typeof id === "number" ? $.nodes.get($.buffer[id]) : null;
        let handler = super.createChild(item, item, before || next);

        $.handlers.set(item, handler);
        $.buffer.splice(id, 0, item);
    }

    /**
     * Removes a children pack
     */
    destroyChild (id : *, item : IValue<any>) {
        let $ : ArrayViewPrivate = this.$;
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
        let $ : ArrayViewPrivate = this.$;
        let arr : ArrayModel<*> = this.model.$;

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
        for (let it of (this.$ : ArrayViewPrivate).handlers) {
            it[0].off(it[1]);
        }

        super.$destroy();
    }
}

/**
 * private part of object view
 */
class ObjectViewPrivate extends BaseViewPrivate {
    /**
     * Handler of property changes
     * @type {Object<string, function>}
     */
    handlers : { [key : string] : Function } = {};

    constructor () {
        super ();
        this.seal();
    }
}

/**
 * Create a children pack for each object field
 */
export class ObjectView extends BaseView {
    /**
     * Sets up model
     */
    constructor ($ : ?ObjectViewPrivate) {
        super($ || new ObjectViewPrivate);
        this.model = this.$prop(ObjectModel);
    }



    /**
     * Saves the child handler
     */
    createChild (id : string, item : IValue<*>, before : ?VasilleNode) {
        (this.$ : ObjectViewPrivate).handlers[id] = super.createChild(id, item, before);
    }

    /**
     * Disconnects the child handler
     */
    destroyChild (id : string, item : IValue<*>) {
        let $ : ObjectViewPrivate = this.$;

        item.off($.handlers[id]);
        delete $.handlers[id];
        super.destroyChild(id, item);
    }



    /**
     * Handler ready event
     */
    $ready () {
        let $ : ObjectViewPrivate = this.$;
        let obj : ObjectModel<*> = this.model.$;

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
        let $ : ObjectViewPrivate = this.$;
        let obj : ObjectModel<*> = this.model.$;

        for (let i in obj) {
            if (obj.hasOwnProperty(i)) {
                obj.get(i).off($.handlers[i]);
            }
        }

        super.$destroy();
    }
}

/**
 * private part of map view
 */
class MapViewPrivate extends BaseViewPrivate {
    /**
     * Contains update handler for each value
     * @type {Map<*, Function>}
     */
    handlers : Map<*, Function> = new Map();

    constructor () {
        super ();
        this.seal();
    }
}

/**
 * Create a children pack for each map value
 */
export class MapView extends BaseView {

    /**
     * Sets up model
     */
    constructor ($ : ?MapViewPrivate) {
        super($ || new MapViewPrivate);
        this.model = this.$prop(MapModel);
    }



    /**
     * Saves the child handler
     */
    createChild (id : *, item : IValue<*>, before : ?VasilleNode) {
        (this.$ : MapViewPrivate).handlers.set(id, super.createChild(id, item, before));
    }

    /**
     * Disconnects the child handler
     */
    destroyChild (id : *, item : IValue<*>) {
        let $ : MapViewPrivate = this.$;

        item.off($.handlers.get(id));
        $.handlers.delete(id);
        super.destroyChild(id, item);
    }



    /**
     * Handler ready event
     */
    $ready () {
        let $ : MapViewPrivate = this.$;
        let map : MapModel<*, *> = this.model.$;

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
        let $ : MapViewPrivate = this.$;
        let map : MapModel<*, *> = this.model.$;

        for (let it of map) {
            it[1].off($.handlers.get(it[0]));
        }

        super.$destroy();
    }
}

/**
 * private part of set view
 */
class SetViewPrivate extends BaseViewPrivate {
    /**
     * Contains update handler for each value
     * @type {Map<IValue<*>, Function>}
     */
    handlers : Map<IValue<*>, Function> = new Map();

    constructor () {
        super ();
        this.seal();
    }
}

/**
 * Create a children pack for each set value
 */
export class SetView extends BaseView {

    /**
     * Sets up model
     */
    constructor ($ : ?SetViewPrivate) {
        super($ || new SetViewPrivate);
        this.model = this.$prop(SetModel);
    }



    /**
     * Saves the child handler
     */
    createChild (id : *, item : IValue<*>, before : ?VasilleNode) {
        (this.$ : SetViewPrivate).handlers.set(item, super.createChild(id, item, before));
    }

    /**
     * Disconnects the child handler
     */
    destroyChild (id : *, item : IValue<*>) {
        let $ : SetViewPrivate = this.$;

        item.off($.handlers.get(item));
        $.handlers.delete(item);
        super.destroyChild(id, item);
    }



    /**
     * Handler ready event
     */
    $ready () {
        let $ : SetViewPrivate = this.$;
        let set : SetModel<*> = this.model.$;

        for (let it of set) {
            $.app.$run.callCallback(() => {
                this.createChild(it, it);
            });
        }

        super.$ready();
    }

    /**
     * Handler destroy event
     */
    $destroy () {
        let $ : SetViewPrivate = this.$;
        let set : SetModel<*> = this.model.$;

        for (let it of set) {
            it.off($.handlers.get(it));
        }

        super.$destroy();
    }
}
