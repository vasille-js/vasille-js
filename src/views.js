// @flow
import { IValue }                        from "./interfaces/ivalue";
import { ArrayModel }                    from "./models";
import { Node }                          from "./node";
import { AppNode, BaseNode, ShadowNode } from "./node.js";
import { Value }                         from "./value";



export class RepeatNodeItem extends ShadowNode {
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

    preinitShadow ( app : AppNode, rt : BaseNode, ts : BaseNode, before : ?Node ) {
        super.preinitShadow ( app, rt, ts, before );
        this.encapsulate(ts.el);
    }

    setCallback(cb : ( node : RepeatNodeItem, v : ?any ) => void) {
        this.cb = cb;
    }

    createChild ( id : any, item : IValue<any> ) {
        let current = this.nodes.get ( id );
        let node = new RepeatNodeItem ();

        this.destroyChild ( id );

        node.preinitShadow ( this.$app, this.rt, this, current ? current.prev : null );

        node.init ( {} );
        this.cb(node, item.get());
        node.ready();

        this.nodes.set(id, node);
    };

    destroyChild ( id : any ) {
        let child = this.nodes.get ( id );

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
}

export class Repeater extends RepeatNode {
    updateHandler : Function;
    currentCount : number = 0;

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
                this.createChild ( i, new Value ( i ) );
            }
        }
        else {
            for (let i = this.currentCount - 1; i >= number; i--) {
                this.destroyChild ( i );
            }
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

    get props () : {
        model : IValue<any>
    } {
        return this.$props;
    }

    createProps () {
        super.createProps ();
        this.defProp ( "model", IValue, null );
    }

    createBVChild ( id : *, item : IValue<*> ) : Function {
        let handler = ( newItem ) => {
            super.createChild ( id, newItem );
        };
        item.on ( handler );
        super.createChild ( id, item );

        return handler;
    }



    ready () {
        this.props.model.on ( this.addHandler );
        this.props.model.on ( this.removeHandler );
        super.ready ();
    }

    destroy () {
        this.props.model.off ( this.addHandler );
        this.props.model.off ( this.removeHandler );
        super.destroy ();
    }
}

export class ArrayView extends BaseView {
    handlers : Array<Function> = [];

    destroyAVChild ( id : *, item : IValue<any> ) {
        item.off ( this.handlers[id] );
        this.handlers.splice ( id, 1 );
        super.destroyChild ( id );
    }

    get props () : {
        model : IValue<ArrayModel<IValue<*>>>
    } {
        return this.$props;
    }

    createChild ( id : *, item : IValue<*> ) {
        let handler = this.createBVChild ( id, item );
        this.handlers.splice ( id, 0, handler );
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

export class ObjectView extends RepeatNode {

}

export class MapView extends RepeatNode {

}

export class SetView extends RepeatNode {

}
