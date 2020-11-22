// @flow
import { IValue }                                      from "./interfaces/ivalue";
import { ArrayModel, MapModel, ObjectModel, SetModel } from "./models";
import { VasilleNode }                                 from "./node";
import { AppNode, BaseNode, ShadowNode } from "./node.js";
import { Value }                         from "./value";



export class RepeatNodeItem extends ShadowNode {
    $id : any;

    constructor (id : any) {
        super ();
        this.$id = id;
    }

    destroy () {
        super.destroy ();

        for (let child of this.children) {
            if (child.el !== this.el) {
                this.el.removeChild ( child.el );
            }
        }
    }
}

export class RepeatNode extends ShadowNode {
    nodes : Map<any, ShadowNode> = new Map ();
    cb : ( node : RepeatNodeItem, v : ?any ) => void;

    constructor () {
        super ();
    };

    preinitShadow ( app : AppNode, rt : BaseNode, ts : BaseNode, before : ?VasilleNode ) {
        super.preinitShadow ( app, rt, ts, before );
        this.encapsulate(ts.el);
    }

    setCallback(cb : ( node : RepeatNodeItem, v : ?any ) => void) {
        this.cb = cb;
    }

    createChild ( id : any, item : IValue<any>, before : ?VasilleNode ) {
        let current = this.nodes.get ( id );
        let node = new RepeatNodeItem ( id );

        this.destroyChild ( id, item );

        node.parent = this;
        if (current) {
            node.next = current.next;
            node.prev = current.prev;
            if (node.next) {
                node.next.prev = node;
            }
            if (node.prev) {
                node.prev.next = node;
            }
        }
        else if (before) {
            node.next = before;
            node.prev = before.prev;
            before.prev = node;
            if (node.prev) {
                node.prev.next = node;
            }
        }
        else {
            if (this.lastChild) {
                this.lastChild.next = node;
            }
            node.prev = this.lastChild;
            this.lastChild = node;
        }

        node.preinitShadow ( this.$app, this.rt, this, before || ( current ? current.next : null ) );

        node.init ( {} );
        this.cb(node, item.get());
        node.ready();

        this.nodes.set(id, node);
    };

    destroyChild ( id : any, item : IValue<any> ) {
        let child = this.nodes.get ( id );

        if (this.lastChild && this.lastChild === child) {
            this.lastChild = this.lastChild.prev;
        }

        if (child) {
            if (child.prev) {
                child.prev.next = child.next;
            }
            if (child.next) {
                child.next.prev = child.prev;
            }
            child.destroy ();
            this.nodes.delete ( id );
        }
    };

    destroy () {
        for (let it of this.nodes) {
            it[1].destroy();
        }

        super.destroy ();
    }
}

export class Repeater extends RepeatNode {
    updateHandler : Function;
    currentCount : number = 0;
    orderNumber : Array<IValue<number>> = [];

    constructor () {
        super ();
    }

    get props () : {
        count : IValue<any>
    } {
        return this.$props;
    }

    changeCount ( number : number ) {
        if (number > this.currentCount) {
            for (let i = this.currentCount; i < number; i++) {
                let item = new Value ( i );
                this.createChild ( i, item );
                this.orderNumber.push ( item );
            }
        }
        else {
            for (let i = this.currentCount - 1; i >= number; i--) {
                this.destroyChild ( i, this.orderNumber[i] );
            }
            this.orderNumber.splice(number);
        }
        this.currentCount = number;
    }

    createProps () {
        super.createProps ();
        this.defProp ( "count", Number, 0 );
    }



    created () {
        super.created ();

        this.updateHandler = ( value : number ) => {
            this.changeCount ( value );
        };
        this.props.count.on ( this.updateHandler );
    }

    ready () {
        this.changeCount ( this.props.count.get () );
    }

    destroy () {
        super.destroy ();
        this.props.count.off ( this.updateHandler );
    }
}

export class BaseView extends RepeatNode {
    addHandler : Function;
    removeHandler : Function;

    constructor () {
        super ();

        this.addHandler = ( id : *, item : IValue<any> ) => {
            this.createChild(id, item);
        }
        this.removeHandler = ( id : *, item : IValue<any> ) => {
            this.destroyChild(id, item);
        }
    }

    get props () : {
        model : IValue<any>
    } {
        return this.$props;
    }

    createProps () {
        super.createProps ();
        this.defProp ( "model", IValue, null );
    }

    createChild ( id : *, item : IValue<*>, before : ?VasilleNode ) : Function {
        let handler = () => {
            this.createChild ( id, item );
        };
        item.on ( handler );
        super.createChild ( id, item, before );

        return handler;
    }



    ready () {
        this.props.model.get().listener.onAdd ( this.addHandler );
        this.props.model.get().listener.onRemove ( this.removeHandler );
        super.ready ();
    }

    destroy () {
        this.props.model.get().listener.offAdd ( this.addHandler );
        this.props.model.get().listener.offRemove ( this.removeHandler );
        super.destroy ();
    }
}

