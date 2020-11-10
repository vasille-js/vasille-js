import {AppNode, BaseNode, ElementNode, ShadowNode, TextNode} from "./node.js";
import {IValue} from "./interfaces/ivalue";
import {Callable} from "./interfaces/idefinition";



type TextNodeCB = ?(text: TextNode) => void;
type ElementNodeCB = ?(text: ElementNode) => void;

const Command = {
    defAttr: 1,
    defAttrs: 2,
    bindAttr: 3,
    defStyle: 4,
    defStyles: 5,
    bindStyle: 6,
    defEvent: 7,
    defText: 8,
    defElement: 9,
    defTag: 10
}

type CommandList = Array<{| command: number, args: Array<any> |}>;

export class RepeatNode extends ShadowNode {
    commands : CommandList = [];
    nodes    : Map<any, ShadowNode> = new Map();

    constructor(
        app: AppNode,
        rt: ?BaseNode,
        ts: ?BaseNode,
        cName: string
    ) {
        super(app, rt, ts, cName);
    }

    defAttr(name: string, value: string | IValue | Callable): BaseNode {
        this.commands.push(Command.defAttr, arguments);
    }

    defAttrs(obj: { [p: string]: string | IValue }): BaseNode {
        this.commands.push(Command.defAttrs, arguments);
    }

    bindAttr(name: string, calculator: Function, ...values): BaseNode {
        this.commands.push(Command.bindAttr, arguments);
    }

    defStyle(name: string, value: string | IValue | Callable): BaseNode {
        this.commands.push(Command.defStyle, arguments);
    }

    defStyles(obj: { [p: string]: string | IValue }): BaseNode {
        this.commands.push(Command.defStyles, arguments);
    }

    bindStyle(name: string, calculator: Function, ...values): BaseNode {
        this.commands.push(Command.bindStyle, arguments);
    }

    defEvent(name: string, event: Function): BaseNode {
        this.commands.push(Command.defEvent, arguments);
    }

    defText(text: string | IValue, cbOrSlot: string | TextNodeCB, cb2: TextNodeCB): BaseNode {
        this.commands.push(Command.defText, arguments);
    }

    defElement<T>(func: T, props: Object, cbOrSlot: string | ElementNodeCB, cb2: ElementNodeCB): BaseNode {
        this.commands.push(Command.defElement, arguments);
    }

    defTag(tagName: string, cbOrSlot: string | ElementNodeCB, cb2: ElementNodeCB): BaseNode {
        this.commands.push(Command.defTag, arguments);
    }

    createChild (id: any, item: any) {
        let current = this.nodes.get(id);

        if (current) current.destroy();
    }
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
