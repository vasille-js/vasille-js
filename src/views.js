import { Callable }                                             from "./interfaces/idefinition";
import { IValue }                                               from "./interfaces/ivalue";
import { AppNode, BaseNode, ElementNode, ShadowNode, TextNode } from "./node.js";



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

    constructor (
        app : AppNode,
        rt : ?BaseNode,
        ts : ?BaseNode,
        cName : string
    ) {
        super ( app, rt, ts, cName );
    };

    runCommands ( node : RepeatNodeItem, item : IValue ) {
        let run = {};
        run[Command.defAttr] = ( args : Array<any> ) => {
            node.defAttr ( ...args );
        };
        run[Command.defAttrs] = ( args : Array<any> ) => {
            node.defAttrs ( ...args );
        };
        run[Command.bindAttr] = ( args : Array<any> ) => {
            node.bindAttr ( ...args, item );
        };
        run[Command.defStyle] = ( args : Array<any> ) => {
            node.defStyle ( ...args );
        };
        run[Command.defStyles] = ( args : Array<any> ) => {
            node.defStyles ( ...args );
        };
        run[Command.bindStyle] = ( args : Array<any> ) => {
            node.bindStyle ( ...args, item );
        };
        run[Command.defEvent] = ( args : Array<any> ) => {
            node.defEvent ( ...args );
        };
        run[Command.defText] = ( args : Array<any> ) => {
            node.defText ( ...args );
        };
        run[Command.defElement] = ( args : Array<any> ) => {
            node.defElement ( ...args );
        };
        run[Command.defTag] = ( args : Array<any> ) => {
            node.defTag ( ...args );
        };

        for (let command of this.commands) {
            run[command.command] ( command.args );
        }
    };

    createChild ( id : any, item : IValue ) {
        let current = this.nodes.get ( id );
        let node = new RepeatNodeItem ();

        this.destroyChild ( id );

        node.$propsDefs = this.$propsDefs;
        node.preinitShadow ( this.$app, this.rt, this, current ? current.prev : null );
        this.runCommands ( node, item );

        let props = {};

        for (let i in this.props) {
            if (this.props[i] instanceof Callable) {
                props[i] = this.props[i].func ( item.get () );
            }
            else {
                props[i] = this.props[i];
            }
        }

        node.init ( props );
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

    defAttrs ( obj : { [p : string] : string | IValue } ) : BaseNode {
        this.commands.push ( Command.defAttrs, arguments );
    };



    bindAttr ( name : string, calculator : Function, ...values : Array<IValue> ) : BaseNode {
        this.commands.push ( Command.bindAttr, arguments );
    }

    defStyle ( name : string, value : string | IValue | Callable ) : BaseNode {
        this.commands.push ( Command.defStyle, arguments );
    };

    defStyles ( obj : { [p : string] : string | IValue } ) : BaseNode {
        this.commands.push ( Command.defStyles, arguments );
    };

    bindStyle ( name : string, calculator : Function, ...values : Array<IValue> ) : BaseNode {
        this.commands.push ( Command.bindStyle, arguments );
    };

    defEvent ( name : string, event : Function ) : BaseNode {
        this.commands.push ( Command.defEvent, arguments );
    };

    defText ( text : string | IValue, cbOrSlot : string | TextNodeCB, cb2 : TextNodeCB ) : BaseNode {
        this.commands.push ( Command.defText, arguments );
    };

    defElement<T> ( func : T, props : Object, cbOrSlot : string | ElementNodeCB, cb2 : ElementNodeCB ) : BaseNode {
        this.commands.push ( Command.defElement, arguments );
    };

    defTag ( tagName : string, cbOrSlot : string | ElementNodeCB, cb2 : ElementNodeCB ) : BaseNode {
        this.commands.push ( Command.defTag, arguments );
    };



}

export class Repeater extends ShadowNode {

}

export class ArrayView extends ShadowNode {

}

export class ObjectView extends ShadowNode {

}

export class MapView extends ShadowNode {

}

export class SetView extends ShadowNode {

}