export class ArrayView extends BaseView {
    handlers : Array<Function> = [];
    ids : Array<string> = [];

    get props () : {
        model : IValue<ArrayModel<IValue<*>>>
    } {
        return this.$props;
    }

    createProps () {
        this.defProp("model", ArrayModel);
    }



    createChild ( id : *, item : IValue<*>, before : ?VasilleNode ) {
        let newId, indexStep;

        if (typeof id === "string") {
            indexStep = 1;
            newId = id;
            id = this.ids.indexOf(id);
        }
        else {
            indexStep = 0;
            do {
                newId = Math.random ().toString(16).substr(2);
            }
            while (this.ids.includes ( newId ));
        }

        let handler = super.createChild ( newId, item, before || this.nodes.get(this.ids[id + indexStep]) );
        this.handlers.splice ( id, 0, handler );
        this.ids.splice( id, 0, newId );
    }

    destroyChild ( id : *, item : IValue<any> ) {
        let index = typeof id === "string" ? this.ids.indexOf(id) : id;

        if (index === -1) return;

        item.off ( this.handlers[index] );
        this.handlers.splice ( index, 1 );
        super.destroyChild(this.ids[index], item);
        this.ids.splice ( index, 1 );
    }



    created () {
        super.created ();

        if (!this.props.model.get()) {
            this.props.model.set(new ArrayModel<IValue<*>>());
        }
    }

    ready () {
        let arr = this.props.model.get ();
        for (let i = 0; i < arr.length; i++) {
            this.createChild ( i, arr[i] );
        }

        super.ready ();
    }

    destroy () {
        let arr = this.props.model.get ();
        for (let i = 0; i < arr.length; i++) {
            arr[i].off ( this.handlers[i] );
        }

        super.destroy ();
    }
}

export class ObjectView extends BaseView {
    handlers : { [key: string] : Function } = {};

    get props () : {
        model : IValue<ObjectModel<IValue<*>>>
    } {
        return this.$props;
    }

    createProps () {
        this.defProp("model", ObjectModel);
    }



    createChild ( id : string, item : IValue<*>, before : ?VasilleNode ) {
        this.handlers[id] = super.createChild ( id, item, before );
    }

    destroyChild ( id : string, item : IValue<*> ) {
        item.off(this.handlers[id]);
        delete this.handlers[id];
        super.destroyChild ( id, item );
    }



    created () {
        super.created ();

        if (!this.props.model.get()) {
            this.props.model.set(new ObjectModel<IValue<*>>());
        }
    }

    ready () {
        let obj = this.props.model.get();
        
        for (let i in obj) {
            if (obj.get(i) instanceof IValue) {
                this.createChild(i, obj.get(i));
            }
        }

        super.ready();
    }

    destroy () {
        let obj = this.props.model.get();

        for (let i in obj) {
            obj.get(i).off(this.handlers[i]);
        }

        super.destroy ();
    }
}

export class MapView extends BaseView {
    handlers : Map<*, Function> = new Map();

    get props () : {
        model : IValue<MapModel<*, IValue<*>>>
    } {
        return this.$props;
    }

    createProps () {
        this.defProp("model", MapModel);
    }



    createChild ( id : *, item : IValue<*>, before : ?VasilleNode ) {
        this.handlers.set(id, super.createChild ( id, item, before ));
    }

    destroyChild ( id : *, item : IValue<*> ) {
        item.off(this.handlers.get(id));
        this.handlers.delete(id);
        super.destroyChild ( id, item );
    }



    created () {
        super.created ();

        if (!this.props.model.get()) {
            this.props.model.set(new MapModel<*, IValue<*>>());
        }
    }

    ready () {
        let map = this.props.model.get();

        for (let it of map) {
            this.createChild(it[0], it[1]);
        }

        super.ready ();
    }

    destroy () {
        let map = this.props.model.get();

        for (let it of map) {
            it[1].off(this.handlers.get(it[0]));
        }

        super.destroy ();
    }
}

export class SetView extends BaseView {
    handlers : Map<IValue<*>, Function> = new Map();

    get props () : {
        model : IValue<Set<IValue<*>>>
    } {
        return this.$props;
    }

    createProps () {
        this.defProp("model", SetModel);
    }



    createChild ( id : *, item : IValue<*>, before : ?VasilleNode ) {
        this.handlers.set(item, super.createChild ( id, item, before ));
    }

    destroyChild ( id : *, item : IValue<*> ) {
        item.off(this.handlers.get(item));
        this.handlers.delete(item);
        super.destroyChild ( id, item );
    }



    created () {
        super.created ();

        if (!this.props.model.get()) {
            this.props.model.set(new SetModel<IValue<*>>());
        }
    }

    ready () {
        let set = this.props.model.get();

        for (let it of set) {
            this.createChild(it, it);
        }

        super.ready ();
    }

    destroy () {
        let set = this.props.model.get();

        for (let it of set) {
            it.off(this.handlers.get(it));
        }

        super.destroy ();
    }
}
