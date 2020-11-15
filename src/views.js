// @flow
import { Callable }                                             from "./interfaces/idefinition";
import { IValue }                                               from "./interfaces/ivalue";
import { AppNode, BaseNode, ElementNode, ShadowNode, TextNode } from "./node.js";
import { Value }                                                from "./value";



type TextNodeCB = ?( text : TextNode ) => void;
type ElementNodeCB = ?( text : ElementNode ) => void;

const Command = {
    defAttr    : 1,
    defAttrs   : 2,
    bindAttr   : 3,
    defStyle   : 4,
    defStyles  : 5,
    bindStyle  : 6,
    defEvent   : 7,
    defText    : 8,
    defElement : 9,
    defTag     : 10
};

type CommandList = Array<{| command : number, args : Array<any> |}>;

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
    commands : CommandList = [];
    nodes : Map<any, ShadowNode> = new Map ();
    cb : ( node : RepeatNodeItem, v : ?any ) => void;

    constructor () {
        super ();
    };

    preinitShadow ( app : AppNode, rt : BaseNode, ts : BaseNode, before : Node ) {
        super.preinitShadow ( app, rt, ts, before );
        this.encapsulate(ts.el);
    }

    setCallback(cb : ( node : RepeatNodeItem, v : ?any ) => void) {
        this.cb = cb;
    }

    createChild ( id : any, item : IValue ) {
        let current = this.nodes.get ( id );
        let node = new RepeatNodeItem ();

        this.destroyChild ( id );

        node.preinitShadow ( this.$app, this.rt, this, current ? current.prev : null );

        node.init ( {} );
        this.cb(node, item.get());
        node.ready();

        this.nodes.set(id, node);
    };

    defAttr ( name : string, value : string | IValue | Callable ) : BaseNode {
        this.commands.push ( Command.defAttr, arguments );
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
        count : IValue
    } {
        return this.$props;
    }

    changeCount ( number ) {
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

export class ArrayView extends ShadowNode {

}

export class ObjectView extends ShadowNode {

}

export class MapView extends ShadowNode {

}

export class SetView extends ShadowNode {

}
